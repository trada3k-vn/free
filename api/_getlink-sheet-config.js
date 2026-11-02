function clampInteger(value, fallback, min, max) {
    const parsed = Number(value);
    const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    return Math.max(min, Math.min(max, normalized));
}

function getSheetImportConfig(env = process.env) {
    const source = env && typeof env === 'object' ? env : {};
    return {
        candidateBatch: clampInteger(source.GETLINK_SHEET_CANDIDATE_BATCH, 5, 1, 20),
        checkConcurrency: clampInteger(source.GETLINK_SHEET_CHECK_CONCURRENCY, 5, 1, 10)
    };
}

function getSheetCheckWindow(rows = [], start = 0, concurrency = getSheetImportConfig().checkConcurrency) {
    const source = Array.isArray(rows) ? rows : [];
    const safeStart = Math.max(0, Math.trunc(Number(start) || 0));
    const safeConcurrency = Math.max(1, Math.trunc(Number(concurrency) || 1));
    return source.slice(safeStart, safeStart + safeConcurrency);
}

module.exports = {
    getSheetImportConfig,
    getSheetCheckWindow
};
