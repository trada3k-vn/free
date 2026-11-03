const { evaluateGetlinkCookie } = require('./_getlink-cookie-health');
const {
    getSheetCheckUpdate,
    getCookieFingerprint,
    listGetlinkSheetRows,
    updateGetlinkSheetRows
} = require('./_getlink-sheet-cookie-import');
const { resolveAppsScriptUrlOrThrow } = require('./_getlink-apps-script-client');
const { getSheetImportConfig } = require('./_getlink-sheet-config');

const SHEET_CHECK_SEGMENT_SIZE = 5000;
const SHEET_CHECK_PULL_SIZE = 100;
const COOKIE_CHECK_TIMEOUT_MS = Math.max(5000, Math.min(120000, Number(process.env.GETLINK_COOKIE_CHECK_TIMEOUT_MS || 25000) || 25000));
const { checkConcurrency: SHEET_CHECK_CONCURRENCY } = getSheetImportConfig();

function withTimeout(promise, timeoutMs, message) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            const error = new Error(message || 'Sheet Check timed out.');
            error.httpStatus = 504;
            reject(error);
        }, Math.max(1, Number(timeoutMs || 0) || 1));
        Promise.resolve(promise).then((value) => {
            clearTimeout(timer);
            resolve(value);
        }, (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}

function normalizeRow(row = {}) {
    const rowNumber = Number(row && row.rowNumber);
    if (!Number.isInteger(rowNumber) || rowNumber <= 0) return null;
    return {
        rowNumber,
        cookie: String(row.cookie || '').trim(),
        mark: String(row.mark || '').trim()
    };
}

function normalizeTimings(input = {}) {
    return {
        sheetFetchMs: Math.max(0, Number(input.sheetFetchMs || 0) || 0),
        cookieCheckMs: Math.max(0, Number(input.cookieCheckMs || 0) || 0),
        sheetUpdateMs: Math.max(0, Number(input.sheetUpdateMs || 0) || 0),
        totalMs: Math.max(0, Number(input.totalMs || 0) || 0)
    };
}

function createStatelessSheetCheckState(appsScriptUrl = '') {
    const resolvedUrl = resolveAppsScriptUrlOrThrow(appsScriptUrl);
    return {
        version: 2,
        appsScriptUrl: resolvedUrl,
        segmentNumber: 1,
        segmentStartRow: 1,
        segmentScannedRows: 0,
        totalScannedRows: 0,
        nextStartRow: 1,
        hasMore: true,
        segmentHasMore: true,
        seenFingerprints: [],
        queuedRows: [],
        checkedCount: 0,
        passCount: 0,
        failCount: 0,
        updatedCount: 0,
        maxStreamsUpdatedCount: 0,
        phase: 'pending',
        message: 'Dang chuan bi check Google Sheet...',
        timings: normalizeTimings()
    };
}

function normalizeStatelessSheetCheckState(input = {}) {
    const source = input && typeof input === 'object' ? input : {};
    const segmentNumber = Math.max(1, Math.trunc(Number(source.segmentNumber || 1) || 1));
    const segmentStartRow = Math.max(1, Math.trunc(Number(source.segmentStartRow || ((segmentNumber - 1) * SHEET_CHECK_SEGMENT_SIZE + 1)) || 1));
    return {
        version: 2,
        appsScriptUrl: resolveAppsScriptUrlOrThrow(source.appsScriptUrl),
        segmentNumber,
        segmentStartRow,
        segmentScannedRows: Math.max(0, Math.min(SHEET_CHECK_SEGMENT_SIZE, Number(source.segmentScannedRows || 0) || 0)),
        totalScannedRows: Math.max(0, Number(source.totalScannedRows || 0) || 0),
        nextStartRow: Math.max(segmentStartRow, Number(source.nextStartRow || segmentStartRow) || segmentStartRow),
        hasMore: source.hasMore !== false,
        segmentHasMore: source.segmentHasMore !== false,
        seenFingerprints: Array.from(new Set((Array.isArray(source.seenFingerprints) ? source.seenFingerprints : [])
            .map((value) => String(value || '').trim()).filter(Boolean))).slice(0, SHEET_CHECK_SEGMENT_SIZE),
        queuedRows: (Array.isArray(source.queuedRows) ? source.queuedRows : []).map(normalizeRow).filter(Boolean).slice(0, SHEET_CHECK_PULL_SIZE),
        checkedCount: Math.max(0, Number(source.checkedCount || 0) || 0),
        passCount: Math.max(0, Number(source.passCount || 0) || 0),
        failCount: Math.max(0, Number(source.failCount || 0) || 0),
        updatedCount: Math.max(0, Number(source.updatedCount || 0) || 0),
        maxStreamsUpdatedCount: Math.max(0, Number(source.maxStreamsUpdatedCount || 0) || 0),
        phase: String(source.phase || 'pending').trim() || 'pending',
        message: String(source.message || '').trim(),
        timings: normalizeTimings(source.timings || {})
    };
}

function rollToNextSegment(stateInput = {}) {
    const state = normalizeStatelessSheetCheckState(stateInput);
    state.segmentNumber += 1;
    state.segmentStartRow += SHEET_CHECK_SEGMENT_SIZE;
    state.segmentScannedRows = 0;
    state.nextStartRow = state.segmentStartRow;
    state.segmentHasMore = true;
    state.hasMore = true;
    state.seenFingerprints = [];
    state.queuedRows = [];
    state.phase = 'pulling_sheet';
    state.message = `Dang chuyen sang dot ${state.segmentNumber} tu dong ${state.segmentStartRow}...`;
    return state;
}

function shapeStatelessSheetCheckResult(stateInput = {}, status = 'pending') {
    const state = normalizeStatelessSheetCheckState(stateInput);
    return {
        success: status !== 'failed',
        status,
        phase: state.phase,
        message: state.message,
        segmentNumber: state.segmentNumber,
        segmentStartRow: state.segmentStartRow,
        segmentEndRow: state.segmentStartRow + SHEET_CHECK_SEGMENT_SIZE - 1,
        segmentScannedRows: state.segmentScannedRows,
        totalScannedRows: state.totalScannedRows,
        checkedCount: state.checkedCount,
        passCount: state.passCount,
        failCount: state.failCount,
        updatedCount: state.updatedCount,
        maxStreamsUpdatedCount: state.maxStreamsUpdatedCount,
        timings: state.timings,
        debug: {
            rowsScanned: state.totalScannedRows,
            scannedPhysicalRows: state.totalScannedRows,
            lastScannedUntilRow: Math.max(0, state.nextStartRow - 1),
            cookieChecks: state.checkedCount,
            passFound: state.passCount
        }
    };
}

async function advanceStatelessSheetCheck(stateInput = {}, dependencies = {}) {
    let state = normalizeStatelessSheetCheckState(stateInput);
    const startedAt = Date.now();
    const listRows = dependencies.listRows || listGetlinkSheetRows;
    const checkCookie = dependencies.checkCookie || evaluateGetlinkCookie;
    const writeRows = dependencies.writeRows || updateGetlinkSheetRows;
    const segmentEndRow = state.segmentStartRow + SHEET_CHECK_SEGMENT_SIZE - 1;

    if (state.queuedRows.length === 0 && state.segmentScannedRows >= SHEET_CHECK_SEGMENT_SIZE) {
        if (!state.segmentHasMore) {
            state.phase = 'completed';
            state.message = `Da check xong ${state.checkedCount} tai khoan trong Google Sheet.`;
            state.timings.totalMs += Date.now() - startedAt;
            return { state, result: shapeStatelessSheetCheckResult(state, 'completed') };
        }
        state = rollToNextSegment(state);
        state.timings.totalMs += Date.now() - startedAt;
        return { state, result: shapeStatelessSheetCheckResult(state, 'pending') };
    }

    if (state.queuedRows.length === 0) {
        state.phase = 'pulling_sheet';
        state.message = `Dang doc dot ${state.segmentNumber}, tu dong ${state.nextStartRow}...`;
        const fetchStart = state.nextStartRow;
        const fetchStartedAt = Date.now();
        const batch = await listRows({
            startRow: fetchStart,
            limit: SHEET_CHECK_PULL_SIZE,
            appsScriptUrl: state.appsScriptUrl
        });
        state.timings.sheetFetchMs += Date.now() - fetchStartedAt;

        const scannedUntil = Math.max(fetchStart - 1, Number(batch.scannedUntilRow || fetchStart - 1) || fetchStart - 1);
        const rawNextStart = Math.max(fetchStart, Number(batch.nextStartRow || scannedUntil + 1) || scannedUntil + 1);
        // Apps Script can scan a larger block than it returns when the visible
        // row limit is reached. Only count through the last returned cursor so
        // the following request does not double-count the overlap.
        const coveredUntil = batch.hasMore && rawNextStart <= scannedUntil
            ? Math.max(fetchStart - 1, rawNextStart - 1)
            : scannedUntil;
        const cappedScannedUntil = Math.min(segmentEndRow, coveredUntil);
        const scannedNow = Math.max(0, cappedScannedUntil - fetchStart + 1);
        state.segmentScannedRows = Math.min(SHEET_CHECK_SEGMENT_SIZE, state.segmentScannedRows + scannedNow);
        state.totalScannedRows += scannedNow;
        state.nextStartRow = Math.max(fetchStart + 1, rawNextStart);
        if (state.nextStartRow > segmentEndRow + 1) state.nextStartRow = segmentEndRow + 1;

        const dataBeyondSegment = scannedUntil > segmentEndRow
            || (Array.isArray(batch.rows) && batch.rows.some((row) => Number(row && row.rowNumber) > segmentEndRow));
        state.segmentHasMore = dataBeyondSegment || !!batch.hasMore;
        state.hasMore = state.segmentHasMore;

        const seen = new Set(state.seenFingerprints);
        state.queuedRows = (Array.isArray(batch.rows) ? batch.rows : [])
            .map(normalizeRow)
            .filter((row) => row && row.rowNumber <= segmentEndRow && row.cookie)
            .filter((row) => {
                const fingerprint = getCookieFingerprint(row.cookie);
                if (!fingerprint || seen.has(fingerprint)) return false;
                seen.add(fingerprint);
                return true;
            });
        state.seenFingerprints = Array.from(seen);

        if (state.queuedRows.length === 0) {
            if (!batch.hasMore && !dataBeyondSegment) {
                state.phase = 'completed';
                state.message = `Da check xong ${state.checkedCount} tai khoan trong Google Sheet.`;
                state.timings.totalMs += Date.now() - startedAt;
                return { state, result: shapeStatelessSheetCheckResult(state, 'completed') };
            }
            if (state.segmentScannedRows >= SHEET_CHECK_SEGMENT_SIZE || state.nextStartRow > segmentEndRow) {
                state = rollToNextSegment(state);
            }
            state.timings.totalMs += Date.now() - startedAt;
            return { state, result: shapeStatelessSheetCheckResult(state, 'pending') };
        }
    }

    const checkRows = state.queuedRows.slice(0, SHEET_CHECK_CONCURRENCY);
    state.phase = 'checking_candidates';
    state.message = `Dang check ${checkRows.length} tai khoan trong dot ${state.segmentNumber}...`;
    const checkStartedAt = Date.now();
    const checked = await withTimeout(Promise.all(checkRows.map(async (row) => ({
        row,
        cookieResult: await withTimeout(checkCookie(row.cookie), COOKIE_CHECK_TIMEOUT_MS, `Check tai khoan timeout sau ${COOKIE_CHECK_TIMEOUT_MS}ms.`)
    }))), COOKIE_CHECK_TIMEOUT_MS + 1000, `Check tai khoan timeout sau ${COOKIE_CHECK_TIMEOUT_MS}ms.`);
    state.timings.cookieCheckMs += Date.now() - checkStartedAt;

    const updates = [];
    checked.forEach(({ row, cookieResult }) => {
        state.checkedCount += 1;
        if (cookieResult && cookieResult.ok) {
            state.passCount += 1;
            updates.push({
                rowNumber: row.rowNumber,
                maxStreams: String(cookieResult.summary && cookieResult.summary.maxStreams || '').trim()
            });
            return;
        }
        const failUpdate = getSheetCheckUpdate(row, cookieResult || {});
        if (failUpdate) updates.push(failUpdate);
        state.failCount += 1;
    });
    state.queuedRows = state.queuedRows.slice(checkRows.length);

    if (updates.length > 0) {
        state.phase = 'writing_marks';
        state.message = `Dang cap nhat ${updates.length} dong loi trong Google Sheet...`;
        const writeStartedAt = Date.now();
        await writeRows(updates, { appsScriptUrl: state.appsScriptUrl });
        state.timings.sheetUpdateMs += Date.now() - writeStartedAt;
        state.updatedCount += updates.filter((item) => Object.prototype.hasOwnProperty.call(item, 'mark')).length;
        state.maxStreamsUpdatedCount += updates.filter((item) => Object.prototype.hasOwnProperty.call(item, 'maxStreams')).length;
    }

    if (state.queuedRows.length === 0 && !state.segmentHasMore) {
        state.phase = 'completed';
        state.message = `Da check xong ${state.checkedCount} tai khoan: ${state.passCount} PASS, ${state.failCount} loi.`;
        state.timings.totalMs += Date.now() - startedAt;
        return { state, result: shapeStatelessSheetCheckResult(state, 'completed') };
    }

    if (state.queuedRows.length === 0 && (state.segmentScannedRows >= SHEET_CHECK_SEGMENT_SIZE || state.nextStartRow > segmentEndRow)) {
        state = rollToNextSegment(state);
    } else {
        state.phase = state.queuedRows.length > 0 ? 'checking_candidates' : 'pulling_sheet';
        state.message = state.queuedRows.length > 0
            ? `Con ${state.queuedRows.length} tai khoan dang cho check trong dot ${state.segmentNumber}.`
            : `Dang tiep tuc dot ${state.segmentNumber} tu dong ${state.nextStartRow}...`;
    }
    state.timings.totalMs += Date.now() - startedAt;
    return { state, result: shapeStatelessSheetCheckResult(state, 'pending') };
}

module.exports = {
    SHEET_CHECK_SEGMENT_SIZE,
    SHEET_CHECK_PULL_SIZE,
    createStatelessSheetCheckState,
    normalizeStatelessSheetCheckState,
    rollToNextSegment,
    shapeStatelessSheetCheckResult,
    advanceStatelessSheetCheck
};
