// ========================================
// RATIO DETAIL MODAL HANDLER
// Layer 2 Chart dalam Card Layer 1
// Bank Sulselbar Dashboard
// ========================================

console.log('📊 Loading Ratio Detail Modal Handler...');

// Current selected ratio
let currentDetailRatio = null;
let ratioDetailChart = null;

// Ratio info mapping
const RATIO_INFO = {
    CAR: {
        name: 'CAR',
        fullName: 'Capital Adequacy Ratio',
        icon: 'fa-university',
        color: '#3b82f6',
        targetDisplay: '> 12%',
        type: 'higher'
    },
    ROA: {
        name: 'ROA',
        fullName: 'Return on Assets',
        icon: 'fa-percentage',
        color: '#10b981',
        targetDisplay: '> 1.5%',
        type: 'higher'
    },
    ROE: {
        name: 'ROE',
        fullName: 'Return on Equity',
        icon: 'fa-chart-pie',
        color: '#8b5cf6',
        targetDisplay: '> 10%',
        type: 'higher'
    },
    NIM: {
        name: 'NIM',
        fullName: 'Net Interest Margin',
        icon: 'fa-coins',
        color: '#f59e0b',
        targetDisplay: '> 4%',
        type: 'higher'
    },
    BOPO: {
        name: 'BOPO',
        fullName: 'Biaya Operasional terhadap Pendapatan Operasional',
        icon: 'fa-calculator',
        color: '#ef4444',
        targetDisplay: '< 85%',
        type: 'lower'
    },
    LDR: {
        name: 'LDR',
        fullName: 'Loan to Deposit Ratio',
        icon: 'fa-balance-scale',
        color: '#06b6d4',
        targetDisplay: '78% - 92%',
        type: 'range'
    },
    NPL: {
        name: 'NPL',
        fullName: 'Non Performing Loan',
        icon: 'fa-exclamation-circle',
        color: '#dc2626',
        targetDisplay: '< 5%',
        type: 'lower'
    },
    LCR: {
        name: 'LCR',
        fullName: 'Liquidity Coverage Ratio',
        icon: 'fa-water',
        color: '#0ea5e9',
        targetDisplay: '> 100%',
        type: 'higher'
    },
    NSFR: {
        name: 'NSFR',
        fullName: 'Net Stable Funding Ratio',
        icon: 'fa-shield-alt',
        color: '#14b8a6',
        targetDisplay: '> 100%',
        type: 'higher'
    },
    CASA: {
        name: 'CASA',
        fullName: 'Current Account Saving Account',
        icon: 'fa-piggy-bank',
        color: '#a855f7',
        targetDisplay: '> 50%',
        type: 'higher'
    }
};

// ========================================
// MODAL FUNCTIONS
// ========================================

function showRatioDetailModal(ratio) {
    const modal = document.getElementById('ratioDetailModal');
    if (!modal) return;
    
    currentDetailRatio = ratio;
    modal.classList.add('active');
    
    // Update modal content
    updateRatioDetailContent(ratio);
    
    // Render chart after modal is visible
    setTimeout(() => {
        renderRatioDetailChart(ratio);
    }, 100);
}

function closeRatioDetailModal() {
    const modal = document.getElementById('ratioDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Destroy chart
    if (ratioDetailChart) {
        ratioDetailChart.destroy();
        ratioDetailChart = null;
    }
}

function updateRatioDetailContent(ratio) {
    const info = RATIO_INFO[ratio];
    if (!info) return;
    
    // Update header
    document.getElementById('ratioDetailName').textContent = info.name;
    document.getElementById('ratioDetailFullName').textContent = info.fullName;
    
    const iconEl = document.getElementById('ratioDetailIcon');
    iconEl.innerHTML = `<i class="fas ${info.icon}"></i>`;
    iconEl.style.background = `${info.color}20`;
    iconEl.style.color = info.color;
    
    // Get current value from data
    const ratioData = getRatioData(ratio);
    const currentValue = ratioData.current;
    
    // Update summary cards
    document.getElementById('ratioCurrentValue').textContent = `${currentValue}%`;
    document.getElementById('ratioTargetValue').textContent = info.targetDisplay;
    
    // Get risk settings
    const riskSettings = window.RISK_SETTINGS ? window.RISK_SETTINGS[ratio] : null;
    
    if (riskSettings) {
        document.getElementById('ratioAppetiteValue').textContent = 
            `>${riskSettings.appetite.min}% - ≤${riskSettings.appetite.max}%`;
        
        const toleranceSymbol = riskSettings.toleranceType === 'min' ? '≥' : '≤';
        document.getElementById('ratioToleranceValue').textContent = 
            `${toleranceSymbol}${riskSettings.tolerance}%`;
        
        // Evaluate status
        const status = evaluateRatioZone(ratio, currentValue, riskSettings);
        updateStatusCard(status);
    } else {
        document.getElementById('ratioAppetiteValue').textContent = '-';
        document.getElementById('ratioToleranceValue').textContent = '-';
    }
}

function evaluateRatioZone(ratio, value, settings) {
    const { appetite, tolerance, type } = settings;
    
    if (type === 'higher') {
        if (value >= appetite.min && value <= appetite.max) {
            return { zone: 'appetite', text: 'Dalam Risk Appetite', icon: 'fa-check-circle', class: 'optimal' };
        } else if (value >= tolerance) {
            return { zone: 'tolerance', text: 'Dalam Risk Tolerance', icon: 'fa-exclamation-circle', class: 'warning' };
        } else {
            return { zone: 'breach', text: 'Di Bawah Tolerance!', icon: 'fa-times-circle', class: 'danger' };
        }
    } else if (type === 'lower') {
        if (value >= appetite.min && value <= appetite.max) {
            return { zone: 'appetite', text: 'Dalam Risk Appetite', icon: 'fa-check-circle', class: 'optimal' };
        } else if (value <= tolerance) {
            return { zone: 'tolerance', text: 'Dalam Risk Tolerance', icon: 'fa-exclamation-circle', class: 'warning' };
        } else {
            return { zone: 'breach', text: 'Melebihi Tolerance!', icon: 'fa-times-circle', class: 'danger' };
        }
    } else {
        // Range type (LDR)
        if (value >= appetite.min && value <= appetite.max) {
            return { zone: 'appetite', text: 'Dalam Risk Appetite', icon: 'fa-check-circle', class: 'optimal' };
        } else if (value <= tolerance) {
            return { zone: 'tolerance', text: 'Dalam Risk Tolerance', icon: 'fa-exclamation-circle', class: 'warning' };
        } else {
            return { zone: 'breach', text: 'Melebihi Tolerance!', icon: 'fa-times-circle', class: 'danger' };
        }
    }
}

function updateStatusCard(status) {
    const statusCard = document.getElementById('ratioStatusCard');
    const statusIcon = statusCard.querySelector('.summary-icon i');
    const statusValue = document.getElementById('ratioStatusValue');
    
    // Remove all classes
    statusCard.classList.remove('optimal', 'warning', 'danger');
    statusCard.classList.add(status.class);
    
    statusIcon.className = `fas ${status.icon}`;
    statusValue.textContent = status.text;
}

function getRatioData(ratio) {
    // Try to get from BANK_DATA first
    if (typeof BANK_DATA !== 'undefined' && BANK_DATA.ratios && BANK_DATA.ratios[ratio]) {
        const data = BANK_DATA.ratios[ratio];
        return {
            current: data.current,
            monthlyData: data.monthlyData || generateMonthlyData(data.current, data.target)
        };
    }
    
    // Fallback data with real values
    const fallbackData = {
        CAR: { 
            current: 28.35, 
            monthlyData: [
                { month: 'Jan', value: 27.5, target: 12 },
                { month: 'Feb', value: 27.8, target: 12 },
                { month: 'Mar', value: 27.95, target: 12 },
                { month: 'Apr', value: 28.12, target: 12 },
                { month: 'Mei', value: 28.0, target: 12 },
                { month: 'Jun', value: 28.15, target: 12 },
                { month: 'Jul', value: 28.28, target: 12 },
                { month: 'Agu', value: 28.05, target: 12 },
                { month: 'Sep', value: 28.18, target: 12 },
                { month: 'Okt', value: 28.35, target: 12 }
            ]
        },
        ROA: { 
            current: 2.34, 
            monthlyData: [
                { month: 'Jan', value: 2.15, target: 1.5 },
                { month: 'Feb', value: 2.18, target: 1.5 },
                { month: 'Mar', value: 2.22, target: 1.5 },
                { month: 'Apr', value: 2.25, target: 1.5 },
                { month: 'Mei', value: 2.28, target: 1.5 },
                { month: 'Jun', value: 2.30, target: 1.5 },
                { month: 'Jul', value: 2.31, target: 1.5 },
                { month: 'Agu', value: 2.26, target: 1.5 },
                { month: 'Sep', value: 2.32, target: 1.5 },
                { month: 'Okt', value: 2.34, target: 1.5 }
            ]
        },
        ROE: { 
            current: 12.63, 
            monthlyData: [
                { month: 'Jan', value: 12.1, target: 10 },
                { month: 'Feb', value: 12.2, target: 10 },
                { month: 'Mar', value: 12.35, target: 10 },
                { month: 'Apr', value: 12.42, target: 10 },
                { month: 'Mei', value: 12.45, target: 10 },
                { month: 'Jun', value: 12.52, target: 10 },
                { month: 'Jul', value: 12.55, target: 10 },
                { month: 'Agu', value: 12.48, target: 10 },
                { month: 'Sep', value: 12.57, target: 10 },
                { month: 'Okt', value: 12.63, target: 10 }
            ]
        },
        NIM: { 
            current: 5.03, 
            monthlyData: [
                { month: 'Jan', value: 5.12, target: 4 },
                { month: 'Feb', value: 5.10, target: 4 },
                { month: 'Mar', value: 5.08, target: 4 },
                { month: 'Apr', value: 5.06, target: 4 },
                { month: 'Mei', value: 5.05, target: 4 },
                { month: 'Jun', value: 5.04, target: 4 },
                { month: 'Jul', value: 5.03, target: 4 },
                { month: 'Agu', value: 5.02, target: 4 },
                { month: 'Sep', value: 5.04, target: 4 },
                { month: 'Okt', value: 5.03, target: 4 }
            ]
        },
        BOPO: { 
            current: 74.87, 
            monthlyData: [
                { month: 'Jan', value: 75.5, target: 85 },
                { month: 'Feb', value: 75.3, target: 85 },
                { month: 'Mar', value: 75.1, target: 85 },
                { month: 'Apr', value: 74.95, target: 85 },
                { month: 'Mei', value: 74.92, target: 85 },
                { month: 'Jun', value: 74.88, target: 85 },
                { month: 'Jul', value: 74.90, target: 85 },
                { month: 'Agu', value: 74.85, target: 85 },
                { month: 'Sep', value: 74.88, target: 85 },
                { month: 'Okt', value: 74.87, target: 85 }
            ]
        },
        LDR: { 
            current: 94.85, 
            monthlyData: [
                { month: 'Jan', value: 91.2, target: 85 },
                { month: 'Feb', value: 91.8, target: 85 },
                { month: 'Mar', value: 92.4, target: 85 },
                { month: 'Apr', value: 93.1, target: 85 },
                { month: 'Mei', value: 93.6, target: 85 },
                { month: 'Jun', value: 94.2, target: 85 },
                { month: 'Jul', value: 94.8, target: 85 },
                { month: 'Agu', value: 95.47, target: 85 },
                { month: 'Sep', value: 95.1, target: 85 },
                { month: 'Okt', value: 94.85, target: 85 }
            ]
        },
        NPL: { 
            current: 3.24, 
            monthlyData: [
                { month: 'Jan', value: 3.5, target: 5 },
                { month: 'Feb', value: 3.45, target: 5 },
                { month: 'Mar', value: 3.38, target: 5 },
                { month: 'Apr', value: 3.32, target: 5 },
                { month: 'Mei', value: 3.28, target: 5 },
                { month: 'Jun', value: 3.26, target: 5 },
                { month: 'Jul', value: 3.25, target: 5 },
                { month: 'Agu', value: 3.24, target: 5 },
                { month: 'Sep', value: 3.24, target: 5 },
                { month: 'Okt', value: 3.24, target: 5 }
            ]
        },
        LCR: { 
            current: 125.3, 
            monthlyData: [
                { month: 'Jan', value: 118.5, target: 100 },
                { month: 'Feb', value: 119.2, target: 100 },
                { month: 'Mar', value: 120.5, target: 100 },
                { month: 'Apr', value: 121.8, target: 100 },
                { month: 'Mei', value: 122.5, target: 100 },
                { month: 'Jun', value: 123.2, target: 100 },
                { month: 'Jul', value: 124.0, target: 100 },
                { month: 'Agu', value: 124.8, target: 100 },
                { month: 'Sep', value: 125.1, target: 100 },
                { month: 'Okt', value: 125.3, target: 100 }
            ]
        },
        NSFR: { 
            current: 142.85, 
            monthlyData: [
                { month: 'Jan', value: 135.2, target: 100 },
                { month: 'Feb', value: 136.5, target: 100 },
                { month: 'Mar', value: 137.8, target: 100 },
                { month: 'Apr', value: 138.9, target: 100 },
                { month: 'Mei', value: 139.8, target: 100 },
                { month: 'Jun', value: 140.5, target: 100 },
                { month: 'Jul', value: 141.2, target: 100 },
                { month: 'Agu', value: 141.97, target: 100 },
                { month: 'Sep', value: 142.5, target: 100 },
                { month: 'Okt', value: 142.85, target: 100 }
            ]
        },
        CASA: { 
            current: 45.28, 
            monthlyData: [
                { month: 'Jan', value: 42.1, target: 50 },
                { month: 'Feb', value: 42.5, target: 50 },
                { month: 'Mar', value: 43.0, target: 50 },
                { month: 'Apr', value: 43.4, target: 50 },
                { month: 'Mei', value: 43.8, target: 50 },
                { month: 'Jun', value: 44.2, target: 50 },
                { month: 'Jul', value: 44.5, target: 50 },
                { month: 'Agu', value: 44.43, target: 50 },
                { month: 'Sep', value: 44.9, target: 50 },
                { month: 'Okt', value: 45.28, target: 50 }
            ]
        }
    };
    
    return fallbackData[ratio] || { current: 0, monthlyData: [] };
}

function generateMonthlyData(current, target) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
    const data = [];
    
    for (let i = 0; i < months.length; i++) {
        const variance = (Math.random() - 0.5) * 2;
        const value = current - (months.length - i - 1) * 0.1 + variance;
        data.push({
            month: months[i],
            value: parseFloat(value.toFixed(2)),
            target: target
        });
    }
    
    return data;
}

// ========================================
// CHART RENDERING
// ========================================

function renderRatioDetailChart(ratio) {
    const chartEl = document.getElementById('ratioDetailChart');
    if (!chartEl) return;
    
    // Destroy existing chart
    if (ratioDetailChart) {
        ratioDetailChart.destroy();
    }
    
    const ratioData = getRatioData(ratio);
    const info = RATIO_INFO[ratio];
    const riskSettings = window.RISK_SETTINGS ? window.RISK_SETTINGS[ratio] : null;
    
    // Prepare data
    const months = ratioData.monthlyData.map(d => d.month);
    const values = ratioData.monthlyData.map(d => d.value);
    const targets = ratioData.monthlyData.map(d => d.target);
    
    // Risk zones for annotations
    const annotations = [];
    
    if (riskSettings) {
        // Appetite zone (green)
        annotations.push({
            y: riskSettings.appetite.min,
            y2: riskSettings.appetite.max,
            borderColor: 'transparent',
            fillColor: '#10b98120',
            label: {
                text: 'Appetite Zone',
                style: { color: '#10b981', fontSize: '10px' }
            }
        });
        
        // Tolerance line
        annotations.push({
            y: riskSettings.tolerance,
            borderColor: '#f59e0b',
            borderWidth: 2,
            strokeDashArray: 5,
            label: {
                text: 'Tolerance',
                style: { color: '#f59e0b', fontSize: '10px' }
            }
        });
    }
    
    const options = {
        series: [
            {
                name: 'Realisasi',
                type: 'line',
                data: values
            },
            {
                name: 'Target',
                type: 'line',
                data: targets
            }
        ],
        chart: {
            height: 320,
            type: 'line',
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
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        colors: [info.color, '#94a3b8'],
        stroke: {
            width: [3, 2],
            curve: 'smooth',
            dashArray: [0, 5]
        },
        markers: {
            size: [5, 0],
            colors: [info.color, 'transparent'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 7
            }
        },
        fill: {
            type: ['gradient', 'solid'],
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.3,
                opacityFrom: 0.4,
                opacityTo: 0.1
            }
        },
        xaxis: {
            categories: months,
            labels: {
                style: {
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        yaxis: {
            labels: {
                formatter: (val) => `${val.toFixed(2)}%`,
                style: {
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif'
                }
            }
        },
        annotations: {
            yaxis: annotations
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            markers: {
                width: 12,
                height: 12,
                radius: 2
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val) => `${val.toFixed(2)}%`
            }
        },
        grid: {
            borderColor: '#e5e7eb',
            strokeDashArray: 3
        }
    };
    
    ratioDetailChart = new ApexCharts(chartEl, options);
    ratioDetailChart.render();
}

// ========================================
// NAVIGATION
// ========================================

function goToRatioLayer3() {
    closeRatioDetailModal();
    
    // Scroll to Layer 3 section
    const layer3Section = document.querySelector('.ratio-layer3-section');
    if (layer3Section) {
        layer3Section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Change dropdown to current ratio
    if (currentDetailRatio && typeof changeRatioLayer3Metric === 'function') {
        const selector = document.getElementById('ratioLayer3Selector');
        if (selector) {
            selector.value = currentDetailRatio;
        }
        changeRatioLayer3Metric(currentDetailRatio);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('ratioDetailModal');
    if (e.target === modal) {
        closeRatioDetailModal();
    }
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeRatioDetailModal();
    }
});

// ========================================
// EXPORT
// ========================================

window.showRatioDetailModal = showRatioDetailModal;
window.closeRatioDetailModal = closeRatioDetailModal;
window.goToRatioLayer3 = goToRatioLayer3;

console.log('✅ Ratio Detail Modal Handler loaded');
