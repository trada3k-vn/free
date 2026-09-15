const https = require('https');
const crypto = require('crypto');
const { evaluateGetlinkCookie } = require('./_getlink-cookie-health');
const { sanitizeCookieRaw } = require('./_getlink-share-store');

const FIREBASE_PROJECT_ID = 'trada3k-c402a';
const FIREBASE_API_KEY = 'AIzaSyAVV-3HxGFpT_eiAri1SGPWGwu3EL8On58';
const COLL_GETLINK_COOKIE_POOL = 'settings/getlink_cookie_pool/items';
const DOC_GETLINK_COOKIE_POOL_CONFIG = 'settings/getlink_cookie_pool';
const MAX_POOL_LIST_LIMIT = 500;
const CHECK_CONCURRENCY = 3;
const DEFAULT_COLUMN_ORDER = [
    'cookie',
    'status',
    'reason',
    'plan',
    'planNew',
    'country',
    'paymentHold',
    'profiles',
    'maxStreams',
    'maxStreamsNew',
    'videoQuality',
    'overloadOutcome',
    'overloadSignal',
    'lastCheckedAt',
    'checkCount',
    'mark',
    'note',
    'usedCount',
    'lastUsedAt',
    'lastUsedSlot',
    'lastUsedScope',
    'actions'
];

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
    const params = new URLSearchParams();
    Object.entries(query || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    const suffix = params.toString();
    return `/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collectionPath}${suffix ? `?${suffix}&key=${FIREBASE_API_KEY}` : `?key=${FIREBASE_API_KEY}`}`;
}

function buildPoolDocPath(itemId = '') {
    return `${COLL_GETLINK_COOKIE_POOL}/${encodeURIComponent(String(itemId || '').trim())}`;
}

function toStringValue(value = '') {
    return { stringValue: String(value || '') };
}

function toIntegerValue(value = 0) {
    return { integerValue: String(Math.max(0, Number(value || 0) || 0)) };
}

function parseFirestoreString(valueObj = null) {
    if (!valueObj || typeof valueObj !== 'object') return '';
    if (typeof valueObj.stringValue === 'string') return valueObj.stringValue;
    if (typeof valueObj.integerValue === 'string') return valueObj.integerValue;
    return '';
}

function parseFirestoreInteger(valueObj = null) {
    const raw = parseFirestoreString(valueObj);
    return Math.max(0, Number(raw || 0) || 0);
}

function parseJsonText(value = '', fallback = null) {
    try {
        const parsed = JSON.parse(String(value || ''));
        return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_error) {
        return fallback;
    }
}

function makePoolItemId(cookie = '') {
    return crypto.createHash('sha1').update(sanitizeCookieRaw(cookie)).digest('hex').slice(0, 24);
}

function normalizePoolStatus(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'pass' || normalized === 'live' || normalized === 'ok') return 'pass';
    if (normalized === 'die' || normalized === 'dead' || normalized === 'fail') return 'die';
    if (normalized === 'checking') return 'checking';
    return normalized || 'new';
}

const SELECTION_OPERATORS = new Set([
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'greater_than',
    'greater_or_equal',
    'less_than',
    'less_or_equal'
]);

function normalizeSelectionRules(input = {}) {
    const source = input && typeof input === 'object' ? input : {};
    const groups = (Array.isArray(source.groups) ? source.groups : []).map((group) => ({
        conditions: (Array.isArray(group && group.conditions) ? group.conditions : []).map((condition) => ({
            field: String(condition && condition.field ? condition.field : '').trim(),
            operator: SELECTION_OPERATORS.has(String(condition && condition.operator || '').trim())
                ? String(condition.operator).trim()
                : 'equals',
            value: String(condition && condition.value !== undefined && condition.value !== null ? condition.value : '').trim()
        })).filter((condition) => condition.field)
    })).filter((group) => group.conditions.length > 0);
    return { groups };
}

function getPoolFieldValue(item = {}, field = '') {
    const key = String(field || '').trim();
    if (key.startsWith('custom:')) {
        return item.customFields && typeof item.customFields === 'object'
            ? item.customFields[key.slice('custom:'.length)]
            : '';
    }
    return item[key];
}

function compareSelectionValue(actualValue = '', operator = 'equals', expectedValue = '') {
    const actual = String(actualValue === undefined || actualValue === null ? '' : actualValue).trim().toLowerCase();
    const expected = String(expectedValue === undefined || expectedValue === null ? '' : expectedValue).trim().toLowerCase();
    if (operator === 'equals') return actual === expected;
    if (operator === 'not_equals') return actual !== expected;
    if (operator === 'contains') return actual.includes(expected);
    if (operator === 'not_contains') return !actual.includes(expected);
    if (operator === 'starts_with') return actual.startsWith(expected);
    if (operator === 'ends_with') return actual.endsWith(expected);
    const actualNumber = Number(actual);
    const expectedNumber = Number(expected);
    if (!Number.isFinite(actualNumber) || !Number.isFinite(expectedNumber)) return false;
    if (operator === 'greater_than') return actualNumber > expectedNumber;
    if (operator === 'greater_or_equal') return actualNumber >= expectedNumber;
    if (operator === 'less_than') return actualNumber < expectedNumber;
    if (operator === 'less_or_equal') return actualNumber <= expectedNumber;
    return false;
}

function matchesSelectionRules(item = {}, rules = {}) {
    if (String(item.status || '').trim().toLowerCase() !== 'pass') return false;
    const normalized = normalizeSelectionRules(rules);
    return normalized.groups.every((group) => group.conditions.some((condition) => compareSelectionValue(
        getPoolFieldValue(item, condition.field),
        condition.operator,
        condition.value
    )));
}

function normalizeCustomFieldKey(value = '') {
    const raw = String(value || '').trim().toLowerCase();
    const key = raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 40);
    return key || `col_${crypto.randomBytes(3).toString('hex')}`;
}

function normalizeCustomFields(value = {}) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const next = {};
    Object.entries(source).forEach(([key, fieldValue]) => {
        const normalizedKey = normalizeCustomFieldKey(key);
        next[normalizedKey] = String(fieldValue || '').trim();
    });
    return next;
}

function normalizePoolItem(input = {}) {
    const source = input && typeof input === 'object' ? input : {};
    const cookie = sanitizeCookieRaw(source.cookie || source.cookieRaw || '');
    const now = new Date().toISOString();
    return {
        id: cookie ? makePoolItemId(cookie) : String(source.id || '').trim(),
        cookie,
        status: normalizePoolStatus(source.status),
        reason: String(source.reason || '').trim(),
        mark: String(source.mark || '').trim(),
        plan: String(source.plan || '').trim(),
        planNew: String(source.planNew || '').trim(),
        country: String(source.country || '').trim(),
        paymentHold: String(source.paymentHold || '').trim(),
        profiles: String(source.profiles || '').trim(),
        maxStreams: String(source.maxStreams || '').trim(),
        maxStreamsNew: String(source.maxStreamsNew || '').trim(),
        videoQuality: String(source.videoQuality || '').trim(),
        overloadOutcome: String(source.overloadOutcome || '').trim(),
        overloadSignal: String(source.overloadSignal || '').trim(),
        lastCheckedAt: String(source.lastCheckedAt || '').trim(),
        checkCount: Math.max(0, Number(source.checkCount || 0) || 0),
        usedCount: Math.max(0, Number(source.usedCount || 0) || 0),
        lastUsedAt: String(source.lastUsedAt || '').trim(),
        lastUsedSlot: String(source.lastUsedSlot || '').trim(),
        lastUsedScope: String(source.lastUsedScope || '').trim(),
        note: String(source.note || '').trim(),
        customFields: normalizeCustomFields(source.customFields),
        customLabels: normalizeCustomFields(source.customLabels),
        createdAt: String(source.createdAt || now).trim(),
        updatedAt: String(source.updatedAt || '').trim()
    };
}

function normalizeCookiePoolConfig(input = {}) {
    const source = input && typeof input === 'object' ? input : {};
    const seen = new Set();
    const customColumns = (Array.isArray(source.customColumns) ? source.customColumns : []).map((column) => {
        const key = normalizeCustomFieldKey(column && column.key);
        const label = String(column && column.label ? column.label : key).trim().slice(0, 60) || key;
        return { key, label };
    }).filter((column) => {
        if (!column.key || seen.has(column.key)) return false;
        seen.add(column.key);
        return true;
    });
    const customKeys = new Set(customColumns.map((column) => `custom:${column.key}`));
    const allowedOrder = new Set([...DEFAULT_COLUMN_ORDER, ...customKeys]);
    const columnOrder = [];
    (Array.isArray(source.columnOrder) ? source.columnOrder : DEFAULT_COLUMN_ORDER).forEach((key) => {
        const normalized = String(key || '').trim();
        if (allowedOrder.has(normalized) && !columnOrder.includes(normalized)) columnOrder.push(normalized);
    });
    DEFAULT_COLUMN_ORDER.forEach((key) => {
        if (!columnOrder.includes(key)) columnOrder.push(key);
    });
    customColumns.forEach((column) => {
        const key = `custom:${column.key}`;
        if (!columnOrder.includes(key)) {
            const actionIndex = columnOrder.indexOf('actions');
            if (actionIndex >= 0) columnOrder.splice(actionIndex, 0, key);
            else columnOrder.push(key);
        }
    });
    const hiddenColumns = Array.from(new Set(
        (Array.isArray(source.hiddenColumns) ? source.hiddenColumns : [])
            .map((key) => String(key || '').trim())
            .filter((key) => allowedOrder.has(key) && key !== 'actions')
    ));
    return {
        customColumns,
        columnOrder,
        hiddenColumns,
        selectionRules: normalizeSelectionRules(source.selectionRules)
    };
}

function mapPoolFieldsToRecord(fields = {}, fallbackId = '') {
    const metadata = parseJsonText(parseFirestoreString(fields.metadataJson), {});
    return normalizePoolItem({
        id: parseFirestoreString(fields.id) || fallbackId,
        cookie: parseFirestoreString(fields.cookie),
        status: parseFirestoreString(fields.status),
        reason: parseFirestoreString(fields.reason),
        mark: parseFirestoreString(fields.mark),
        plan: parseFirestoreString(fields.plan),
        planNew: parseFirestoreString(fields.planNew),
        country: parseFirestoreString(fields.country),
        paymentHold: parseFirestoreString(fields.paymentHold),
        profiles: parseFirestoreString(fields.profiles),
        maxStreams: parseFirestoreString(fields.maxStreams),
        maxStreamsNew: parseFirestoreString(fields.maxStreamsNew),
        videoQuality: parseFirestoreString(fields.videoQuality),
        overloadOutcome: parseFirestoreString(fields.overloadOutcome),
        overloadSignal: parseFirestoreString(fields.overloadSignal),
        lastCheckedAt: parseFirestoreString(fields.lastCheckedAt),
        checkCount: parseFirestoreInteger(fields.checkCount),
        usedCount: parseFirestoreInteger(fields.usedCount),
        lastUsedAt: parseFirestoreString(fields.lastUsedAt),
        lastUsedSlot: parseFirestoreString(fields.lastUsedSlot),
        lastUsedScope: parseFirestoreString(fields.lastUsedScope),
        note: parseFirestoreString(fields.note),
        customFields: parseJsonText(parseFirestoreString(fields.customFieldsJson), {}),
        createdAt: parseFirestoreString(fields.createdAt),
        updatedAt: parseFirestoreString(fields.updatedAt),
        ...(metadata || {})
    });
}

function mapPoolRecordToFields(record = {}) {
    const item = normalizePoolItem(record);
    return {
        id: toStringValue(item.id),
        cookie: toStringValue(item.cookie),
        status: toStringValue(item.status),
        reason: toStringValue(item.reason),
        mark: toStringValue(item.mark),
        plan: toStringValue(item.plan),
        planNew: toStringValue(item.planNew),
        country: toStringValue(item.country),
        paymentHold: toStringValue(item.paymentHold),
        profiles: toStringValue(item.profiles),
        maxStreams: toStringValue(item.maxStreams),
        maxStreamsNew: toStringValue(item.maxStreamsNew),
        videoQuality: toStringValue(item.videoQuality),
        overloadOutcome: toStringValue(item.overloadOutcome),
        overloadSignal: toStringValue(item.overloadSignal),
        lastCheckedAt: toStringValue(item.lastCheckedAt),
        checkCount: toIntegerValue(item.checkCount),
        usedCount: toIntegerValue(item.usedCount),
        lastUsedAt: toStringValue(item.lastUsedAt),
        lastUsedSlot: toStringValue(item.lastUsedSlot),
        lastUsedScope: toStringValue(item.lastUsedScope),
        note: toStringValue(item.note),
        customFieldsJson: toStringValue(JSON.stringify(item.customFields || {})),
        createdAt: toStringValue(item.createdAt),
        updatedAt: toStringValue(item.updatedAt),
        metadataJson: toStringValue(JSON.stringify({}))
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
        const err = new Error('Failed to read getlink cookie pool');
        err.httpStatus = response.statusCode || 500;
        throw err;
    }
    try {
        return JSON.parse(response.body || '{}');
    } catch (_error) {
        return null;
    }
}

async function listCollection(collectionPath, limit = MAX_POOL_LIST_LIMIT) {
    const response = await httpRequest({
        hostname: 'firestore.googleapis.com',
        port: 443,
        path: firestoreCollectionPath(collectionPath, { pageSize: Math.max(1, Math.min(MAX_POOL_LIST_LIMIT, Number(limit || MAX_POOL_LIST_LIMIT) || MAX_POOL_LIST_LIMIT)) }),
        method: 'GET'
    });
    if (response.statusCode === 404) return [];
    if (response.statusCode < 200 || response.statusCode >= 300) {
        const err = new Error('Failed to list getlink cookie pool');
        err.httpStatus = response.statusCode || 500;
        throw err;
    }
    let parsed = {};
    try {
        parsed = JSON.parse(response.body || '{}');
    } catch (_error) {
        parsed = {};
    }
    return Array.isArray(parsed.documents) ? parsed.documents : [];
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
        const err = new Error('Failed to save getlink cookie pool item');
        err.httpStatus = response.statusCode || 500;
        throw err;
    }
}

async function deleteDoc(docPath) {
    const response = await httpRequest({
        hostname: 'firestore.googleapis.com',
        port: 443,
        path: firestoreDocPath(docPath),
        method: 'DELETE'
    });
    if (response.statusCode !== 404 && (response.statusCode < 200 || response.statusCode >= 300)) {
        const err = new Error('Failed to delete getlink cookie pool item');
        err.httpStatus = response.statusCode || 500;
        throw err;
    }
}

function getDocIdFromName(name = '') {
    const parts = String(name || '').split('/');
    return decodeURIComponent(parts[parts.length - 1] || '');
}

async function listCookiePoolItems(options = {}) {
    const limit = Math.max(1, Math.min(MAX_POOL_LIST_LIMIT, Number(options.limit || MAX_POOL_LIST_LIMIT) || MAX_POOL_LIST_LIMIT));
    const docs = await listCollection(COLL_GETLINK_COOKIE_POOL, limit);
    const items = docs.map((doc) => mapPoolFieldsToRecord(doc.fields || {}, getDocIdFromName(doc.name))).filter((item) => item.id && item.cookie);
    items.sort((a, b) => {
        if (a.status === 'pass' && b.status !== 'pass') return -1;
        if (a.status !== 'pass' && b.status === 'pass') return 1;
        if (a.usedCount !== b.usedCount) return a.usedCount - b.usedCount;
        return String(a.lastUsedAt || '').localeCompare(String(b.lastUsedAt || ''));
    });
    return items;
}

async function readCookiePoolItemById(id = '') {
    const itemId = String(id || '').trim();
    if (!itemId) return null;
    const doc = await readDoc(buildPoolDocPath(itemId));
    if (!doc || !doc.fields) return null;
    return mapPoolFieldsToRecord(doc.fields || {}, itemId);
}

async function readCookiePoolConfig() {
    const doc = await readDoc(DOC_GETLINK_COOKIE_POOL_CONFIG);
    if (!doc || !doc.fields) return normalizeCookiePoolConfig({});
    return normalizeCookiePoolConfig(parseJsonText(parseFirestoreString(doc.fields.configJson), {}));
}

async function saveCookiePoolConfig(input = {}) {
    const config = normalizeCookiePoolConfig(input);
    await patchDoc(DOC_GETLINK_COOKIE_POOL_CONFIG, {
        configJson: toStringValue(JSON.stringify(config)),
        updatedAt: toStringValue(new Date().toISOString())
    });
    return config;
}

async function saveCookiePoolItem(input = {}, options = {}) {
    const previousId = String(options && options.previousId ? options.previousId : '').trim();
    const previous = previousId ? await readCookiePoolItemById(previousId) : null;
    const item = normalizePoolItem({
        ...(previous || {}),
        ...input,
        customFields: {
            ...((previous && previous.customFields) || {}),
            ...((input && input.customFields) || {})
        }
    });
    if (!item.cookie) {
        const err = new Error('Cookie khong duoc de trong.');
        err.httpStatus = 400;
        throw err;
    }
    const existing = await readCookiePoolItemById(item.id);
    if (previousId && previousId !== item.id && existing) {
        const err = new Error('Cookie nay da ton tai trong kho.');
        err.httpStatus = 409;
        throw err;
    }
    const next = normalizePoolItem({
        ...(existing || {}),
        ...item,
        id: item.id,
        createdAt: existing && existing.createdAt ? existing.createdAt : item.createdAt,
        updatedAt: new Date().toISOString()
    });
    await patchDoc(buildPoolDocPath(next.id), mapPoolRecordToFields(next));
    if (previousId && previousId !== next.id) await deleteCookiePoolItem(previousId);
    return next;
}

async function deleteCookiePoolItem(id = '') {
    await deleteDoc(buildPoolDocPath(id));
}

function normalizeImportRows(rows = []) {
    const source = Array.isArray(rows) ? rows : [];
    const mapped = [];
    source.forEach((row) => {
        if (Array.isArray(row)) {
            mapped.push({
                cookie: row[0],
                mark: row[1],
                note: row[2]
            });
            return;
        }
        if (row && typeof row === 'object') mapped.push(row);
    });
    return mapped.map(normalizePoolItem).filter((item) => item.cookie);
}

async function importCookiePoolRows(rows = [], options = {}) {
    const normalized = normalizeImportRows(rows);
    const config = await readCookiePoolConfig();
    const knownCustom = new Map(config.customColumns.map((column) => [column.key, column]));
    const skipExisting = !!(options && options.skipExisting);
    const seen = new Set();
    const saved = [];
    let duplicates = 0;
    for (const item of normalized) {
        if (seen.has(item.id)) {
            duplicates += 1;
            continue;
        }
        seen.add(item.id);
        const existing = await readCookiePoolItemById(item.id);
        if (existing) {
            duplicates += 1;
            if (skipExisting) continue;
        }
        Object.keys(item.customFields || {}).forEach((key) => {
            if (!knownCustom.has(key)) {
                knownCustom.set(key, { key, label: item.customLabels && item.customLabels[key] ? item.customLabels[key] : key });
            }
        });
        saved.push(await saveCookiePoolItem({
            ...(existing || {}),
            ...item,
            customFields: {
                ...((existing && existing.customFields) || {}),
                ...(item.customFields || {})
            },
            usedCount: existing ? existing.usedCount : item.usedCount,
            lastUsedAt: existing ? existing.lastUsedAt : item.lastUsedAt,
            lastCheckedAt: existing ? existing.lastCheckedAt : item.lastCheckedAt,
            status: item.status === 'new' && existing ? existing.status : item.status
        }));
    }
    const nextConfig = await saveCookiePoolConfig({
        ...config,
        customColumns: Array.from(knownCustom.values()),
        columnOrder: config.columnOrder,
        hiddenColumns: config.hiddenColumns
    });
    return { saved, duplicates, config: nextConfig };
}

function applyCheckResultToItem(item = {}, result = null) {
    const summary = result && result.summary && typeof result.summary === 'object' ? result.summary : {};
    const previousCheckCount = Math.max(0, Number(item.checkCount || 0) || 0);
    const nextCheckCount = previousCheckCount + 1;
    const nextPlan = String(summary.plan || '').trim();
    const nextMaxStreams = String(summary.maxStreams || '').trim();
    return normalizePoolItem({
        ...item,
        status: result && result.ok ? 'pass' : 'die',
        reason: String(result && result.reason ? result.reason : '').trim(),
        plan: previousCheckCount === 0 && nextPlan ? nextPlan : item.plan,
        planNew: previousCheckCount >= 1 && nextPlan ? nextPlan : item.planNew,
        country: summary.country || '',
        paymentHold: summary.paymentHold || '',
        profiles: summary.profiles || '',
        maxStreams: previousCheckCount === 0 && nextMaxStreams ? nextMaxStreams : item.maxStreams,
        maxStreamsNew: previousCheckCount >= 1 && nextMaxStreams ? nextMaxStreams : item.maxStreamsNew,
        videoQuality: summary.videoQuality || '',
        overloadOutcome: String(result && result.overloadOutcome ? result.overloadOutcome : '').trim(),
        overloadSignal: String(result && result.overloadSignal ? result.overloadSignal : '').trim(),
        lastCheckedAt: new Date().toISOString(),
        checkCount: nextCheckCount
    });
}

async function checkCookiePoolItems(ids = []) {
    const all = await listCookiePoolItems();
    const wanted = new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || '').trim()).filter(Boolean));
    const items = wanted.size > 0 ? all.filter((item) => wanted.has(item.id)) : all;
    const checked = [];
    for (let index = 0; index < items.length; index += CHECK_CONCURRENCY) {
        const windowItems = items.slice(index, index + CHECK_CONCURRENCY);
        const results = await Promise.all(windowItems.map(async (item) => {
            const result = await evaluateGetlinkCookie(item.cookie);
            return applyCheckResultToItem(item, result);
        }));
        for (const item of results) {
            checked.push(await saveCookiePoolItem(item));
        }
    }
    return checked;
}

async function allocatePassCookiesFromPool(options = {}) {
    const slots = Array.isArray(options.slots) ? options.slots.map((slot) => String(slot || '').trim()).filter(Boolean) : [];
    const excluded = new Set((Array.isArray(options.excludeCookies) ? options.excludeCookies : []).map((value) => sanitizeCookieRaw(value)).filter(Boolean));
    const usageScope = String(options.usageScope || '').trim();
    const config = await readCookiePoolConfig();
    const items = (await listCookiePoolItems()).filter((item) => item.cookie && !excluded.has(item.cookie));
    items.sort((a, b) => {
        if (a.usedCount !== b.usedCount) return a.usedCount - b.usedCount;
        return String(a.lastUsedAt || '').localeCompare(String(b.lastUsedAt || ''));
    });
    const eligible = [];
    for (let index = 0; index < items.length && eligible.length < slots.length; index += CHECK_CONCURRENCY) {
        const batch = items.slice(index, index + CHECK_CONCURRENCY);
        const results = await Promise.all(batch.map(async (item) => {
            const result = await evaluateGetlinkCookie(item.cookie, { forceRefresh: true });
            const checked = await saveCookiePoolItem(applyCheckResultToItem(item, result));
            return {
                item: checked,
                result,
                eligible: checked.status === 'pass' && matchesSelectionRules(checked, config.selectionRules)
            };
        }));
        results.forEach((entry) => {
            if (entry.eligible && eligible.length < slots.length) eligible.push(entry.item);
        });
    }
    const picked = eligible.slice(0, slots.length);
    if (picked.length < slots.length) {
        const empty = [];
        empty.availableCount = picked.length;
        return empty;
    }
    const now = new Date().toISOString();
    const assigned = [];
    for (let index = 0; index < picked.length; index += 1) {
        const item = picked[index];
        const slot = slots[index];
        const updated = await saveCookiePoolItem({
            ...item,
            usedCount: item.usedCount + 1,
            lastUsedAt: now,
            lastUsedSlot: slot,
            lastUsedScope: usageScope,
            mark: String(item.mark || '').trim() || 'used'
        });
        assigned.push({
            slot,
            rowNumber: index + 1,
            cookie: updated.cookie,
            previousMark: item.mark || '',
            newMark: updated.mark || '',
            result: {
                slot,
                ok: true,
                error: '',
                summary: {
                    plan: updated.plan,
                    country: updated.country,
                    paymentHold: updated.paymentHold,
                    profiles: updated.profiles,
                    maxStreams: updated.maxStreams,
                    videoQuality: updated.videoQuality
                },
                accountInfo: null,
                overloadOutcome: updated.overloadOutcome || '',
                overloadSignal: updated.overloadSignal || '',
                overloadMessage: ''
            }
        });
    }
    assigned.availableCount = eligible.length;
    return assigned;
}

module.exports = {
    COLL_GETLINK_COOKIE_POOL,
    DOC_GETLINK_COOKIE_POOL_CONFIG,
    DEFAULT_COLUMN_ORDER,
    normalizePoolItem,
    normalizeCookiePoolConfig,
    normalizeSelectionRules,
    matchesSelectionRules,
    listCookiePoolItems,
    readCookiePoolItemById,
    readCookiePoolConfig,
    saveCookiePoolConfig,
    saveCookiePoolItem,
    deleteCookiePoolItem,
    importCookiePoolRows,
    checkCookiePoolItems,
    allocatePassCookiesFromPool
};
