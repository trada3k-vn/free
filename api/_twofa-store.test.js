const test = require('node:test');
const assert = require('node:assert/strict');
const { decodeBase32, generateTotp } = require('./_twofa-store');

test('decodes Base32 and generates RFC 6238 SHA-1 TOTP vectors', () => {
    assert.equal(decodeBase32('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ').toString(), '12345678901234567890');
    assert.equal(generateTotp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 0), '755224');
    assert.equal(generateTotp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 59000), '287082');
    assert.equal(generateTotp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 59999), '287082');
    assert.notEqual(generateTotp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 60000), '287082');
});
test('rejects invalid Base32 secrets', () => {
    assert.throws(() => decodeBase32('not a valid secret!'), /Base32/);
});
