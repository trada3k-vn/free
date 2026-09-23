const https = require('https');
const crypto = require('crypto');
const { parseBody } = require('./_nf-store');
const { adminAuthConfig, checkRateLimit, applyCors, applySecurityHeaders } = require('./_security');
const { resolveAppsScriptUrlOrThrow, requestAppsScriptJsonWithRetry } = require('./_getlink-apps-script-client');

const FIREBASE_PROJECT_ID = 'trada3k-c402a';
const FIREBASE_API_KEY = 'AIzaSyAVV-3HxGFpT_eiAri1SGPWGwu3EL8On58';
const CAPCUT_COLLECTION = 'settings/capcut_links/items';
const CAPCUT_CONFIG_DOC = 'settings/capcut_config';
const DEFAULT_POPUP = 'Lưu ý: Không chia sẻ tài khoản cho người khác. Nếu tài khoản gặp vấn đề, hãy bấm BẢO HÀNH TỰ ĐỘNG.';
const DEFAULT_WARRANTY_MESSAGE = 'Tài khoản hiện tại vẫn còn hạn.';
const ACCOUNT_DAYS = 7;
const MAX_ADD_DAYS = 3650;
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const assignmentLocks = new Map();

function httpRequest(options, body = '') {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve({ statusCode: Number(res.statusCode || 0), body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

function firestorePath(docPath) {
    return `/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${docPath}?key=${FIREBASE_API_KEY}`;
}

function stringValue(value) { return { stringValue: String(value ?? '') }; }
function boolValue(value) { return { booleanValue: value === true }; }

function parseString(field) {
    if (field && typeof field.stringValue === 'string') return field.stringValue;
    return '';
}

function parseBool(field, fallback = false) {
    return field && typeof field.booleanValue === 'boolean' ? field.booleanValue : fallback;
}

function mapFields(fields = {}) {
    return {
        id: parseString(fields.id),
        status: parseString(fields.status) || 'active',
        createdAt: parseString(fields.createdAt),
        updatedAt: parseString(fields.updatedAt),
        expiresAt: parseString(fields.expiresAt),
        username: parseString(fields.username),
        password: parseString(fields.password),
        accountCreatedAt: parseString(fields.accountCreatedAt),
        accountExpiresAt: parseString(fields.accountExpiresAt),
        lastAction: parseString(fields.lastAction),
        lastActionAt: parseString(fields.lastActionAt),
        note: parseString(fields.note),
        popupMessage: parseString(fields.popupMessage),
        accountAssigned: parseBool(fields.accountAssigned)
    };
}

function mapRecord(record = {}) {
    return {
        id: stringValue(record.id),
        status: stringValue(record.status || 'active'),
        createdAt: stringValue(record.createdAt),
        updatedAt: stringValue(record.updatedAt),
        expiresAt: stringValue(record.expiresAt),
        username: stringValue(record.username),
        password: stringValue(record.password),
        accountCreatedAt: stringValue(record.accountCreatedAt),
        accountExpiresAt: stringValue(record.accountExpiresAt),
        lastAction: stringValue(record.lastAction),
        lastActionAt: stringValue(record.lastActionAt),
        note: stringValue(record.note),
        popupMessage: stringValue(record.popupMessage),
        accountAssigned: boolValue(record.accountAssigned)
    };
}

async function firestoreDoc(docPath, method = 'GET', fields) {
    const payload = fields ? JSON.stringify({ fields }) : '';
    const response = await httpRequest({
        hostname: 'firestore.googleapis.com',
        port: 443,
        path: firestorePath(docPath),
        method,
        headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : undefined
    }, payload);
    if (method === 'GET' && response.statusCode === 404) return null;
    if (response.statusCode < 200 || response.statusCode >= 300) {
        const error = new Error('Firestore operation failed');
        error.httpStatus = response.statusCode || 500;
        throw error;
    }
    if (!response.body) return {};
    try { return JSON.parse(response.body); } catch (_) { return {}; }
}

async function readLink(id) {
    const doc = await firestoreDoc(`${CAPCUT_COLLECTION}/${encodeURIComponent(id)}`);
    return doc && doc.fields ? mapFields(doc.fields) : null;
}

async function saveLink(record) {
    await firestoreDoc(`${CAPCUT_COLLECTION}/${encodeURIComponent(record.id)}`, 'PATCH', mapRecord(record));
    return record;
}

async function readConfig() {
    const doc = await firestoreDoc(CAPCUT_CONFIG_DOC);
    const fields = doc && doc.fields ? doc.fields : {};
    return {
        popupMessage: parseString(fields.popupMessage) || DEFAULT_POPUP,
        sheetAppsScriptUrl: parseString(fields.sheetAppsScriptUrl),
        warrantyMessage: parseString(fields.warrantyMessage) || DEFAULT_WARRANTY_MESSAGE
    };
}

async function saveConfig(input = {}) {
    const current = await readConfig();
    const next = {
        popupMessage: String(input.popupMessage ?? current.popupMessage).trim().slice(0, 3000) || DEFAULT_POPUP,
        sheetAppsScriptUrl: String(input.sheetAppsScriptUrl ?? current.sheetAppsScriptUrl).trim(),
        warrantyMessage: String(input.warrantyMessage ?? current.warrantyMessage).trim().slice(0, 500) || DEFAULT_WARRANTY_MESSAGE
    };
    await firestoreDoc(CAPCUT_CONFIG_DOC, 'PATCH', {
        popupMessage: stringValue(next.popupMessage),
        sheetAppsScriptUrl: stringValue(next.sheetAppsScriptUrl),
        warrantyMessage: stringValue(next.warrantyMessage)
    });
    return next;
}

function validId(id) { return /^[A-Za-z0-9_-]{8,64}$/.test(String(id || '').trim()); }
function newId() { return crypto.randomBytes(12).toString('base64url').slice(0, 16); }
function parseMs(value) { const ms = Date.parse(String(value || '')); return Number.isFinite(ms) ? ms : 0; }
function isExpired(value) { const ms = parseMs(value); return !!ms && ms <= Date.now(); }
function origin(req) {
    const proto = String(req.headers && (req.headers['x-forwarded-proto'] || req.headers['X-Forwarded-Proto']) || '').trim();
    const host = String(req.headers && req.headers.host || '').trim();
    return proto && host ? `${proto}://${host}` : (host ? `http://${host}` : 'http://localhost:3005');
}

function publicDto(record, req, config) {
    return {
        id: record.id,
        status: record.status,
        expired: record.status !== 'active' || isExpired(record.expiresAt),
        username: record.username || '',
        password: record.password || '',
        accountAssigned: !!record.accountAssigned,
        accountExpired: !!record.accountAssigned && isExpired(record.accountExpiresAt),
        warrantyMessage: config.warrantyMessage || DEFAULT_WARRANTY_MESSAGE,
        popupMessage: config.popupMessage || DEFAULT_POPUP,
        shareUrl: `${origin(req)}/capcut/${encodeURIComponent(record.id)}`
    };
}

function adminDto(record, req) {
    return {
        ...publicDto(record, req, { popupMessage: record.popupMessage, warrantyMessage: DEFAULT_WARRANTY_MESSAGE }),
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        accountCreatedAt: record.accountCreatedAt,
        accountExpiresAt: record.accountExpiresAt,
        lastAction: record.lastAction,
        lastActionAt: record.lastActionAt
    };
}

function bearer(headers = {}) {
    const raw = String(headers.authorization || headers.Authorization || '').trim();
    const match = raw.match(/^Bearer\s+(.+)$/i);
    return String(match && match[1] || '').trim();
}

async function firebaseEmail(idToken) {
    if (!idToken) return '';
    const payload = JSON.stringify({ idToken });
    const response = await httpRequest({
        hostname: 'identitytoolkit.googleapis.com', port: 443,
        path: `/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, payload);
    if (response.statusCode < 200 || response.statusCode >= 300) return '';
    try { return String(JSON.parse(response.body).users[0].email || '').trim().toLowerCase(); } catch (_) { return ''; }
}

async function requireAdmin(req, res) {
    const email = await firebaseEmail(bearer(req.headers || {}));
    const admins = adminAuthConfig().adminEmails || [];
    if (!email || !admins.includes(email)) {
        res.status(401).json({ error: 'Admin authentication required' });
        return '';
    }
    return email;
}

async function isAdminRequest(req) {
    const email = await firebaseEmail(bearer(req.headers || {}));
    return !!email && (adminAuthConfig().adminEmails || []).includes(email);
}

async function callSheet(action, payload = {}) {
    const config = await readConfig();
    if (!config.sheetAppsScriptUrl) {
        const error = new Error('Chưa cấu hình Apps Script URL cho CapCut.');
        error.httpStatus = 503;
        throw error;
    }
    const url = resolveAppsScriptUrlOrThrow(config.sheetAppsScriptUrl);
    const response = await requestAppsScriptJsonWithRetry(url, { action, payload, timeoutMs: 300000 });
    const data = response.data || {};
    if (data.success === false) throw Object.assign(new Error(String(data.error || 'Không lấy được tài khoản từ Google Sheet.')), { httpStatus: 502 });
    return data;
}

async function claimAccount() {
    const data = await callSheet('claimCapcutAccount');
    const item = data.account || data.item;
    if (!item || !item.username || !item.password || !item.accountCreatedAt) {
        throw Object.assign(new Error('Google Sheet không còn tài khoản hợp lệ.'), { httpStatus: 409 });
    }
    const createdMs = parseMs(item.accountCreatedAt);
    if (!createdMs) throw Object.assign(new Error('Ngày giờ tài khoản trong Sheet không hợp lệ.'), { httpStatus: 502 });
    return {
        username: String(item.username),
        password: String(item.password),
        accountCreatedAt: new Date(createdMs).toISOString(),
        accountExpiresAt: new Date(createdMs + ACCOUNT_DAYS * 86400000).toISOString()
    };
}

async function createLink(req, body) {
    const addDays = Number(body.addDays);
    if (!Number.isFinite(addDays) || addDays <= 0 || addDays > MAX_ADD_DAYS) throw Object.assign(new Error('Số ngày hạn link không hợp lệ.'), { httpStatus: 400 });
    const now = new Date();
    const record = {
        id: newId(), status: 'active', createdAt: now.toISOString(), updatedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + addDays * 86400000).toISOString(), username: '', password: '',
        accountCreatedAt: '', accountExpiresAt: '', lastAction: 'created', lastActionAt: now.toISOString(),
        note: '', popupMessage: '', accountAssigned: false
    };
    await saveLink(record);
    return adminDto(record, req);
}

async function assign(req, id, action = 'assigned') {
    if (assignmentLocks.has(id)) return assignmentLocks.get(id);
    const task = assignUnlocked(req, id, action);
    assignmentLocks.set(id, task);
    try { return await task; } finally { assignmentLocks.delete(id); }
}

async function assignUnlocked(req, id, action = 'assigned') {
    const record = await readLink(id);
    if (!record) throw Object.assign(new Error('Link CapCut không tồn tại.'), { httpStatus: 404 });
    if (record.status !== 'active' || isExpired(record.expiresAt)) throw Object.assign(new Error('Link CapCut đã hết hạn.'), { httpStatus: 410 });
    const account = await claimAccount();
    const now = new Date().toISOString();
    const next = { ...record, ...account, accountAssigned: true, updatedAt: now, lastAction: action, lastActionAt: now };
    await saveLink(next);
    return next;
}

module.exports = async function capcutHandler(req, res) {
    applyCors(req, res, 'GET,POST,PUT,OPTIONS');
    applySecurityHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    try {
        const pathname = String(req.url || '').split('?')[0];
        const match = pathname.match(/^\/api\/capcut\/links\/([^/]+)(?:\/(assign|warranty))?$/);
        if (pathname === '/api/capcut/links' && req.method === 'POST') {
            if (!await requireAdmin(req, res)) return;
            return res.status(200).json({ success: true, link: await createLink(req, parseBody(req.body)) });
        }
        if (pathname === '/api/capcut/config' && req.method === 'GET') {
            const config = await readConfig();
            const isAdmin = await isAdminRequest(req);
            return res.status(200).json({ success: true, config: {
                popupMessage: config.popupMessage,
                warrantyMessage: config.warrantyMessage,
                ...(isAdmin ? { sheetAppsScriptUrl: config.sheetAppsScriptUrl } : {})
            } });
        }
        if (pathname === '/api/capcut/config' && req.method === 'PUT') {
            if (!await requireAdmin(req, res)) return;
            return res.status(200).json({ success: true, config: await saveConfig(parseBody(req.body)) });
        }
        if (!match || !validId(decodeURIComponent(match[1]))) return res.status(404).json({ error: 'Not found' });
        const id = decodeURIComponent(match[1]);
        const action = match[2] || '';
        if (req.method === 'GET' && !action) {
            const record = await readLink(id);
            if (!record) return res.status(404).json({ error: 'Link CapCut không tồn tại.' });
            if (record.status !== 'active' || isExpired(record.expiresAt)) return res.status(410).json({ error: 'Link CapCut đã hết hạn.' });
            return res.status(200).json({ success: true, link: publicDto(record, req, await readConfig()) });
        }
        if (req.method === 'POST' && action === 'assign') {
            if (!await requireAdmin(req, res)) return;
            return res.status(200).json({ success: true, link: adminDto(await assign(req, id), req) });
        }
        if (req.method === 'POST' && action === 'warranty') {
            const rate = checkRateLimit(`capcut-warranty:${id}:${req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown')}`, RATE_LIMIT, RATE_WINDOW_MS);
            if (!rate.allowed) return res.status(429).json({ error: 'Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau.' });
            const record = await readLink(id);
            if (!record) return res.status(404).json({ error: 'Link CapCut không tồn tại.' });
            if (record.status !== 'active' || isExpired(record.expiresAt)) return res.status(410).json({ error: 'Link CapCut đã hết hạn.' });
            if (record.accountAssigned && !isExpired(record.accountExpiresAt)) return res.status(200).json({ success: true, replaced: false, message: (await readConfig()).warrantyMessage, link: publicDto(record, req, await readConfig()) });
            const next = await assign(req, id, 'warranty');
            return res.status(200).json({ success: true, replaced: true, message: 'Đã bảo hành và cấp tài khoản mới.', link: publicDto(next, req, await readConfig()) });
        }
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        return res.status(Number(error.httpStatus || 500)).json({ error: error.message || 'CapCut request failed.' });
    }
};

module.exports._test = { mapFields, parseMs, isExpired, ACCOUNT_DAYS };
