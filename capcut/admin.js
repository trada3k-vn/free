import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const $ = (selector) => document.querySelector(selector);
let auth;
let token = '';
let current = null;

async function api(url, options = {}) {
  options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Request thất bại.');
    error.status = response.status;
    throw error;
  }
  return data;
}

function setMessage(selector, message = '', type = '') {
  const node = $(selector);
  node.textContent = message;
  node.className = `notice-text${type ? ` ${type}` : ''}`;
}

function setBusy(selector, busy, busyText = 'ĐANG XỬ LÝ...') {
  const button = $(selector);
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = busyText;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

function formatDate(value) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
}

function setAlert(message = '', type = 'error') {
  const node = $('#assignAlert');
  node.textContent = message;
  node.className = `inline-alert${message ? ` ${type}` : ' hidden'}`;
}

function setProgress(selector, visible, title = '', detail = '') {
  const panel = $(selector);
  if (!panel) return;
  panel.classList.toggle('hidden', !visible);
  if (title) panel.querySelector('[id$="ProgressTitle"]').textContent = title;
  if (detail) panel.querySelector('[id$="ProgressDetail"]').textContent = detail;
}

function renderResult(link, subtitle = 'Link đã được tạo.') {
  current = link || null;
  $('#resultCard').classList.remove('hidden');
  $('#resultSubtitle').textContent = subtitle;
  $('#linkOutput').value = link?.shareUrl || '';
  $('#linkStatus').textContent = link?.expired ? 'Đã hết hạn' : 'Đang hoạt động';
  $('#linkStatus').className = `info-value${link?.expired ? ' danger-text' : ''}`;
  $('#linkExpiry').textContent = formatDate(link?.expiresAt);

  const assigned = Boolean(link?.accountAssigned && link?.username);
  $('#accountFields').classList.toggle('hidden', !assigned);
  $('#accountStateTitle').textContent = assigned ? 'Đã có tài khoản' : 'Chưa cấp tài khoản';
  $('#accountBadge').textContent = assigned ? (link.accountExpired ? 'Đã hết hạn' : 'Đã cấp') : 'Chưa cấp';
  $('#accountBadge').className = `badge ${assigned ? (link.accountExpired ? 'badge-danger' : '') : 'badge-muted'}`;
  $('#accountUsername').value = assigned ? link.username : '';
  $('#accountPassword').value = assigned ? link.password : '';
  $('#assign').disabled = Boolean(link?.expired);
}

async function loadConfig() {
  const data = await api('/api/capcut/config');
  $('#popup').value = data.config.popupMessage || '';
  $('#guideMessage').value = data.config.guideMessage || '';
  $('#warrantyMessage').value = data.config.warrantyMessage || '';
  $('#warrantySuccessMessage').value = data.config.warrantySuccessMessage || '';
  $('#warrantyErrorMessage').value = data.config.warrantyErrorMessage || '';
  $('#accountExpiredMessage').value = data.config.accountExpiredMessage || '';
  $('#linkExpiredMessage').value = data.config.linkExpiredMessage || '';
  $('#sheetUrl').value = data.config.sheetAppsScriptUrl || '';
}

async function bootUser(user) {
  if (!user) {
    token = '';
    $('#loginCard').classList.remove('hidden');
    $('#workspace').classList.add('hidden');
    $('#logout').classList.add('hidden');
    return;
  }
  token = await user.getIdToken();
  try {
    await loadConfig();
    $('#loginCard').classList.add('hidden');
    $('#workspace').classList.remove('hidden');
    $('#logout').classList.remove('hidden');
  } catch (error) {
    setMessage('#loginState', error.message, 'error');
  }
}

async function login() {
  setBusy('#login', true, 'ĐANG ĐĂNG NHẬP...');
  setMessage('#loginState');
  try {
    await signInWithEmailAndPassword(auth, $('#email').value.trim(), $('#password').value);
  } catch (error) {
    setMessage('#loginState', error.message, 'error');
  } finally {
    setBusy('#login', false);
  }
}

async function createLink(assignImmediately = true) {
  const days = Number($('#days').value);
  const expiryDate = $('#expiryDate').value;
  if (!expiryDate && (!Number.isFinite(days) || days <= 0)) {
    setMessage('#createState', 'Vui lòng nhập số ngày hoặc chọn ngày hết hạn cụ thể.', 'error');
    return;
  }
  const popup = window.open('about:blank', '_blank');
  setBusy('#create', true, 'ĐANG TẠO LINK...');
  setBusy('#createManual', true, 'ĐANG TẠO...');
  setProgress('#createProgress', true, 'Đang tạo link...', assignImmediately ? 'Đang kết nối Google Sheet, vui lòng chờ.' : 'Chỉ tạo link, chưa nhập tài khoản.');
  setMessage('#createState');
  setAlert();
  try {
    const data = await api('/api/capcut/links', { method: 'POST', body: JSON.stringify({ addDays: days, expiryDate, assignImmediately }) });
    renderResult(data.link, data.assignmentError ? 'Link đã tạo nhưng chưa nhập được tài khoản.' : (assignImmediately ? 'Link đã tạo và nhập tài khoản.' : 'Link đã tạo, chưa nhập tài khoản.'));
    if (popup && data.link?.shareUrl) popup.location.href = data.link.shareUrl;
    if (data.assignmentError) {
      setAlert(data.assignmentError);
      setMessage('#createState', 'Link vẫn được giữ lại; có thể nhập tài khoản từ tab mới sau.', 'error');
    } else setMessage('#createState', 'Đã tạo link thành công.', 'success');
  } catch (error) {
    if (popup && !popup.closed) popup.close();
    setMessage('#createState', error.message, 'error');
  } finally {
    setProgress('#createProgress', false);
    setBusy('#create', false);
    setBusy('#createManual', false);
  }
}

async function assignAccount() {
  if (!current?.id) return;
  setBusy('#assign', true, 'ĐANG LẤY TÀI KHOẢN...');
  setProgress('#adminProgress', true, 'Đang kết nối Google Sheet...', 'Đang kiểm tra và lấy hàng tài khoản phù hợp.');
  setAlert();
  try {
    const data = await api(`/api/capcut/links/${encodeURIComponent(current.id)}/assign`, { method: 'POST' });
    renderResult(data.link, 'Đã cấp tài khoản từ Google Sheet.');
    setAlert('Đã nhập tài khoản thành công.', 'success');
  } catch (error) {
    setAlert(error.message || 'Không lấy được tài khoản từ Google Sheet.');
    setMessage('#createState', 'Link vẫn được giữ lại; bạn có thể thử nhập tài khoản lại sau.', 'error');
  } finally {
    setProgress('#adminProgress', false);
    setBusy('#assign', false);
  }
}

async function saveConfig() {
  setBusy('#saveConfig', true, 'ĐANG LƯU...');
  setMessage('#configState');
  try {
    await api('/api/capcut/config', { method: 'PUT', body: JSON.stringify({
      popupMessage: $('#popup').value,
      guideMessage: $('#guideMessage').value,
      warrantyMessage: $('#warrantyMessage').value,
      warrantySuccessMessage: $('#warrantySuccessMessage').value,
      warrantyErrorMessage: $('#warrantyErrorMessage').value,
      accountExpiredMessage: $('#accountExpiredMessage').value,
      linkExpiredMessage: $('#linkExpiredMessage').value,
      sheetAppsScriptUrl: $('#sheetUrl').value
    }) });
    setMessage('#configState', 'Đã lưu cài đặt.', 'success');
  } catch (error) {
    setMessage('#configState', error.message, 'error');
  } finally {
    setBusy('#saveConfig', false);
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

const app = initializeApp(window.NF_FIREBASE_CONFIG);
auth = getAuth(app);
onAuthStateChanged(auth, bootUser);
$('#login').addEventListener('click', login);
$('#logout').addEventListener('click', () => signOut(auth));
$('#create').addEventListener('click', () => createLink(true));
$('#createManual').addEventListener('click', () => createLink(false));
$('#assign').addEventListener('click', assignAccount);
$('#saveConfig').addEventListener('click', saveConfig);
$('#copyLink').addEventListener('click', (event) => copyValue($('#linkOutput').value, event.currentTarget));
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-copy]');
  if (button) copyValue($(`#${button.dataset.copy}`).value, button);
});
