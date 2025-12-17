// ========================================
// RISK APPETITE & TOLERANCE HANDLER
// Bank Sulselbar Dashboard
// ========================================

console.log('🛡️ Loading Risk Appetite & Tolerance Handler...');

// Default Risk Appetite & Tolerance Values
const DEFAULT_RISK_SETTINGS = {
    CAR: {
        name: 'Capital Adequacy Ratio',
        appetite: { min: 22, max: 25 },
        tolerance: 22,
        toleranceType: 'min', // ≥
        type: 'higher' // Higher is Better
    },
    ROA: {
        name: 'Return on Assets',
        appetite: { min: 1.75, max: 2.25 },
        tolerance: 1.25,
        toleranceType: 'min',
        type: 'higher'
    },
    ROE: {
        name: 'Return on Equity',
        appetite: { min: 12, max: 15 },
        tolerance: 12,
        toleranceType: 'min',
        type: 'higher'
    },
    NIM: {
        name: 'Net Interest Margin',
        appetite: { min: 4.25, max: 4.50 },
        tolerance: 4.25,
        toleranceType: 'min',
        type: 'higher'
    },
    BOPO: {
        name: 'Biaya Operasional',
        appetite: { min: 70, max: 75 },
        tolerance: 79,
        toleranceType: 'max', // ≤
        type: 'lower' // Lower is Better
    },
    LDR: {
        name: 'Loan to Deposit Ratio',
        appetite: { min: 90, max: 100 },
        tolerance: 110,
        toleranceType: 'max',
        type: 'range' // Within Range
    },
    NPL: {
        name: 'Non Performing Loan',
        appetite: { min: 1, max: 1.75 },
        tolerance: 2,
        toleranceType: 'max',
        type: 'lower'
    },
    LCR: {
        name: 'Liquidity Coverage Ratio',
        appetite: { min: 115, max: 120 },
        tolerance: 110,
        toleranceType: 'min',
        type: 'higher'
    },
    NSFR: {
        name: 'Net Stable Funding Ratio',
        appetite: { min: 102, max: 105 },
        tolerance: 100,
        toleranceType: 'min',
        type: 'higher'
    },
    CASA: {
        name: 'Current Account Saving Account',
        appetite: { min: 52.5, max: 55 },
        tolerance: 52.5,
        toleranceType: 'min',
        type: 'higher'
    }
};

// Current Risk Settings (loaded from localStorage or default)
let RISK_SETTINGS = {};

// ========================================
// STORAGE FUNCTIONS
// ========================================

function loadRiskSettings() {
    const stored = localStorage.getItem('bankSulselbar_riskSettings');
    if (stored) {
        try {
            RISK_SETTINGS = JSON.parse(stored);
            console.log('✅ Risk settings loaded from localStorage');
        } catch (e) {
            console.error('Error loading risk settings:', e);
            RISK_SETTINGS = JSON.parse(JSON.stringify(DEFAULT_RISK_SETTINGS));
        }
    } else {
        RISK_SETTINGS = JSON.parse(JSON.stringify(DEFAULT_RISK_SETTINGS));
        console.log('📋 Using default risk settings');
    }
    return RISK_SETTINGS;
}

function saveRiskSettingsToStorage() {
    localStorage.setItem('bankSulselbar_riskSettings', JSON.stringify(RISK_SETTINGS));
    console.log('💾 Risk settings saved to localStorage');
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function showRiskAppetiteModal() {
    const modal = document.getElementById('riskAppetiteModal');
    if (modal) {
        modal.classList.add('active');
        populateRiskForm();
    }
}

function closeRiskAppetiteModal() {
    const modal = document.getElementById('riskAppetiteModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function populateRiskForm() {
    const ratios = ['CAR', 'ROA', 'ROE', 'NIM', 'BOPO', 'LDR', 'NPL', 'LCR', 'NSFR', 'CASA'];
    
    ratios.forEach(ratio => {
        const settings = RISK_SETTINGS[ratio];
        if (!settings) return;
        
        const ratioLower = ratio.toLowerCase();
        
        const appetiteMinInput = document.getElementById(`${ratioLower}_appetite_min`);
        const appetiteMaxInput = document.getElementById(`${ratioLower}_appetite_max`);
        const toleranceInput = document.getElementById(`${ratioLower}_tolerance`);
        
        if (appetiteMinInput) appetiteMinInput.value = settings.appetite.min;
        if (appetiteMaxInput) appetiteMaxInput.value = settings.appetite.max;
        if (toleranceInput) toleranceInput.value = settings.tolerance;
    });
}

function saveRiskAppetite() {
    const ratios = ['CAR', 'ROA', 'ROE', 'NIM', 'BOPO', 'LDR', 'NPL', 'LCR', 'NSFR', 'CASA'];
    
    ratios.forEach(ratio => {
        const ratioLower = ratio.toLowerCase();
        
        const appetiteMinInput = document.getElementById(`${ratioLower}_appetite_min`);
        const appetiteMaxInput = document.getElementById(`${ratioLower}_appetite_max`);
        const toleranceInput = document.getElementById(`${ratioLower}_tolerance`);
        
        if (appetiteMinInput && appetiteMaxInput && toleranceInput) {
            RISK_SETTINGS[ratio].appetite.min = parseFloat(appetiteMinInput.value) || 0;
            RISK_SETTINGS[ratio].appetite.max = parseFloat(appetiteMaxInput.value) || 0;
            RISK_SETTINGS[ratio].tolerance = parseFloat(toleranceInput.value) || 0;
        }
    });
    
    saveRiskSettingsToStorage();
    updateAllRatioCards();
    closeRiskAppetiteModal();
    
    // Show success notification
    showRiskNotification('Risk Appetite & Tolerance berhasil disimpan!', 'success');
}

function resetRiskDefaults() {
    if (confirm('Reset semua pengaturan Risk Appetite & Tolerance ke nilai default?')) {
        RISK_SETTINGS = JSON.parse(JSON.stringify(DEFAULT_RISK_SETTINGS));
        saveRiskSettingsToStorage();
        populateRiskForm();
        updateAllRatioCards();
        showRiskNotification('Pengaturan berhasil direset ke default', 'info');
    }
}

// ========================================
// NOTIFICATION
// ========================================

function showRiskNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `risk-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// RATIO STATUS EVALUATION
// ========================================

function evaluateRatioStatus(ratio, currentValue) {
    const settings = RISK_SETTINGS[ratio];
    if (!settings) return { status: 'unknown', zone: 'unknown', message: '' };
    
    const { appetite, tolerance, toleranceType, type } = settings;
    
    let status = 'safe';
    let zone = 'optimal';
    let message = '';
    
    if (type === 'higher') {
        // Higher is better (CAR, ROA, ROE, NIM, LCR, NSFR, CASA)
        if (currentValue >= appetite.min && currentValue <= appetite.max) {
            status = 'optimal';
            zone = 'appetite';
            message = 'Dalam zona Risk Appetite';
        } else if (currentValue >= tolerance) {
            status = 'safe';
            zone = 'tolerance';
            message = 'Dalam batas Risk Tolerance';
        } else {
            status = 'breach';
            zone = 'breach';
            message = 'Di bawah Risk Tolerance!';
        }
    } else if (type === 'lower') {
        // Lower is better (BOPO, NPL)
        if (currentValue >= appetite.min && currentValue <= appetite.max) {
            status = 'optimal';
            zone = 'appetite';
            message = 'Dalam zona Risk Appetite';
        } else if (currentValue <= tolerance) {
            status = 'safe';
            zone = 'tolerance';
            message = 'Dalam batas Risk Tolerance';
        } else {
            status = 'breach';
            zone = 'breach';
            message = 'Melebihi Risk Tolerance!';
        }
    } else if (type === 'range') {
        // Within range (LDR)
        if (currentValue >= appetite.min && currentValue <= appetite.max) {
            status = 'optimal';
            zone = 'appetite';
            message = 'Dalam zona Risk Appetite';
        } else if (currentValue <= tolerance) {
            status = 'safe';
            zone = 'tolerance';
            message = 'Dalam batas Risk Tolerance';
        } else {
            status = 'breach';
            zone = 'breach';
            message = 'Melebihi Risk Tolerance!';
        }
    }
    
    return { status, zone, message };
}

function formatRiskAppetiteDisplay(ratio) {
    const settings = RISK_SETTINGS[ratio];
    if (!settings) return '';
    
    return `>${settings.appetite.min}% - ≤${settings.appetite.max}%`;
}

function formatRiskToleranceDisplay(ratio) {
    const settings = RISK_SETTINGS[ratio];
    if (!settings) return '';
    
    const symbol = settings.toleranceType === 'min' ? '≥' : '≤';
    return `${symbol}${settings.tolerance}%`;
}

// ========================================
// UPDATE RATIO CARDS
// ========================================

function updateAllRatioCards() {
    const ratios = ['CAR', 'ROA', 'ROE', 'NIM', 'BOPO', 'LDR', 'NPL', 'LCR', 'NSFR', 'CASA'];
    
    ratios.forEach(ratio => {
        updateRatioCard(ratio);
    });
    
    console.log('📊 All ratio cards updated with risk info');
}

function updateRatioCard(ratio) {
    const card = document.querySelector(`[data-ratio="${ratio.toLowerCase()}"]`);
    if (!card) return;
    
    const settings = RISK_SETTINGS[ratio];
    if (!settings) return;
    
    // Get current value from card
    const valueEl = card.querySelector('.value');
    const currentValue = valueEl ? parseFloat(valueEl.textContent) : 0;
    
    // Evaluate status
    const evaluation = evaluateRatioStatus(ratio, currentValue);
    
    // Remove existing risk info
    const existingRiskInfo = card.querySelector('.risk-info');
    if (existingRiskInfo) existingRiskInfo.remove();
    
    // Create risk info element
    const riskInfo = document.createElement('div');
    riskInfo.className = 'risk-info';
    riskInfo.innerHTML = `
        <div class="risk-info-row">
            <span class="risk-label">Appetite:</span>
            <span class="risk-value">${formatRiskAppetiteDisplay(ratio)}</span>
        </div>
        <div class="risk-info-row">
            <span class="risk-label">Tolerance:</span>
            <span class="risk-value">${formatRiskToleranceDisplay(ratio)}</span>
        </div>
        <div class="risk-zone ${evaluation.zone}">
            <i class="fas ${getZoneIcon(evaluation.zone)}"></i>
            <span>${evaluation.message}</span>
        </div>
    `;
    
    // Insert before sparkline
    const sparkline = card.querySelector('.indicator-sparkline');
    if (sparkline) {
        sparkline.parentNode.insertBefore(riskInfo, sparkline);
    } else {
        card.appendChild(riskInfo);
    }
    
    // Update card status class
    card.classList.remove('optimal', 'safe', 'warning', 'breach');
    if (evaluation.status === 'optimal') {
        card.classList.add('safe');
    } else if (evaluation.status === 'safe') {
        card.classList.add('safe');
    } else if (evaluation.status === 'breach') {
        card.classList.add('warning');
    }
}

function getZoneIcon(zone) {
    switch (zone) {
        case 'appetite':
        case 'optimal':
            return 'fa-check-circle';
        case 'tolerance':
            return 'fa-exclamation-circle';
        case 'breach':
            return 'fa-times-circle';
        default:
            return 'fa-question-circle';
    }
}

// ========================================
// INITIALIZE
// ========================================

function initRiskAppetite() {
    loadRiskSettings();
    
    // Wait for DOM to be ready
    setTimeout(() => {
        updateAllRatioCards();
    }, 1000);
    
    console.log('✅ Risk Appetite & Tolerance Handler initialized');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initRiskAppetite);

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('riskAppetiteModal');
    if (e.target === modal) {
        closeRiskAppetiteModal();
    }
});

// Export functions globally
window.showRiskAppetiteModal = showRiskAppetiteModal;
window.closeRiskAppetiteModal = closeRiskAppetiteModal;
window.saveRiskAppetite = saveRiskAppetite;
window.resetRiskDefaults = resetRiskDefaults;
window.RISK_SETTINGS = RISK_SETTINGS;
window.evaluateRatioStatus = evaluateRatioStatus;
