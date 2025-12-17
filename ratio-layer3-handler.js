// ========================================
// FINANCIAL RATIO LAYER 3 HANDLER
// Integrasi dengan Firebase Data + ApexCharts
// ========================================

// Target untuk setiap ratio
const RATIO_TARGETS = {
    LDR: { target: 92, min: 78, max: 92, unit: '%', lowerIsBetter: false, withinRange: true },
    BOPO: { target: 85, min: 0, max: 85, unit: '%', lowerIsBetter: true },
    ROA: { target: 1.5, min: 1.5, max: 100, unit: '%', lowerIsBetter: false },
    ROE: { target: 10, min: 10, max: 100, unit: '%', lowerIsBetter: false },
    NIM: { target: 4, min: 4, max: 100, unit: '%', lowerIsBetter: false },
    NPL: { target: 5, min: 0, max: 5, unit: '%', lowerIsBetter: true },
    CAR: { target: 12, min: 12, max: 100, unit: '%', lowerIsBetter: false },
    CASA: { target: 50, min: 50, max: 100, unit: '%', lowerIsBetter: false },
    NSFR: { target: 100, min: 100, max: 200, unit: '%', lowerIsBetter: false },
    LCR: { target: 100, min: 100, max: 200, unit: '%', lowerIsBetter: false }
};

// Data 2024 untuk YoY (fallback jika tidak ada di Firebase)
const RATIO_DATA_2024 = {
    LDR: [105.2, 106.8, 108.5, 107.3, 106.1, 105.8, 104.5, 103.2, 102.8, 107.38, 106.5, 105.9],
    BOPO: [76.5, 75.8, 74.2, 73.8, 74.5, 75.1, 74.8, 73.5, 72.8, 74.87, 75.2, 74.5],
    ROA: [2.15, 1.98, 2.22, 2.18, 2.11, 2.05, 2.19, 2.25, 2.31, 2.28, 2.35, 2.42],
    ROE: [11.25, 10.85, 11.68, 11.42, 11.15, 10.95, 11.52, 11.78, 12.05, 11.45, 12.15, 12.45],
    NIM: [4.85, 4.92, 5.05, 4.98, 4.88, 4.75, 4.95, 5.02, 5.15, 5.03, 5.12, 5.25],
    NPL: [2.45, 2.52, 2.48, 2.55, 2.61, 2.58, 2.63, 2.68, 2.71, 2.58, 2.65, 2.72],
    CAR: [27.85, 28.12, 27.65, 27.42, 27.88, 28.15, 27.95, 28.22, 28.48, 28.75, 28.65, 28.92],
    CASA: [55.2, 56.1, 57.3, 58.2, 57.8, 56.5, 57.2, 58.5, 59.1, 59.47, 58.8, 59.5],
    NSFR: [92.5, 93.2, 94.1, 93.8, 94.5, 95.2, 94.8, 95.5, 96.2, 94.08, 95.8, 96.5],
    LCR: [108.5, 109.2, 110.5, 111.2, 110.8, 112.5, 111.8, 113.2, 114.5, 112.76, 115.2, 116.8]
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

let currentSelectedRatio = 'CAR';
let ratioYoYChartInstance = null;
let ratioYTDChartInstance = null;
let ratioMoMChartInstance = null;

// ========================================
// DATA RETRIEVAL FROM FIREBASE
// ========================================

function getFirebaseRatioData() {
    if (typeof DashboardFirebase === 'undefined') {
        console.warn('DashboardFirebase not available');
        return null;
    }
    
    const data = DashboardFirebase.getData();
    const filters = DashboardFirebase.getFilters();
    
    if (!data || !data.neraca) {
        console.warn('No neraca data available');
        return null;
    }
    
    return { neraca: data.neraca, filters };
}

function getRatioValue(neraca, periode, kodeTarget, ratioName) {
    const item = neraca.find(d => 
        d.is_ratio === true &&
        d.periode === periode &&
        d.kode_cabang === kodeTarget &&
        d.ratio_name === ratioName
    );
    
    return item ? item.value * 100 : null;
}

function getAvailablePeriodes(neraca) {
    const periodes = [...new Set(neraca.filter(d => d.is_ratio).map(d => d.periode))];
    return periodes.sort();
}

function getTargetKode(filters) {
    if (filters.cabang) return filters.cabang;
    if (filters.tipe === 'konvensional') return 'KON';
    if (filters.tipe === 'syariah') return 'SYR';
    return 'ALL';
}

// ========================================
// CALCULATIONS
// ========================================

function calculateMoM(currentValue, previousValue) {
    if (!previousValue || previousValue === 0) return null;
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

function calculateYoY(currentValue, lastYearValue) {
    if (!lastYearValue || lastYearValue === 0) return null;
    return ((currentValue - lastYearValue) / Math.abs(lastYearValue)) * 100;
}

function calculatePencapaian(ratioKey, currentValue) {
    const config = RATIO_TARGETS[ratioKey];
    if (!config) return 100;
    
    const target = config.target;
    
    if (config.withinRange) {
        if (currentValue >= config.min && currentValue <= config.max) {
            return 100;
        } else if (currentValue < config.min) {
            return (currentValue / config.min) * 100;
        } else {
            return (config.max / currentValue) * 100;
        }
    } else if (config.lowerIsBetter) {
        if (currentValue === 0) return 100;
        return (target / currentValue) * 100;
    } else {
        return (currentValue / target) * 100;
    }
}

function getStatusBadge(ratioKey, currentValue) {
    const config = RATIO_TARGETS[ratioKey];
    if (!config) return { class: 'success', text: 'Baik' };
    
    const pencapaian = calculatePencapaian(ratioKey, currentValue);
    
    if (pencapaian >= 100) {
        return { class: 'success', text: 'Tercapai' };
    } else if (pencapaian >= 80) {
        return { class: 'warning', text: 'Hampir Tercapai' };
    } else {
        return { class: 'danger', text: 'Belum Tercapai' };
    }
}

// ========================================
// GET COMPREHENSIVE RATIO DATA
// ========================================

function getRatioAnalysis(ratioKey) {
    const fbData = getFirebaseRatioData();
    if (!fbData) return null;
    
    const { neraca, filters } = fbData;
    let targetKode = getTargetKode(filters);
    const currentPeriode = filters.periode;
    
    // Parse current periode
    const [year, month] = currentPeriode.split('-').map(Number);
    
    // Calculate previous periods
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevPeriode = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    const yoyPeriode = `${year - 1}-${String(month).padStart(2, '0')}`;
    
    // Get current value
    let currentValue = getRatioValue(neraca, currentPeriode, targetKode, ratioKey);
    
    // Jika tidak ada data untuk cabang spesifik, fallback ke ALL
    if (currentValue === null && targetKode !== 'ALL') {
        console.log(`No ratio for ${targetKode}, falling back to ALL`);
        targetKode = 'ALL';
        currentValue = getRatioValue(neraca, currentPeriode, targetKode, ratioKey);
    }
    
    if (currentValue === null) {
        console.warn(`No ratio data for ${ratioKey} in ${currentPeriode} for ${targetKode}`);
        return null;
    }
    
    // Get previous month value (for MoM)
    const prevMonthValue = getRatioValue(neraca, prevPeriode, targetKode, ratioKey);
    
    // Get YoY value (from Firebase or fallback to static data)
    let yoyValue = getRatioValue(neraca, yoyPeriode, targetKode, ratioKey);
    if (yoyValue === null && RATIO_DATA_2024[ratioKey]) {
        yoyValue = RATIO_DATA_2024[ratioKey][month - 1];
    }
    
    // Get all monthly data for the current year (for charts)
    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
        const periode = `${year}-${String(m).padStart(2, '0')}`;
        const value = getRatioValue(neraca, periode, targetKode, ratioKey);
        monthlyData.push({
            month: MONTH_NAMES[m - 1],
            monthNum: m,
            value: value,
            target: RATIO_TARGETS[ratioKey]?.target || 0
        });
    }
    
    // Calculate metrics
    const mom = calculateMoM(currentValue, prevMonthValue);
    const yoy = calculateYoY(currentValue, yoyValue);
    const pencapaian = calculatePencapaian(ratioKey, currentValue);
    const status = getStatusBadge(ratioKey, currentValue);
    
    return {
        ratioKey,
        currentValue,
        prevMonthValue,
        yoyValue,
        target: RATIO_TARGETS[ratioKey]?.target || 0,
        mom,
        yoy,
        pencapaian,
        status,
        monthlyData,
        currentPeriode,
        targetKode
    };
}

// ========================================
// UPDATE UI FUNCTIONS
// ========================================

function updateRatioLayer3Summary(ratioKey) {
    const analysis = getRatioAnalysis(ratioKey);
    
    if (!analysis) {
        console.warn(`No analysis data for ${ratioKey}`);
        // Set default values
        const els = ['ratioLayer3NilaiTerakhir', 'ratioLayer3Target', 'ratioLayer3Pencapaian', 'ratioLayer3MoM', 'ratioLayer3YoY'];
        els.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'N/A';
        });
        return;
    }
    
    console.log(`📊 Layer3 Analysis for ${ratioKey}:`, analysis);
    
    // Update label
    const labelEl = document.getElementById('ratioLayer3SelectedMetric');
    if (labelEl) labelEl.textContent = ratioKey;
    
    // Update cards
    const nilaiTerakhirEl = document.getElementById('ratioLayer3NilaiTerakhir');
    const targetEl = document.getElementById('ratioLayer3Target');
    const pencapaianEl = document.getElementById('ratioLayer3Pencapaian');
    const momEl = document.getElementById('ratioLayer3MoM');
    const yoyEl = document.getElementById('ratioLayer3YoY');
    
    if (nilaiTerakhirEl) {
        nilaiTerakhirEl.textContent = `${analysis.currentValue.toFixed(2)}%`;
    }
    
    if (targetEl) {
        targetEl.textContent = `${analysis.target}%`;
    }
    
    if (pencapaianEl) {
        pencapaianEl.textContent = `${analysis.pencapaian.toFixed(2)}%`;
        pencapaianEl.className = `layer3-card-value ${analysis.pencapaian >= 100 ? 'positive' : 'negative'}`;
    }
    
    if (momEl) {
        if (analysis.mom !== null) {
            const momVal = analysis.mom;
            momEl.textContent = `${momVal >= 0 ? '+' : ''}${momVal.toFixed(2)}%`;
            
            const lowerIsBetter = RATIO_TARGETS[ratioKey]?.lowerIsBetter || false;
            const isPositiveChange = lowerIsBetter ? (momVal <= 0) : (momVal >= 0);
            momEl.className = `layer3-card-value ${isPositiveChange ? 'positive' : 'negative'}`;
        } else {
            momEl.textContent = 'N/A';
            momEl.className = 'layer3-card-value';
        }
    }
    
    if (yoyEl) {
        if (analysis.yoy !== null) {
            const yoyVal = analysis.yoy;
            yoyEl.textContent = `${yoyVal >= 0 ? '+' : ''}${yoyVal.toFixed(2)}%`;
            
            const lowerIsBetter = RATIO_TARGETS[ratioKey]?.lowerIsBetter || false;
            const isPositiveChange = lowerIsBetter ? (yoyVal <= 0) : (yoyVal >= 0);
            yoyEl.className = `layer3-card-value ${isPositiveChange ? 'positive' : 'negative'}`;
        } else {
            yoyEl.textContent = 'N/A';
            yoyEl.className = 'layer3-card-value';
        }
    }
}

// ========================================
// RENDER CHARTS WITH APEXCHARTS
// ========================================

function renderRatioYoYChart(ratioKey) {
    const container = document.getElementById('ratioLayer3YoYChart');
    if (!container) return;
    
    const analysis = getRatioAnalysis(ratioKey);
    if (!analysis) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">Data tidak tersedia</div>';
        return;
    }
    
    // Destroy existing chart
    if (ratioYoYChartInstance) {
        ratioYoYChartInstance.destroy();
    }
    
    const currentYearData = analysis.monthlyData.map(d => d.value !== null ? parseFloat(d.value.toFixed(2)) : null);
    const prevYearData = RATIO_DATA_2024[ratioKey] || Array(12).fill(null);
    const targetLine = Array(12).fill(analysis.target);
    
    const options = {
        series: [
            {
                name: '2025',
                data: currentYearData
            },
            {
                name: '2024',
                data: prevYearData
            },
            {
                name: 'Target',
                data: targetLine
            }
        ],
        chart: {
            type: 'line',
            height: 280,
            toolbar: { show: false },
            animations: { enabled: true }
        },
        colors: ['#2563eb', '#94a3b8', '#dc2626'],
        stroke: {
            width: [3, 2, 2],
            dashArray: [0, 5, 3]
        },
        markers: {
            size: [4, 3, 0]
        },
        xaxis: {
            categories: MONTH_NAMES
        },
        yaxis: {
            title: { text: '%' },
            labels: {
                formatter: val => val ? val.toFixed(1) + '%' : ''
            }
        },
        legend: {
            position: 'bottom'
        },
        title: {
            text: `${ratioKey} - Year over Year`,
            align: 'center',
            style: { fontSize: '14px' }
        },
        tooltip: {
            y: {
                formatter: val => val ? val.toFixed(2) + '%' : 'N/A'
            }
        }
    };
    
    ratioYoYChartInstance = new ApexCharts(container, options);
    ratioYoYChartInstance.render();
}

function renderRatioYTDChart(ratioKey) {
    const container = document.getElementById('ratioLayer3YTDChart');
    if (!container) return;
    
    const analysis = getRatioAnalysis(ratioKey);
    if (!analysis) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">Data tidak tersedia</div>';
        return;
    }
    
    if (ratioYTDChartInstance) {
        ratioYTDChartInstance.destroy();
    }
    
    const validData = analysis.monthlyData.filter(d => d.value !== null);
    const values = validData.map(d => parseFloat(d.value.toFixed(2)));
    const labels = validData.map(d => d.month);
    
    // Determine colors based on achievement
    const colors = validData.map(d => {
        const pencapaian = calculatePencapaian(ratioKey, d.value);
        return pencapaian >= 100 ? '#22c55e' : pencapaian >= 80 ? '#eab308' : '#ef4444';
    });
    
    const options = {
        series: [{
            name: ratioKey,
            data: values
        }],
        chart: {
            type: 'bar',
            height: 280,
            toolbar: { show: false }
        },
        colors: colors,
        plotOptions: {
            bar: {
                distributed: true,
                borderRadius: 4,
                columnWidth: '60%'
            }
        },
        xaxis: {
            categories: labels
        },
        yaxis: {
            title: { text: '%' },
            labels: {
                formatter: val => val.toFixed(1) + '%'
            }
        },
        legend: { show: false },
        title: {
            text: `${ratioKey} - Year to Date`,
            align: 'center',
            style: { fontSize: '14px' }
        },
        annotations: {
            yaxis: [{
                y: analysis.target,
                borderColor: '#dc2626',
                borderWidth: 2,
                strokeDashArray: 5,
                label: {
                    text: `Target: ${analysis.target}%`,
                    style: { color: '#dc2626', background: '#fff' }
                }
            }]
        },
        tooltip: {
            y: {
                formatter: val => val.toFixed(2) + '%'
            }
        }
    };
    
    ratioYTDChartInstance = new ApexCharts(container, options);
    ratioYTDChartInstance.render();
}

function renderRatioMoMChart(ratioKey) {
    const container = document.getElementById('ratioLayer3MoMChart');
    if (!container) return;
    
    const analysis = getRatioAnalysis(ratioKey);
    if (!analysis) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">Data tidak tersedia</div>';
        return;
    }
    
    if (ratioMoMChartInstance) {
        ratioMoMChartInstance.destroy();
    }
    
    // Calculate MoM changes
    const momChanges = [];
    const validData = analysis.monthlyData.filter(d => d.value !== null);
    
    for (let i = 1; i < validData.length; i++) {
        const change = ((validData[i].value - validData[i-1].value) / Math.abs(validData[i-1].value)) * 100;
        momChanges.push({
            month: validData[i].month,
            change: parseFloat(change.toFixed(2))
        });
    }
    
    if (momChanges.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">Data MoM tidak cukup</div>';
        return;
    }
    
    const lowerIsBetter = RATIO_TARGETS[ratioKey]?.lowerIsBetter || false;
    
    const colors = momChanges.map(d => {
        const isGood = lowerIsBetter ? (d.change <= 0) : (d.change >= 0);
        return isGood ? '#22c55e' : '#ef4444';
    });
    
    const options = {
        series: [{
            name: 'MoM Change',
            data: momChanges.map(d => d.change)
        }],
        chart: {
            type: 'bar',
            height: 280,
            toolbar: { show: false }
        },
        colors: colors,
        plotOptions: {
            bar: {
                distributed: true,
                borderRadius: 4,
                columnWidth: '60%'
            }
        },
        xaxis: {
            categories: momChanges.map(d => d.month)
        },
        yaxis: {
            title: { text: 'Change (%)' },
            labels: {
                formatter: val => (val >= 0 ? '+' : '') + val.toFixed(1) + '%'
            }
        },
        legend: { show: false },
        title: {
            text: `${ratioKey} - Month over Month Changes`,
            align: 'center',
            style: { fontSize: '14px' }
        },
        tooltip: {
            y: {
                formatter: val => (val >= 0 ? '+' : '') + val.toFixed(2) + '%'
            }
        }
    };
    
    ratioMoMChartInstance = new ApexCharts(container, options);
    ratioMoMChartInstance.render();
}

// ========================================
// UPDATE COMPARISON TABLE
// ========================================

function updateRatioComparisonTable() {
    const tbody = document.getElementById('ratioComparisonBody');
    if (!tbody) return;
    
    const ratioKeys = ['CAR', 'LDR', 'NPL', 'ROA', 'ROE', 'NIM', 'BOPO', 'CASA'];
    
    let html = '';
    
    ratioKeys.forEach(key => {
        const analysis = getRatioAnalysis(key);
        
        if (analysis) {
            const momDisplay = analysis.mom !== null 
                ? `${analysis.mom >= 0 ? '+' : ''}${analysis.mom.toFixed(2)}%` 
                : 'N/A';
            const yoyDisplay = analysis.yoy !== null 
                ? `${analysis.yoy >= 0 ? '+' : ''}${analysis.yoy.toFixed(2)}%` 
                : 'N/A';
            
            const lowerIsBetter = RATIO_TARGETS[key]?.lowerIsBetter || false;
            const momClass = analysis.mom !== null 
                ? (lowerIsBetter ? (analysis.mom <= 0 ? 'positive' : 'negative') : (analysis.mom >= 0 ? 'positive' : 'negative'))
                : '';
            const yoyClass = analysis.yoy !== null 
                ? (lowerIsBetter ? (analysis.yoy <= 0 ? 'positive' : 'negative') : (analysis.yoy >= 0 ? 'positive' : 'negative'))
                : '';
            
            html += `
                <tr onclick="changeRatioLayer3Metric('${key}')" style="cursor:pointer;" class="${key === currentSelectedRatio ? 'selected' : ''}">
                    <td><strong>${key}</strong></td>
                    <td>${analysis.currentValue.toFixed(2)}%</td>
                    <td>${analysis.target}%</td>
                    <td>${analysis.pencapaian.toFixed(2)}%</td>
                    <td class="${momClass}">${momDisplay}</td>
                    <td class="${yoyClass}">${yoyDisplay}</td>
                    <td><span class="badge badge-${analysis.status.class}">${analysis.status.text}</span></td>
                </tr>
            `;
        } else {
            html += `
                <tr onclick="changeRatioLayer3Metric('${key}')" style="cursor:pointer;">
                    <td><strong>${key}</strong></td>
                    <td colspan="6" style="text-align:center;color:#999;">Data tidak tersedia</td>
                </tr>
            `;
        }
    });
    
    tbody.innerHTML = html;
}

// ========================================
// MAIN FUNCTIONS
// ========================================

function changeRatioLayer3Metric(ratioKey) {
    currentSelectedRatio = ratioKey;
    
    console.log(`📊 Switching to ratio: ${ratioKey}`);
    
    updateRatioLayer3Summary(ratioKey);
    renderRatioYoYChart(ratioKey);
    renderRatioYTDChart(ratioKey);
    renderRatioMoMChart(ratioKey);
    
    // Highlight selected row in table
    const rows = document.querySelectorAll('#ratioComparisonBody tr');
    rows.forEach(row => {
        row.classList.remove('selected');
        if (row.querySelector('td strong')?.textContent === ratioKey) {
            row.classList.add('selected');
        }
    });
}

function initRatioLayer3() {
    console.log('🚀 Initializing Ratio Layer 3...');
    
    // Check ApexCharts
    if (typeof ApexCharts === 'undefined') {
        console.warn('ApexCharts not loaded, retrying in 500ms...');
        setTimeout(initRatioLayer3, 500);
        return;
    }
    
    if (typeof DashboardFirebase === 'undefined') {
        console.warn('DashboardFirebase not available, retrying in 500ms...');
        setTimeout(initRatioLayer3, 500);
        return;
    }
    
    const fbData = getFirebaseRatioData();
    if (!fbData || !fbData.neraca || fbData.neraca.length === 0) {
        console.warn('No Firebase data available, retrying in 500ms...');
        setTimeout(initRatioLayer3, 500);
        return;
    }
    
    const ratioCount = fbData.neraca.filter(d => d.is_ratio === true).length;
    console.log(`📊 Found ${ratioCount} ratio records in Firebase`);
    
    if (ratioCount === 0) {
        console.warn('No ratio data in Firebase');
        return;
    }
    
    changeRatioLayer3Metric('CAR');
    updateRatioComparisonTable();
    
    console.log('✅ Ratio Layer 3 initialized successfully');
}

function refreshRatioLayer3() {
    console.log('🔄 Refreshing Ratio Layer 3...');
    changeRatioLayer3Metric(currentSelectedRatio);
    updateRatioComparisonTable();
}

// ========================================
// INITIALIZE ON DOM READY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initRatioLayer3, 1500);
});

// Make functions available globally
window.changeRatioLayer3Metric = changeRatioLayer3Metric;
window.initRatioLayer3 = initRatioLayer3;
window.refreshRatioLayer3 = refreshRatioLayer3;
window.RatioLayer3 = {
    init: initRatioLayer3,
    refresh: refreshRatioLayer3,
    changeMetric: changeRatioLayer3Metric
};
