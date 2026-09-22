const https = require('https');

const FIREBASE_PROJECT_ID = 'trada3k-c402a';
const FIREBASE_API_KEY = 'AIzaSyAVV-3HxGFpT_eiAri1SGPWGwu3EL8On58';
const GETLINK_WARNING_CONFIG_DOC = 'settings/getlink_warning_config';
const DEFAULT_SHEET_ACCESS_ENABLED = true;
const DEFAULT_WARNING_CONFIG = {
    message: 'Hiện tại gói xài chung này đang lỗi và rất thiếu ổn định, hãy cân nhắc nhắn vào page để chuyển đổi sang loại xài riêng mới (Ô riên,g mã pin riêng...) nhé!',
    submessage: 'Chỉ chênh 9K so với giá cũ'
};
DEFAULT_WARNING_CONFIG.overloadFixEnabled = true;
DEFAULT_WARNING_CONFIG.householdFixEnabled = true;
DEFAULT_WARNING_CONFIG.overloadFixLimitEnabled = true;
DEFAULT_WARNING_CONFIG.overloadFixCooldownEnabled = true;
DEFAULT_WARNING_CONFIG.sheetAppsScriptUrl = '';

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

function toStringValue(value = '') {
    return { stringValue: String(value || '') };
}

function toBooleanValue(value = DEFAULT_SHEET_ACCESS_ENABLED) {
    return { booleanValue: value !== false };
}

function parseFirestoreString(valueObj = null) {
    if (!valueObj || typeof valueObj !== 'object') return '';
    if (typeof valueObj.stringValue === 'string') return valueObj.stringValue;
    return '';
}

function parseFirestoreBoolean(valueObj = null, fallback = DEFAULT_SHEET_ACCESS_ENABLED) {
    if (!valueObj || typeof valueObj !== 'object') return fallback;
    if (typeof valueObj.booleanValue === 'boolean') return valueObj.booleanValue;
    if (typeof valueObj.stringValue === 'string') {
        const normalized = valueObj.stringValue.trim().toLowerCase();
        if (normalized === 'false' || normalized === '0' || normalized === 'off') return false;
        if (normalized === 'true' || normalized === '1' || normalized === 'on') return true;
    }
    return fallback;
}

function sanitizeWarningText(value = '') {
    return String(value || '').trim();
}

function sanitizeSheetAppsScriptUrl(value = '') {
    return String(value || '').trim();
}

function sanitizeContentObject(value = {}) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return JSON.parse(JSON.stringify(value));
}

function normalizeSheetAccessEnabled(input = {}, fallback = DEFAULT_SHEET_ACCESS_ENABLED) {
    if (input && Object.prototype.hasOwnProperty.call(input, 'sheetAccessEnabled')) {
        const value = input.sheetAccessEnabled;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (normalized === 'false' || normalized === '0' || normalized === 'off') return false;
            if (normalized === 'true' || normalized === '1' || normalized === 'on') return true;
        }
        return value !== false;
    }
    return fallback !== false;
}

function normalizeBooleanSetting(input = {}, key = '', fallback = true) {
    if (!input || !Object.prototype.hasOwnProperty.call(input, key)) return fallback !== false;
    const value = input[key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['false', '0', 'off'].includes(normalized)) return false;
        if (['true', '1', 'on'].includes(normalized)) return true;
    }
    return value !== false;
}

function normalizeWarningConfig(input = {}, options = {}) {
    const source = input && typeof input === 'object' ? input : {};
    const allowPartialFallback = !(options && options.allowPartialFallback === false);
    const message = sanitizeWarningText(source.message);
    const submessage = sanitizeWarningText(source.submessage);
    const sheetAccessEnabled = normalizeSheetAccessEnabled(source);
    const sheetAppsScriptUrl = sanitizeSheetAppsScriptUrl(source.sheetAppsScriptUrl);
    const overloadFixEnabled = normalizeBooleanSetting(source, 'overloadFixEnabled', true);
    const householdFixEnabled = normalizeBooleanSetting(source, 'householdFixEnabled', true);
    const overloadFixLimitEnabled = normalizeBooleanSetting(source, 'overloadFixLimitEnabled', true);
    const overloadFixCooldownEnabled = normalizeBooleanSetting(source, 'overloadFixCooldownEnabled', true);
    if (!message && !submessage && allowPartialFallback) {
        return {
            ...DEFAULT_WARNING_CONFIG,
            sheetAccessEnabled,
            sheetAppsScriptUrl,
            overloadFixEnabled,
            householdFixEnabled,
            overloadFixLimitEnabled,
            overloadFixCooldownEnabled
        };
    }
    return {
        message,
        submessage,
        content: sanitizeContentObject(source.content),
        sheetAccessEnabled,
        sheetAppsScriptUrl,
        overloadFixEnabled,
        householdFixEnabled,
        overloadFixLimitEnabled,
        overloadFixCooldownEnabled
    };
}

function validateWarningConfigInput(input = {}) {
    const source = input && typeof input === 'object' ? input : {};
    const message = sanitizeWarningText(source.message);
    const submessage = sanitizeWarningText(source.submessage);
    const content = sanitizeContentObject(source.content);
    const hasSheetAccessFlag = Object.prototype.hasOwnProperty.call(source, 'sheetAccessEnabled');
    const sheetAccessEnabled = normalizeSheetAccessEnabled(source);
    const hasSheetAppsScriptUrl = Object.prototype.hasOwnProperty.call(source, 'sheetAppsScriptUrl');
    const sheetAppsScriptUrl = sanitizeSheetAppsScriptUrl(source.sheetAppsScriptUrl);
    const overloadFixEnabled = normalizeBooleanSetting(source, 'overloadFixEnabled', true);
    const householdFixEnabled = normalizeBooleanSetting(source, 'householdFixEnabled', true);
    const overloadFixLimitEnabled = normalizeBooleanSetting(source, 'overloadFixLimitEnabled', true);
    const overloadFixCooldownEnabled = normalizeBooleanSetting(source, 'overloadFixCooldownEnabled', true);
    const hasFixFlags = Object.prototype.hasOwnProperty.call(source, 'overloadFixEnabled')
        || Object.prototype.hasOwnProperty.call(source, 'householdFixEnabled')
        || Object.prototype.hasOwnProperty.call(source, 'overloadFixLimitEnabled')
        || Object.prototype.hasOwnProperty.call(source, 'overloadFixCooldownEnabled');
    if (!message && !submessage && Object.keys(content).length === 0 && !hasSheetAccessFlag && !hasSheetAppsScriptUrl && !hasFixFlags) {
        const error = new Error('Noi dung popup khong duoc de trong hoan toan.');
        error.httpStatus = 400;
        throw error;
    }
    return {
        message,
        submessage,
        content,
        sheetAccessEnabled,
        sheetAppsScriptUrl,
        overloadFixEnabled,
        householdFixEnabled,
        overloadFixLimitEnabled,
        overloadFixCooldownEnabled
    };
}

function mapWarningConfigFieldsToRecord(fields = {}) {
    let content = {};
    const contentJson = parseFirestoreString(fields.contentJson);
    if (contentJson) {
        try {
            content = sanitizeContentObject(JSON.parse(contentJson));
        } catch (_error) {
            content = {};
        }
    }
    return normalizeWarningConfig({
        message: parseFirestoreString(fields.message),
        submessage: parseFirestoreString(fields.submessage),
        content,
        sheetAccessEnabled: parseFirestoreBoolean(fields.sheetAccessEnabled),
        sheetAppsScriptUrl: parseFirestoreString(fields.sheetAppsScriptUrl),
        overloadFixEnabled: parseFirestoreBoolean(fields.overloadFixEnabled, true),
        householdFixEnabled: parseFirestoreBoolean(fields.householdFixEnabled, true),
        overloadFixLimitEnabled: parseFirestoreBoolean(fields.overloadFixLimitEnabled, true),
        overloadFixCooldownEnabled: parseFirestoreBoolean(fields.overloadFixCooldownEnabled, true)
    });
}

function mapWarningConfigRecordToFields(record = {}) {
    const normalized = normalizeWarningConfig(record);
    return {
        message: toStringValue(normalized.message),
        submessage: toStringValue(normalized.submessage),
        contentJson: toStringValue(JSON.stringify(normalized.content || {})),
        sheetAccessEnabled: toBooleanValue(normalized.sheetAccessEnabled),
        sheetAppsScriptUrl: toStringValue(normalized.sheetAppsScriptUrl),
        overloadFixEnabled: toBooleanValue(normalized.overloadFixEnabled),
        householdFixEnabled: toBooleanValue(normalized.householdFixEnabled),
        overloadFixLimitEnabled: toBooleanValue(normalized.overloadFixLimitEnabled),
        overloadFixCooldownEnabled: toBooleanValue(normalized.overloadFixCooldownEnabled)
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
        const err = new Error('Failed to read getlink warning config');
        err.httpStatus = response.statusCode || 500;
        throw err;
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
    return response.statusCode >= 200 && response.statusCode < 300;
}

async function readWarningConfig() {
    const doc = await readDoc(GETLINK_WARNING_CONFIG_DOC);
    if (!doc || !doc.fields) return { ...DEFAULT_WARNING_CONFIG };
    return mapWarningConfigFieldsToRecord(doc.fields || {});
}

async function saveWarningConfig(input = {}) {
    const validated = validateWarningConfigInput(input);
    const normalized = normalizeWarningConfig(validated, { allowPartialFallback: false });
    const ok = await patchDoc(GETLINK_WARNING_CONFIG_DOC, mapWarningConfigRecordToFields(normalized));
    if (!ok) {
        const err = new Error('Failed to save getlink warning config');
        err.httpStatus = 500;
        throw err;
    }
    return normalizeWarningConfig(normalized);
}

async function isSheetAccessEnabled() {
    const config = await readWarningConfig();
    return normalizeSheetAccessEnabled(config);
}

async function readSheetAppsScriptUrl() {
    const config = await readWarningConfig();
    return sanitizeSheetAppsScriptUrl(config && config.sheetAppsScriptUrl);
}

function isFixModeEnabled(config = {}, mode = 'overload') {
    return mode === 'household'
        ? config.householdFixEnabled !== false
        : config.overloadFixEnabled !== false;
}

module.exports = {
    DEFAULT_WARNING_CONFIG,
    normalizeWarningConfig,
    readWarningConfig,
    saveWarningConfig,
    isSheetAccessEnabled,
    readSheetAppsScriptUrl,
    sanitizeSheetAppsScriptUrl,
    isFixModeEnabled
};
