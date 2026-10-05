import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const $ = (selector) => document.querySelector(selector);
let auth;
let token = '';
let current = null;
let historyState = { linkId: '', visible: false, loading: false, error: '', data: null, assignmentLimit: 10, warrantyLimit: 10 };

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

function renderHistory(link) {
  let panel = $('#historyPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'historyPanel';
    panel.className = 'history-panel';
    $('#assignAlert').parentElement.insertAdjacentElement('afterend', panel);
  }
  historyState = {
    linkId: String(link?.id || ''), visible: false, loading: false, error: '', data: null,
    assignmentLimit: 10, warrantyLimit: 10
  };
  const assignmentCount = Number(link?.assignmentCount || 0);
  const warrantyCount = Number(link?.warrantyCount || 0);
  panel.innerHTML = `<div class="history-heading"><div><span class="info-label">Lịch sử link</span><h3>Nhập tài khoản và bảo hành tự động</h3></div><div class="history-counts"><span><strong data-history-count="assignment">${assignmentCount}</strong> lần nhập acc</span><span><strong data-history-count="warranty">${warrantyCount}</strong> lần bảo hành</span></div></div><button class="button button-secondary history-toggle" type="button" data-history-toggle="true">Xem lịch sử</button><div class="history-content hidden"></div>`;
}

function updateHistoryView() {
  const panel = $('#historyPanel');
  if (!panel) return;
  const content = panel.querySelector('.history-content');
  const toggle = panel.querySelector('[data-history-toggle]');
  content.classList.toggle('hidden', !historyState.visible);
  toggle.textContent = historyState.visible ? 'Ẩn lịch sử' : 'Xem lịch sử';
  if (!historyState.visible) return;
  if (historyState.loading) {
    content.innerHTML = '<div class="history-loading">Đang tải lịch sử...</div>';
    return;
  }
  if (historyState.error) {
    content.innerHTML = `<div class="history-error">${historyState.error}</div>`;
    return;
  }
  if (!historyState.data) {
    content.innerHTML = '<div class="history-loading">Chưa có dữ liệu lịch sử.</div>';
    return;
  }
  const renderMore = (type, limit) => {
    const items = type === 'assignment' ? historyState.data.assignmentHistory : historyState.data.warrantyHistory;
    const ordered = (Array.isArray(items) ? items : []).slice().reverse();
    const visibleItems = ordered.slice(0, limit);
    return (visibleItems.length
      ? visibleItems.map((item) => `<div class="history-entry">${formatDate(item.at)}</div>`).join('')
      : '<span class="muted">Chưa có lịch sử.</span>')
      + (visibleItems.length < ordered.length ? `<button class="button button-secondary history-more" type="button" data-history-more="${type}">Tiếp tục</button>` : '');
  };
  content.innerHTML = `<div class="history-grid"><div><div class="history-label">Thời gian nhập acc</div><div class="history-list">${renderMore('assignment', historyState.assignmentLimit)}</div></div><div><div class="history-label">Thời gian bảo hành tự động</div><div class="history-list">${renderMore('warranty', historyState.warrantyLimit)}</div></div></div>`;
}

async function loadHistory() {
  const linkId = historyState.linkId;
  if (!linkId || historyState.loading || historyState.data) return;
  historyState.loading = true;
  historyState.error = '';
  updateHistoryView();
  try {
    const response = await api(`/api/capcut/links/${encodeURIComponent(linkId)}/history`);
    if (historyState.linkId !== linkId) return;
    const history = response.link || {};
    historyState.data = {
      assignmentHistory: Array.isArray(history.assignmentHistory) ? history.assignmentHistory : [],
      warrantyHistory: Array.isArray(history.warrantyHistory) ? history.warrantyHistory : []
    };
    current.assignmentCount = Number(history.assignmentCount || historyState.data.assignmentHistory.length);
    current.warrantyCount = Number(history.warrantyCount || historyState.data.warrantyHistory.length);
    panelCount('#historyPanel [data-history-count="assignment"]', current.assignmentCount);
    panelCount('#historyPanel [data-history-count="warranty"]', current.warrantyCount);
  } catch (error) {
    if (historyState.linkId === linkId) historyState.error = error.message || 'Không tải được lịch sử.';
  } finally {
    if (historyState.linkId === linkId) {
      historyState.loading = false;
      updateHistoryView();
    }
  }
}

function panelCount(selector, value) {
  const node = $(selector);
  if (node) node.textContent = String(value);
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
  renderHistory(link);
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
    await copyValue(data.link?.shareUrl || '', $('#copyLink'));
    setMessage('#createState', 'Đã tạo link và tự động copy link.', 'success');
    if (popup && data.link?.shareUrl) popup.location.href = data.link.shareUrl;
    if (data.assignmentError) {
      setAlert(data.assignmentError);
      setMessage('#createState', 'Link vẫn được giữ lại; có thể nhập tài khoản từ tab mới sau.', 'error');
    } else setMessage('#createState', 'Đã tạo link và tự động copy link.', 'success');
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

async function testSheet() {
  const sheetUrl = $('#sheetUrl').value.trim();
  if (!sheetUrl) {
    setMessage('#sheetTestState', 'Vui lòng nhập Apps Script URL.', 'error');
    return;
  }
  setBusy('#testSheet', true, 'ĐANG KIỂM TRA...');
  setProgress('#sheetTestProgress', true, 'Đang kiểm tra Apps Script...', 'Đang kiểm tra URL, Spreadsheet và tên Sheet.');
  setMessage('#sheetTestState');
  try {
    const data = await api('/api/capcut/sheet-test', { method: 'POST', body: JSON.stringify({ sheetAppsScriptUrl: sheetUrl }) });
    setMessage('#sheetTestState', `${data.message} Sheet: ${data.sheetName}. Hàng hợp lệ: ${data.eligibleRows}.`, 'success');
  } catch (error) {
    setMessage('#sheetTestState', error.message, 'error');
  } finally {
    setProgress('#sheetTestProgress', false);
    setBusy('#testSheet', false);
  }
}

async function copyValue(value, button) {
  try {
    const text = value || '';
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
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
$('#testSheet').addEventListener('click', testSheet);
$('#copyLink').addEventListener('click', (event) => copyValue($('#linkOutput').value, event.currentTarget));
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-copy]');
  if (button) copyValue($(`#${button.dataset.copy}`).value, button);
  const historyToggle = event.target.closest('[data-history-toggle]');
  if (historyToggle) {
    historyState.visible = !historyState.visible;
    updateHistoryView();
    if (historyState.visible) loadHistory();
  }
  const historyMore = event.target.closest('[data-history-more]');
  if (historyMore) {
    if (historyMore.dataset.historyMore === 'assignment') historyState.assignmentLimit += 10;
    if (historyMore.dataset.historyMore === 'warranty') historyState.warrantyLimit += 10;
    updateHistoryView();
  }
});
