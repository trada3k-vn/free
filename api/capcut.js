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
const DEFAULT_GUIDE = 'Hướng dẫn đăng nhập:\n1. Mở ứng dụng CapCut.\n2. Chọn Đăng nhập bằng tài khoản và mật khẩu.\n3. Nhập thông tin được cung cấp ở phía trên.';
const DEFAULT_WARRANTY_SUCCESS = 'Đã bảo hành và cấp tài khoản mới thành công.';
const DEFAULT_CLAIM_SUCCESS = 'Đã lấy tài khoản thành công.';
const DEFAULT_WARRANTY_ERROR = 'Không thể cấp tài khoản lúc này. Vui lòng thử lại sau.';
const DEFAULT_ACCOUNT_EXPIRED = 'Tài khoản đã hết hạn. Vui lòng bấm BẢO HÀNH TỰ ĐỘNG để nhận tài khoản mới.';
const DEFAULT_LINK_EXPIRED = 'Link đã hết hạn. Vui lòng liên hệ admin để được cấp link mới.';
const ACCOUNT_DAYS = 7;
const MAX_ADD_DAYS = 3650;
const WARRANTY_COOLDOWN_MS = 5 * 60 * 1000;
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
        guideMessage: parseString(fields.guideMessage) || DEFAULT_GUIDE,
        sheetAppsScriptUrl: parseString(fields.sheetAppsScriptUrl),
        warrantyMessage: parseString(fields.warrantyMessage) || DEFAULT_WARRANTY_MESSAGE,
        warrantySuccessMessage: parseString(fields.warrantySuccessMessage) || DEFAULT_WARRANTY_SUCCESS,
        warrantyErrorMessage: parseString(fields.warrantyErrorMessage) || DEFAULT_WARRANTY_ERROR,
        accountExpiredMessage: parseString(fields.accountExpiredMessage) || DEFAULT_ACCOUNT_EXPIRED,
        linkExpiredMessage: parseString(fields.linkExpiredMessage) || DEFAULT_LINK_EXPIRED
    };
}

async function saveConfig(input = {}) {
    const current = await readConfig();
    const next = {
        popupMessage: String(input.popupMessage ?? current.popupMessage).trim().slice(0, 3000) || DEFAULT_POPUP,
        guideMessage: String(input.guideMessage ?? current.guideMessage).trim().slice(0, 5000) || DEFAULT_GUIDE,
        sheetAppsScriptUrl: String(input.sheetAppsScriptUrl ?? current.sheetAppsScriptUrl).trim(),
        warrantyMessage: String(input.warrantyMessage ?? current.warrantyMessage).trim().slice(0, 500) || DEFAULT_WARRANTY_MESSAGE,
        warrantySuccessMessage: String(input.warrantySuccessMessage ?? current.warrantySuccessMessage).trim().slice(0, 500) || DEFAULT_WARRANTY_SUCCESS,
        warrantyErrorMessage: String(input.warrantyErrorMessage ?? current.warrantyErrorMessage).trim().slice(0, 500) || DEFAULT_WARRANTY_ERROR,
        accountExpiredMessage: String(input.accountExpiredMessage ?? current.accountExpiredMessage).trim().slice(0, 500) || DEFAULT_ACCOUNT_EXPIRED,
        linkExpiredMessage: String(input.linkExpiredMessage ?? current.linkExpiredMessage).trim().slice(0, 500) || DEFAULT_LINK_EXPIRED
    };
    await firestoreDoc(CAPCUT_CONFIG_DOC, 'PATCH', {
        popupMessage: stringValue(next.popupMessage),
        guideMessage: stringValue(next.guideMessage),
        sheetAppsScriptUrl: stringValue(next.sheetAppsScriptUrl),
        warrantyMessage: stringValue(next.warrantyMessage),
        warrantySuccessMessage: stringValue(next.warrantySuccessMessage),
        warrantyErrorMessage: stringValue(next.warrantyErrorMessage),
        accountExpiredMessage: stringValue(next.accountExpiredMessage),
        linkExpiredMessage: stringValue(next.linkExpiredMessage)
    });
    return next;
}

function validId(id) { return /^[A-Za-z0-9_-]{8,64}$/.test(String(id || '').trim()); }
function newId() { return crypto.randomBytes(12).toString('base64url').slice(0, 16); }
function parseMs(value) { const ms = Date.parse(String(value || '')); return Number.isFinite(ms) ? ms : 0; }
function isExpired(value) { const ms = parseMs(value); return !!ms && ms <= Date.now(); }
function normalizeCapcutExpiry(value = '') {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T23:59:59+07:00` : raw;
    const ms = Date.parse(iso);
    if (!Number.isFinite(ms)) throw Object.assign(new Error('Ngày hết hạn link không hợp lệ.'), { httpStatus: 400 });
    if (ms <= Date.now()) throw Object.assign(new Error('Ngày hết hạn link phải ở tương lai.'), { httpStatus: 400 });
    return new Date(ms).toISOString();
}
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
        guideMessage: config.guideMessage || DEFAULT_GUIDE,
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

function adminLinkDto(record, req, config) {
    return {
        ...publicDto(record, req, config),
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
    let response;
    try {
        response = await requestAppsScriptJsonWithRetry(url, { action, payload, timeoutMs: 300000, maxAttempts: 3 });
    } catch (error) {
        if (Number(error && error.attempts || 0) >= 3) {
            error.httpStatus = Number(error.httpStatus || 502);
            error.message = 'Không kết nối được Google Sheet sau 3 lần thử.';
        }
        throw error;
    }
    const data = response.data || {};
    if (data.success === false) throw Object.assign(new Error(String(data.error || 'Không lấy được tài khoản từ Google Sheet.')), { httpStatus: 502 });
    return data;
}

async function testSheetUrl(rawUrl) {
    const url = resolveAppsScriptUrlOrThrow(rawUrl);
    let response;
    try {
        response = await requestAppsScriptJsonWithRetry(url, { action: 'healthCapcut', timeoutMs: 30000, maxAttempts: 3 });
    } catch (error) {
        if (Number(error && error.attempts || 0) >= 3) {
            error.httpStatus = Number(error.httpStatus || 502);
            error.message = 'Không kết nối được Apps Script sau 3 lần thử.';
        }
        throw error;
    }
    const data = response.data || {};
    if (data.success === false) throw Object.assign(new Error(String(data.error || 'Apps Script trả về lỗi.')), { httpStatus: 502 });
    if (!data.sheetName || !Number.isFinite(Number(data.eligibleRows))) {
        throw Object.assign(new Error('Apps Script chưa cập nhật action healthCapcut.'), { httpStatus: 502 });
    }
    return {
        success: true,
        message: 'Kết nối Apps Script thành công.',
        sheetName: String(data.sheetName),
        eligibleRows: Number(data.eligibleRows)
    };
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
    const now = new Date();
    const explicitExpiry = normalizeCapcutExpiry(body && body.expiryDate);
    let expiresAt = explicitExpiry;
    if (!expiresAt) {
        if (!Number.isFinite(addDays) || addDays <= 0 || addDays > MAX_ADD_DAYS) throw Object.assign(new Error('Số ngày hạn link không hợp lệ.'), { httpStatus: 400 });
        expiresAt = new Date(now.getTime() + addDays * 86400000).toISOString();
    }
    const record = {
        id: newId(), status: 'active', createdAt: now.toISOString(), updatedAt: now.toISOString(),
        expiresAt, username: '', password: '',
        accountCreatedAt: '', accountExpiresAt: '', lastAction: 'created', lastActionAt: now.toISOString(),
        note: '', popupMessage: '', accountAssigned: false
    };
    await saveLink(record);
    let assignmentError = '';
    if (body && body.assignImmediately === true) {
        try {
            const account = await claimAccount();
            const assignedAt = new Date().toISOString();
            Object.assign(record, account, {
                accountAssigned: true,
                updatedAt: assignedAt,
                lastAction: 'assigned-on-create',
                lastActionAt: assignedAt
            });
            await saveLink(record);
        } catch (error) {
            assignmentError = String(error && error.message || 'Không nhập được tài khoản từ Google Sheet.');
        }
    }
    return { link: adminDto(record, req), assignmentError };
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
            const created = await createLink(req, parseBody(req.body));
            return res.status(200).json({ success: true, link: created.link, assignmentError: created.assignmentError || '' });
        }
        if (pathname === '/api/capcut/config' && req.method === 'GET') {
            const config = await readConfig();
            const isAdmin = await isAdminRequest(req);
            return res.status(200).json({ success: true, config: {
                popupMessage: config.popupMessage,
                warrantyMessage: config.warrantyMessage,
                guideMessage: config.guideMessage,
                warrantySuccessMessage: config.warrantySuccessMessage,
                warrantyErrorMessage: config.warrantyErrorMessage,
                accountExpiredMessage: config.accountExpiredMessage,
                linkExpiredMessage: config.linkExpiredMessage,
                ...(isAdmin ? { sheetAppsScriptUrl: config.sheetAppsScriptUrl } : {})
            } });
        }
        if (pathname === '/api/capcut/config' && req.method === 'PUT') {
            if (!await requireAdmin(req, res)) return;
            return res.status(200).json({ success: true, config: await saveConfig(parseBody(req.body)) });
        }
        if (pathname === '/api/capcut/sheet-test' && req.method === 'POST') {
            if (!await requireAdmin(req, res)) return;
            const body = parseBody(req.body);
            return res.status(200).json(await testSheetUrl(body.sheetAppsScriptUrl));
        }
        if (!match || !validId(decodeURIComponent(match[1]))) return res.status(404).json({ error: 'Not found' });
        const id = decodeURIComponent(match[1]);
        const action = match[2] || '';
        if (req.method === 'GET' && !action) {
            const record = await readLink(id);
            if (!record) return res.status(404).json({ error: 'Link CapCut không tồn tại.' });
            const config = await readConfig();
            const admin = await isAdminRequest(req);
            if (record.status !== 'active' || isExpired(record.expiresAt)) {
                if (admin) return res.status(200).json({ success: true, link: adminLinkDto(record, req, config) });
                return res.status(410).json({ error: 'Link CapCut đã hết hạn.' });
            }
            return res.status(200).json({ success: true, link: admin ? adminLinkDto(record, req, config) : publicDto(record, req, config) });
        }
        if (req.method === 'POST' && action === 'assign') {
            if (!await requireAdmin(req, res)) return;
            return res.status(200).json({ success: true, link: adminDto(await assign(req, id), req) });
        }
        if (req.method === 'POST' && action === 'warranty') {
            const record = await readLink(id);
            if (!record) return res.status(404).json({ error: 'Link CapCut không tồn tại.' });
            if (record.status !== 'active' || isExpired(record.expiresAt)) return res.status(410).json({ error: 'Link CapCut đã hết hạn.' });
            const admin = await isAdminRequest(req);
            const firstAssignment = !record.accountAssigned;
            if (!admin && !firstAssignment) {
                const clientIp = req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown');
                const cooldown = checkRateLimit(`capcut-warranty:${id}:${clientIp}`, 1, WARRANTY_COOLDOWN_MS);
                if (!cooldown.allowed) {
                    const retryAfterMs = Math.max(0, Number(cooldown.retryAfterMs || WARRANTY_COOLDOWN_MS));
                    if (typeof res.setHeader === 'function') res.setHeader('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
                    return res.status(429).json({ error: 'Vui lòng thử lại sau.', retryAfterMs });
                }
            }
            const config = await readConfig();
            const responseDto = (item) => admin ? adminLinkDto(item, req, config) : publicDto(item, req, config);
            if (record.accountAssigned && !isExpired(record.accountExpiresAt)) return res.status(200).json({ success: true, replaced: false, message: config.warrantyMessage, link: responseDto(record) });
            const next = await assign(req, id, 'warranty');
            return res.status(200).json({
                success: true,
                claimed: firstAssignment,
                replaced: !firstAssignment,
                message: firstAssignment ? DEFAULT_CLAIM_SUCCESS : config.warrantySuccessMessage,
                link: responseDto(next)
            });
        }
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        return res.status(Number(error.httpStatus || 500)).json({ error: error.message || 'CapCut request failed.' });
    }
};

module.exports._test = { mapFields, parseMs, isExpired, normalizeCapcutExpiry, ACCOUNT_DAYS };
