const crypto = require('crypto');

const TOKEN_VERSION = 'v1';
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const MAX_TOKEN_LENGTH = 2 * 1024 * 1024;

function tokenError(message, httpStatus = 400) {
    const error = new Error(message);
    error.httpStatus = httpStatus;
    return error;
}

function getSecret(options = {}) {
    const secret = String(options.secret || process.env.ADMIN_SESSION_SECRET || '').trim();
    if (!secret) throw tokenError('ADMIN_SESSION_SECRET is required for Sheet Check tokens.', 500);
    return secret;
}

function getKey(options = {}) {
    return crypto.createHash('sha256').update(getSecret(options)).digest();
}

function sealSheetCheckState(state = {}, options = {}) {
    const now = Math.max(0, Number(options.now || Date.now()) || Date.now());
    const payload = JSON.stringify({
        type: 'sheet_check_v2',
        iat: now,
        exp: now + TOKEN_TTL_MS,
        state
    });
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getKey(options), iv);
    cipher.setAAD(Buffer.from(TOKEN_VERSION, 'utf8'));
    const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const token = [TOKEN_VERSION, iv.toString('base64url'), encrypted.toString('base64url'), tag.toString('base64url')].join('.');
    if (token.length > MAX_TOKEN_LENGTH) throw tokenError('Sheet Check token is too large.', 413);
    return token;
}

function openSheetCheckState(token = '', options = {}) {
    const raw = String(token || '').trim();
    if (!raw) throw tokenError('Missing Sheet Check continuation token.');
    if (raw.length > MAX_TOKEN_LENGTH) throw tokenError('Sheet Check token is too large.', 413);
    const parts = raw.split('.');
    if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) throw tokenError('Invalid Sheet Check token.');

    try {
        const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(options), Buffer.from(parts[1], 'base64url'));
        decipher.setAAD(Buffer.from(TOKEN_VERSION, 'utf8'));
        decipher.setAuthTag(Buffer.from(parts[3], 'base64url'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(parts[2], 'base64url')),
            decipher.final()
        ]).toString('utf8');
        const payload = JSON.parse(decrypted);
        const now = Math.max(0, Number(options.now || Date.now()) || Date.now());
        if (!payload || payload.type !== 'sheet_check_v2' || !payload.state || typeof payload.state !== 'object') {
            throw tokenError('Invalid Sheet Check token payload.');
        }
        if (!payload.exp || now > Number(payload.exp)) throw tokenError('Sheet Check token has expired.', 410);
        return payload.state;
    } catch (error) {
        if (error && error.httpStatus) throw error;
        throw tokenError('Invalid or modified Sheet Check token.', 403);
    }
}

module.exports = {
    TOKEN_TTL_MS,
    MAX_TOKEN_LENGTH,
    sealSheetCheckState,
    openSheetCheckState
};
