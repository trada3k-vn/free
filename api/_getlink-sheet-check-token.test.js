const test = require('node:test');
const assert = require('node:assert/strict');
const {
    TOKEN_TTL_MS,
    MAX_TOKEN_LENGTH,
    sealSheetCheckState,
    openSheetCheckState
} = require('./_getlink-sheet-check-token');

const options = { secret: 'test-secret-that-is-long-enough', now: 1000 };

test('Sheet Check token encrypts and restores state', () => {
    const state = { nextStartRow: 5001, checkedCount: 42, queuedRows: [{ cookie: 'secret-cookie' }] };
    const token = sealSheetCheckState(state, options);
    assert.equal(token.includes('secret-cookie'), false);
    assert.deepEqual(openSheetCheckState(token, options), state);
});

test('Sheet Check token rejects tampering and expiration', () => {
    const token = sealSheetCheckState({ nextStartRow: 9 }, options);
    const changed = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;
    assert.throws(() => openSheetCheckState(changed, options), /modified|Invalid/i);
    assert.throws(() => openSheetCheckState(token, { ...options, now: 1000 + TOKEN_TTL_MS + 1 }), /expired/i);
    assert.throws(() => openSheetCheckState('x'.repeat(MAX_TOKEN_LENGTH + 1), options), /too large/i);
});
