import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const id = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');
const $ = (selector) => document.querySelector(selector);
let token = '';
let currentLink = null;
let config = {};
let initialNoticeShown = false;
let busy = false;

function setState(message, type = '') {
  const node = $('#state');
  node.textContent = message;
  node.className = `muted${type ? ` ${type}-text` : ''}`;
}

function showNotice(title, text) {
  if (!text) return;
  $('#noticeTitle').textContent = title || 'Thông báo';
  $('#noticeText').textContent = text;
  $('#notice').classList.remove('hidden');
}

function setEmpty(title, message, error = false, showClaim = false) {
  $('#accountCard').classList.add('hidden');
  $('#emptyCard').classList.remove('hidden');
  $('#emptyTitle').textContent = title;
  $('#emptyMessage').textContent = message;
  $('#emptyCard').classList.toggle('error-card', error);
  $('#claimBtn').classList.toggle('hidden', !showClaim);
  $('#claimProgress').classList.add('hidden');
}

function setProgress(selector, visible, title = '', detail = '') {
  const panel = $(selector);
  if (!panel) return;
  panel.classList.toggle('hidden', !visible);
  if (title) panel.querySelector('[id$="ProgressTitle"]').textContent = title;
  if (detail) panel.querySelector('[id$="ProgressDetail"]').textContent = detail;
}

function formatDate(value) {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
}

function renderAdminDetails(link) {
  const visible = Boolean(link && link.createdAt);
  $('#adminCard').classList.toggle('hidden', !visible);
  if (!visible) return;
  $('#adminLinkExpiry').textContent = formatDate(link.expiresAt);
  $('#adminLinkCreated').textContent = formatDate(link.createdAt);
  $('#adminAccountCreated').textContent = formatDate(link.accountCreatedAt);
  $('#adminAccountExpiry').textContent = formatDate(link.accountExpiresAt);
  $('#adminLastAction').textContent = link.lastAction ? `${link.lastAction} · ${formatDate(link.lastActionAt)}` : '—';
  $('#adminAssignBtn').disabled = Boolean(link.expired) || busy;
}

function render(link, options = {}) {
  currentLink = link;
  $('#guideText').textContent = link.guideMessage || config.guideMessage || 'Chưa có hướng dẫn đăng nhập.';
  renderAdminDetails(link);
  if (link.expired) {
    setState('Link đã hết hạn.', 'danger');
    setEmpty('Link đã hết hạn', 'Vui lòng liên hệ admin để được cấp link mới.', true);
  } else if (!link.accountAssigned) {
    setState('Link đang hoạt động.', 'success');
    setEmpty('Chưa có tài khoản', 'Bấm nút bên dưới để lấy tài khoản.', false, true);
  } else {
    $('#accountCard').classList.remove('hidden');
    $('#emptyCard').classList.add('hidden');
    $('#username').value = link.username || '';
    $('#password').value = link.password || '';
    $('#status').textContent = link.accountExpired ? 'Tài khoản hết hạn' : 'Đang hoạt động';
    $('#status').className = `badge${link.accountExpired ? ' badge-danger' : ''}`;
    setState('Link đang hoạt động.', 'success');
  }
  if (options.showInitialNotice && link.expired && !initialNoticeShown) {
    initialNoticeShown = true;
    showNotice('Link hết hạn', link.linkExpiredMessage || config.linkExpiredMessage || 'Link đã hết hạn. Vui lòng liên hệ admin để được cấp link mới.');
  } else if (options.showInitialNotice && link.accountExpired && !initialNoticeShown) {
    initialNoticeShown = true;
    showNotice('Tài khoản hết hạn', link.accountExpiredMessage || config.accountExpiredMessage || 'Tài khoản đã hết hạn.');
  } else if (options.showInitialNotice && !initialNoticeShown && link.popupMessage) {
    initialNoticeShown = true;
    showNotice('Lưu ý', link.popupMessage);
  }
}

async function request(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Request thất bại.');
    error.status = response.status;
    error.retryAfterMs = Number(data.retryAfterMs || 0);
    throw error;
  }
  return data;
}

async function load() {
  if (!id) {
    setState('Link không hợp lệ.', 'danger');
    setEmpty('Link không hợp lệ', 'Vui lòng kiểm tra lại đường dẫn.', true);
    return;
  }
  try {
    const configData = await request('/api/capcut/config');
    config = configData.config || {};
    const data = await request(`/api/capcut/links/${encodeURIComponent(id)}`);
    render(data.link, { showInitialNotice: true });
  } catch (error) {
    const expired = error.status === 410;
    setState(expired ? 'Link đã hết hạn.' : error.message, 'danger');
    setEmpty(expired ? 'Link đã hết hạn' : 'Không tải được link', expired ? 'Vui lòng liên hệ admin để được cấp link mới.' : error.message, true);
    if (expired) showNotice('Link hết hạn', config.linkExpiredMessage || 'Link đã hết hạn. Vui lòng liên hệ admin để được cấp link mới.');
  }
}

async function warranty() {
  if (busy) return;
  busy = true;
  const button = $('#warrantyBtn');
  button.disabled = true;
  button.textContent = 'ĐANG KIỂM TRA...';
  setProgress('#warrantyProgress', true, 'Đang kiểm tra tài khoản...', 'Đang kết nối Google Sheet, vui lòng chờ.');
  $('#actionState').textContent = '';
  try {
    const data = await request(`/api/capcut/links/${encodeURIComponent(id)}/warranty`, { method: 'POST' });
    render(data.link);
    showNotice(data.replaced ? 'Bảo hành thành công' : 'Tài khoản còn hạn', data.message || config.warrantyMessage);
  } catch (error) {
    const message = error.status === 429 ? cooldownMessage(error) : error.message;
    $('#actionState').textContent = message;
    $('#actionState').className = 'notice-text error';
    showNotice(error.status === 429 ? 'Đang chờ cooldown' : 'Bảo hành thất bại', message);
  } finally {
    busy = false;
    setProgress('#warrantyProgress', false);
    button.disabled = false;
    button.textContent = 'BẢO HÀNH TỰ ĐỘNG';
    renderAdminDetails(currentLink);
  }
}

function cooldownMessage(error) {
  return `Bạn vừa thao tác, vui lòng thử lại sau ${Math.max(1, Math.ceil((error.retryAfterMs || 300000) / 60000))} phút.`;
}

async function claimAccount() {
  if (busy) return;
  busy = true;
  const button = $('#claimBtn');
  button.disabled = true;
  button.textContent = 'ĐANG LẤY TÀI KHOẢN...';
  setProgress('#claimProgress', true, 'Đang lấy tài khoản...', 'Đang kết nối Google Sheet, vui lòng chờ.');
  try {
    const data = await request(`/api/capcut/links/${encodeURIComponent(id)}/warranty`, { method: 'POST' });
    render(data.link);
    showNotice('Đã lấy tài khoản', data.message || 'Đã lấy tài khoản thành công.');
  } catch (error) {
    const message = error.status === 429 ? cooldownMessage(error) : error.message;
    $('#actionState').textContent = message;
    $('#actionState').className = 'notice-text error';
    showNotice(error.status === 429 ? 'Đang chờ cooldown' : 'Lấy tài khoản thất bại', error.status === 429 ? message : (config.warrantyErrorMessage || message));
  } finally {
    busy = false;
    setProgress('#claimProgress', false);
    button.disabled = false;
    button.textContent = 'LẤY TÀI KHOẢN';
  }
}

async function assignForAdmin() {
  if (busy || !token || !currentLink?.id) return;
  busy = true;
  const button = $('#adminAssignBtn');
  button.disabled = true;
  button.textContent = 'ĐANG LẤY TÀI KHOẢN...';
  setProgress('#adminProgress', true, 'Đang kết nối Google Sheet...', 'Đang lấy hàng tài khoản phù hợp.');
  try {
    const data = await request(`/api/capcut/links/${encodeURIComponent(currentLink.id)}/assign`, { method: 'POST' });
    render(data.link);
    showNotice('Đã nhập tài khoản', 'Tài khoản mới đã được cập nhật cho link này.');
  } catch (error) {
    $('#adminActionState').textContent = error.message;
    $('#adminActionState').className = 'notice-text error';
    showNotice('Nhập tài khoản thất bại', config.warrantyErrorMessage || error.message);
  } finally {
    busy = false;
    setProgress('#adminProgress', false);
    button.disabled = Boolean(currentLink?.expired);
    button.textContent = 'NHẬP TÀI KHOẢN';
  }
}

async function copyValue(value, button) {
  try {
    await navigator.clipboard.writeText(value || '');
    const original = button.textContent;
    button.textContent = 'Đã copy';
    setTimeout(() => { button.textContent = original; }, 1200);
  } catch (_) {
    button.textContent = 'Không copy được';
  }
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-copy]');
  if (button) copyValue($(`#${button.dataset.copy}`).value, button);
});
$('#warrantyBtn').addEventListener('click', warranty);
$('#claimBtn').addEventListener('click', claimAccount);
$('#adminAssignBtn').addEventListener('click', assignForAdmin);
$('#closeNotice').addEventListener('click', () => $('#notice').classList.add('hidden'));
$('#noticeOk').addEventListener('click', () => $('#notice').classList.add('hidden'));

const firebaseApp = initializeApp(window.NF_FIREBASE_CONFIG);
const auth = getAuth(firebaseApp);
onAuthStateChanged(auth, async (user) => {
  token = user ? await user.getIdToken() : '';
  await load();
});
