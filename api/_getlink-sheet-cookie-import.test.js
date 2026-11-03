const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getSheetCheckUpdate,
    normalizeSheetUpdates,
    assertMaxStreamsUpdateSupport,
    createSheetImportState,
    normalizeSheetImportState,
    buildSheetImportResult
} = require('./_getlink-sheet-cookie-import');
const { shapeOperationPayload } = require('./_getlink-operation-store');

test('sheet check leaves PASS rows untouched', () => {
    assert.equal(getSheetCheckUpdate({ rowNumber: 12, mark: '7' }, { ok: true, reason: 'ok' }), null);
});

test('sheet check maps failures to the existing Sheet marks', () => {
    const cases = [
        ['sbd_blocked', 'sbd'],
        ['payment_hold', 'payment_hold'],
        ['unknown_plan', 'unknown_plan'],
        ['dead', 'dead'],
        ['invalid_cookie', 'invalid_cookie'],
        ['missing_account_info', 'missing_info'],
        ['anything_else', 'token_error']
    ];
    cases.forEach(([reason, mark]) => {
        assert.deepEqual(getSheetCheckUpdate({ rowNumber: 9, mark: '3' }, { ok: false, reason }), {
            rowNumber: 9,
            mark
        });
    });
});

test('Sheet update payload preserves independent mark and Max Streams fields', () => {
    assert.deepEqual(normalizeSheetUpdates([
        { rowNumber: 1, maxStreams: '4' },
        { rowNumber: 2, mark: 'dead', maxStreams: '' },
        { rowNumber: 3 },
        { rowNumber: 0, maxStreams: '2' }
    ]), [
        { rowNumber: 1, maxStreams: '4' },
        { rowNumber: 2, mark: 'dead', maxStreams: '' }
    ]);
});

test('Sheet update detects Apps Script deployments without Max Streams support', () => {
    assert.doesNotThrow(() => assertMaxStreamsUpdateSupport({ maxStreamsUpdatedCount: 2 }, 2));
    assert.throws(
        () => assertMaxStreamsUpdateSupport({ success: true }, 1),
        /deploy lai Web App/
    );
});

test('sheet check stays pending until the full Sheet scan finishes', () => {
    const state = createSheetImportState(['primary'], { checkOnly: true });
    state.passCount = 4;
    state.failCount = 2;
    state.updatedCount = 2;
    state.checkedCount = 6;

    const restored = normalizeSheetImportState(JSON.parse(JSON.stringify(state)), ['primary']);
    const pending = buildSheetImportResult(restored);
    assert.equal(pending.status, 'pending');
    assert.equal(pending.passCount, 4);
    assert.equal(pending.failCount, 2);
    assert.equal(pending.checkedCount, 6);

    restored.hasMore = false;
    restored.queuedRows = [];
    assert.equal(buildSheetImportResult(restored).status, 'completed');
});

test('sheet check operation exposes compact progress counters', () => {
    const state = createSheetImportState(['primary'], { checkOnly: true });
    state.passCount = 8;
    state.failCount = 3;
    state.updatedCount = 3;
    state.checkedCount = 11;
    const payload = shapeOperationPayload({
        id: 'test-op',
        token: 'test-token',
        type: 'sheet_check',
        status: 'pending',
        state
    });
    assert.equal(payload.passCount, 8);
    assert.equal(payload.failCount, 3);
    assert.equal(payload.updatedCount, 3);
    assert.equal(payload.checkedCount, 11);
    assert.equal(payload.debug.cookieChecks, 11);
});
