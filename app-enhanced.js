// ========================================
// BANK SULSELBAR DASHBOARD - ENHANCED APP
// Version 2.0 - Complete & Professional
// ========================================

// Color Palette
const COLORS = {
    primary: '#001e51',
    secondary: '#8ac01e',
    accent: '#a8d563',
    accentDark: '#6fa015',
    navyLight: '#0a3a7a',
    navyDark: '#001233',

    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',

    blue: '#3b82f6',
    purple: '#8b5cf6',
    orange: '#f97316',
    teal: '#14b8a6',
    red: '#ef4444',

    gray: '#666666',
    grayLight: '#999999',
    grayDark: '#1a1a1a'
};

// Chart instances
let charts = {};
let refreshInterval;
const REFRESH_RATE = 300000; // 5 minutes

// State management
const appState = {
    currentSection: 'overview',
    currentBusinessLine: 'konsolidasi',
    currentBranch: null,
    sidebarOpen: true,
    notificationPanelOpen: false,
    isLoading: false,
    currentMetric: null,
    currentDateRange: 'thisMonth'
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â¦ Bank Sulselbar Dashboard Enhanced - Initializing...');

    // Show loading screen
    showLoadingScreen();

    // Initialize all components
    setTimeout(() => {
        initializeSidebar();
        initializeHeader();
        initializeFilters();
        initializeNavigation();
        initializeNotifications();

        // Load initial data
        loadDashboardData().then(() => {
            hideLoadingScreen();
            showToast('Dashboard berhasil dimuat', 'success');
        });

        // Start auto-refresh
        startAutoRefresh();

        // Update timestamp
        updateTimestamp();
    }, 1000);
});

// ========================================
// LOADING SCREEN
// ========================================

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
    }
}

// ========================================
// SIDEBAR
// ========================================

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');

    // Menu toggle (for mobile)
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            appState.sidebarOpen = sidebar.classList.contains('open');
        });
    }

    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1200) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// ========================================
// HEADER
// ========================================

function initializeHeader() {
    const refreshBtn = document.getElementById('headerRefreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const notificationBell = document.getElementById('notificationBell');
    const periodSelect = document.getElementById('headerPeriodSelect');
    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('dataUploadInput');

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    if (notificationBell) {
        notificationBell.addEventListener('click', toggleNotificationPanel);
    }

    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            loadDashboardData();
        });
    }
}

function handleRefresh() {
    const btn = document.getElementById('headerRefreshBtn');
    btn.classList.add('refreshing');

    loadDashboardData().then(() => {
        btn.classList.remove('refreshing');
        showToast('Data berhasil diperbarui', 'success');
    });
}

function handleExport() {
    showToast('Fitur export akan tersedia segera', 'info');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.getElementById('fullscreenBtn').querySelector('i').className = 'fas fa-compress';
    } else {
        document.exitFullscreen();
        document.getElementById('fullscreenBtn').querySelector('i').className = 'fas fa-expand';
    }
}

// ========================================
// FILTERS
// ========================================

function initializeFilters() {
    // Business line filter buttons
    const businessLineButtons = document.querySelectorAll('.filter-btn[data-business-line]');

    businessLineButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            businessLineButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const businessLine = btn.dataset.businessLine;
            appState.currentBusinessLine = businessLine;

            console.log(`ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â¢ Business Line changed to: ${businessLine}`);
            loadDashboardData();
        });
    });
}

// ========================================
// NAVIGATION
// ========================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navigateToSection(section);
        });
    });
}

function navigateToSection(sectionName) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Convert kebab-case to camelCase for section ID
    let sectionId = sectionName;
    if (sectionName === 'konven-syariah') {
        sectionId = 'konvenSyariah';
    } else if (sectionName === 'pendapatan-biaya') {
        sectionId = 'pendapatanBiaya';
    } else if (sectionName === 'non-financial') {
        sectionId = 'nonFinancial';
    }

    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
        appState.currentSection = sectionName;

        // Update breadcrumb
        updateBreadcrumb(sectionName);

        // Load section-specific data
        loadSectionData(sectionName);
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 1200) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

function updateBreadcrumb(section) {
    const breadcrumb = document.getElementById('breadcrumbText');
    const titles = {
        overview: 'Dashboard / Overview',
        ratio: 'Dashboard / Financial Ratio',
        neraca: 'Dashboard / Neraca',
        'konven-syariah': 'Dashboard / Konven vs Syariah',
        'pendapatan-biaya': 'Dashboard / Pendapatan & Biaya',
        analytics: 'Dashboard / Analytics',
        reports: 'Dashboard / Reports',
        export: 'Dashboard / Export',
        settings: 'Dashboard / Settings',
        api: 'Dashboard / Power BI API'
    };

    if (breadcrumb) {
        breadcrumb.textContent = titles[section] || 'Dashboard';
    }
}

// ========================================
// NOTIFICATIONS
// ========================================

function initializeNotifications() {
    const closeBtn = document.getElementById('closeNotificationPanel');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNotificationPanel);
    }

    // Dismiss alerts
    document.querySelectorAll('.alert-dismiss').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.alert-card').style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                this.closest('.alert-card').remove();
            }, 300);
        });
    });
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('open');
    appState.notificationPanelOpen = panel.classList.contains('open');
}

function closeNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.remove('open');
    appState.notificationPanelOpen = false;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// DATA LOADING
// ========================================

async function loadDashboardData() {
    try {
        appState.isLoading = true;
        console.log('Loading dashboard data...');

        // Update timestamp
        updateTimestamp();

        // Update business line indicator
        updateBusinessLineIndicator();
        
        // Update quick stats based on current business line
        updateQuickStats();

        // Load current section data
        loadSectionData(appState.currentSection);

        appState.isLoading = false;
        console.log('Dashboard data loaded successfully');

    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Gagal memuat data. Silakan coba lagi.', 'error');
        appState.isLoading = false;
    }
}

// ========================================
// UPDATE QUICK STATS BASED ON BUSINESS LINE
// ========================================

function updateQuickStats() {
    if (typeof BANK_DATA === 'undefined' || typeof KONVEN_SYARIAH_DATA === 'undefined') {
        console.warn('Data not loaded yet');
        return;
    }
    
    let data = {};
    const businessLine = appState.currentBusinessLine;
    
    if (businessLine === 'konsolidasi' || businessLine === 'all') {
        // Konsolidasi - Semua data
        const perbandingan = KONVEN_SYARIAH_DATA.perbandingan;
        data = {
            aset: { value: perbandingan.asset.total, unit: 'T', change: 0.7 },
            dpk: { value: perbandingan.dpk.total, unit: 'T', change: 0.8 },
            kredit: { value: perbandingan.kredit.total, unit: 'T', change: 0.1 },
            laba: { value: perbandingan.laba.total, unit: 'M', change: 14.0 },
            pendapatan: { value: BANK_DATA.neraca.pendapatan.current, unit: 'M', change: 11.2 },
            biaya: { value: BANK_DATA.neraca.biaya.current, unit: 'M', change: 11.1 }
        };
    } else if (businessLine === 'konvensional') {
        // Konvensional only
        const perbandingan = KONVEN_SYARIAH_DATA.perbandingan;
        const ringkasan = KONVEN_SYARIAH_DATA.ringkasan.konven;
        data = {
            aset: { value: perbandingan.asset.konven, unit: 'T', change: 0.6 },
            dpk: { value: perbandingan.dpk.konven, unit: 'T', change: 0.8 },
            kredit: { value: perbandingan.kredit.konven, unit: 'T', change: 0.0 },
            laba: { value: ringkasan.labaBersih, unit: 'M', change: 13.8 },
            pendapatan: { value: KONVEN_SYARIAH_DATA.pendapatan.konven.bunga.value, unit: 'M', change: 8.5 },
            biaya: { value: KONVEN_SYARIAH_DATA.biaya.konven.bunga.value, unit: 'M', change: 5.2 }
        };
    } else if (businessLine === 'syariah') {
        // Syariah only
        const perbandingan = KONVEN_SYARIAH_DATA.perbandingan;
        const ringkasan = KONVEN_SYARIAH_DATA.ringkasan.syariah;
        data = {
            aset: { value: perbandingan.asset.syariah, unit: 'T', change: 1.2 },
            dpk: { value: perbandingan.dpk.syariah, unit: 'T', change: 1.0 },
            kredit: { value: perbandingan.kredit.syariah, unit: 'T', change: 0.8 },
            laba: { value: ringkasan.labaBersih, unit: 'M', change: 15.2 },
            pendapatan: { value: KONVEN_SYARIAH_DATA.pendapatan.syariah.imbalHasil.value, unit: 'M', change: 6.2 },
            biaya: { value: KONVEN_SYARIAH_DATA.biaya.syariah.bagiHasil.value, unit: 'M', change: 4.8 }
        };
    }
    
    // Update stat cards
    updateStatCard('asset', data.aset);
    updateStatCard('dpk', data.dpk);
    updateStatCard('kredit', data.kredit);
    updateStatCard('laba', data.laba);
    updateStatCard('pendapatan', data.pendapatan);
    updateStatCard('biaya', data.biaya);
    
    console.log('Quick stats updated for:', businessLine);
}

function updateStatCard(metric, data) {
    const card = document.querySelector(`.stat-card[data-metric="${metric}"]`);
    if (!card || !data) return;
    
    const valueEl = card.querySelector('.stat-value');
    const changeEl = card.querySelector('.stat-change span');
    
    if (valueEl) {
        let displayValue;
        if (data.unit === 'T') {
            displayValue = `Rp ${data.value.toFixed(2)} T`;
        } else if (data.unit === 'M') {
            displayValue = `Rp ${data.value.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2})} M`;
        } else {
            displayValue = `Rp ${data.value}`;
        }
        valueEl.textContent = displayValue;
    }
    
    if (changeEl) {
        changeEl.textContent = `${data.change >= 0 ? '+' : ''}${data.change.toFixed(1)}%`;
    }
}

// ========================================
// FILE UPLOAD HANDLING
// ========================================

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showLoadingScreen();

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const json = JSON.parse(e.target.result);
            processUploadedData(json);

            // Reset input
            event.target.value = '';

            hideLoadingScreen();
            showToast('Data berhasil diimport!', 'success');
        } catch (error) {
            console.error('Error parsing JSON:', error);
            hideLoadingScreen();
            showToast('Format file tidak valid', 'error');
        }
    };
    reader.onerror = function () {
        hideLoadingScreen();
        showToast('Gagal membaca file', 'error');
    };
    reader.readAsText(file);
}

function processUploadedData(uploadedData) {
    console.log('Processing uploaded data...', uploadedData);

    // Validate structure
    if (!uploadedData.data || !Array.isArray(uploadedData.data)) {
        showToast('Struktur data tidak valid', 'error');
        return;
    }

    const rawData = uploadedData.data;

    // Sort by date just in case
    rawData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get latest data point
    const latest = rawData[rawData.length - 1];

    // Update Metadata
    BANK_DATA.metadata.lastUpdate = new Date().toISOString();
    BANK_DATA.metadata.dataSource = "File Upload: " + (uploadedData.metadata?.period || "Custom Data");

    // Helper to get monthly data
    const getMonthlyData = (metricKey, isRatio = false) => {
        const monthly = {};
        rawData.forEach(d => {
            const date = new Date(d.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            // For ratios, take the last value of the month. For volume, also take last value (stock) or sum (flow)? 
            // Bank data usually stock (position) for balance sheet, flow for P&L.
            // Assuming stock for Asset, DPK, Kredit. P&L (Laba) is usually YTD or MTD. 
            // Let's assume the daily data for Laba is YTD or accumulated.
            // For simplicity, we'll take the last value of the month for everything as a snapshot.
            monthly[key] = d[metricKey];
        });

        return Object.entries(monthly)
            .sort()
            .slice(-5) // Last 5 months
            .map(([key, value]) => {
                const [year, month] = key.split('-');
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
                return {
                    period: `${monthNames[parseInt(month) - 1]} ${year}`,
                    value: value
                };
            });
    };

    // Update Neraca
    if (latest.asset) {
        BANK_DATA.neraca.asset.current = latest.asset;
        BANK_DATA.neraca.asset.historical = getMonthlyData('asset');
    }
    if (latest.dpk) {
        BANK_DATA.neraca.dpkKonvensional.current = latest.dpk; // Mapping total DPK to Konvensional for now
        BANK_DATA.neraca.dpkKonvensional.historical = getMonthlyData('dpk');
    }
    if (latest.kredit) {
        BANK_DATA.neraca.kredit.current = latest.kredit;
        BANK_DATA.neraca.kredit.historical = getMonthlyData('kredit');
    }
    if (latest.laba) {
        BANK_DATA.neraca.labaRugi.current = latest.laba / 1000; // Convert if needed? 
        // Wait, sample data says laba: 302595.62. 
        // BANK_DATA says current: 245 (Miliar).
        // Sample data 302595 is likely in Millions (Juta) -> 302 Miliar.
        // Or if it's absolute rupiah, it's too small.
        // Let's check units in bank-sulselbar-data.js: "laba": "Juta Rupiah".
        // So 302595 Juta = 302.5 Miliar.
        // BANK_DATA unit is "M". So we divide by 1000.
        BANK_DATA.neraca.labaRugi.current = latest.laba / 1000;
        BANK_DATA.neraca.labaRugi.historical = getMonthlyData('laba').map(d => ({ ...d, value: d.value / 1000 }));
    }
    if (latest.pendapatan) {
        BANK_DATA.neraca.pendapatan.current = latest.pendapatan * 1000; // Sample 2.3 T -> 2300 M
        // Sample data unit: "Triliun Rupiah". BANK_DATA unit: "M".
        // So multiply by 1000.
        BANK_DATA.neraca.pendapatan.current = latest.pendapatan * 1000;
    }
    if (latest.biaya) {
        BANK_DATA.neraca.biaya.current = latest.biaya * 1000;
    }

    // Update Ratios
    const updateRatio = (key, dataKey) => {
        if (latest[dataKey] !== undefined) {
            BANK_DATA.ratios[key].current = latest[dataKey];
            BANK_DATA.ratios[key].historical = getMonthlyData(dataKey);

            // Also update monthlyData for target charts
            const monthly = getMonthlyData(dataKey);
            BANK_DATA.ratios[key].monthlyData = monthly.map(m => ({
                month: m.period.split(' ')[0],
                value: m.value,
                target: BANK_DATA.ratios[key].target // Keep existing target
            }));
        }
    };

    updateRatio('LDR', 'ldr');
    updateRatio('NPL', 'npl');
    updateRatio('ROA', 'roa');
    updateRatio('CAR', 'car');
    updateRatio('ROE', 'roe');
    updateRatio('NIM', 'nim');

    // Calculate BOPO if not present
    if (latest.biaya && latest.pendapatan) {
        const bopoVal = (latest.biaya / latest.pendapatan) * 100;
        BANK_DATA.ratios.BOPO.current = bopoVal;
        // Recalculate historical BOPO
        const biayaHist = getMonthlyData('biaya');
        const pendHist = getMonthlyData('pendapatan');

        BANK_DATA.ratios.BOPO.historical = biayaHist.map((b, i) => {
            const p = pendHist[i];
            return {
                period: b.period,
                value: p ? (b.value / p.value) * 100 : 0
            };
        });
    }

    // Refresh Dashboard
    loadDashboardData();
}


function loadSectionData(section) {
    switch (section) {
        case 'overview':
            renderOverviewSection();
            break;
        case 'ratio':
            renderRatioSection();
            break;
        case 'neraca':
            renderNeracaSection();
            // Initialize Layer 2 & 3 Charts
            if (typeof initNeracaCharts === 'function') {
                setTimeout(initNeracaCharts, 300);
            }
            break;
        case 'konven-syariah':
            console.log('âœ… Konven vs Syariah section loaded');
            // Initialize Konven Syariah charts
            if (typeof initKonvenSyariah === 'function') {
                initKonvenSyariah();
            } else if (typeof renderAllPieCharts === 'function') {
                setTimeout(renderAllPieCharts, 300);
            }
            break;
        case 'pendapatan-biaya':
            console.log('✅ Pendapatan & Biaya section loaded');
            // Initialize Pendapatan Biaya charts
            if (typeof initPendapatanBiaya === 'function') {
                initPendapatanBiaya();
            }
            // Refresh data from Firebase
            if (typeof refreshPendapatanBiaya === 'function') {
                setTimeout(refreshPendapatanBiaya, 300);
            }
            break;
        case 'analytics':
            // Future implementation
            break;
        case 'non-financial':
            console.log('✅ Non-Financial section loaded');
            if (typeof initNonFinancialDashboard === 'function') {
                initNonFinancialDashboard();
            }
            break;
        case 'pipeline':
            console.log('✅ Pipeline section loaded');
            if (typeof initPipelineDashboard === 'function') {
                initPipelineDashboard();
            }
            break;
        default:
            console.log(`Section ${section} loaded`);
    }
}

// ========================================
// OVERVIEW SECTION
// ========================================

function renderOverviewSection() {
    // Render mini KPI charts
    renderMiniChart('carMiniChart', BANK_DATA.ratios.CAR.historical);
    renderMiniChart('nplMiniChart', BANK_DATA.ratios.NPL.historical);
    renderMiniChart('roaMiniChart', BANK_DATA.ratios.ROA.historical);
    renderMiniChart('ldrMiniChart', BANK_DATA.ratios.LDR.historical);

    // Render main overview charts
    renderOverviewAssetChart();
    renderOverviewRevenueChart();
}

function renderMiniChart(elementId, data) {
    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const options = {
        series: [{
            name: 'Value',
            data: data.map(d => d.value)
        }],
        chart: {
            type: 'line',
            height: 60,
            sparkline: {
                enabled: true
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 400
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        colors: [COLORS.secondary],
        tooltip: {
            enabled: true,
            x: {
                show: false
            },
            y: {
                formatter: (val) => formatNumber(val, 2) + '%'
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

function renderOverviewAssetChart() {
    const elementId = 'overviewAssetChart';

    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const neraca = BANK_DATA.neraca;

    const options = {
        series: [
            {
                name: 'Total Asset',
                data: neraca.asset.historical.map(d => d.value)
            },
            {
                name: 'Total Kredit',
                data: neraca.kredit.historical.map(d => d.value)
            }
        ],
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: false
            }
        },
        colors: [COLORS.primary, COLORS.secondary],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: neraca.asset.historical.map(d => d.period),
            labels: {
                style: {
                    colors: COLORS.gray
                }
            }
        },
        yaxis: {
            labels: {
                formatter: (val) => formatNumber(val, 1) + 'T',
                style: {
                    colors: COLORS.gray
                }
            }
        },
        legend: {
            position: 'top'
        },
        grid: {
            borderColor: '#e5e7eb',
            strokeDashArray: 4
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => 'Rp ' + formatNumber(val * 1000000, 2) + ' Jt'
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

function renderOverviewRevenueChart() {
    const elementId = 'overviewRevenueChart';

    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const pendapatan = BANK_DATA.neraca.pendapatan.breakdown;
    const biaya = BANK_DATA.neraca.biaya.breakdown;

    const options = {
        series: [{
            name: 'Pendapatan',
            data: [pendapatan.bungaBunga, pendapatan.nonBunga]
        }, {
            name: 'Biaya',
            data: [biaya.bungaBiaya, biaya.nonBunga]
        }],
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false
            }
        },
        colors: [COLORS.secondary, COLORS.primary],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => formatNumber(val, 0) + 'M',
            style: {
                colors: [COLORS.gray]
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: ['Bunga', 'Non-Bunga']
        },
        yaxis: {
            labels: {
                formatter: (val) => formatNumber(val, 0)
            }
        },
        legend: {
            position: 'top'
        },
        grid: {
            borderColor: '#e5e7eb'
        },
        tooltip: {
            y: {
                formatter: (val) => 'Rp ' + formatNumber(val * 1000, 2) + ' Jt'
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

// ========================================
// RATIO SECTION
// ========================================

function renderRatioSection() {
    // Render sparklines for all 10 indicators
    const ratios = ['car', 'roa', 'roe', 'nim', 'bopo', 'ldr', 'npl', 'lcr', 'nsfr', 'casa'];
    ratios.forEach(ratio => {
        const ratioData = BANK_DATA.ratios[ratio.toUpperCase()];
        if (ratioData && ratioData.historical) {
            renderSparkline(`${ratio}Sparkline`, ratioData.historical);
        }
    });

    // Layer 2 charts sekarang ditampilkan dalam modal saat card diklik
    // (lihat ratio-detail-modal.js)

    // Render historical trend (Layer 3)
    renderHistoricalTrendChart();
}

function renderSparkline(elementId, data) {
    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const options = {
        series: [{
            name: 'Value',
            data: data.map(d => d.value)
        }],
        chart: {
            type: 'area',
            height: 50,
            sparkline: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            opacity: 0.3
        },
        colors: [COLORS.secondary],
        tooltip: {
            enabled: true,
            fixed: {
                enabled: false
            },
            x: {
                show: false
            },
            y: {
                formatter: (val) => formatNumber(val, 2)
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

function renderTargetChart(elementId, title, data) {
    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const options = {
        series: [{
            name: 'Aktual',
            data: data.monthlyData.map(d => d.value)
        }, {
            name: 'Target',
            data: data.monthlyData.map(d => d.target)
        }],
        chart: {
            type: 'line',
            height: 300,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            }
        },
        colors: [COLORS.primary, COLORS.secondary],
        stroke: {
            width: [3, 2],
            curve: 'smooth',
            dashArray: [0, 5]
        },
        markers: {
            size: [5, 0],
            colors: [COLORS.primary],
            strokeColors: '#fff',
            strokeWidth: 2
        },
        xaxis: {
            categories: data.monthlyData.map(d => d.month),
            labels: {
                style: {
                    colors: COLORS.gray
                }
            }
        },
        yaxis: {
            title: {
                text: data.unit
            },
            labels: {
                formatter: (val) => formatNumber(val, 1)
            }
        },
        legend: {
            position: 'top'
        },
        grid: {
            borderColor: '#e5e7eb'
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => formatNumber(val, 2) + data.unit
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

function renderHistoricalTrendChart() {
    const elementId = 'historicalTrendChart';

    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const ratios = BANK_DATA.ratios;

    const options = {
        series: [
            {
                name: 'LDR',
                data: ratios.LDR.historical.map(d => d.value)
            },
            {
                name: 'NPL',
                data: ratios.NPL.historical.map(d => d.value)
            },
            {
                name: 'ROA',
                data: ratios.ROA.historical.map(d => d.value)
            },
            {
                name: 'CAR',
                data: ratios.CAR.historical.map(d => d.value)
            }
        ],
        chart: {
            type: 'line',
            height: 400,
            toolbar: {
                show: true
            }
        },
        colors: [COLORS.primary, COLORS.danger, COLORS.secondary, COLORS.blue],
        stroke: {
            width: 3,
            curve: 'smooth'
        },
        markers: {
            size: 5
        },
        xaxis: {
            categories: ratios.LDR.historical.map(d => d.period)
        },
        yaxis: {
            title: {
                text: 'Nilai (%)'
            }
        },
        legend: {
            position: 'top'
        },
        grid: {
            borderColor: '#e5e7eb'
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => formatNumber(val, 2) + '%'
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

// ========================================
// NERACA SECTION
// ========================================

function renderNeracaSection() {
    // Render sparklines
    const items = ['dpkKonv', 'dpkSyariah', 'laba', 'asset', 'modal', 'kredit'];
    items.forEach(item => {
        const elementId = `${item}Sparkline`;
        const dataKey = {
            dpkKonv: 'dpkKonvensional',
            dpkSyariah: 'dpkSyariah',
            laba: 'labaRugi',
            asset: 'asset',
            modal: 'modal',
            kredit: 'kredit'
        }[item];

        if (BANK_DATA.neraca[dataKey]) {
            renderSparkline(elementId, BANK_DATA.neraca[dataKey].historical);
        }
    });

    // Render composition charts (Layer 2)
    renderModalCompositionChart();
    renderPendapatanBiayaChart();
    renderDPKCompositionChart();
    renderKreditBreakdownChart();

    // Render historical chart (Layer 3)
    renderNeracaHistoricalChart();
}

function renderModalCompositionChart() {
    const elementId = 'modalCompositionChart';

    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const modal = BANK_DATA.neraca.modal.breakdown;

    const options = {
        series: [modal.modalInti, modal.modalPelengkap],
        chart: {
            type: 'donut',
            height: 350
        },
        labels: ['Modal Inti', 'Modal Pelengkap'],
        colors: [COLORS.primary, COLORS.secondary],
        legend: {
            position: 'bottom'
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total Modal',
                            formatter: () => formatNumber(BANK_DATA.neraca.modal.current, 1) + ' T'
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => formatNumber(val, 1) + '%'
        },
        tooltip: {
            y: {
                formatter: (val) => formatNumber(val * 1000000, 2) + ' Jt'
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

function renderPendapatanBiayaChart() {
    const elementId = 'pendapatanBiayaChart';

    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const pendapatan = BANK_DATA.neraca.pendapatan.breakdown;
    const biaya = BANK_DATA.neraca.biaya.breakdown;

    const options = {
        series: [{
            name: 'Pendapatan',
            data: [pendapatan.bungaBunga, pendapatan.nonBunga]
        }, {
            name: 'Biaya',
            data: [biaya.bungaBiaya, biaya.nonBunga]
        }],
        chart: {
            type: 'bar',
            height: 350
        },
        colors: [COLORS.secondary, COLORS.primary],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => formatNumber(val, 0) + 'M'
        },
        xaxis: {
            categories: ['Bunga', 'Non-Bunga']
        },
        yaxis: {
            labels: {
                formatter: (val) => formatNumber(val, 0)
            }
        },
        legend: {
            position: 'top'
        },
        tooltip: {
            y: {
                formatter: (val) => formatNumber(val * 1000, 2) + ' Jt'
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

function renderDPKCompositionChart() {
    const elementId = 'dpkCompositionChart';

    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const options = {
        series: [BANK_DATA.neraca.dpkKonvensional.current, BANK_DATA.neraca.dpkSyariah.current],
        chart: {
            type: 'pie',
            height: 350
        },
        labels: ['DPK Konvensional', 'DPK Syariah'],
        colors: [COLORS.blue, COLORS.secondary],
        legend: {
            position: 'bottom'
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => formatNumber(val, 1) + '%'
        },
        tooltip: {
            y: {
                formatter: (val) => 'Rp ' + formatNumber(val * 1000000, 2) + ' Jt'
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

function renderKreditBreakdownChart() {
    const elementId = 'kreditBreakdownChart';

    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const options = {
        series: [{
            name: 'Kredit',
            data: [3.5, 2.8, 2.1, 1.3, 1.0]
        }],
        chart: {
            type: 'bar',
            height: 350
        },
        colors: [COLORS.red],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => 'Rp ' + formatNumber(val, 1) + 'T'
        },
        xaxis: {
            categories: ['Kredit Modal Kerja', 'Kredit Investasi', 'Kredit Konsumsi', 'KPR', 'Lainnya']
        },
        tooltip: {
            y: {
                formatter: (val) => 'Rp ' + formatNumber(val * 1000000, 2) + ' Jt'
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

function renderNeracaHistoricalChart() {
    const elementId = 'neracaHistoricalChart';

    if (charts[elementId]) {
        charts[elementId].destroy();
    }

    const neraca = BANK_DATA.neraca;

    const options = {
        series: [
            {
                name: 'Total Asset',
                data: neraca.asset.historical.map(d => d.value)
            },
            {
                name: 'DPK Total',
                data: neraca.dpkKonvensional.historical.map((d, i) =>
                    d.value + neraca.dpkSyariah.historical[i].value
                )
            },
            {
                name: 'Total Kredit',
                data: neraca.kredit.historical.map(d => d.value)
            }
        ],
        chart: {
            type: 'area',
            height: 400,
            toolbar: {
                show: true
            }
        },
        colors: [COLORS.primary, COLORS.secondary, COLORS.orange],
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: neraca.asset.historical.map(d => d.period)
        },
        yaxis: {
            labels: {
                formatter: (val) => formatNumber(val, 1) + 'T'
            }
        },
        legend: {
            position: 'top'
        },
        grid: {
            borderColor: '#e5e7eb'
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => 'Rp ' + formatNumber(val * 1000000, 2) + ' Jt'
            }
        }
    };

    const element = document.getElementById(elementId);
    if (element) {
        charts[elementId] = new ApexCharts(element, options);
        charts[elementId].render();
    }
}

// ========================================
// AUTO REFRESH
// ========================================

function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        console.log('ÃƒÂ¢Ã‚ÂÃ‚Â° Auto-refresh triggered');
        loadDashboardData();
    }, REFRESH_RATE);
}

function updateTimestamp() {
    const now = new Date();
    const formatted = now.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const elements = ['lastUpdateTime', 'filterLastUpdate'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = formatted;
    });
}

function updateBusinessLineIndicator() {
    const businessLineNames = {
        'konsolidasi': 'Konsolidasi',
        'konvensional': 'Konvensional',
        'syariah': 'Syariah'
    };

    const currentLine = businessLineNames[appState.currentBusinessLine] || 'Konsolidasi';
    console.log(`ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â¢ Current Business Line: ${currentLine}`);

    // Update UI indicator
    const indicator = document.getElementById('currentBusinessLine');
    if (indicator) {
        indicator.textContent = currentLine;
    }
}

// ========================================
// WINDOW RESIZE
// ========================================

window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
        if (chart && chart.updateOptions) {
            chart.updateOptions({});
        }
    });
});

// ========================================
// ANIMATIONS
// ========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Enhanced Dashboard app.js loaded successfully');

// ========================================
// STAT CARD MODAL & CHART
// ========================================

// Data for each metric (6 months daily data) - REAL DATA FROM EXCEL
const statChartData = {
    asset: {
        title: 'Total Asset',
        color: '#8ac01e',
        unit: 'T',
        data: generateDailyData(33.87, 34.81, 180),
        current: 'Rp 34.81 T',
        change: '+0.7% MoM'
    },
    dpk: {
        title: 'DPK Total',
        color: '#3b82f6',
        unit: 'T',
        data: generateDailyData(24.66, 24.86, 180),
        current: 'Rp 24.86 T',
        change: '+0.8% MoM'
    },
    kredit: {
        title: 'Total Kredit',
        color: '#8b5cf6',
        unit: 'T',
        data: generateDailyData(22.96, 23.00, 180),
        current: 'Rp 23.00 T',
        change: '+0.1% MoM'
    },
    laba: {
        title: 'Laba Bersih YTD',
        color: '#f97316',
        unit: 'M',
        data: generateDailyData(793.74, 904.70, 180),
        current: 'Rp 904.70 M',
        change: '+14.0% MoM'
    },
    pendapatan: {
        title: 'Pendapatan Bunga YTD',
        color: '#14b8a6',
        unit: 'M',
        data: generateDailyData(1883.67, 2093.88, 180),
        current: 'Rp 2,093.88 M',
        change: '+11.2% MoM'
    },
    biaya: {
        title: 'Beban Bunga YTD',
        color: '#ef4444',
        unit: 'M',
        data: generateDailyData(778.09, 864.56, 180),
        current: 'Rp 864.56 M',
        change: '+11.1% MoM'
    }
};

// Generate daily data for 6 months with realistic trends
function generateDailyData(startValue, endValue, days) {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const increment = (endValue - startValue) / days;

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Add some random fluctuation for realism
        const baseValue = startValue + (increment * i);
        const fluctuation = (Math.random() - 0.5) * (endValue - startValue) * 0.02;
        const value = baseValue + fluctuation;

        data.push({
            date: date.toISOString().split('T')[0],
            value: parseFloat(value.toFixed(2))
        });
    }

    return data;
}

// Format number with Indonesian locale
function formatNumber(num, decimals = 2) {
    // Konversi ke jutaan dengan desimal yang ditentukan
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// Format nilai ke Jutaan dengan label
function formatToJuta(value, fromUnit = 'M') {
    let juta = value;
    if (fromUnit === 'T') {
        juta = value * 1000000; // Triliun ke Juta
    } else if (fromUnit === 'M') {
        juta = value * 1000; // Miliar ke Juta
    }
    return 'Rp ' + juta.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Jt';
}

// Open modal and display chart
function openStatModal(metric) {
    const modal = document.getElementById('statChartModal');
    const data = statChartData[metric];

    if (!data) {
        console.error('Metric not found:', metric);
        return;
    }

    // Store current metric
    appState.currentMetric = metric;

    // Reset to default range
    appState.currentDateRange = 'thisMonth';
    document.querySelectorAll('.stat-date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-range="thisMonth"]').classList.add('active');

    // Update modal title
    document.getElementById('statModalTitle').textContent = `Detail ${data.title}`;

    // Filter data by default range
    const filteredData = filterDataByRange(data.data, appState.currentDateRange);

    // Update summary cards with filtered data
    updateModalStatistics(filteredData, data);

    // Show modal with animation
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Render chart with filtered data
    setTimeout(() => {
        renderStatLineChart(metric, { ...data, data: filteredData });
    }, 100);
}

// Close modal
function closeStatModal() {
    const modal = document.getElementById('statChartModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Destroy chart if exists
    if (charts.statLineChart) {
        charts.statLineChart.destroy();
        delete charts.statLineChart;
    }

    // Reset date range
    appState.currentDateRange = 'thisMonth';
}

// Change date range filter
function changeStatDateRange(rangeType) {
    appState.currentDateRange = rangeType;

    // Update button states
    document.querySelectorAll('.stat-date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-range="${rangeType}"]`).classList.add('active');

    // Reload chart with new date range
    if (appState.currentMetric) {
        const data = statChartData[appState.currentMetric];
        const filteredData = filterDataByRange(data.data, rangeType);

        // Update statistics
        updateModalStatistics(filteredData, data);

        // Re-render chart
        renderStatLineChart(appState.currentMetric, { ...data, data: filteredData });
    }
}

// Filter data based on date range
function filterDataByRange(data, rangeType) {
    const today = new Date();
    let startDate;

    if (rangeType === 'thisMonth') {
        // From 1st of current month to today
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (rangeType === 'last3Months') {
        // Last 90 days
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 90);
    }

    return data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= today;
    });
}

// Update modal statistics with filtered data
function updateModalStatistics(filteredData, data) {
    const values = filteredData.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

    const maxIndex = values.indexOf(maxValue);
    const minIndex = values.indexOf(minValue);

    // Update current value (last value)
    const currentValue = values[values.length - 1];
    const previousValue = values[values.length - 2] || currentValue;
    const changePercent = ((currentValue - previousValue) / previousValue * 100).toFixed(1);

    document.getElementById('modalCurrentValue').textContent = formatNumber(currentValue, data.unit);
    document.getElementById('modalChange').innerHTML = `<i class="fas fa-arrow-${changePercent >= 0 ? 'up' : 'down'}"></i> ${changePercent >= 0 ? '+' : ''}${changePercent}%`;

    // Update max, min, avg
    document.getElementById('modalMaxValue').textContent = formatNumber(maxValue, data.unit);
    document.getElementById('modalMaxDate').textContent = formatDate(filteredData[maxIndex].date);

    document.getElementById('modalMinValue').textContent = formatNumber(minValue, data.unit);
    document.getElementById('modalMinDate').textContent = formatDate(filteredData[minIndex].date);

    document.getElementById('modalAvgValue').textContent = formatNumber(avgValue, data.unit);
}

// Format date to Indonesian
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Render line chart in modal
function renderStatLineChart(metric, data) {
    const options = {
        series: [{
            name: data.title,
            data: data.data.map(d => d.value)
        }],
        chart: {
            type: 'line',
            height: 400,
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                }
            },
            animations: {
                enabled: true,
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                }
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: [data.color],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 0,
            hover: {
                size: 6
            }
        },
        xaxis: {
            categories: data.data.map(d => d.date),
            labels: {
                rotate: -45,
                rotateAlways: true,
                formatter: function (value) {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                },
                style: {
                    fontSize: '11px'
                }
            },
            tickAmount: 15
        },
        yaxis: {
            title: {
                text: data.unit === 'T' ? 'Triliun (Rp)' : 'Juta (Rp)',
                style: {
                    fontSize: '14px',
                    fontWeight: 600
                }
            },
            labels: {
                formatter: function (value) {
                    return value.toFixed(2) + ' ' + data.unit;
                }
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (value) {
                    return formatNumber(value, data.unit);
                }
            },
            x: {
                formatter: function (value) {
                    return formatDate(value);
                }
            }
        },
        grid: {
            borderColor: '#e9ecef',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'left',
            fontSize: '14px',
            fontWeight: 600,
            markers: {
                width: 12,
                height: 12,
                radius: 6
            }
        }
    };

    // Destroy existing chart if any
    if (charts.statLineChart) {
        charts.statLineChart.destroy();
    }

    // Render new chart
    charts.statLineChart = new ApexCharts(
        document.querySelector('#statLineChart'),
        options
    );
    charts.statLineChart.render();
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('statChartModal');
    if (event.target === modal) {
        closeStatModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('statChartModal');
        if (modal.classList.contains('active')) {
            closeStatModal();
        }
    }
});

console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â  Stat Card Modal & Chart initialized');

// ========================================
// BRANCH & BUSINESS LINE SELECTION
// ========================================

function selectBusinessLine(businessLine) {
    // Reset dropdown
    const branchDropdown = document.getElementById('branchSelector');
    if (branchDropdown) {
        branchDropdown.value = '';
        branchDropdown.classList.remove('active');
    }
    
    // Update button state
    const buttons = document.querySelectorAll('.filter-btn[data-business-line]');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.businessLine === businessLine) {
            btn.classList.add('active');
        }
    });
    
    // Update state
    appState.currentBusinessLine = businessLine;
    appState.currentBranch = null;
    
    // ========================================
    // SYNC WITH DASHBOARDFIREBASE FILTERS
    // ========================================
    if (typeof DashboardFirebase !== 'undefined') {
        DashboardFirebase.setFilter('tipe', businessLine);
        DashboardFirebase.setFilter('cabang', null);
    }
    
    // Update display
    const displayEl = document.getElementById('currentBusinessLine');
    if (displayEl) {
        const names = {
            'konsolidasi': 'Konsolidasi',
            'konvensional': 'Konvensional',
            'syariah': 'Syariah'
        };
        displayEl.textContent = names[businessLine] || 'Konsolidasi';
    }
    
    // Reset stat card labels
    resetStatCardLabels();
    
    console.log('View changed to:', businessLine);
    showToast('Menampilkan data ' + businessLine, 'info');
    
    // Reload data
    loadDashboardData();
}

function selectBranch(branchId) {
    if (!branchId) return;
    
    // Update button state - remove active from konsolidasi button
    const buttons = document.querySelectorAll('.filter-btn[data-business-line]');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add active to dropdown
    const branchDropdown = document.getElementById('branchSelector');
    if (branchDropdown) {
        branchDropdown.classList.add('active');
    }
    
    // Get branch name from dropdown
    const selectedOption = branchDropdown.options[branchDropdown.selectedIndex];
    const branchName = selectedOption ? selectedOption.text : branchId;
    
    // Update state
    appState.currentBusinessLine = 'branch';
    appState.currentBranch = branchId;
    
    // ========================================
    // SYNC WITH DASHBOARDFIREBASE FILTERS
    // ========================================
    if (typeof DashboardFirebase !== 'undefined') {
        DashboardFirebase.setFilter('tipe', 'cabang');
        DashboardFirebase.setFilter('cabang', branchId);
    }
    
    // Update display
    const displayEl = document.getElementById('currentBusinessLine');
    if (displayEl) {
        displayEl.textContent = branchName;
    }
    
    console.log('Branch selected:', branchName, '(' + branchId + ')');
    showToast('Menampilkan data ' + branchName, 'info');
    
    // Load branch-specific data
    loadBranchData(branchId);
}

function loadBranchData(branchId) {
    console.log('Loading data for branch:', branchId);
    
    // Get branch performance from BRANCH_DATA
    if (typeof BRANCH_DATA !== 'undefined' && BRANCH_DATA.performance) {
        const branchPerf = {};
        
        // Get all metrics for this branch
        Object.keys(BRANCH_DATA.performance).forEach(metric => {
            if (BRANCH_DATA.performance[metric][branchId]) {
                branchPerf[metric] = BRANCH_DATA.performance[metric][branchId];
            }
        });
        
        console.log('Branch Performance:', branchPerf);
        
        if (Object.keys(branchPerf).length > 0) {
            // Update stat cards with branch data
            updateStatCardsForBranch(branchPerf, branchId);
            
            // Get branch name
            const branchName = BRANCH_DATA.getName ? BRANCH_DATA.getName(branchId) : branchId;
            showToast('Data ' + branchName + ' berhasil dimuat', 'success');
        } else {
            showToast('Data tidak tersedia untuk kode: ' + branchId, 'warning');
        }
    } else {
        console.warn('BRANCH_DATA not loaded');
        showToast('Data cabang belum dimuat', 'error');
    }
}

function updateStatCardsForBranch(branchPerf, branchId) {
    // Get branch name for display
    const branchName = (typeof BRANCH_DATA !== 'undefined' && BRANCH_DATA.getName) 
        ? BRANCH_DATA.getName(branchId) 
        : branchId;
    
    // Helper function to format value to Jutaan
    const formatValue = (val) => {
        // val is in Miliar, convert to Juta
        const juta = val * 1000;
        return 'Rp ' + juta.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' Jt';
    };
    
    // Update Asset card
    if (branchPerf.aset) {
        const assetCard = document.querySelector('.stat-card[data-metric="asset"] .stat-value');
        if (assetCard) {
            assetCard.textContent = formatValue(branchPerf.aset.value);
        }
        
        const assetChange = document.querySelector('.stat-card[data-metric="asset"] .stat-change span');
        if (assetChange) {
            assetChange.textContent = branchPerf.aset.percentage.toFixed(1) + '% Target';
        }
    }
    
    // Update DPK card
    if (branchPerf.dpk) {
        const dpkCard = document.querySelector('.stat-card[data-metric="dpk"] .stat-value');
        if (dpkCard) {
            dpkCard.textContent = formatValue(branchPerf.dpk.value);
        }
        
        const dpkChange = document.querySelector('.stat-card[data-metric="dpk"] .stat-change span');
        if (dpkChange) {
            dpkChange.textContent = branchPerf.dpk.percentage.toFixed(1) + '% Target';
        }
    }
    
    // Update Kredit card
    if (branchPerf.kredit) {
        const kreditCard = document.querySelector('.stat-card[data-metric="kredit"] .stat-value');
        if (kreditCard) {
            kreditCard.textContent = formatValue(branchPerf.kredit.value);
        }
        
        const kreditChange = document.querySelector('.stat-card[data-metric="kredit"] .stat-change span');
        if (kreditChange) {
            kreditChange.textContent = branchPerf.kredit.percentage.toFixed(1) + '% Target';
        }
    }
    
    // Update Laba card - show giro breakdown if no laba data
    const labaCard = document.querySelector('.stat-card[data-metric="laba"] .stat-value');
    if (labaCard) {
        if (branchPerf.giro) {
            labaCard.textContent = formatValue(branchPerf.giro.value);
            // Update label
            const labaLabel = document.querySelector('.stat-card[data-metric="laba"] .stat-label');
            if (labaLabel) labaLabel.textContent = 'Giro';
        }
    }
    
    // Update Pendapatan card - show tabungan if no pendapatan
    const pendapatanCard = document.querySelector('.stat-card[data-metric="pendapatan"] .stat-value');
    if (pendapatanCard) {
        if (branchPerf.tabungan) {
            pendapatanCard.textContent = formatValue(branchPerf.tabungan.value);
            const pendLabel = document.querySelector('.stat-card[data-metric="pendapatan"] .stat-label');
            if (pendLabel) pendLabel.textContent = 'Tabungan';
        }
    }
    
    // Update Biaya card - show deposito if no biaya
    const biayaCard = document.querySelector('.stat-card[data-metric="biaya"] .stat-value');
    if (biayaCard) {
        if (branchPerf.deposito) {
            biayaCard.textContent = formatValue(branchPerf.deposito.value);
            const biayaLabel = document.querySelector('.stat-card[data-metric="biaya"] .stat-label');
            if (biayaLabel) biayaLabel.textContent = 'Deposito';
        }
    }
    
    console.log('Stat cards updated for branch:', branchName, '(' + branchId + ')');
}

// Function to reset labels when back to konsolidasi
function resetStatCardLabels() {
    const labels = {
        'laba': 'Laba Bersih YTD',
        'pendapatan': 'Pendapatan Bunga YTD',
        'biaya': 'Beban Bunga YTD'
    };
    
    Object.keys(labels).forEach(metric => {
        const label = document.querySelector(`.stat-card[data-metric="${metric}"] .stat-label`);
        if (label) label.textContent = labels[metric];
    });
}

// Export functions to window
window.selectBusinessLine = selectBusinessLine;
window.selectBranch = selectBranch;
window.loadBranchData = loadBranchData;

// ========================================
// OFFICE DATA LOADER (using OFFICE_LIST)
// ========================================

function loadOfficeData(officeCode) {
    console.log('Loading data for office code:', officeCode);
    
    // Get office info from OFFICE_LIST
    if (typeof OFFICE_LIST !== 'undefined' && OFFICE_LIST[officeCode]) {
        const office = OFFICE_LIST[officeCode];
        console.log('Office Info:', office);
        
        // Update display
        const displayEl = document.getElementById('currentBusinessLine');
        if (displayEl) {
            displayEl.textContent = office.name;
        }
        
        // Get office performance data if available
        if (typeof getOfficePerformance === 'function') {
            const performance = getOfficePerformance(officeCode);
            if (performance) {
                updateDashboardWithOfficeData(performance, officeCode, office);
            }
        }
        
        showToast('Menampilkan data ' + office.name, 'info');
    } else {
        console.warn('Office not found:', officeCode);
        showToast('Data kantor tidak ditemukan', 'warning');
    }
}

function updateDashboardWithOfficeData(performance, officeCode, officeInfo) {
    console.log('Updating dashboard with office data:', officeCode);
    
    // Update stat cards based on office performance
    // This would need real data from the backend
    // For now, show the office info
    
    const typeLabel = OFFICE_TYPES && OFFICE_TYPES[officeInfo.type] ? 
        OFFICE_TYPES[officeInfo.type].label : officeInfo.type;
    
    console.log('Office Type:', typeLabel);
    console.log('Parent:', officeInfo.parent);
    console.log('Status:', officeInfo.status);
}

// Update selectBranch to use OFFICE_LIST
const originalSelectBranch = window.selectBranch;
window.selectBranch = function(branchId) {
    if (!branchId) return;
    
    // Check if it's an office code (numeric)
    if (typeof OFFICE_LIST !== 'undefined' && OFFICE_LIST[branchId]) {
        // Update button state - remove active from konsolidasi button
        const buttons = document.querySelectorAll('.filter-btn[data-business-line]');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Add active to dropdown
        const branchDropdown = document.getElementById('branchSelector');
        if (branchDropdown) {
            branchDropdown.classList.add('active');
        }
        
        // Get office name
        const office = OFFICE_LIST[branchId];
        
        // Update state
        appState.currentBusinessLine = 'office';
        appState.currentBranch = branchId;
        
        // Update display
        const displayEl = document.getElementById('currentBusinessLine');
        if (displayEl) {
            displayEl.textContent = office.name;
        }
        
        console.log('Office selected:', office.name, '(' + branchId + ')');
        showToast('Menampilkan data ' + office.name, 'info');
        
        // Load office data
        loadOfficeData(branchId);
    } else if (originalSelectBranch) {
        // Fallback to original function for legacy branch IDs
        originalSelectBranch(branchId);
    }
};

console.log('Office data loader functions added');
