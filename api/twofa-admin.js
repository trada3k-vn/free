const https = require('https');
const { parseBody } = require('./_nf-store');
const { adminAuthConfig, applyCors, applySecurityHeaders } = require('./_security');
const { validId, read, create, update, rotate, decrypt, expired } = require('./_twofa-store');
const FIREBASE_API_KEY = String(process.env.FIREBASE_API_KEY || 'AIzaSyAVV-3HxGFpT_eiAri1SGPWGwu3EL8On58').trim();
function request(options, body) { return new Promise((resolve, reject) => { const r = https.request(options, (s) => { let data = ''; s.on('data', (c) => { data += c; }); s.on('end', () => resolve({ status: s.statusCode || 0, body: data })); }); r.on('error', reject); if (body) r.write(body); r.end(); }); }
function bearer(headers = {}) { const value = String(headers.authorization || headers.Authorization || ''); return value.startsWith('Bearer ') ? value.slice(7).trim() : ''; }
async function admin(req) { const token = bearer(req.headers); if (!token) return null; const body = JSON.stringify({ idToken: token }); const out = await request({ hostname: 'identitytoolkit.googleapis.com', path: `/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, body); if (out.status < 200 || out.status >= 300) return null; let json = {}; try { json = JSON.parse(out.body); } catch (_) {} const email = String(json.users && json.users[0] && json.users[0].email || '').toLowerCase(); return (adminAuthConfig().adminEmails || []).includes(email) ? email : null; }
function origin(req) { const host = String(req.headers.host || 'localhost:3005'); const proto = String(req.headers['x-forwarded-proto'] || 'http'); return `${proto}://${host}`; }
function dto(record, req, includeSecret = false) { const data = { id: record.id, status: record.status, createdAt: record.createdAt, updatedAt: record.updatedAt, revokedAt: record.revokedAt, expiresAt: record.expiresAt, expired: expired(record), shareUrl: `${origin(req)}/2fa?s=${encodeURIComponent(record.id)}` }; if (includeSecret) data.secret = decrypt(record.secretCiphertext, record.id); return data; }
module.exports = async function (req, res) {
    applyCors(req, res); applySecurityHeaders(res); if (req.method === 'OPTIONS') return res.status(204).end();
    const user = await admin(req); if (!user) return res.status(401).json({ error: 'Cần đăng nhập admin.' });
    const path = String(req.url || '').split('?')[0];
    try {
        if (req.method === 'POST' && path === '/api/2fa-admin/links') { const body = parseBody(req.body); const record = await create(body.secret, body.expiresAt, user); return res.status(201).json({ success: true, link: dto(record, req, true) }); }
        if (req.method === 'POST' && path === '/api/2fa-admin/search') { const query = String(parseBody(req.body).query || '').trim(); let id = query; try { id = new URL(query).searchParams.get('s') || query; } catch (_) {} if (!validId(id)) return res.status(400).json({ error: 'ID hoặc URL không hợp lệ.' }); const record = await read(id); if (!record) return res.status(404).json({ error: 'Không tìm thấy link 2FA.' }); return res.json({ success: true, link: dto(record, req, true) }); }
        const rotateMatch = path.match(/^\/api\/2fa-admin\/links\/([^/]+)\/rotate-id$/);
        if (req.method === 'POST' && rotateMatch) { const result = await rotate(decodeURIComponent(rotateMatch[1]), user); return res.json({ success: true, oldId: result.oldId, link: dto(result.record, req, true) }); }
        const statusMatch = path.match(/^\/api\/2fa-admin\/links\/([^/]+)\/(revoke|restore)$/);
        if (req.method === 'POST' && statusMatch) { const record = await update(decodeURIComponent(statusMatch[1]), { status: statusMatch[2] === 'revoke' ? 'revoked' : 'active' }, user); return res.json({ success: true, link: dto(record, req, true) }); }
        const updateMatch = path.match(/^\/api\/2fa-admin\/links\/([^/]+)$/);
        if (req.method === 'PUT' && updateMatch) { const body = parseBody(req.body); const patch = {}; if (Object.prototype.hasOwnProperty.call(body, 'secret')) patch.secret = body.secret; if (Object.prototype.hasOwnProperty.call(body, 'expiresAt')) patch.expiresAt = body.expiresAt; const record = await update(decodeURIComponent(updateMatch[1]), patch, user); return res.json({ success: true, link: dto(record, req, true) }); }
        return res.status(404).json({ error: 'Not found' });
    } catch (error) { return res.status(error.httpStatus || 500).json({ error: error.message || 'Thao tác thất bại.' }); }
};
