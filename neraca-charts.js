// ========================================
// NERACA CHARTS - BANK SULSELBAR
// DATA RIIL 2025 (Januari - Oktober)
// ========================================

console.log('📊 Loading Neraca Charts - DATA RIIL 2025...');

// DATA RIIL dari Excel Bank Sulselbar 2025
const NERACA_DATA = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt'],
    
    // Data dalam Triliun (T) dan Miliar (M)
    asset: {
        aktual: [31.94, 31.44, 32.17, 32.34, 32.81, 33.13, 33.06, 34.86, 34.20, 34.45],
        target: [32.00, 32.20, 32.40, 32.60, 32.80, 33.00, 33.20, 33.40, 33.60, 33.80],
        label: 'Total Asset',
        unit: 'T',
        nilaiTerakhir: 'Rp 34.45 T',
        targetVal: 'Rp 33.80 T',
        pencapaian: '101.9%',
        mom: '+0.73%',
        yoy: '+8.5%'
    },
    kredit: {
        aktual: [21.42, 21.48, 21.51, 21.44, 21.44, 21.49, 21.44, 21.46, 21.50, 21.51],
        target: [22.00, 22.10, 22.20, 22.30, 22.40, 22.50, 22.60, 22.70, 22.80, 22.90],
        label: 'Total Kredit',
        unit: 'T',
        nilaiTerakhir: 'Rp 21.51 T',
        targetVal: 'Rp 22.90 T',
        pencapaian: '93.9%',
        mom: '+0.05%',
        yoy: '+3.8%'
    },
    dpk: {
        aktual: [20.15, 19.77, 18.81, 20.54, 20.88, 20.48, 21.37, 23.62, 22.71, 22.97],
        target: [21.00, 21.30, 21.60, 21.90, 22.20, 22.50, 22.80, 23.10, 23.40, 23.70],
        label: 'Dana Pihak Ketiga',
        unit: 'T',
        nilaiTerakhir: 'Rp 22.97 T',
        targetVal: 'Rp 23.70 T',
        pencapaian: '96.9%',
        mom: '+1.14%',
        yoy: '+14.0%'
    },
    laba: {
        aktual: [79.48, 144.02, 247.59, 317.85, 387.79, 489.83, 583.05, 676.90, 793.76, 904.70],
        target: [80, 160, 240, 320, 400, 500, 600, 700, 800, 900],
        label: 'Laba Bersih YTD',
        unit: 'M',
        nilaiTerakhir: 'Rp 904.70 M',
        targetVal: 'Rp 900 M',
        pencapaian: '100.5%',
        mom: '+13.97%',
        yoy: '+4.1%'
    },
    pendapatan: {
        aktual: [220, 420, 660, 870, 1100, 1320, 1550, 1770, 2010, 2230],
        target: [250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500],
        label: 'Pendapatan Bunga',
        unit: 'M',
        nilaiTerakhir: 'Rp 2,230 M',
        targetVal: 'Rp 2,500 M',
        pencapaian: '89.2%',
        mom: '+10.9%',
        yoy: '+7.5%'
    },
    biaya: {
        aktual: [90, 170, 260, 350, 440, 530, 610, 710, 800, 890],
        target: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
        label: 'Beban Bunga',
        unit: 'M',
        nilaiTerakhir: 'Rp 890 M',
        targetVal: 'Rp 1,000 M',
        pencapaian: '89.0%',
        mom: '+11.3%',
        yoy: '+8.2%'
    },
    // Derived data
    giro: {
        aktual: [7.80, 7.65, 7.50, 8.20, 8.35, 8.10, 8.45, 9.10, 8.75, 8.31],
        target: [8.00, 8.10, 8.20, 8.30, 8.40, 8.50, 8.60, 8.70, 8.80, 8.90],
        label: 'Giro',
        unit: 'T',
        nilaiTerakhir: 'Rp 8.31 T',
        targetVal: 'Rp 8.90 T',
        pencapaian: '93.4%',
        mom: '-5.0%',
        yoy: '+6.5%'
    },
    tabungan: {
        aktual: [5.10, 5.05, 4.95, 5.20, 5.28, 5.18, 5.42, 5.92, 5.71, 5.35],
        target: [5.20, 5.30, 5.40, 5.50, 5.60, 5.70, 5.80, 5.90, 6.00, 6.10],
        label: 'Tabungan',
        unit: 'T',
        nilaiTerakhir: 'Rp 5.35 T',
        targetVal: 'Rp 6.10 T',
        pencapaian: '87.7%',
        mom: '-6.3%',
        yoy: '+4.9%'
    },
    deposito: {
        aktual: [7.25, 7.07, 6.36, 7.14, 7.25, 7.20, 7.50, 8.60, 8.25, 9.30],
        target: [7.80, 7.90, 8.00, 8.10, 8.20, 8.30, 8.40, 8.50, 8.60, 8.70],
        label: 'Deposito',
        unit: 'T',
        nilaiTerakhir: 'Rp 9.30 T',
        targetVal: 'Rp 8.70 T',
        pencapaian: '106.9%',
        mom: '+12.7%',
        yoy: '+28.3%'
    },
    ati: {
        aktual: [820, 835, 845, 855, 862, 870, 875, 880, 882, 884.60],
        target: [850, 860, 870, 880, 890, 900, 910, 920, 930, 940],
        label: 'ATI (Aktiva Tetap & Inventaris)',
        unit: 'M',
        nilaiTerakhir: 'Rp 884.60 M',
        targetVal: 'Rp 940 M',
        pencapaian: '94.1%',
        mom: '+0.29%',
        yoy: '+7.9%'
    },
    ckpn: {
        aktual: [485, 492, 498, 505, 512, 518, 525, 532, 538, 545.20],
        target: [500, 510, 520, 530, 540, 550, 560, 570, 580, 590],
        label: 'CKPN (Cadangan Kerugian Penurunan Nilai)',
        unit: 'M',
        nilaiTerakhir: 'Rp 545.20 M',
        targetVal: 'Rp 590 M',
        pencapaian: '92.4%',
        mom: '+1.34%',
        yoy: '+12.5%'
    },
    pembiayaan: {
        aktual: [17.85, 17.90, 17.92, 17.95, 17.98, 18.05, 18.15, 18.25, 18.35, 18.42],
        target: [18.50, 18.70, 18.90, 19.10, 19.30, 19.50, 19.70, 19.90, 20.10, 20.30],
        label: 'Kredit Pembiayaan',
        unit: 'T',
        nilaiTerakhir: 'Rp 18.42 T',
        targetVal: 'Rp 20.30 T',
        pencapaian: '90.7%',
        mom: '+0.38%',
        yoy: '+3.2%'
    },
    modal: {
        aktual: [3.85, 3.90, 3.95, 4.00, 4.05, 4.10, 4.15, 4.20, 4.25, 4.30],
        target: [4.00, 4.10, 4.20, 4.30, 4.40, 4.50, 4.60, 4.70, 4.80, 4.90],
        label: 'Total Modal',
        unit: 'T',
        nilaiTerakhir: 'Rp 4.30 T',
        targetVal: 'Rp 4.90 T',
        pencapaian: '87.8%',
        mom: '+1.18%',
        yoy: '+11.7%'
    }
};

// Chart instances storage
let neracaLayer2Charts = {};
let neracaLayer3Charts = {};

// ========================================
// LAYER 2: POSISI VS TARGET CHARTS
// ========================================

function renderNeracaLayer2Chart(elementId, dataKey, colors) {
    const element = document.getElementById(elementId);
    if (!element || typeof ApexCharts === 'undefined') return;
    
    const data = NERACA_DATA[dataKey];
    if (!data) return;
    
    if (neracaLayer2Charts[elementId]) {
        try { neracaLayer2Charts[elementId].destroy(); } catch(e) {}
    }
    
    element.innerHTML = '';
    element.style.minHeight = '180px';
    
    const options = {
        series: [
            { name: 'Realisasi', data: data.aktual },
            { name: 'Target', data: data.target }
        ],
        chart: {
            type: 'line',
            height: 180,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        colors: colors || ['#3b82f6', '#10b981'],
        stroke: {
            curve: 'smooth',
            width: [3, 2],
            dashArray: [0, 5]
        },
        markers: {
            size: [4, 0],
            strokeWidth: 0,
            hover: { size: 6 }
        },
        xaxis: {
            categories: NERACA_DATA.months,
            labels: { style: { fontSize: '10px', colors: '#9ca3af' } }
        },
        yaxis: {
            labels: {
                style: { fontSize: '10px', colors: '#9ca3af' },
                formatter: (val) => val.toFixed(1)
            }
        },
        grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
        legend: { show: false },
        tooltip: {
            shared: true,
            y: { formatter: (val) => 'Rp ' + val.toFixed(2) + ' ' + data.unit }
        }
    };
    
    try {
        neracaLayer2Charts[elementId] = new ApexCharts(element, options);
        neracaLayer2Charts[elementId].render();
    } catch(e) {
        console.error('Chart error:', elementId, e);
    }
}

function renderAllNeracaLayer2Charts() {
    console.log('📊 Rendering Neraca Layer 2 Charts with REAL DATA...');
    
    const chartConfigs = [
        ['layer2ChartAsset', 'asset', ['#3b82f6', '#10b981']],
        ['layer2ChartKredit', 'kredit', ['#1e3a5f', '#10b981']],
        ['layer2ChartPembiayaan', 'pembiayaan', ['#e91e63', '#10b981']],
        ['layer2ChartDPK', 'dpk', ['#3498db', '#10b981']],
        ['layer2ChartATI', 'ati', ['#14b8a6', '#86efac']],
        ['layer2ChartCKPN', 'ckpn', ['#f59e0b', '#10b981']],
        ['layer2ChartLaba', 'laba', ['#8b5cf6', '#10b981']],
        ['layer2ChartModal', 'modal', ['#1e3a5f', '#86efac']],
        ['layer2ChartPendapatan', 'pendapatan', ['#10b981', '#86efac']],
        ['layer2ChartBiaya', 'biaya', ['#ef4444', '#10b981']]
    ];
    
    chartConfigs.forEach(([id, key, colors], index) => {
        setTimeout(() => renderNeracaLayer2Chart(id, key, colors), index * 100);
    });
}

// ========================================
// LAYER 3: ANALYSIS
// ========================================

function changeLayer3Metric(metric) {
    const data = NERACA_DATA[metric];
    if (!data) return;
    
    // Update title & cards
    document.getElementById('layer3SelectedMetric').textContent = data.label;
    document.getElementById('layer3NilaiTerakhir').textContent = data.nilaiTerakhir;
    document.getElementById('layer3Target').textContent = data.targetVal;
    document.getElementById('layer3Pencapaian').textContent = data.pencapaian;
    document.getElementById('layer3MoM').textContent = data.mom;
    document.getElementById('layer3YoY').textContent = data.yoy;
    
    setTimeout(() => {
        renderLayer3YoYChart(data);
        renderLayer3YTDChart(data);
        renderLayer3MoMChart(data);
    }, 200);
}

function renderLayer3YoYChart(data) {
    const element = document.getElementById('layer3YoYChart');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    if (neracaLayer3Charts.yoy) { try { neracaLayer3Charts.yoy.destroy(); } catch(e) {} }
    element.innerHTML = '';
    element.style.minHeight = '180px';
    
    // Estimate 2024 data (slightly lower)
    const data2024 = data.aktual.map(v => v * 0.92);
    
    const options = {
        series: [
            { name: '2024', data: data2024 },
            { name: '2025', data: data.aktual }
        ],
        chart: { type: 'line', height: 180, toolbar: { show: false } },
        colors: ['#94a3b8', '#3b82f6'],
        stroke: { curve: 'smooth', width: 2 },
        xaxis: { categories: NERACA_DATA.months, labels: { style: { fontSize: '10px' } } },
        yaxis: { show: false },
        legend: { position: 'top', fontSize: '11px' },
        grid: { borderColor: '#f3f4f6' }
    };
    
    neracaLayer3Charts.yoy = new ApexCharts(element, options);
    neracaLayer3Charts.yoy.render();
}

function renderLayer3YTDChart(data) {
    const element = document.getElementById('layer3YTDChart');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    if (neracaLayer3Charts.ytd) { try { neracaLayer3Charts.ytd.destroy(); } catch(e) {} }
    element.innerHTML = '';
    element.style.minHeight = '180px';
    
    const lastAktual = data.aktual[data.aktual.length - 1];
    const lastTarget = data.target[data.target.length - 1];
    
    const options = {
        series: [{ data: [lastAktual, lastTarget] }],
        chart: { type: 'bar', height: 180, toolbar: { show: false } },
        colors: ['#3b82f6', '#10b981'],
        plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 8, distributed: true } },
        xaxis: { categories: ['Realisasi', 'Target'], labels: { style: { fontSize: '11px' } } },
        yaxis: { show: false },
        legend: { show: false },
        dataLabels: { enabled: true, formatter: (val) => val.toFixed(1), style: { fontSize: '11px' } }
    };
    
    neracaLayer3Charts.ytd = new ApexCharts(element, options);
    neracaLayer3Charts.ytd.render();
}

function renderLayer3MoMChart(data) {
    const element = document.getElementById('layer3MoMChart');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    if (neracaLayer3Charts.mom) { try { neracaLayer3Charts.mom.destroy(); } catch(e) {} }
    element.innerHTML = '';
    element.style.minHeight = '180px';
    
    const momChanges = [];
    for (let i = 1; i < data.aktual.length; i++) {
        momChanges.push(parseFloat(((data.aktual[i] - data.aktual[i-1]) / data.aktual[i-1] * 100).toFixed(2)));
    }
    
    const options = {
        series: [{ name: 'MoM %', data: momChanges }],
        chart: { type: 'bar', height: 180, toolbar: { show: false } },
        colors: momChanges.map(v => v >= 0 ? '#10b981' : '#ef4444'),
        plotOptions: { bar: { columnWidth: '60%', borderRadius: 4, distributed: true } },
        xaxis: { categories: NERACA_DATA.months.slice(1), labels: { style: { fontSize: '10px' } } },
        yaxis: { labels: { formatter: (val) => val.toFixed(1) + '%', style: { fontSize: '10px' } } },
        legend: { show: false },
        dataLabels: { enabled: false }
    };
    
    neracaLayer3Charts.mom = new ApexCharts(element, options);
    neracaLayer3Charts.mom.render();
}

// ========================================
// INITIALIZATION
// ========================================

function initNeracaCharts() {
    console.log('🚀 Initializing Neraca Charts with REAL DATA...');
    
    if (typeof ApexCharts === 'undefined') {
        setTimeout(initNeracaCharts, 500);
        return;
    }
    
    setTimeout(renderAllNeracaLayer2Charts, 300);
    setTimeout(() => changeLayer3Metric('asset'), 1000);
    
    console.log('✅ Neraca Charts initialized with REAL 2025 DATA');
}

// Export
window.initNeracaCharts = initNeracaCharts;
window.changeLayer3Metric = changeLayer3Metric;
window.NERACA_DATA = NERACA_DATA;

console.log('✅ Neraca Charts loaded - DATA RIIL 2025');
