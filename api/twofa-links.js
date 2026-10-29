const { validId, read, decrypt, generateTotp, expired } = require('./_twofa-store');
const { checkRateLimit, applySecurityHeaders } = require('./_security');

function ip(req) { return String(req.headers && req.headers['x-forwarded-for'] || req.socket && req.socket.remoteAddress || 'unknown').split(',')[0].trim(); }
module.exports = async function (req, res) {
    applySecurityHeaders(res);
    const match = String(req.url || '').split('?')[0].match(/^\/api\/2fa-links\/([^/]+)\/code$/);
    if (req.method !== 'GET' || !match) return res.status(404).json({ error: 'Not found' });
    const id = decodeURIComponent(match[1] || '');
    if (!validId(id)) return res.status(400).json({ error: 'ID link không hợp lệ.' });
    const limited = checkRateLimit(`twofa:code:${id}:${ip(req)}`, 30, 60 * 1000);
    if (!limited.allowed) { res.setHeader('Retry-After', Math.ceil(limited.retryAfterMs / 1000)); return res.status(429).json({ error: 'Vui lòng chờ một lát rồi thử lại.' }); }
    try {
        const record = await read(id);
        if (!record) return res.status(404).json({ error: 'Link 2FA không tồn tại.' });
        if (record.status !== 'active') return res.status(410).json({ error: 'Link 2FA đã bị thu hồi.' });
        if (expired(record)) return res.status(410).json({ error: 'Link 2FA đã hết hạn.' });
        const now = Date.now(); const expiresAt = (Math.floor(now / 30000) + 1) * 30000;
        return res.status(200).json({ code: generateTotp(decrypt(record.secretCiphertext, record.id), now), expiresAt: new Date(expiresAt).toISOString(), remainingSeconds: Math.max(0, Math.ceil((expiresAt - now) / 1000)) });
    } catch (error) { return res.status(error.httpStatus || 500).json({ error: 'Không thể lấy mã 2FA lúc này.' }); }
};
