// ========================================
// TARGET DATA MANAGEMENT SYSTEM
// Bank Sulselbar - Branch Target Manager
// ========================================

// Storage key untuk localStorage
const STORAGE_KEY = 'bank_sulselbar_branch_targets';
const STORAGE_VERSION = '1.0';

// Data structure untuk target cabang
const branchTargetTemplate = {
    version: STORAGE_VERSION,
    lastUpdate: null,
    branches: {},
    businessLines: {
        konsolidasi: {},
        konvensional: {},
        syariah: {}
    }
};

// Metrics yang perlu target
const targetMetrics = {
    asset: {
        label: 'Total Asset',
        unit: 'T',
        icon: 'fa-arrow-trend-up'
    },
    dpk: {
        label: 'DPK Total',
        unit: 'T',
        icon: 'fa-wallet'
    },
    kredit: {
        label: 'Total Kredit',
        unit: 'T',
        icon: 'fa-hand-holding-usd'
    },
    laba: {
        label: 'Laba Bersih',
        unit: 'M',
        icon: 'fa-chart-line'
    },
    pendapatan: {
        label: 'Total Pendapatan',
        unit: 'T',
        icon: 'fa-money-bill-trend-up'
    },
    biaya: {
        label: 'Total Biaya',
        unit: 'T',
        icon: 'fa-receipt'
    }
};

// ========================================
// STORAGE FUNCTIONS
// ========================================

// Initialize storage
function initializeTargetStorage() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
        const initialData = {
            ...branchTargetTemplate,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        console.log('âœ… Target storage initialized');
        return initialData;
    }
    return JSON.parse(existing);
}

// Get all targets
function getAllTargets() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return initializeTargetStorage();
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading targets:', error);
        return initializeTargetStorage();
    }
}

// Save targets
function saveTargets(data) {
    try {
        data.lastUpdate = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('âœ… Targets saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving targets:', error);
        return false;
    }
}

// Get target by business line
function getTargetByBusinessLine(businessLine) {
    const data = getAllTargets();
    return data.businessLines[businessLine] || {};
}

// Save target by business line
function saveTargetByBusinessLine(businessLine, targetData) {
    const data = getAllTargets();
    data.businessLines[businessLine] = targetData;
    return saveTargets(data);
}

// Get target for specific metric
function getMetricTarget(businessLine, metric) {
    const targets = getTargetByBusinessLine(businessLine);
    return targets[metric] || null;
}

// ========================================
// TARGET ENTRY FORM FUNCTIONS
// ========================================

// Render target entry form
function renderTargetEntryForm() {
    const container = document.getElementById('targetEntryContainer');
    if (!container) {
        console.error('Target entry container not found');
        return;
    }

    const currentData = getAllTargets();
    const businessLine = appState.currentBusinessLine || 'konsolidasi';
    const targets = currentData.businessLines[businessLine] || {};

    let html = `
        <div class="target-entry-form">
            <div class="form-header">
                <h3>
                    <i class="fas fa-bullseye"></i>
                    Entry Data Target Cabang
                </h3>
                <p class="form-subtitle">
                    Lini Bisnis: <strong>${getBusinessLineName(businessLine)}</strong>
                </p>
            </div>

            <div class="form-body">
                <div class="target-form-grid">
    `;

    // Generate form for each metric
    Object.keys(targetMetrics).forEach(metricKey => {
        const metric = targetMetrics[metricKey];
        const currentValue = targets[metricKey] || '';

        html += `
            <div class="target-form-group">
                <label class="target-label">
                    <i class="fas ${metric.icon}"></i>
                    ${metric.label}
                </label>
                <div class="target-input-group">
                    <span class="input-prefix">Rp</span>
                    <input 
                        type="number" 
                        id="target-${metricKey}"
                        class="target-input"
                        placeholder="0"
                        step="0.01"
                        value="${currentValue}"
                    />
                    <span class="input-suffix">${metric.unit}</span>
                </div>
                <p class="input-hint">Target untuk periode ini</p>
            </div>
        `;
    });

    html += `
                </div>

                <div class="form-actions">
                    <button class="btn-secondary" onclick="clearTargetForm()">
                        <i class="fas fa-eraser"></i>
                        Clear
                    </button>
                    <button class="btn-primary" onclick="saveTargetData()">
                        <i class="fas fa-save"></i>
                        Simpan Target
                    </button>
                </div>

                <div class="form-info">
                    <i class="fas fa-info-circle"></i>
                    <span>Last Update: <strong id="lastTargetUpdate">${formatLastUpdate(currentData.lastUpdate)}</strong></span>
                </div>
            </div>

            <!-- Target History -->
            <div class="target-history">
                <h4>
                    <i class="fas fa-history"></i>
                    Target per Lini Bisnis
                </h4>
                <div class="history-tabs">
                    <button class="history-tab ${businessLine === 'konsolidasi' ? 'active' : ''}" 
                            onclick="switchBusinessLineView('konsolidasi')">
                        Konsolidasi
                    </button>
                    <button class="history-tab ${businessLine === 'konvensional' ? 'active' : ''}" 
                            onclick="switchBusinessLineView('konvensional')">
                        Konvensional
                    </button>
                    <button class="history-tab ${businessLine === 'syariah' ? 'active' : ''}" 
                            onclick="switchBusinessLineView('syariah')">
                        Syariah
                    </button>
                </div>
                <div id="targetHistoryContent" class="history-content">
                    ${renderTargetHistoryTable(businessLine)}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Render target history table
function renderTargetHistoryTable(businessLine) {
    const targets = getTargetByBusinessLine(businessLine);
    
    if (Object.keys(targets).length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Belum ada target untuk lini bisnis ini</p>
            </div>
        `;
    }

    let html = `
        <table class="target-history-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Target</th>
                    <th>Unit</th>
                </tr>
            </thead>
            <tbody>
    `;

    Object.keys(targetMetrics).forEach(metricKey => {
        const metric = targetMetrics[metricKey];
        const value = targets[metricKey];
        
        if (value) {
            html += `
                <tr>
                    <td>
                        <i class="fas ${metric.icon}"></i>
                        ${metric.label}
                    </td>
                    <td class="value-cell">Rp ${parseFloat(value).toFixed(2)}</td>
                    <td>${metric.unit}</td>
                </tr>
            `;
        }
    });

    html += `
            </tbody>
        </table>
    `;

    return html;
}

// Save target data
function saveTargetData() {
    const businessLine = appState.currentBusinessLine || 'konsolidasi';
    const targetData = {};
    let hasData = false;

    // Collect all input values
    Object.keys(targetMetrics).forEach(metricKey => {
        const input = document.getElementById(`target-${metricKey}`);
        if (input && input.value) {
            targetData[metricKey] = parseFloat(input.value);
            hasData = true;
        }
    });

    if (!hasData) {
        showToast('Mohon isi minimal satu target', 'warning');
        return;
    }

    // Save to storage
    if (saveTargetByBusinessLine(businessLine, targetData)) {
        showToast('Target berhasil disimpan!', 'success');
        renderTargetEntryForm(); // Refresh form
        updateDashboardWithTargets(); // Update dashboard
    } else {
        showToast('Gagal menyimpan target', 'error');
    }
}

// Clear target form
function clearTargetForm() {
    Object.keys(targetMetrics).forEach(metricKey => {
        const input = document.getElementById(`target-${metricKey}`);
        if (input) input.value = '';
    });
    showToast('Form dikosongkan', 'info');
}

// Switch business line view
function switchBusinessLineView(businessLine) {
    appState.currentBusinessLine = businessLine;
    renderTargetEntryForm();
}

// ========================================
// DASHBOARD INTEGRATION
// ========================================

// Update dashboard with target comparison
function updateDashboardWithTargets() {
    const businessLine = appState.currentBusinessLine || 'konsolidasi';
    const targets = getTargetByBusinessLine(businessLine);
    
    // Update each stat card with target comparison
    Object.keys(targetMetrics).forEach(metricKey => {
        const target = targets[metricKey];
        if (target) {
            updateStatCardWithTarget(metricKey, target);
        }
    });
}

// Update individual stat card with target
function updateStatCardWithTarget(metric, targetValue) {
    const card = document.querySelector(`.stat-card[data-metric="${metric}"]`);
    if (!card) return;

    // Get current value from card
    const valueElement = card.querySelector('.stat-value');
    if (!valueElement) return;

    const currentValueText = valueElement.textContent.trim();
    const currentValue = parseCurrentValue(currentValueText);
    
    if (!currentValue) return;

    // Calculate achievement percentage
    const achievement = (currentValue / targetValue) * 100;
    const achievementClass = achievement >= 100 ? 'achieved' : achievement >= 80 ? 'near' : 'below';

    // Add or update target indicator
    let targetIndicator = card.querySelector('.target-indicator');
    if (!targetIndicator) {
        targetIndicator = document.createElement('div');
        targetIndicator.className = 'target-indicator';
        card.appendChild(targetIndicator);
    }

    targetIndicator.className = `target-indicator ${achievementClass}`;
    targetIndicator.innerHTML = `
        <div class="target-info">
            <span class="target-label">Target:</span>
            <span class="target-value">Rp ${targetValue.toFixed(2)} ${targetMetrics[metric].unit}</span>
        </div>
        <div class="target-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(achievement, 100)}%"></div>
            </div>
            <span class="progress-text">${achievement.toFixed(1)}%</span>
        </div>
    `;
}

// Parse current value from text
function parseCurrentValue(text) {
    // Remove "Rp", spaces, and unit suffixes
    const cleaned = text.replace(/Rp|T|M|\s/g, '');
    const value = parseFloat(cleaned);
    
    // Convert based on unit in original text
    if (text.includes('T')) {
        return value; // Already in Trillion
    } else if (text.includes('M')) {
        return value / 1000; // Convert Million to Trillion
    }
    
    return value;
}

// ========================================
// EXPORT/IMPORT FUNCTIONS
// ========================================

// Export targets to JSON
function exportTargetsToJSON() {
    const data = getAllTargets();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-sulselbar-targets-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Target data exported!', 'success');
}

// Import targets from JSON
function importTargetsFromJSON(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            renderTargetEntryForm();
            updateDashboardWithTargets();
            showToast('Target data imported!', 'success');
        } catch (error) {
            console.error('Import error:', error);
            showToast('Invalid file format', 'error');
        }
    };
    reader.readAsText(file);
}

// Export targets to Excel (CSV format)
function exportTargetsToExcel() {
    const data = getAllTargets();
    let csv = 'Business Line,Metric,Target,Unit\n';
    
    Object.keys(data.businessLines).forEach(businessLine => {
        const targets = data.businessLines[businessLine];
        Object.keys(targets).forEach(metric => {
            const metricInfo = targetMetrics[metric];
            csv += `${businessLine},${metricInfo.label},${targets[metric]},${metricInfo.unit}\n`;
        });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-sulselbar-targets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Target data exported to Excel!', 'success');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Get business line display name
function getBusinessLineName(businessLine) {
    const names = {
        'konsolidasi': 'Konsolidasi',
        'konvensional': 'Konvensional',
        'syariah': 'Syariah'
    };
    return names[businessLine] || businessLine;
}

// Format last update timestamp
function formatLastUpdate(timestamp) {
    if (!timestamp) return 'Belum ada data';
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calculate overall target achievement
function calculateOverallAchievement(businessLine) {
    const targets = getTargetByBusinessLine(businessLine);
    if (Object.keys(targets).length === 0) return null;
    
    let totalAchievement = 0;
    let count = 0;
    
    Object.keys(targets).forEach(metric => {
        const target = targets[metric];
        // Get actual value from dashboard (you need to implement this)
        const actual = getActualValue(metric);
        if (actual && target) {
            totalAchievement += (actual / target) * 100;
            count++;
        }
    });
    
    return count > 0 ? totalAchievement / count : 0;
}

// Get actual value (placeholder - implement based on your data source)
function getActualValue(metric) {
    // This should fetch from your actual data source
    // For now, return dummy values
    const dummyValues = {
        asset: 18.9,
        dpk: 16.3,
        kredit: 10.7,
        laba: 0.245, // 245M in Trillion
        pendapatan: 1.8,
        biaya: 1.5
    };
    return dummyValues[metric];
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize target management on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize storage
    initializeTargetStorage();
    
    // Check if we're on the settings page
    if (document.getElementById('targetEntryContainer')) {
        renderTargetEntryForm();
    }
    
    // Update dashboard if targets exist
    updateDashboardWithTargets();
    
    console.log('ðŸ“Š Target Management System initialized');
});

// Export functions for global use
window.targetManager = {
    render: renderTargetEntryForm,
    save: saveTargetData,
    clear: clearTargetForm,
    exportJSON: exportTargetsToJSON,
    importJSON: importTargetsFromJSON,
    exportExcel: exportTargetsToExcel,
    getTargets: getAllTargets,
    updateDashboard: updateDashboardWithTargets
};

console.log('âœ… Target Data Management System loaded');
