const https = require('https');

const DEFAULT_TIMEOUT_MS = 300000;
const MAX_APPS_SCRIPT_REDIRECTS = 5;
const MAX_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

function sleep(timeoutMs) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(timeoutMs || 0) || 0)));
}

function buildAppsScriptInvalidResponseError(statusCode = 0, responseBody = '', contentType = '') {
    const bodyText = String(responseBody || '').trim();
    const typeText = String(contentType || '').trim().toLowerCase();
    const isHtml = typeText.includes('text/html') || /^<!doctype html/i.test(bodyText) || /^<html/i.test(bodyText);
    let message = 'Apps Script tra ve du lieu khong hop le.';

    if (statusCode === 404) {
        message = 'Apps Script tra ve HTTP 404 sau khi goi Web App. Da thu lai; neu van lap lai, hay kiem tra lai deploy Web App /exec.';
    } else if (statusCode === 401 || statusCode === 403) {
        message = 'Apps Script bi chan quyen. Hay deploy Web App voi quyen truy cap phu hop.';
    } else if (isHtml) {
        message = 'Apps Script dang tra ve HTML thay vi JSON. Hay kiem tra lai URL /exec va deploy Web App.';
    }

    const error = new Error(message);
    error.httpStatus = 502;
    error.statusCode = statusCode;
    error.contentType = contentType;
    error.isAppsScriptHttpResponse = true;
    return error;
}

function parseAppsScriptJsonResponse(statusCode = 0, responseBody = '', contentType = '') {
    try {
        return JSON.parse(String(responseBody || '{}'));
    } catch (error) {
        throw buildAppsScriptInvalidResponseError(statusCode, responseBody, contentType);
    }
}

function resolveAppsScriptUrlOrThrow(rawUrl = '') {
    const url = String(rawUrl || '').trim();
    if (!url) {
        const error = new Error('Chua cau hinh Apps Script URL cho Google Sheet.');
        error.httpStatus = 500;
        throw error;
    }

    let parsed = null;
    try {
        parsed = new URL(url);
    } catch (error) {
        const err = new Error('Apps Script URL khong hop le. Hay dung Web App URL dang https://script.google.com/macros/s/.../exec.');
        err.httpStatus = 500;
        throw err;
    }

    if (parsed.protocol !== 'https:' || parsed.hostname !== 'script.google.com' || !/\/macros\/s\/[^/]+\/exec\/?$/.test(parsed.pathname)) {
        const err = new Error('Apps Script URL phai la Web App /exec, vi du https://script.google.com/macros/s/.../exec.');
        err.httpStatus = 500;
        throw err;
    }

    return parsed.toString();
}

function isNonRetryableResponseError(error = null) {
    const statusCode = Number(error && (error.statusCode || error.httpStatus) || 0);
    if ([401, 403].includes(statusCode)) return true;

    const message = String(error && error.message ? error.message : '').trim().toLowerCase();
    return [
        'spreadsheet_id is not configured',
        'sheet_name is not configured',
        'sheet not found',
        'unsupported action'
    ].some((fragment) => message.includes(fragment));
}

function isRetryableAppsScriptError(error = null) {
    if (isNonRetryableResponseError(error)) return false;

    const statusCode = Number(error && error.statusCode || 0);
    if (statusCode === 404) return true;
    if (statusCode >= 400 && statusCode < 500) return false;
    return true;
}

function normalizeError(error, fallbackMessage = 'Apps Script request failed.') {
    if (error instanceof Error) return error;
    return new Error(String(error || fallbackMessage).trim() || fallbackMessage);
}

function getRetryDelayMs(attemptNumber = 1) {
    return RETRY_DELAYS_MS[Math.max(0, Math.min(RETRY_DELAYS_MS.length - 1, attemptNumber - 1))];
}

function getJsonFromAbsoluteUrl(rawUrl, options = {}) {
    const redirectCount = Math.max(0, Number(options.redirectCount || 0) || 0);
    const timeoutMs = Math.max(1, Number(options.timeoutMs || DEFAULT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS);
    const redirectSeen = options.redirectSeen === true;

    return new Promise((resolve, reject) => {
        let parsedUrl;
        try {
            parsedUrl = new URL(String(rawUrl || '').trim());
        } catch (error) {
            reject(new Error('GETLINK_SHEET_APPS_SCRIPT_URL is invalid.'));
            return;
        }

        const req = https.request({
            protocol: parsedUrl.protocol,
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: `${parsedUrl.pathname || '/'}${parsedUrl.search || ''}`,
            method: 'GET'
        }, (res) => {
            const statusCode = Number(res.statusCode || 0);
            const location = String(res.headers.location || '').trim();
            const contentType = String(res.headers['content-type'] || '').trim();

            if (statusCode >= 300 && statusCode < 400 && location) {
                if (redirectCount >= MAX_APPS_SCRIPT_REDIRECTS) {
                    const error = new Error('Apps Script redirect qua nhieu lan.');
                    error.httpStatus = 502;
                    error.statusCode = statusCode;
                    error.contentType = contentType;
                    error.redirectSeen = true;
                    reject(error);
                    return;
                }

                const nextUrl = new URL(location, parsedUrl).toString();
                res.resume();
                getJsonFromAbsoluteUrl(nextUrl, {
                    redirectCount: redirectCount + 1,
                    timeoutMs,
                    redirectSeen: true
                }).then(resolve).catch(reject);
                return;
            }

            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (statusCode < 200 || statusCode >= 300) {
                    let parsed = null;
                    try {
                        parsed = parseAppsScriptJsonResponse(statusCode, data, contentType);
                    } catch (invalidError) {
                        invalidError.statusCode = statusCode;
                        invalidError.contentType = contentType;
                        invalidError.redirectSeen = redirectSeen;
                        reject(invalidError);
                        return;
                    }

                    const errorMessage = statusCode === 404
                        ? 'Apps Script tra ve HTTP 404 sau khi goi Web App. Da thu lai; neu van lap lai, hay kiem tra lai deploy Web App /exec.'
                        : String(parsed && parsed.error ? parsed.error : 'Apps Script request failed.').trim() || 'Apps Script request failed.';
                    const error = new Error(errorMessage);
                    error.httpStatus = 502;
                    error.statusCode = statusCode;
                    error.contentType = contentType;
                    error.isAppsScriptHttpResponse = true;
                    error.redirectSeen = redirectSeen;
                    reject(error);
                    return;
                }

                let parsed = null;
                try {
                    parsed = parseAppsScriptJsonResponse(statusCode, data, contentType);
                } catch (invalidError) {
                    invalidError.statusCode = statusCode;
                    invalidError.contentType = contentType;
                    invalidError.redirectSeen = redirectSeen;
                    reject(invalidError);
                    return;
                }

                resolve({
                    data: parsed,
                    statusCode,
                    contentType,
                    redirectSeen
                });
            });
        });

        req.setTimeout(timeoutMs, () => {
            const error = new Error(`Apps Script timeout sau ${timeoutMs}ms.`);
            error.httpStatus = 504;
            error.statusCode = 0;
            req.destroy(error);
        });
        req.on('error', (error) => {
            const message = error && error.message ? error.message : 'Unknown error';
            const normalized = new Error(`Khong ket noi duoc Apps Script: ${message}`);
            normalized.httpStatus = /timeout/i.test(message) ? 504 : 502;
            normalized.statusCode = Number(error && error.statusCode || 0);
            normalized.redirectSeen = redirectSeen;
            reject(normalized);
        });
        req.end();
    });
}

async function requestAppsScriptJsonWithRetry(rawUrl, options = {}) {
    const action = String(options.action || '').trim() || 'health';
    const payload = options.payload && typeof options.payload === 'object' ? options.payload : {};
    const timeoutMs = Math.max(1, Number(options.timeoutMs || DEFAULT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS);
    const logger = typeof options.logger === 'function' ? options.logger : console.warn;
    const url = new URL(String(rawUrl || '').trim());

    if (options.action) url.searchParams.set('action', action);
    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        url.searchParams.set(key, String(value));
    });

    let lastError = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            const response = await getJsonFromAbsoluteUrl(url.toString(), { timeoutMs });
            const data = response && response.data && typeof response.data === 'object'
                ? response.data
                : {};

            if (data.success === false) {
                const error = new Error(String(data.error || data.message || 'Apps Script request failed.').trim() || 'Apps Script request failed.');
                error.httpStatus = 502;
                error.statusCode = response.statusCode;
                error.contentType = response.contentType;
                error.isAppsScriptHttpResponse = true;
                error.redirectSeen = response.redirectSeen === true;
                throw error;
            }

            if (attempt > 1) {
                logger('[getlink apps script] request succeeded after retry', {
                    action,
                    attempt,
                    maxAttempts: MAX_ATTEMPTS,
                    statusCode: response.statusCode,
                    redirectSeen: response.redirectSeen === true,
                    retrying: false
                });
            }

            return {
                data,
                statusCode: response.statusCode,
                contentType: response.contentType,
                redirectSeen: response.redirectSeen === true,
                attempts: attempt
            };
        } catch (rawError) {
            const error = normalizeError(rawError);
            lastError = error;
            error.attempts = attempt;

            const shouldRetry = attempt < MAX_ATTEMPTS && isRetryableAppsScriptError(error);
            logger('[getlink apps script] request failed', {
                action,
                attempt,
                maxAttempts: MAX_ATTEMPTS,
                statusCode: Number(error.statusCode || 0),
                redirectSeen: error.redirectSeen === true,
                retrying: shouldRetry
            });

            if (!shouldRetry) throw error;
            await sleep(getRetryDelayMs(attempt));
        }
    }

    throw lastError || new Error('Apps Script request failed.');
}

module.exports = {
    DEFAULT_TIMEOUT_MS,
    MAX_APPS_SCRIPT_REDIRECTS,
    MAX_ATTEMPTS,
    RETRY_DELAYS_MS,
    buildAppsScriptInvalidResponseError,
    parseAppsScriptJsonResponse,
    resolveAppsScriptUrlOrThrow,
    getJsonFromAbsoluteUrl,
    requestAppsScriptJsonWithRetry,
    isRetryableAppsScriptError,
    getRetryDelayMs
};
