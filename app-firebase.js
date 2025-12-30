// ========================================
// APP ENHANCED - FIREBASE VERSION
// Bank Sulselbar Dashboard
// ========================================

// App State
const appState = {
    currentBusinessLine: 'konsolidasi',
    currentBranch: null,
    isFirebaseReady: false
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard initializing...');
    
    // Initialize Firebase Data Manager
    if (typeof FirebaseDataManager !== 'undefined') {
        const success = FirebaseDataManager.init();
        if (success) {
            appState.isFirebaseReady = true;
            
            // Add listener for data changes
            FirebaseDataManager.addListener(onDataChange);
            
            // Load initial data
            loadDashboardData();
            
            console.log('✅ Firebase mode active');
        }
    } else {
        console.log('⚠️ Firebase not available, using static data');
        loadStaticData();
    }
    
    // Initialize filters
    initializeFilters();
    
    // Initialize charts
    if (typeof initializeCharts === 'function') {
        initializeCharts();
    }
    
    console.log('✅ Dashboard ready!');
});

// ==========================================
// DATA LOADING
// ==========================================
function loadDashboardData() {
    const businessLine = appState.currentBusinessLine;
    console.log('📊 Loading data for:', businessLine);
    
    if (appState.isFirebaseReady) {
        // Load from Firebase
        FirebaseDataManager.getBusinessLineData(businessLine)
            .then(data => {
                if (data) {
                    DashboardUI.resetLabels();
                    DashboardUI.updateStatCards(data);
                }
            })
            .catch(err => {
                console.error('Error loading data:', err);
                showToast('Gagal memuat data', 'error');
            });
        
        // Load ratios
        FirebaseDataManager.getRatios()
            .then(ratios => {
                if (ratios) {
                    DashboardUI.updateKPICards(ratios);
                }
            });
    } else {
        // Fallback to static data
        loadStaticData();
    }
}

function loadBranchData(branchCode) {
    console.log('🏢 Loading branch:', branchCode);
    
    if (appState.isFirebaseReady) {
        FirebaseDataManager.getBranchData(branchCode)
            .then(data => {
                if (data) {
                    DashboardUI.updateBranchCards(data);
                    showToast('Data ' + data.name + ' dimuat', 'success');
                } else {
                    showToast('Data tidak ditemukan untuk kode: ' + branchCode, 'warning');
                }
            })
            .catch(err => {
                console.error('Error loading branch:', err);
                showToast('Gagal memuat data cabang', 'error');
            });
    } else {
        // Fallback to BRANCH_DATA static
        if (typeof BRANCH_DATA !== 'undefined') {
            const branchPerf = BRANCH_DATA.getAllPerformance ? 
                BRANCH_DATA.getAllPerformance(branchCode) : 
                getBranchFromStatic(branchCode);
            
            if (branchPerf && Object.keys(branchPerf).length > 0) {
                updateStatCardsForBranch(branchPerf, branchCode);
            }
        }
    }
}

// Fallback static data loader
function loadStaticData() {
    console.log('📦 Loading static data...');
    
    // Use KONVEN_SYARIAH_DATA if available
    if (typeof KONVEN_SYARIAH_DATA !== 'undefined') {
        const bl = appState.currentBusinessLine;
        let data;
        
        if (bl === 'konsolidasi') {
            data = {
                aset: { value: KONVEN_SYARIAH_DATA.perbandingan.asset.total * 1000, changeText: '+0.7% MoM' },
                dpk: { value: KONVEN_SYARIAH_DATA.perbandingan.dpk.total * 1000, changeText: '+0.8% MoM' },
                kredit: { value: KONVEN_SYARIAH_DATA.perbandingan.kredit.total * 1000, changeText: '+0.1% MoM' },
                laba: { value: KONVEN_SYARIAH_DATA.perbandingan.laba.total, changeText: '+14.0% MoM' },
                pendapatan: { value: KONVEN_SYARIAH_DATA.pendapatan.konven.bunga, changeText: '+11.2% MoM' },
                biaya: { value: KONVEN_SYARIAH_DATA.biaya.konven.bunga, changeText: '+11.1% MoM' }
            };
        } else if (bl === 'konvensional') {
            data = {
                aset: { value: KONVEN_SYARIAH_DATA.perbandingan.asset.konven * 1000, changeText: '+0.5% MoM' },
                dpk: { value: KONVEN_SYARIAH_DATA.perbandingan.dpk.konven * 1000, changeText: '+0.6% MoM' },
                kredit: { value: KONVEN_SYARIAH_DATA.perbandingan.kredit.konven * 1000, changeText: '+0.2% MoM' },
                laba: { value: KONVEN_SYARIAH_DATA.perbandingan.laba.konven, changeText: '+12.5% MoM' },
                pendapatan: { value: KONVEN_SYARIAH_DATA.pendapatan.konven.bunga, changeText: '+11.2% MoM' },
                biaya: { value: KONVEN_SYARIAH_DATA.biaya.konven.bunga, changeText: '+11.1% MoM' }
            };
        } else if (bl === 'syariah') {
            data = {
                aset: { value: KONVEN_SYARIAH_DATA.perbandingan.asset.syariah * 1000, changeText: '+1.2% MoM' },
                dpk: { value: KONVEN_SYARIAH_DATA.perbandingan.dpk.syariah * 1000, changeText: '+1.5% MoM' },
                kredit: { value: KONVEN_SYARIAH_DATA.perbandingan.kredit.syariah * 1000, changeText: '+0.8% MoM' },
                laba: { value: KONVEN_SYARIAH_DATA.perbandingan.laba.syariah, changeText: '+18.2% MoM' },
                pendapatan: { value: KONVEN_SYARIAH_DATA.pendapatan.syariah.imbalHasil, changeText: '+15.0% MoM' },
                biaya: { value: KONVEN_SYARIAH_DATA.biaya.syariah.bagiHasil, changeText: '+8.5% MoM' }
            };
        }
        
        if (data) {
            DashboardUI.resetLabels();
            DashboardUI.updateStatCards(data);
        }
    }
}

// Callback when Firebase data changes
function onDataChange(type, data) {
    console.log('🔄 Data changed:', type);
    
    if (type === appState.currentBusinessLine) {
        DashboardUI.updateStatCards(data);
    } else if (type === 'ratios') {
        DashboardUI.updateKPICards(data);
    }
}

// ==========================================
// FILTER HANDLERS
// ==========================================
function initializeFilters() {
    // Set default active button
    const defaultBtn = document.querySelector('.filter-btn[data-business-line="konsolidasi"]');
    if (defaultBtn) {
        defaultBtn.classList.add('active');
    }
}

function selectBusinessLine(businessLine) {
    console.log('🔀 Switching to:', businessLine);
    
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
    
    showToast('Menampilkan data ' + businessLine, 'info');
    
    // Update DashboardFirebase filter (untuk Layer 2 charts)
    // Use setFilters untuk batch update (hanya dispatch event sekali)
    if (window.DashboardFirebase?.setFilters) {
        window.DashboardFirebase.setFilters({
            tipe: businessLine,
            cabang: null
        });
    }
    
    // Reload data
    loadDashboardData();
}

function selectBranch(branchCode) {
    if (!branchCode) return;
    
    console.log('🏢 Branch selected:', branchCode);
    
    // Update button state
    const buttons = document.querySelectorAll('.filter-btn[data-business-line]');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Get branch name
    const branchDropdown = document.getElementById('branchSelector');
    const selectedOption = branchDropdown?.options[branchDropdown.selectedIndex];
    const branchName = selectedOption ? selectedOption.text : branchCode;
    
    // Update state
    appState.currentBusinessLine = 'branch';
    appState.currentBranch = branchCode;
    
    // Update display
    const displayEl = document.getElementById('currentBusinessLine');
    if (displayEl) {
        displayEl.textContent = branchName;
    }
    
    // Update DashboardFirebase filter (untuk Layer 2 charts)
    // Use setFilters untuk batch update (hanya dispatch event sekali)
    console.log('🏢 selectBranch: calling setFilters with cabang =', branchCode);
    if (window.DashboardFirebase?.setFilters) {
        window.DashboardFirebase.setFilters({
            cabang: branchCode,
            tipe: null
        });
    } else {
        console.warn('⚠️ DashboardFirebase.setFilters not available!');
    }
    
    // Load branch data
    loadBranchData(branchCode);
}

function showAllBranches() {
    // Reset to konsolidasi
    selectBusinessLine('konsolidasi');
}

// ==========================================
// HELPER: Static branch data lookup
// ==========================================
function getBranchFromStatic(branchCode) {
    if (typeof BRANCH_DATA === 'undefined') return null;
    
    const result = {};
    const metrics = ['aset', 'kredit', 'dpk', 'giro', 'tabungan', 'deposito'];
    
    metrics.forEach(metric => {
        if (BRANCH_DATA.performance && BRANCH_DATA.performance[metric]) {
            const data = BRANCH_DATA.performance[metric][branchCode];
            if (data) {
                result[metric] = data;
            }
        }
    });
    
    return result;
}

function updateStatCardsForBranch(branchPerf, branchCode) {
    const formatValue = (val) => {
        if (val >= 1000) {
            return 'Rp ' + (val/1000).toFixed(2) + ' T';
        }
        return 'Rp ' + val.toLocaleString('id-ID', {maximumFractionDigits: 2}) + ' M';
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
    }
    
    // Update Kredit card
    if (branchPerf.kredit) {
        const kreditCard = document.querySelector('.stat-card[data-metric="kredit"] .stat-value');
        if (kreditCard) {
            kreditCard.textContent = formatValue(branchPerf.kredit.value);
        }
    }
    
    // Update remaining cards with giro/tabungan/deposito
    if (branchPerf.giro) {
        const labaCard = document.querySelector('.stat-card[data-metric="laba"] .stat-value');
        if (labaCard) labaCard.textContent = formatValue(branchPerf.giro.value);
        const labaLabel = document.querySelector('.stat-card[data-metric="laba"] .stat-label');
        if (labaLabel) labaLabel.textContent = 'Giro';
    }
    
    if (branchPerf.tabungan) {
        const pendCard = document.querySelector('.stat-card[data-metric="pendapatan"] .stat-value');
        if (pendCard) pendCard.textContent = formatValue(branchPerf.tabungan.value);
        const pendLabel = document.querySelector('.stat-card[data-metric="pendapatan"] .stat-label');
        if (pendLabel) pendLabel.textContent = 'Tabungan';
    }
    
    if (branchPerf.deposito) {
        const biayaCard = document.querySelector('.stat-card[data-metric="biaya"] .stat-value');
        if (biayaCard) biayaCard.textContent = formatValue(branchPerf.deposito.value);
        const biayaLabel = document.querySelector('.stat-card[data-metric="biaya"] .stat-label');
        if (biayaLabel) biayaLabel.textContent = 'Deposito';
    }
    
    const branchName = BRANCH_DATA.getName ? BRANCH_DATA.getName(branchCode) : branchCode;
    showToast('Data ' + branchName + ' dimuat', 'success');
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// FIREBASE ADMIN FUNCTIONS
// ==========================================

// Upload initial data to Firebase (run once)
function uploadDataToFirebase() {
    if (!appState.isFirebaseReady) {
        showToast('Firebase not ready', 'error');
        return;
    }
    
    FirebaseDataManager.uploadInitialData()
        .then(success => {
            if (success) {
                showToast('Data berhasil diupload ke Firebase!', 'success');
            }
        });
}

// ==========================================
// EXPORTS
// ==========================================
window.selectBusinessLine = selectBusinessLine;
window.selectBranch = selectBranch;
window.showAllBranches = showAllBranches;
window.loadDashboardData = loadDashboardData;
window.loadBranchData = loadBranchData;
window.uploadDataToFirebase = uploadDataToFirebase;
window.showToast = showToast;

console.log('✅ App Firebase version loaded');
