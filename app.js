// ===== STORAGE KEYS =====
const STORAGE_KEY = 'elmar_work_session';
const HISTORY_KEY = 'elmar_work_history';
const SETTINGS_KEY = 'elmar_settings';
const CATEGORIES_KEY = 'elmar_categories';

// ===== DEFAULT SETTINGS =====
const DEFAULT_SETTINGS = {
    dailyNorm: 8, // godziny
    breakReminderInterval: 120, // minuty (2h)
    breakReminderEnabled: true
};

// ===== DEFAULT CATEGORIES =====
const DEFAULT_CATEGORIES = [
    { id: 'default', name: 'Ogólne', color: '#6366f1' },
    { id: 'meeting', name: 'Spotkania', color: '#10b981' },
    { id: 'project', name: 'Projekt', color: '#f59e0b' }
];

// ===== STATE =====
let state = {
    isWorking: false,
    isOnBreak: false,
    workStartTime: null,
    workEndTime: null,
    currentBreakStart: null,
    breaks: [],
    timerInterval: null,
    breakTimerInterval: null,
    note: '',
    categoryId: 'default',
    breakReminderTimeout: null,
    lastBreakReminder: null
};

// Edit state
let editState = {
    editingIndex: null,
    editBreaks: []
};

// Selection state
let selectionState = {
    selectedIndices: new Set()
};

// Settings state
let settings = { ...DEFAULT_SETTINGS };

// Categories state
let categories = [...DEFAULT_CATEGORIES];

// ===== DOM ELEMENTS =====
const elements = {
    // Screens
    welcomeScreen: document.getElementById('welcome-screen'),
    timerScreen: document.getElementById('timer-screen'),
    summaryScreen: document.getElementById('summary-screen'),
    historyScreen: document.getElementById('history-screen'),

    // Welcome
    startWorkBtn: document.getElementById('start-work-btn'),
    showHistoryBtn: document.getElementById('show-history-btn'),
    welcomeDate: document.getElementById('welcome-date'),

    // Timer screen
    workStartDisplay: document.getElementById('work-start-display'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    timerLabel: document.getElementById('timer-label'),

    // Break timer
    breakHours: document.getElementById('break-hours'),
    breakMinutes: document.getElementById('break-minutes'),
    breakSeconds: document.getElementById('break-seconds'),
    breakTimerSection: document.getElementById('break-timer-section'),

    // Status
    statusIndicator: document.getElementById('status-indicator'),
    statusText: document.getElementById('status-text'),

    // Buttons
    endWorkBtn: document.getElementById('end-work-btn'),
    startBreakBtn: document.getElementById('start-break-btn'),
    endBreakBtn: document.getElementById('end-break-btn'),

    // Breaks list
    breaksList: document.getElementById('breaks-list'),
    breaksContainer: document.getElementById('breaks-container'),

    // Dates
    currentDate: document.getElementById('current-date'),

    // Summary
    summaryDate: document.getElementById('summary-date'),
    summaryStartTime: document.getElementById('summary-start-time'),
    summaryEndTime: document.getElementById('summary-end-time'),
    summaryTotalTime: document.getElementById('summary-total-time'),
    summaryBreaks: document.getElementById('summary-breaks'),
    summaryBreaksList: document.getElementById('summary-breaks-list'),
    summaryTotalBreak: document.getElementById('summary-total-break'),
    newDayBtn: document.getElementById('new-day-btn'),

    // History
    historyList: document.getElementById('history-list'),
    emptyHistory: document.getElementById('empty-history'),
    backFromHistoryBtn: document.getElementById('back-from-history-btn'),

    // Export
    exportPanel: document.getElementById('export-panel'),
    selectAllCheckbox: document.getElementById('select-all-checkbox'),
    selectedCount: document.getElementById('selected-count'),
    exportExcelBtn: document.getElementById('export-excel-btn'),

    // Modal
    editModal: document.getElementById('edit-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    saveEditBtn: document.getElementById('save-edit-btn'),
    editDate: document.getElementById('edit-date'),
    editStartTime: document.getElementById('edit-start-time'),
    editEndTime: document.getElementById('edit-end-time'),
    editBreaksList: document.getElementById('edit-breaks-list'),
    addBreakBtn: document.getElementById('add-break-btn'),
    editNote: document.getElementById('edit-note'),
    editCategory: document.getElementById('edit-category'),

    // Stats screen
    statsScreen: document.getElementById('stats-screen'),
    showStatsBtn: document.getElementById('show-stats-btn'),
    backFromStatsBtn: document.getElementById('back-from-stats-btn'),
    statsPeriodBtns: document.querySelectorAll('.period-btn'),
    statsDaysWorked: document.getElementById('stats-days-worked'),
    statsTotalWork: document.getElementById('stats-total-work'),
    statsAvgWork: document.getElementById('stats-avg-work'),
    statsTotalBreak: document.getElementById('stats-total-break'),
    statsOvertime: document.getElementById('stats-overtime'),
    statsOvertimeCard: document.getElementById('stats-overtime-card'),
    statsChart: document.getElementById('stats-chart'),
    statsCategory: document.getElementById('stats-category'),

    // Note and category
    workNote: document.getElementById('work-note'),
    workCategory: document.getElementById('work-category'),

    // Import/Export JSON
    exportJsonBtn: document.getElementById('export-json-btn'),
    importJsonBtn: document.getElementById('import-json-btn'),
    importJsonInput: document.getElementById('import-json-input'),

    // Settings
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    settingsDailyNorm: document.getElementById('settings-daily-norm'),
    settingsBreakReminder: document.getElementById('settings-break-reminder'),
    settingsBreakReminderEnabled: document.getElementById('settings-break-reminder-enabled'),

    // Categories management
    categoriesList: document.getElementById('categories-list'),
    addCategoryBtn: document.getElementById('add-category-btn'),

    // Navigation
    backFromTimerBtn: document.getElementById('back-from-timer-btn'),

    // Splash screen
    splashScreen: document.getElementById('splash-screen')
};

// ===== LOCAL STORAGE FUNCTIONS =====
function saveState() {
    const dataToSave = {
        isWorking: state.isWorking,
        isOnBreak: state.isOnBreak,
        workStartTime: state.workStartTime,
        workEndTime: state.workEndTime,
        currentBreakStart: state.currentBreakStart,
        breaks: state.breaks,
        note: state.note,
        categoryId: state.categoryId,
        lastBreakReminder: state.lastBreakReminder
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.isWorking = data.isWorking || false;
            state.isOnBreak = data.isOnBreak || false;
            state.workStartTime = data.workStartTime || null;
            state.workEndTime = data.workEndTime || null;
            state.currentBreakStart = data.currentBreakStart || null;
            state.breaks = data.breaks || [];
            state.note = data.note || '';
            state.categoryId = data.categoryId || 'default';
            state.lastBreakReminder = data.lastBreakReminder || null;
            return true;
        } catch (e) {
            console.error('Error loading state:', e);
            return false;
        }
    }
    return false;
}

// ===== SETTINGS FUNCTIONS =====
function loadSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
        try {
            settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch (e) {
            settings = { ...DEFAULT_SETTINGS };
        }
    }
}

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ===== CATEGORIES FUNCTIONS =====
function loadCategories() {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    if (saved) {
        try {
            categories = JSON.parse(saved);
        } catch (e) {
            categories = [...DEFAULT_CATEGORIES];
        }
    }
}

function saveCategories() {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function getCategoryById(id) {
    return categories.find(c => c.id === id) || categories[0];
}

function addCategory(name, color) {
    const id = 'cat_' + Date.now();
    categories.push({ id, name, color });
    saveCategories();
    return id;
}

function deleteCategory(id) {
    if (id === 'default') return;
    categories = categories.filter(c => c.id !== id);
    saveCategories();
}

function renderCategoriesSelect(selectElement, selectedId = 'default') {
    if (!selectElement) return;
    selectElement.innerHTML = categories.map(c =>
        `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.name}</option>`
    ).join('');
}

function renderCategoriesList() {
    if (!elements.categoriesList) return;
    elements.categoriesList.innerHTML = categories.map(c => `
        <div class="category-item" data-id="${c.id}">
            <div class="category-color" style="background: ${c.color}"></div>
            <span class="category-name">${c.name}</span>
            ${c.id !== 'default' ? `
                <button class="delete-category-btn" data-id="${c.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            ` : ''}
        </div>
    `).join('');

    // Add delete listeners
    elements.categoriesList.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Czy na pewno chcesz usunąć tę kategorię?')) {
                deleteCategory(btn.dataset.id);
                renderCategoriesList();
                renderCategoriesSelect(elements.workCategory, state.categoryId);
                renderCategoriesSelect(elements.editCategory);
            }
        });
    });
}

// ===== JSON IMPORT/EXPORT =====
function exportDatabaseJSON() {
    const data = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        history: getHistory(),
        settings: settings,
        categories: categories,
        currentSession: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elmar_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Baza danych wyeksportowana pomyślnie!', 'success');
}

function importDatabaseJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Validate structure
                if (!data.history && !data.settings && !data.categories) {
                    throw new Error('Nieprawidłowy format pliku');
                }

                // Import history
                if (data.history && Array.isArray(data.history)) {
                    const existingHistory = getHistory();
                    const mergedHistory = [...data.history];

                    // Merge with existing (avoid duplicates by timestamp)
                    existingHistory.forEach(entry => {
                        const exists = mergedHistory.some(e =>
                            e.workStartTime === entry.workStartTime &&
                            e.workEndTime === entry.workEndTime
                        );
                        if (!exists) {
                            mergedHistory.push(entry);
                        }
                    });

                    // Sort by date (newest first)
                    mergedHistory.sort((a, b) => b.workStartTime - a.workStartTime);

                    // Limit to 100 entries
                    if (mergedHistory.length > 100) {
                        mergedHistory.length = 100;
                    }

                    saveHistory(mergedHistory);
                }

                // Import settings
                if (data.settings) {
                    settings = { ...DEFAULT_SETTINGS, ...data.settings };
                    saveSettings();
                }

                // Import categories
                if (data.categories && Array.isArray(data.categories)) {
                    // Merge categories
                    data.categories.forEach(cat => {
                        const exists = categories.some(c => c.id === cat.id);
                        if (!exists) {
                            categories.push(cat);
                        }
                    });
                    saveCategories();
                }

                showToast(`Zaimportowano ${data.history?.length || 0} wpisów!`, 'success');
                resolve(data);
            } catch (err) {
                showToast('Błąd importu: ' + err.message, 'error');
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('Błąd odczytu pliku'));
        reader.readAsText(file);
    });
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function clearState() {
    localStorage.removeItem(STORAGE_KEY);
}

// ===== STATISTICS FUNCTIONS =====
// Current stats filter state
let statsState = {
    period: 'month',
    categoryId: 'all'
};

function calculateStatistics(period = 'month', categoryId = 'all') {
    const history = getHistory();
    const now = new Date();

    // Filter by period
    let filtered = history.filter(entry => {
        const entryDate = new Date(entry.workStartTime);
        if (period === 'week') {
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            return entryDate >= weekAgo;
        } else if (period === 'month') {
            return entryDate.getMonth() === now.getMonth() &&
                   entryDate.getFullYear() === now.getFullYear();
        } else if (period === 'year') {
            return entryDate.getFullYear() === now.getFullYear();
        }
        return true; // 'all'
    });

    // Filter by category if not 'all'
    if (categoryId !== 'all') {
        filtered = filtered.filter(entry => entry.categoryId === categoryId);
    }

    const totalWorkMs = filtered.reduce((sum, e) => sum + (e.totalWorkTimeMs || 0), 0);
    const totalBreakMs = filtered.reduce((sum, e) => sum + (e.totalBreakTimeMs || 0), 0);
    const avgWorkMs = filtered.length > 0 ? totalWorkMs / filtered.length : 0;
    const standardMs = filtered.length * settings.dailyNorm * 60 * 60 * 1000;
    const overtime = totalWorkMs - standardMs;

    // Calculate category breakdown for "all" view
    const categoryBreakdown = {};
    if (categoryId === 'all') {
        filtered.forEach(entry => {
            const catId = entry.categoryId || 'default';
            if (!categoryBreakdown[catId]) {
                categoryBreakdown[catId] = {
                    id: catId,
                    name: entry.categoryName || 'Ogólne',
                    color: entry.categoryColor || '#6366f1',
                    totalMs: 0,
                    count: 0
                };
            }
            categoryBreakdown[catId].totalMs += entry.totalWorkTimeMs || 0;
            categoryBreakdown[catId].count++;
        });
    }

    return {
        daysWorked: filtered.length,
        totalWorkTimeMs: totalWorkMs,
        totalWorkTime: formatDurationReadable(totalWorkMs),
        totalBreakTimeMs: totalBreakMs,
        totalBreakTime: formatDurationReadable(totalBreakMs),
        avgWorkTimeMs: avgWorkMs,
        avgWorkTime: formatDurationReadable(avgWorkMs),
        overtimeMs: overtime,
        overtime: formatDurationReadable(Math.abs(overtime)),
        isOvertime: overtime > 0,
        categoryBreakdown: categoryBreakdown,
        showAllCategories: categoryId === 'all',
        dailyData: filtered.map(e => ({
            date: new Date(e.workStartTime),
            workMs: e.totalWorkTimeMs || 0,
            breakMs: e.totalBreakTimeMs || 0,
            categoryId: e.categoryId || 'default',
            categoryName: e.categoryName || 'Ogólne',
            categoryColor: e.categoryColor || '#6366f1'
        })).reverse() // chronological order
    };
}

function renderStatsCategorySelect() {
    if (!elements.statsCategory) return;

    elements.statsCategory.innerHTML = '<option value="all">Wszystkie kategorie</option>' +
        categories.map(c =>
            `<option value="${c.id}" ${c.id === statsState.categoryId ? 'selected' : ''}>${c.name}</option>`
        ).join('');
}

function renderStatistics(period = 'month', categoryId = 'all') {
    statsState.period = period;
    statsState.categoryId = categoryId;

    const stats = calculateStatistics(period, categoryId);

    if (elements.statsDaysWorked) {
        elements.statsDaysWorked.textContent = stats.daysWorked;
    }
    if (elements.statsTotalWork) {
        elements.statsTotalWork.textContent = stats.totalWorkTime;
    }
    if (elements.statsAvgWork) {
        elements.statsAvgWork.textContent = stats.avgWorkTime;
    }
    if (elements.statsTotalBreak) {
        elements.statsTotalBreak.textContent = stats.totalBreakTime;
    }
    if (elements.statsOvertime) {
        elements.statsOvertime.textContent = (stats.isOvertime ? '+' : '-') + stats.overtime;
    }
    if (elements.statsOvertimeCard) {
        elements.statsOvertimeCard.classList.toggle('overtime-positive', stats.isOvertime);
        elements.statsOvertimeCard.classList.toggle('overtime-negative', !stats.isOvertime);
    }

    renderStatsChart(stats.dailyData, stats.showAllCategories, stats.categoryBreakdown);
}

function renderStatsChart(dailyData, showAllCategories = false, categoryBreakdown = {}) {
    if (!elements.statsChart) return;

    if (dailyData.length === 0) {
        elements.statsChart.innerHTML = '<p class="no-data-message">Brak danych do wyświetlenia</p>';
        return;
    }

    const maxMs = Math.max(...dailyData.map(d => d.workMs), settings.dailyNorm * 60 * 60 * 1000);
    const normMs = settings.dailyNorm * 60 * 60 * 1000;

    const barsHtml = dailyData.slice(-14).map(d => {
        const heightPercent = (d.workMs / maxMs) * 100;
        const normPercent = (normMs / maxMs) * 100;
        const dayName = d.date.toLocaleDateString('pl-PL', { weekday: 'short' });
        const dayNum = d.date.getDate();
        const hours = (d.workMs / (1000 * 60 * 60)).toFixed(1);
        const isOverNorm = d.workMs > normMs;

        // Use category color when showing all categories
        const barColor = showAllCategories ? d.categoryColor : '';
        const barStyle = barColor ? `background: ${barColor};` : '';

        return `
            <div class="chart-bar-container">
                <div class="chart-bar ${isOverNorm && !showAllCategories ? 'over-norm' : ''}" style="height: ${heightPercent}%; ${barStyle}" title="${d.categoryName}">
                    <span class="chart-bar-value">${hours}h</span>
                </div>
                <div class="chart-norm-line" style="bottom: ${normPercent}%"></div>
                <div class="chart-label">${dayNum}<br>${dayName}</div>
            </div>
        `;
    }).join('');

    // Build legend based on view mode
    let legendHtml = '';
    if (showAllCategories && Object.keys(categoryBreakdown).length > 0) {
        // Show category legend with totals
        const categoryLegendItems = Object.values(categoryBreakdown).map(cat => `
            <span class="legend-item">
                <span class="legend-color" style="background: ${cat.color}"></span>
                ${cat.name} (${formatDurationReadable(cat.totalMs)})
            </span>
        `).join('');

        legendHtml = `
            <div class="chart-legend chart-legend-categories">
                ${categoryLegendItems}
            </div>
            <div class="chart-legend">
                <span class="legend-item"><span class="legend-color norm"></span>Norma (${settings.dailyNorm}h)</span>
            </div>
        `;
    } else {
        legendHtml = `
            <div class="chart-legend">
                <span class="legend-item"><span class="legend-color norm"></span>Norma (${settings.dailyNorm}h)</span>
                <span class="legend-item"><span class="legend-color over"></span>Nadgodziny</span>
            </div>
        `;
    }

    elements.statsChart.innerHTML = `
        <div class="chart-container">
            ${barsHtml}
        </div>
        ${legendHtml}
    `;
}

// ===== BREAK REMINDER FUNCTIONS =====
function scheduleBreakReminder() {
    clearBreakReminder();

    if (!settings.breakReminderEnabled || !state.isWorking || state.isOnBreak) {
        return;
    }

    const intervalMs = settings.breakReminderInterval * 60 * 1000;
    const now = Date.now();

    // Calculate when the last break ended or work started
    let lastBreakEnd = state.workStartTime;
    if (state.breaks.length > 0) {
        lastBreakEnd = Math.max(...state.breaks.map(b => b.end));
    }

    const timeSinceBreak = now - lastBreakEnd;
    const timeUntilReminder = intervalMs - timeSinceBreak;

    if (timeUntilReminder <= 0) {
        // Should remind now
        showBreakReminder();
    } else {
        // Schedule for later
        state.breakReminderTimeout = setTimeout(showBreakReminder, timeUntilReminder);
    }
}

function clearBreakReminder() {
    if (state.breakReminderTimeout) {
        clearTimeout(state.breakReminderTimeout);
        state.breakReminderTimeout = null;
    }
}

function showBreakReminder() {
    if (!state.isWorking || state.isOnBreak) return;

    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Elmar - Przypomnienie', {
            body: 'Czas na przerwę! Pracujesz już ' + settings.breakReminderInterval + ' minut.',
            icon: 'icon-192.png',
            tag: 'break-reminder'
        });
    }

    // Also show in-app toast
    showToast('Czas na przerwę! Pracujesz już ' + settings.breakReminderInterval + ' minut.', 'warning');

    // Schedule next reminder
    state.lastBreakReminder = Date.now();
    saveState();
    scheduleBreakReminder();
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ===== HISTORY FUNCTIONS =====
function getHistory() {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function saveToHistory(entry) {
    const history = getHistory();
    history.unshift(entry);
    if (history.length > 100) {
        history.pop();
    }
    saveHistory(history);
}

function updateHistoryEntry(index, updatedEntry) {
    const history = getHistory();
    if (index >= 0 && index < history.length) {
        history[index] = updatedEntry;
        saveHistory(history);
    }
}

function deleteFromHistory(index) {
    const history = getHistory();
    history.splice(index, 1);
    saveHistory(history);
    selectionState.selectedIndices.delete(index);
    // Adjust indices
    const newSelected = new Set();
    selectionState.selectedIndices.forEach(i => {
        if (i > index) {
            newSelected.add(i - 1);
        } else {
            newSelected.add(i);
        }
    });
    selectionState.selectedIndices = newSelected;
    renderHistory();
}

// ===== SELECTION FUNCTIONS =====
function updateSelectionUI() {
    const count = selectionState.selectedIndices.size;
    elements.selectedCount.textContent = `Wybrano: ${count}`;
    elements.exportExcelBtn.disabled = count === 0;

    const history = getHistory();
    elements.selectAllCheckbox.checked = count > 0 && count === history.length;
    elements.selectAllCheckbox.indeterminate = count > 0 && count < history.length;
}

function toggleSelection(index) {
    if (selectionState.selectedIndices.has(index)) {
        selectionState.selectedIndices.delete(index);
    } else {
        selectionState.selectedIndices.add(index);
    }
    updateSelectionUI();
}

function selectAll() {
    const history = getHistory();
    if (selectionState.selectedIndices.size === history.length) {
        // Deselect all
        selectionState.selectedIndices.clear();
    } else {
        // Select all
        history.forEach((_, index) => {
            selectionState.selectedIndices.add(index);
        });
    }
    renderHistory();
}

function renderHistory() {
    const history = getHistory();

    if (history.length === 0) {
        elements.emptyHistory.style.display = 'block';
        elements.exportPanel.style.display = 'none';
        const items = elements.historyList.querySelectorAll('.history-item-wrapper');
        items.forEach(item => item.remove());
        return;
    }

    elements.emptyHistory.style.display = 'none';
    elements.exportPanel.style.display = 'flex';

    const existingItems = elements.historyList.querySelectorAll('.history-item-wrapper');
    existingItems.forEach(item => item.remove());

    history.forEach((entry, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'history-item-wrapper';

        const dateObj = new Date(entry.workStartTime);
        const dateStr = dateObj.toLocaleDateString('pl-PL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Modified info
        let modifiedHtml = '';
        if (entry.modifiedAt) {
            const modDate = new Date(entry.modifiedAt);
            const modDateStr = modDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
            const modTimeStr = modDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            modifiedHtml = `
                <div class="history-item-modified">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modyfikowano: ${modDateStr}, ${modTimeStr}
                </div>
            `;
        }

        const isChecked = selectionState.selectedIndices.has(index);

        // Category badge
        const categoryColor = entry.categoryColor || '#6366f1';
        const categoryName = entry.categoryName || 'Ogólne';

        // Note preview
        const notePreview = entry.note ? `
            <div class="history-item-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                ${entry.note.length > 50 ? entry.note.substring(0, 50) + '...' : entry.note}
            </div>
        ` : '';

        wrapper.innerHTML = `
            <div class="history-item-checkbox">
                <label class="checkbox-container">
                    <input type="checkbox" class="item-checkbox" data-index="${index}" ${isChecked ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
            </div>
            <div class="history-item-content">
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-item-title">
                            <span class="history-item-date">${dateStr}</span>
                            <span class="history-item-category" style="background: ${categoryColor}">${categoryName}</span>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <span class="history-item-total">${entry.totalWorkTime}</span>
                            <button class="history-edit-btn" data-index="${index}" title="Edytuj">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="history-delete-btn" data-index="${index}" title="Usuń">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="history-item-details">
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            ${entry.startTime} - ${entry.endTime}
                        </span>
                        ${entry.breaksCount > 0 ? `
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="6" y="4" width="4" height="16"/>
                                <rect x="14" y="4" width="4" height="16"/>
                            </svg>
                            ${entry.breaksCount} ${entry.breaksCount === 1 ? 'przerwa' : (entry.breaksCount < 5 ? 'przerwy' : 'przerw')} (${entry.totalBreakTime})
                        </span>
                        ` : ''}
                    </div>
                    ${notePreview}
                    ${modifiedHtml}
                </div>
            </div>
        `;

        elements.historyList.appendChild(wrapper);
    });

    // Add checkbox listeners
    const checkboxes = elements.historyList.querySelectorAll('.item-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const index = parseInt(checkbox.dataset.index);
            toggleSelection(index);
            // Update just this checkbox visual
            checkbox.checked = selectionState.selectedIndices.has(index);
        });
    });

    // Add edit button listeners
    const editButtons = elements.historyList.querySelectorAll('.history-edit-btn');
    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            openEditModal(index);
        });
    });

    // Add delete button listeners
    const deleteButtons = elements.historyList.querySelectorAll('.history-delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(btn.dataset.index);
            if (confirm('Czy na pewno chcesz usunąć ten wpis?')) {
                deleteFromHistory(index);
            }
        });
    });

    updateSelectionUI();
}

// ===== EXCEL EXPORT FUNCTIONS =====
function formatDateForExcel(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatBreaksForExcel(breaks) {
    if (!breaks || breaks.length === 0) return '-';
    return breaks.map(b => {
        const start = new Date(b.start).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        const end = new Date(b.end).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        return `${start}-${end}`;
    }).join(', ');
}

function msToDecimalHours(ms) {
    return (ms / (1000 * 60 * 60)).toFixed(2);
}

function exportToExcel() {
    const history = getHistory();
    const selectedEntries = [];

    // Get selected entries in chronological order (oldest first)
    const sortedIndices = Array.from(selectionState.selectedIndices).sort((a, b) => b - a);
    sortedIndices.forEach(index => {
        if (history[index]) {
            selectedEntries.push(history[index]);
        }
    });

    if (selectedEntries.length === 0) {
        alert('Nie wybrano żadnych wpisów do eksportu.');
        return;
    }

    // Calculate totals
    let totalWorkMs = 0;
    let totalBreakMs = 0;

    selectedEntries.forEach(entry => {
        totalWorkMs += entry.totalWorkTimeMs || 0;
        totalBreakMs += entry.totalBreakTimeMs || 0;
    });

    // Create CSV content with BOM for Excel to recognize UTF-8
    const BOM = '\uFEFF';
    let csvContent = BOM;

    // Title
    csvContent += 'EWIDENCJA CZASU PRACY - ELMAR\n';
    csvContent += `Data eksportu: ${new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}\n`;
    csvContent += '\n';

    // Headers
    csvContent += 'Data;Dzień tygodnia;Rozpoczęcie;Zakończenie;Przerwy;Czas przerw;Czas pracy\n';

    // Data rows
    selectedEntries.forEach(entry => {
        const date = new Date(entry.workStartTime);
        const dateStr = formatDateForExcel(entry.workStartTime);
        const dayName = date.toLocaleDateString('pl-PL', { weekday: 'long' });
        const breaksStr = formatBreaksForExcel(entry.breaks);
        const breakTime = entry.totalBreakTime || '0m';
        const workTime = entry.totalWorkTime || '0m';

        csvContent += `${dateStr};${dayName};${entry.startTime};${entry.endTime};${breaksStr};${breakTime};${workTime}\n`;
    });

    // Empty row
    csvContent += '\n';

    // Summary
    csvContent += 'PODSUMOWANIE\n';
    csvContent += `Liczba dni;${selectedEntries.length}\n`;
    csvContent += `Łączny czas pracy;${formatDurationReadable(totalWorkMs)}\n`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const today = new Date();
    const fileName = `Ewidencja_Elmar_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ===== EDIT MODAL FUNCTIONS =====
function openEditModal(index) {
    const history = getHistory();
    const entry = history[index];

    if (!entry) return;

    editState.editingIndex = index;

    // Set date
    const dateObj = new Date(entry.workStartTime);
    const dateStr = dateObj.toISOString().split('T')[0];
    elements.editDate.value = dateStr;

    // Set times
    elements.editStartTime.value = entry.startTime;
    elements.editEndTime.value = entry.endTime;

    // Set note
    if (elements.editNote) {
        elements.editNote.value = entry.note || '';
    }

    // Set category
    if (elements.editCategory) {
        renderCategoriesSelect(elements.editCategory, entry.categoryId || 'default');
    }

    // Set breaks
    editState.editBreaks = entry.breaks ? entry.breaks.map(b => ({
        start: new Date(b.start),
        end: new Date(b.end)
    })) : [];

    renderEditBreaks();

    elements.editModal.classList.add('active');
}

function closeEditModal() {
    elements.editModal.classList.remove('active');
    editState.editingIndex = null;
    editState.editBreaks = [];
}

function renderEditBreaks() {
    if (editState.editBreaks.length === 0) {
        elements.editBreaksList.innerHTML = '<p class="no-breaks-message">Brak przerw</p>';
        return;
    }

    elements.editBreaksList.innerHTML = editState.editBreaks.map((breakItem, index) => {
        const startTime = breakItem.start.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        const endTime = breakItem.end.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="edit-break-item" data-index="${index}">
                <input type="time" class="break-start-input" value="${startTime}" data-index="${index}">
                <span>-</span>
                <input type="time" class="break-end-input" value="${endTime}" data-index="${index}">
                <button class="remove-break-btn" data-index="${index}" title="Usuń przerwę">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');

    // Add listeners for break inputs
    const startInputs = elements.editBreaksList.querySelectorAll('.break-start-input');
    const endInputs = elements.editBreaksList.querySelectorAll('.break-end-input');
    const removeButtons = elements.editBreaksList.querySelectorAll('.remove-break-btn');

    startInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const [hours, minutes] = e.target.value.split(':').map(Number);
            const newDate = new Date(editState.editBreaks[index].start);
            newDate.setHours(hours, minutes, 0, 0);
            editState.editBreaks[index].start = newDate;
        });
    });

    endInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const [hours, minutes] = e.target.value.split(':').map(Number);
            const newDate = new Date(editState.editBreaks[index].end);
            newDate.setHours(hours, minutes, 0, 0);
            editState.editBreaks[index].end = newDate;
        });
    });

    removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            editState.editBreaks.splice(index, 1);
            renderEditBreaks();
        });
    });
}

function addNewBreak() {
    const dateStr = elements.editDate.value;
    const baseDate = new Date(dateStr);

    const startTime = new Date(baseDate);
    startTime.setHours(12, 0, 0, 0);

    const endTime = new Date(baseDate);
    endTime.setHours(12, 30, 0, 0);

    editState.editBreaks.push({
        start: startTime,
        end: endTime
    });

    renderEditBreaks();
}

function saveEdit() {
    const history = getHistory();
    const index = editState.editingIndex;

    if (index === null || index < 0 || index >= history.length) {
        closeEditModal();
        return;
    }

    const entry = history[index];

    const dateStr = elements.editDate.value;
    const [year, month, day] = dateStr.split('-').map(Number);

    const [startHours, startMinutes] = elements.editStartTime.value.split(':').map(Number);
    const newStartTime = new Date(year, month - 1, day, startHours, startMinutes, 0, 0);

    const [endHours, endMinutes] = elements.editEndTime.value.split(':').map(Number);
    const newEndTime = new Date(year, month - 1, day, endHours, endMinutes, 0, 0);

    const updatedBreaks = editState.editBreaks.map(b => {
        const breakStart = new Date(year, month - 1, day,
            b.start.getHours(), b.start.getMinutes(), 0, 0);
        const breakEnd = new Date(year, month - 1, day,
            b.end.getHours(), b.end.getMinutes(), 0, 0);
        return {
            start: breakStart.getTime(),
            end: breakEnd.getTime()
        };
    });

    const totalBreakTimeMs = updatedBreaks.reduce((total, b) => {
        return total + (b.end - b.start);
    }, 0);

    const totalTimeMs = newEndTime.getTime() - newStartTime.getTime();
    const totalWorkTimeMs = totalTimeMs - totalBreakTimeMs;

    // Get note and category
    const note = elements.editNote ? elements.editNote.value : (entry.note || '');
    const categoryId = elements.editCategory ? elements.editCategory.value : (entry.categoryId || 'default');
    const category = getCategoryById(categoryId);

    const updatedEntry = {
        ...entry,
        workStartTime: newStartTime.getTime(),
        workEndTime: newEndTime.getTime(),
        startTime: formatTime(newStartTime),
        endTime: formatTime(newEndTime),
        breaks: updatedBreaks,
        breaksCount: updatedBreaks.length,
        totalBreakTime: formatDurationReadable(totalBreakTimeMs),
        totalBreakTimeMs: totalBreakTimeMs,
        totalWorkTime: formatDurationReadable(totalWorkTimeMs),
        totalWorkTimeMs: totalWorkTimeMs,
        note: note,
        categoryId: categoryId,
        categoryName: category.name,
        categoryColor: category.color,
        modifiedAt: Date.now()
    };

    updateHistoryEntry(index, updatedEntry);
    closeEditModal();
    renderHistory();
}

// ===== UTILITY FUNCTIONS =====
function formatTime(date) {
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pl-PL', options);
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
    };
}

function formatDurationReadable(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function calculateTotalBreakTime() {
    return state.breaks.reduce((total, breakItem) => {
        return total + (breakItem.end - breakItem.start);
    }, 0);
}

function calculateWorkTime() {
    if (!state.workStartTime) return 0;

    const now = Date.now();
    const endTime = state.workEndTime || now;
    const totalElapsed = endTime - state.workStartTime;
    const completedBreaksTime = calculateTotalBreakTime();

    let currentBreakTime = 0;
    if (state.isOnBreak && state.currentBreakStart) {
        currentBreakTime = now - state.currentBreakStart;
    }

    return Math.max(0, totalElapsed - completedBreaksTime - currentBreakTime);
}

// ===== SCREEN MANAGEMENT =====
function showScreen(screen) {
    elements.welcomeScreen.classList.remove('active');
    elements.timerScreen.classList.remove('active');
    elements.summaryScreen.classList.remove('active');
    elements.historyScreen.classList.remove('active');
    if (elements.statsScreen) {
        elements.statsScreen.classList.remove('active');
    }
    screen.classList.add('active');

    // Update start button when showing welcome screen
    if (screen === elements.welcomeScreen) {
        updateStartButtonState();
    }
}

// ===== TIMER FUNCTIONS =====
function updateTimerDisplay() {
    const elapsed = calculateWorkTime();
    const formatted = formatDuration(elapsed);
    elements.hours.textContent = formatted.hours;
    elements.minutes.textContent = formatted.minutes;
    elements.seconds.textContent = formatted.seconds;
}

function updateBreakTimerDisplay() {
    if (!state.isOnBreak || !state.currentBreakStart) return;

    const elapsed = Date.now() - state.currentBreakStart;
    const formatted = formatDuration(elapsed);
    elements.breakHours.textContent = formatted.hours;
    elements.breakMinutes.textContent = formatted.minutes;
    elements.breakSeconds.textContent = formatted.seconds;
}

function startTimers() {
    stopTimers();

    state.timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();

    if (state.isOnBreak) {
        state.breakTimerInterval = setInterval(updateBreakTimerDisplay, 1000);
        updateBreakTimerDisplay();
    }
}

function stopTimers() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    if (state.breakTimerInterval) {
        clearInterval(state.breakTimerInterval);
        state.breakTimerInterval = null;
    }
}

// ===== STATUS FUNCTIONS =====
function updateStatus(status, text) {
    elements.statusIndicator.className = 'status-indicator';
    if (status) {
        elements.statusIndicator.classList.add(status);
    }
    elements.statusText.textContent = text;
}

// ===== BREAKS LIST =====
function updateBreaksList() {
    if (state.breaks.length === 0) {
        elements.breaksList.style.display = 'none';
        return;
    }

    elements.breaksList.style.display = 'block';
    elements.breaksContainer.innerHTML = state.breaks.map((breakItem, index) => `
        <div class="break-item">
            <span class="break-time">
                ${formatTime(new Date(breakItem.start))} - ${formatTime(new Date(breakItem.end))}
            </span>
            <span class="break-duration">
                ${formatDurationReadable(breakItem.end - breakItem.start)}
            </span>
        </div>
    `).join('');
}

// ===== UI STATE UPDATE =====
function updateUIForWorkState() {
    showScreen(elements.timerScreen);

    if (state.workStartTime) {
        elements.workStartDisplay.textContent = formatTime(new Date(state.workStartTime));
    }

    if (state.isOnBreak) {
        updateStatus('break', 'Na przerwie');
        elements.timerLabel.textContent = 'Przerwa';
        elements.startBreakBtn.disabled = true;
        elements.endBreakBtn.disabled = false;
        elements.breakTimerSection.style.display = 'block';
    } else {
        updateStatus('working', 'W pracy');
        elements.timerLabel.textContent = 'Czas pracy';
        elements.startBreakBtn.disabled = false;
        elements.endBreakBtn.disabled = true;
        elements.breakTimerSection.style.display = 'none';
    }

    updateBreaksList();
    startTimers();
}

// ===== WORK CONTROLS =====
function startWork() {
    // If already working, just go back to timer screen
    if (state.isWorking) {
        updateUIForWorkState();
        return;
    }

    state.isWorking = true;
    state.workStartTime = Date.now();
    state.workEndTime = null;
    state.currentBreakStart = null;
    state.breaks = [];
    state.isOnBreak = false;
    state.note = '';
    state.categoryId = elements.workCategory ? elements.workCategory.value : 'default';
    state.lastBreakReminder = null;

    saveState();
    updateUIForWorkState();
    scheduleBreakReminder();
    requestNotificationPermission();
}

function updateStartButtonState() {
    if (!elements.startWorkBtn) return;

    if (state.isWorking) {
        elements.startWorkBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
            </svg>
            <span>Kontynuuj pracę</span>
        `;
        elements.startWorkBtn.classList.remove('btn-success');
        elements.startWorkBtn.classList.add('btn-primary');
    } else {
        elements.startWorkBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
            </svg>
            <span>Rozpocznij pracę</span>
        `;
        elements.startWorkBtn.classList.remove('btn-primary');
        elements.startWorkBtn.classList.add('btn-success');
    }
}

function endWork() {
    if (state.isOnBreak && state.currentBreakStart) {
        state.breaks.push({
            start: state.currentBreakStart,
            end: Date.now()
        });
        state.isOnBreak = false;
        state.currentBreakStart = null;
    }

    state.isWorking = false;
    state.workEndTime = Date.now();

    stopTimers();
    clearBreakReminder();

    // Get note from input if available
    if (elements.workNote) {
        state.note = elements.workNote.value || '';
    }

    const totalWorkTime = calculateWorkTime();
    const category = getCategoryById(state.categoryId);

    const historyEntry = {
        workStartTime: state.workStartTime,
        workEndTime: state.workEndTime,
        startTime: formatTime(new Date(state.workStartTime)),
        endTime: formatTime(new Date(state.workEndTime)),
        totalWorkTime: formatDurationReadable(totalWorkTime),
        totalWorkTimeMs: totalWorkTime,
        breaks: state.breaks,
        breaksCount: state.breaks.length,
        totalBreakTime: formatDurationReadable(calculateTotalBreakTime()),
        totalBreakTimeMs: calculateTotalBreakTime(),
        note: state.note,
        categoryId: state.categoryId,
        categoryName: category.name,
        categoryColor: category.color
    };
    saveToHistory(historyEntry);

    clearState();

    showSummary();
}

// ===== BREAK CONTROLS =====
function startBreak() {
    state.isOnBreak = true;
    state.currentBreakStart = Date.now();

    updateStatus('break', 'Na przerwie');
    elements.timerLabel.textContent = 'Przerwa';

    elements.startBreakBtn.disabled = true;
    elements.endBreakBtn.disabled = false;

    elements.breakTimerSection.style.display = 'block';
    elements.breakHours.textContent = '00';
    elements.breakMinutes.textContent = '00';
    elements.breakSeconds.textContent = '00';

    state.breakTimerInterval = setInterval(updateBreakTimerDisplay, 1000);

    clearBreakReminder();
    saveState();
}

function endBreak() {
    state.isOnBreak = false;
    const breakEnd = Date.now();

    state.breaks.push({
        start: state.currentBreakStart,
        end: breakEnd
    });

    state.currentBreakStart = null;

    updateStatus('working', 'W pracy');
    elements.timerLabel.textContent = 'Czas pracy';

    elements.startBreakBtn.disabled = false;
    elements.endBreakBtn.disabled = true;

    elements.breakTimerSection.style.display = 'none';

    if (state.breakTimerInterval) {
        clearInterval(state.breakTimerInterval);
        state.breakTimerInterval = null;
    }

    updateBreaksList();
    saveState();
    scheduleBreakReminder();
}

// ===== SUMMARY =====
function showSummary() {
    const history = getHistory();
    const latestEntry = history[0];

    if (latestEntry) {
        elements.summaryDate.textContent = formatDate(new Date(latestEntry.workStartTime));
        elements.summaryStartTime.textContent = latestEntry.startTime;
        elements.summaryEndTime.textContent = latestEntry.endTime;
        elements.summaryTotalTime.textContent = latestEntry.totalWorkTime;

        if (latestEntry.breaks && latestEntry.breaks.length > 0) {
            elements.summaryBreaks.style.display = 'block';
            elements.summaryBreaksList.innerHTML = latestEntry.breaks.map(breakItem => `
                <div class="break-item">
                    <span class="break-time">
                        ${formatTime(new Date(breakItem.start))} - ${formatTime(new Date(breakItem.end))}
                    </span>
                    <span class="break-duration">
                        ${formatDurationReadable(breakItem.end - breakItem.start)}
                    </span>
                </div>
            `).join('');
            elements.summaryTotalBreak.textContent = latestEntry.totalBreakTime;
        } else {
            elements.summaryBreaks.style.display = 'none';
        }
    }

    showScreen(elements.summaryScreen);
}

function resetApp() {
    stopTimers();
    clearBreakReminder();

    state.isWorking = false;
    state.isOnBreak = false;
    state.workStartTime = null;
    state.workEndTime = null;
    state.currentBreakStart = null;
    state.breaks = [];
    state.note = '';
    state.categoryId = 'default';

    clearState();

    elements.hours.textContent = '00';
    elements.minutes.textContent = '00';
    elements.seconds.textContent = '00';

    elements.breakTimerSection.style.display = 'none';
    elements.breaksList.style.display = 'none';

    // Reset note and category inputs
    if (elements.workNote) {
        elements.workNote.value = '';
    }
    if (elements.workCategory) {
        renderCategoriesSelect(elements.workCategory, 'default');
    }

    updateDates();
    updateStartButtonState();

    showScreen(elements.welcomeScreen);
}

// ===== DATE UPDATES =====
function updateDates() {
    const now = new Date();
    const dateStr = formatDate(now);

    elements.welcomeDate.textContent = dateStr;
    elements.currentDate.textContent = dateStr;
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    elements.startWorkBtn.addEventListener('click', startWork);
    elements.endWorkBtn.addEventListener('click', endWork);
    elements.startBreakBtn.addEventListener('click', startBreak);
    elements.endBreakBtn.addEventListener('click', endBreak);
    elements.newDayBtn.addEventListener('click', resetApp);

    elements.showHistoryBtn.addEventListener('click', () => {
        selectionState.selectedIndices.clear();
        renderHistory();
        showScreen(elements.historyScreen);
    });

    elements.backFromHistoryBtn.addEventListener('click', () => {
        showScreen(elements.welcomeScreen);
    });

    // Export events
    elements.selectAllCheckbox.addEventListener('change', selectAll);
    elements.exportExcelBtn.addEventListener('click', exportToExcel);

    // Modal events
    elements.closeModalBtn.addEventListener('click', closeEditModal);
    elements.cancelEditBtn.addEventListener('click', closeEditModal);
    elements.saveEditBtn.addEventListener('click', saveEdit);
    elements.addBreakBtn.addEventListener('click', addNewBreak);

    // Close modal on backdrop click
    elements.editModal.querySelector('.modal-backdrop').addEventListener('click', closeEditModal);

    // Stats screen events
    if (elements.showStatsBtn) {
        elements.showStatsBtn.addEventListener('click', () => {
            statsState.period = 'month';
            statsState.categoryId = 'all';
            // Reset period buttons
            elements.statsPeriodBtns.forEach(b => b.classList.remove('active'));
            const monthBtn = document.querySelector('.period-btn[data-period="month"]');
            if (monthBtn) monthBtn.classList.add('active');
            // Populate and reset category selector
            renderStatsCategorySelect();
            if (elements.statsCategory) {
                elements.statsCategory.value = 'all';
            }
            renderStatistics('month', 'all');
            showScreen(elements.statsScreen);
        });
    }

    if (elements.backFromStatsBtn) {
        elements.backFromStatsBtn.addEventListener('click', () => {
            showScreen(elements.welcomeScreen);
        });
    }

    // Stats period buttons
    if (elements.statsPeriodBtns) {
        elements.statsPeriodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.statsPeriodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderStatistics(btn.dataset.period, statsState.categoryId);
            });
        });
    }

    // Stats category selector
    if (elements.statsCategory) {
        elements.statsCategory.addEventListener('change', () => {
            renderStatistics(statsState.period, elements.statsCategory.value);
        });
    }

    // JSON Import/Export
    if (elements.exportJsonBtn) {
        elements.exportJsonBtn.addEventListener('click', exportDatabaseJSON);
    }

    if (elements.importJsonInput) {
        elements.importJsonInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await importDatabaseJSON(file);
                    renderHistory();
                    renderCategoriesSelect(elements.workCategory, state.categoryId);
                } catch (err) {
                    console.error('Import error:', err);
                }
                e.target.value = ''; // Reset input
            }
        });
    }

    // Settings modal
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', openSettingsModal);
    }

    if (elements.closeSettingsBtn) {
        elements.closeSettingsBtn.addEventListener('click', closeSettingsModal);
    }

    if (elements.saveSettingsBtn) {
        elements.saveSettingsBtn.addEventListener('click', saveSettingsFromModal);
    }

    if (elements.settingsModal) {
        const backdrop = elements.settingsModal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', closeSettingsModal);
        }
    }

    // Add category button
    if (elements.addCategoryBtn) {
        elements.addCategoryBtn.addEventListener('click', () => {
            const name = prompt('Nazwa kategorii:');
            if (name && name.trim()) {
                const color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                addCategory(name.trim(), color);
                renderCategoriesList();
                renderCategoriesSelect(elements.workCategory, state.categoryId);
                renderCategoriesSelect(elements.editCategory);
            }
        });
    }

    // Work note auto-save
    if (elements.workNote) {
        elements.workNote.addEventListener('input', () => {
            state.note = elements.workNote.value;
            saveState();
        });
    }

    // Work category change
    if (elements.workCategory) {
        elements.workCategory.addEventListener('change', () => {
            state.categoryId = elements.workCategory.value;
            saveState();
        });
    }

    // Back from timer button (allows navigation while working)
    if (elements.backFromTimerBtn) {
        elements.backFromTimerBtn.addEventListener('click', () => {
            // Don't stop work, just go to welcome screen
            showScreen(elements.welcomeScreen);
        });
    }
}

// ===== SETTINGS MODAL FUNCTIONS =====
function openSettingsModal() {
    if (!elements.settingsModal) return;

    if (elements.settingsDailyNorm) {
        elements.settingsDailyNorm.value = settings.dailyNorm;
    }
    if (elements.settingsBreakReminder) {
        elements.settingsBreakReminder.value = settings.breakReminderInterval;
    }
    if (elements.settingsBreakReminderEnabled) {
        elements.settingsBreakReminderEnabled.checked = settings.breakReminderEnabled;
    }

    renderCategoriesList();
    elements.settingsModal.classList.add('active');
}

function closeSettingsModal() {
    if (elements.settingsModal) {
        elements.settingsModal.classList.remove('active');
    }
}

function saveSettingsFromModal() {
    if (elements.settingsDailyNorm) {
        settings.dailyNorm = parseFloat(elements.settingsDailyNorm.value) || 8;
    }
    if (elements.settingsBreakReminder) {
        settings.breakReminderInterval = parseInt(elements.settingsBreakReminder.value) || 120;
    }
    if (elements.settingsBreakReminderEnabled) {
        settings.breakReminderEnabled = elements.settingsBreakReminderEnabled.checked;
    }

    saveSettings();
    closeSettingsModal();
    showToast('Ustawienia zapisane!', 'success');

    // Reschedule break reminder if working
    if (state.isWorking) {
        scheduleBreakReminder();
    }
}

// ===== RESTORE SESSION =====
function restoreSession() {
    const hasState = loadState();

    if (hasState && state.isWorking && state.workStartTime) {
        const savedDate = new Date(state.workStartTime).toDateString();
        const today = new Date().toDateString();

        if (savedDate === today) {
            // Restore note and category to UI
            if (elements.workNote) {
                elements.workNote.value = state.note || '';
            }
            if (elements.workCategory) {
                renderCategoriesSelect(elements.workCategory, state.categoryId);
            }

            updateUIForWorkState();
            scheduleBreakReminder();
            return true;
        } else {
            clearState();
            state.isWorking = false;
            state.isOnBreak = false;
            state.workStartTime = null;
            state.workEndTime = null;
            state.currentBreakStart = null;
            state.breaks = [];
            state.note = '';
            state.categoryId = 'default';
        }
    }

    return false;
}

// ===== SPLASH SCREEN =====
function hideSplashScreen() {
    if (elements.splashScreen) {
        elements.splashScreen.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => {
            elements.splashScreen.style.display = 'none';
        }, 500);
    }
}

// ===== INITIALIZATION =====
function init() {
    // Load settings and categories
    loadSettings();
    loadCategories();

    updateDates();
    initEventListeners();

    // Initialize category selects
    renderCategoriesSelect(elements.workCategory, state.categoryId);

    const restored = restoreSession();

    if (!restored) {
        showScreen(elements.welcomeScreen);
    }

    setInterval(updateDates, 60000);

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }

    // Hide splash screen after animation completes (2s progress bar + small delay)
    setTimeout(hideSplashScreen, 2200);
}

document.addEventListener('DOMContentLoaded', init);
