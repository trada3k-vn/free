const https = require('https');
const { parseBody } = require('./_nf-store');
const { adminAuthConfig, applyCors, applySecurityHeaders } = require('./_security');
const {
    extractShareIdFromQuery,
    isValidShareId,
    readShareById,
    updateShareCookie,
    updateShareCookies,
    updateShareAdminFields,
    setShareStatus,
    rotateShareId,
    sanitizeCookieRaw,
    sanitizeShareCookies,
    setShareExpiry,
    isShareExpired
} = require('./_getlink-share-store');
const { evaluateGetlinkCookie } = require('./_getlink-cookie-health');
const {
    createSheetImportOperation,
    advanceGetlinkOperation,
    shapeOperationPayload
} = require('./_getlink-operation-store');
const {
    readWarningConfig,
    saveWarningConfig,
    isSheetAccessEnabled,
    readSheetAppsScriptUrl
} = require('./_getlink-warning-config-store');
const {
    resolveAppsScriptUrlOrThrow: validateAppsScriptUrl,
    requestAppsScriptJsonWithRetry
} = require('./_getlink-apps-script-client');
const { listSuccessfulFixHistory, resetFixLimit, getFixLimitState } = require('./_getlink-fix-history-store');

const FIREBASE_API_KEY = String(process.env.FIREBASE_API_KEY || 'AIzaSyAVV-3HxGFpT_eiAri1SGPWGwu3EL8On58').trim();
const ENV_GETLINK_SHEET_APPS_SCRIPT_URL = String(process.env.GETLINK_SHEET_APPS_SCRIPT_URL || '').trim();
const GETLINK_SHEET_FETCH_LIMIT = Math.max(20, Math.min(5000, Number(process.env.GETLINK_SHEET_FETCH_LIMIT || 5000) || 5000));
const GETLINK_SHEET_BATCH_SIZE = Math.max(5, Math.min(200, Number(process.env.GETLINK_SHEET_BATCH_SIZE || 20) || 20));
const GETLINK_SHEET_CANDIDATE_BATCH = Math.max(1, Math.min(20, Number(process.env.GETLINK_SHEET_CANDIDATE_BATCH || 3) || 3));
const GETLINK_SHEET_CHECK_CONCURRENCY = Math.max(1, Math.min(10, Number(process.env.GETLINK_SHEET_CHECK_CONCURRENCY || 3) || 3));
const GETLINK_SHEET_HTTP_TIMEOUT_MS = Math.max(5000, Math.min(300000, Number(process.env.GETLINK_SHEET_HTTP_TIMEOUT_MS || 300000) || 300000));
const ALLOWED_SHEET_SLOTS = new Set(['primary', 'backup1', 'backup2']);

function httpRequest(options, body) {
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

function resolveAppsScriptUrlOrThrow(rawUrl = '') {
    return validateAppsScriptUrl(rawUrl);
}

async function getConfiguredAppsScriptUrl() {
    const adminUrl = await readSheetAppsScriptUrl();
    return resolveAppsScriptUrlOrThrow(adminUrl || ENV_GETLINK_SHEET_APPS_SCRIPT_URL);
}

async function getAppsScriptConfigStatus() {
    const adminUrl = await readSheetAppsScriptUrl();
    const rawUrl = adminUrl || ENV_GETLINK_SHEET_APPS_SCRIPT_URL;
    const source = adminUrl ? 'admin' : (ENV_GETLINK_SHEET_APPS_SCRIPT_URL ? 'env' : '');
    let resolvedUrl = '';
    let configError = '';
    if (rawUrl) {
        try {
            resolvedUrl = resolveAppsScriptUrlOrThrow(rawUrl);
        } catch (error) {
            configError = String(error && error.message ? error.message : 'Apps Script URL khong hop le.').trim();
        }
    }
    return {
        source,
        rawUrl,
        resolvedUrl,
        configured: !!resolvedUrl,
        maskedUrl: resolvedUrl ? maskAppsScriptUrl(resolvedUrl) : (rawUrl ? maskAppsScriptUrl(rawUrl) : ''),
        configError
    };
}

function maskAppsScriptUrl(rawUrl = '') {
    const text = String(rawUrl || '').trim();
    if (!text) return '';

    try {
        const parsed = new URL(text);
        const segments = String(parsed.pathname || '').split('/').filter(Boolean);
        const scriptIndex = segments.findIndex((item) => item === 's');
        if (scriptIndex >= 0 && segments[scriptIndex + 1]) {
            const scriptId = String(segments[scriptIndex + 1] || '').trim();
            const maskedId = scriptId.length <= 10
                ? scriptId
                : `${scriptId.slice(0, 5)}...${scriptId.slice(-4)}`;
            segments[scriptIndex + 1] = maskedId;
        }
        return `${parsed.origin}/${segments.join('/')}`;
    } catch (error) {
        if (text.length <= 12) return text;
        return `${text.slice(0, 8)}...${text.slice(-4)}`;
    }
}

async function probeAppsScriptHealth(rawUrl = '') {
    const startedAt = Date.now();
    try {
        const response = await requestAppsScriptJsonWithRetry(rawUrl, {
            timeoutMs: GETLINK_SHEET_HTTP_TIMEOUT_MS
        });
        return {
            ok: true,
            statusCode: response.statusCode,
            contentType: response.contentType,
            elapsedMs: Date.now() - startedAt,
            attempts: response.attempts,
            redirectSeen: response.redirectSeen === true,
            message: String(response.data && (response.data.message || response.data.error) ? (response.data.message || response.data.error) : '').trim()
        };
    } catch (error) {
        return {
            ok: false,
            statusCode: Number(error && (error.statusCode || error.httpStatus) || 0),
            contentType: String(error && error.contentType ? error.contentType : '').trim(),
            elapsedMs: Date.now() - startedAt,
            attempts: Number(error && error.attempts || 1),
            redirectSeen: error && error.redirectSeen === true,
            message: String(error && error.message ? error.message : 'Apps Script probe failed').trim()
        };
    }
}

function normalizeSheetSlots(input) {
    const source = Array.isArray(input) ? input : [];
    const seen = new Set();
    const slots = [];
    source.forEach((item) => {
        const normalized = String(item || '').trim().toLowerCase();
        if (!ALLOWED_SHEET_SLOTS.has(normalized) || seen.has(normalized)) return;
        seen.add(normalized);
        slots.push(normalized);
    });
    return slots;
}

function normalizeSheetRow(item = {}) {
    const rowNumber = Number(item && item.rowNumber);
    if (!Number.isInteger(rowNumber) || rowNumber <= 0) return null;
    return {
        rowNumber,
        cookie: sanitizeCookieRaw(item && item.cookie ? item.cookie : ''),
        mark: String(item && item.mark !== undefined && item.mark !== null ? item.mark : '').trim()
    };
}

function isSheetRowEligible(_mark = '') {
    return true;
}

function mapSheetFailReason(reason = '') {
    const normalized = String(reason || '').trim().toLowerCase();
    if (!normalized) return 'token_error';
    if (normalized === 'sbd_blocked') return 'sbd';
    if (normalized === 'missing_account_info') return 'missing_info';
    if (normalized === 'invalid_cookie') return 'invalid_cookie';
    if (normalized === 'dead') return 'dead';
    if (normalized === 'payment_hold') return 'payment_hold';
    if (normalized === 'unknown_plan') return 'unknown_plan';
    return 'token_error';
}

function getNextSheetUsageMark(mark = '') {
    const current = String(mark || '').trim();
    const count = /^\d+$/.test(current) ? Number(current) : 0;
    return String(count + 1);
}

async function callGetlinkSheetScript(action, payload = {}) {
    const response = await requestAppsScriptJsonWithRetry(
        await getConfiguredAppsScriptUrl(),
        {
            action,
            payload,
            timeoutMs: GETLINK_SHEET_HTTP_TIMEOUT_MS
        }
    );
    return response.data;
}

async function listGetlinkSheetRows(options = {}) {
    const startRow = Math.max(1, Number(options.startRow || 1) || 1);
    const limit = Math.max(1, Math.min(GETLINK_SHEET_BATCH_SIZE, Number(options.limit || GETLINK_SHEET_BATCH_SIZE) || GETLINK_SHEET_BATCH_SIZE));
    const response = await callGetlinkSheetScript('pullRows', {
        startRow,
        limit,
        ...(options.debug ? { debug: '1' } : {})
    });
    const rows = Array.isArray(response.items) ? response.items.map(normalizeSheetRow).filter(Boolean) : [];
    rows.sort((a, b) => a.rowNumber - b.rowNumber);
    return {
        rows,
        nextStartRow: Math.max(startRow, Number(response.nextStartRow || (rows.length > 0 ? rows[rows.length - 1].rowNumber + 1 : startRow)) || startRow),
        scannedUntilRow: Math.max(startRow - 1, Number(response.scannedUntilRow || (rows.length > 0 ? rows[rows.length - 1].rowNumber : startRow - 1)) || (startRow - 1)),
        hasMore: response && response.hasMore !== undefined ? Boolean(response.hasMore) : false,
        blockStartRow: Math.max(0, Number(response.blockStartRow || 0) || 0),
        blockEndRow: Math.max(0, Number(response.blockEndRow || 0) || 0),
        visibleCountInBlock: Math.max(0, Number(response.visibleCountInBlock || 0) || 0)
    };
}

function buildSheetScanDebug(rows = []) {
    const stats = {
        visibleRowsSeen: 0,
        eligibleRowsSeen: 0,
        rejectedByMark: 0,
        rejectedByEmptyCookie: 0,
        rejectedByDuplicate: 0,
        debugSamples: []
    };
    const seenCookies = new Set();

    (Array.isArray(rows) ? rows : []).forEach((row) => {
        if (!row) return;
        stats.visibleRowsSeen += 1;
        if (!row.cookie) {
            stats.rejectedByEmptyCookie += 1;
            if (stats.debugSamples.length < 8) {
                stats.debugSamples.push({
                    rowNumber: row.rowNumber,
                    hasCookie: false,
                    mark: String(row.mark || '').trim(),
                    reason: 'empty_cookie'
                });
            }
            return;
        }
        if (seenCookies.has(row.cookie)) {
            stats.rejectedByDuplicate += 1;
            if (stats.debugSamples.length < 8) {
                stats.debugSamples.push({
                    rowNumber: row.rowNumber,
                    hasCookie: true,
                    mark: String(row.mark || '').trim(),
                    reason: 'duplicate_cookie'
                });
            }
            return;
        }
        seenCookies.add(row.cookie);
        stats.eligibleRowsSeen += 1;
    });

    return stats;
}

async function updateGetlinkSheetRow(rowNumber, mark) {
    const safeRowNumber = Number(rowNumber);
    if (!Number.isInteger(safeRowNumber) || safeRowNumber <= 0) {
        const error = new Error('Apps Script update rowNumber khong hop le.');
        error.httpStatus = 500;
        throw error;
    }
    await callGetlinkSheetScript('updateRow', {
        rowNumber: safeRowNumber,
        mark: String(mark || '').trim()
    });
}

async function updateGetlinkSheetRows(updates = []) {
    const normalized = Array.isArray(updates)
        ? updates
            .map((item) => ({
                rowNumber: Number(item && item.rowNumber),
                mark: String(item && item.mark !== undefined && item.mark !== null ? item.mark : '').trim()
            }))
            .filter((item) => Number.isInteger(item.rowNumber) && item.rowNumber > 0)
        : [];

    if (normalized.length === 0) return;

    await callGetlinkSheetScript('updateRows', {
        updates: JSON.stringify(normalized)
    });
}

async function allocateCookiesFromSheetForSlots(slots = []) {
    const targetSlots = normalizeSheetSlots(slots);
    if (targetSlots.length === 0) {
        const error = new Error('Vui long chon it nhat 1 slot cookie.');
        error.httpStatus = 400;
        throw error;
    }

    const totalStartedAt = Date.now();
    const assigned = [];
    const skipped = [];
    const seenCookies = new Set();
    const timings = {
        sheetFetchMs: 0,
        cookieCheckMs: 0,
        sheetUpdateMs: 0,
        totalMs: 0
    };
    let nextStartRow = 1;
    let scannedPhysicalRows = 0;

    while (assigned.length < targetSlots.length && scannedPhysicalRows < GETLINK_SHEET_FETCH_LIMIT) {
        const fetchStartedAt = Date.now();
        const batch = await listGetlinkSheetRows({
            startRow: nextStartRow,
            limit: GETLINK_SHEET_BATCH_SIZE
        });
        timings.sheetFetchMs += Date.now() - fetchStartedAt;
        const rows = Array.isArray(batch.rows) ? batch.rows : [];
        if (rows.length === 0) break;

        const pendingUpdates = [];
        const candidateRows = [];
        for (const row of rows) {
            if (!row || !row.cookie || !isSheetRowEligible(row.mark)) continue;
            if (seenCookies.has(row.cookie)) continue;
            seenCookies.add(row.cookie);
            candidateRows.push(row);
        }

        for (let index = 0; index < candidateRows.length && assigned.length < targetSlots.length; index += GETLINK_SHEET_CHECK_CONCURRENCY) {
            const windowRows = candidateRows.slice(index, index + GETLINK_SHEET_CHECK_CONCURRENCY);
            if (windowRows.length === 0) continue;

            const checkStartedAt = Date.now();
            const windowResults = await Promise.all(windowRows.map(async (row) => ({
                row,
                cookieResult: await evaluateGetlinkCookie(row.cookie)
            })));
            timings.cookieCheckMs += Date.now() - checkStartedAt;

            for (const { row, cookieResult } of windowResults) {
                if (assigned.length >= targetSlots.length) break;

                if (!cookieResult.ok) {
                    const failReason = mapSheetFailReason(cookieResult.reason || '');
                    pendingUpdates.push({
                        rowNumber: row.rowNumber,
                        mark: failReason
                    });
                    skipped.push({
                        rowNumber: row.rowNumber,
                        reason: failReason
                    });
                    continue;
                }

                const slot = targetSlots[assigned.length];
                const nextMark = getNextSheetUsageMark(row.mark);
                pendingUpdates.push({
                    rowNumber: row.rowNumber,
                    mark: nextMark
                });
                assigned.push({
                    slot,
                    rowNumber: row.rowNumber,
                    cookie: row.cookie,
                    previousMark: String(row.mark || '').trim(),
                    newMark: nextMark,
                    result: {
                        slot,
                        ok: true,
                        error: '',
                        summary: cookieResult.summary || {},
                        accountInfo: cookieResult.accountInfo || null,
                        overloadOutcome: cookieResult.overloadOutcome || '',
                        overloadSignal: cookieResult.overloadSignal || '',
                        overloadMessage: cookieResult.overloadMessage || ''
                    }
                });
            }
        }

        if (pendingUpdates.length > 0) {
            const updateStartedAt = Date.now();
            await updateGetlinkSheetRows(pendingUpdates);
            timings.sheetUpdateMs += Date.now() - updateStartedAt;
        }
        scannedPhysicalRows += Math.max(0, Number(batch.scannedUntilRow || rows[rows.length - 1].rowNumber) - nextStartRow + 1);
        nextStartRow = Math.max(Number(batch.nextStartRow || 0) || 0, rows[rows.length - 1].rowNumber + 1);
    }

    timings.totalMs = Date.now() - totalStartedAt;
    const filledSlots = new Set(assigned.map((item) => item.slot));
    const unfilledSlots = targetSlots.filter((slot) => !filledSlots.has(slot));
    const message = `Assigned ${assigned.length} cookies, skipped ${skipped.length} failed cookies`;
    console.log('[getlink sheet import]', {
        slots: targetSlots.length,
        assigned: assigned.length,
        skipped: skipped.length,
        unfilled: unfilledSlots.length,
        timings
    });
    return {
        success: true,
        assigned,
        skipped,
        unfilledSlots,
        message,
        timings
    };
}

function getBearerToken(headers = {}) {
    const raw = String(headers.authorization || headers.Authorization || '').trim();
    if (!raw) return '';
    const match = raw.match(/^Bearer\s+(.+)$/i);
    return String(match && match[1] ? match[1] : '').trim();
}

async function lookupFirebaseUserByIdToken(idToken = '') {
    const token = String(idToken || '').trim();
    if (!token) return { ok: false, statusCode: 401, error: 'Missing bearer token' };
    if (!FIREBASE_API_KEY) return { ok: false, statusCode: 500, error: 'Firebase API key is not configured' };

    const payload = JSON.stringify({ idToken: token });
    const response = await httpRequest({
        hostname: 'identitytoolkit.googleapis.com',
        port: 443,
        path: `/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, payload);

    let parsed = {};
    try {
        parsed = JSON.parse(response.body || '{}');
    } catch (e) {
        return { ok: false, statusCode: 502, error: 'Firebase verify response parse failed' };
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
        const firebaseMessage = String(parsed && parsed.error && parsed.error.message ? parsed.error.message : '').trim();
        return {
            ok: false,
            statusCode: 401,
            error: firebaseMessage ? `Firebase token invalid: ${firebaseMessage}` : 'Firebase token invalid'
        };
    }

    const users = Array.isArray(parsed.users) ? parsed.users : [];
    const user = users[0] || null;
    const email = String(user && user.email ? user.email : '').trim().toLowerCase();
    if (!email) return { ok: false, statusCode: 401, error: 'Firebase token has no email' };
    return { ok: true, email };
}

function isAllowedAdminEmail(email = '') {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return false;
    const cfg = adminAuthConfig();
    const adminEmails = Array.isArray(cfg && cfg.adminEmails) ? cfg.adminEmails : [];
    if (adminEmails.length === 0) return false;
    return adminEmails.includes(normalized);
}

async function isRequestFromAdmin(req) {
    const token = getBearerToken(req && req.headers ? req.headers : {});
    if (!token) return false;
    const lookup = await lookupFirebaseUserByIdToken(token);
    return !!(lookup && lookup.ok && isAllowedAdminEmail(lookup.email));
}

async function ensureAdmin(req, res) {
    const token = getBearerToken(req.headers || {});
    const lookup = await lookupFirebaseUserByIdToken(token);
    if (!lookup.ok) {
        res.status(lookup.statusCode || 401).json({ error: lookup.error || 'Admin authentication required' });
        return null;
    }
    if (!isAllowedAdminEmail(lookup.email)) {
        res.status(401).json({ error: 'Email is not allowed for /getlink admin' });
        return null;
    }
    return {
        email: lookup.email,
        role: 'admin'
    };
}

function getOrigin(req) {
    const host = String((req.headers && req.headers.host) || '').trim();
    const proto = String((req.headers && (req.headers['x-forwarded-proto'] || req.headers['X-Forwarded-Proto'])) || '').trim();
    return proto && host
        ? `${proto}://${host}`
        : (host ? `http://${host}` : 'http://localhost:3005');
}

function toAdminShareDto(record, req) {
    const origin = getOrigin(req);
    const cookies = sanitizeShareCookies(record.cookies || {});
    return {
        id: record.id,
        status: record.status,
        cookieRaw: cookies.primary || '',
        cookies,
        desktopOnly: !!record.desktopOnly,
        createdAt: record.createdAt || '',
        updatedAt: record.updatedAt || '',
        revokedAt: record.revokedAt || '',
        expiresAt: record.expiresAt || '',
        note: record.note || '',
        expired: isShareExpired(record),
        shareUrl: `${origin}/getlink?s=${encodeURIComponent(record.id)}`
    };
}

async function buildCookieCheckResult(slot, cookieRaw) {
    const result = await evaluateGetlinkCookie(cookieRaw);
    return {
        slot,
        ok: !!result.ok,
        error: String(result.error || '').trim(),
        summary: result.summary || {},
        accountInfo: result.accountInfo || null,
        overloadOutcome: result.overloadOutcome || '',
        overloadSignal: result.overloadSignal || '',
        overloadMessage: result.overloadMessage || ''
    };
}

async function resolveCookiesForCheck(shareId, body = {}) {
    const directCookie = sanitizeCookieRaw(body.cookieStr || '');
    if (directCookie) {
        return {
            cookies: sanitizeShareCookies(body.cookies || {}),
            record: null,
            usedDirectCookie: true
        };
    }

    const record = await readShareById(shareId);
    if (!record) {
        const error = new Error('Share link not found');
        error.httpStatus = 404;
        throw error;
    }

    return {
        cookies: sanitizeShareCookies((body && body.cookies) || record.cookies || {}),
        record,
        usedDirectCookie: false
    };
}

module.exports = async function (req, res) {
    applyCors(req, res, 'GET,POST,PUT,OPTIONS');
    applySecurityHeaders(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const pathname = String((req.url || '').split('?')[0] || '').trim();

        if (pathname === '/api/getlink-admin/popup-warning-config' && req.method === 'GET') {
            const config = await readWarningConfig();
            const isAdminRequest = await isRequestFromAdmin(req);
            return res.status(200).json({
                success: true,
                config: isAdminRequest ? config : {
                    ...config,
                    sheetAppsScriptUrl: ''
                }
            });
        }

        if (pathname === '/api/getlink-admin/session' && req.method === 'GET') {
            const user = await ensureAdmin(req, res);
            if (!user) return;
            return res.status(200).json({ authenticated: true, user });
        }

        if (pathname === '/api/getlink-admin/login' && req.method === 'POST') {
            const body = parseBody(req.body);
            const idToken = String(body.idToken || '').trim();
            const lookup = await lookupFirebaseUserByIdToken(idToken);
            if (!lookup.ok) {
                return res.status(lookup.statusCode || 401).json({ error: lookup.error || 'Firebase verify failed' });
            }
            if (!isAllowedAdminEmail(lookup.email)) {
                return res.status(401).json({ error: 'Email is not allowed for /getlink admin' });
            }
            return res.status(200).json({ success: true, user: { email: lookup.email, role: 'admin' } });
        }

        if (pathname === '/api/getlink-admin/logout' && req.method === 'POST') {
            return res.status(200).json({ success: true });
        }

        const adminUser = await ensureAdmin(req, res);
        if (!adminUser) return;

        if (pathname === '/api/getlink-admin/popup-warning-config' && req.method === 'PUT') {
            const body = parseBody(req.body);
            const config = await saveWarningConfig(body);
            return res.status(200).json({
                success: true,
                config,
                updatedBy: String(adminUser && adminUser.email ? adminUser.email : '').trim()
            });
        }

        if (pathname === '/api/getlink-admin/debug/sheet-config' && req.method === 'GET') {
            const enabled = await isSheetAccessEnabled();
            const sheetConfig = await getAppsScriptConfigStatus();
            const scriptProbe = enabled && sheetConfig.configured
                ? await probeAppsScriptHealth(sheetConfig.resolvedUrl)
                : null;
            return res.status(200).json({
                success: true,
                enabled,
                configured: sheetConfig.configured,
                source: sheetConfig.source,
                maskedUrl: sheetConfig.maskedUrl,
                configError: sheetConfig.configError,
                timeoutMs: GETLINK_SHEET_HTTP_TIMEOUT_MS,
                candidateBatch: GETLINK_SHEET_CANDIDATE_BATCH,
                scriptProbe
            });
        }

        if (pathname === '/api/getlink-admin/debug/sheet-scan' && req.method === 'GET') {
            const enabled = await isSheetAccessEnabled();
            const sheetConfig = await getAppsScriptConfigStatus();
            if (!enabled) {
                return res.status(200).json({
                    success: true,
                    enabled: false,
                    configured: sheetConfig.configured,
                    source: sheetConfig.source,
                    maskedUrl: sheetConfig.maskedUrl,
                    configError: sheetConfig.configError,
                    startRow: 1,
                    limit: 0,
                    nextStartRow: null,
                    scannedUntilRow: 0,
                    hasMore: false,
                    blockStartRow: 0,
                    blockEndRow: 0,
                    visibleCountInBlock: 0,
                    rows: [],
                    stats: buildSheetScanDebug([]),
                    message: 'Truy cap Google Sheet dang duoc tat trong admin.'
                });
            }
            const parsedUrl = new URL(req.url, 'http://localhost');
            const startRow = Math.max(1, Number(parsedUrl.searchParams.get('startRow') || 1) || 1);
            const limit = Math.max(1, Math.min(GETLINK_SHEET_BATCH_SIZE, Number(parsedUrl.searchParams.get('limit') || GETLINK_SHEET_CANDIDATE_BATCH) || GETLINK_SHEET_CANDIDATE_BATCH));
            const batch = await listGetlinkSheetRows({
                startRow,
                limit,
                debug: true
            });
            const stats = buildSheetScanDebug(batch.rows);
            return res.status(200).json({
                success: true,
                enabled: true,
                configured: sheetConfig.configured,
                source: sheetConfig.source,
                maskedUrl: sheetConfig.maskedUrl,
                configError: sheetConfig.configError,
                startRow,
                limit,
                nextStartRow: batch.nextStartRow,
                scannedUntilRow: batch.scannedUntilRow,
                hasMore: batch.hasMore,
                blockStartRow: batch.blockStartRow,
                blockEndRow: batch.blockEndRow,
                visibleCountInBlock: batch.visibleCountInBlock,
                rows: batch.rows,
                stats
            });
        }

        if (pathname === '/api/getlink-admin/sheet-cookie-import' && req.method === 'POST') {
            if (!(await isSheetAccessEnabled())) {
                return res.status(403).json({ error: 'Truy cap Google Sheet dang duoc tat trong admin.' });
            }
            const body = parseBody(req.body);
            const slots = normalizeSheetSlots(body && body.slots);
            const operation = await createSheetImportOperation(slots, String(body && body.scope ? body.scope : '').trim());
            const advanced = await advanceGetlinkOperation(operation);
            const payload = shapeOperationPayload(advanced);
            if (advanced.status === 'failed') {
                return res.status(422).json({
                    ...payload,
                    error: String(advanced.lastError || advanced.message || 'Khong nhap duoc cookie tu Sheet.').trim() || 'Khong nhap duoc cookie tu Sheet.'
                });
            }
            return res.status(200).json(payload);
        }

        const historyMatch = pathname.match(/^\/api\/getlink-admin\/shares\/([^/]+)\/fix-history$/);
        if (historyMatch && req.method === 'GET') {
            const shareId = decodeURIComponent(historyMatch[1] || '');
            if (!isValidShareId(shareId)) return res.status(400).json({ error: 'Invalid share id' });
            const parsedUrl = new URL(req.url, 'http://localhost');
            const sort = String(parsedUrl.searchParams.get('sort') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
            const history = await listSuccessfulFixHistory(shareId, sort);
            return res.status(200).json({
                success: true,
                shareId,
                ...history
            });
        }

        const resetFixLimitMatch = pathname.match(/^\/api\/getlink-admin\/shares\/([^/]+)\/fix-limit-reset$/);
        if (resetFixLimitMatch && req.method === 'POST') {
            const shareId = decodeURIComponent(resetFixLimitMatch[1] || '');
            if (!isValidShareId(shareId)) return res.status(400).json({ error: 'Invalid share id' });
            const record = await readShareById(shareId);
            if (!record) return res.status(404).json({ error: 'Share link not found' });
            const reset = await resetFixLimit(shareId, adminUser.email);
            const limit = await getFixLimitState(shareId);
            return res.status(200).json({
                success: true,
                shareId,
                reset,
                limit
            });
        }

        if (pathname === '/api/getlink-admin/search' && req.method === 'POST') {
            const body = parseBody(req.body);
            const query = String(body.query || '').trim();
            const shareId = extractShareIdFromQuery(query);
            if (!shareId) return res.status(400).json({ error: 'Invalid share id or URL' });
            const record = await readShareById(shareId);
            if (!record) return res.status(404).json({ error: 'Share link not found' });
            return res.status(200).json({ success: true, share: toAdminShareDto(record, req) });
        }

        const updateMatch = pathname.match(/^\/api\/getlink-admin\/shares\/([^/]+)$/);
        if (updateMatch && req.method === 'PUT') {
            const shareId = decodeURIComponent(updateMatch[1] || '');
            if (!isValidShareId(shareId)) return res.status(400).json({ error: 'Invalid share id' });

            const body = parseBody(req.body);
            let updated = null;
            if (body && (typeof body.cookies === 'object' || Object.prototype.hasOwnProperty.call(body, 'note'))) {
                const updateOptions = {};
                if (typeof body.cookies === 'object') updateOptions.cookies = sanitizeShareCookies(body.cookies || {});
                if (Object.prototype.hasOwnProperty.call(body, 'note')) updateOptions.note = body.note;
                updated = await updateShareAdminFields(shareId, updateOptions, adminUser.email);
            } else {
                const cookieStr = sanitizeCookieRaw(body.cookieStr || '');
                updated = await updateShareCookie(shareId, cookieStr, adminUser.email);
            }
            return res.status(200).json({ success: true, share: toAdminShareDto(updated, req) });
        }

        const checkCookieMatch = pathname.match(/^\/api\/getlink-admin\/shares\/([^/]+)\/check-cookie$/);
        if (checkCookieMatch && req.method === 'POST') {
            const shareId = decodeURIComponent(checkCookieMatch[1] || '');
            if (!isValidShareId(shareId)) return res.status(400).json({ error: 'Invalid share id' });
            const body = parseBody(req.body);
            const slot = String(body.slot || '').trim();
            const { cookies } = await resolveCookiesForCheck(shareId, body);
            const cookieRaw = sanitizeCookieRaw(body.cookieStr || cookies[slot] || '');
            const result = await buildCookieCheckResult(slot, cookieRaw);
            return res.status(200).json({ success: true, result });
        }

        const checkAllMatch = pathname.match(/^\/api\/getlink-admin\/shares\/([^/]+)\/check-all$/);
        if (checkAllMatch && req.method === 'POST') {
            const shareId = decodeURIComponent(checkAllMatch[1] || '');
            if (!isValidShareId(shareId)) return res.status(400).json({ error: 'Invalid share id' });
            const body = parseBody(req.body);
            const { cookies } = await resolveCookiesForCheck(shareId, body);
            const results = await Promise.all(['primary', 'backup1', 'backup2'].map((slot) => {
                return buildCookieCheckResult(slot, cookies[slot] || '');
            }));
            return res.status(200).json({ success: true, results });
        }

        const expiryMatch = pathname.match(/^\/api\/getlink-admin\/shares\/([^/]+)\/expiry$/);
        if (expiryMatch && req.method === 'PUT') {
            const shareId = decodeURIComponent(expiryMatch[1] || '');
            if (!isValidShareId(shareId)) return res.status(400).json({ error: 'Invalid share id' });

            const body = parseBody(req.body);
            const updated = await setShareExpiry(shareId, {
                expiresAt: body.expiresAt,
                addDays: body.addDays
            }, adminUser.email);
            return res.status(200).json({ success: true, share: toAdminShareDto(updated, req) });
        }

        const revokeMatch = pathname.match(/^\/api\/getlink-admin\/shares\/([^/]+)\/revoke$/);
        if (revokeMatch && req.method === 'POST') {
            const shareId = decodeURIComponent(revokeMatch[1] || '');
            if (!isValidShareId(shareId)) return res.status(400).json({ error: 'Invalid share id' });
            const updated = await setShareStatus(shareId, 'revoked', adminUser.email);
            return res.status(200).json({ success: true, share: toAdminShareDto(updated, req) });
        }

        const restoreMatch = pathname.match(/^\/api\/getlink-admin\/shares\/([^/]+)\/restore$/);
        if (restoreMatch && req.method === 'POST') {
            const shareId = decodeURIComponent(restoreMatch[1] || '');
            if (!isValidShareId(shareId)) return res.status(400).json({ error: 'Invalid share id' });
            const updated = await setShareStatus(shareId, 'active', adminUser.email);
            return res.status(200).json({ success: true, share: toAdminShareDto(updated, req) });
        }

        const rotateMatch = pathname.match(/^\/api\/getlink-admin\/shares\/([^/]+)\/rotate-id$/);
        if (rotateMatch && req.method === 'POST') {
            const shareId = decodeURIComponent(rotateMatch[1] || '');
            if (!isValidShareId(shareId)) return res.status(400).json({ error: 'Invalid share id' });
            const rotated = await rotateShareId(shareId, adminUser.email);
            return res.status(200).json({
                success: true,
                oldId: rotated.oldId,
                newId: rotated.newId,
                shareUrl: toAdminShareDto(rotated.share, req).shareUrl,
                share: toAdminShareDto(rotated.share, req)
            });
        }

        return res.status(404).json({ error: 'Not found' });
    } catch (error) {
        return res.status(error.httpStatus || 500).json({ error: error.message || 'Internal server error' });
    }
};
