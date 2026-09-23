const https = require('https');
const crypto = require('crypto');
const { AsyncLocalStorage } = require('async_hooks');
const authStorage = new AsyncLocalStorage();

const PROJECT_ID = String(process.env.FIREBASE_PROJECT_ID || 'trada3k-c402a').trim();
const API_KEY = String(process.env.FIREBASE_API_KEY || 'AIzaSyAVV-3HxGFpT_eiAri1SGPWGwu3EL8On58').trim();
const PAGE_COLLECTION = 'data_pages';
const ACCOUNT_COLLECTION = 'data_accounts';
const PUBLIC_ACCOUNT_COLLECTION = 'data_public_accounts';

function parseBody(raw) {
    if (raw && typeof raw === 'object') return raw;
    try { return JSON.parse(String(raw || '{}')); } catch (e) { return {}; }
}

function firestorePath(docPath = '') {
    return `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}?key=${encodeURIComponent(API_KEY)}`;
}

function activeToken(token = '') { return String(token || authStorage.getStore() || '').trim(); }
function runWithAuthToken(token, callback) { return authStorage.run(String(token || '').trim(), callback); }
function request(options, body = '', authToken = '') {
    authToken = activeToken(authToken);
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve({ statusCode: Number(res.statusCode || 0), body: data }));
        });
        req.on('error', reject);
        if (authToken) req.setHeader('Authorization', `Bearer ${authToken}`);
        if (body) req.write(body);
        req.end();
    });
}

async function readDoc(collection, id, authToken = '') {
    const response = await request({ hostname: 'firestore.googleapis.com', port: 443, path: firestorePath(`${collection}/${encodeURIComponent(id)}`), method: 'GET' }, '', authToken);
    if (response.statusCode === 404) return null;
    if (response.statusCode < 200 || response.statusCode >= 300) throw new Error(`Firestore read failed (${response.statusCode})`);
    try { return JSON.parse(response.body || '{}'); } catch (e) { return null; }
}

async function listDocs(collection, authToken = '') {
    const docs = [];
    let pageToken = '';
    do {
        const query = `pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
        const response = await request({ hostname: 'firestore.googleapis.com', port: 443, path: `${firestorePath(collection)}&${query}`, method: 'GET' }, '', authToken);
        if (response.statusCode === 404) return [];
        if (response.statusCode < 200 || response.statusCode >= 300) throw new Error(`Firestore list failed (${response.statusCode})`);
        let parsed = {};
        try { parsed = JSON.parse(response.body || '{}'); } catch (e) { parsed = {}; }
        if (Array.isArray(parsed.documents)) docs.push(...parsed.documents);
        pageToken = String(parsed.nextPageToken || '').trim();
    } while (pageToken);
    return docs;
}

async function writeDoc(collection, id, fields, authToken = '') {
    const body = JSON.stringify({ fields });
    const response = await request({
        hostname: 'firestore.googleapis.com', port: 443,
        path: firestorePath(`${collection}/${encodeURIComponent(id)}`), method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, body, authToken);
    if (response.statusCode < 200 || response.statusCode >= 300) throw new Error(`Firestore write failed (${response.statusCode})`);
    return true;
}

function deleteDoc(collection, id, authToken = '') {
    return request({ hostname: 'firestore.googleapis.com', port: 443, path: firestorePath(`${collection}/${encodeURIComponent(id)}`), method: 'DELETE' }, '', authToken)
        .then((response) => response.statusCode >= 200 && response.statusCode < 300);
}

function value(field) {
    if (!field || typeof field !== 'object') return '';
    if (field.stringValue !== undefined) return String(field.stringValue || '');
    if (field.integerValue !== undefined) return Number(field.integerValue || 0);
    if (field.booleanValue !== undefined) return !!field.booleanValue;
    if (field.timestampValue !== undefined) return String(field.timestampValue || '');
    if (field.arrayValue && Array.isArray(field.arrayValue.values)) return field.arrayValue.values.map(value);
    return '';
}

function str(v, max = 5000) { return String(v === undefined || v === null ? '' : v).trim().slice(0, max); }
function bool(v) { return v === true || String(v).toLowerCase() === 'true'; }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fsString(v) { return { stringValue: str(v) }; }
function fsInt(v) { return { integerValue: String(Math.max(0, Math.round(num(v)))) }; }
function fsArray(values) { return { arrayValue: { values: (Array.isArray(values) ? values : []).map((item) => fsString(item)) } }; }

function fromPage(doc) {
    const f = (doc && doc.fields) || {};
    return { slug: str(value(f.slug), 120), title: str(value(f.title), 200), facebookUrl: str(value(f.facebookUrl), 500), archivedAt: str(value(f.archivedAt), 40), createdAt: str(value(f.createdAt), 40), updatedAt: str(value(f.updatedAt), 40), createdBy: str(value(f.createdBy), 200), updatedBy: str(value(f.updatedBy), 200) };
}
function fromAccount(doc) {
    const f = (doc && doc.fields) || {};
    return { id: str(value(f.id), 100), pageSlug: str(value(f.pageSlug), 120), title: str(value(f.title), 300), content: str(value(f.content), 10000), expiresAt: str(value(f.expiresAt), 40), warning: str(value(f.warning), 3000), adminNote: str(value(f.adminNote), 5000), tags: (Array.isArray(value(f.tags)) ? value(f.tags) : []).map((x) => str(x, 60)).filter(Boolean), sortOrder: num(value(f.sortOrder)), archivedAt: str(value(f.archivedAt), 40), createdAt: str(value(f.createdAt), 40), updatedAt: str(value(f.updatedAt), 40) };
}
function pageFields(page) { return Object.fromEntries(Object.entries(page).map(([k, v]) => [k, fsString(v)])); }
function accountFields(account) { return { id: fsString(account.id), pageSlug: fsString(account.pageSlug), title: fsString(account.title), content: fsString(account.content), expiresAt: fsString(account.expiresAt), warning: fsString(account.warning), adminNote: fsString(account.adminNote), tags: fsArray(account.tags), sortOrder: fsInt(account.sortOrder), archivedAt: fsString(account.archivedAt), createdAt: fsString(account.createdAt), updatedAt: fsString(account.updatedAt) }; }
function publicAccountFields(account) { const fields = accountFields(account); delete fields.adminNote; return fields; }
function newId() { return crypto.randomBytes(12).toString('hex'); }

module.exports = { PAGE_COLLECTION, ACCOUNT_COLLECTION, PUBLIC_ACCOUNT_COLLECTION, parseBody, readDoc, listDocs, writeDoc, deleteDoc, value, str, bool, num, fromPage, fromAccount, pageFields, accountFields, publicAccountFields, newId, runWithAuthToken };
