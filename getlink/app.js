
const UNSUPPORTED_URL = 'https://www.netflix.com/unsupported';
const TV2_URL = 'https://www.netflix.com/tv2';
const SUPPORT_FANPAGE_URL = 'https://www.facebook.com/trada3k.vn/';
const GETLINK_ADMIN_AUTH_STORAGE_KEY = 'getlink_admin_auth_v1';
const GETLINK_OPERATION_POLL_INTERVAL_MS = 1800;
const GETLINK_LOADING_REASSURANCE_DELAY_MS = 10000;
const GETLINK_SHEET_IMPORT_OPERATION_STORAGE_PREFIX = 'getlink_sheet_import_operation_';
const GETLINK_AUTO_FIX_OPERATION_STORAGE_KEY = 'getlink_auto_fix_operation';
const DEFAULT_GETLINK_WARNING_MESSAGE = 'LƯU Ý';
const DEFAULT_GETLINK_WARNING_SUBMESSAGE = '';
const DEFAULT_SHEET_ACCESS_ENABLED = true;
const DEFAULT_GETLINK_CONTENT = {
    disclaimer: {
        eyebrow: 'Lưu ý trước khi sử dụng',
        title: 'Thông báo quan trọng',
        lead: '❌ LƯU Ý PHẢI ĐỌC (QUAN TRỌNG) ❌',
        items: [
            'Đăng nhập không giới hạn thiết bị, NHƯNG chỉ xem phim cùng 1 lúc trên 1 THIẾT BỊ, xem hơn sẽ bị Netflix đánh spam và từ chối bảo hành.',
            'Không chỉnh lung tung trong phần cài đặt.',
            'Nếu gặp BẤT CỨ VẤN ĐỀ gì, nhắn vào page cú pháp 𝗕𝗛𝟮𝟰𝟳 để được hỗ trợ và bảo hành!'
        ],
        waitText: 'Vui lòng chờ {seconds} giây để bỏ qua popup.',
        readyText: 'Bạn có thể bấm Bỏ qua để tiếp tục.',
        dismissText: 'Bỏ qua'
    },
    mobileGuides: {
        android: {
            modalTitle: 'Tạo link đăng nhập thành công',
            guideTitle: 'Hướng dẫn đăng nhập trên điện thoại',
            steps: [
                'Bước 0 (Quan trọng): Đóng HOÀN TOÀN App Netflix trong đa nhiệm',
                'Bước 1: Sao chép đường link đăng nhập phía trên',
                'Bước 2: Dán vào trình duyệt mặc định trên điện thoại và truy cập',
                'Bước 3: Truy cập tiếp trang netflix.com/unsupported',
                'Bước 4: Nếu có hỏi thì bấm ĐỒNG Ý hoặc TIẾP TỤC'
            ],
            copyUnsupportedText: 'Sao chép link'
        },
        ios: {
            modalTitle: 'Tạo link đăng nhập thành công',
            guideTitle: 'Hướng dẫn đăng nhập trên điện thoại',
            steps: [
                'Bước 0 (Quan trọng): Đóng HOÀN TOÀN App Netflix trong đa nhiệm',
                'Bước 1: Sao chép đường link đăng nhập phía trên',
                'Bước 2: Dán vào Safari và truy cập',
                'Bước 3: Truy cập tiếp trang netflix.com/unsupported',
                'Bước 4: Nếu có hỏi thì bấm ĐỒNG Ý hoặc TIẾP TỤC'
            ],
            copyUnsupportedText: 'Sao chép link'
        }
    },
    tvGuide: {
        modalTitle: 'Tạo link đăng nhập thành công',
        guideTitle: 'Hướng dẫn đăng nhập trên Tivi',
        steps: [
            'Bước 1: Vào Netflix trên TIVI để lấy mã đăng nhập Netflix',
            'Bước 2: Copy đường link phía trên và dán vào trình duyệt của bạn',
            'Bước 3: Truy cập tiếp Netflix.com/tv2',
            'Bước 4: Nhập mã ở bước 1 vào'
        ],
        copyTv2Text: 'Sao chép link'
    },
    deviceConfirm: {
        titleTemplate: 'Bạn có chắc chắn đang dùng {device} không?',
        hint: 'Vui lòng xác nhận đúng thiết bị để tiếp tục.',
        waitText: 'Vui lòng chờ {seconds} giây để xác nhận.',
        readyText: 'Bạn có thể bấm Có để tiếp tục.',
        okText: 'Có',
        cancelText: 'Hủy'
    },
    fix: {
        common: {
            confirmText: 'Đồng ý rồi sử dụng',
            cancelText: 'Hủy',
            waitText: 'Vui lòng chờ {seconds} giây để xác nhận.',
            readyText: 'Bạn có thể bấm Đồng ý rồi sử dụng.',
            successMessage: 'Đã sửa lỗi thành công, hãy chọn lại thiết bị và tiến hành tạo link lại từ đầu.'
        },
        overload: {
            buttonText: 'SỬA LỖI QUÁ TẢI THIẾT BỊ SỬ DỤNG',
            actionLabel: 'sửa lỗi quá tải',
            eyebrow: 'Sửa lỗi quá tải',
            title: 'SỬA LỖI QUÁ TẢI THIẾT BỊ SỬ DỤNG',
            rules: [
                'CHỈ sử dụng tính năng này khi tài khoản ĐANG BỊ QUÁ TẢI sử dụng dẫn đến không coi được',
                'Nếu sử dụng khi thật sự KHÔNG BỊ QUÁ TẢI sẽ dẫn đến bị TRỪ ĐI HẠN BẢO HÀNH'
            ],
            mobileNote: 'Lưu ý cho thiết bị di động: Cần đăng xuất tài khoản ở trên ứng dụng Netflix trước khi sửa lỗi quá tải.',
            successEyebrow: 'Đã sửa lỗi',
            successTitle: 'Đã sửa lỗi thành công',
            busyLabel: 'Đang sửa lỗi...',
            loadingText: 'Đang kiểm tra cookie và chuẩn bị sửa lỗi quá tải...',
            fallbackError: 'Không thể sửa lỗi quá tải lúc này.'
        },
        household: {
            buttonText: 'SỬA LỖI HỘ GIA ĐÌNH',
            actionLabel: 'sửa lỗi hộ gia đình',
            eyebrow: 'Sửa lỗi hộ gia đình',
            title: 'SỬA LỖI HỘ GIA ĐÌNH',
            rules: [
                'CHỈ sử dụng tính năng này khi tài khoản ĐANG BỊ LỖI HỘ GIA ĐÌNH dẫn đến không coi được',
                'Nếu sử dụng khi thật sự KHÔNG BỊ LỖI HỘ GIA ĐÌNH sẽ dẫn đến bị TRỪ ĐI HẠN BẢO HÀNH'
            ],
            mobileNote: 'Lưu ý cho thiết bị di động: Cần đăng xuất tài khoản ở trên ứng dụng Netflix trước khi sửa lỗi hộ gia đình.',
            successEyebrow: 'Đã sửa lỗi hộ gia đình',
            successTitle: 'Đã sửa lỗi hộ gia đình thành công',
            busyLabel: 'Đang sửa lỗi...',
            loadingText: 'Đang kiểm tra cookie và chuẩn bị sửa lỗi hộ gia đình...',
            fallbackError: 'Không thể sửa lỗi hộ gia đình lúc này.'
        }
    },
    support: {
        eyebrow: 'Hỗ trợ / Bảo hành',
        title: 'Cần hỗ trợ tài khoản Netflix?',
        message: 'Vui lòng nhắn tin qua fanpage để được hỗ trợ bảo hành nhanh nhất.',
        bh247Text: 'Hãy nhắn chính xác cú pháp BH247 vào page để được hỗ trợ và bảo hành.',
        autoFixText: 'SỬA LỖI TỰ ĐỘNG',
        fanpageText: 'Truy cập fanpage TRÀ ĐÁ 3K',
        warrantyButtonText: 'CẦN HỖ TRỢ / BẢO HÀNH'
    }
};

let busy = false;
let mobileGeneratedLink = '';
let tvGeneratedLink = '';
let adminAuthenticated = false;
let adminIdToken = '';
let adminRefreshToken = '';
let adminEmail = '';
let adminSessionResolved = false;
let adminTokenRefreshPromise = null;
let adminActiveTab = 'search';
let adminTabManuallySelected = false;
let runtimeCookie = '';
let runtimeShareDesktopOnly = false;
let currentAdminShare = null;
let currentFixHistory = null;
let fixHistoryExpanded = false;
let fixHistorySort = 'desc';
let createdAdminShare = null;
let pendingShareIdFromUrl = '';
let autoLoadedAdminShareId = '';
let runtimeProfiles = '';
let guestGuardActive = true;
let pendingDeviceConfirm = '';
let deviceConfirmReadyAt = 0;
let deviceConfirmTimer = null;
let pendingMobileOsDevice = '';
let cookieHealthBlocked = false;
let cookieHealthReason = '';
let disclaimerVisible = false;
let disclaimerDismissed = false;
let disclaimerReadyAt = 0;
let disclaimerTimer = null;
let disclaimerEligibilityResolved = false;
let runtimeMaxStreams = '';
let upgradeNoticeVisible = false;
let upgradeNoticeShown = false;
let upgradeNoticePending = false;
let upgradeNoticeReadyAt = 0;
let upgradeNoticeTimer = null;
let isInlineEditMode = false;
let overloadFixReadyAt = 0;
let overloadFixTimer = null;
let overloadFixBusy = false;
let overloadFixLoadingTimer = null;
let overloadFixLoadingStartedAt = 0;
let activeFixMode = 'overload';
let entryAlertState = null;
let supportModalState = null;
let supportLoadingTimer = null;
let supportLoadingStartedAt = 0;
let shareAutoFixBusy = false;
let warningBannerConfig = {
    message: DEFAULT_GETLINK_WARNING_MESSAGE,
    submessage: DEFAULT_GETLINK_WARNING_SUBMESSAGE,
    sheetAccessEnabled: DEFAULT_SHEET_ACCESS_ENABLED,
    sheetAppsScriptUrl: '',
    overloadFixEnabled: true,
    householdFixEnabled: true
};
let warningBannerConfigLoaded = false;
const activeGetlinkOperationTimers = new Map();
let toastTimer = null;
let toastNode = null;
const SHARE_COOKIE_SLOTS = [
    { key: 'primary', label: 'Cookie chính', viewInputId: 'currentShareCookiePrimaryDisplay', viewStateId: 'currentShareCookiePrimaryState', viewCheckBtnId: 'viewCheckPrimaryCookieBtn', viewUseBtnId: 'viewUsePrimaryCookieBtn' },
    { key: 'backup1', label: 'Cookie phụ 1', viewInputId: 'currentShareCookieBackup1Display', viewStateId: 'currentShareCookieBackup1State', viewCheckBtnId: 'viewCheckBackup1CookieBtn', viewUseBtnId: 'viewUseBackup1CookieBtn' },
    { key: 'backup2', label: 'Cookie phụ 2', viewInputId: 'currentShareCookieBackup2Display', viewStateId: 'currentShareCookieBackup2State', viewCheckBtnId: 'viewCheckBackup2CookieBtn', viewUseBtnId: 'viewUseBackup2CookieBtn' }
];
const CREATED_SHARE_COOKIE_SLOTS = [
    { key: 'primary', label: 'Cookie chính', viewInputId: 'creatorShareCookiePrimaryInput', viewStateId: 'creatorShareCookiePrimaryState', viewCheckBtnId: 'creatorCheckPrimaryCookieBtn', viewUseBtnId: 'creatorUsePrimaryCookieBtn' },
    { key: 'backup1', label: 'Cookie phụ 1', viewInputId: 'creatorShareCookieBackup1Input', viewStateId: 'creatorShareCookieBackup1State', viewCheckBtnId: 'creatorCheckBackup1CookieBtn', viewUseBtnId: 'creatorUseBackup1CookieBtn' },
    { key: 'backup2', label: 'Cookie phụ 2', viewInputId: 'creatorShareCookieBackup2Input', viewStateId: 'creatorShareCookieBackup2State', viewCheckBtnId: 'creatorCheckBackup2CookieBtn', viewUseBtnId: 'creatorUseBackup2CookieBtn' }
];
const SHEET_IMPORT_SLOT_META = [
    { key: 'primary', label: 'Cookie chính' },
    { key: 'backup1', label: 'Cookie phụ 1' },
    { key: 'backup2', label: 'Cookie phụ 2' }
];

function el(id) {
    return document.getElementById(id);
}

function setStateClass(target, mode = 'idle') {
    if (!target) return;
    target.classList.remove('state-idle', 'state-loading', 'state-success', 'state-warning', 'state-error');
    if (mode === 'loading') target.classList.add('state-loading');
    else if (mode === 'success') target.classList.add('state-success');
    else if (mode === 'warning') target.classList.add('state-warning');
    else if (mode === 'error') target.classList.add('state-error');
    else target.classList.add('state-idle');
}

function ensureToastNode() {
    if (toastNode && document.body && document.body.contains(toastNode)) return toastNode;
    if (!document.body) return null;
    toastNode = document.createElement('div');
    toastNode.className = 'toast hidden';
    toastNode.setAttribute('role', 'status');
    toastNode.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastNode);
    return toastNode;
}

function showToast(message, variant = 'ok', duration = 2800) {
    const normalized = String(message || '').trim();
    if (!normalized) return;
    const node = ensureToastNode();
    if (!node) return;
    if (toastTimer) {
        window.clearTimeout(toastTimer);
        toastTimer = null;
    }
    const normalizedVariant = variant === 'bad' ? 'bad' : (variant === 'warn' ? 'warn' : 'ok');
    node.textContent = normalized;
    node.className = `toast ${normalizedVariant}`;
    toastTimer = window.setTimeout(() => {
        if (toastNode) toastNode.className = 'toast hidden';
        toastTimer = null;
    }, Math.max(1200, Number(duration) || 2800));
}

function setLookupState(text, mode = 'idle') {
    const node = el('lookupState');
    if (!node) return;
    const normalized = String(text || '').trim();
    node.textContent = normalized;
    node.classList.toggle('hidden', !normalized);
    setStateClass(node, mode);
}

function renderRuntimeProfileState() {
    const node = el('runtimeProfileState');
    if (!node) return;
    const text = String(runtimeProfiles || '').trim() || 'Chưa có';
    let label = node.querySelector('.runtime-profile-label');
    let badge = node.querySelector('.runtime-profile-badge');
    if (!label || !badge) {
        node.textContent = '';
        label = document.createElement('span');
        label.className = 'runtime-profile-label';
        label.textContent = 'Phiên tài khoản hiện tại:';
        badge = document.createElement('span');
        badge.className = 'runtime-profile-badge';
        node.appendChild(label);
        node.appendChild(badge);
    }
    label.textContent = 'Phiên tài khoản hiện tại:';
    badge.textContent = text;
    setStateClass(node, text === 'Chưa có' ? 'idle' : (text === 'Đang kiểm tra...' ? 'loading' : 'success'));
}

function setRuntimeProfiles(value = '') {
    const normalized = String(value || '').trim();
    runtimeProfiles = normalized || 'Không rõ';
    renderRuntimeProfileState();
}

function setRuntimeProfilesLoading() {
    runtimeProfiles = 'Đang kiểm tra...';
    renderRuntimeProfileState();
}

function clearRuntimeProfiles() {
    runtimeProfiles = '';
    renderRuntimeProfileState();
}

function setRuntimeMaxStreams(value = '') {
    runtimeMaxStreams = String(value || '').trim();
}

function shouldShowUpgradeNotice() {
    return canShowPromotionalPopups() && runtimeMaxStreams === '2';
}

function refreshUpgradeNoticeButton() {
    const checkbox = el('upgradeNoticeUnderstood');
    const dismissBtn = el('upgradeNoticeDismissBtn');
    if (!checkbox || !dismissBtn) return;
    dismissBtn.disabled = !(Date.now() >= upgradeNoticeReadyAt && checkbox.checked);
}

function setUpgradeNoticeState(text, mode = 'idle') {
    const node = el('upgradeNoticeCountdown');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function openUpgradeNoticeModal() {
    if (!shouldShowUpgradeNotice() || upgradeNoticeShown || upgradeNoticeVisible) return;
    upgradeNoticePending = false;
    upgradeNoticeShown = true;
    upgradeNoticeVisible = true;
    const modal = el('upgradeNoticeModal');
    const checkbox = el('upgradeNoticeUnderstood');
    upgradeNoticeReadyAt = Date.now() + 3000;
    if (checkbox) checkbox.checked = false;
    setUpgradeNoticeState('Vui lòng chờ 3 giây để bỏ qua popup.', 'warning');
    refreshUpgradeNoticeButton();

    if (upgradeNoticeTimer) window.clearInterval(upgradeNoticeTimer);
    upgradeNoticeTimer = window.setInterval(() => {
        const remainMs = Math.max(0, upgradeNoticeReadyAt - Date.now());
        if (remainMs > 0) {
            setUpgradeNoticeState(`Vui lòng chờ ${Math.ceil(remainMs / 1000)} giây để bỏ qua popup.`, 'warning');
        } else {
            const understood = !!el('upgradeNoticeUnderstood')?.checked;
            setUpgradeNoticeState(
                understood ? 'Bạn có thể bấm Bỏ qua để tiếp tục.' : 'Hãy tick vào “Tôi đã hiểu” để bỏ qua popup.',
                understood ? 'success' : 'warning'
            );
            window.clearInterval(upgradeNoticeTimer);
            upgradeNoticeTimer = null;
        }
        refreshUpgradeNoticeButton();
    }, 150);

    if (modal) {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeUpgradeNoticeModal() {
    const modal = el('upgradeNoticeModal');
    if (upgradeNoticeTimer) {
        window.clearInterval(upgradeNoticeTimer);
        upgradeNoticeTimer = null;
    }
    upgradeNoticeVisible = false;
    upgradeNoticeReadyAt = 0;
    if (modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }
    const checkbox = el('upgradeNoticeUnderstood');
    const dismissBtn = el('upgradeNoticeDismissBtn');
    if (checkbox) checkbox.checked = false;
    if (dismissBtn) dismissBtn.disabled = true;
    updateReadyState();
}

function requestUpgradeNotice() {
    if (!shouldShowUpgradeNotice() || upgradeNoticeShown) return;
    if (!disclaimerEligibilityResolved) {
        upgradeNoticePending = true;
        return;
    }
    const disclaimerModal = el('disclaimerModal');
    if (disclaimerModal && !disclaimerModal.classList.contains('hidden')) {
        upgradeNoticePending = true;
        return;
    }
    openUpgradeNoticeModal();
}

function extractProfilesFromChecks(checks = [], resolvedSlot = '') {
    const list = Array.isArray(checks) ? checks : [];
    const slot = String(resolvedSlot || '').trim();
    const candidates = [
        slot ? list.find((item) => item && item.slot === slot && item.summary && item.summary.profiles) : null,
        list.find((item) => item && item.ok && item.summary && item.summary.profiles),
        list.find((item) => item && item.summary && item.summary.profiles)
    ];
    const matched = candidates.find(Boolean);
    return matched && matched.summary ? String(matched.summary.profiles || '').trim() : '';
}

function resetEntryAlertState() {
    entryAlertState = null;
}

function setEntryAlertState(payload = null) {
    entryAlertState = payload && typeof payload === 'object' ? { ...payload } : null;
}

function getDefaultSupportModalContent() {
    const support = getContentConfig().support;
    return {
        eyebrow: support.eyebrow,
        title: support.title,
        message: support.message,
        showBh247: false,
        closable: true,
        showAutoFix: false,
        isLoading: false,
        loadingText: 'Hệ thống đang xử lý, bạn đợi xíu nha.',
        loadingStartedAt: 0,
        reloadOnClose: false,
        fanpageText: support.fanpageText
    };
}

function clearSupportLoadingTimer() {
    if (supportLoadingTimer) {
        window.clearTimeout(supportLoadingTimer);
        supportLoadingTimer = null;
    }
}

function syncSupportLoadingNotice(content = {}) {
    const loadingWrap = el('supportModalLoading');
    const loadingLate = el('supportModalLoadingLate');
    if (!content.isLoading) {
        clearSupportLoadingTimer();
        supportLoadingStartedAt = 0;
        if (loadingLate) loadingLate.classList.add('hidden');
        return;
    }

    const explicitStartedAt = Math.max(0, Number(content.loadingStartedAt || 0) || 0);
    if (supportLoadingStartedAt > 0 && explicitStartedAt > 0) {
        supportLoadingStartedAt = Math.min(supportLoadingStartedAt, explicitStartedAt);
    } else {
        supportLoadingStartedAt = explicitStartedAt || supportLoadingStartedAt || Date.now();
    }

    const showLateNotice = () => {
        if (loadingLate) loadingLate.classList.remove('hidden');
        supportLoadingTimer = null;
    };
    const remainingMs = Math.max(0, GETLINK_LOADING_REASSURANCE_DELAY_MS - (Date.now() - supportLoadingStartedAt));
    clearSupportLoadingTimer();
    if (remainingMs <= 0) {
        showLateNotice();
        return;
    }

    if (loadingLate) loadingLate.classList.add('hidden');
    supportLoadingTimer = window.setTimeout(showLateNotice, remainingMs);
    if (loadingWrap) loadingWrap.setAttribute('data-loading-started-at', String(supportLoadingStartedAt));
}

function renderSupportModalContent(payload = null) {
    const content = {
        ...getDefaultSupportModalContent(),
        ...(payload && typeof payload === 'object' ? payload : {})
    };
    supportModalState = { ...content };
    const eyebrow = el('supportModalEyebrow');
    const title = el('supportModalTitle');
    const message = el('supportModalMessage');
    const bh247 = el('supportModalBh247');
    const loadingWrap = el('supportModalLoading');
    const loadingText = el('supportModalLoadingText');
    const actions = el('supportModalActions');
    const closeBtn = el('supportModalCloseBtn');
    const autoFixBtn = el('supportModalAutoFixBtn');
    if (eyebrow) eyebrow.textContent = String(content.eyebrow || 'Hỗ trợ / Bảo hành').trim();
    if (title) title.textContent = String(content.title || 'Cần hỗ trợ tài khoản Netflix?').trim();
    if (message) {
        const messageText = String(content.message || '').trim();
        message.textContent = messageText;
        message.classList.toggle('hidden', !messageText);
    }
    if (bh247) bh247.classList.toggle('hidden', !content.showBh247);
    if (bh247) bh247.textContent = getContentConfig().support.bh247Text;
    if (loadingWrap) loadingWrap.classList.toggle('hidden', !content.isLoading);
    if (loadingText) loadingText.textContent = String(content.loadingText || '').trim();
    syncSupportLoadingNotice(content);
    if (actions) actions.classList.toggle('hidden', !!content.isLoading);
    if (closeBtn) closeBtn.classList.toggle('hidden', !content.closable);
    if (autoFixBtn) {
        autoFixBtn.classList.toggle('hidden', !content.showAutoFix || !isSheetAccessEnabled());
        autoFixBtn.disabled = !!content.isLoading || shareAutoFixBusy || !isSheetAccessEnabled();
        autoFixBtn.textContent = getContentConfig().support.autoFixText;
    }
}

function showEntryAlertPopup(payload = {}) {
    if (!canShowPromotionalPopups()) return;
    openSupportModal(payload);
}

function hideEntryAlertPopup() {
    renderSupportModalContent(getDefaultSupportModalContent());
    closeSupportModal({ force: true });
}

function setShareState(text, mode = 'idle') {
    const node = el('shareState');
    if (!node) return;
    const normalized = String(text || '').trim();
    node.textContent = normalized;
    node.classList.toggle('hidden', !normalized);
    setStateClass(node, mode);
}

function setDisclaimerState(text, mode = 'idle') {
    const node = el('disclaimerCountdown');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function setAdminAuthState(text, mode = 'idle') {
    const node = el('adminAuthState');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function setAdminSearchState(text, mode = 'idle') {
    const node = el('adminSearchState');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function setAdminRuntimeCookieState(text, mode = 'idle') {
    const node = el('adminRuntimeCookieState');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function setAdminCookieInfoState(text, mode = 'idle') {
    const node = el('adminCookieInfoState');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function setCreatorCookieInfoState(text, mode = 'idle') {
    const node = el('creatorCookieInfoState') || el('adminCookieInfoState');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function clonePlain(value) {
    return JSON.parse(JSON.stringify(value || {}));
}

function mergeContentDefaults(defaults = {}, input = {}) {
    const result = clonePlain(defaults);
    const source = isPlainObject(input) ? input : {};
    Object.keys(source).forEach((key) => {
        const nextValue = source[key];
        if (Array.isArray(nextValue)) {
            result[key] = nextValue.map((item) => String(item || '').trim()).filter(Boolean);
        } else if (isPlainObject(nextValue) && isPlainObject(result[key])) {
            result[key] = mergeContentDefaults(result[key], nextValue);
        } else if (typeof nextValue === 'string') {
            const trimmed = nextValue.trim();
            if (trimmed) result[key] = trimmed;
        } else if (nextValue !== undefined && nextValue !== null && typeof nextValue !== 'object') {
            result[key] = nextValue;
        }
    });
    return result;
}

function normalizeWarningBannerConfig(input = {}, options = {}) {
    const source = input && typeof input === 'object' ? input : {};
    const allowBlank = !!(options && options.allowBlank);
    const message = String(source.message || '').trim();
    const submessage = String(source.submessage || '').trim();
    const rawSheetAccessEnabled = source.sheetAccessEnabled;
    const sheetAccessEnabled = typeof rawSheetAccessEnabled === 'string'
        ? !['false', '0', 'off'].includes(rawSheetAccessEnabled.trim().toLowerCase())
        : rawSheetAccessEnabled !== false;
    const sheetAppsScriptUrl = String(source.sheetAppsScriptUrl || '').trim();
    const overloadFixEnabled = source.overloadFixEnabled !== false;
    const householdFixEnabled = source.householdFixEnabled !== false;
    const overloadFixLimitEnabled = source.overloadFixLimitEnabled !== false;
    const overloadFixCooldownEnabled = source.overloadFixCooldownEnabled !== false;
    if (!message && !submessage && !allowBlank) {
        return {
            message: DEFAULT_GETLINK_WARNING_MESSAGE,
            submessage: DEFAULT_GETLINK_WARNING_SUBMESSAGE,
            content: mergeContentDefaults(DEFAULT_GETLINK_CONTENT, source.content),
            sheetAccessEnabled,
            sheetAppsScriptUrl,
            overloadFixEnabled,
            householdFixEnabled,
            overloadFixLimitEnabled,
            overloadFixCooldownEnabled
        };
    }
    return {
        message,
        submessage,
        content: mergeContentDefaults(DEFAULT_GETLINK_CONTENT, source.content),
        sheetAccessEnabled,
        sheetAppsScriptUrl,
        overloadFixEnabled,
        householdFixEnabled,
        overloadFixLimitEnabled,
        overloadFixCooldownEnabled
    };
}

function isSheetAccessEnabled() {
    return normalizeWarningBannerConfig(warningBannerConfig).sheetAccessEnabled !== false;
}

function isFixModeEnabled(mode = 'overload') {
    const config = normalizeWarningBannerConfig(warningBannerConfig);
    return mode === 'household' ? config.householdFixEnabled !== false : config.overloadFixEnabled !== false;
}

function setSheetAccessImportControlsEnabled(enabled) {
    ['creatorImportCookiesFromSheetBtn', 'currentImportCookiesFromSheetBtn'].forEach((id) => {
        const button = el(id);
        if (!button) return;
        button.disabled = !enabled;
        button.title = enabled ? '' : 'Truy cap Google Sheet dang duoc tat trong admin.';
    });
}

function setAdminWarningConfigState(text, mode = 'idle') {
    const node = el('adminWarningConfigState');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function setAdminSheetConfigState(text, mode = 'idle') {
    const node = el('adminSheetConfigState');
    if (!node) return;
    const normalized = String(text || '').trim();
    node.textContent = normalized;
    node.classList.toggle('hidden', !normalized);
    setStateClass(node, mode);
}

function getContentConfig() {
    return normalizeWarningBannerConfig(warningBannerConfig).content;
}

function formatTemplate(text = '', values = {}) {
    return String(text || '').replace(/\{(\w+)\}/g, (match, key) => {
        return values[key] !== undefined ? String(values[key]) : match;
    });
}

function setText(id, value = '') {
    const node = el(id);
    if (node) node.textContent = String(value || '').trim();
}

function setInputValue(id, value = '') {
    const node = el(id);
    if (node && document.activeElement !== node) node.value = String(value || '');
}

function linesToText(lines = []) {
    return (Array.isArray(lines) ? lines : []).map((item) => String(item || '').trim()).filter(Boolean).join('\n');
}

function textToLines(text = '') {
    return String(text || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function renderWarningBanner() {
    const titleNode = el('getlinkStickyWarningTitle');
    const subtitleNode = el('getlinkStickyWarningSubtitle');
    const normalized = normalizeWarningBannerConfig(warningBannerConfig);
    warningBannerConfig = normalized;
    if (titleNode) {
        titleNode.textContent = normalized.message;
        titleNode.classList.toggle('hidden', !normalized.message);
    }
    if (subtitleNode) {
        subtitleNode.textContent = normalized.submessage;
        subtitleNode.classList.toggle('hidden', !normalized.submessage);
    }
}

function renderCopyGuideSteps(containerId, steps = [], copyButtonId = '', copyButtonText = '', copyValue = '') {
    const container = el(containerId);
    if (!container) return;
    container.innerHTML = '';
    const list = Array.isArray(steps) && steps.length > 0 ? steps : [];
    list.forEach((step, index) => {
        const text = String(step || '').trim();
        if (!text) return;
        const shouldShowCopy = !!copyButtonId && index === 3;
        if (shouldShowCopy) {
            const row = document.createElement('div');
            row.className = 'mobile-link-guide-row';
            const p = document.createElement('p');
            p.className = 'mobile-link-guide-step';
            p.textContent = text;
            const btn = document.createElement('button');
            btn.id = copyButtonId;
            btn.className = 'btn btn-ghost mobile-guide-copy-btn';
            btn.type = 'button';
            btn.textContent = String(copyButtonText || 'Sao chép link').trim();
            btn.addEventListener('click', async () => {
                await copyText(copyValue, `Đã sao chép ${copyValue}.`);
            });
            row.appendChild(p);
            row.appendChild(btn);
            container.appendChild(row);
            return;
        }
        const p = document.createElement('p');
        p.textContent = text;
        container.appendChild(p);
    });
}

function renderGetlinkContent() {
    const content = getContentConfig();
    const support = content.support;
    setText('supportModalBh247', support.bh247Text);
    setText('supportModalAutoFixBtn', support.autoFixText);
    setText('supportWarrantyBtn', support.warrantyButtonText);
    setText('overloadFixBtn', content.fix.overload.buttonText);
    setText('householdFixBtn', content.fix.household.buttonText);
    setText('deviceConfirmOkBtn', content.deviceConfirm.okText);
    setText('deviceConfirmCancelBtn', content.deviceConfirm.cancelText);
    setText('overloadFixConfirmBtn', content.fix.common.confirmText);
    setText('overloadFixCancelBtn', content.fix.common.cancelText);
    setText('overloadFixSuccessOkBtn', 'Đóng và tải lại trang');
    renderDisclaimerContent();
    renderOverloadFixModal(activeFixMode);
    renderOverloadFixSuccessModal(activeFixMode);
    renderWarningBanner();
    setSheetAccessImportControlsEnabled(isSheetAccessEnabled());
    updateOverloadFixVisibility();
}

function populateAdminWarningConfigInputs(config = null) {
    const normalized = normalizeWarningBannerConfig(config || warningBannerConfig);
    const content = normalized.content;
    const messageInput = el('adminWarningMessageInput');
    const submessageInput = el('adminWarningSubmessageInput');
    const sheetAccessInput = el('adminSheetAccessEnabledInput');
    const sheetAppsScriptUrlInput = el('adminSheetAppsScriptUrlInput');
    if (messageInput && document.activeElement !== messageInput) {
        messageInput.value = normalized.message;
    }
    if (submessageInput && document.activeElement !== submessageInput) {
        submessageInput.value = normalized.submessage;
    }
    if (sheetAccessInput && document.activeElement !== sheetAccessInput) {
        sheetAccessInput.checked = normalized.sheetAccessEnabled !== false;
    }
    if (sheetAppsScriptUrlInput && document.activeElement !== sheetAppsScriptUrlInput) {
        sheetAppsScriptUrlInput.value = normalized.sheetAppsScriptUrl || '';
    }
    const overloadFixEnabledInput = el('adminOverloadFixEnabledInput');
    const householdFixEnabledInput = el('adminHouseholdFixEnabledInput');
    const overloadFixLimitEnabledInput = el('adminOverloadFixLimitEnabledInput');
    const overloadFixCooldownEnabledInput = el('adminOverloadFixCooldownEnabledInput');
    if (overloadFixEnabledInput && document.activeElement !== overloadFixEnabledInput) {
        overloadFixEnabledInput.checked = normalized.overloadFixEnabled !== false;
    }
    if (householdFixEnabledInput && document.activeElement !== householdFixEnabledInput) {
        householdFixEnabledInput.checked = normalized.householdFixEnabled !== false;
    }
    if (overloadFixLimitEnabledInput && document.activeElement !== overloadFixLimitEnabledInput) {
        overloadFixLimitEnabledInput.checked = normalized.overloadFixLimitEnabled !== false;
    }
    if (overloadFixCooldownEnabledInput && document.activeElement !== overloadFixCooldownEnabledInput) {
        overloadFixCooldownEnabledInput.checked = normalized.overloadFixCooldownEnabled !== false;
    }
    setInputValue('adminDisclaimerEyebrowInput', content.disclaimer.eyebrow);
    setInputValue('adminDisclaimerTitleInput', content.disclaimer.title);
    setInputValue('adminDisclaimerLeadInput', content.disclaimer.lead);
    setInputValue('adminDisclaimerItemsInput', linesToText(content.disclaimer.items));
    setInputValue('adminDisclaimerWaitInput', content.disclaimer.waitText);
    setInputValue('adminDisclaimerReadyInput', content.disclaimer.readyText);
    setInputValue('adminDisclaimerDismissInput', content.disclaimer.dismissText);
    setInputValue('adminMobileAndroidTitleInput', content.mobileGuides.android.guideTitle);
    setInputValue('adminMobileAndroidStepsInput', linesToText(content.mobileGuides.android.steps));
    setInputValue('adminMobileAndroidCopyInput', content.mobileGuides.android.copyUnsupportedText);
    setInputValue('adminMobileIosTitleInput', content.mobileGuides.ios.guideTitle);
    setInputValue('adminMobileIosStepsInput', linesToText(content.mobileGuides.ios.steps));
    setInputValue('adminMobileIosCopyInput', content.mobileGuides.ios.copyUnsupportedText);
    setInputValue('adminTvTitleInput', content.tvGuide.guideTitle);
    setInputValue('adminTvStepsInput', linesToText(content.tvGuide.steps));
    setInputValue('adminTvCopyInput', content.tvGuide.copyTv2Text);
    setInputValue('adminDeviceTitleTemplateInput', content.deviceConfirm.titleTemplate);
    setInputValue('adminDeviceHintInput', content.deviceConfirm.hint);
    setInputValue('adminDeviceWaitInput', content.deviceConfirm.waitText);
    setInputValue('adminDeviceReadyInput', content.deviceConfirm.readyText);
    setInputValue('adminDeviceOkInput', content.deviceConfirm.okText);
    setInputValue('adminDeviceCancelInput', content.deviceConfirm.cancelText);
    setInputValue('adminOverloadButtonInput', content.fix.overload.buttonText);
    setInputValue('adminOverloadEyebrowInput', content.fix.overload.eyebrow);
    setInputValue('adminOverloadTitleInput', content.fix.overload.title);
    setInputValue('adminOverloadRulesInput', linesToText(content.fix.overload.rules));
    setInputValue('adminOverloadNoteInput', content.fix.overload.mobileNote);
    setInputValue('adminOverloadSuccessEyebrowInput', content.fix.overload.successEyebrow);
    setInputValue('adminOverloadSuccessTitleInput', content.fix.overload.successTitle);
    setInputValue('adminOverloadBusyInput', content.fix.overload.busyLabel);
    setInputValue('adminOverloadLoadingInput', content.fix.overload.loadingText);
    setInputValue('adminOverloadFallbackInput', content.fix.overload.fallbackError);
    setInputValue('adminHouseholdButtonInput', content.fix.household.buttonText);
    setInputValue('adminHouseholdEyebrowInput', content.fix.household.eyebrow);
    setInputValue('adminHouseholdTitleInput', content.fix.household.title);
    setInputValue('adminHouseholdRulesInput', linesToText(content.fix.household.rules));
    setInputValue('adminHouseholdNoteInput', content.fix.household.mobileNote);
    setInputValue('adminHouseholdSuccessEyebrowInput', content.fix.household.successEyebrow);
    setInputValue('adminHouseholdSuccessTitleInput', content.fix.household.successTitle);
    setInputValue('adminHouseholdBusyInput', content.fix.household.busyLabel);
    setInputValue('adminHouseholdLoadingInput', content.fix.household.loadingText);
    setInputValue('adminHouseholdFallbackInput', content.fix.household.fallbackError);
    setInputValue('adminFixConfirmInput', content.fix.common.confirmText);
    setInputValue('adminFixCancelInput', content.fix.common.cancelText);
    setInputValue('adminFixWaitInput', content.fix.common.waitText);
    setInputValue('adminFixReadyInput', content.fix.common.readyText);
    setInputValue('adminFixSuccessMessageInput', content.fix.common.successMessage);
    setInputValue('adminSupportTitleInput', content.support.title);
    setInputValue('adminSupportMessageInput', content.support.message);
    setInputValue('adminSupportBh247Input', content.support.bh247Text);
    setInputValue('adminSupportFanpageInput', content.support.fanpageText);
    setInputValue('adminSupportAutoFixInput', content.support.autoFixText);
    setInputValue('adminSupportWarrantyInput', content.support.warrantyButtonText);
}

function getAdminWarningConfigInputValues() {
    const messageInput = el('adminWarningMessageInput');
    const submessageInput = el('adminWarningSubmessageInput');
    return normalizeWarningBannerConfig({
        message: messageInput ? messageInput.value : '',
        submessage: submessageInput ? submessageInput.value : '',
        sheetAccessEnabled: el('adminSheetAccessEnabledInput')?.checked !== false,
        sheetAppsScriptUrl: el('adminSheetAppsScriptUrlInput')?.value || '',
        overloadFixEnabled: el('adminOverloadFixEnabledInput')?.checked !== false,
        householdFixEnabled: el('adminHouseholdFixEnabledInput')?.checked !== false,
        overloadFixLimitEnabled: el('adminOverloadFixLimitEnabledInput')?.checked !== false,
        overloadFixCooldownEnabled: el('adminOverloadFixCooldownEnabledInput')?.checked !== false,
        content: {
            disclaimer: {
                eyebrow: el('adminDisclaimerEyebrowInput')?.value || '',
                title: el('adminDisclaimerTitleInput')?.value || '',
                lead: el('adminDisclaimerLeadInput')?.value || '',
                items: textToLines(el('adminDisclaimerItemsInput')?.value || ''),
                waitText: el('adminDisclaimerWaitInput')?.value || '',
                readyText: el('adminDisclaimerReadyInput')?.value || '',
                dismissText: el('adminDisclaimerDismissInput')?.value || ''
            },
            mobileGuides: {
                android: {
                    guideTitle: el('adminMobileAndroidTitleInput')?.value || '',
                    steps: textToLines(el('adminMobileAndroidStepsInput')?.value || ''),
                    copyUnsupportedText: el('adminMobileAndroidCopyInput')?.value || ''
                },
                ios: {
                    guideTitle: el('adminMobileIosTitleInput')?.value || '',
                    steps: textToLines(el('adminMobileIosStepsInput')?.value || ''),
                    copyUnsupportedText: el('adminMobileIosCopyInput')?.value || ''
                }
            },
            tvGuide: {
                guideTitle: el('adminTvTitleInput')?.value || '',
                steps: textToLines(el('adminTvStepsInput')?.value || ''),
                copyTv2Text: el('adminTvCopyInput')?.value || ''
            },
            deviceConfirm: {
                titleTemplate: el('adminDeviceTitleTemplateInput')?.value || '',
                hint: el('adminDeviceHintInput')?.value || '',
                waitText: el('adminDeviceWaitInput')?.value || '',
                readyText: el('adminDeviceReadyInput')?.value || '',
                okText: el('adminDeviceOkInput')?.value || '',
                cancelText: el('adminDeviceCancelInput')?.value || ''
            },
            fix: {
                common: {
                    confirmText: el('adminFixConfirmInput')?.value || '',
                    cancelText: el('adminFixCancelInput')?.value || '',
                    waitText: el('adminFixWaitInput')?.value || '',
                    readyText: el('adminFixReadyInput')?.value || '',
                    successMessage: el('adminFixSuccessMessageInput')?.value || ''
                },
                overload: {
                    buttonText: el('adminOverloadButtonInput')?.value || '',
                    eyebrow: el('adminOverloadEyebrowInput')?.value || '',
                    title: el('adminOverloadTitleInput')?.value || '',
                    rules: textToLines(el('adminOverloadRulesInput')?.value || ''),
                    mobileNote: el('adminOverloadNoteInput')?.value || '',
                    successEyebrow: el('adminOverloadSuccessEyebrowInput')?.value || '',
                    successTitle: el('adminOverloadSuccessTitleInput')?.value || '',
                    busyLabel: el('adminOverloadBusyInput')?.value || '',
                    loadingText: el('adminOverloadLoadingInput')?.value || '',
                    fallbackError: el('adminOverloadFallbackInput')?.value || ''
                },
                household: {
                    buttonText: el('adminHouseholdButtonInput')?.value || '',
                    eyebrow: el('adminHouseholdEyebrowInput')?.value || '',
                    title: el('adminHouseholdTitleInput')?.value || '',
                    rules: textToLines(el('adminHouseholdRulesInput')?.value || ''),
                    mobileNote: el('adminHouseholdNoteInput')?.value || '',
                    successEyebrow: el('adminHouseholdSuccessEyebrowInput')?.value || '',
                    successTitle: el('adminHouseholdSuccessTitleInput')?.value || '',
                    busyLabel: el('adminHouseholdBusyInput')?.value || '',
                    loadingText: el('adminHouseholdLoadingInput')?.value || '',
                    fallbackError: el('adminHouseholdFallbackInput')?.value || ''
                }
            },
            support: {
                title: el('adminSupportTitleInput')?.value || '',
                message: el('adminSupportMessageInput')?.value || '',
                bh247Text: el('adminSupportBh247Input')?.value || '',
                fanpageText: el('adminSupportFanpageInput')?.value || '',
                autoFixText: el('adminSupportAutoFixInput')?.value || '',
                warrantyButtonText: el('adminSupportWarrantyInput')?.value || ''
            }
        }
    }, { allowBlank: true });
}

async function loadWarningBannerConfig(options = {}) {
    const silent = !!options.silent;
    try {
        const data = await apiRequest('/api/getlink-admin/popup-warning-config', 'GET');
        warningBannerConfig = normalizeWarningBannerConfig(data && data.config ? data.config : {});
        warningBannerConfigLoaded = true;
        renderGetlinkContent();
        populateAdminWarningConfigInputs(warningBannerConfig);
        if (adminAuthenticated && !silent) {
            setAdminWarningConfigState('Da tai noi dung popup hien tai.', 'success');
        }
        return warningBannerConfig;
    } catch (error) {
        warningBannerConfig = normalizeWarningBannerConfig(warningBannerConfig);
        renderGetlinkContent();
        populateAdminWarningConfigInputs(warningBannerConfig);
        if (adminAuthenticated && !silent) {
            setAdminWarningConfigState(error.message || 'Khong tai duoc noi dung popup.', 'error');
        }
        return warningBannerConfig;
    }
}

async function adminSaveWarningBannerConfig() {
    if (!adminAuthenticated) {
        setAdminWarningConfigState('Ban chua dang nhap admin.', 'warning');
        return;
    }
    const nextConfig = getAdminWarningConfigInputValues();
    const btn = el('adminSaveWarningConfigBtn');
    setButtonBusy(btn, true, 'Dang luu...');
    setAdminWarningConfigState('Dang luu noi dung...', 'loading');
    try {
        const data = await apiRequest('/api/getlink-admin/popup-warning-config', 'PUT', nextConfig);
        warningBannerConfig = normalizeWarningBannerConfig(data && data.config ? data.config : nextConfig);
        warningBannerConfigLoaded = true;
        renderGetlinkContent();
        populateAdminWarningConfigInputs(warningBannerConfig);
        setAdminWarningConfigState('Da luu noi dung /getlink.', 'success');
    } catch (error) {
        setAdminWarningConfigState(error.message || 'Khong luu duoc noi dung popup.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

function buildSheetConfigTestMessage(data = {}) {
    if (!data || typeof data !== 'object') return 'Khong test duoc cau hinh Sheet.';
    if (!data.enabled) return 'Google Sheet dang bi tat trong admin.';
    if (!data.configured) return data.configError || 'Chua cau hinh Apps Script Web App URL.';
    if (data.configError) return data.configError;

    const probe = data.scriptProbe && typeof data.scriptProbe === 'object' ? data.scriptProbe : null;
    const urlText = data.maskedUrl ? `URL ${data.maskedUrl}` : 'URL da cau hinh';
    const sourceText = data.source === 'admin' ? 'admin' : (data.source === 'env' ? 'env' : 'cau hinh');
    if (!probe) return `${urlText} (${sourceText}) chua duoc probe.`;
    const elapsed = Number(probe.elapsedMs || 0) || 0;
    const suffix = elapsed > 0 ? ` (${elapsed}ms)` : '';
    const message = String(probe.message || '').trim();
    if (probe.ok) return `Sheet OK qua ${urlText} (${sourceText})${suffix}${message ? `: ${message}` : ''}`;
    return `${urlText} (${sourceText}) loi${suffix}: ${message || `HTTP ${probe.statusCode || 0}`}`;
}

async function adminTestSheetConfig() {
    if (!adminAuthenticated) {
        setAdminSheetConfigState('Ban chua dang nhap admin.', 'warning');
        return;
    }

    const savedUrl = normalizeWarningBannerConfig(warningBannerConfig).sheetAppsScriptUrl || '';
    const currentUrl = String(el('adminSheetAppsScriptUrlInput')?.value || '').trim();
    if (currentUrl !== savedUrl) {
        setAdminSheetConfigState('URL vua nhap chua duoc luu. Bam Luu noi dung roi test lai.', 'warning');
        return;
    }

    const btn = el('adminTestSheetConfigBtn');
    setButtonBusy(btn, true, 'Dang test...');
    setAdminSheetConfigState('Dang test cau hinh Google Sheet...', 'loading');
    try {
        const data = await apiRequest('/api/getlink-admin/debug/sheet-config', 'GET');
        const message = buildSheetConfigTestMessage(data);
        const mode = data && data.enabled && data.configured && data.scriptProbe && data.scriptProbe.ok ? 'success' : 'error';
        setAdminSheetConfigState(message, mode);
    } catch (error) {
        setAdminSheetConfigState(error.message || 'Khong test duoc cau hinh Sheet.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

function setShareCreateExpiryState(text, mode = 'idle') {
    const node = el('shareCreateExpiryState');
    if (!node) return;
    const normalized = String(text || '').trim();
    node.textContent = normalized;
    node.classList.toggle('hidden', !normalized);
    setStateClass(node, mode);
}

function getCookieSlotLabel(slotKey = '') {
    const found = SHEET_IMPORT_SLOT_META.find((item) => item.key === slotKey);
    return found ? found.label : String(slotKey || '').trim();
}

function getSheetImportStateId(scope = 'current') {
    return scope === 'create' ? 'creatorSheetImportState' : 'currentSheetImportState';
}

function setSheetImportState(scope = 'current', text = '', mode = 'idle') {
    const node = el(getSheetImportStateId(scope));
    if (!node) return;
    const normalized = String(text || '').trim();
    node.textContent = normalized;
    node.classList.toggle('hidden', !normalized);
    setStateClass(node, mode);
}

function getSelectedSheetImportSlots(scope = 'current') {
    const prefix = scope === 'create' ? 'creator' : 'current';
    const selected = SHEET_IMPORT_SLOT_META
        .filter((slot) => {
            const input = el(`${prefix}SheetSlot${slot.key === 'primary' ? 'Primary' : (slot.key === 'backup1' ? 'Backup1' : 'Backup2')}`);
            return !!(input && input.checked);
        })
        .map((slot) => slot.key);
    return selected.length > 0 ? selected : SHEET_IMPORT_SLOT_META.map((slot) => slot.key);
}

function clearSheetImportSelections(scope = 'current') {
    const prefix = scope === 'create' ? 'creator' : 'current';
    ['Primary', 'Backup1', 'Backup2'].forEach((suffix) => {
        const input = el(`${prefix}SheetSlot${suffix}`);
        if (input) input.checked = false;
    });
}

function setOverloadFixState(text, mode = 'idle') {
    const node = el('overloadFixCountdown');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function clearOverloadFixLoadingTimer() {
    if (overloadFixLoadingTimer) {
        window.clearTimeout(overloadFixLoadingTimer);
        overloadFixLoadingTimer = null;
    }
    overloadFixLoadingStartedAt = 0;
}

function startOverloadFixLoading(startedAt = Date.now()) {
    const loading = el('overloadFixLoading');
    const countdown = el('overloadFixCountdown');
    const lateNotice = el('overloadFixLoadingLate');
    const loadingText = el('overloadFixLoadingText');
    const explicitStartedAt = Math.max(0, Number(startedAt || 0) || 0);
    if (overloadFixLoadingStartedAt > 0 && explicitStartedAt > 0) {
        overloadFixLoadingStartedAt = Math.min(overloadFixLoadingStartedAt, explicitStartedAt);
    } else {
        overloadFixLoadingStartedAt = explicitStartedAt || overloadFixLoadingStartedAt || Date.now();
    }
    if (overloadFixLoadingTimer) {
        window.clearTimeout(overloadFixLoadingTimer);
        overloadFixLoadingTimer = null;
    }
    if (loading) loading.classList.remove('hidden');
    if (countdown) countdown.classList.add('hidden');
    if (lateNotice) lateNotice.classList.add('hidden');
    if (loadingText) {
        const config = getFixModeConfig(activeFixMode);
        loadingText.textContent = config.loadingText || 'Hệ thống đang kiểm tra và sửa lỗi cho bạn.';
    }

    const showLateNotice = () => {
        if (lateNotice) lateNotice.classList.remove('hidden');
        overloadFixLoadingTimer = null;
    };
    const remainingMs = Math.max(0, GETLINK_LOADING_REASSURANCE_DELAY_MS - (Date.now() - overloadFixLoadingStartedAt));
    if (remainingMs <= 0) {
        showLateNotice();
        return;
    }
    overloadFixLoadingTimer = window.setTimeout(showLateNotice, remainingMs);
}

function stopOverloadFixLoading() {
    clearOverloadFixLoadingTimer();
    const loading = el('overloadFixLoading');
    const countdown = el('overloadFixCountdown');
    const lateNotice = el('overloadFixLoadingLate');
    if (loading) loading.classList.add('hidden');
    if (lateNotice) lateNotice.classList.add('hidden');
    if (countdown) countdown.classList.remove('hidden');
}

function getFixModeConfig(mode = 'overload') {
    const key = mode === 'household' ? 'household' : 'overload';
    const content = getContentConfig();
    const specific = content.fix[key] || {};
    return {
        key,
        buttonText: specific.buttonText,
        actionLabel: specific.actionLabel,
        eyebrow: specific.eyebrow,
        title: specific.title,
        rule1: (specific.rules && specific.rules[0]) || '',
        rule2: (specific.rules && specific.rules[1]) || '',
        mobileNote: specific.mobileNote,
        successEyebrow: specific.successEyebrow,
        successTitle: specific.successTitle,
        busyLabel: specific.busyLabel,
        loadingText: specific.loadingText,
        fallbackError: specific.fallbackError
    };
}

function renderOverloadFixModal(mode = activeFixMode) {
    const config = getFixModeConfig(mode);
    const eyebrow = el('overloadFixEyebrow');
    const title = el('overloadFixTitle');
    const rule1 = el('overloadFixRule1');
    const rule2 = el('overloadFixRule2');
    const note = el('overloadFixNote');
    const confirmBtn = el('overloadFixConfirmBtn');
    const cancelBtn = el('overloadFixCancelBtn');
    if (eyebrow) eyebrow.textContent = config.eyebrow;
    if (title) title.textContent = config.title;
    if (rule1) rule1.textContent = config.rule1;
    if (rule2) rule2.textContent = config.rule2;
    if (note) note.textContent = config.mobileNote;
    if (confirmBtn) confirmBtn.textContent = getContentConfig().fix.common.confirmText;
    if (cancelBtn) cancelBtn.textContent = getContentConfig().fix.common.cancelText;
}

function renderOverloadFixSuccessModal(mode = activeFixMode) {
    const config = getFixModeConfig(mode);
    const eyebrow = el('overloadFixSuccessEyebrow');
    const title = el('overloadFixSuccessTitle');
    const message = el('overloadFixSuccessMessage');
    if (eyebrow) eyebrow.textContent = config.successEyebrow;
    if (title) title.textContent = config.successTitle;
    if (message) message.textContent = getContentConfig().fix.common.successMessage;
}

function isAdminImmediate() {
    return !!adminAuthenticated;
}

function shouldBypassPromotionalPopups() {
    return !!adminAuthenticated;
}

function canShowPromotionalPopups() {
    return adminSessionResolved && !shouldBypassPromotionalPopups();
}

function getCookiesFromSlotInputs(slots = []) {
    const cookies = {};
    slots.forEach((slot) => {
        cookies[slot.key] = normalizeCookie(el(slot.viewInputId) && el(slot.viewInputId).value || '');
    });
    return cookies;
}

function setCookiesToSlotInputs(slots = [], cookies = {}) {
    const normalized = cookies && typeof cookies === 'object' ? cookies : {};
    slots.forEach((slot) => {
        const input = el(slot.viewInputId);
        if (input) input.value = String(normalized[slot.key] || '').trim();
    });
}

function normalizeShareNote(value = '') {
    return String(value || '').trim().slice(0, 1000);
}

function getCurrentShareEditableCookies() {
    return getCookiesFromSlotInputs(SHARE_COOKIE_SLOTS);
}

function getCreatedShareEditableCookies() {
    return getCookiesFromSlotInputs(CREATED_SHARE_COOKIE_SLOTS);
}

function setShareCookieViewOutputs(cookies = {}) {
    setCookiesToSlotInputs(SHARE_COOKIE_SLOTS, cookies);
}

function setCreatedShareCookieOutputs(cookies = {}) {
    setCookiesToSlotInputs(CREATED_SHARE_COOKIE_SLOTS, cookies);
}

function setShareNoteInput(id, note = '') {
    const input = el(id);
    if (input) input.value = normalizeShareNote(note);
}

function getShareNoteInput(id) {
    return normalizeShareNote(el(id) && el(id).value || '');
}

function setSlotStateForConfig(slotConfigs, slotKey, text = 'Chưa check', ok = null) {
    const slot = slotConfigs.find((item) => item.key === slotKey);
    if (!slot) return;
    const node = el(slot.viewStateId);
    if (!node) return;
    node.textContent = String(text || '').trim();
    node.style.color = ok === true ? '#86efac' : (ok === false ? '#fca5a5' : '#9cb5e8');
}

function setShareCookieSlotState(slotKey, text = 'Chưa check', ok = null) {
    setSlotStateForConfig(SHARE_COOKIE_SLOTS, slotKey, text, ok);
}

function setCreatedShareCookieSlotState(slotKey, text = 'Chưa check', ok = null) {
    setSlotStateForConfig(CREATED_SHARE_COOKIE_SLOTS, slotKey, text, ok);
}

function resetShareCookieSlotStates() {
    SHARE_COOKIE_SLOTS.forEach((slot) => setShareCookieSlotState(slot.key, 'Chưa check', null));
}

function resetCreatedShareCookieSlotStates() {
    CREATED_SHARE_COOKIE_SLOTS.forEach((slot) => setCreatedShareCookieSlotState(slot.key, 'Chưa check', null));
}

function renderCookieCheckCardsTo(contentId, results = [], slotConfigs = SHARE_COOKIE_SLOTS) {
    const content = el(contentId);
    if (!content) return;
    const cards = Array.isArray(results) ? results : [];
    if (cards.length === 0) {
        content.innerHTML = '<p class="admin-cookie-info-placeholder">Chưa có dữ liệu cookie info.</p>';
        return;
    }

    const getBadgeTone = (field, value) => {
        const normalized = String(value || '').trim().toLowerCase();
        if (field === 'plan' && normalized === 'premium') return 'good';
        if (field === 'hold') {
            if (normalized === 'no') return 'good';
            if (normalized === 'yes') return 'bad';
        }
        if (field === 'max_streams') {
            if (normalized === '4') return 'good';
            if (normalized) return 'bad';
        }
        return '';
    };

    content.innerHTML = `<div class="cookie-check-grid">${
        cards.map((item) => {
            const label = slotConfigs.find((slot) => slot.key === item.slot)?.label || String(item.slot || '');
            const summary = item.summary || {};
            const statusText = item.ok ? 'PASS' : 'FAIL';
            const errorText = String(item.error || '').trim();
            const planValue = String(summary.plan || '-').trim() || '-';
            const holdValue = String(summary.paymentHold || '-').trim() || '-';
            const maxStreamsValue = String(summary.max_streams || '-').trim() || '-';
            const countryValue = String(summary.country || '-').trim() || '-';
            const profilesValue = String(summary.profiles || '-').trim() || '-';
            return `
                <article class="cookie-check-card ${item.ok ? 'good' : 'bad'}">
                    <h4>${escapeHtml(label)} - ${escapeHtml(statusText)}</h4>
                    <div class="cookie-check-fields">
                        <div class="cookie-check-field">
                            <span class="cookie-check-label">Plan</span>
                            <span class="cookie-check-badge ${getBadgeTone('plan', planValue)}">${escapeHtml(planValue)}</span>
                        </div>
                        <div class="cookie-check-field">
                            <span class="cookie-check-label">Hold</span>
                            <span class="cookie-check-badge ${getBadgeTone('hold', holdValue)}">${escapeHtml(holdValue)}</span>
                        </div>
                        <div class="cookie-check-field">
                            <span class="cookie-check-label">Max stream</span>
                            <span class="cookie-check-badge ${getBadgeTone('max_streams', maxStreamsValue)}">${escapeHtml(maxStreamsValue)}</span>
                        </div>
                        <div class="cookie-check-field">
                            <span class="cookie-check-label">Country</span>
                            <span class="cookie-check-value">${escapeHtml(countryValue)}</span>
                        </div>
                        <div class="cookie-check-field">
                            <span class="cookie-check-label">Profiles</span>
                            <span class="cookie-check-value">${escapeHtml(profilesValue)}</span>
                        </div>
                    </div>
                    <p class="cookie-check-note">${escapeHtml(errorText || (item.ok ? 'Cookie dùng được.' : 'Cookie không dùng được.'))}</p>
                </article>
            `;
        }).join('')
    }</div>`;
}

function renderCookieCheckCards(results = []) {
    renderCookieCheckCardsTo('adminCookieInfoContent', results, SHARE_COOKIE_SLOTS);
}

function renderCreatorCookieCheckCards(results = []) {
    renderCookieCheckCardsTo('creatorCookieInfoContent', results, CREATED_SHARE_COOKIE_SLOTS);
    renderCookieCheckCardsTo('adminCookieInfoContent', results, CREATED_SHARE_COOKIE_SLOTS);
}

function isViewingPendingShare() {
    return !!String(pendingShareIdFromUrl || '').trim();
}

function normalizeAdminTab(value = '') {
    return String(value || '').trim().toLowerCase() === 'create' ? 'create' : 'search';
}

function getAdminTabFromContext() {
    if (isViewingPendingShare() || (currentAdminShare && currentAdminShare.id)) return 'search';
    return 'create';
}

function ensureAdminTabFromContext(options = {}) {
    const force = !!options.force;
    if (!force && adminTabManuallySelected) return;
    adminActiveTab = normalizeAdminTab(getAdminTabFromContext());
}

function setAdminTab(tab, options = {}) {
    adminActiveTab = normalizeAdminTab(tab);
    if (options && options.manual) adminTabManuallySelected = true;
    if (options && options.resetManual) adminTabManuallySelected = false;
    if (!options || options.render !== false) renderAdminWorkspace();
}

function getShareCookiesForCurrentMode() {
    if (isInlineEditMode) return getCurrentShareEditableCookies();
    const share = currentAdminShare || {};
    return share && share.cookies ? share.cookies : { primary: share.cookieRaw || '', backup1: '', backup2: '' };
}

function setInlineEditMode(nextMode) {
    isInlineEditMode = !!nextMode;
    const editBtn = el('editCurrentShareBtn');
    const viewCheckAllBtn = el('viewCheckAllShareCookiesBtn');
    const saveBtn = el('saveCurrentShareBtn');
    const cancelBtn = el('cancelCurrentShareEditBtn');
    const expiryInput = el('currentShareExpiryInput');
    const noteInput = el('currentShareNoteInput');
    if (editBtn) editBtn.classList.toggle('hidden', isInlineEditMode);
    if (saveBtn) saveBtn.classList.toggle('hidden', !isInlineEditMode);
    if (cancelBtn) cancelBtn.classList.toggle('hidden', !isInlineEditMode);
    if (expiryInput) expiryInput.disabled = !isInlineEditMode;
    if (noteInput) noteInput.readOnly = !isInlineEditMode;
    SHARE_COOKIE_SLOTS.forEach((slot) => {
        const input = el(slot.viewInputId);
        if (input) input.readOnly = !isInlineEditMode;
    });
}

function renderCurrentShareSummary(share = null) {
    const summaryBox = el('currentShareSummaryBox');
    if (!summaryBox) return;
    if (!share || !isViewingPendingShare() || !adminAuthenticated) {
        summaryBox.classList.add('hidden');
        return;
    }

    const expired = !!(share && (share.expired || isShareExpiredClient(share)));
    const status = String(share.status || 'active');
    let statusLabel = 'Đang hoạt động';
    if (status !== 'active') statusLabel = 'Đã khóa / Thu hồi';
    else if (expired) statusLabel = 'Đã hết hạn';

    const cookies = share.cookies || { primary: share.cookieRaw || '', backup1: '', backup2: '' };
    const idInput = el('currentShareIdDisplay');
    const statusInput = el('currentShareStatusDisplay');
    const expiryInput = el('currentShareExpiryInput');
    const updatedInput = el('currentShareUpdatedDisplay');
    const urlInput = el('currentShareUrlDisplay');
    if (idInput) idInput.value = String(share.id || '-');
    if (statusInput) statusInput.value = statusLabel;
    if (expiryInput) expiryInput.value = toDatetimeLocalFromIso(share.expiresAt);
    if (updatedInput) updatedInput.value = formatDateTime(share.updatedAt);
    if (urlInput) urlInput.value = String(share.shareUrl || '');
    setShareNoteInput('currentShareNoteInput', share.note || '');
    setShareCookieViewOutputs(cookies);
    summaryBox.classList.remove('hidden');
}

function renderCreatedShareEditor(share = null) {
    const section = el('shareCreateCookieSection');
    if (!section) return;
    if (!share || !share.id || !adminAuthenticated || isViewingPendingShare()) {
        section.classList.add('hidden');
        return;
    }
    setCreatedShareCookieOutputs(share.cookies || { primary: share.cookieRaw || '', backup1: '', backup2: '' });
    setShareNoteInput('shareCreateNoteInput', share.note || '');
    section.classList.remove('hidden');
}

function resetCreatedShareComposer(options = {}) {
    const keepExpiryInputs = !!options.keepExpiryInputs;
    createdAdminShare = null;
    renderCreatedShareEditor(null);
    renderShareUrl('');
    setCreatedShareCookieOutputs({ primary: '', backup1: '', backup2: '' });
    resetCreatedShareCookieSlotStates();
    renderCreatorCookieCheckCards([]);
    if (!keepExpiryInputs) {
        const quickDaysInput = el('shareCreateQuickDaysInput');
        const dateInput = el('shareCreateDateInput');
        const timeInput = el('shareCreateTimeInput');
        const desktopOnlyInput = el('shareDesktopOnlyInput');
        const noteInput = el('shareCreateNoteInput');
        if (quickDaysInput) quickDaysInput.value = '';
        if (dateInput) dateInput.value = '';
        if (timeInput) timeInput.value = '';
        if (desktopOnlyInput) desktopOnlyInput.checked = false;
        if (noteInput) noteInput.value = '';
    }
    setShareState('', 'idle');
    setShareCreateExpiryState('', 'idle');
    setCreatorCookieInfoState('Tạo hoặc cập nhật cookie rồi bấm check để xem kết quả ngay tại đây.', 'idle');
    setSheetImportState('create', '', 'idle');
    clearSheetImportSelections('create');
}

async function runCookieChecksForShare(
    shareId,
    cookies = {},
    slotConfigs = SHARE_COOKIE_SLOTS,
    setSlotState = setShareCookieSlotState,
    options = {}
) {
    const renderCards = typeof options.renderCards === 'function' ? options.renderCards : renderCookieCheckCards;
    const setInfoState = typeof options.setInfoState === 'function' ? options.setInfoState : setAdminCookieInfoState;
    const normalized = {
        primary: normalizeCookie(cookies.primary || ''),
        backup1: normalizeCookie(cookies.backup1 || ''),
        backup2: normalizeCookie(cookies.backup2 || '')
    };
    const slotMap = new Map(slotConfigs.map((slot) => [slot.key, slot]));
    const keysToCheck = slotConfigs
        .map((slot) => slot.key)
        .filter((key) => normalized[key]);

    for (const slot of slotConfigs) {
        const cookieStr = normalized[slot.key] || '';
        if (!cookieStr) {
            setSlotState(slot.key, 'Để trống', null);
        }
    }

    if (keysToCheck.length === 0) {
        renderCards([]);
        setInfoState('Chưa có cookie nào để check.', 'idle');
        return [];
    }

    let results = [];
    try {
        const data = await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(shareId)}/check-all`, 'POST', {
            cookies: normalized
        });
        const apiResults = Array.isArray(data.results) ? data.results : [];
        results = apiResults.filter((item) => slotMap.has(item && item.slot));
        for (const result of results) {
            setSlotState(result.slot, result.ok ? 'PASS' : 'FAIL', !!result.ok);
        }
    } catch (error) {
        results = keysToCheck.map((key) => ({
            slot: key,
            ok: false,
            error: error.message || 'Check cookie thất bại.',
            summary: {}
        }));
        for (const key of keysToCheck) {
            setSlotState(key, 'FAIL', false);
        }
    }

    for (const key of keysToCheck) {
        if (results.some((item) => item.slot === key)) continue;
        results.push({
            slot: key,
            ok: false,
            error: 'Không check được cookie.',
            summary: {}
        });
        setSlotState(key, 'FAIL', false);
    }

    renderCards(results);
    setInfoState('Đã check xong các cookie đã nhập.', results.every((item) => item.ok) ? 'success' : 'warning');
    return results;
}

function buildSheetImportSummary(data = {}) {
    const assigned = Array.isArray(data.assigned) ? data.assigned : [];
    const skipped = Array.isArray(data.skipped) ? data.skipped : [];
    const unfilledSlots = Array.isArray(data.unfilledSlots) ? data.unfilledSlots : [];
    const assignedText = assigned.length
        ? `Đã nhập ${assigned.length} cookie PASS`
        : 'Chưa nhập được cookie PASS nào';
    const skippedText = skipped.length
        ? `skip ${skipped.length} cookie fail`
        : 'không có cookie fail';
    const unfilledText = unfilledSlots.length
        ? `Thiếu: ${unfilledSlots.map(getCookieSlotLabel).join(', ')}.`
        : 'Đã đủ slot được chọn.';
    return `${assignedText}, ${skippedText}. ${unfilledText}`;
}

function buildSheetImportSummaryWithTimings(data = {}) {
    const summary = buildSheetImportSummary(data);
    const timingText = formatAutoFixTimings(data && data.timings ? data.timings : null);
    return timingText ? `${summary} | ${timingText}` : summary;
}

async function applySheetImportResult(scope = 'current', data = {}) {
    const context = getSheetImportContext(scope);
    const assigned = Array.isArray(data.assigned) ? data.assigned : [];
    const skipped = Array.isArray(data.skipped) ? data.skipped : [];
    const unfilledSlots = Array.isArray(data.unfilledSlots) ? data.unfilledSlots : [];
    const timingText = formatAutoFixTimings(data && data.timings ? data.timings : null);
    const nextCookies = {
        primary: normalizeCookie(context.getCookies().primary || ''),
        backup1: normalizeCookie(context.getCookies().backup1 || ''),
        backup2: normalizeCookie(context.getCookies().backup2 || '')
    };
    const results = [];

    if (scope === 'current' && !isInlineEditMode) {
        setInlineEditMode(true);
    }

    assigned.forEach((item) => {
        const slotKey = String(item && item.slot ? item.slot : '').trim();
        const cookieRaw = normalizeCookie(item && item.cookie ? item.cookie : '');
        if (!slotKey || !cookieRaw) return;
        nextCookies[slotKey] = cookieRaw;
        context.setSlotState(slotKey, 'PASS', true);
        if (item && item.result && typeof item.result === 'object') {
            results.push(item.result);
        }
    });

    unfilledSlots.forEach((slotKey) => {
        context.setSlotState(slotKey, 'Thiếu PASS', false);
    });

    context.setCookies(nextCookies);
    if (nextCookies.primary) {
        setRuntimeCookie(nextCookies.primary, {
            source: 'admin',
            silent: true,
            profiles: extractProfilesFromChecks(results, 'primary')
        });
    }

    if (results.length > 0) {
        context.renderCards(results);
        context.setInfoState(
            `${unfilledSlots.length > 0
                ? 'Đã nhập một phần cookie PASS từ Sheet.'
                : 'Đã nhập và check xong cookie từ Sheet.'}${timingText ? ` ${timingText}` : ''}`,
            unfilledSlots.length > 0 || skipped.length > 0 ? 'warning' : 'success'
        );
    } else {
        context.renderCards([]);
        context.setInfoState(`Không tìm được cookie PASS nào từ Sheet.${timingText ? ` ${timingText}` : ''}`, 'warning');
    }

    setSheetImportState(
        scope,
        buildSheetImportSummaryWithTimings({ assigned, skipped, unfilledSlots, timings: data && data.timings ? data.timings : null }),
        unfilledSlots.length > 0 || assigned.length === 0 || skipped.length > 0 ? 'warning' : 'success'
    );
    clearSheetImportSelections(scope);

    if (assigned.length > 0) {
        const autoSaveText = 'Đã nhập cookie PASS từ Sheet, đang tự lưu...';
        setSheetImportState(scope, autoSaveText, 'loading');
        context.setInfoState(autoSaveText, 'loading');
        context.setPrimaryState(autoSaveText, 'loading');
        if (scope === 'create') await saveCreatedShareCookies();
        else await adminSaveCookies();
    }
}

function setImportedCookiesToCreateShare(nextCookies = {}) {
    const normalized = {
        primary: normalizeCookie(nextCookies.primary || ''),
        backup1: normalizeCookie(nextCookies.backup1 || ''),
        backup2: normalizeCookie(nextCookies.backup2 || '')
    };
    if (createdAdminShare && typeof createdAdminShare === 'object') {
        createdAdminShare = {
            ...createdAdminShare,
            cookieRaw: normalized.primary || '',
            cookies: normalized
        };
    }
    setCreatedShareCookieOutputs(normalized);
}

function setImportedCookiesToCurrentShare(nextCookies = {}) {
    const normalized = {
        primary: normalizeCookie(nextCookies.primary || ''),
        backup1: normalizeCookie(nextCookies.backup1 || ''),
        backup2: normalizeCookie(nextCookies.backup2 || '')
    };
    if (currentAdminShare && typeof currentAdminShare === 'object') {
        currentAdminShare = {
            ...currentAdminShare,
            cookieRaw: normalized.primary || '',
            cookies: normalized
        };
    }
    setShareCookieViewOutputs(normalized);
}

function getSheetImportContext(scope = 'current') {
    if (scope === 'create') {
        return {
            share: createdAdminShare,
            getCookies: getCreatedShareEditableCookies,
            setCookies: setImportedCookiesToCreateShare,
            slotConfigs: CREATED_SHARE_COOKIE_SLOTS,
            setSlotState: setCreatedShareCookieSlotState,
            renderCards: renderCreatorCookieCheckCards,
            setInfoState: setCreatorCookieInfoState,
            setPrimaryState: setShareState
        };
    }
    return {
        share: currentAdminShare,
        getCookies: getShareCookiesForCurrentMode,
        setCookies: setImportedCookiesToCurrentShare,
        slotConfigs: SHARE_COOKIE_SLOTS,
        setSlotState: setShareCookieSlotState,
        renderCards: renderCookieCheckCards,
        setInfoState: setAdminCookieInfoState,
        setPrimaryState: setAdminSearchState
    };
}

async function importCookiesFromSheet(scope = 'current') {
    if (!isSheetAccessEnabled()) {
        const message = 'Truy cập Google Sheet đang được tắt trong admin.';
        const contextForState = getSheetImportContext(scope);
        setSheetImportState(scope, message, 'warning');
        if (contextForState && contextForState.setInfoState) contextForState.setInfoState(message, 'warning');
        return;
    }

    const context = getSheetImportContext(scope);
    if (!context.share || !context.share.id) {
        if (scope === 'create') setShareState('Hãy tạo link ID server trước khi nhập cookie từ Sheet.', 'warning');
        else setAdminSearchState('Hãy tìm link ID trước khi nhập cookie từ Sheet.', 'warning');
        return;
    }

    const slots = getSelectedSheetImportSlots(scope);

    const btn = el(scope === 'create' ? 'creatorImportCookiesFromSheetBtn' : 'currentImportCookiesFromSheetBtn');
    setButtonBusy(btn, true, 'Đang quét Sheet...');
    setSheetImportState(scope, `Đang quét Google Sheet và check ${slots.length} cookie...`, 'loading');
    context.setInfoState('Đang lấy cookie từ Google Sheet...', 'loading');

    try {
        let data = await apiRequest('/api/getlink-admin/sheet-cookie-import', 'POST', {
            slots,
            scope
        });
        const operationKey = `sheet-import-${scope}`;
        let operationMeta = null;

        if (String(data && data.status || '').trim() === 'pending') {
            operationMeta = normalizeGetlinkOperationMeta({
                operationId: data.operationId,
                operationToken: data.operationToken,
                scope,
                shareId: context.share && context.share.id ? context.share.id : '',
                startedAt: Date.now()
            });
            saveSheetImportOperationMeta(scope, operationMeta);

            const renderPending = (payload) => {
                const elapsedMs = Date.now() - operationMeta.startedAt;
                const text = buildGetlinkOperationText(
                    payload,
                    elapsedMs,
                    `Đang quét Google Sheet và check ${slots.length} cookie...`
                );
                setSheetImportState(scope, text, 'loading');
                context.setInfoState(text, 'loading');
            };

            renderPending(data);
            startActiveGetlinkOperationTimer(operationKey, () => {
                renderPending(data);
            });

            while (String(data && data.status || '').trim() === 'pending') {
                await sleep(GETLINK_OPERATION_POLL_INTERVAL_MS);
                data = await pollGetlinkOperation(operationMeta.operationId, operationMeta.operationToken);
                renderPending(data);
            }

            clearActiveGetlinkOperationTimer(operationKey);
            clearSheetImportOperationMeta(scope);
        }

        await applySheetImportResult(scope, data);
    } catch (error) {
        clearSheetImportOperationMeta(scope);
        const timingText = formatAutoFixTimings(error && error.responseData ? error.responseData.timings : null);
        const message = error.message || 'Không nhập được cookie từ Sheet.';
        setSheetImportState(scope, timingText ? `${message} | ${timingText}` : message, 'error');
        context.setInfoState(timingText ? `${message} ${timingText}` : message, 'error');
    } finally {
        clearActiveGetlinkOperationTimer(`sheet-import-${scope}`);
        setButtonBusy(btn, false);
        setSheetAccessImportControlsEnabled(isSheetAccessEnabled());
    }
}

function escapeHtml(raw) {
    return String(raw || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function isNo(value) {
    return String(value || '').trim().toLowerCase() === 'no';
}

function renderCookieInfoPlaceholder(text = 'Chua co du lieu cookie info.') {
    const content = el('adminCookieInfoContent');
    if (!content) return;
    content.innerHTML = `<p class="admin-cookie-info-placeholder">${escapeHtml(text)}</p>`;
}

function renderCookieInfoError(message = 'Khong kiem tra duoc cookie.', meta = {}) {
    const content = el('adminCookieInfoContent');
    if (!content) return;
    const overloadMessage = String(meta.overloadMessage || '').trim();
    const signal = String(meta.overloadSignal || '').trim();
    const finalMessage = String(message || 'Khong kiem tra duoc cookie.').trim();

    const extra = overloadMessage
        ? `<div class="admin-info-grid"><strong>Overload:</strong><span>${escapeHtml(overloadMessage)}</span></div>`
        : '';
    const signalHtml = signal
        ? `<div class="admin-info-grid"><strong>Signal:</strong><span>${escapeHtml(signal)}</span></div>`
        : '';

    content.innerHTML = `
        <div class="admin-info-highlight-grid">
            <div class="admin-info-chip bad">
                <strong>Trang thai</strong>
                <span>Khong LIVE / Loi</span>
            </div>
        </div>
        <div class="admin-info-grid">
            <strong>Chi tiet:</strong>
            <span>${escapeHtml(finalMessage)}</span>
        </div>
        ${extra}
        ${signalHtml}
    `;
    setAdminCookieInfoState('Cookie dang loi hoac khong LIVE, nhung link van duoc tao neu tao link thanh cong.', 'warning');
}

function renderCookieInfoSuccess(accountInfo, meta = {}) {
    const content = el('adminCookieInfoContent');
    if (!content) return;
    const info = accountInfo && typeof accountInfo === 'object' ? accountInfo : {};

    const statusText = info.ok ? 'Hoat dong' : 'Khong hoat dong';
    const statusClass = info.ok ? 'good' : 'bad';
    const paymentHoldText = String(info.on_payment_hold || 'No');
    const paymentHoldClass = isNo(paymentHoldText) ? 'good' : 'bad';

    const topFields = [
        { label: 'Trang thai', value: statusText, tone: statusClass },
        { label: 'Goi cuoc', value: `${String(info.plan || 'Khong ro')} ${info.premium ? '(Premium)' : ''}`.trim() },
        { label: 'Payment Hold', value: paymentHoldText, tone: paymentHoldClass },
        { label: 'Quoc gia', value: info.country || 'N/A' },
        { label: 'Man hinh', value: `${info.max_streams || '?'} man` },
        { label: 'Chat luong', value: info.video_quality || 'N/A' }
    ];

    const chipsHtml = topFields.map((item) => `
        <div class="admin-info-chip ${item.tone ? item.tone : ''}">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.value)}</span>
        </div>
    `).join('');

    const overloadMessage = String(meta.overloadMessage || '').trim();
    const overloadSignal = String(meta.overloadSignal || '').trim();
    const overloadRow = overloadMessage
        ? `
            <strong>Overload:</strong><span>${escapeHtml(overloadMessage)}</span>
            <strong>Signal:</strong><span>${escapeHtml(overloadSignal || '-')}</span>
        `
        : '';

    content.innerHTML = `
        <div class="admin-info-highlight-grid">${chipsHtml}</div>
        <div class="admin-info-grid">
            <strong>Gia goi:</strong><span>${escapeHtml(info.plan_price || 'N/A')}</span>
            <strong>Ngay lap:</strong><span>${escapeHtml(info.member_since || 'N/A')}</span>
            <strong>Thanh toan:</strong><span>${escapeHtml(info.payment_method || 'N/A')}</span>
            <strong>Phone:</strong><span>${escapeHtml(info.phone || 'N/A')} (Verified: ${escapeHtml(info.phone_verified || 'No')})</span>
            <strong>Email:</strong><span>${escapeHtml(String(info.email || 'N/A').replace(/\\x40/g, '@'))} (Verified: ${escapeHtml(info.email_verified || 'No')})</span>
            <strong>Thanh vien phu:</strong><span>${escapeHtml(info.extra_member || 'No')}</span>
            <strong>Profiles:</strong><span>${escapeHtml(info.profiles || '?')}</span>
            <strong>Gia han toi:</strong><span>${escapeHtml(info.next_billing || 'N/A')}</span>
            ${overloadRow}
        </div>
    `;

    if (info.ok) {
        setAdminCookieInfoState('Cookie LIVE. Da cap nhat bang thong tin ben phai.', 'success');
    } else {
        setAdminCookieInfoState('Cookie da duoc check nhung trang thai khong LIVE.', 'warning');
    }
}

async function checkCookieForShareInfo(cookie = '') {
    const cookieStr = normalizeCookie(cookie);
    if (!cookieStr) {
        return {
            ok: false,
            error: 'Cookie rong, khong the kiem tra.'
        };
    }
    try {
        const data = await apiRequest('/api/nf-cookie-to-link', 'POST', {
            cookieStr,
            device: 'desktop'
        });
        return {
            ok: true,
            accountInfo: data && data.accountInfo ? data.accountInfo : null,
            overloadOutcome: String(data && data.overloadOutcome ? data.overloadOutcome : '').trim(),
            overloadSignal: String(data && data.overloadSignal ? data.overloadSignal : '').trim(),
            overloadMessage: String(data && data.overloadMessage ? data.overloadMessage : '').trim()
        };
    } catch (error) {
        return {
            ok: false,
            error: String(error && error.message ? error.message : 'Khong kiem tra duoc cookie.').trim()
        };
    }
}

function normalizeCookie(value = '') {
    return String(value || '').trim();
}

function parseDateMs(value = '') {
    const text = String(value || '').trim();
    if (!text) return 0;
    const ms = Date.parse(text);
    return Number.isFinite(ms) ? ms : 0;
}

function isShareExpiredClient(share = null) {
    return parseDateMs(share && share.expiresAt) < Date.now() && !!parseDateMs(share && share.expiresAt);
}

function formatDateTime(value = '') {
    const ms = parseDateMs(value);
    if (!ms) return 'Khong gioi han';
    return new Date(ms).toLocaleString('vi-VN');
}

function parseCreateExpiryInput(dateValue = '', timeValue = '') {
    const rawDate = String(dateValue || '').trim();
    const rawTime = String(timeValue || '').trim();
    if (!rawDate && !rawTime) {
        return { ok: true, iso: '', label: 'không giới hạn' };
    }
    if (!rawDate && rawTime) {
        return { ok: false, error: 'Bạn cần nhập ngày trước khi nhập giờ.' };
    }

    const dateMatch = rawDate.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
    if (!dateMatch) {
        return { ok: false, error: 'Ngày phải theo dạng dd/mm hoặc dd/mm/yyyy.' };
    }

    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const year = dateMatch[3] ? Number(dateMatch[3]) : new Date().getFullYear();
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
        return { ok: false, error: 'Ngày không hợp lệ.' };
    }

    let hours = 0;
    let minutes = 0;
    if (rawTime) {
        const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})$/);
        if (!timeMatch) {
            return { ok: false, error: 'Giờ phải theo dạng HH:mm.' };
        }
        hours = Number(timeMatch[1]);
        minutes = Number(timeMatch[2]);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return { ok: false, error: 'Giờ không hợp lệ.' };
        }
    }

    const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    if (
        localDate.getFullYear() !== year ||
        localDate.getMonth() !== month - 1 ||
        localDate.getDate() !== day ||
        localDate.getHours() !== hours ||
        localDate.getMinutes() !== minutes
    ) {
        return { ok: false, error: 'Ngày giờ không hợp lệ.' };
    }

    const pad = (num) => String(num).padStart(2, '0');
    const label = `${pad(day)}/${pad(month)}/${year} ${pad(hours)}:${pad(minutes)}`;
    return {
        ok: true,
        iso: localDate.toISOString(),
        label
    };
}

function parseQuickDaysExpiryInput(daysValue = '') {
    const raw = String(daysValue || '').trim();
    if (!raw) return { ok: true, iso: '', label: '', usingQuickDays: false };
    if (!/^\d+$/.test(raw)) {
        return { ok: false, error: 'Hạn lẹ phải là số ngày nguyên dương.' };
    }
    const days = Number(raw);
    if (!Number.isInteger(days) || days <= 0) {
        return { ok: false, error: 'Hạn lẹ phải lớn hơn 0 ngày.' };
    }
    const expiresAtMs = Date.now() + days * 24 * 60 * 60 * 1000;
    return {
        ok: true,
        iso: new Date(expiresAtMs).toISOString(),
        label: `${days} ngày`,
        usingQuickDays: true
    };
}

function toDatetimeLocalFromIso(value = '') {
    const ms = parseDateMs(value);
    if (!ms) return '';
    const date = new Date(ms);
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function datetimeLocalToIso(value = '') {
    const text = String(value || '').trim();
    if (!text) return '';
    const ms = Date.parse(text);
    if (!Number.isFinite(ms)) return '';
    return new Date(ms).toISOString();
}

function isUnknownPlan(planValue = '') {
    const text = String(planValue || '').trim().toLowerCase();
    if (!text) return true;
    return /unknow|unknown|n\/a/.test(text);
}

function isPaymentHoldYes(value = '') {
    const text = String(value || '').trim().toLowerCase();
    return text === 'yes' || text === 'true' || text === '1';
}

function parseBlockedReasonFromError(error) {
    const status = Number(error && error.httpStatus ? error.httpStatus : 0);
    const text = String(error && error.message ? error.message : '').toLowerCase();
    if (status === 403 || /sbd|access denied/.test(text)) return 'sbd';
    if (status === 401 || /dead|het han|expired|invalid|cookie loi|unauthor|forbidden/.test(text)) return 'dead';
    return 'error';
}

function applyCookieBlockedState(reason = '', detail = '') {
    const normalizedReason = String(reason || '').trim() || 'error';
    const detailText = String(detail || '').trim();
    cookieHealthBlocked = true;
    cookieHealthReason = normalizedReason;
    setEntryAlertState({
        type: 'cookie',
        reason: normalizedReason,
        message: detailText
    });
    setDeviceButtonsEnabled(false);
    setLookupState(
        `Tài khoản đã lỗi, hãy liên hệ admin để được bảo hành. ${detailText}`.trim(),
        'error'
    );
    setGuestGuard(true, detailText || 'Cookie của link hiện đang lỗi. Vui lòng nhắn fanpage để được hỗ trợ bảo hành.', {
        title: 'Cookie hiện đang lỗi',
        kind: 'cookie'
    });
    showEntryAlertPopup(getEntryAlertPopupContent());
}

function clearCookieBlockedState() {
    cookieHealthBlocked = false;
    cookieHealthReason = '';
}

async function checkRuntimeCookieHealth() {
    const cookie = getRuntimeCookie();
    if (!cookie) {
        clearRuntimeProfiles();
        return {
            ok: false,
            blockedReason: 'missing_cookie',
            detailMessage: 'Không có cookie hợp lệ.'
        };
    }

    try {
        const data = await apiRequest('/api/nf-cookie-to-link', 'POST', {
            cookieStr: cookie,
            device: 'mobile'
        });
        const account = data && data.accountInfo ? data.accountInfo : null;
        if (getRuntimeCookie() === cookie) {
            if (account) {
                setRuntimeProfiles(account.profiles || '');
                setRuntimeMaxStreams(account.max_streams || '');
            } else {
                setRuntimeProfiles('Không rõ');
                setRuntimeMaxStreams('');
            }
        }
        if (account && isPaymentHoldYes(account.on_payment_hold)) {
            return {
                ok: false,
                blockedReason: 'hold',
                detailMessage: 'Tài khoản đang bị HOLD (on_payment_hold=yes).'
            };
        }
        if (account && isUnknownPlan(account.plan)) {
            return {
                ok: false,
                blockedReason: 'unknown',
                detailMessage: 'Gói cước đang UNKNOWN.'
            };
        }
        return {
            ok: true,
            blockedReason: '',
            detailMessage: ''
        };
    } catch (error) {
        if (getRuntimeCookie() === cookie) {
            setRuntimeProfiles('Không rõ');
            setRuntimeMaxStreams('');
        }
        const reason = parseBlockedReasonFromError(error);
        if (reason === 'sbd') {
            return {
                ok: false,
                blockedReason: 'sbd',
                detailMessage: 'Cookie bị chặn SBD.'
            };
        }
        if (reason === 'dead') {
            return {
                ok: false,
                blockedReason: 'dead',
                detailMessage: 'Cookie đã dead hoặc hết hạn.'
            };
        }
        return {
            ok: false,
            blockedReason: 'error',
            detailMessage: String(error && error.message ? error.message : 'Không thể kiểm tra cookie.')
        };
    }
}

function toBase64Url(value = '') {
    const bytes = new TextEncoder().encode(String(value || ''));
    let binary = '';
    bytes.forEach((b) => {
        binary += String.fromCharCode(b);
    });
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function fromBase64Url(value = '') {
    const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    if (!normalized) return '';
    const pad = normalized.length % 4;
    const padded = normalized + (pad === 0 ? '' : '='.repeat(4 - pad));
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}

function setGuestGuard(active, text = '') {
    const options = arguments[2] && typeof arguments[2] === 'object' ? arguments[2] : {};
    guestGuardActive = !!active;
    const guard = el('guestGuard');
    const guardTitle = guard ? guard.querySelector('h3') : null;
    const guardText = el('guestGuardText');
    if (guard) guard.classList.toggle('hidden', !guestGuardActive);
    if (guardTitle) {
        const title = options.title
            || (options.kind === 'cookie' ? 'Cookie hiện đang lỗi' : 'Không tìm thấy link hợp lệ');
        guardTitle.textContent = String(title || '').trim();
    }
    if (guardText && text) guardText.textContent = String(text).trim();
    setDeviceButtonsEnabled(!guestGuardActive && !!runtimeCookie);
}

function setDeviceButtonsEnabled(enabled) {
    const buttons = Array.from(document.querySelectorAll('.btn-device'));
    const finalEnabled = !!enabled && !!runtimeCookie && !busy && !guestGuardActive && !cookieHealthBlocked;
    buttons.forEach((btn) => {
        btn.disabled = !finalEnabled;
    });
}

function setButtonBusy(button, isBusy, busyLabel = 'Dang xu ly...') {
    if (!button) return;
    if (isBusy) {
        if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent || '';
        button.textContent = busyLabel;
        button.disabled = true;
        return;
    }
    if (button.dataset.originalLabel) {
        button.textContent = button.dataset.originalLabel;
        delete button.dataset.originalLabel;
    }
    button.disabled = false;
}

function showLookupLoadingOverlay(message = 'Xin vui long cho trong giay lat') {
    const overlay = el('lookupLoadingOverlay');
    const text = el('lookupLoadingText');
    if (text) text.textContent = String(message || 'Xin vui long cho trong giay lat');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
}

function hideLookupLoadingOverlay() {
    const overlay = el('lookupLoadingOverlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
}

async function apiRequest(path, method = 'GET', body) {
    const requestPath = String(path || '').trim();
    const isAdminRoute = /^\/api\/getlink-admin(?:\/|$)/.test(requestPath);
    async function sendRequest() {
        const headers = { 'Content-Type': 'application/json' };
        if (isAdminRoute && adminIdToken) {
            headers.Authorization = `Bearer ${adminIdToken}`;
        }
        const response = await fetch(path, {
            method,
            headers,
            credentials: 'same-origin',
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
        const data = await response.json().catch(() => ({}));
        return { response, data };
    }

    let result = await sendRequest();
    let sessionExpiredHandled = false;
    if (!result.response.ok && isAdminRoute && Number(result.response.status || 0) === 401) {
        const refreshed = await refreshAdminIdToken().catch(() => false);
        if (refreshed) {
            result = await sendRequest();
        } else {
            handleAdminSessionExpired();
            sessionExpiredHandled = true;
        }
    }

    if (!result.response.ok) {
        if (isAdminRoute && Number(result.response.status || 0) === 401 && !sessionExpiredHandled) {
            handleAdminSessionExpired();
        }
        const err = new Error(String(result.data.error || 'Request failed'));
        err.httpStatus = Number(result.response.status || 0);
        err.responseData = result.data || {};
        throw err;
    }
    return result.data;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms || 0) || 0)));
}

function getSheetImportOperationStorageKey(scope = 'current') {
    return `${GETLINK_SHEET_IMPORT_OPERATION_STORAGE_PREFIX}${scope === 'create' ? 'create' : 'current'}`;
}

function writeSessionJson(key, value) {
    try {
        if (!window.sessionStorage) return;
        window.sessionStorage.setItem(String(key || '').trim(), JSON.stringify(value || {}));
    } catch (error) {
        // ignore sessionStorage errors
    }
}

function readSessionJson(key) {
    try {
        if (!window.sessionStorage) return null;
        const raw = window.sessionStorage.getItem(String(key || '').trim());
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
        return null;
    }
}

function removeSessionJson(key) {
    try {
        if (!window.sessionStorage) return;
        window.sessionStorage.removeItem(String(key || '').trim());
    } catch (error) {
        // ignore sessionStorage errors
    }
}

function saveAdminAuthToStorage() {
    try {
        const payload = JSON.stringify({
            idToken: adminIdToken || '',
            refreshToken: adminRefreshToken || '',
            email: adminEmail || ''
        });
        window.localStorage.setItem(GETLINK_ADMIN_AUTH_STORAGE_KEY, payload);
    } catch (error) {
        // ignore storage failures
    }
}

function loadAdminAuthFromStorage() {
    try {
        const raw = window.localStorage.getItem(GETLINK_ADMIN_AUTH_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        adminIdToken = String(parsed && parsed.idToken ? parsed.idToken : '').trim();
        adminRefreshToken = String(parsed && parsed.refreshToken ? parsed.refreshToken : '').trim();
        adminEmail = String(parsed && parsed.email ? parsed.email : '').trim().toLowerCase();
    } catch (error) {
        adminIdToken = '';
        adminRefreshToken = '';
        adminEmail = '';
    }
}

function clearAdminAuthState() {
    adminAuthenticated = false;
    adminIdToken = '';
    adminRefreshToken = '';
    adminEmail = '';
    try {
        window.localStorage.removeItem(GETLINK_ADMIN_AUTH_STORAGE_KEY);
    } catch (error) {
        // ignore storage failures
    }
}

function setAdminAuthTokens(idToken = '', refreshToken = '', email = '') {
    adminIdToken = String(idToken || '').trim();
    adminRefreshToken = String(refreshToken || '').trim();
    adminEmail = String(email || '').trim().toLowerCase();
    saveAdminAuthToStorage();
}

function getFirebaseApiKey() {
    const cfg = typeof window !== 'undefined' && window.NF_FIREBASE_CONFIG && typeof window.NF_FIREBASE_CONFIG === 'object'
        ? window.NF_FIREBASE_CONFIG
        : null;
    return String(cfg && cfg.apiKey ? cfg.apiKey : '').trim();
}

function getAllowedAdminEmailsFromRuntime() {
    const list = Array.isArray(window && window.NF_ADMIN_EMAILS) ? window.NF_ADMIN_EMAILS : [];
    return list.map((item) => String(item || '').trim().toLowerCase()).filter((item) => !!item);
}

function mapFirebaseSignInError(message = '') {
    const code = String(message || '').trim().toUpperCase();
    if (!code) return 'Dang nhap Firebase that bai.';
    if (code.includes('INVALID_LOGIN_CREDENTIALS') || code.includes('INVALID_PASSWORD') || code.includes('EMAIL_NOT_FOUND')) {
        return 'Sai email hoac mat khau Firebase.';
    }
    if (code.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
        return 'Dang nhap qua nhieu lan. Thu lai sau.';
    }
    if (code.includes('USER_DISABLED')) {
        return 'Tai khoan Firebase da bi vo hieu hoa.';
    }
    return `Dang nhap Firebase that bai: ${code}`;
}

function mapFirebaseRefreshError(message = '') {
    const code = String(message || '').trim().toUpperCase();
    if (!code) return 'Gia han phien admin that bai.';
    if (code.includes('TOKEN_EXPIRED') || code.includes('INVALID_REFRESH_TOKEN') || code.includes('USER_DISABLED') || code.includes('USER_NOT_FOUND')) {
        return 'Phien admin het han. Vui long dang nhap lai.';
    }
    return `Gia han phien admin that bai: ${code}`;
}

function handleAdminSessionExpired(message = 'Phien admin het han. Vui long dang nhap lai.') {
    clearAdminAuthState();
    adminSessionResolved = true;
    renderAdminShare(null);
    resetCreatedShareComposer();
    autoLoadedAdminShareId = '';
    setAdminAuthState(message, 'warning');
    setAdminSearchState('Vui long dang nhap lai de tiep tuc.', 'warning');
    renderAdminWorkspace();
}

async function refreshAdminIdToken() {
    if (!adminRefreshToken) return false;
    if (adminTokenRefreshPromise) return adminTokenRefreshPromise;

    adminTokenRefreshPromise = (async () => {
        const apiKey = getFirebaseApiKey();
        if (!apiKey) throw new Error('Thieu NF_FIREBASE_CONFIG.apiKey tren /getlink.');

        const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(adminRefreshToken)}`
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const firebaseError = String(data && data.error && data.error.message ? data.error.message : '').trim();
            throw new Error(mapFirebaseRefreshError(firebaseError));
        }

        const nextIdToken = String(data && data.id_token ? data.id_token : '').trim();
        const nextRefreshToken = String(data && data.refresh_token ? data.refresh_token : adminRefreshToken).trim();
        if (!nextIdToken) throw new Error('Firebase khong tra ve id_token khi gia han phien.');

        adminIdToken = nextIdToken;
        adminRefreshToken = nextRefreshToken;
        saveAdminAuthToStorage();
        return true;
    })();

    try {
        return await adminTokenRefreshPromise;
    } finally {
        adminTokenRefreshPromise = null;
    }
}

async function signInWithFirebasePassword(email, password) {
    const apiKey = getFirebaseApiKey();
    if (!apiKey) {
        throw new Error('Thieu NF_FIREBASE_CONFIG.apiKey tren /getlink.');
    }
    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: String(email || '').trim(),
                password: String(password || ''),
                returnSecureToken: true
            })
        }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const firebaseError = String(data && data.error && data.error.message ? data.error.message : '').trim();
        throw new Error(mapFirebaseSignInError(firebaseError));
    }
    const idToken = String(data && data.idToken ? data.idToken : '').trim();
    const refreshToken = String(data && data.refreshToken ? data.refreshToken : '').trim();
    const loggedEmail = String(data && data.email ? data.email : email).trim().toLowerCase();
    if (!idToken) throw new Error('Firebase khong tra ve idToken.');
    return { idToken, refreshToken, email: loggedEmail };
}

function openDeferredTabAndNavigate() {
    const popupWindow = window.open('about:blank', '_blank');
    if (!popupWindow) return { popupWindow: null, wasBlocked: true };

    try {
        popupWindow.document.title = 'Get Link';
        popupWindow.document.body.style.margin = '0';
        popupWindow.document.body.style.fontFamily = 'Arial, sans-serif';
        popupWindow.document.body.style.background = '#0b0f1c';
        popupWindow.document.body.style.color = '#ffffff';
        popupWindow.document.body.style.display = 'flex';
        popupWindow.document.body.style.alignItems = 'center';
        popupWindow.document.body.style.justifyContent = 'center';
        popupWindow.document.body.innerHTML = '<div>Đang tạo link Netflix...</div>';
    } catch (error) {
        // ignore
    }

    return { popupWindow, wasBlocked: false };
}

function getRuntimeCookie() {
    return normalizeCookie(runtimeCookie);
}

function isRuntimeShareDesktopOnly() {
    return runtimeShareDesktopOnly === true;
}

function setRuntimeShareDesktopOnly(value) {
    runtimeShareDesktopOnly = value === true;
}

function syncAdminCookieInput() {
    return '';
}

function getAdminRuntimeCookieInputValue() {
    return '';
}

function updateReadyState() {
    const hasCookie = !!getRuntimeCookie();
    if (hasCookie && cookieHealthBlocked) {
        setDeviceButtonsEnabled(false);
        return;
    }
    if (disclaimerVisible) {
        setDeviceButtonsEnabled(false);
        return;
    }
    setDeviceButtonsEnabled(hasCookie && !guestGuardActive);
    if (!hasCookie && !entryAlertState && !pendingShareIdFromUrl) {
        setLookupState('', 'idle');
    }
}

function setRuntimeCookie(rawCookie, options = {}) {
    const next = normalizeCookie(rawCookie);
    const source = String(options.source || 'unknown').trim();
    const silent = !!options.silent;
    const profiles = String(options.profiles || '').trim();

    runtimeCookie = next;
    setRuntimeMaxStreams('');
    clearCookieBlockedState();
    if (next) {
        if (profiles) setRuntimeProfiles(profiles);
        else setRuntimeProfilesLoading();
        resetEntryAlertState();
        renderSupportModalContent(getDefaultSupportModalContent());
    }

    if (next) {
        setGuestGuard(false);
        if (!silent) {
            if (source === 'share-id') {
                setLookupState('Đã tải cookie từ share link. Hãy chọn thiết bị để tiếp tục.', 'success');
            } else if (source === 'cookie-link') {
                setLookupState('Đã giải mã cookie từ link chia sẻ. Hãy chọn thiết bị để tiếp tục.', 'success');
            } else if (source === 'admin') {
                setLookupState('Admin da ap dung cookie cho phien hien tai.', 'success');
            }
        }
        updateReadyState();
        return;
    }

    clearRuntimeProfiles();
    if (!entryAlertState) {
        setGuestGuard(true, 'Hãy mở đúng link /getlink?s=... hoặc /getlink?c=... để tiếp tục.', {
            title: 'Không tìm thấy link hợp lệ',
            kind: 'link'
        });
        setLookupState('Không có cookie hợp lệ. Chỉ có thể tiếp tục bằng link được cấp.', 'warning');
    }
    updateReadyState();
}

async function refreshRuntimeProfilesForCurrentCookie() {
    if (!getRuntimeCookie()) {
        clearRuntimeProfiles();
        return null;
    }
    return checkRuntimeCookieHealth();
}

function getDesktopOnlyBlockedMessage() {
    return 'GÓI NETFLIX TẶNG KÈM CHỈ CÓ THỂ XEM ĐƯỢC TRÊN MÁY TÍNH';
}

function showDesktopOnlyBlockedPopup() {
    const message = getDesktopOnlyBlockedMessage();
    setLookupState(message, 'warning');
    openSupportModal({
        eyebrow: 'Thông báo',
        title: 'Thông báo',
        message,
        showBh247: false
    });
}

function getEntryAlertPopupContent() {
    const state = entryAlertState && typeof entryAlertState === 'object' ? entryAlertState : null;
    if (!state) return getDefaultSupportModalContent();
    const isNoLiveCookie = state.reason === 'share_no_live_cookie';
    const message = isNoLiveCookie
        ? ''
        : String(state.message || '').trim() || 'Vui lòng nhắn tin qua fanpage để được hỗ trợ bảo hành nhanh nhất.';
    if (state.type === 'cookie') {
        const titleMap = {
            sbd: 'Cookie bị SBD',
            dead: 'Cookie đã lỗi',
            hold: 'Tài khoản đang bị hold',
            unknown: 'Cookie đang lỗi',
            share_no_live_cookie: 'Link đã hết cookie hợp lệ',
            error: 'Cookie đang lỗi'
        };
        return {
            eyebrow: 'Thông báo / Hỗ trợ',
            title: titleMap[state.reason] || 'Cookie đang lỗi',
            message,
            showBh247: !isNoLiveCookie,
            closable: state.reason !== 'share_no_live_cookie',
            showAutoFix: isNoLiveCookie
        };
    }
    const titleMap = {
        share_not_found: 'Link không tồn tại',
        share_revoked: 'Link đã bị thu hồi',
        share_expired: 'Link đã hết hạn',
        invalid_cookie_link: 'Link cookie không hợp lệ',
        invalid_share_link: 'Link không hợp lệ'
    };
    return {
        eyebrow: 'Thông báo / Hỗ trợ',
        title: titleMap[state.reason] || 'Link không hợp lệ',
        message,
        showBh247: false,
        closable: state.reason !== 'share_expired'
    };
}

function classifyShareEntryError(error) {
    const status = Number(error && error.httpStatus ? error.httpStatus : 0);
    const rawMessage = String(error && error.message ? error.message : '').trim();
    const normalized = rawMessage.toLowerCase();
    if (status === 404 || normalized.includes('not found')) {
        return {
            type: 'link',
            reason: 'share_not_found',
            lookupMessage: 'Link chia sẻ không tồn tại hoặc đã bị xóa.',
            guardTitle: 'Không tìm thấy link hợp lệ',
            guardMessage: 'Link bạn mở không còn tồn tại. Vui lòng liên hệ admin để nhận link mới.'
        };
    }
    if (status === 410 && normalized.includes('revoked')) {
        return {
            type: 'link',
            reason: 'share_revoked',
            lookupMessage: 'Link chia sẻ này đã bị thu hồi.',
            guardTitle: 'Link đã bị thu hồi',
            guardMessage: 'Link này đã bị thu hồi. Vui lòng liên hệ admin để nhận link mới.'
        };
    }
    if (status === 410 && normalized.includes('expired')) {
        return {
            type: 'link',
            reason: 'share_expired',
            lookupMessage: 'Link chia sẻ này đã hết hạn.',
            guardTitle: 'Link đã hết hạn',
            guardMessage: 'Link này đã hết hạn sử dụng. Vui lòng liên hệ admin để được cấp lại link.'
        };
    }
    if (status === 410 && (normalized.includes('het cookie hop le') || normalized.includes('hết cookie hợp lệ'))) {
        return {
            type: 'cookie',
            reason: 'share_no_live_cookie',
            lookupMessage: 'Link này đã hết cookie hợp lệ. Bạn có thể bấm SỬA LỖI TỰ ĐỘNG để hệ thống thử khắc phục.',
            guardTitle: 'Link đã hết cookie hợp lệ',
            guardMessage: 'Link này vẫn còn hạn nhưng hiện không còn cookie dùng được. Bạn có thể bấm SỬA LỖI TỰ ĐỘNG hoặc nhắn fanpage để được hỗ trợ bảo hành.'
        };
    }
    return {
        type: 'link',
        reason: 'invalid_share_link',
        lookupMessage: rawMessage || 'Không tải được cookie từ link chia sẻ.',
        guardTitle: 'Không tìm thấy link hợp lệ',
        guardMessage: rawMessage || 'Hãy mở đúng link /getlink?s=... hoặc /getlink?c=... để tiếp tục.'
    };
}

function shouldShowOverloadFix() {
    return !!String(pendingShareIdFromUrl || '').trim() && isSheetAccessEnabled();
}

function updateOverloadFixVisibility() {
    const button = el('overloadFixBtn');
    const householdButton = el('householdFixBtn');
    const visible = shouldShowOverloadFix();
    if (button) {
        const enabled = visible && isFixModeEnabled('overload');
        button.classList.toggle('hidden', !enabled);
        button.disabled = !enabled || overloadFixBusy;
    }
    if (householdButton) {
        const enabled = visible && isFixModeEnabled('household');
        householdButton.classList.toggle('hidden', !enabled);
        householdButton.disabled = !enabled || overloadFixBusy;
    }
}

async function copyText(text, successText = 'Đã sao chép.', failureText = 'Không copy được. Hãy copy thủ công.') {
    try {
        await navigator.clipboard.writeText(String(text || ''));
        showToast(successText, 'ok');
        return true;
    } catch (error) {
        showToast(failureText, 'warn');
        return false;
    }
}

function openSupportModal(payload = null) {
    const modal = el('supportModal');
    if (!modal) return;
    renderSupportModalContent(payload);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeSupportModal(options = {}) {
    const modal = el('supportModal');
    const force = !!(options && options.force);
    const state = supportModalState && typeof supportModalState === 'object' ? supportModalState : getDefaultSupportModalContent();
    if (!modal) return false;
    if (!force && state.closable === false) return false;
    renderSupportModalContent(getDefaultSupportModalContent());
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    const shouldReload = !force && !!state.reloadOnClose;
    supportModalState = null;
    if (shouldReload) {
        window.location.reload();
    }
    return true;
}

function openMobileLinkModal(url, mobileOs = 'android') {
    const modal = el('mobileLinkModal');
    const output = el('mobileLinkOutput');

    mobileGeneratedLink = String(url || '').trim();
    if (!modal || !output) return;
    output.value = mobileGeneratedLink;

    const guide = String(mobileOs).toLowerCase() === 'ios'
        ? getContentConfig().mobileGuides.ios
        : getContentConfig().mobileGuides.android;
    setText('mobileLinkTitle', guide.modalTitle);
    setText('mobileGuideTitle', guide.guideTitle);
    renderCopyGuideSteps('mobileGuideSteps', guide.steps, 'copyUnsupportedLinkBtn', guide.copyUnsupportedText, UNSUPPORTED_URL);

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeMobileLinkModal() {
    const modal = el('mobileLinkModal');
    const output = el('mobileLinkOutput');
    if (output) output.value = '';
    mobileGeneratedLink = '';
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function renderDisclaimerContent() {
    const config = getContentConfig().disclaimer;
    setText('disclaimerEyebrow', config.eyebrow);
    setText('disclaimerTitle', config.title);
    setText('disclaimerLead', config.lead);
    setText('disclaimerDismissBtn', config.dismissText);
    const list = el('disclaimerList');
    if (list) {
        list.innerHTML = '';
        (Array.isArray(config.items) ? config.items : []).forEach((item) => {
            const li = document.createElement('li');
            li.textContent = String(item || '').trim();
            list.appendChild(li);
        });
    }
}
function openTvGuideModal(url = '') {
    const modal = el('tvGuideModal');
    const output = el('tvGuideOutput');
    tvGeneratedLink = String(url || '').trim();
    if (output) output.value = tvGeneratedLink;
    const guide = getContentConfig().tvGuide;
    setText('tvGuideTitle', guide.modalTitle);
    setText('tvGuideHeading', guide.guideTitle);
    renderCopyGuideSteps('tvGuideSteps', guide.steps, 'copyTv2LinkBtn', guide.copyTv2Text, TV2_URL);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeTvGuideModal() {
    const modal = el('tvGuideModal');
    const output = el('tvGuideOutput');
    if (output) output.value = '';
    tvGeneratedLink = '';
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function openDisclaimerModal() {
    if (!canShowPromotionalPopups() || disclaimerDismissed) return;

    disclaimerVisible = true;
    renderDisclaimerContent();
    const modal = el('disclaimerModal');
    const dismissBtn = el('disclaimerDismissBtn');
    const waitMs = 2000;
    disclaimerReadyAt = Date.now() + waitMs;

    if (dismissBtn) dismissBtn.disabled = true;
    setDisclaimerState(formatTemplate(getContentConfig().disclaimer.waitText, { seconds: 2 }), 'warning');

    if (disclaimerTimer) {
        window.clearInterval(disclaimerTimer);
        disclaimerTimer = null;
    }

    disclaimerTimer = window.setInterval(() => {
        const remainMs = Math.max(0, disclaimerReadyAt - Date.now());
        const remainSec = Math.ceil(remainMs / 1000);
        if (remainMs > 0) {
            setDisclaimerState(formatTemplate(getContentConfig().disclaimer.waitText, { seconds: remainSec }), 'warning');
            if (dismissBtn) dismissBtn.disabled = true;
            return;
        }

        if (dismissBtn) dismissBtn.disabled = false;
        setDisclaimerState(getContentConfig().disclaimer.readyText, 'success');
        window.clearInterval(disclaimerTimer);
        disclaimerTimer = null;
    }, 150);

    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeDisclaimerModal(force = false) {
    if (!force && Date.now() < disclaimerReadyAt) return false;

    const modal = el('disclaimerModal');
    const dismissBtn = el('disclaimerDismissBtn');

    if (disclaimerTimer) {
        window.clearInterval(disclaimerTimer);
        disclaimerTimer = null;
    }

    disclaimerVisible = false;
    disclaimerDismissed = force ? disclaimerDismissed : true;
    disclaimerReadyAt = 0;

    if (dismissBtn) dismissBtn.disabled = false;
    if (modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }

    return true;
}

function openDeviceConfirmModal(device = '') {
    const normalized = String(device || '').trim();
    if (!normalized) return;
    pendingDeviceConfirm = normalized;
    const modal = el('deviceConfirmModal');
    const title = el('deviceConfirmTitle');
    const hint = el('deviceConfirmHint');
    const countdown = el('deviceConfirmCountdown');
    const okBtn = el('deviceConfirmOkBtn');

    const labels = {
        desktop: 'Máy tính',
        mobile: 'Điện thoại',
        tablet: 'Máy tính bảng',
        tv: 'TV'
    };
    const label = labels[normalized] || normalized;
    const config = getContentConfig().deviceConfirm;

    if (title) title.textContent = formatTemplate(config.titleTemplate, { device: label });
    if (hint) hint.textContent = config.hint;
    setText('deviceConfirmOkBtn', config.okText);
    setText('deviceConfirmCancelBtn', config.cancelText);
    if (deviceConfirmTimer) {
        window.clearInterval(deviceConfirmTimer);
        deviceConfirmTimer = null;
    }

    const waitMs = isAdminImmediate() ? 0 : 3000;
    deviceConfirmReadyAt = Date.now() + waitMs;

    if (waitMs <= 0) {
        if (countdown) {
            countdown.textContent = config.readyText;
            setStateClass(countdown, 'success');
        }
        if (okBtn) okBtn.disabled = false;
    } else {
        if (countdown) {
            countdown.textContent = formatTemplate(config.waitText, { seconds: 3 });
            setStateClass(countdown, 'warning');
        }
        if (okBtn) okBtn.disabled = true;

        deviceConfirmTimer = window.setInterval(() => {
            const remainMs = Math.max(0, deviceConfirmReadyAt - Date.now());
            const remainSec = Math.ceil(remainMs / 1000);
            if (countdown) {
                if (remainMs > 0) {
                    countdown.textContent = formatTemplate(getContentConfig().deviceConfirm.waitText, { seconds: remainSec });
                    setStateClass(countdown, 'warning');
                } else {
                    countdown.textContent = getContentConfig().deviceConfirm.readyText;
                    setStateClass(countdown, 'success');
                }
            }
            if (okBtn) okBtn.disabled = remainMs > 0;
            if (remainMs <= 0) {
                window.clearInterval(deviceConfirmTimer);
                deviceConfirmTimer = null;
            }
        }, 150);
    }

    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeDeviceConfirmModal() {
    const modal = el('deviceConfirmModal');
    if (deviceConfirmTimer) {
        window.clearInterval(deviceConfirmTimer);
        deviceConfirmTimer = null;
    }
    pendingDeviceConfirm = '';
    deviceConfirmReadyAt = 0;
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function openMobileOsModal(deviceType = 'mobile') {
    pendingMobileOsDevice = String(deviceType || 'mobile').trim() || 'mobile';
    const modal = el('mobileOsModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeMobileOsModal() {
    const modal = el('mobileOsModal');
    pendingMobileOsDevice = '';
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function openOverloadFixModal(mode = 'overload') {
    if (!shouldShowOverloadFix() || overloadFixBusy) return;
    activeFixMode = mode === 'household' ? 'household' : 'overload';
    const modal = el('overloadFixModal');
    const confirmBtn = el('overloadFixConfirmBtn');
    renderOverloadFixModal(activeFixMode);
    if (overloadFixTimer) {
        window.clearInterval(overloadFixTimer);
        overloadFixTimer = null;
    }
    if (confirmBtn) {
        setButtonBusy(confirmBtn, false);
    }

    const waitMs = isAdminImmediate() ? 0 : 10000;
    overloadFixReadyAt = Date.now() + waitMs;

    if (waitMs <= 0) {
        setOverloadFixState(getContentConfig().fix.common.readyText, 'success');
        if (confirmBtn) confirmBtn.disabled = false;
    } else {
        setOverloadFixState(formatTemplate(getContentConfig().fix.common.waitText, { seconds: 10 }), 'warning');
        if (confirmBtn) confirmBtn.disabled = true;

        overloadFixTimer = window.setInterval(() => {
            const remainMs = Math.max(0, overloadFixReadyAt - Date.now());
            const remainSec = Math.ceil(remainMs / 1000);
            if (remainMs > 0) {
                setOverloadFixState(formatTemplate(getContentConfig().fix.common.waitText, { seconds: remainSec }), 'warning');
                if (confirmBtn) confirmBtn.disabled = true;
                return;
            }

            setOverloadFixState(getContentConfig().fix.common.readyText, 'success');
            if (confirmBtn) confirmBtn.disabled = false;
            window.clearInterval(overloadFixTimer);
            overloadFixTimer = null;
        }, 150);
    }

    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeOverloadFixModal(force = false) {
    if (!force && overloadFixBusy) return;
    const modal = el('overloadFixModal');
    stopOverloadFixLoading();
    if (overloadFixTimer) {
        window.clearInterval(overloadFixTimer);
        overloadFixTimer = null;
    }
    overloadFixReadyAt = 0;
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function openOverloadFixSuccessModal() {
    const modal = el('overloadFixSuccessModal');
    renderOverloadFixSuccessModal(activeFixMode);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeOverloadFixSuccessModal() {
    const modal = el('overloadFixSuccessModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }
    window.location.reload();
}

function syncAdminImmediateModals() {
    const deviceConfirmModal = el('deviceConfirmModal');
    if (deviceConfirmModal && !deviceConfirmModal.classList.contains('hidden') && pendingDeviceConfirm) {
        openDeviceConfirmModal(pendingDeviceConfirm);
    }

    const overloadFixModal = el('overloadFixModal');
    if (overloadFixModal && !overloadFixModal.classList.contains('hidden') && shouldShowOverloadFix()) {
        openOverloadFixModal(activeFixMode);
    }
}

function normalizeOverloadFixErrorMessage(error) {
    const rawMessage = String(error && error.message ? error.message : '').trim();
    const config = getFixModeConfig(activeFixMode);
    const responseData = error && error.responseData && typeof error.responseData === 'object' ? error.responseData : {};
    const limit = responseData && responseData.limit && typeof responseData.limit === 'object' ? responseData.limit : null;
    const code = String((responseData && responseData.code) || (error && error.code) || '').trim();
    if (Number(error && error.httpStatus ? error.httpStatus : 0) === 429) {
        if (code === 'FIX_LIMIT_REACHED' || (limit && limit.limited === true)) {
            const max24h = limit ? Math.max(1, Number(limit.max24h || 4) || 4) : 4;
            return `Link này đã dùng hết ${max24h} lần sửa lỗi thành công trong 24h, vui lòng liên hệ hỗ trợ.`;
        }
        const cooldownUntilMs = limit ? (Date.parse(String(limit.cooldownUntil || '').trim()) || 0) : 0;
        if (code === 'FIX_COOLDOWN' || cooldownUntilMs > Date.now()) {
            const minutes = cooldownUntilMs > Date.now()
                ? Math.max(1, Math.ceil((cooldownUntilMs - Date.now()) / 60000))
                : 5;
            return `Link này vừa sửa lỗi thành công, vui lòng thử lại sau ${minutes} phút.`;
        }
        return rawMessage || config.fallbackError;
    }
    if (!rawMessage) return config.fallbackError;

    const normalized = rawMessage.toLowerCase();
    if (normalized.includes('khong lay du') && normalized.includes('cookie pass tu google sheet')
        || normalized.includes('không lấy đủ') && normalized.includes('cookie pass từ google sheet')) {
        return `Không lấy đủ cookie sống từ Google Sheet để tự ${config.actionLabel}. Vui lòng bấm CẦN HỖ TRỢ / BẢO HÀNH để được hỗ trợ.`;
    }
    if (normalized.includes('apps script')
        || normalized.includes('timeout')
        || normalized.includes('timed out')) {
        return `Không thể kết nối Google Sheet để ${config.actionLabel} lúc này. Vui lòng thử lại sau.`;
    }
    if (normalized.includes('het cookie du phong')
        || normalized.includes('hết cookie dự phòng')
        || normalized.includes('khong du cookie du phong')
        || normalized.includes('không đủ cookie dự phòng')) {
        return config.fallbackError;
    }
    if (normalized.includes('khong du cookie song truoc khi rotate')
        || normalized.includes('không đủ cookie sống trước khi rotate')) {
        if (normalized.includes('livecount=0') || normalized.includes('livecount:0')) {
            return `Link này đã hết cookie sống, không thể dùng ${config.buttonText}. Vui lòng bấm CẦN HỖ TRỢ / BẢO HÀNH để được hỗ trợ.`;
        }
        return `Link này chỉ còn 1 cookie sống, không thể dùng ${config.buttonText}. Vui lòng bấm CẦN HỖ TRỢ / BẢO HÀNH để được hỗ trợ.`;
    }

    return rawMessage;
}

function getAutoFixFailureMessage() {
    return 'Sửa lỗi không thành công, hãy nhắn tin vào fanpage cú pháp BH247 để được hỗ trợ bảo hành.';
}

function applyOverloadFixSuccess(data = {}) {
    const nextCookie = normalizeCookie(data && data.cookieStr ? data.cookieStr : '');
    if (nextCookie) {
        setRuntimeCookie(nextCookie, { source: 'share-id', silent: true });
    } else {
        runtimeCookie = '';
        clearRuntimeProfiles();
    }
    closeOverloadFixModal(true);
    setLookupState('Đã sửa lỗi thành công, hãy chọn lại thiết bị để sử dụng.', 'success');
    openOverloadFixSuccessModal();
}

function getOverloadFixSuccessPayload(source = {}) {
    const data = source && typeof source === 'object' ? source : {};
    const nextCookie = normalizeCookie(data.cookieStr || '');
    if (!nextCookie) return null;
    return {
        ...data,
        status: 'completed',
        cookieStr: nextCookie
    };
}

function formatAutoFixTimings(timings = null) {
    const source = timings && typeof timings === 'object' ? timings : null;
    if (!source) return '';

    const parts = [];
    const pushPart = (label, value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric < 0) return;
        parts.push(`${label} ${(numeric / 1000).toFixed(1)}s`);
    };

    pushPart('Sheet', source.sheetFetchMs);
    pushPart('Check', source.cookieCheckMs);
    pushPart('Mark', source.sheetUpdateMs);
    pushPart('Save', source.shareUpdateMs);
    pushPart('Total', source.totalMs);
    return parts.join(' | ');
}

function formatOperationElapsed(elapsedMs = 0) {
    const numeric = Math.max(0, Number(elapsedMs || 0) || 0);
    return `${(numeric / 1000).toFixed(1)}s`;
}

function buildGetlinkOperationText(payload = {}, elapsedMs = 0, fallback = '') {
    const message = String(payload && payload.message ? payload.message : fallback || '').trim();
    const timingText = formatAutoFixTimings(payload && payload.timings ? payload.timings : null);
    const elapsedText = elapsedMs > 0 ? `Elapsed ${formatOperationElapsed(elapsedMs)}` : '';
    return [message, timingText, elapsedText].filter(Boolean).join(' | ');
}

function normalizeGetlinkOperationMeta(meta = {}) {
    const source = meta && typeof meta === 'object' ? meta : {};
    return {
        operationId: String(source.operationId || '').trim(),
        operationToken: String(source.operationToken || '').trim(),
        scope: String(source.scope || '').trim(),
        shareId: String(source.shareId || '').trim(),
        startedAt: Math.max(0, Number(source.startedAt || Date.now()) || Date.now())
    };
}

function saveSheetImportOperationMeta(scope = 'current', meta = {}) {
    writeSessionJson(getSheetImportOperationStorageKey(scope), normalizeGetlinkOperationMeta({
        ...meta,
        scope
    }));
}

function readSheetImportOperationMeta(scope = 'current') {
    return readSessionJson(getSheetImportOperationStorageKey(scope));
}

function clearSheetImportOperationMeta(scope = 'current') {
    removeSessionJson(getSheetImportOperationStorageKey(scope));
}

function saveAutoFixOperationMeta(meta = {}) {
    writeSessionJson(GETLINK_AUTO_FIX_OPERATION_STORAGE_KEY, normalizeGetlinkOperationMeta(meta));
}

function readAutoFixOperationMeta() {
    return readSessionJson(GETLINK_AUTO_FIX_OPERATION_STORAGE_KEY);
}

function clearAutoFixOperationMeta() {
    removeSessionJson(GETLINK_AUTO_FIX_OPERATION_STORAGE_KEY);
}

function clearActiveGetlinkOperationTimer(key = '') {
    const normalized = String(key || '').trim();
    if (!normalized || !activeGetlinkOperationTimers.has(normalized)) return;
    clearInterval(activeGetlinkOperationTimers.get(normalized));
    activeGetlinkOperationTimers.delete(normalized);
}

function startActiveGetlinkOperationTimer(key = '', onTick) {
    const normalized = String(key || '').trim();
    if (!normalized || typeof onTick !== 'function') return;
    clearActiveGetlinkOperationTimer(normalized);
    const timerId = setInterval(() => {
        onTick();
    }, 500);
    activeGetlinkOperationTimers.set(normalized, timerId);
}

async function pollGetlinkOperation(operationId = '', operationToken = '') {
    const safeOperationId = String(operationId || '').trim();
    const safeOperationToken = String(operationToken || '').trim();
    if (!safeOperationId || !safeOperationToken) {
        throw new Error('Thiếu thông tin operation để theo dõi tiến độ.');
    }
    const path = `/api/getlink-operations/${encodeURIComponent(safeOperationId)}?token=${encodeURIComponent(safeOperationToken)}`;
    return apiRequest(path, 'GET');
}

async function autoFixShareCookies() {
    const shareId = String(pendingShareIdFromUrl || '').trim();
    if (!shareId || shareAutoFixBusy) return;
    if (!isSheetAccessEnabled()) {
        openSupportModal({
            eyebrow: 'Thông báo / Hỗ trợ',
            title: 'Sửa lỗi tự động đang tắt',
            message: 'Truy cập Google Sheet đang được tắt trong admin. Vui lòng nhắn fanpage để được hỗ trợ.',
            showBh247: true,
            closable: false,
            showAutoFix: false,
            isLoading: false
        });
        return;
    }

    shareAutoFixBusy = true;
    openSupportModal({
        eyebrow: 'Sửa lỗi tự động',
        title: 'Đang sửa lỗi cho bạn',
        message: 'Hệ thống đang xử lý, bạn đợi xíu nha.',
        showBh247: false,
        closable: false,
        showAutoFix: false,
        isLoading: true,
        loadingText: 'Hệ thống đang kiểm tra và sửa lỗi cho bạn.',
        loadingStartedAt: Date.now()
    });

    try {
        let data = await apiRequest(`/api/getlink-shares/${encodeURIComponent(shareId)}/auto-fix-cookies`, 'POST');
        const operationKey = 'auto-fix';
        let operationMeta = null;

        if (String(data && data.status || '').trim() === 'pending') {
            operationMeta = normalizeGetlinkOperationMeta({
                operationId: data.operationId,
                operationToken: data.operationToken,
                shareId,
                startedAt: Date.now()
            });
            saveAutoFixOperationMeta(operationMeta);

            const renderPending = () => {
                openSupportModal({
                    eyebrow: 'Sửa lỗi tự động',
                    title: 'Đang sửa lỗi cho bạn',
                    message: 'Hệ thống đang xử lý, bạn đợi xíu nha.',
                    showBh247: false,
                    closable: false,
                    showAutoFix: false,
                    isLoading: true,
                    loadingText: 'Hệ thống đang kiểm tra và sửa lỗi cho bạn.',
                    loadingStartedAt: operationMeta.startedAt
                });
            };

            renderPending();
            startActiveGetlinkOperationTimer(operationKey, () => {
                renderPending();
            });

            while (String(data && data.status || '').trim() === 'pending') {
                await sleep(GETLINK_OPERATION_POLL_INTERVAL_MS);
                data = await pollGetlinkOperation(operationMeta.operationId, operationMeta.operationToken);
                renderPending();
            }

            clearActiveGetlinkOperationTimer(operationKey);
            clearAutoFixOperationMeta();
        }

        const assignedCount = Number(data && data.assignedCount);
        if (!Number.isFinite(assignedCount) || assignedCount < 1) {
            throw new Error(getAutoFixFailureMessage());
        }
        setLookupState('Đã sửa lỗi thành công. Vui lòng tải lại trang để tiếp tục.', 'success');
        openSupportModal({
            eyebrow: 'Đã sửa lỗi',
            title: 'Sửa lỗi thành công',
            message: 'Tài khoản đã được làm mới. Bấm Đóng để tải lại trang rồi chọn thiết bị và tạo link lại.',
            showBh247: false,
            closable: true,
            showAutoFix: false,
            isLoading: false,
            reloadOnClose: true
        });
    } catch (error) {
        clearAutoFixOperationMeta();
        const status = Number(error && error.httpStatus ? error.httpStatus : 0);
        if (status === 404 || status === 410) {
            const mappedError = classifyShareEntryError(error);
            setEntryAlertState({
                type: mappedError.type,
                reason: mappedError.reason,
                message: mappedError.lookupMessage
            });
            setGuestGuard(true, mappedError.guardMessage, {
                title: mappedError.guardTitle,
                kind: mappedError.type
            });
            setLookupState(mappedError.lookupMessage, mappedError.type === 'cookie' ? 'error' : 'warning');
            openSupportModal(getEntryAlertPopupContent());
            return;
        }
        const normalized = String(error && error.message ? error.message : '').trim();
        const timingText = formatAutoFixTimings(error && error.responseData ? error.responseData.timings : null);
        const message = [normalized || getAutoFixFailureMessage(), timingText].filter(Boolean).join(' | ');
        setLookupState(message, 'error');
        openSupportModal({
            eyebrow: 'Thông báo / Hỗ trợ',
            title: 'Sửa lỗi không thành công',
            message: `${getAutoFixFailureMessage()}${timingText ? `\n${timingText}` : ''}`,
            showBh247: true,
            closable: false,
            showAutoFix: true,
            isLoading: false
        });
    } finally {
        clearActiveGetlinkOperationTimer('auto-fix');
        shareAutoFixBusy = false;
        if (!el('supportModal') || el('supportModal').classList.contains('hidden')) {
            supportModalState = null;
        } else {
            renderSupportModalContent(supportModalState || getDefaultSupportModalContent());
        }
    }
}

async function resumePendingSheetImportOperation(scope = 'current') {
    const meta = readSheetImportOperationMeta(scope);
    if (!meta || !meta.operationId || !meta.operationToken) return;
    if (!isSheetAccessEnabled()) {
        clearSheetImportOperationMeta(scope);
        setSheetImportState(scope, 'Truy cập Google Sheet đang được tắt trong admin.', 'warning');
        return;
    }

    const context = getSheetImportContext(scope);
    const activeShareId = String(context && context.share && context.share.id ? context.share.id : '').trim();
    const expectedShareId = String(meta.shareId || '').trim();
    if (expectedShareId && activeShareId && expectedShareId !== activeShareId) {
        clearSheetImportOperationMeta(scope);
        return;
    }
    if (!activeShareId) {
        clearSheetImportOperationMeta(scope);
        return;
    }

    const btn = el(scope === 'create' ? 'creatorImportCookiesFromSheetBtn' : 'currentImportCookiesFromSheetBtn');
    const timerKey = `sheet-import-${scope}`;
    setButtonBusy(btn, true, 'Đang quét Sheet...');

    let snapshot = {
        status: 'pending',
        message: 'Đang nối lại tiến độ nhập cookie từ Google Sheet...',
        timings: null
    };
    const renderPending = (payload) => {
        const text = buildGetlinkOperationText(payload, Date.now() - Number(meta.startedAt || Date.now()), 'Đang nối lại tiến độ nhập cookie từ Google Sheet...');
        setSheetImportState(scope, text, 'loading');
        context.setInfoState(text, 'loading');
    };

    try {
        renderPending(snapshot);
        startActiveGetlinkOperationTimer(timerKey, () => {
            renderPending(snapshot);
        });
        while (String(snapshot && snapshot.status || '').trim() === 'pending') {
            snapshot = await pollGetlinkOperation(meta.operationId, meta.operationToken);
            renderPending(snapshot);
            if (String(snapshot && snapshot.status || '').trim() === 'pending') {
                await sleep(GETLINK_OPERATION_POLL_INTERVAL_MS);
            }
        }
        clearActiveGetlinkOperationTimer(timerKey);
        clearSheetImportOperationMeta(scope);
        await applySheetImportResult(scope, snapshot);
    } catch (error) {
        const timingText = formatAutoFixTimings(error && error.responseData ? error.responseData.timings : null);
        const message = error.message || 'Không thể nối lại tiến độ nhập cookie từ Sheet.';
        setSheetImportState(scope, timingText ? `${message} | ${timingText}` : message, 'error');
        context.setInfoState(timingText ? `${message} ${timingText}` : message, 'error');
        clearSheetImportOperationMeta(scope);
    } finally {
        clearActiveGetlinkOperationTimer(timerKey);
        setButtonBusy(btn, false);
    }
}

async function resumePendingAutoFixOperation() {
    const meta = readAutoFixOperationMeta();
    if (!meta || !meta.operationId || !meta.operationToken) return;
    if (meta.shareId && pendingShareIdFromUrl && String(meta.shareId).trim() !== String(pendingShareIdFromUrl).trim()) {
        clearAutoFixOperationMeta();
        return;
    }

    shareAutoFixBusy = true;
    let snapshot = {
        status: 'pending',
        message: 'Đang nối lại tiến độ sửa lỗi tự động...',
        timings: null
    };

    const renderPending = () => {
        openSupportModal({
            eyebrow: 'Sửa lỗi tự động',
            title: 'Đang sửa lỗi cho bạn',
            message: 'Hệ thống đang tiếp tục xử lý, bạn đợi xíu nha.',
            showBh247: false,
            closable: false,
            showAutoFix: false,
            isLoading: true,
            loadingText: 'Hệ thống đang tiếp tục kiểm tra và sửa lỗi cho bạn.',
            loadingStartedAt: Number(meta.startedAt || Date.now())
        });
    };

    try {
        renderPending();
        startActiveGetlinkOperationTimer('auto-fix', () => {
            renderPending();
        });
        while (String(snapshot && snapshot.status || '').trim() === 'pending') {
            snapshot = await pollGetlinkOperation(meta.operationId, meta.operationToken);
            renderPending();
            if (String(snapshot && snapshot.status || '').trim() === 'pending') {
                await sleep(GETLINK_OPERATION_POLL_INTERVAL_MS);
            }
        }
        clearActiveGetlinkOperationTimer('auto-fix');
        clearAutoFixOperationMeta();
        const assignedCount = Number(snapshot && snapshot.assignedCount);
        if (!Number.isFinite(assignedCount) || assignedCount < 1) {
            throw new Error(getAutoFixFailureMessage());
        }
        setLookupState('Đã sửa lỗi thành công. Vui lòng tải lại trang để tiếp tục.', 'success');
        openSupportModal({
            eyebrow: 'Đã sửa lỗi',
            title: 'Sửa lỗi thành công',
            message: 'Tài khoản đã được làm mới. Bấm Đóng để tải lại trang rồi chọn thiết bị và tạo link lại.',
            showBh247: false,
            closable: true,
            showAutoFix: false,
            isLoading: false,
            reloadOnClose: true
        });
    } catch (error) {
        const timingText = formatAutoFixTimings(error && error.responseData ? error.responseData.timings : null);
        openSupportModal({
            eyebrow: 'Thông báo / Hỗ trợ',
            title: 'Sửa lỗi không thành công',
            message: `${getAutoFixFailureMessage()}${timingText ? `\n${timingText}` : ''}`,
            showBh247: true,
            closable: false,
            showAutoFix: true,
            isLoading: false
        });
        clearAutoFixOperationMeta();
    } finally {
        clearActiveGetlinkOperationTimer('auto-fix');
        shareAutoFixBusy = false;
    }
}

async function checkOverloadFixCookieHealth(shareId = '') {
    const normalizedShareId = String(shareId || '').trim();
    if (!normalizedShareId) {
        const error = new Error('Không đủ cookie sống trước khi rotate.');
        error.code = 'PRECHECK_INVALID_SHARE';
        throw error;
    }

    let data = null;
    try {
        data = await apiRequest(`/api/getlink-shares/${encodeURIComponent(normalizedShareId)}/check-cookies-health`, 'POST');
    } catch (error) {
        const normalized = String(error && error.message ? error.message : '').toLowerCase();
        if (normalized.includes('revoked')
            || normalized.includes('expired')
            || normalized.includes('not found')
            || normalized.includes('invalid share id')) {
            throw error;
        }
        const fallbackError = new Error('Không thể kiểm tra cookie lúc này. Vui lòng thử lại sau.');
        fallbackError.code = 'PRECHECK_FAILED';
        throw fallbackError;
    }

    const checks = Array.isArray(data && data.checks) ? data.checks : [];
    const apiLiveCount = Number(data && data.liveCount);
    const liveCount = Number.isFinite(apiLiveCount) ? apiLiveCount : checks.filter((item) => item && item.ok).length;
    return { checks, liveCount };
}

async function rotateOverloadShareCookie() {
    const shareId = String(pendingShareIdFromUrl || '').trim();
    const config = getFixModeConfig(activeFixMode);
    if (!shareId) {
        setLookupState('Chỉ dùng được tính năng này khi mở bằng link share hợp lệ.', 'warning');
        return;
    }
    if (!isSheetAccessEnabled() || !isFixModeEnabled(activeFixMode)) {
        closeOverloadFixModal(true);
        openSupportModal({
            eyebrow: 'Thông báo / Hỗ trợ',
            title: 'Sửa lỗi tự động đang tắt',
            message: !isSheetAccessEnabled()
                ? 'Truy cập Google Sheet đang được tắt trong admin. Vui lòng nhắn fanpage để được hỗ trợ.'
                : 'Tính năng sửa lỗi này đang được tắt trong admin. Vui lòng nhắn fanpage để được hỗ trợ.',
            showBh247: true,
            closable: false,
            showAutoFix: false,
            isLoading: false
        });
        return;
    }
    if (overloadFixBusy || Date.now() < overloadFixReadyAt) return;

    const triggerBtn = el('overloadFixBtn');
    const householdBtn = el('householdFixBtn');
    const confirmBtn = el('overloadFixConfirmBtn');
    overloadFixBusy = true;
    updateOverloadFixVisibility();
    setButtonBusy(triggerBtn, activeFixMode === 'overload', config.busyLabel);
    setButtonBusy(householdBtn, activeFixMode === 'household', config.busyLabel);
    setButtonBusy(confirmBtn, true, config.busyLabel);
    startOverloadFixLoading(Date.now());

    try {
        let data = await apiRequest(`/api/getlink-shares/${encodeURIComponent(shareId)}/overload-fix`, 'POST', {
            fixMode: activeFixMode
        });
        const operationKey = 'overload-fix';
        let operationMeta = null;

        if (String(data && data.status || '').trim() === 'pending') {
            operationMeta = normalizeGetlinkOperationMeta({
                operationId: data.operationId,
                operationToken: data.operationToken,
                shareId,
                startedAt: Date.now()
            });

            const renderPending = () => {
                startOverloadFixLoading(operationMeta.startedAt);
            };

            renderPending();
            startActiveGetlinkOperationTimer(operationKey, () => {
                renderPending();
            });

            while (String(data && data.status || '').trim() === 'pending') {
                await sleep(GETLINK_OPERATION_POLL_INTERVAL_MS);
                data = await pollGetlinkOperation(operationMeta.operationId, operationMeta.operationToken);
                renderPending();
            }

            clearActiveGetlinkOperationTimer(operationKey);
        }

        const successPayload = getOverloadFixSuccessPayload(data);
        if (String(data && data.status || '').trim() !== 'completed' && !successPayload) {
            throw new Error(config.fallbackError);
        }

        applyOverloadFixSuccess(successPayload || data);
    } catch (error) {
        const successPayload = getOverloadFixSuccessPayload(error && error.responseData ? error.responseData : null);
        if (successPayload) {
            applyOverloadFixSuccess(successPayload);
            return;
        }
        clearActiveGetlinkOperationTimer('overload-fix');
        stopOverloadFixLoading();
        const message = normalizeOverloadFixErrorMessage(error);
        setLookupState(message, 'error');
        setOverloadFixState(message, 'error');
    } finally {
        clearActiveGetlinkOperationTimer('overload-fix');
        stopOverloadFixLoading();
        overloadFixBusy = false;
        setButtonBusy(triggerBtn, false);
        setButtonBusy(householdBtn, false);
        setButtonBusy(confirmBtn, false);
        updateOverloadFixVisibility();
    }
}

async function generateDeviceLink(device, mobileOs = 'android') {
    const cookie = getRuntimeCookie();
    if (!cookie) {
        setLookupState('Không có cookie hợp lệ để tạo link.', 'warning');
        setGuestGuard(true, 'Hãy mở đúng link /getlink?s=... hoặc /getlink?c=... để tiếp tục.');
        return;
    }

    const frontendDevice = String(device || '').trim();
    if (!frontendDevice) return;

    setLookupState('Đang kiểm tra tình trạng cookie...', 'loading');
    const health = await checkRuntimeCookieHealth();
    if (!health.ok) {
        applyCookieBlockedState(health.blockedReason, health.detailMessage);
        return;
    }
    clearCookieBlockedState();

    const apiDevice = frontendDevice === 'desktop' ? 'desktop' : 'mobile';
    const button = document.querySelector(`.btn-device[data-device="${frontendDevice}"]`);

    busy = true;
    setButtonBusy(button, true, 'Đang tạo link...');
    setDeviceButtonsEnabled(false);
    setLookupState('Đang kiểm tra cookie LIVE và tạo link...', 'loading');
    showLookupLoadingOverlay('Xin vui lòng chờ trong giây lát');

    const shouldAutoOpen = apiDevice === 'desktop';
    let deferredPopup = null;
    if (shouldAutoOpen) {
        const deferred = openDeferredTabAndNavigate();
        deferredPopup = deferred.popupWindow;
        if (deferred.wasBlocked) {
            setLookupState('Trình duyệt chặn tab mới, sẽ mở trong tab hiện tại.', 'warning');
        }
    }

    try {
        const data = await apiRequest('/api/nf-cookie-to-link', 'POST', { cookieStr: cookie, device: apiDevice, mobileOs });
        if (!data || !data.url) throw new Error('Không tạo được link.');

        if (shouldAutoOpen) {
            if (deferredPopup && !deferredPopup.closed) deferredPopup.location.href = data.url;
            else window.location.href = data.url;
            setLookupState('Đã tạo link thành công. Đang mở Netflix...', 'success');
        } else if (frontendDevice === 'tv') {
            openTvGuideModal(data.url);
            setLookupState('Tạo link TV thành công. Hãy sao chép link và làm theo hướng dẫn.', 'success');
        } else {
            openMobileLinkModal(data.url, mobileOs);
            const typeLabel = frontendDevice === 'tablet' ? 'tablet' : 'điện thoại';
            setLookupState(`Tạo link ${typeLabel} thành công. Hãy sao chép link và làm theo hướng dẫn.`, 'success');
        }
    } catch (error) {
        if (deferredPopup && !deferredPopup.closed) {
            try { deferredPopup.close(); } catch (closeError) { }
        }
        setLookupState(error.message || 'Không tạo được link.', 'error');
    } finally {
        hideLookupLoadingOverlay();
        busy = false;
        setButtonBusy(button, false);
        updateReadyState();
    }
}

function handleConfirmedDevice(device) {
    const normalized = String(device || '').trim();
    if (!normalized) return;

    if (isRuntimeShareDesktopOnly() && normalized !== 'desktop') {
        showDesktopOnlyBlockedPopup();
        return;
    }

    if (normalized === 'mobile' || normalized === 'tablet') {
        openMobileOsModal(normalized);
        return;
    }

    if (normalized === 'tv') {
        generateDeviceLink('tv', 'android');
        return;
    }

    generateDeviceLink('desktop', 'android');
}

function renderShareUrl(url = '') {
    const output = el('shareLinkOutput');
    const openBtn = el('openShareLinkBtn');
    const finalUrl = String(url || '').trim();
    if (output) output.value = finalUrl;
    if (openBtn) openBtn.setAttribute('href', finalUrl || '#');
}

async function autoCopyShareLinkOrWarn(url = '') {
    const link = String(url || '').trim();
    if (!link) return false;
    const copied = await copyText(link, 'Da tao va tu dong sao chep link.', 'Da tao link, nhung khong tu copy duoc. Hay bam Copy.');
    setShareState(copied ? 'Da tao va tu dong sao chep link.' : 'Da tao link, nhung khong tu copy duoc. Hay bam Copy.', copied ? 'success' : 'warning');
    return copied;
}

async function generateShareIdLink() {
    const quickDaysValue = String(el('shareCreateQuickDaysInput') && el('shareCreateQuickDaysInput').value || '').trim();
    const rawDateValue = String(el('shareCreateDateInput') && el('shareCreateDateInput').value || '').trim();
    const rawTimeValue = String(el('shareCreateTimeInput') && el('shareCreateTimeInput').value || '').trim();
    const desktopOnly = !!(el('shareDesktopOnlyInput') && el('shareDesktopOnlyInput').checked);
    const note = getShareNoteInput('shareCreateNoteInput');
    const quickDaysParse = parseQuickDaysExpiryInput(quickDaysValue);
    if (!quickDaysParse.ok) {
        setShareState(quickDaysParse.error || 'Hạn lẹ không hợp lệ.', 'warning');
        setShareCreateExpiryState(quickDaysParse.error || 'Hạn lẹ không hợp lệ. Hãy nhập lại.', 'warning');
        return;
    }
    const expiryParse = quickDaysParse.usingQuickDays
        ? quickDaysParse
        : parseCreateExpiryInput(rawDateValue, rawTimeValue);
    if (!expiryParse.ok) {
        setShareState(expiryParse.error || 'Hạn của link không hợp lệ.', 'warning');
        setShareCreateExpiryState(expiryParse.error || 'Hạn của link không hợp lệ. Hãy nhập lại.', 'warning');
        return;
    }
    const expiresAt = expiryParse.iso;

    const btn = el('generateShareLinkBtn');
    setButtonBusy(btn, true, 'Đang tạo...');
    setCreatorCookieInfoState('Đang chờ dữ liệu cookie của link ID.', 'idle');
    setShareCreateExpiryState(
        expiresAt
            ? (quickDaysParse.usingQuickDays
                ? `Đang tạo link ID server với hạn lẹ ${expiryParse.label}, hết hạn lúc ${formatDateTime(expiresAt)}...`
                : `Đang tạo link ID server có hạn đến ${expiryParse.label}...`)
            : 'Đang tạo link ID server không giới hạn...',
        'loading'
    );
    try {
        const data = await apiRequest('/api/getlink-shares', 'POST', {
            expiresAt,
            desktopOnly,
            note
        });
        const shareUrl = String(data.shareUrl || '').trim();
        createdAdminShare = data.share ? { ...data.share, note } : null;
        renderShareUrl(shareUrl);
        await autoCopyShareLinkOrWarn(shareUrl);
        renderAdminShare(null);
        setAdminTab('create', { resetManual: true });
        renderCreatedShareEditor(createdAdminShare);
        resetShareCookieSlotStates();
        resetCreatedShareCookieSlotStates();
        if (data && data.expiresAt) {
            setShareState(`Đã tạo link ID server có hạn đến ${formatDateTime(data.expiresAt)}.`, 'success');
            setShareCreateExpiryState('', 'idle');
        } else {
            setShareState('Đã tạo link ID server không giới hạn.', 'success');
            setShareCreateExpiryState('', 'idle');
        }
        renderCreatorCookieCheckCards([]);
        setCreatorCookieInfoState('Tạo hoặc cập nhật cookie rồi bấm check để xem kết quả ngay tại đây.', 'idle');
    } catch (error) {
        resetCreatedShareComposer({ keepExpiryInputs: true });
        setShareState(error.message || 'Không tạo được link chia sẻ.', 'error');
        setShareCreateExpiryState(error.message || 'Không tạo được link ID server.', 'error');
    }
    setButtonBusy(btn, false);
}

async function runEntryCookieHealthCheck() {
    const cookie = getRuntimeCookie();
    if (!cookie) return;
    setLookupState('Đang kiểm tra tình trạng cookie từ link...', 'loading');
    const health = await checkRuntimeCookieHealth();
    if (!health.ok) {
        applyCookieBlockedState(health.blockedReason, health.detailMessage);
        return;
    }
    clearCookieBlockedState();
    resetEntryAlertState();
    setLookupState('Cookie hợp lệ. Hãy chọn thiết bị để tiếp tục.', 'success');
    updateReadyState();
    requestUpgradeNotice();
}

async function applyCookieFromQuery() {
    const params = new URLSearchParams(window.location.search || '');
    const shareId = String(params.get('s') || '').trim();
    const encodedCookie = String(params.get('c') || '').trim();

    if (shareId) {
        setRuntimeShareDesktopOnly(false);
        pendingShareIdFromUrl = shareId;
        showLookupLoadingOverlay('Đang kiểm tra cookie của link ID, vui lòng chờ...');
        setLookupState('Đang thử cookie phù hợp từ link ID...', 'loading');
        try {
            const data = await apiRequest(`/api/getlink-shares/${encodeURIComponent(shareId)}`, 'GET');
            const cookieStr = normalizeCookie(data.cookieStr || '');
            const profiles = extractProfilesFromChecks(data && data.checks, data && data.resolvedSlot);
            setRuntimeShareDesktopOnly(!!(data.desktopOnly || (data.share && data.share.desktopOnly)));
            if (!cookieStr) {
                hideLookupLoadingOverlay();
                const entryError = {
                    type: 'cookie',
                    reason: 'share_no_live_cookie',
                    message: 'Link này đã hết cookie hợp lệ. Bạn có thể bấm SỬA LỖI TỰ ĐỘNG để hệ thống thử khắc phục.'
                };
                setEntryAlertState(entryError);
                setGuestGuard(true, 'Link này vẫn còn hạn nhưng hiện không còn cookie dùng được. Bạn có thể bấm SỬA LỖI TỰ ĐỘNG hoặc nhắn fanpage để được hỗ trợ bảo hành.', {
                    title: 'Link đã hết cookie hợp lệ',
                    kind: 'cookie'
                });
                setLookupState(entryError.message, 'warning');
                showEntryAlertPopup(getEntryAlertPopupContent());
                return;
            }
            setRuntimeCookie(cookieStr, { source: 'share-id', profiles });
            await runEntryCookieHealthCheck();
            hideLookupLoadingOverlay();
            return;
        } catch (error) {
            hideLookupLoadingOverlay();
            const mappedError = classifyShareEntryError(error);
            setEntryAlertState({
                type: mappedError.type,
                reason: mappedError.reason,
                message: mappedError.lookupMessage
            });
            setGuestGuard(true, mappedError.guardMessage, {
                title: mappedError.guardTitle,
                kind: mappedError.type
            });
            setLookupState(mappedError.lookupMessage, mappedError.type === 'cookie' ? 'error' : 'warning');
            showEntryAlertPopup(getEntryAlertPopupContent());
            return;
        }
    }

    if (encodedCookie) {
        setRuntimeShareDesktopOnly(false);
        try {
            const cookieStr = normalizeCookie(fromBase64Url(encodedCookie));
            if (!cookieStr) {
                setEntryAlertState({
                    type: 'link',
                    reason: 'invalid_cookie_link',
                    message: 'Link cookie không hợp lệ.'
                });
                setGuestGuard(true, 'Link cookie không hợp lệ. Hãy mở lại link được cấp để tiếp tục.', {
                    title: 'Link cookie không hợp lệ',
                    kind: 'link'
                });
                setLookupState('Link cookie không hợp lệ.', 'warning');
                showEntryAlertPopup(getEntryAlertPopupContent());
                return;
            }
            setRuntimeCookie(cookieStr, { source: 'cookie-link' });
            await runEntryCookieHealthCheck();
            return;
        } catch (error) {
            setEntryAlertState({
                type: 'link',
                reason: 'invalid_cookie_link',
                message: 'Không giải mã được cookie trong link chia sẻ.'
            });
            setGuestGuard(true, 'Không giải mã được cookie trong link chia sẻ. Hãy mở lại đúng link được cấp.', {
                title: 'Link cookie không hợp lệ',
                kind: 'link'
            });
            setLookupState('Không giải mã được cookie trong link chia sẻ.', 'warning');
            showEntryAlertPopup(getEntryAlertPopupContent());
            return;
        }
    }
}
function renderAdminWorkspace() {
    const authBox = el('adminAuthBox');
    const workspace = el('adminWorkspace');
    const identity = el('adminIdentity');
    const fab = el('nfAdminFab');
    const inlineLayout = el('adminInlineLayout');
    const adminTabBar = el('adminTabBar');
    const adminTabSearchBtn = el('adminTabSearchBtn');
    const adminTabCreateBtn = el('adminTabCreateBtn');
    const shareCreatorBox = el('shareCreatorBox');
    const cookieInfoPanel = el('adminCookieInfoPanel');
    const cookieInfoTitle = el('adminCookieInfoTitle');
    const currentShareSummaryBox = el('currentShareSummaryBox');
    ensureAdminTabFromContext();
    const activeTab = normalizeAdminTab(adminActiveTab);

    if (fab) {
        fab.classList.toggle('is-admin', adminAuthenticated);
        fab.title = adminAuthenticated ? 'Tai khoan admin da dang nhap' : 'Dang nhap admin';
        fab.setAttribute('aria-label', adminAuthenticated ? 'Tai khoan admin da dang nhap' : 'Dang nhap admin');
    }

    if (identity) identity.textContent = adminAuthenticated ? 'Dang nhap admin.' : 'Chua dang nhap admin';
    if (authBox) authBox.classList.toggle('hidden', adminAuthenticated);
    if (workspace) workspace.classList.toggle('hidden', !adminAuthenticated);
    if (inlineLayout) inlineLayout.classList.toggle('hidden', !adminAuthenticated);
    if (adminTabBar) adminTabBar.classList.toggle('hidden', !adminAuthenticated);
    if (adminTabSearchBtn) {
        adminTabSearchBtn.classList.toggle('is-active', adminAuthenticated && activeTab === 'search');
        adminTabSearchBtn.setAttribute('aria-selected', adminAuthenticated && activeTab === 'search' ? 'true' : 'false');
    }
    if (adminTabCreateBtn) {
        adminTabCreateBtn.classList.toggle('is-active', adminAuthenticated && activeTab === 'create');
        adminTabCreateBtn.setAttribute('aria-selected', adminAuthenticated && activeTab === 'create' ? 'true' : 'false');
    }
    if (inlineLayout) inlineLayout.classList.toggle('admin-tab-create', adminAuthenticated && activeTab === 'create');
    if (shareCreatorBox) shareCreatorBox.classList.toggle('hidden', !adminAuthenticated || activeTab !== 'create');
    if (cookieInfoPanel) cookieInfoPanel.classList.toggle('hidden', !adminAuthenticated);
    if (currentShareSummaryBox) currentShareSummaryBox.classList.toggle('hidden', !adminAuthenticated || activeTab !== 'search' || !currentAdminShare);
    if (cookieInfoTitle) cookieInfoTitle.textContent = activeTab === 'create' ? 'Kết quả check cookie link mới' : 'Thông tin cookie của link ID';
    populateAdminWarningConfigInputs(warningBannerConfig);
    if (adminAuthenticated && !cookieHealthBlocked) {
        if (activeTab === 'create') {
            setCreatorCookieInfoState('Tạo hoặc cập nhật cookie rồi bấm check để xem kết quả ngay tại đây.', 'idle');
        } else {
            setAdminCookieInfoState('Tạo hoặc tìm link ID rồi check từng cookie hay check toàn bộ.', 'idle');
        }
    }
    if (adminAuthenticated) {
        if (warningBannerConfigLoaded) {
            setAdminWarningConfigState('Da tai noi dung popup hien tai.', 'idle');
        } else {
            setAdminWarningConfigState('Dang tai noi dung popup hien tai...', 'loading');
        }
    }
    if (!adminAuthenticated) {
        adminActiveTab = 'search';
        adminTabManuallySelected = false;
        isInlineEditMode = false;
        createdAdminShare = null;
        renderCookieCheckCards([]);
        renderCreatorCookieCheckCards([]);
        setCreatorCookieInfoState('Tạo hoặc cập nhật cookie rồi bấm check để xem kết quả ngay tại đây.', 'idle');
        setShareCookieViewOutputs({ primary: '', backup1: '', backup2: '' });
        setCreatedShareCookieOutputs({ primary: '', backup1: '', backup2: '' });
        setShareNoteInput('currentShareNoteInput', '');
        setShareNoteInput('shareCreateNoteInput', '');
        setShareNoteInput('adminShareNoteInput', '');
        resetShareCookieSlotStates();
        resetCreatedShareCookieSlotStates();
        setSheetImportState('current', '', 'idle');
        setSheetImportState('create', '', 'idle');
        clearSheetImportSelections('current');
        clearSheetImportSelections('create');
        setAdminWarningConfigState('Dang tai noi dung popup hien tai...', 'idle');
    }
    if (shouldBypassPromotionalPopups()) {
        closeSupportModal({ force: true });
    }
    if (shouldBypassPromotionalPopups() && disclaimerVisible) {
        closeDisclaimerModal(true);
    }
    if (disclaimerEligibilityResolved && canShowPromotionalPopups() && !disclaimerDismissed) {
        openDisclaimerModal();
    }
    syncAdminImmediateModals();
    setInlineEditMode(isInlineEditMode && !!currentAdminShare && activeTab === 'search');
    renderCurrentShareSummary(currentAdminShare);
    renderCreatedShareEditor(createdAdminShare);
    updateReadyState();
    updateOverloadFixVisibility();
}

function formatFixHistoryDateTime(value = '') {
    const ms = parseDateMs(value);
    if (!ms) return 'Không rõ thời gian';
    return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(new Date(ms));
}

function setFixHistoryState(text, mode = 'idle') {
    const node = el('adminFixHistoryState');
    if (!node) return;
    node.textContent = String(text || '').trim();
    setStateClass(node, mode);
}

function formatFixLimitText(limit = null) {
    const source = limit && typeof limit === 'object' ? limit : {};
    const count24h = Math.max(0, Number(source.count24h || 0) || 0);
    const max24h = Math.max(1, Number(source.max24h || 4) || 4);
    const remaining = Math.max(0, Number(source.remaining || (max24h - count24h)) || 0);
    const parts = [`Limit 24h: ${count24h}/${max24h}`, `Còn ${remaining} lượt`];
    const cooldownUntilMs = Date.parse(String(source.cooldownUntil || '').trim()) || 0;
    if (cooldownUntilMs > Date.now()) {
        const minutes = Math.max(1, Math.ceil((cooldownUntilMs - Date.now()) / 60000));
        parts.push(`Chờ ${minutes} phút`);
    }
    if (source.limited === true) parts.push('Đã chạm limit');
    return parts.join(' • ');
}

function renderFixHistory(history = null) {
    const summary = el('adminFixHistorySummary');
    const list = el('adminFixHistoryList');
    const content = el('adminFixHistoryContent');
    const toggle = el('adminFixHistoryToggleBtn');
    const resetBtn = el('adminFixLimitResetBtn');
    currentFixHistory = history;

    if (!currentAdminShare || !adminAuthenticated) {
        if (summary) summary.textContent = 'Chưa tải lịch sử.';
        if (list) list.innerHTML = '';
        if (content) content.classList.add('hidden');
        if (toggle) toggle.textContent = 'Xem lịch sử';
        if (resetBtn) resetBtn.classList.add('hidden');
        return;
    }

    const counts = history && history.counts ? history.counts : { overload: 0, household: 0, total: 0 };
    const limit = history && history.limit ? history.limit : null;
    if (summary) {
        const historyText = `Quá tải: ${Number(counts.overload || 0)} lần thành công • Hộ gia đình: ${Number(counts.household || 0)} lần thành công`;
        summary.textContent = limit ? `${historyText} • ${formatFixLimitText(limit)}` : historyText;
    }
    if (content) content.classList.toggle('hidden', !fixHistoryExpanded);
    if (toggle) toggle.textContent = fixHistoryExpanded ? 'Thu gọn' : 'Xem lịch sử';
    if (resetBtn) {
        resetBtn.classList.toggle('hidden', !(limit && limit.limited === true));
        resetBtn.title = limit && limit.limited === true ? 'Reset limit sửa lỗi cho link này' : '';
    }
    if (!list || !fixHistoryExpanded) return;

    const items = Array.isArray(history && history.items) ? history.items : [];
    if (items.length === 0) {
        list.innerHTML = '<p class="admin-warning">Link này chưa có lần sửa lỗi thành công nào.</p>';
        return;
    }

    list.innerHTML = items.map((item) => {
        const mode = String(item && item.fixMode || '').trim() === 'household'
            ? 'Sửa lỗi hộ gia đình'
            : 'Sửa lỗi quá tải';
        const timestamp = item && (item.completedAt || item.startedAt);
        return `
            <div class="admin-fix-history-row">
                <div>
                    <strong>${escapeHtml(mode)}</strong>
                    <span>Hoàn tất: ${escapeHtml(formatFixHistoryDateTime(timestamp))}</span>
                </div>
                <span>Thành công</span>
            </div>
        `;
    }).join('');
}

async function loadFixHistory(options = {}) {
    if (!adminAuthenticated || !currentAdminShare || !currentAdminShare.id) return;
    const sort = options.sort === 'asc' || options.sort === 'desc' ? options.sort : fixHistorySort;
    fixHistorySort = sort;
    const select = el('adminFixHistorySortSelect');
    if (select) select.value = sort;
    setFixHistoryState('Đang tải lịch sử sửa lỗi...', 'loading');
    try {
        const data = await apiRequest(
            `/api/getlink-admin/shares/${encodeURIComponent(currentAdminShare.id)}/fix-history?sort=${encodeURIComponent(sort)}`,
            'GET'
        );
        renderFixHistory(data || { items: [], counts: { overload: 0, household: 0, total: 0 }, limit: null });
        setFixHistoryState(
            Array.isArray(data && data.items) && data.items.length > 0
                ? `Đã tải ${data.items.length} lần sửa lỗi thành công.`
                : 'Chưa có lịch sử sửa lỗi thành công.',
            'success'
        );
    } catch (error) {
        setFixHistoryState(error.message || 'Không tải được lịch sử sửa lỗi.', 'error');
        renderFixHistory({ items: [], counts: { overload: 0, household: 0, total: 0 } });
    }
}

async function toggleFixHistory() {
    if (!currentAdminShare || !adminAuthenticated) return;
    fixHistoryExpanded = !fixHistoryExpanded;
    renderFixHistory(currentFixHistory);
    if (fixHistoryExpanded) await loadFixHistory();
}

async function adminResetFixLimit() {
    if (!currentAdminShare || !currentAdminShare.id || !adminAuthenticated) return;
    const btn = el('adminFixLimitResetBtn');
    setButtonBusy(btn, true, 'Đang reset...');
    try {
        await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(currentAdminShare.id)}/fix-limit-reset`, 'POST');
        setFixHistoryState('Đã reset limit sửa lỗi cho link này.', 'success');
        await loadFixHistory({ sort: fixHistorySort });
    } catch (error) {
        setFixHistoryState(error.message || 'Không reset được limit sửa lỗi.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

function renderAdminShare(share = null) {
    const previousShareId = currentAdminShare && currentAdminShare.id ? String(currentAdminShare.id) : '';
    const nextShareId = share && share.id ? String(share.id) : '';
    currentAdminShare = share;
    if (previousShareId !== nextShareId) {
        currentFixHistory = null;
        fixHistoryExpanded = false;
    }
    const card = el('adminShareResult');
    const summaryBox = el('currentShareSummaryBox');
    if (!card) return;

    if (!share) {
        card.classList.add('hidden');
        if (summaryBox) summaryBox.classList.add('hidden');
        isInlineEditMode = false;
        fixHistoryExpanded = false;
        currentFixHistory = null;
        renderFixHistory(null);
        setShareCookieViewOutputs({ primary: '', backup1: '', backup2: '' });
        setShareNoteInput('currentShareNoteInput', '');
        setShareNoteInput('adminShareNoteInput', '');
        resetShareCookieSlotStates();
        setSheetImportState('current', '', 'idle');
        clearSheetImportSelections('current');
        return;
    }

    adminActiveTab = 'search';
    adminTabManuallySelected = false;

    const idInput = el('adminShareId');
    const statusInput = el('adminShareStatus');
    const urlInput = el('adminShareUrl');
    const updatedInput = el('adminShareUpdatedAt');
    const expiryDisplayInput = el('adminShareExpiryDisplay');
    const expiryInput = el('adminShareExpiryInput');
    const expired = !!(share && (share.expired || isShareExpiredClient(share)));
    const status = String(share.status || 'active');
    let statusLabel = 'Dang hoat dong';
    if (status !== 'active') statusLabel = 'Da khoa / Thu hoi';
    else if (expired) statusLabel = 'Da het han';

    if (idInput) idInput.value = String(share.id || '');
    if (statusInput) statusInput.value = `Trang thai: ${statusLabel}`;
    if (urlInput) urlInput.value = String(share.shareUrl || '');
    if (updatedInput) updatedInput.value = `Cap nhat: ${String(share.updatedAt || '-')}`;
    if (expiryDisplayInput) expiryDisplayInput.value = `Han hien tai: ${formatDateTime(share.expiresAt)}`;
    if (expiryInput) expiryInput.value = toDatetimeLocalFromIso(share.expiresAt);
    setShareNoteInput('adminShareNoteInput', share.note || '');
    const shareCookies = share.cookies || { primary: share.cookieRaw || '', backup1: '', backup2: '' };
    setShareCookieViewOutputs(shareCookies);
    resetShareCookieSlotStates();
    renderCurrentShareSummary(share);
    renderFixHistory(currentFixHistory);
    setInlineEditMode(isInlineEditMode && isViewingPendingShare());

    card.classList.remove('hidden');
    if (adminAuthenticated) loadFixHistory({ sort: fixHistorySort });
}

async function adminSaveExpiry(payload = null, options = {}) {
    if (!currentAdminShare || !currentAdminShare.id) return;

    let body = payload;
    if (!body) {
        const rawValue = String(el('adminShareExpiryInput') && el('adminShareExpiryInput').value || '').trim();
        const expiresAt = datetimeLocalToIso(rawValue);
        if (!expiresAt) {
            setAdminSearchState('Nhap han hop le truoc khi luu.', 'warning');
            return;
        }
        body = { expiresAt };
    }

    const btn = options.button || el('adminSaveExpiryBtn');
    setButtonBusy(btn, true, options.busyLabel || 'Dang luu han...');
    try {
        const data = await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(currentAdminShare.id)}/expiry`, 'PUT', body);
        renderAdminShare(data.share || null);
        setAdminSearchState('Da cap nhat han cho link.', 'success');
    } catch (error) {
        setAdminSearchState(error.message || 'Khong cap nhat duoc han cho link.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

async function adminSaveNote() {
    if (!currentAdminShare || !currentAdminShare.id) return;
    const note = getShareNoteInput('adminShareNoteInput');
    const btn = el('adminSaveNoteBtn');
    setButtonBusy(btn, true, 'Dang luu note...');
    try {
        const data = await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(currentAdminShare.id)}`, 'PUT', { note });
        renderAdminShare(data.share || null);
        setAdminSearchState('Da cap nhat note cho link.', 'success');
    } catch (error) {
        setAdminSearchState(error.message || 'Khong cap nhat duoc note cho link.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

async function loadAdminShareFromPendingUrl(options = {}) {
    const force = !!options.force;
    const shareId = String(pendingShareIdFromUrl || '').trim();
    if (!adminAuthenticated || !shareId) return;
    if (!force && autoLoadedAdminShareId === shareId) return;

    const input = el('adminShareSearchInput');
    if (input) input.value = shareId;

    setAdminSearchState(`Dang tu dong nap link ID: ${shareId}...`, 'loading');

    try {
        const data = await apiRequest('/api/getlink-admin/search', 'POST', { query: shareId });
        renderAdminShare(data.share || null);
        setAdminTab('search', { resetManual: true });
        autoLoadedAdminShareId = shareId;
        setAdminSearchState('Da tu dong nap link ID tu URL. Ban co the sua cookie ngay.', 'success');
    } catch (error) {
        renderAdminShare(null);
        autoLoadedAdminShareId = '';
        setAdminSearchState(error.message || 'Khong tu dong nap duoc link ID tu URL.', 'error');
    }
}

async function loadAdminSession() {
    if (!adminIdToken) {
        clearAdminAuthState();
        setAdminAuthState('Dang xuat.', 'idle');
        adminSessionResolved = true;
        renderAdminWorkspace();
        return;
    }

    try {
        const data = await apiRequest('/api/getlink-admin/session', 'GET');
        adminAuthenticated = !!(data && data.authenticated);
        if (adminAuthenticated && data.user && data.user.email) {
            adminEmail = String(data.user.email || '').trim().toLowerCase();
            saveAdminAuthToStorage();
            setAdminAuthState(`Dang nhap admin: ${data.user.email}`, 'success');
        } else {
            clearAdminAuthState();
            setAdminAuthState('Dang xuat.', 'idle');
        }
    } catch (error) {
        clearAdminAuthState();
        setAdminAuthState('Phien admin het han. Vui long dang nhap lai.', 'warning');
    }
    adminSessionResolved = true;
    renderAdminWorkspace();
    if (adminAuthenticated) {
        await loadWarningBannerConfig({ silent: false });
        await loadAdminShareFromPendingUrl();
    }
}

async function adminLogin() {
    const email = String(el('adminEmailInput') && el('adminEmailInput').value || '').trim();
    const password = String(el('adminPasswordInput') && el('adminPasswordInput').value || '');
    if (!email || !password) {
        setAdminAuthState('Vui long nhap email va mat khau admin.', 'warning');
        return;
    }

    const btn = el('adminLoginBtn');
    setButtonBusy(btn, true, 'Dang nhap...');
    try {
        const firebaseSession = await signInWithFirebasePassword(email, password);
        const allowedAdminEmails = getAllowedAdminEmailsFromRuntime();
        if (allowedAdminEmails.length > 0 && !allowedAdminEmails.includes(firebaseSession.email)) {
            throw new Error('Email nay khong nam trong NF_ADMIN_EMAILS.');
        }

        await apiRequest('/api/getlink-admin/login', 'POST', { idToken: firebaseSession.idToken });
        setAdminAuthTokens(firebaseSession.idToken, firebaseSession.refreshToken, firebaseSession.email);

        const session = await apiRequest('/api/getlink-admin/session', 'GET');
        if (!session || !session.authenticated) {
            throw new Error('Khong xac minh duoc phien admin tu backend.');
        }

        adminSessionResolved = true;
        adminAuthenticated = true;
        const userEmail = String(session.user && session.user.email || firebaseSession.email || email);
        adminEmail = String(userEmail || '').trim().toLowerCase();
        saveAdminAuthToStorage();
        setAdminAuthState(`Dang nhap admin: ${userEmail}`, 'success');
        renderAdminWorkspace();
        setAdminSearchState('Khong tu dong load. Nhap ID/link roi bam Tim link.', 'idle');
        await loadWarningBannerConfig({ silent: false });
        await loadAdminShareFromPendingUrl({ force: true });
    } catch (error) {
        clearAdminAuthState();
        const msg = String(error && error.message ? error.message : '').trim();
        if (!msg) {
            setAdminAuthState('Dang nhap that bai.', 'error');
        } else {
            setAdminAuthState(msg, 'error');
        }
        renderAdminWorkspace();
    } finally {
        setButtonBusy(btn, false);
    }
}

async function adminLogout() {
    const btn = el('adminLogoutBtn');
    setButtonBusy(btn, true, 'Dang xuat...');
    try {
        await apiRequest('/api/getlink-admin/logout', 'POST');
    } catch (error) {
        // ignore
    } finally {
        clearAdminAuthState();
        adminSessionResolved = true;
        renderAdminShare(null);
        resetCreatedShareComposer();
        autoLoadedAdminShareId = '';
        setAdminAuthState('Dang xuat.', 'idle');
        renderAdminWorkspace();
        populateAdminWarningConfigInputs(warningBannerConfig);
        setButtonBusy(btn, false);
    }
}

async function adminSearchShare() {
    if (!adminAuthenticated) {
        setAdminSearchState('Ban chua dang nhap admin.', 'warning');
        return;
    }

    const input = el('adminShareSearchInput');
    const query = String(input && input.value || '').trim();
    if (!query) {
        setAdminSearchState('Nhap share ID hoac link de tim.', 'warning');
        renderAdminShare(null);
        return;
    }

    const btn = el('adminShareSearchBtn');
    setButtonBusy(btn, true, 'Dang tim...');
    setAdminSearchState('Dang tim link chia se...', 'loading');
    try {
        const data = await apiRequest('/api/getlink-admin/search', 'POST', { query });
        renderAdminShare(data.share || null);
        setAdminTab('search', { resetManual: true });
        setAdminSearchState('Da tim thay link. Ban co the sua/thu hoi/phuc hoi/doi ID.', 'success');
    } catch (error) {
        renderAdminShare(null);
        setAdminSearchState(error.message || 'Khong tim thay link.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

async function adminSaveCookies() {
    if (!currentAdminShare || !currentAdminShare.id) return;
    const cookies = getCurrentShareEditableCookies();
    const note = getShareNoteInput('currentShareNoteInput');
    const expiryValue = String(el('currentShareExpiryInput') && el('currentShareExpiryInput').value || '').trim();
    const expiresAt = datetimeLocalToIso(expiryValue);
    if (expiryValue && !expiresAt) {
        setAdminSearchState('Hạn của link không hợp lệ.', 'warning');
        return;
    }

    const btn = el('saveCurrentShareBtn');
    setButtonBusy(btn, true, 'Đang lưu...');
    try {
        const data = await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(currentAdminShare.id)}`, 'PUT', { cookies, note });
        if (expiresAt && expiresAt !== String(currentAdminShare.expiresAt || '').trim()) {
            const expiryData = await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(currentAdminShare.id)}/expiry`, 'PUT', { expiresAt });
            data.share = expiryData.share || data.share;
        }
        isInlineEditMode = false;
        renderAdminShare(data.share || null);
        if (cookies.primary) {
            setRuntimeCookie(cookies.primary, { source: 'admin', silent: true });
        }
        const checkResults = await runCookieChecksForShare(
            (data.share && data.share.id) || currentAdminShare.id,
            cookies,
            SHARE_COOKIE_SLOTS,
            setShareCookieSlotState,
            { renderCards: renderCookieCheckCards, setInfoState: setAdminCookieInfoState }
        );
        if (cookies.primary) setRuntimeProfiles(extractProfilesFromChecks(checkResults, 'primary'));
        setAdminSearchState('Đã cập nhật cookie và tự động check toàn bộ.', 'success');
    } catch (error) {
        setAdminSearchState(error.message || 'Không cập nhật được cookie.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

async function saveCreatedShareCookies() {
    if (!createdAdminShare || !createdAdminShare.id) {
        setShareState('Hãy tạo link ID server trước khi lưu cookie.', 'warning');
        return;
    }
    const cookies = getCreatedShareEditableCookies();
    const note = getShareNoteInput('shareCreateNoteInput');
    const btn = el('saveCreatedShareCookiesBtn');
    setButtonBusy(btn, true, 'Đang lưu...');
    try {
        const data = await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(createdAdminShare.id)}`, 'PUT', { cookies, note });
        createdAdminShare = data.share || createdAdminShare;
        renderCreatedShareEditor(createdAdminShare);
        if (cookies.primary) {
            setRuntimeCookie(cookies.primary, { source: 'admin', silent: true });
        }
        const checkResults = await runCookieChecksForShare(
            createdAdminShare.id,
            cookies,
            CREATED_SHARE_COOKIE_SLOTS,
            setCreatedShareCookieSlotState,
            { renderCards: renderCreatorCookieCheckCards, setInfoState: setCreatorCookieInfoState }
        );
        if (cookies.primary) setRuntimeProfiles(extractProfilesFromChecks(checkResults, 'primary'));
        const link = String(el('shareLinkOutput') && el('shareLinkOutput').value || createdAdminShare.shareUrl || '').trim();
        const copied = await autoCopyShareLinkOrWarn(link);
        setShareState(
            copied
                ? 'Đã lưu cookie, auto-check xong và tự động sao chép lại link ID server.'
                : 'Đã lưu cookie và auto-check xong, nhưng không tự copy lại được. Hãy bấm Sao chép.',
            copied ? 'success' : 'warning'
        );
    } catch (error) {
        setShareState(error.message || 'Không lưu được cookie cho link mới.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

async function adminCheckCookieSlot(slotKey) {
    if (!currentAdminShare || !currentAdminShare.id) return;
    const slot = SHARE_COOKIE_SLOTS.find((item) => item.key === slotKey);
    if (!slot) return;
    const button = el(slot.viewCheckBtnId);
    const cookies = getShareCookiesForCurrentMode();
    if (!cookies[slotKey]) {
        setShareCookieSlotState(slotKey, 'Để trống', null);
        renderCookieCheckCards([]);
        setAdminCookieInfoState('Ô cookie này đang để trống.', 'idle');
        return;
    }
    setButtonBusy(button, true, 'Đang check...');
    setAdminCookieInfoState(`Đang check ${slot.label.toLowerCase()}...`, 'loading');
    try {
        const data = await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(currentAdminShare.id)}/check-cookie`, 'POST', {
            slot: slotKey,
            cookieStr: cookies[slotKey] || '',
            cookies
        });
        const result = data.result || {};
        setShareCookieSlotState(slotKey, result.ok ? 'PASS' : 'FAIL', !!result.ok);
        renderCookieCheckCards([result]);
        setAdminCookieInfoState(`Đã check ${slot.label.toLowerCase()}.`, result.ok ? 'success' : 'warning');
    } catch (error) {
        setShareCookieSlotState(slotKey, 'FAIL', false);
        setAdminCookieInfoState(error.message || 'Check cookie thất bại.', 'error');
    } finally {
        setButtonBusy(button, false);
    }
}

async function adminCheckAllShareCookies() {
    if (!currentAdminShare || !currentAdminShare.id) return;
    const btn = el('viewCheckAllShareCookiesBtn');
    const cookies = getShareCookiesForCurrentMode();
    setButtonBusy(btn, true, 'Đang check...');
    setAdminCookieInfoState('Đang check toàn bộ cookie của link...', 'loading');
    try {
        await runCookieChecksForShare(currentAdminShare.id, cookies, SHARE_COOKIE_SLOTS, setShareCookieSlotState);
    } catch (error) {
        setAdminCookieInfoState(error.message || 'Check toàn bộ cookie thất bại.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

async function creatorCheckCookieSlot(slotKey) {
    if (!createdAdminShare || !createdAdminShare.id) {
        setShareState('Hãy tạo link ID server trước khi check cookie.', 'warning');
        return;
    }
    const slot = CREATED_SHARE_COOKIE_SLOTS.find((item) => item.key === slotKey);
    if (!slot) return;
    const button = el(slot.viewCheckBtnId);
    const cookies = getCreatedShareEditableCookies();
    if (!cookies[slotKey]) {
        setCreatedShareCookieSlotState(slotKey, 'Để trống', null);
        renderCreatorCookieCheckCards([]);
        setCreatorCookieInfoState('Ô cookie này đang để trống.', 'idle');
        return;
    }
    setButtonBusy(button, true, 'Đang check...');
    setCreatorCookieInfoState(`Đang check ${slot.label.toLowerCase()}...`, 'loading');
    try {
        const data = await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(createdAdminShare.id)}/check-cookie`, 'POST', {
            slot: slotKey,
            cookieStr: cookies[slotKey] || '',
            cookies
        });
        const result = data.result || {};
        setCreatedShareCookieSlotState(slotKey, result.ok ? 'PASS' : 'FAIL', !!result.ok);
        renderCreatorCookieCheckCards([result]);
        setCreatorCookieInfoState(`Đã check ${slot.label.toLowerCase()}.`, result.ok ? 'success' : 'warning');
    } catch (error) {
        setCreatedShareCookieSlotState(slotKey, 'FAIL', false);
        setCreatorCookieInfoState(error.message || 'Check cookie thất bại.', 'error');
    } finally {
        setButtonBusy(button, false);
    }
}

async function creatorCheckAllShareCookies() {
    if (!createdAdminShare || !createdAdminShare.id) {
        setShareState('Hãy tạo link ID server trước khi check cookie.', 'warning');
        return;
    }
    const btn = el('creatorCheckAllShareCookiesBtn');
    const cookies = getCreatedShareEditableCookies();
    setButtonBusy(btn, true, 'Đang check...');
    setCreatorCookieInfoState('Đang check toàn bộ cookie của link mới...', 'loading');
    try {
        await runCookieChecksForShare(
            createdAdminShare.id,
            cookies,
            CREATED_SHARE_COOKIE_SLOTS,
            setCreatedShareCookieSlotState,
            { renderCards: renderCreatorCookieCheckCards, setInfoState: setCreatorCookieInfoState }
        );
    } catch (error) {
        setCreatorCookieInfoState(error.message || 'Check toàn bộ cookie thất bại.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

function useShareCookieSlotForRuntime(slotKey) {
    const cookies = getShareCookiesForCurrentMode();
    const cookieRaw = normalizeCookie(cookies[slotKey] || '');
    if (!cookieRaw) {
        setAdminSearchState('Không có cookie để áp dụng.', 'warning');
        return;
    }
    setRuntimeCookie(cookieRaw, { source: 'admin' });
    refreshRuntimeProfilesForCurrentCookie().catch(() => setRuntimeProfiles('Không rõ'));
    setAdminSearchState(`Đã áp dụng ${slotKey === 'primary' ? 'cookie chính' : (slotKey === 'backup1' ? 'cookie phụ 1' : 'cookie phụ 2')} vào runtime.`, 'success');
}

function useCreatedShareCookieSlotForRuntime(slotKey) {
    const cookies = getCreatedShareEditableCookies();
    const cookieRaw = normalizeCookie(cookies[slotKey] || '');
    if (!cookieRaw) {
        setShareState('Không có cookie để áp dụng.', 'warning');
        return;
    }
    setRuntimeCookie(cookieRaw, { source: 'admin' });
    refreshRuntimeProfilesForCurrentCookie().catch(() => setRuntimeProfiles('Không rõ'));
    setShareState(`Đã áp dụng ${slotKey === 'primary' ? 'cookie chính' : (slotKey === 'backup1' ? 'cookie phụ 1' : 'cookie phụ 2')} vào runtime.`, 'success');
}

async function adminRotateId() {
    if (!currentAdminShare || !currentAdminShare.id) return;

    const btn = el('adminRotateIdBtn');
    setButtonBusy(btn, true, 'Dang doi ID...');
    try {
        const oldId = currentAdminShare.id;
        const data = await apiRequest(`/api/getlink-admin/shares/${encodeURIComponent(oldId)}/rotate-id`, 'POST');
        renderAdminShare(data.share || null);
        if (el('adminShareSearchInput')) el('adminShareSearchInput').value = String(data.newId || '');
        setAdminSearchState(`Da doi ID ngau nhien. ID cu (${oldId}) khong con dung duoc.`, 'success');
    } catch (error) {
        setAdminSearchState(error.message || 'Khong doi duoc ID.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

async function adminSetStatus(action = 'revoke') {
    if (!currentAdminShare || !currentAdminShare.id) return;
    const isRevoke = action === 'revoke';
    const btn = el(isRevoke ? 'adminRevokeBtn' : 'adminRestoreBtn');
    setButtonBusy(btn, true, isRevoke ? 'Dang thu hoi...' : 'Dang phuc hoi...');

    try {
        const data = await apiRequest(
            `/api/getlink-admin/shares/${encodeURIComponent(currentAdminShare.id)}/${isRevoke ? 'revoke' : 'restore'}`,
            'POST'
        );
        renderAdminShare(data.share || null);
        setAdminSearchState(isRevoke ? 'Da thu hoi link chia se.' : 'Da phuc hoi link chia se.', 'success');
    } catch (error) {
        setAdminSearchState(error.message || 'Cap nhat trang thai that bai.', 'error');
    } finally {
        setButtonBusy(btn, false);
    }
}

function openAdminModal() {
    const modal = el('nfAdminModal');
    if (!modal) return;
    syncAdminCookieInput();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    populateAdminWarningConfigInputs(warningBannerConfig);
    if (adminAuthenticated) {
        setAdminWarningConfigState('Dang tai noi dung popup hien tai...', 'loading');
        loadWarningBannerConfig({ silent: false });
    }
}

function closeAdminModal() {
    const modal = el('nfAdminModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

function bindEvents() {
    const adminTabButtons = Array.from(document.querySelectorAll('[data-admin-tab]'));
    adminTabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const nextTab = normalizeAdminTab(button.dataset.adminTab || 'search');
            setAdminTab(nextTab, { manual: true });
        });
    });

    const supportBtn = el('supportWarrantyBtn');
    if (supportBtn) supportBtn.addEventListener('click', () => openSupportModal(getDefaultSupportModalContent()));

    const overloadFixBtn = el('overloadFixBtn');
    if (overloadFixBtn) overloadFixBtn.addEventListener('click', () => openOverloadFixModal('overload'));

    const householdFixBtn = el('householdFixBtn');
    if (householdFixBtn) householdFixBtn.addEventListener('click', () => openOverloadFixModal('household'));

    const disclaimerDismissBtn = el('disclaimerDismissBtn');
    if (disclaimerDismissBtn) {
        disclaimerDismissBtn.addEventListener('click', () => {
            if (!closeDisclaimerModal()) return;
            updateReadyState();
            if (upgradeNoticePending) openUpgradeNoticeModal();
        });
    }

    const upgradeNoticeCheckbox = el('upgradeNoticeUnderstood');
    if (upgradeNoticeCheckbox) {
        upgradeNoticeCheckbox.addEventListener('change', () => {
            if (Date.now() >= upgradeNoticeReadyAt) {
                setUpgradeNoticeState(
                    upgradeNoticeCheckbox.checked
                        ? 'Bạn có thể bấm Bỏ qua để tiếp tục.'
                        : 'Hãy tick vào “Tôi đã hiểu” để bỏ qua popup.',
                    upgradeNoticeCheckbox.checked ? 'success' : 'warning'
                );
            }
            refreshUpgradeNoticeButton();
        });
    }

    const upgradeNoticeDismissBtn = el('upgradeNoticeDismissBtn');
    if (upgradeNoticeDismissBtn) {
        upgradeNoticeDismissBtn.addEventListener('click', () => {
            if (upgradeNoticeDismissBtn.disabled || Date.now() < upgradeNoticeReadyAt) return;
            if (!el('upgradeNoticeUnderstood')?.checked) return;
            closeUpgradeNoticeModal();
        });
    }

    const creatorImportBtn = el('creatorImportCookiesFromSheetBtn');
    if (creatorImportBtn) creatorImportBtn.addEventListener('click', () => importCookiesFromSheet('create'));

    const currentImportBtn = el('currentImportCookiesFromSheetBtn');
    if (currentImportBtn) currentImportBtn.addEventListener('click', () => importCookiesFromSheet('current'));

    const supportCloseBtn = el('supportModalCloseBtn');
    if (supportCloseBtn) supportCloseBtn.addEventListener('click', closeSupportModal);

    const supportAutoFixBtn = el('supportModalAutoFixBtn');
    if (supportAutoFixBtn) supportAutoFixBtn.addEventListener('click', autoFixShareCookies);

    const supportModal = el('supportModal');
    if (supportModal) {
        supportModal.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            if (target.dataset.closeSupport === '1') closeSupportModal();
        });
    }

    const deviceButtons = Array.from(document.querySelectorAll('.btn-device'));
    deviceButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const device = String(button.dataset.device || '').trim();
            if (!device) return;
            if (device === 'tv') {
                handleConfirmedDevice(device);
                return;
            }
            openDeviceConfirmModal(device);
        });
    });

    const deviceConfirmModal = el('deviceConfirmModal');
    if (deviceConfirmModal) {
        deviceConfirmModal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.closeDeviceConfirm === '1') closeDeviceConfirmModal();
        });
    }

    const deviceConfirmCloseBtn = el('deviceConfirmCloseBtn');
    if (deviceConfirmCloseBtn) deviceConfirmCloseBtn.addEventListener('click', closeDeviceConfirmModal);

    const deviceConfirmCancelBtn = el('deviceConfirmCancelBtn');
    if (deviceConfirmCancelBtn) deviceConfirmCancelBtn.addEventListener('click', closeDeviceConfirmModal);

    const deviceConfirmOkBtn = el('deviceConfirmOkBtn');
    if (deviceConfirmOkBtn) {
        deviceConfirmOkBtn.addEventListener('click', () => {
            if (Date.now() < deviceConfirmReadyAt) return;
            const device = pendingDeviceConfirm;
            closeDeviceConfirmModal();
            handleConfirmedDevice(device);
        });
    }
    const mobileOsModal = el('mobileOsModal');
    if (mobileOsModal) {
        mobileOsModal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.closeMobileOs === '1') closeMobileOsModal();
        });
    }

    const mobileOsCloseBtn = el('mobileOsCloseBtn');
    if (mobileOsCloseBtn) mobileOsCloseBtn.addEventListener('click', closeMobileOsModal);

    const overloadFixModal = el('overloadFixModal');
    if (overloadFixModal) {
        overloadFixModal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.closeOverloadFix === '1') closeOverloadFixModal();
        });
    }

    const overloadFixCloseBtn = el('overloadFixCloseBtn');
    if (overloadFixCloseBtn) overloadFixCloseBtn.addEventListener('click', () => closeOverloadFixModal());

    const overloadFixCancelBtn = el('overloadFixCancelBtn');
    if (overloadFixCancelBtn) overloadFixCancelBtn.addEventListener('click', () => closeOverloadFixModal());

    const overloadFixConfirmBtn = el('overloadFixConfirmBtn');
    if (overloadFixConfirmBtn) overloadFixConfirmBtn.addEventListener('click', rotateOverloadShareCookie);

    const overloadFixSuccessModal = el('overloadFixSuccessModal');
    if (overloadFixSuccessModal) {
        overloadFixSuccessModal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.closeOverloadFixSuccess === '1') closeOverloadFixSuccessModal();
        });
    }

    const overloadFixSuccessCloseBtn = el('overloadFixSuccessCloseBtn');
    if (overloadFixSuccessCloseBtn) overloadFixSuccessCloseBtn.addEventListener('click', closeOverloadFixSuccessModal);

    const overloadFixSuccessOkBtn = el('overloadFixSuccessOkBtn');
    if (overloadFixSuccessOkBtn) overloadFixSuccessOkBtn.addEventListener('click', closeOverloadFixSuccessModal);

    const mobileOsAndroidBtn = el('mobileOsAndroidBtn');
    if (mobileOsAndroidBtn) {
        mobileOsAndroidBtn.addEventListener('click', () => {
            const nextDevice = pendingMobileOsDevice || 'mobile';
            closeMobileOsModal();
            generateDeviceLink(nextDevice, 'android');
        });
    }

    const mobileOsIosBtn = el('mobileOsIosBtn');
    if (mobileOsIosBtn) {
        mobileOsIosBtn.addEventListener('click', () => {
            const nextDevice = pendingMobileOsDevice || 'mobile';
            closeMobileOsModal();
            generateDeviceLink(nextDevice, 'ios');
        });
    }

    const mobileLinkModal = el('mobileLinkModal');
    if (mobileLinkModal) {
        mobileLinkModal.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            if (target.dataset.closeMobileLink === '1') closeMobileLinkModal();
        });
    }

    const mobileLinkCloseBtn = el('mobileLinkCloseBtn');
    if (mobileLinkCloseBtn) mobileLinkCloseBtn.addEventListener('click', closeMobileLinkModal);

    const copyMobileLinkBtn = el('copyMobileLinkBtn');
    if (copyMobileLinkBtn) {
        copyMobileLinkBtn.addEventListener('click', async () => {
            const link = String(el('mobileLinkOutput') && el('mobileLinkOutput').value || mobileGeneratedLink || '').trim();
            if (!link) {
                setLookupState('Chưa có link mobile để sao chép.', 'warning');
                showToast('Chưa có link mobile để sao chép.', 'warn');
                return;
            }
            await copyText(link, 'Đã sao chép link đăng nhập mobile.');
        });
    }

    const copyUnsupportedLinkBtn = el('copyUnsupportedLinkBtn');
    if (copyUnsupportedLinkBtn) {
        copyUnsupportedLinkBtn.addEventListener('click', async () => {
            await copyText(UNSUPPORTED_URL, 'Đã sao chép netflix.com/unsupported.');
        });
    }

    const tvGuideModal = el('tvGuideModal');
    if (tvGuideModal) {
        tvGuideModal.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            if (target.dataset.closeTvGuide === '1') closeTvGuideModal();
        });
    }

    const tvGuideCloseBtn = el('tvGuideCloseBtn');
    if (tvGuideCloseBtn) tvGuideCloseBtn.addEventListener('click', closeTvGuideModal);

    const copyTvGuideLinkBtn = el('copyTvGuideLinkBtn');
    if (copyTvGuideLinkBtn) {
        copyTvGuideLinkBtn.addEventListener('click', async () => {
            const link = String(el('tvGuideOutput') && el('tvGuideOutput').value || tvGeneratedLink || '').trim();
            if (!link) {
                setLookupState('Chưa có link TV để sao chép.', 'warning');
                showToast('Chưa có link TV để sao chép.', 'warn');
                return;
            }
            await copyText(link, 'Đã sao chép link đăng nhập TV.');
        });
    }

    const copyTv2LinkBtn = el('copyTv2LinkBtn');
    if (copyTv2LinkBtn) {
        copyTv2LinkBtn.addEventListener('click', async () => {
            await copyText(TV2_URL, 'Đã sao chép netflix.com/tv2.');
        });
    }

    const adminFab = el('nfAdminFab');
    if (adminFab) adminFab.addEventListener('click', openAdminModal);

    const closeAdminBtn = el('closeAdminBtn');
    if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminModal);

    const adminModal = el('nfAdminModal');
    if (adminModal) {
        adminModal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.closeAdmin === '1') closeAdminModal();
        });
    }

    const adminLoginBtn = el('adminLoginBtn');
    if (adminLoginBtn) adminLoginBtn.addEventListener('click', adminLogin);

    const adminLogoutBtn = el('adminLogoutBtn');
    if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', adminLogout);

    const adminSaveWarningConfigBtn = el('adminSaveWarningConfigBtn');
    if (adminSaveWarningConfigBtn) adminSaveWarningConfigBtn.addEventListener('click', adminSaveWarningBannerConfig);

    const adminReloadWarningConfigBtn = el('adminReloadWarningConfigBtn');
    if (adminReloadWarningConfigBtn) adminReloadWarningConfigBtn.addEventListener('click', () => loadWarningBannerConfig({ silent: false }));

    const adminFixHistoryToggleBtn = el('adminFixHistoryToggleBtn');
    if (adminFixHistoryToggleBtn) adminFixHistoryToggleBtn.addEventListener('click', toggleFixHistory);

    const adminFixHistoryReloadBtn = el('adminFixHistoryReloadBtn');
    if (adminFixHistoryReloadBtn) adminFixHistoryReloadBtn.addEventListener('click', () => loadFixHistory());

    const adminFixLimitResetBtn = el('adminFixLimitResetBtn');
    if (adminFixLimitResetBtn) adminFixLimitResetBtn.addEventListener('click', adminResetFixLimit);

    const adminFixHistorySortSelect = el('adminFixHistorySortSelect');
    if (adminFixHistorySortSelect) {
        adminFixHistorySortSelect.addEventListener('change', () => loadFixHistory({
            sort: adminFixHistorySortSelect.value
        }));
    }

    const adminTestSheetConfigBtn = el('adminTestSheetConfigBtn');
    if (adminTestSheetConfigBtn) adminTestSheetConfigBtn.addEventListener('click', adminTestSheetConfig);

    document.querySelectorAll('.admin-settings-box input, .admin-settings-box textarea').forEach((input) => {
        input.addEventListener('input', () => {
            setAdminWarningConfigState('Noi dung da thay doi. Bam Luu noi dung de ap dung.', 'idle');
        });
    });

    const generateShareLinkBtn = el('generateShareLinkBtn');
    if (generateShareLinkBtn) generateShareLinkBtn.addEventListener('click', generateShareIdLink);

    const shareCreateQuickDaysInput = el('shareCreateQuickDaysInput');
    if (shareCreateQuickDaysInput) {
        shareCreateQuickDaysInput.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            generateShareIdLink();
        });
    }

    const shareCreateDateInput = el('shareCreateDateInput');
    if (shareCreateDateInput) {
        shareCreateDateInput.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            generateShareIdLink();
        });
    }

    const shareCreateTimeInput = el('shareCreateTimeInput');
    if (shareCreateTimeInput) {
        shareCreateTimeInput.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            generateShareIdLink();
        });
    }

    const copyShareLinkBtn = el('copyShareLinkBtn');
    if (copyShareLinkBtn) {
        copyShareLinkBtn.addEventListener('click', async () => {
            const url = String(el('shareLinkOutput') && el('shareLinkOutput').value || '').trim();
            if (!url) {
                setShareState('Chưa có link chia sẻ để sao chép.', 'warning');
                showToast('Chưa có link chia sẻ để sao chép.', 'warn');
                return;
            }
            const copied = await copyText(url, 'Đã sao chép link chia sẻ.');
            setShareState(copied ? 'Đã sao chép link chia sẻ.' : 'Không copy được. Hãy copy thủ công.', copied ? 'success' : 'warning');
        });
    }

    const saveCreatedShareCookiesBtn = el('saveCreatedShareCookiesBtn');
    if (saveCreatedShareCookiesBtn) saveCreatedShareCookiesBtn.addEventListener('click', saveCreatedShareCookies);

    const creatorCheckAllShareCookiesBtn = el('creatorCheckAllShareCookiesBtn');
    if (creatorCheckAllShareCookiesBtn) creatorCheckAllShareCookiesBtn.addEventListener('click', creatorCheckAllShareCookies);

    const createAnotherShareBtn = el('createAnotherShareBtn');
    if (createAnotherShareBtn) {
        createAnotherShareBtn.addEventListener('click', () => {
            resetCreatedShareComposer();
            setAdminTab('create', { manual: true, render: false });
            renderAdminWorkspace();
        });
    }

    const adminShareSearchBtn = el('adminShareSearchBtn');
    if (adminShareSearchBtn) adminShareSearchBtn.addEventListener('click', adminSearchShare);

    const adminShareSearchInput = el('adminShareSearchInput');
    if (adminShareSearchInput) {
        adminShareSearchInput.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            adminSearchShare();
        });
    }

    const saveCurrentShareBtn = el('saveCurrentShareBtn');
    if (saveCurrentShareBtn) saveCurrentShareBtn.addEventListener('click', adminSaveCookies);

    const viewCheckAllShareCookiesBtn = el('viewCheckAllShareCookiesBtn');
    if (viewCheckAllShareCookiesBtn) viewCheckAllShareCookiesBtn.addEventListener('click', adminCheckAllShareCookies);

    const editCurrentShareBtn = el('editCurrentShareBtn');
    if (editCurrentShareBtn) {
        editCurrentShareBtn.addEventListener('click', () => {
            if (!currentAdminShare) return;
            isInlineEditMode = true;
            setShareCookieViewOutputs(currentAdminShare.cookies || { primary: currentAdminShare.cookieRaw || '', backup1: '', backup2: '' });
            setShareNoteInput('currentShareNoteInput', currentAdminShare.note || '');
            setInlineEditMode(true);
        });
    }

    const cancelCurrentShareEditBtn = el('cancelCurrentShareEditBtn');
    if (cancelCurrentShareEditBtn) {
        cancelCurrentShareEditBtn.addEventListener('click', async () => {
            isInlineEditMode = false;
            if (!currentAdminShare || !currentAdminShare.id) {
                setInlineEditMode(false);
                return;
            }
            try {
                const data = await apiRequest('/api/getlink-admin/search', 'POST', { query: currentAdminShare.id });
                renderAdminShare(data.share || null);
                setAdminSearchState('Đã hủy chỉnh sửa và nạp lại dữ liệu link.', 'idle');
            } catch (error) {
                setAdminSearchState(error.message || 'Không nạp lại được dữ liệu link.', 'error');
            }
        });
    }

    SHARE_COOKIE_SLOTS.forEach((slot) => {
        const viewCheckBtn = el(slot.viewCheckBtnId);
        if (viewCheckBtn) viewCheckBtn.addEventListener('click', () => adminCheckCookieSlot(slot.key));
        const viewUseBtn = el(slot.viewUseBtnId);
        if (viewUseBtn) viewUseBtn.addEventListener('click', () => useShareCookieSlotForRuntime(slot.key));
    });

    CREATED_SHARE_COOKIE_SLOTS.forEach((slot) => {
        const viewCheckBtn = el(slot.viewCheckBtnId);
        if (viewCheckBtn) viewCheckBtn.addEventListener('click', () => creatorCheckCookieSlot(slot.key));
        const viewUseBtn = el(slot.viewUseBtnId);
        if (viewUseBtn) viewUseBtn.addEventListener('click', () => useCreatedShareCookieSlotForRuntime(slot.key));
        const input = el(slot.viewInputId);
        if (input) {
            input.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                saveCreatedShareCookies();
            });
        }
    });

    const adminSaveExpiryBtn = el('adminSaveExpiryBtn');
    if (adminSaveExpiryBtn) adminSaveExpiryBtn.addEventListener('click', () => adminSaveExpiry());

    const adminSaveNoteBtn = el('adminSaveNoteBtn');
    if (adminSaveNoteBtn) adminSaveNoteBtn.addEventListener('click', adminSaveNote);

    const adminClearExpiryBtn = el('adminClearExpiryBtn');
    if (adminClearExpiryBtn) {
        adminClearExpiryBtn.addEventListener('click', () => {
            const input = el('adminShareExpiryInput');
            if (input) input.value = '';
            setAdminSearchState('Da lam moi o nhap han. Chua thay doi du lieu tren server.', 'idle');
        });
    }

    const expiryQuickButtons = Array.from(document.querySelectorAll('.admin-expiry-quick-btn'));
    expiryQuickButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const addDays = Number(button.dataset.addDays || 0);
            if (!addDays || !currentAdminShare || !currentAdminShare.id) {
                setAdminSearchState('Hay tim 1 link truoc khi them han.', 'warning');
                return;
            }
            adminSaveExpiry({ addDays }, { button, busyLabel: `Dang +${addDays} ngay...` });
        });
    });

    const adminRotateIdBtn = el('adminRotateIdBtn');
    if (adminRotateIdBtn) adminRotateIdBtn.addEventListener('click', adminRotateId);

    const adminCopyUrlBtn = el('adminCopyUrlBtn');
    if (adminCopyUrlBtn) {
        adminCopyUrlBtn.addEventListener('click', async () => {
            const shareUrl = String(el('adminShareUrl') && el('adminShareUrl').value || '').trim();
            if (!shareUrl) {
                setAdminSearchState('Chua co URL de copy.', 'warning');
                showToast('Chua co URL de copy.', 'warn');
                return;
            }
            const copied = await copyText(shareUrl, 'Da copy URL share.', 'Khong copy duoc URL.');
            setAdminSearchState(copied ? 'Da copy URL share.' : 'Khong copy duoc URL.', copied ? 'success' : 'warning');
        });
    }

    const adminRevokeBtn = el('adminRevokeBtn');
    if (adminRevokeBtn) adminRevokeBtn.addEventListener('click', () => adminSetStatus('revoke'));

    const adminRestoreBtn = el('adminRestoreBtn');
    if (adminRestoreBtn) adminRestoreBtn.addEventListener('click', () => adminSetStatus('restore'));

    const adminUseShareCookieBtn = el('adminUseShareCookieBtn');
    if (adminUseShareCookieBtn) {
        adminUseShareCookieBtn.addEventListener('click', () => {
            const cookieRaw = normalizeCookie(el('currentShareCookiePrimaryDisplay') && el('currentShareCookiePrimaryDisplay').value || '');
            if (!cookieRaw) {
                setAdminSearchState('Không có cookie để áp dụng.', 'warning');
                return;
            }
            setRuntimeCookie(cookieRaw, { source: 'admin' });
            refreshRuntimeProfilesForCurrentCookie().catch(() => setRuntimeProfiles('Không rõ'));
            setAdminRuntimeCookieState('Đã áp dụng cookie chính của share này vào runtime.', 'success');
        });
    }

    window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        const disclaimerModalNode = el('disclaimerModal');
        if (disclaimerModalNode && !disclaimerModalNode.classList.contains('hidden')) {
            if (Date.now() >= disclaimerReadyAt) {
                closeDisclaimerModal();
                updateReadyState();
            }
            return;
        }

        const deviceConfirmModalNode = el('deviceConfirmModal');
        if (deviceConfirmModalNode && !deviceConfirmModalNode.classList.contains('hidden')) {
            closeDeviceConfirmModal();
            return;
        }

        const mobileOsModalNode = el('mobileOsModal');
        if (mobileOsModalNode && !mobileOsModalNode.classList.contains('hidden')) {
            closeMobileOsModal();
            return;
        }

        const overloadFixModalNode = el('overloadFixModal');
        if (overloadFixModalNode && !overloadFixModalNode.classList.contains('hidden')) {
            closeOverloadFixModal();
            return;
        }

        const overloadFixSuccessModalNode = el('overloadFixSuccessModal');
        if (overloadFixSuccessModalNode && !overloadFixSuccessModalNode.classList.contains('hidden')) {
            closeOverloadFixSuccessModal();
            return;
        }

        const tvGuideModalNode = el('tvGuideModal');
        if (tvGuideModalNode && !tvGuideModalNode.classList.contains('hidden')) {
            closeTvGuideModal();
            return;
        }

        const mobileModalNode = el('mobileLinkModal');
        if (mobileModalNode && !mobileModalNode.classList.contains('hidden')) {
            closeMobileLinkModal();
            return;
        }

        const supportModalNode = el('supportModal');
        if (supportModalNode && !supportModalNode.classList.contains('hidden')) {
            closeSupportModal();
            return;
        }

        closeAdminModal();
    });
}

async function bootstrap() {
    loadAdminAuthFromStorage();
    bindEvents();
    renderRuntimeProfileState();
    renderGetlinkContent();
    populateAdminWarningConfigInputs(warningBannerConfig);
    renderAdminWorkspace();
    await loadWarningBannerConfig({ silent: true });
    await loadAdminSession();
    await applyCookieFromQuery();
    if (adminAuthenticated) {
        await loadAdminShareFromPendingUrl();
    }
    disclaimerEligibilityResolved = true;
    if (canShowPromotionalPopups() && !disclaimerDismissed) {
        openDisclaimerModal();
    }
    syncAdminCookieInput();
    if (!getRuntimeCookie() && !entryAlertState) {
        setGuestGuard(true, 'Hãy mở đúng link /getlink?s=... hoặc /getlink?c=... để tiếp tục.', {
            title: 'Không tìm thấy link hợp lệ',
            kind: 'link'
        });
    }
    updateOverloadFixVisibility();
    updateReadyState();
    setShareState('', 'idle');
    setShareCreateExpiryState('', 'idle');
    if (adminAuthenticated) {
        await resumePendingSheetImportOperation('current');
        await resumePendingSheetImportOperation('create');
    }
    if (pendingShareIdFromUrl) {
        await resumePendingAutoFixOperation();
    }
}

bootstrap();
