const test = require('node:test');
const assert = require('node:assert/strict');
const { decodeProfileEscapes, summarizeCookieCheck } = require('./_getlink-cookie-health');

test('decodes hexadecimal spaces in Getlink profile names', () => {
    assert.equal(decodeProfileEscapes('P\\x20R\\x20Das'), 'P R Das');
    assert.equal(summarizeCookieCheck({ profiles: 'P\\x20R\\x20Das' }).profiles, 'P R Das');
});

test('preserves ordinary Getlink profile names', () => {
    assert.equal(decodeProfileEscapes('P R Das'), 'P R Das');
});

test('decodes valid Unicode escapes and leaves invalid sequences unchanged', () => {
    assert.equal(decodeProfileEscapes('Nguy\\u1ec5n \\u{1EA1}n'), 'Nguyễn ạn');
    assert.equal(decodeProfileEscapes('P\\x2 R\\u12G4'), 'P\\x2 R\\u12G4');
    assert.equal(decodeProfileEscapes('P\\u{110000}'), 'P\\u{110000}');
});
