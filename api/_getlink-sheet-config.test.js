const test = require('node:test');
const assert = require('node:assert/strict');
const { getSheetImportConfig, getSheetCheckWindow } = require('./_getlink-sheet-config');
const { normalizeSheetSlots } = require('./_getlink-sheet-cookie-import');

test('checks five Google Sheet cookie candidates per batch by default', () => {
    const config = getSheetImportConfig({});
    assert.deepEqual(config, {
        candidateBatch: 5,
        checkConcurrency: 5
    });
    assert.deepEqual(
        getSheetCheckWindow(['c1', 'c2', 'c3', 'c4', 'c5', 'c6'], 0, config.checkConcurrency),
        ['c1', 'c2', 'c3', 'c4', 'c5']
    );
});

test('keeps smaller candidate groups below the concurrency limit', () => {
    const { checkConcurrency } = getSheetImportConfig({});
    const candidates = ['cookie-1', 'cookie-2', 'cookie-3'];

    assert.deepEqual(getSheetCheckWindow(candidates, 0, checkConcurrency), candidates);
});

test('allows environment variables to override and clamps Sheet limits', () => {
    assert.deepEqual(getSheetImportConfig({
        GETLINK_SHEET_CANDIDATE_BATCH: '7',
        GETLINK_SHEET_CHECK_CONCURRENCY: '4'
    }), {
        candidateBatch: 7,
        checkConcurrency: 4
    });
    assert.deepEqual(getSheetImportConfig({
        GETLINK_SHEET_CANDIDATE_BATCH: '999',
        GETLINK_SHEET_CHECK_CONCURRENCY: '999'
    }), {
        candidateBatch: 20,
        checkConcurrency: 10
    });
});

test('still limits imported accounts to the three supported link slots', () => {
    assert.deepEqual(
        normalizeSheetSlots(['primary', 'backup1', 'backup2', 'backup3', 'primary']),
        ['primary', 'backup1', 'backup2']
    );
});
