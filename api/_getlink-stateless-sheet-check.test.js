const test = require('node:test');
const assert = require('node:assert/strict');
const {
    SHEET_CHECK_SEGMENT_SIZE,
    createStatelessSheetCheckState,
    rollToNextSegment,
    advanceStatelessSheetCheck
} = require('./_getlink-stateless-sheet-check');

const TEST_URL = 'https://script.google.com/macros/s/test-deployment/exec';

test('Sheet Check completes a 4,000-row Sheet in one segment', async () => {
    const state = createStatelessSheetCheckState(TEST_URL);
    let pullLimit = 0;
    const advanced = await advanceStatelessSheetCheck(state, {
        listRows: async (options) => {
            pullLimit = options.limit;
            return { rows: [], nextStartRow: 4001, scannedUntilRow: 4000, hasMore: false };
        }
    });
    assert.equal(pullLimit, 100);
    assert.equal(advanced.result.status, 'completed');
    assert.equal(advanced.result.segmentNumber, 1);
    assert.equal(advanced.result.totalScannedRows, 4000);
});

test('Sheet Check rolls 12,000 rows through 5,000-row segments', async () => {
    let state = createStatelessSheetCheckState(TEST_URL);
    state.segmentScannedRows = SHEET_CHECK_SEGMENT_SIZE;
    state.totalScannedRows = SHEET_CHECK_SEGMENT_SIZE;
    state.nextStartRow = 5001;
    state.segmentHasMore = true;

    state = rollToNextSegment(state);
    assert.equal(state.segmentNumber, 2);
    assert.equal(state.segmentStartRow, 5001);
    assert.equal(state.seenFingerprints.length, 0);

    state.segmentScannedRows = SHEET_CHECK_SEGMENT_SIZE;
    state.totalScannedRows = 10000;
    state.nextStartRow = 10001;
    state.segmentHasMore = true;
    state.seenFingerprints = ['old-segment-hash'];
    state = rollToNextSegment(state);
    assert.equal(state.segmentNumber, 3);
    assert.equal(state.segmentStartRow, 10001);
    assert.equal(state.seenFingerprints.length, 0);

    const advanced = await advanceStatelessSheetCheck(state, {
        listRows: async () => ({ rows: [], nextStartRow: 12001, scannedUntilRow: 12000, hasMore: false })
    });
    assert.equal(advanced.result.status, 'completed');
    assert.equal(advanced.result.segmentNumber, 3);
    assert.equal(advanced.result.segmentScannedRows, 2000);
    assert.equal(advanced.result.totalScannedRows, 12000);
});

test('Sheet Check automatically advances after a full 5,000-row segment', async () => {
    const state = createStatelessSheetCheckState(TEST_URL);
    state.segmentScannedRows = SHEET_CHECK_SEGMENT_SIZE;
    state.totalScannedRows = SHEET_CHECK_SEGMENT_SIZE;
    state.nextStartRow = 5001;
    state.segmentHasMore = true;
    state.seenFingerprints = ['segment-one-hash'];
    const advanced = await advanceStatelessSheetCheck(state);
    assert.equal(advanced.result.status, 'pending');
    assert.equal(advanced.result.segmentNumber, 2);
    assert.equal(advanced.result.segmentStartRow, 5001);
    assert.equal(advanced.state.seenFingerprints.length, 0);
});

test('Sheet Check automatically consumes 12,000 physical rows until Sheet end', async () => {
    let state = createStatelessSheetCheckState(TEST_URL);
    const ends = [5000, 10000, 12000];
    for (let index = 0; index < ends.length; index += 1) {
        const end = ends[index];
        const advanced = await advanceStatelessSheetCheck(state, {
            listRows: async () => ({
                rows: [],
                nextStartRow: end + 1,
                scannedUntilRow: end,
                hasMore: index < ends.length - 1
            })
        });
        state = advanced.state;
        if (index < ends.length - 1) assert.equal(advanced.result.status, 'pending');
        else assert.equal(advanced.result.status, 'completed');
    }
    assert.equal(state.segmentNumber, 3);
    assert.equal(state.totalScannedRows, 12000);
});

test('Sheet Check does not double-count Apps Script scan overlap', async () => {
    const state = createStatelessSheetCheckState(TEST_URL);
    const rows = Array.from({ length: 100 }, (_, index) => ({
        rowNumber: index + 1,
        cookie: `cookie-${index + 1}`,
        mark: ''
    }));
    const advanced = await advanceStatelessSheetCheck(state, {
        listRows: async () => ({ rows, nextStartRow: 101, scannedUntilRow: 500, hasMore: true }),
        checkCookie: async () => ({ ok: true, reason: 'ok' }),
        writeRows: async () => {}
    });
    assert.equal(advanced.result.totalScannedRows, 100);
    assert.equal(advanced.result.checkedCount, 5);
});

test('Sheet Check synchronizes Max Streams only for PASS and preserves it for failures', async () => {
    const state = createStatelessSheetCheckState(TEST_URL);
    state.queuedRows = [
        { rowNumber: 1, cookie: 'pass-cookie', mark: '7' },
        { rowNumber: 2, cookie: 'fail-cookie', mark: '3' }
    ];
    state.segmentHasMore = false;
    const writes = [];
    const advanced = await advanceStatelessSheetCheck(state, {
        checkCookie: async (cookie) => cookie === 'pass-cookie'
            ? { ok: true, reason: 'ok', summary: { maxStreams: '4' } }
            : { ok: false, reason: 'payment_hold', summary: { maxStreams: '' } },
        writeRows: async (updates) => writes.push(...updates)
    });
    assert.deepEqual(writes, [
        { rowNumber: 1, maxStreams: '4' },
        { rowNumber: 2, mark: 'payment_hold' }
    ]);
    assert.equal(advanced.result.passCount, 1);
    assert.equal(advanced.result.failCount, 1);
    assert.equal(advanced.result.updatedCount, 1);
    assert.equal(advanced.result.maxStreamsUpdatedCount, 1);
});

test('Sheet Check does not write Max Streams for blank or duplicate cookies', async () => {
    const state = createStatelessSheetCheckState(TEST_URL);
    const writes = [];
    let checks = 0;
    const advanced = await advanceStatelessSheetCheck(state, {
        listRows: async () => ({
            rows: [
                { rowNumber: 1, cookie: '', mark: '' },
                { rowNumber: 2, cookie: 'same-cookie', mark: '' },
                { rowNumber: 3, cookie: 'same-cookie', mark: '' }
            ],
            nextStartRow: 4,
            scannedUntilRow: 3,
            hasMore: false
        }),
        checkCookie: async () => {
            checks += 1;
            return { ok: true, reason: 'ok', summary: { maxStreams: '2' } };
        },
        writeRows: async (updates) => writes.push(...updates)
    });
    assert.equal(advanced.result.status, 'completed');
    assert.equal(checks, 1);
    assert.deepEqual(writes, [{ rowNumber: 2, maxStreams: '2' }]);
    assert.equal(advanced.result.maxStreamsUpdatedCount, 1);
});
