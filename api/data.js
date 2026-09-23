const { adminAuthConfig } = require('./_security');
const {
    PAGE_COLLECTION, ACCOUNT_COLLECTION, PUBLIC_ACCOUNT_COLLECTION, parseBody, readDoc, listDocs, writeDoc, fromPage, fromAccount,
    pageFields, accountFields, publicAccountFields, str, num, newId, deleteDoc, runWithAuthToken
} = require('./_data-store');

function json(res, status, payload) { return res.status(status).json(payload); }
function now() { return new Date().toISOString(); }
function normalizeSlug(v) { return str(v, 120).toLowerCase(); }
function validSlug(v) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) && v.length <= 80; }
function validFacebook(v) { if (!v) return true; try { const u = new URL(v); return u.protocol === 'https:' && /(^|\.)facebook\.com$/i.test(u.hostname); } catch (e) { return false; } }
function normalizeTags(v) { return [...new Set((Array.isArray(v) ? v : String(v || '').split(',')).map((x) => str(x, 60).toLowerCase()).filter(Boolean))].slice(0, 20); }
function normalizeExpiry(v) { const x = str(v, 40); if (!x) return ''; const ms = Date.parse(x); if (!Number.isFinite(ms)) { const e = new Error('Ngày hết hạn không hợp lệ'); e.status = 400; throw e; } return new Date(ms).toISOString(); }
function isExpired(v) { return !!v && Date.parse(v) < Date.now(); }
function safePage(page) { return { slug: page.slug, title: page.title, facebookUrl: page.facebookUrl, createdAt: page.createdAt, updatedAt: page.updatedAt }; }
function safeAccount(a) { return { id: a.id, pageSlug: a.pageSlug, title: a.title, content: a.content, expiresAt: a.expiresAt, warning: a.warning, tags: a.tags, sortOrder: a.sortOrder, expired: isExpired(a.expiresAt) }; }
function getBearer(req) { const raw = String((req.headers || {}).authorization || '').trim(); return raw.replace(/^Bearer\s+/i, '').trim(); }
async function firebaseEmail(token) {
    if (!token) return '';
    const https = require('https');
    const body = JSON.stringify({ idToken: token });
    const response = await new Promise((resolve, reject) => { const r = https.request({ hostname: 'identitytoolkit.googleapis.com', path: `/v1/accounts:lookup?key=${encodeURIComponent(process.env.FIREBASE_API_KEY || 'AIzaSyAVV-3HxGFpT_eiAri1SGPWGwu3EL8On58')}`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => { let d = ''; res.on('data', (c) => { d += c; }); res.on('end', () => resolve({ status: res.statusCode, body: d })); }); r.on('error', reject); r.write(body); r.end(); });
    if (response.status < 200 || response.status >= 300) return '';
    try { return str(JSON.parse(response.body).users?.[0]?.email).toLowerCase(); } catch (e) { return ''; }
}
async function requireAdmin(req, res) { const email = await firebaseEmail(getBearer(req)); const allowed = adminAuthConfig().adminEmails || []; if (!email || !allowed.includes(email)) { json(res, 401, { error: 'Admin authentication required' }); return ''; } return email; }
async function allPages() { return (await listDocs(PAGE_COLLECTION)).map(fromPage); }
async function allAccounts() { return (await listDocs(ACCOUNT_COLLECTION)).map(fromAccount); }
async function allPublicAccounts() { return (await listDocs(PUBLIC_ACCOUNT_COLLECTION)).map(fromAccount); }
function adminPage(page) { return page; }
function adminAccount(a) { return a; }

async function handleDataRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();
    try {
        const path = String(req.url || '').split('?')[0];
        if (path.startsWith('/api/data/') && !path.startsWith('/api/data-admin/')) {
            const slug = normalizeSlug(decodeURIComponent(path.slice('/api/data/'.length)));
            if (!validSlug(slug)) return json(res, 400, { error: 'Slug không hợp lệ' });
            const pageDoc = await readDoc(PAGE_COLLECTION, slug);
            if (!pageDoc) return json(res, 404, { error: 'Không tìm thấy trang dữ liệu' });
            const page = fromPage(pageDoc);
            if (page.archivedAt) return json(res, 404, { error: 'Không tìm thấy trang dữ liệu' });
            const accounts = (await allPublicAccounts()).filter((a) => a.pageSlug === slug && !a.archivedAt).sort((a, b) => num(a.sortOrder) - num(b.sortOrder) || String(b.createdAt).localeCompare(String(a.createdAt)));
            return json(res, 200, { success: true, page: safePage(page), accounts: accounts.map(safeAccount) });
        }
        if (!path.startsWith('/api/data-admin')) return json(res, 404, { error: 'Not found' });
        const adminEmail = await requireAdmin(req, res); if (!adminEmail) return;
        const body = parseBody(req.body);
        if (path === '/api/data-admin/pages' && req.method === 'GET') {
            const includeArchived = String(new URL(req.url, 'http://localhost').searchParams.get('trash') || '') === '1';
            const pages = (await allPages()).filter((p) => includeArchived ? !!p.archivedAt : !p.archivedAt).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
            return json(res, 200, { success: true, pages: pages.map(adminPage) });
        }
        if (path === '/api/data-admin/pages' && req.method === 'POST') {
            const slug = normalizeSlug(body.slug); const title = str(body.title, 200); const facebookUrl = str(body.facebookUrl, 500);
            if (!validSlug(slug)) return json(res, 400, { error: 'Slug chỉ gồm chữ thường, số và dấu gạch ngang' });
            if (!title) return json(res, 400, { error: 'Vui lòng nhập tiêu đề' });
            if (!validFacebook(facebookUrl)) return json(res, 400, { error: 'Link Facebook không hợp lệ' });
            if (await readDoc(PAGE_COLLECTION, slug)) return json(res, 409, { error: 'Slug đã tồn tại' });
            const timestamp = now(); const page = { slug, title, facebookUrl, archivedAt: '', createdAt: timestamp, updatedAt: timestamp, createdBy: adminEmail, updatedBy: adminEmail };
            await writeDoc(PAGE_COLLECTION, slug, pageFields(page)); return json(res, 201, { success: true, page });
        }
        const pageMatch = path.match(/^\/api\/data-admin\/pages\/([^/]+)$/);
        if (pageMatch) {
            const slug = normalizeSlug(decodeURIComponent(pageMatch[1])); const currentDoc = await readDoc(PAGE_COLLECTION, slug); if (!currentDoc) return json(res, 404, { error: 'Page không tồn tại' });
            const current = fromPage(currentDoc);
            if (req.method === 'PUT') { const nextSlug = normalizeSlug(body.newSlug || slug); const title = body.title !== undefined ? str(body.title, 200) : current.title; const facebookUrl = body.facebookUrl !== undefined ? str(body.facebookUrl, 500) : current.facebookUrl; if (!validSlug(nextSlug) || !title || !validFacebook(facebookUrl)) return json(res, 400, { error: 'Dữ liệu page không hợp lệ' }); if (nextSlug !== slug && await readDoc(PAGE_COLLECTION, nextSlug)) return json(res, 409, { error: 'Slug mới đã tồn tại' }); const next = { ...current, slug: nextSlug, title, facebookUrl, updatedAt: now(), updatedBy: adminEmail }; await writeDoc(PAGE_COLLECTION, nextSlug, pageFields(next)); if (nextSlug !== slug) { const accounts = (await allAccounts()).filter((a) => a.pageSlug === slug); for (const account of accounts) { account.pageSlug = nextSlug; account.updatedAt = now(); await writeDoc(ACCOUNT_COLLECTION, account.id, accountFields(account)); await writeDoc(PUBLIC_ACCOUNT_COLLECTION, account.id, publicAccountFields(account)); } await deleteDoc(PAGE_COLLECTION, slug); } return json(res, 200, { success: true, page: next }); }
            if (req.method === 'DELETE') { const next = { ...current, archivedAt: now(), updatedAt: now(), updatedBy: adminEmail }; await writeDoc(PAGE_COLLECTION, slug, pageFields(next)); return json(res, 200, { success: true, page: next }); }
        }
        if (path === '/api/data-admin/accounts' && req.method === 'POST') {
            const pageSlug = normalizeSlug(body.pageSlug); const page = await readDoc(PAGE_COLLECTION, pageSlug); if (!page || fromPage(page).archivedAt) return json(res, 404, { error: 'Page không tồn tại' });
            const title = str(body.title, 300); if (!title) return json(res, 400, { error: 'Vui lòng nhập tiêu đề tài khoản' });
            const timestamp = now(); const account = { id: newId(), pageSlug, title, content: str(body.content, 10000), expiresAt: normalizeExpiry(body.expiresAt), warning: str(body.warning, 3000), adminNote: str(body.adminNote, 5000), tags: normalizeTags(body.tags), sortOrder: num(body.sortOrder) || Date.now(), archivedAt: '', createdAt: timestamp, updatedAt: timestamp };
            await writeDoc(ACCOUNT_COLLECTION, account.id, accountFields(account)); await writeDoc(PUBLIC_ACCOUNT_COLLECTION, account.id, publicAccountFields(account)); return json(res, 201, { success: true, account });
        }
        const accountMatch = path.match(/^\/api\/data-admin\/accounts\/([^/]+)$/);
        if (accountMatch) {
            const id = decodeURIComponent(accountMatch[1]); const currentDoc = await readDoc(ACCOUNT_COLLECTION, id); if (!currentDoc) return json(res, 404, { error: 'Account không tồn tại' }); const current = fromAccount(currentDoc);
            if (req.method === 'PUT') { const next = { ...current, pageSlug: body.pageSlug !== undefined ? normalizeSlug(body.pageSlug) : current.pageSlug, title: body.title !== undefined ? str(body.title, 300) : current.title, content: body.content !== undefined ? str(body.content, 10000) : current.content, expiresAt: body.expiresAt !== undefined ? normalizeExpiry(body.expiresAt) : current.expiresAt, warning: body.warning !== undefined ? str(body.warning, 3000) : current.warning, adminNote: body.adminNote !== undefined ? str(body.adminNote, 5000) : current.adminNote, tags: body.tags !== undefined ? normalizeTags(body.tags) : current.tags, sortOrder: body.sortOrder !== undefined ? num(body.sortOrder) : current.sortOrder, updatedAt: now() }; await writeDoc(ACCOUNT_COLLECTION, id, accountFields(next)); await writeDoc(PUBLIC_ACCOUNT_COLLECTION, id, publicAccountFields(next)); return json(res, 200, { success: true, account: next }); }
            if (req.method === 'DELETE') { const next = { ...current, archivedAt: now(), updatedAt: now() }; await writeDoc(ACCOUNT_COLLECTION, id, accountFields(next)); await writeDoc(PUBLIC_ACCOUNT_COLLECTION, id, publicAccountFields(next)); return json(res, 200, { success: true, account: next }); }
        }
        if (path === '/api/data-admin/restore' && req.method === 'POST') { const collection = body.type === 'page' ? PAGE_COLLECTION : ACCOUNT_COLLECTION; const id = str(body.id, 120); const doc = await readDoc(collection, id); if (!doc) return json(res, 404, { error: 'Không tìm thấy dữ liệu' }); const current = collection === PAGE_COLLECTION ? fromPage(doc) : fromAccount(doc); const next = { ...current, archivedAt: '', updatedAt: now(), ...(collection === PAGE_COLLECTION ? { updatedBy: adminEmail } : {}) }; await writeDoc(collection, id, collection === PAGE_COLLECTION ? pageFields(next) : accountFields(next)); if (collection === ACCOUNT_COLLECTION) await writeDoc(PUBLIC_ACCOUNT_COLLECTION, id, publicAccountFields(next)); return json(res, 200, { success: true, [collection === PAGE_COLLECTION ? 'page' : 'account']: next }); }
        if (path === '/api/data-admin/accounts' && req.method === 'GET') { const slug = normalizeSlug(new URL(req.url, 'http://localhost').searchParams.get('pageSlug') || ''); const trash = new URL(req.url, 'http://localhost').searchParams.get('trash') === '1'; const accounts = (await allAccounts()).filter((a) => (!slug || a.pageSlug === slug) && (trash ? !!a.archivedAt : !a.archivedAt)); return json(res, 200, { success: true, accounts }); }
        if (path === '/api/data-admin/search' && req.method === 'POST') { const q = str(body.query, 200).toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); if (!q) return json(res, 200, { success: true, results: [] }); const pages = await allPages(); const accounts = await allAccounts(); const pageMap = new Map(pages.map((p) => [p.slug, p])); const results = accounts.filter((a) => !a.archivedAt && !pageMap.get(a.pageSlug)?.archivedAt).map((a) => ({ a, p: pageMap.get(a.pageSlug) })).filter(({ a, p }) => { const text = [a.pageSlug, p?.title, a.title, a.content, a.adminNote, ...(a.tags || [])].join(' ').toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); return text.includes(q); }).slice(0, 200).map(({ a, p }) => ({ page: safePage(p || { slug: a.pageSlug, title: a.pageSlug, facebookUrl: '' }), account: adminAccount(a), snippet: [a.content, a.adminNote].find((x) => x.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q))?.slice(0, 220) || a.content.slice(0, 220) })); return json(res, 200, { success: true, results }); }
        return json(res, 405, { error: 'Method not allowed' });
    } catch (error) { console.error('[data-api]', error); return json(res, Number(error.status || 500), { error: error.message || 'Internal server error' }); }
}

module.exports = function (req, res) {
    const token = getBearer(req);
    return runWithAuthToken(token, () => handleDataRequest(req, res));
};
