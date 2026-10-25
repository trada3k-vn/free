const https = require('https');
const crypto = require('crypto');

const FIREBASE_PROJECT_ID = 'trada3k-c402a';
const FIREBASE_API_KEY = 'AIzaSyAVV-3HxGFpT_eiAri1SGPWGwu3EL8On58';
// v2 is intentionally separate from the legacy flat collections.  Existing
// records are retained but never scanned by the application again.
const COLL_GETLINK_FIX_HISTORY = 'settings/getlink_fix_history_v2/global_items';
const COLL_GETLINK_FIX_LIMITS = 'settings/getlink_fix_history_v2/limit_states';
const FIX_MODES = new Set(['overload', 'household', 'auto']);
const FIX_LIMIT_MAX_24H = 4;
const FIX_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const FIX_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;

function httpRequest(options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve({ statusCode: res.statusCode || 0, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

function firestoreDocPath(docPath) {
    return `/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${docPath}?key=${FIREBASE_API_KEY}`;
}

function firestoreCollectionPath(collectionPath, query = {}) {
    const params = Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
    return `/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collectionPath}?key=${FIREBASE_API_KEY}${params ? `&${params}` : ''}`;
}

function toStringValue(value = '') {
    return { stringValue: String(value || '') };
}

function toBooleanValue(value = null) {
    if (value === null || value === undefined) return { nullValue: null };
    return { booleanValue: value === true };
}

function parseFirestoreString(valueObj = null) {
    if (!valueObj || typeof valueObj !== 'object') return '';
    return typeof valueObj.stringValue === 'string' ? valueObj.stringValue : '';
}

function parseFirestoreBoolean(valueObj = null) {
    if (!valueObj || typeof valueObj !== 'object') return null;
    if (typeof valueObj.booleanValue === 'boolean') return valueObj.booleanValue;
    return Object.prototype.hasOwnProperty.call(valueObj, 'nullValue') ? null : null;
}

function normalizeFixMode(value = '') {
    const mode = String(value || '').trim().toLowerCase();
    return FIX_MODES.has(mode) ? mode : 'overload';
}

function buildHistoryDocPath(historyId = '') {
    return `${COLL_GETLINK_FIX_HISTORY}/${encodeURIComponent(String(historyId || '').trim())}`;
}

function buildShareHistoryCollectionPath(shareId = '') {
    return `settings/getlink_fix_history_v2/shares/${encodeURIComponent(String(shareId || '').trim())}/items`;
}

function buildShareHistoryDocPath(shareId = '', historyId = '') {
    return `${buildShareHistoryCollectionPath(shareId)}/${encodeURIComponent(String(historyId || '').trim())}`;
}

function buildLimitDocPath(shareId = '') {
    return `${COLL_GETLINK_FIX_LIMITS}/${encodeURIComponent(String(shareId || '').trim())}`;
}

function generateHistoryId() {
    return crypto.randomBytes(12).toString('base64url').slice(0, 18);
}

function parseIsoMillis(value = '') {
    const text = String(value || '').trim();
    if (!text) return 0;
    const ms = Date.parse(text);
    return Number.isFinite(ms) ? ms : 0;
}

function mapFieldsToRecord(fields = {}) {
    return {
        id: parseFirestoreString(fields.id),
        shareId: parseFirestoreString(fields.shareId),
        fixMode: normalizeFixMode(parseFirestoreString(fields.fixMode)),
        status: parseFirestoreString(fields.status) || 'success',
        operationId: parseFirestoreString(fields.operationId),
        startedAt: parseFirestoreString(fields.startedAt),
        completedAt: parseFirestoreString(fields.completedAt),
        actor: parseFirestoreString(fields.actor),
        sheetImported: parseFirestoreBoolean(fields.sheetImported)
    };
}

function mapRecordToFields(record = {}) {
    return {
        id: toStringValue(record.id),
        shareId: toStringValue(record.shareId),
        fixMode: toStringValue(normalizeFixMode(record.fixMode)),
        status: toStringValue(record.status || 'success'),
        operationId: toStringValue(record.operationId),
        startedAt: toStringValue(record.startedAt),
        completedAt: toStringValue(record.completedAt),
        actor: toStringValue(record.actor),
        sheetImported: toBooleanValue(record.sheetImported)
    };
}

function mapLimitFieldsToRecord(fields = {}, fallbackShareId = '') {
    return {
        shareId: parseFirestoreString(fields.shareId) || String(fallbackShareId || '').trim(),
        resetAt: parseFirestoreString(fields.resetAt),
        resetBy: parseFirestoreString(fields.resetBy),
        updatedAt: parseFirestoreString(fields.updatedAt),
        overloadCompletedAt: Array.isArray(fields.overloadCompletedAt && fields.overloadCompletedAt.arrayValue && fields.overloadCompletedAt.arrayValue.values)
            ? fields.overloadCompletedAt.arrayValue.values.map(parseFirestoreString).filter(Boolean)
            : []
    };
}

function mapLimitRecordToFields(record = {}) {
    return {
        shareId: toStringValue(record.shareId),
        resetAt: toStringValue(record.resetAt),
        resetBy: toStringValue(record.resetBy),
        updatedAt: toStringValue(record.updatedAt),
        overloadCompletedAt: {
            arrayValue: {
                values: Array.isArray(record.overloadCompletedAt)
                    ? record.overloadCompletedAt.filter(Boolean).map(toStringValue)
                    : []
            }
        }
    };
}

async function readDoc(docPath) {
    const response = await httpRequest({
        hostname: 'firestore.googleapis.com',
        port: 443,
        path: firestoreDocPath(docPath),
        method: 'GET'
    });
    if (response.statusCode === 404) return null;
    if (response.statusCode < 200 || response.statusCode >= 300) {
        const error = new Error('Failed to read getlink fix history');
        error.httpStatus = response.statusCode || 500;
        throw error;
    }
    try {
        return JSON.parse(response.body || '{}');
    } catch (_error) {
        return null;
    }
}

async function patchDoc(docPath, fields) {
    const payload = JSON.stringify({ fields });
    const response = await httpRequest({
        hostname: 'firestore.googleapis.com',
        port: 443,
        path: firestoreDocPath(docPath),
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, payload);
    if (response.statusCode < 200 || response.statusCode >= 300) {
        const error = new Error('Failed to save getlink fix history');
        error.httpStatus = response.statusCode || 500;
        throw error;
    }
    return true;
}

async function listDocs(collectionPath, options = {}) {
    const pageSize = Math.max(1, Math.min(Number(options.pageSize || 200), 1000));
    const docs = [];
    let pageToken = '';

    do {
        const response = await httpRequest({
            hostname: 'firestore.googleapis.com',
            port: 443,
            path: firestoreCollectionPath(collectionPath, {
                pageSize,
                pageToken: pageToken || undefined
            }),
            method: 'GET'
        });
        if (response.statusCode === 404) return [];
        if (response.statusCode < 200 || response.statusCode >= 300) {
            const error = new Error('Failed to list getlink fix history');
            error.httpStatus = response.statusCode || 500;
            throw error;
        }
        let parsed = {};
        try { parsed = JSON.parse(response.body || '{}'); } catch (_error) { parsed = {}; }
        if (Array.isArray(parsed.documents)) docs.push(...parsed.documents);
        pageToken = String(parsed.nextPageToken || '').trim();
        // Lists are deliberately bounded.  Admin can show recent records
        // without reads increasing with the age of the project.
        if (options.paginate !== true) pageToken = '';
    } while (pageToken);

    return docs;
}

async function recordSuccessfulFix(input = {}) {
    const shareId = String(input.shareId || '').trim();
    if (!shareId) throw new Error('Missing shareId for fix history');

    const record = {
        id: generateHistoryId(),
        shareId,
        fixMode: normalizeFixMode(input.fixMode),
        status: 'success',
        operationId: String(input.operationId || '').trim(),
        startedAt: String(input.startedAt || '').trim(),
        completedAt: String(input.completedAt || new Date().toISOString()).trim(),
        actor: String(input.actor || 'guest').trim(),
        sheetImported: input.sheetImported === true ? true : input.sheetImported === false ? false : null
    };
    const fields = mapRecordToFields(record);
    // A per-share collection makes a share history lookup bounded and avoids
    // the old full-collection scan.  The compact global feed is for admin.
    await Promise.all([
        patchDoc(buildShareHistoryDocPath(shareId, record.id), fields),
        patchDoc(buildHistoryDocPath(record.id), fields)
    ]);

    if (record.fixMode === 'overload') {
        const nowMs = parseIsoMillis(record.completedAt) || Date.now();
        const current = await readFixLimitReset(shareId);
        const windowStartMs = Math.max(nowMs - FIX_LIMIT_WINDOW_MS, parseIsoMillis(current.resetAt) || 0);
        const overloadCompletedAt = [...(current.overloadCompletedAt || []), record.completedAt]
            .filter((value) => parseIsoMillis(value) >= windowStartMs)
            .sort((a, b) => parseIsoMillis(b) - parseIsoMillis(a))
            .slice(0, FIX_LIMIT_MAX_24H);
        await patchDoc(buildLimitDocPath(shareId), mapLimitRecordToFields({
            ...current,
            shareId,
            overloadCompletedAt,
            updatedAt: record.completedAt
        }));
    }
    return record;
}

async function readFixLimitReset(shareId = '') {
    const normalizedShareId = String(shareId || '').trim();
    if (!normalizedShareId) return { shareId: '', resetAt: '', resetBy: '', updatedAt: '' };

    const doc = await readDoc(buildLimitDocPath(normalizedShareId));
    if (!doc || !doc.fields) {
        return { shareId: normalizedShareId, resetAt: '', resetBy: '', updatedAt: '' };
    }
    return mapLimitFieldsToRecord(doc.fields || {}, normalizedShareId);
}

async function getFixLimitState(shareId = '', options = {}) {
    const normalizedShareId = String(shareId || '').trim();
    const nowMs = Math.max(0, Number(options.nowMs || Date.now()) || Date.now());
    if (!normalizedShareId) {
        return {
            count24h: 0,
            max24h: FIX_LIMIT_MAX_24H,
            remaining: FIX_LIMIT_MAX_24H,
            limited: false,
            cooldownUntil: '',
            resetAt: '',
            windowStartedAt: new Date(nowMs - FIX_LIMIT_WINDOW_MS).toISOString()
        };
    }

    const reset = await readFixLimitReset(normalizedShareId);
    const limitEnabled = options.limitEnabled !== false;
    const cooldownEnabled = options.cooldownEnabled !== false;
    const resetMs = parseIsoMillis(reset.resetAt);
    const windowStartMs = Math.max(nowMs - FIX_LIMIT_WINDOW_MS, resetMs || 0);
    const successes = (reset.overloadCompletedAt || [])
        .map(parseIsoMillis)
        .filter((completedMs) => completedMs >= windowStartMs && completedMs <= nowMs)
        .sort((a, b) => b - a);
    const lastSuccessMs = successes.length > 0 ? successes[0] : 0;
    const cooldownUntilMs = cooldownEnabled && lastSuccessMs > 0 ? lastSuccessMs + FIX_LIMIT_COOLDOWN_MS : 0;
    const count24h = successes.length;
    const limited = limitEnabled && count24h >= FIX_LIMIT_MAX_24H;
    return {
        count24h,
        max24h: FIX_LIMIT_MAX_24H,
        remaining: Math.max(0, FIX_LIMIT_MAX_24H - count24h),
        limited,
        limitEnabled,
        cooldownEnabled,
        cooldownUntil: cooldownUntilMs > nowMs ? new Date(cooldownUntilMs).toISOString() : '',
        resetAt: reset.resetAt || '',
        windowStartedAt: new Date(windowStartMs).toISOString()
    };
}

async function assertFixLimitAllowed(shareId = '', options = {}) {
    const limit = await getFixLimitState(shareId, options);
    if (limit.limited) {
        const error = new Error(`Link này đã dùng hết ${limit.max24h} lần sửa lỗi thành công trong 24h, vui lòng liên hệ hỗ trợ.`);
        error.httpStatus = 429;
        error.code = 'FIX_LIMIT_REACHED';
        error.limit = limit;
        throw error;
    }
    if (limit.cooldownUntil) {
        const error = new Error('Link này vừa sửa lỗi thành công, vui lòng thử lại sau ít phút.');
        error.httpStatus = 429;
        error.code = 'FIX_COOLDOWN';
        error.limit = limit;
        throw error;
    }
    return limit;
}

async function resetFixLimit(shareId = '', resetBy = 'admin') {
    const normalizedShareId = String(shareId || '').trim();
    if (!normalizedShareId) {
        const error = new Error('Missing shareId for fix limit reset');
        error.httpStatus = 400;
        throw error;
    }
    const now = new Date().toISOString();
    const record = {
        shareId: normalizedShareId,
        resetAt: now,
        resetBy: String(resetBy || 'admin').trim(),
        updatedAt: now
    };
    await patchDoc(buildLimitDocPath(normalizedShareId), mapLimitRecordToFields({ ...record, overloadCompletedAt: [] }));
    return record;
}

async function listSuccessfulFixHistory(shareId = '', sort = 'desc') {
    const normalizedShareId = String(shareId || '').trim();
    if (!normalizedShareId) {
        return {
            items: [],
            counts: { overload: 0, household: 0, auto: 0, total: 0 },
            limit: await getFixLimitState(''),
            sort: 'desc'
        };
    }

    const docs = await listDocs(buildShareHistoryCollectionPath(normalizedShareId), { pageSize: 100 });
    const items = docs
        .map((doc) => mapFieldsToRecord(doc && doc.fields ? doc.fields : {}))
        .filter((item) => item.shareId === normalizedShareId && item.status === 'success');
    const direction = String(sort || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    items.sort((a, b) => {
        const aMs = Date.parse(a.completedAt || a.startedAt || '') || 0;
        const bMs = Date.parse(b.completedAt || b.startedAt || '') || 0;
        return direction === 'asc' ? aMs - bMs : bMs - aMs;
    });

    const counts = {
        overload: items.filter((item) => item.fixMode === 'overload').length,
        household: items.filter((item) => item.fixMode === 'household').length,
        auto: items.filter((item) => item.fixMode === 'auto').length
    };
    counts.total = counts.overload + counts.household + counts.auto;
    const limit = await getFixLimitState(normalizedShareId);
    return { items, counts, limit, sort: direction };
}

async function listAllSuccessfulFixHistory(sort = 'desc') {
    const docs = await listDocs(COLL_GETLINK_FIX_HISTORY, { pageSize: 100 });
    const items = docs
        .map((doc) => mapFieldsToRecord(doc && doc.fields ? doc.fields : {}))
        .filter((item) => item.status === 'success' && item.shareId);
    const direction = String(sort || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    items.sort((a, b) => {
        const aMs = Date.parse(a.completedAt || a.startedAt || '') || 0;
        const bMs = Date.parse(b.completedAt || b.startedAt || '') || 0;
        return direction === 'asc' ? aMs - bMs : bMs - aMs;
    });

    const counts = {
        overload: items.filter((item) => item.fixMode === 'overload').length,
        household: items.filter((item) => item.fixMode === 'household').length,
        auto: items.filter((item) => item.fixMode === 'auto').length,
        total: items.length
    };
    return {
        items,
        counts,
        linkCount: new Set(items.map((item) => item.shareId)).size,
        sort: direction
    };
}

module.exports = {
    COLL_GETLINK_FIX_HISTORY,
    COLL_GETLINK_FIX_LIMITS,
    normalizeFixMode,
    recordSuccessfulFix,
    getFixLimitState,
    assertFixLimitAllowed,
    resetFixLimit,
    listSuccessfulFixHistory,
    listAllSuccessfulFixHistory
};
