const https = require('https');
const crypto = require('crypto');

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'trada3k-c402a';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAVV-3HxGFpT_eiAri1SGPWGwu3EL8On58';
const COLLECTION = 'settings/twofa_links/items';
const ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => { let data = ''; res.on('data', (c) => { data += c; }); res.on('end', () => resolve({ status: res.statusCode || 0, body: data })); });
        req.on('error', reject); if (body) req.write(body); req.end();
    });
}
function endpoint(path) { return `/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}?key=${FIREBASE_API_KEY}`; }
function validId(id) { return ID_PATTERN.test(String(id || '').trim()); }
function docPath(id) { return `${COLLECTION}/${encodeURIComponent(String(id).trim())}`; }
function str(value) { return { stringValue: String(value || '') }; }
function field(fields, key) { return fields && fields[key] && typeof fields[key].stringValue === 'string' ? fields[key].stringValue : ''; }
function parse(record) {
    const f = record && record.fields || {};
    return { id: field(f, 'id'), secret: field(f, 'secret'), status: field(f, 'status') === 'revoked' ? 'revoked' : 'active', createdAt: field(f, 'createdAt'), updatedAt: field(f, 'updatedAt'), revokedAt: field(f, 'revokedAt'), expiresAt: field(f, 'expiresAt'), createdBy: field(f, 'createdBy'), updatedBy: field(f, 'updatedBy'), rotatedFrom: field(f, 'rotatedFrom') };
}
function toFields(r) { return { id: str(r.id), secret: str(r.secret), status: str(r.status), createdAt: str(r.createdAt), updatedAt: str(r.updatedAt), revokedAt: str(r.revokedAt), expiresAt: str(r.expiresAt), createdBy: str(r.createdBy), updatedBy: str(r.updatedBy), rotatedFrom: str(r.rotatedFrom) }; }
async function read(id) { if (!validId(id)) return null; const out = await request({ hostname: 'firestore.googleapis.com', path: endpoint(docPath(id)), method: 'GET' }); if (out.status === 404) return null; if (out.status < 200 || out.status >= 300) throw Object.assign(new Error('Failed to read 2FA link'), { httpStatus: out.status || 500 }); const result = parse(JSON.parse(out.body || '{}')); result.id = result.id || String(id).trim(); return result; }
async function save(r) { const body = JSON.stringify({ fields: toFields(r) }); const out = await request({ hostname: 'firestore.googleapis.com', path: endpoint(docPath(r.id)), method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, body); if (out.status < 200 || out.status >= 300) throw Object.assign(new Error('Failed to save 2FA link'), { httpStatus: out.status || 500 }); return r; }
function normalizeSecret(value) { return String(value || '').replace(/\s+/g, '').toUpperCase(); }
function decodeBase32(value) { const text = normalizeSecret(value).replace(/=+$/g, ''); if (!text || !/^[A-Z2-7]+$/.test(text)) throw Object.assign(new Error('Secret phải là Base32 hợp lệ.'), { httpStatus: 400 }); let bits = ''; for (const char of text) { const n = char >= 'A' && char <= 'Z' ? char.charCodeAt(0) - 65 : char.charCodeAt(0) - 24; bits += n.toString(2).padStart(5, '0'); } const bytes = []; for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2)); if (!bytes.length) throw Object.assign(new Error('Secret phải là Base32 hợp lệ.'), { httpStatus: 400 }); return Buffer.from(bytes); }
function generateTotp(secret, nowMs = Date.now()) { const key = decodeBase32(secret); const counter = Math.floor(nowMs / 30000); const input = Buffer.alloc(8); input.writeBigUInt64BE(BigInt(counter)); const digest = crypto.createHmac('sha1', key).update(input).digest(); const offset = digest[digest.length - 1] & 15; const number = ((digest[offset] & 127) << 24 | digest[offset + 1] << 16 | digest[offset + 2] << 8 | digest[offset + 3]) % 1000000; return String(number).padStart(6, '0'); }
function expired(r, now = Date.now()) { const ms = Date.parse(String(r && r.expiresAt || '')); return Number.isFinite(ms) && ms > 0 && ms < now; }
function expiry(value) { if (!String(value || '').trim()) return ''; const ms = Date.parse(String(value)); if (!Number.isFinite(ms)) throw Object.assign(new Error('Hạn link không hợp lệ.'), { httpStatus: 400 }); return new Date(ms).toISOString(); }
function randomId() { return crypto.randomBytes(18).toString('base64url'); }
async function create(secret, expiresAt, actor) { const normalized = normalizeSecret(secret); decodeBase32(normalized); for (let i = 0; i < 8; i += 1) { const id = randomId(); if (await read(id)) continue; const now = new Date().toISOString(); return save({ id, secret: normalized, status: 'active', createdAt: now, updatedAt: now, revokedAt: '', expiresAt: expiry(expiresAt), createdBy: actor, updatedBy: actor, rotatedFrom: '' }); } throw new Error('Không thể tạo ID 2FA.'); }
async function update(id, patch, actor) { const current = await read(id); if (!current) throw Object.assign(new Error('Không tìm thấy link 2FA.'), { httpStatus: 404 }); const next = { ...current, updatedAt: new Date().toISOString(), updatedBy: actor }; if (Object.prototype.hasOwnProperty.call(patch, 'secret')) { const normalized = normalizeSecret(patch.secret); decodeBase32(normalized); next.secret = normalized; } if (Object.prototype.hasOwnProperty.call(patch, 'expiresAt')) next.expiresAt = expiry(patch.expiresAt); if (patch.status === 'revoked' || patch.status === 'active') { next.status = patch.status; next.revokedAt = patch.status === 'revoked' ? new Date().toISOString() : ''; } return save(next); }
async function rotate(id, actor) { const current = await read(id); if (!current) throw Object.assign(new Error('Không tìm thấy link 2FA.'), { httpStatus: 404 }); for (let i = 0; i < 8; i += 1) { const newId = randomId(); if (await read(newId)) continue; const now = new Date().toISOString(); await save({ ...current, id: newId, updatedAt: now, updatedBy: actor, rotatedFrom: id }); await save({ ...current, status: 'revoked', revokedAt: now, updatedAt: now, updatedBy: actor }); return { record: await read(newId), oldId: id }; } throw new Error('Không thể đổi ID 2FA.'); }
module.exports = { validId, read, create, update, rotate, generateTotp, expired, expiry, normalizeSecret, decodeBase32 };
