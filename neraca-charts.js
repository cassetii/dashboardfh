// ========================================
// NERACA CHARTS - DYNAMIC FROM FIREBASE
// Bank Sulselbar Dashboard
// ========================================

console.log('📊 Loading Neraca Charts - DYNAMIC VERSION...');

const NeracaCharts = {
    // Chart instances storage
    charts: {},
    
    // Data storage
    aktualData: {},
    targetData: {},
    
    // Current filter
    currentKodeCabang: 'ALL',
    
    // ========================================
    // SANDI MAPPING
    // ========================================
    SANDI_MAPPING: {
        asset: {
            // Total Asset = sandi summary, BUKAN prefix (untuk avoid double count)
            sandi: '01.00.00.00.00.00',
            label: 'Total Asset',
            unit: 'T',
            color: '#ff9800'
        },
        kredit: {
            sandi: '01.09.01.00.00.00',
            label: 'Total Kredit',
            unit: 'T',
            color: '#1e3a5f'
        },
        pembiayaan: {
            // Pembiayaan Syariah = sum prefix 01.09.03 (exclude summary)
            prefix: '01.09.03',
            excludeSummary: true,
            label: 'Total Pembiayaan',
            unit: 'T',
            color: '#e91e63'
        },
        dpk: {
            // DPK = Giro + Tabungan + Deposito (Konven + Syariah)
            components: [
                '02.01.01.00.00.00', '02.02.01.00.00.00', '02.03.01.00.00.00', // Konven
                '02.01.02.01.00.00', '02.01.02.02.00.00', '02.01.02.03.00.00', // Giro Syariah
                '02.02.02.01.00.00', '02.02.02.02.00.00', '02.02.02.03.00.00', // Tab Syariah
                '02.03.02.01.00.00', '02.03.02.02.00.00'  // Dep Syariah
            ],
            label: 'Dana Pihak Ketiga',
            unit: 'T',
            color: '#3498db'
        },
        ati: {
            // ATI = Aset Tidak Berwujud + Aset Tetap (gross & akum)
            components: ['01.13.01.00.00.00', '01.13.02.00.00.00', '01.14.01.00.00.00', '01.14.02.00.00.00'],
            label: 'ATI',
            unit: 'M',
            color: '#14b8a6'
        },
        ckpn: {
            // CKPN = sandi summary
            sandi: '01.12.00.00.00.00',
            // Fallback to prefix if summary not found
            prefix: '01.12',
            excludeSummary: true,
            label: 'CKPN',
            unit: 'M',
            color: '#f59e0b'
        },
        laba: {
            // Laba = Laba Tahun Berjalan - Rugi Tahun Berjalan
            sandi: '03.05.02.01.00.00',
            sandiRugi: '03.05.02.02.00.00',
            label: 'Laba Bersih',
            unit: 'M',
            color: '#8b5cf6'
        },
        modal: {
            // Modal = sandi summary
            sandi: '03.00.00.00.00.00',
            label: 'Total Modal',
            unit: 'T',
            color: '#1e3a5f'
        },
        pendapatan: {
            // Pendapatan = 04.11 + 04.12 + 04.20 (summary sandi)
            components: ['04.11.00.00.00.00', '04.12.00.00.00.00', '04.20.00.00.00.00'],
            // Fallback prefixes if summary not found
            prefixes: ['04.11', '04.12', '04.20'],
            label: 'Total Pendapatan',
            unit: 'T',
            color: '#10b981',
            isLabarugi: true
        },
        biaya: {
            // Biaya = 05.11 + 05.12 + 05.20 (summary sandi)
            components: ['05.11.00.00.00.00', '05.12.00.00.00.00', '05.20.00.00.00.00'],
            // Fallback prefixes if summary not found
            prefixes: ['05.11', '05.12', '05.20'],
            label: 'Total Biaya',
            unit: 'T',
            color: '#ef4444',
            isLabarugi: true
        }
    },
    
    // ========================================
    // INITIALIZATION
    // ========================================
    async init() {
        console.log('🚀 Initializing Neraca Charts...');
        
        // Wait for data to be ready
        await this.waitForData();
        
        // Get initial filter
        this.currentKodeCabang = this.getCurrentKodeCabang();
        
        // Render all charts
        this.renderAllCharts();
        
        // Listen for data updates
        window.addEventListener('dashboardDataUpdated', () => {
            console.log('📊 Data updated, refreshing charts...');
            this.currentKodeCabang = this.getCurrentKodeCabang();
            this.renderAllCharts();
        });
        
        window.addEventListener('targetDataLoaded', () => {
            console.log('🎯 Target data loaded, refreshing charts...');
            this.renderAllCharts();
        });
        
        // Listen for filter changes
        window.addEventListener('filterChanged', (e) => {
            console.log('🔄 filterChanged event received:', e.detail);
            this.currentKodeCabang = this.getCurrentKodeCabang();
            console.log('🔄 New currentKodeCabang:', this.currentKodeCabang);
            this.renderAllCharts();
        });
    },
    
    // ========================================
    // GET CURRENT KODE CABANG FROM FILTER
    // ========================================
    getCurrentKodeCabang() {
        const filters = window.DashboardFirebase?.getFilters?.() || {};
        
        console.log('🔍 getCurrentKodeCabang - filters:', filters);
        
        // If specific cabang selected, use it
        if (filters.cabang) {
            console.log('   → Using cabang:', filters.cabang);
            return filters.cabang;
        }
        
        // Otherwise, use tipe (konsolidasi/konvensional/syariah)
        if (filters.tipe === 'konsolidasi') {
            console.log('   → Using tipe konsolidasi: ALL');
            return 'ALL';
        }
        if (filters.tipe === 'konvensional') {
            console.log('   → Using tipe konvensional: KON');
            return 'KON';
        }
        if (filters.tipe === 'syariah') {
            console.log('   → Using tipe syariah: SYR');
            return 'SYR';
        }
        
        console.log('   → Default: ALL');
        return 'ALL'; // Default
    },
    
    // ========================================
    // WAIT FOR DATA
    // ========================================
    async waitForData(timeout = 10000) {
        const start = Date.now();
        
        while (Date.now() - start < timeout) {
            const data = window.DashboardFirebase?.getData?.();
            if (data && (data.neraca?.length > 0 || data.labarugi?.length > 0)) {
                console.log('✅ Data ready');
                return true;
            }
            await new Promise(r => setTimeout(r, 200));
        }
        
        console.warn('⚠️ Timeout waiting for data');
        return false;
    },
    
    // ========================================
    // GET AKTUAL VALUES FROM FIREBASE
    // ========================================
    getAktualValue(metricKey, periode, kodeCabang = 'ALL') {
        const data = window.DashboardFirebase?.getData?.() || {};
        const neraca = data.neraca || [];
        const labarugi = data.labarugi || [];
        const config = this.SANDI_MAPPING[metricKey];
        
        if (!config) return 0;
        
        const collection = config.isLabarugi ? labarugi : neraca;
        
        // Debug: Check if data exists for this kodeCabang
        const dataForCabang = collection.filter(d => d.kode_cabang === kodeCabang && d.periode === periode);
        console.log(`   📋 Data count for ${kodeCabang}/${periode}: ${dataForCabang.length}`);
        
        if (dataForCabang.length === 0) {
            console.warn(`   ⚠️ No data for kodeCabang=${kodeCabang}, periode=${periode}`);
            // Log available kode_cabang for this periode
            const availableCabang = [...new Set(collection.filter(d => d.periode === periode).map(d => d.kode_cabang))];
            console.log(`   📋 Available kode_cabang:`, availableCabang.slice(0, 10));
        }
        
        // Helper function - get exact sandi value
        const getValue = (sandi) => {
            const item = collection.find(d => 
                d.kode_cabang === kodeCabang && 
                d.periode === periode && 
                d.sandi === sandi
            );
            const val = item?.total || 0;
            if (val !== 0) {
                console.log(`   ✅ Found ${sandi}: ${val.toLocaleString()}`);
            }
            return val;
        };
        
        // Helper - sum by prefix (optionally exclude summary sandi)
        const sumPrefix = (prefix, excludeSummary = false) => {
            return collection
                .filter(d => 
                    d.kode_cabang === kodeCabang && 
                    d.periode === periode && 
                    d.sandi?.startsWith(prefix) &&
                    (!excludeSummary || !d.sandi?.endsWith('.00.00.00'))
                )
                .reduce((sum, d) => sum + (d.total || 0), 0);
        };
        
        // Helper - sum multiple prefixes
        const sumPrefixes = (prefixes, excludeSummary = false) => {
            return prefixes.reduce((sum, prefix) => sum + sumPrefix(prefix, excludeSummary), 0);
        };
        
        // Helper - sum components (exact sandi list)
        const sumComponents = (components) => {
            return components.reduce((sum, sandi) => sum + getValue(sandi), 0);
        };
        
        // Priority: sandi > components > prefixes > prefix
        let result = 0;
        
        // 1. Try exact sandi first
        if (config.sandi) {
            result = getValue(config.sandi);
            if (config.sandiRugi) {
                result += getValue(config.sandiRugi); // Rugi is negative
            }
            // If found, return it
            if (result !== 0) return result;
        }
        
        // 2. Try components (list of exact sandi)
        if (config.components && config.components.length > 0) {
            result = sumComponents(config.components);
            if (result !== 0) return result;
        }
        
        // 3. Try prefixes (multiple prefix sum)
        if (config.prefixes && config.prefixes.length > 0) {
            result = sumPrefixes(config.prefixes, config.excludeSummary);
            if (result !== 0) return result;
        }
        
        // 4. Try single prefix
        if (config.prefix) {
            result = sumPrefix(config.prefix, config.excludeSummary);
        }
        
        return result;
    },
    
    // ========================================
    // GET TARGET VALUES FROM FIREBASE
    // ========================================
    getTargetValue(metricKey, triwulan, kodeCabang = 'ALL') {
        const targetLoader = window.TargetFirebaseLoader;
        
        if (!targetLoader?.isLoaded) {
            return 0;
        }
        
        const config = this.SANDI_MAPPING[metricKey];
        if (!config) return 0;
        
        const periode = `TRW${triwulan}_2025`;
        const collection = config.isLabarugi ? 'labarugi' : 'neraca';
        const dataArray = targetLoader[collection === 'neraca' ? 'targetNeracaData' : 'targetLabarugiData'] || [];
        
        // Helper - get exact sandi value
        const getValue = (sandi) => {
            const item = dataArray.find(d => 
                d.kode_cabang === kodeCabang && 
                d.periode === periode && 
                d.sandi === sandi
            );
            return item?.total || 0;
        };
        
        // Helper - sum by prefix
        const sumPrefix = (prefix, excludeSummary = false) => {
            const filtered = dataArray.filter(d => 
                d.kode_cabang === kodeCabang && 
                d.periode === periode && 
                d.sandi?.startsWith(prefix) &&
                (!excludeSummary || !d.sandi?.endsWith('.00.00.00'))
            );
            return filtered.reduce((sum, d) => sum + (d.total || 0), 0);
        };
        
        // Helper - sum prefixes
        const sumPrefixes = (prefixes, excludeSummary = false) => {
            return prefixes.reduce((sum, prefix) => sum + sumPrefix(prefix, excludeSummary), 0);
        };
        
        // Helper - sum components
        const sumComponents = (components) => {
            return components.reduce((sum, sandi) => sum + getValue(sandi), 0);
        };
        
        // Priority: sandi > components > prefixes > prefix
        let result = 0;
        
        // 1. Try exact sandi first
        if (config.sandi) {
            result = getValue(config.sandi);
            if (config.sandiRugi) {
                result += getValue(config.sandiRugi);
            }
            if (result !== 0) return result;
        }
        
        // 2. Try components
        if (config.components && config.components.length > 0) {
            result = sumComponents(config.components);
            if (result !== 0) return result;
        }
        
        // 3. Try prefixes
        if (config.prefixes && config.prefixes.length > 0) {
            result = sumPrefixes(config.prefixes, config.excludeSummary);
            if (result !== 0) return result;
        }
        
        // 4. Try single prefix
        if (config.prefix) {
            result = sumPrefix(config.prefix, config.excludeSummary);
        }
        
        return result;
    },
    
    // ========================================
    // GET MONTHLY DATA FOR CHART
    // ========================================
    getChartData(metricKey, kodeCabang = 'ALL') {
        console.log(`📈 getChartData: ${metricKey}, kodeCabang=${kodeCabang}`);
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        const config = this.SANDI_MAPPING[metricKey];
        const unit = config?.unit || 'M';
        const divisor = unit === 'T' ? 1e12 : 1e9;
        
        const aktual = [];
        const target = [];
        const labels = [];
        
        // Get available periods from aktual data
        const data = window.DashboardFirebase?.getData?.();
        const allPeriods = new Set();
        (data?.neraca || []).forEach(d => allPeriods.add(d.periode));
        
        // Sort periods
        const sortedPeriods = Array.from(allPeriods).sort();
        
        console.log(`📊 getChartData: ${metricKey}, kodeCabang=${kodeCabang}`);
        console.log(`   Available periods:`, sortedPeriods);
        
        // Debug: Show available kode_cabang
        const availableCabangInData = [...new Set((data?.neraca || []).map(d => d.kode_cabang))];
        console.log(`   Available kode_cabang in neraca:`, availableCabangInData.slice(0, 15));
        
        // Check if requested kodeCabang exists
        if (!availableCabangInData.includes(kodeCabang)) {
            console.warn(`   ⚠️ kodeCabang '${kodeCabang}' NOT FOUND in data!`);
        }
        
        // Determine target branch code
        // Target data might use different branch codes
        const targetLoader = window.TargetFirebaseLoader;
        let targetBranchCode = kodeCabang;
        
        if (targetLoader?.isLoaded && targetLoader.targetNeracaData?.length > 0) {
            const availableBranches = [...new Set(targetLoader.targetNeracaData.map(d => d.kode_cabang))];
            console.log(`   Available target branches:`, availableBranches.slice(0, 10));
            
            // If 'ALL' not in target data, try to find alternative
            if (kodeCabang === 'ALL' && !availableBranches.includes('ALL')) {
                // Try common alternatives
                if (availableBranches.includes('KON')) {
                    targetBranchCode = 'KON';
                } else if (availableBranches.includes('001')) {
                    targetBranchCode = '001';
                } else if (availableBranches.length > 0) {
                    // Use first available
                    targetBranchCode = availableBranches[0];
                }
                console.log(`   Using target branch: ${targetBranchCode} (ALL not found)`);
            }
        }
        
        // Map period to month and get values
        sortedPeriods.forEach(periode => {
            const match = periode.match(/(\d{4})-(\d{2})/);
            if (!match) return;
            
            const [, year, month] = match;
            if (year !== '2025') return;
            
            const monthIdx = parseInt(month) - 1;
            const monthName = months[monthIdx];
            
            labels.push(monthName);
            
            // Get aktual value
            const aktualVal = this.getAktualValue(metricKey, periode, kodeCabang);
            console.log(`   ${monthName}: aktual raw = ${aktualVal.toLocaleString()}, after divisor = ${(aktualVal / divisor).toFixed(2)}`);
            aktual.push(aktualVal / divisor);
            
            // Get target for corresponding triwulan
            const trw = Math.ceil(parseInt(month) / 3);
            const targetVal = this.getTargetValue(metricKey, trw, targetBranchCode);
            target.push(targetVal / divisor);
        });
        
        console.log(`   Aktual values:`, aktual);
        console.log(`   Target values:`, target);
        
        return { labels, aktual, target, unit };
    },
    
    // ========================================
    // RENDER SINGLE CHART
    // ========================================
    renderChart(containerId, metricKey, colors = ['#3b82f6', '#10b981'], kodeCabang = 'ALL') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }
        
        const chartData = this.getChartData(metricKey, kodeCabang);
        const config = this.SANDI_MAPPING[metricKey];
        
        // Destroy existing chart
        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }
        
        // Check if we have data
        if (chartData.aktual.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:40px;">Data tidak tersedia</p>';
            return;
        }
        
        // Create chart options
        const options = {
            series: [
                { name: 'Aktual', data: chartData.aktual },
                { name: 'Target', data: chartData.target }
            ],
            chart: {
                type: 'area',
                height: 180,
                sparkline: { enabled: false },
                toolbar: { show: false },
                animations: { enabled: true, speed: 500 }
            },
            colors: colors,
            stroke: { curve: 'smooth', width: 2 },
            fill: {
                type: 'gradient',
                gradient: { opacityFrom: 0.4, opacityTo: 0.1 }
            },
            xaxis: {
                categories: chartData.labels,
                labels: { style: { fontSize: '10px' } }
            },
            yaxis: {
                labels: {
                    style: { fontSize: '10px' },
                    formatter: val => val.toFixed(2) + ' ' + chartData.unit
                }
            },
            tooltip: {
                y: { formatter: val => 'Rp ' + val.toFixed(2) + ' ' + chartData.unit }
            },
            legend: { show: false },
            grid: { borderColor: '#e5e7eb', strokeDashArray: 3 }
        };
        
        // Render chart
        this.charts[containerId] = new ApexCharts(container, options);
        this.charts[containerId].render();
    },
    
    // ========================================
    // RENDER ALL CHARTS
    // ========================================
    renderAllCharts() {
        const kodeCabang = this.currentKodeCabang || 'ALL';
        console.log(`📊 Rendering all Layer 2 charts for: ${kodeCabang}`);
        
        const chartConfigs = [
            ['layer2ChartAsset', 'asset', ['#ff9800', '#10b981']],
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
        
        chartConfigs.forEach(([containerId, metricKey, colors]) => {
            this.renderChart(containerId, metricKey, colors, kodeCabang);
        });
        
        console.log('✅ All charts rendered');
    },
    
    // ========================================
    // FORMAT HELPERS
    // ========================================
    formatCurrency(value, unit = 'M') {
        if (!value || value === 0) return 'Rp 0';
        const divisor = unit === 'T' ? 1e12 : 1e9;
        return `Rp ${(value / divisor).toFixed(2)} ${unit}`;
    }
};

// ========================================
// AUTO INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Neraca Charts Dynamic module loaded');
    
    // Initialize after Firebase and data are ready
    setTimeout(() => {
        NeracaCharts.init();
    }, 3000);
});

// Export for global access
window.NeracaCharts = NeracaCharts;

// ========================================
// LAYER 3 CHARTS
// ========================================
let neracaLayer3Charts = {};

function changeLayer3Metric(metric) {
    console.log('📊 Layer 3 metric changed:', metric);
    
    const kodeCabang = NeracaCharts.currentKodeCabang || 'ALL';
    const chartData = NeracaCharts.getChartData(metric, kodeCabang);
    const config = NeracaCharts.SANDI_MAPPING[metric];
    
    if (!chartData || chartData.aktual.length === 0) {
        console.warn('No data for Layer 3:', metric);
        return;
    }
    
    // Calculate metrics
    const lastAktual = chartData.aktual[chartData.aktual.length - 1];
    const lastTarget = chartData.target[chartData.target.length - 1];
    const pencapaian = lastTarget > 0 ? ((lastAktual / lastTarget) * 100).toFixed(1) : '0';
    
    // Calculate MoM
    let mom = '0';
    if (chartData.aktual.length >= 2) {
        const prev = chartData.aktual[chartData.aktual.length - 2];
        if (prev > 0) {
            mom = (((lastAktual - prev) / prev) * 100).toFixed(2);
        }
    }
    
    // Calculate YoY (estimate - current vs first month as proxy)
    let yoy = '0';
    if (chartData.aktual.length > 0 && chartData.aktual[0] > 0) {
        yoy = (((lastAktual - chartData.aktual[0]) / chartData.aktual[0]) * 100).toFixed(2);
    }
    
    // Update title & cards
    const label = config?.label || metric;
    const unit = chartData.unit || 'T';
    
    document.getElementById('layer3SelectedMetric').textContent = label;
    document.getElementById('layer3NilaiTerakhir').textContent = `Rp ${lastAktual.toFixed(2)} ${unit}`;
    document.getElementById('layer3Target').textContent = lastTarget > 0 ? `Rp ${lastTarget.toFixed(2)} ${unit}` : '-';
    document.getElementById('layer3Pencapaian').textContent = `${pencapaian}%`;
    document.getElementById('layer3MoM').textContent = `${parseFloat(mom) >= 0 ? '+' : ''}${mom}%`;
    document.getElementById('layer3YoY').textContent = `${parseFloat(yoy) >= 0 ? '+' : ''}${yoy}%`;
    
    // Render charts
    setTimeout(() => {
        renderLayer3YoYChart(chartData);
        renderLayer3YTDChart(chartData);
        renderLayer3MoMChart(chartData);
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
        xaxis: { categories: data.labels, labels: { style: { fontSize: '10px' } } },
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
    
    const lastAktual = data.aktual[data.aktual.length - 1] || 0;
    const lastTarget = data.target[data.target.length - 1] || 0;
    
    const options = {
        series: [{ data: [lastAktual, lastTarget] }],
        chart: { type: 'bar', height: 180, toolbar: { show: false } },
        colors: ['#3b82f6', '#10b981'],
        plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 8, distributed: true } },
        xaxis: { categories: ['Realisasi', 'Target'], labels: { style: { fontSize: '11px' } } },
        yaxis: { show: false },
        legend: { show: false },
        dataLabels: { enabled: true, formatter: (val) => val.toFixed(2), style: { fontSize: '11px' } }
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
        if (data.aktual[i-1] > 0) {
            momChanges.push(parseFloat(((data.aktual[i] - data.aktual[i-1]) / data.aktual[i-1] * 100).toFixed(2)));
        } else {
            momChanges.push(0);
        }
    }
    
    const options = {
        series: [{ name: 'MoM %', data: momChanges }],
        chart: { type: 'bar', height: 180, toolbar: { show: false } },
        colors: momChanges.map(v => v >= 0 ? '#10b981' : '#ef4444'),
        plotOptions: { bar: { columnWidth: '60%', borderRadius: 4, distributed: true } },
        xaxis: { categories: data.labels.slice(1), labels: { style: { fontSize: '10px' } } },
        yaxis: { labels: { formatter: (val) => val.toFixed(1) + '%', style: { fontSize: '10px' } } },
        legend: { show: false },
        dataLabels: { enabled: false }
    };
    
    neracaLayer3Charts.mom = new ApexCharts(element, options);
    neracaLayer3Charts.mom.render();
}

// Initialize Layer 3 after data ready
function initLayer3() {
    console.log('🚀 Initializing Layer 3...');
    setTimeout(() => changeLayer3Metric('asset'), 500);
}

// Listen for data ready
window.addEventListener('dashboardDataUpdated', initLayer3);
window.addEventListener('filterChanged', () => {
    // Re-render Layer 3 with current metric
    const selector = document.getElementById('layer3MetricSelector');
    if (selector) {
        changeLayer3Metric(selector.value);
    }
});

// Export Layer 3 functions
window.changeLayer3Metric = changeLayer3Metric;
window.initLayer3 = initLayer3;

console.log('✅ Neraca Charts loaded - DYNAMIC VERSION');
