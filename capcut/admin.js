import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const $ = (selector) => document.querySelector(selector);
let auth;
let token = '';
let current = null;
let historyState = { visible: false, loading: false, error: '', data: null, limit: 10 };
let settingsOpen = false;

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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function ensureHistoryPanel() {
  let panel = $('#globalHistoryCard');
  if (panel) return panel;
  const settings = $('#saveConfig')?.closest('section');
  if (!settings) return null;
  panel = document.createElement('section');
  panel.id = 'globalHistoryCard';
  panel.className = 'card history-panel global-history-panel';
  settings.insertAdjacentElement('beforebegin', panel);
  renderGlobalHistoryPanel();
  return panel;
}

function renderGlobalHistoryPanel() {
  const panel = $('#globalHistoryCard');
  if (!panel) return;
  const data = historyState.data || {};
  panel.innerHTML = `<div class="history-heading"><div><span class="info-label">Lịch sử hoạt động</span><h2>Lịch sử tất cả link</h2><p class="muted">Theo dõi các lần nhập tài khoản và bảo hành tự động.</p></div><div class="history-counts"><span><strong data-history-summary="assignment">${Number(data.assignmentCount || 0)}</strong> lần nhập acc</span><span><strong data-history-summary="warranty">${Number(data.warrantyCount || 0)}</strong> lần bảo hành</span><span><strong data-history-summary="link">${Number(data.linkCount || 0)}</strong> link</span></div></div><button class="button button-secondary history-toggle" type="button" data-global-history-toggle="true">Xem lịch sử</button><div class="history-content hidden"></div>`;
}

function updateGlobalHistoryView() {
  const panel = ensureHistoryPanel();
  if (!panel) return;
  const content = panel.querySelector('.history-content');
  const toggle = panel.querySelector('[data-global-history-toggle]');
  const data = historyState.data || {};
  panel.querySelector('[data-history-summary="assignment"]').textContent = String(Number(data.assignmentCount || 0));
  panel.querySelector('[data-history-summary="warranty"]').textContent = String(Number(data.warrantyCount || 0));
  panel.querySelector('[data-history-summary="link"]').textContent = String(Number(data.linkCount || 0));
  content.classList.toggle('hidden', !historyState.visible);
  toggle.textContent = historyState.visible ? 'Ẩn lịch sử' : 'Xem lịch sử';
  if (!historyState.visible) return;
  if (historyState.loading) {
    content.innerHTML = '<div class="history-loading">Đang tải lịch sử...</div>';
    return;
  }
  if (historyState.error) {
    content.innerHTML = `<div class="history-error">${escapeHtml(historyState.error)}</div>`;
    return;
  }
  if (!historyState.data) {
    content.innerHTML = '<div class="history-loading">Chưa có dữ liệu lịch sử.</div>';
    return;
  }
  const events = Array.isArray(historyState.data.events) ? historyState.data.events : [];
  const visible = events.slice(0, historyState.limit);
  const rows = visible.length ? visible.map((item) => {
    const isWarranty = item.type === 'warranty';
    const label = isWarranty ? 'Bảo hành tự động' : 'Nhập tài khoản';
    return `<div class="global-history-entry"><div class="global-history-main"><span class="history-event-type ${isWarranty ? 'warranty' : 'assignment'}">${label}</span><a href="${escapeHtml(item.shareUrl)}" target="_blank" rel="noopener">${escapeHtml(item.linkId)}</a></div><time>${formatDate(item.at)}</time></div>`;
  }).join('') : '<span class="muted">Chưa có lịch sử.</span>';
  const more = visible.length < events.length ? '<button class="button button-secondary history-more" type="button" data-global-history-more="true">Tiếp tục</button>' : '';
  content.innerHTML = `<div class="global-history-list">${rows}${more}</div>`;
}

async function loadGlobalHistory() {
  if (historyState.loading || historyState.data) return;
  historyState.loading = true;
  historyState.error = '';
  updateGlobalHistoryView();
  try {
    const data = await api('/api/capcut/history');
    historyState.data = {
      events: Array.isArray(data.events) ? data.events : [],
      assignmentCount: Number(data.assignmentCount || 0),
      warrantyCount: Number(data.warrantyCount || 0),
      linkCount: Number(data.linkCount || 0)
    };
  } catch (error) {
    historyState.error = error.message || 'Không tải được lịch sử.';
  } finally {
    historyState.loading = false;
    updateGlobalHistoryView();
  }
}

function setupSettingsPanel() {
  const section = $('#saveConfig')?.closest('section');
  if (!section || section.dataset.collapsibleReady) return;
  section.dataset.collapsibleReady = 'true';
  const heading = section.querySelector('.section-heading');
  const content = document.createElement('div');
  content.className = 'settings-content hidden';
  while (heading.nextSibling) content.appendChild(heading.nextSibling);
  section.appendChild(content);
  heading.classList.add('settings-toggle');
  heading.setAttribute('role', 'button');
  heading.setAttribute('tabindex', '0');
  heading.setAttribute('aria-expanded', 'false');
  heading.insertAdjacentHTML('beforeend', '<span class="settings-chevron" aria-hidden="true">⌄</span>');
}

function toggleSettings() {
  setSettingsOpen(!settingsOpen);
}

function setSettingsOpen(open) {
  const heading = $('.settings-toggle');
  const content = $('.settings-content');
  if (!heading || !content) return;
  settingsOpen = Boolean(open);
  content.classList.toggle('hidden', !settingsOpen);
  heading.classList.toggle('expanded', settingsOpen);
  heading.setAttribute('aria-expanded', String(settingsOpen));
}

function dateInputValue(value) {
  const date = new Date(value || '');
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ensureLinkManagementPanel() {
  let panel = $('#linkManagementPanel');
  if (panel) return panel;
  const infoGrid = $('#linkStatus')?.closest('.info-grid');
  if (!infoGrid) return null;
  panel = document.createElement('div');
  panel.id = 'linkManagementPanel';
  panel.className = 'link-management-panel hidden';
  infoGrid.insertAdjacentElement('afterend', panel);
  panel.innerHTML = `<div class="management-heading"><div><span class="info-label">Quản lý link</span><h3>Thời hạn và trạng thái</h3></div><span class="badge badge-muted">Admin</span></div><div class="management-grid"><label class="field"><span>Đặt ngày hết hạn mới</span><div class="management-action"><input id="linkExpiryInput" class="input" type="date"><button id="updateExpiry" class="button button-secondary" type="button">Cập nhật hạn</button></div></label><label class="field"><span>Cộng thêm thời hạn</span><div class="management-action"><input id="extendDaysInput" class="input" type="number" min="1" max="3650" placeholder="Số ngày"><button id="extendExpiry" class="button button-secondary" type="button">Cộng ngày</button></div></label></div><div class="management-actions"><button id="revokeLink" class="button button-danger" type="button">Thu hồi link</button><button id="restoreLink" class="button button-primary hidden" type="button">Khôi phục link</button></div><p id="linkManagementState" class="notice-text"></p>`;
  panel.querySelector('#updateExpiry').addEventListener('click', () => manageLink('expiry'));
  panel.querySelector('#extendExpiry').addEventListener('click', () => manageLink('extend'));
  panel.querySelector('#revokeLink').addEventListener('click', () => manageLink('revoke'));
  panel.querySelector('#restoreLink').addEventListener('click', () => manageLink('restore'));
  return panel;
}

function setManagementBusy(busy) {
  const panel = $('#linkManagementPanel');
  if (!panel) return;
  panel.querySelectorAll('button, input').forEach((control) => { control.disabled = busy; });
}

function renderLinkManagement(link) {
  const panel = ensureLinkManagementPanel();
  if (!panel) return;
  panel.classList.remove('hidden');
  $('#linkExpiryInput').value = dateInputValue(link?.expiresAt);
  $('#extendDaysInput').value = '';
  $('#revokeLink').classList.toggle('hidden', link?.status === 'revoked');
  $('#restoreLink').classList.toggle('hidden', link?.status !== 'revoked');
  $('#linkManagementState').textContent = '';
  $('#linkManagementState').className = 'notice-text';
}

async function manageLink(action) {
  if (!current?.id) return;
  if (action === 'revoke' && !window.confirm('Bạn có chắc muốn thu hồi link này không?')) return;
  const panel = ensureLinkManagementPanel();
  const state = $('#linkManagementState');
  const requestOptions = { method: action === 'expiry' ? 'PATCH' : 'POST' };
  if (action === 'expiry') {
    const expiryDate = $('#linkExpiryInput').value;
    if (!expiryDate) {
      state.textContent = 'Vui lòng chọn ngày hết hạn mới.';
      state.className = 'notice-text error';
      return;
    }
    requestOptions.body = JSON.stringify({ expiryDate });
  } else if (action === 'extend') {
    const days = Number($('#extendDaysInput').value);
    if (!Number.isFinite(days) || days <= 0) {
      state.textContent = 'Vui lòng nhập số ngày cộng thêm hợp lệ.';
      state.className = 'notice-text error';
      return;
    }
    requestOptions.body = JSON.stringify({ days });
  }
  setManagementBusy(true);
  state.textContent = 'Đang cập nhật link...';
  state.className = 'notice-text';
  try {
    const data = await api(`/api/capcut/links/${encodeURIComponent(current.id)}/${action}`, requestOptions);
    renderResult(data.link, action === 'revoke' ? 'Link đã được thu hồi.' : action === 'restore' ? 'Link đã được khôi phục.' : 'Đã cập nhật link.');
    $('#linkManagementState').textContent = 'Đã cập nhật link thành công.';
    $('#linkManagementState').className = 'notice-text success';
  } catch (error) {
    state.textContent = error.message || 'Không cập nhật được link.';
    state.className = 'notice-text error';
  } finally {
    setManagementBusy(false);
  }
}

function renderResult(link, subtitle = 'Link đã được tạo.') {
  current = link || null;
  $('#resultCard').classList.remove('hidden');
  $('#resultSubtitle').textContent = subtitle;
  $('#linkOutput').value = link?.shareUrl || '';
  const revoked = link?.status === 'revoked';
  $('#linkStatus').textContent = revoked ? 'Đã thu hồi' : (link?.expired ? 'Đã hết hạn' : 'Đang hoạt động');
  $('#linkStatus').className = `info-value${revoked || link?.expired ? ' danger-text' : ''}`;
  $('#linkExpiry').textContent = formatDate(link?.expiresAt);

  const assigned = Boolean(link?.accountAssigned && link?.username);
  $('#accountFields').classList.toggle('hidden', !assigned);
  $('#accountStateTitle').textContent = assigned ? 'Đã có tài khoản' : 'Chưa cấp tài khoản';
  $('#accountBadge').textContent = assigned ? (link.accountExpired ? 'Đã hết hạn' : 'Đã cấp') : 'Chưa cấp';
  $('#accountBadge').className = `badge ${assigned ? (link.accountExpired ? 'badge-danger' : '') : 'badge-muted'}`;
  $('#accountUsername').value = assigned ? link.username : '';
  $('#accountPassword').value = assigned ? link.password : '';
  $('#assign').disabled = Boolean(link?.expired);
  renderLinkManagement(link);
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
    historyState = { visible: false, loading: false, error: '', data: null, limit: 10 };
    settingsOpen = false;
    setSettingsOpen(false);
    $('#loginCard').classList.remove('hidden');
    $('#workspace').classList.add('hidden');
    $('#logout').classList.add('hidden');
    return;
  }
  token = await user.getIdToken();
  try {
    await loadConfig();
    setupSettingsPanel();
    ensureHistoryPanel();
    renderGlobalHistoryPanel();
    setSettingsOpen(false);
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
  const historyToggle = event.target.closest('[data-global-history-toggle]');
  if (historyToggle) {
    historyState.visible = !historyState.visible;
    updateGlobalHistoryView();
    if (historyState.visible) loadGlobalHistory();
  }
  const historyMore = event.target.closest('[data-global-history-more]');
  if (historyMore) {
    historyState.limit += 10;
    updateGlobalHistoryView();
  }
  if (event.target.closest('.settings-toggle')) toggleSettings();
});
document.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.settings-toggle')) {
    event.preventDefault();
    toggleSettings();
  }
});
