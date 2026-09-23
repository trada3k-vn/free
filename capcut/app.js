(function () {
  const id = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');
  const $ = (selector) => document.querySelector(selector);

  function setState(message, type = '') {
    const node = $('#state');
    node.textContent = message;
    node.className = `muted${type ? ` ${type}-text` : ''}`;
    node.style.color = type === 'success' ? '#71e3a3' : (type === 'danger' ? '#ff9caa' : '');
  }

  function showNotice(text) {
    if (!text) return;
    $('#noticeText').textContent = text;
    $('#notice').classList.remove('hidden');
  }

  function showEmpty(title, message, type = '') {
    $('#accountCard').classList.add('hidden');
    $('#emptyCard').classList.remove('hidden');
    $('#emptyTitle').textContent = title;
    $('#emptyMessage').textContent = message;
    $('#emptyCard').classList.toggle('error-card', type === 'error');
    $('#emptyCard').style.borderColor = type === 'error' ? '#a2435a' : '';
  }

  function setProgress(visible, title = '', detail = '') {
    const panel = $('#warrantyProgress');
    if (!panel) return;
    panel.classList.toggle('hidden', !visible);
    if (title) $('#warrantyProgressTitle').textContent = title;
    if (detail) $('#warrantyProgressDetail').textContent = detail;
  }

  function render(link) {
    if (link.expired) {
      setState('Link đã hết hạn.', 'danger');
      showEmpty('Link đã hết hạn', 'Vui lòng liên hệ admin để được cấp link mới.', 'error');
      return;
    }
    if (!link.accountAssigned) {
      setState('Link đang hoạt động.', 'success');
      showEmpty('Chưa có tài khoản', 'Vui lòng chờ admin cấp tài khoản cho link này.');
      showNotice(link.popupMessage);
      return;
    }
    $('#accountCard').classList.remove('hidden');
    $('#emptyCard').classList.add('hidden');
    $('#username').value = link.username || '';
    $('#password').value = link.password || '';
    $('#status').textContent = link.accountExpired ? 'Tài khoản hết hạn' : 'Đang hoạt động';
    $('#status').className = `badge${link.accountExpired ? ' badge-danger' : ''}`;
    setState('Link đang hoạt động.', 'success');
    showNotice(link.popupMessage);
  }

  async function load() {
    if (!id) {
      setState('Link không hợp lệ.', 'danger');
      showEmpty('Link không hợp lệ', 'Vui lòng kiểm tra lại đường dẫn.', 'error');
      return;
    }
    try {
      const response = await fetch(`/api/capcut/links/${encodeURIComponent(id)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { const error = new Error(data.error || 'Không tải được link.'); error.status = response.status; throw error; }
      render(data.link);
    } catch (error) {
      const expired = error && error.status === 410;
      setState(expired ? 'Link đã hết hạn.' : error.message, 'danger');
      showEmpty(expired ? 'Link đã hết hạn' : 'Không tải được link', expired ? 'Vui lòng liên hệ admin để được cấp link mới.' : error.message, 'error');
    }
  }

  async function warranty() {
    const button = $('#warrantyBtn');
    button.disabled = true;
    button.textContent = 'ĐANG KIỂM TRA...';
    setProgress(true, 'Đang kiểm tra tài khoản...', 'Đang kết nối Google Sheet, vui lòng chờ.');
    $('#actionState').textContent = '';
    try {
      const response = await fetch(`/api/capcut/links/${encodeURIComponent(id)}/warranty`, { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Bảo hành thất bại.');
      render(data.link);
      $('#actionState').textContent = data.message || 'Đã xử lý xong.';
      $('#actionState').className = 'notice-text success';
    } catch (error) {
      $('#actionState').textContent = error.message;
      $('#actionState').className = 'notice-text error';
    } finally {
      setProgress(false);
      button.disabled = false;
      button.textContent = 'BẢO HÀNH TỰ ĐỘNG';
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
  $('#closeNotice').addEventListener('click', () => $('#notice').classList.add('hidden'));
  $('#noticeOk').addEventListener('click', () => $('#notice').classList.add('hidden'));
  load();
})();
