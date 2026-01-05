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
            unit: 'Jt',
            color: '#ff9800'
        },
        kredit: {
            sandi: '01.09.01.00.00.00',
            label: 'Total Kredit',
            unit: 'Jt',
            color: '#1e3a5f'
        },
        pembiayaan: {
            // Pembiayaan Syariah = sum prefix 01.09.03 (exclude summary)
            prefix: '01.09.03',
            excludeSummary: true,
            label: 'Total Pembiayaan',
            unit: 'Jt',
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
            unit: 'Jt',
            color: '#3498db'
        },
        ati: {
            // ATI = Aset Tidak Berwujud + Aset Tetap (gross & akum)
            components: ['01.13.01.00.00.00', '01.13.02.00.00.00', '01.14.01.00.00.00', '01.14.02.00.00.00'],
            label: 'ATI',
            unit: 'Jt',
            color: '#14b8a6'
        },
        ckpn: {
            // CKPN = sandi summary
            sandi: '01.12.00.00.00.00',
            // Fallback to prefix if summary not found
            prefix: '01.12',
            excludeSummary: true,
            label: 'CKPN',
            unit: 'Jt',
            color: '#f59e0b'
        },
        laba: {
            // Laba Bersih (Setelah Pajak) dari NERACA
            // Sandi 03.05.02.01.00.00 tersedia di aktual dan target
            sandi: '03.05.02.01.00.00',
            sandiRugi: '03.05.02.02.00.00', // Rugi Bersih
            isLabarugi: false,  // Ambil dari neraca
            label: 'Laba Bersih',
            unit: 'Jt',
            color: '#8b5cf6'
        },
        modal: {
            // Modal = sandi summary
            sandi: '03.00.00.00.00.00',
            // Fallback: sum komponen modal jika summary tidak ada
            modalComponents: [
                '03.01.01.00.00.00', // Modal Disetor Dasar
                '03.01.02.00.00.00', // Modal Disetor Lainnya
                '03.03.01.00.00.00', // Cadangan Umum
                '03.04.01.00.00.00', // PKL Keuntungan
                '03.04.02.00.00.00', // PKL Kerugian
                '03.05.02.01.00.00'  // Laba Bersih
            ],
            label: 'Total Modal',
            unit: 'Jt',
            color: '#1e3a5f'
        },
        pendapatan: {
            // Pendapatan = 04.11 + 04.12 + 04.20 (summary sandi)
            components: ['04.11.00.00.00.00', '04.12.00.00.00.00', '04.20.00.00.00.00'],
            // Fallback prefixes if summary not found
            prefixes: ['04.11', '04.12', '04.20'],
            label: 'Total Pendapatan',
            unit: 'Jt',
            color: '#10b981',
            isLabarugi: true
        },
        biaya: {
            // Biaya = 05.11 + 05.12 + 05.20 (summary sandi)
            components: ['05.11.00.00.00.00', '05.12.00.00.00.00', '05.20.00.00.00.00'],
            // Fallback prefixes if summary not found
            prefixes: ['05.11', '05.12', '05.20'],
            label: 'Total Biaya',
            unit: 'Jt',
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
        console.log('👂 NeracaCharts: Registering filterChanged listener...');
        window.addEventListener('filterChanged', (e) => {
            console.log('🔄 NeracaCharts: filterChanged event received:', e.detail);
            this.currentKodeCabang = this.getCurrentKodeCabang();
            console.log('🔄 NeracaCharts: New currentKodeCabang:', this.currentKodeCabang);
            this.renderAllCharts();
        });
        console.log('✅ NeracaCharts: filterChanged listener registered');
        console.log('🚀 NeracaCharts init complete!');
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
                const rugiVal = getValue(config.sandiRugi);
                // For labarugi data, rugi is stored as positive, so subtract
                // For neraca data, rugi is already negative, so add
                if (config.isLabarugi) {
                    result -= rugiVal; // Subtract for labarugi
                } else {
                    result += rugiVal; // Add for neraca (rugi is negative)
                }
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
            
            // FALLBACK: Try fallbackSandi if main sandi not found
            // Note: fallbackSandi might be in different collection (neraca vs labarugi)
            if (config.fallbackSandi) {
                // Try in current collection first
                result = getValue(config.fallbackSandi);
                
                // If not found and isLabarugi, try in neraca collection
                if (result === 0 && config.isLabarugi) {
                    const neracaData = targetLoader.targetNeracaData || [];
                    const neracaItem = neracaData.find(d => 
                        d.kode_cabang === kodeCabang && 
                        d.periode === periode && 
                        d.sandi === config.fallbackSandi
                    );
                    result = neracaItem?.total || 0;
                }
                
                if (result !== 0) {
                    console.log(`   📊 Target fallback sandi: ${config.fallbackSandi} = ${result.toLocaleString()}`);
                    return result;
                }
            }
        }
        
        // 2. Try components
        if (config.components && config.components.length > 0) {
            result = sumComponents(config.components);
            if (result !== 0) return result;
        }
        
        // 2b. Try labaComponents - rugiComponents (for laba calculation)
        if (config.labaComponents && config.labaComponents.length > 0) {
            const targetLabarugi = targetLoader.targetLabarugiData || [];
            const getLabaValue = (sandi) => {
                const item = targetLabarugi.find(d => 
                    d.kode_cabang === kodeCabang && 
                    d.periode === periode && 
                    d.sandi === sandi
                );
                return item?.total || 0;
            };
            
            const labaTotal = config.labaComponents.reduce((sum, s) => sum + getLabaValue(s), 0);
            const rugiTotal = (config.rugiComponents || []).reduce((sum, s) => sum + getLabaValue(s), 0);
            result = labaTotal - rugiTotal;
            
            if (result !== 0) {
                console.log(`   📊 Target laba calculated: ${labaTotal.toLocaleString()} - ${rugiTotal.toLocaleString()} = ${result.toLocaleString()}`);
                return result;
            }
        }
        
        // 2c. Try modalComponents (for modal calculation)
        if (config.modalComponents && config.modalComponents.length > 0) {
            const targetNeraca = targetLoader.targetNeracaData || [];
            const getModalValue = (sandi) => {
                const item = targetNeraca.find(d => 
                    d.kode_cabang === kodeCabang && 
                    d.periode === periode && 
                    d.sandi === sandi
                );
                return item?.total || 0;
            };
            
            result = config.modalComponents.reduce((sum, sandi) => sum + getModalValue(sandi), 0);
            if (result !== 0) {
                console.log(`   📊 Target modal from components: ${result.toLocaleString()}`);
                return result;
            }
        }
        
        // 3. Try prefixes
        if (config.prefixes && config.prefixes.length > 0) {
            result = sumPrefixes(config.prefixes, config.excludeSummary);
            if (result !== 0) return result;
        }
        
        // 4. Try single prefix
        if (config.prefix) {
            result = sumPrefix(config.prefix, config.excludeSummary);
            
            // FALLBACK: If excludeSummary is true but result is 0,
            // try getting the summary sandi instead (for target data that only has summary)
            if (result === 0 && config.excludeSummary) {
                const summarySandi = config.prefix + '.00.00.00';
                result = getValue(summarySandi);
                if (result !== 0) {
                    console.log(`   📊 Target fallback to summary sandi: ${summarySandi} = ${result.toLocaleString()}`);
                }
            }
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
        const unit = config?.unit || 'Jt';
        // Semua dalam jutaan
        const divisor = 1e6;
        
        const aktual = [];
        const target = [];
        const labels = [];
        
        // Get current filter periode
        const filters = window.DashboardFirebase?.getFilters?.() || {};
        const currentPeriode = filters.periode; // e.g., "2025-06"
        let filterMonth = 12; // Default: show all months
        let filterYear = '2025';
        
        if (currentPeriode) {
            const match = currentPeriode.match(/(\d{4})-(\d{2})/);
            if (match) {
                filterYear = match[1];
                filterMonth = parseInt(match[2]);
            }
        }
        
        console.log(`   Filter periode: ${currentPeriode}, filterMonth: ${filterMonth}`);
        
        // Calculate TRW based on filter month
        const filterTrw = Math.ceil(filterMonth / 3);
        const trwRoman = ['I', 'II', 'III', 'IV'][filterTrw - 1] || 'I';
        
        // Store current TRW for use in chart rendering
        this.currentTrw = trwRoman;
        this.currentTrwNum = filterTrw;
        
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
        
        // Map period to month and get values - SHOW ALL 3 MONTHS FOR SELECTED TRW
        // Calculate TRW month range
        const trwStartMonth = (filterTrw - 1) * 3 + 1; // TRW I: 1, TRW II: 4, TRW III: 7, TRW IV: 10
        const trwEndMonth = filterTrw * 3; // TRW I: 3, TRW II: 6, TRW III: 9, TRW IV: 12
        
        console.log(`   TRW ${trwRoman}: Bulan ${trwStartMonth} - ${trwEndMonth}`);
        
        // Generate all 3 months for this TRW (even if no data yet)
        const trwMonths = [];
        for (let m = trwStartMonth; m <= trwEndMonth; m++) {
            trwMonths.push(m);
        }
        
        trwMonths.forEach(monthNum => {
            const monthIdx = monthNum - 1;
            const monthName = months[monthIdx];
            const periode = `${filterYear}-${String(monthNum).padStart(2, '0')}`;
            
            labels.push(monthName);
            
            // Get aktual value (will be 0 if no data for this month)
            const aktualVal = this.getAktualValue(metricKey, periode, kodeCabang);
            console.log(`   ${monthName}: aktual raw = ${aktualVal.toLocaleString()}, after divisor = ${(aktualVal / divisor).toFixed(2)}`);
            aktual.push(aktualVal / divisor);
            
            // Get target for this TRW
            const targetVal = this.getTargetValue(metricKey, filterTrw, targetBranchCode);
            target.push(targetVal / divisor);
        });
        
        console.log(`   Aktual values:`, aktual);
        console.log(`   Target values (TRW ${trwRoman}):`, target);
        
        return { labels, aktual, target, unit, trw: trwRoman, trwNum: filterTrw };
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
        
        // Get TRW from chartData (already calculated based on filter)
        const currentTrw = chartData.trw || 'I';
        
        // ========================================
        // BAR + LINE COMBO CHART
        // Bar = Aktual (nilai realisasi)
        // Line = Target (benchmark)
        // ========================================
        const options = {
            series: [
                { 
                    name: 'Aktual', 
                    type: 'column',
                    data: chartData.aktual 
                },
                { 
                    name: `Target TRW ${currentTrw}`, 
                    type: 'line',
                    data: chartData.target 
                }
            ],
            chart: {
                type: 'line', // Base type for combo
                height: 200,
                toolbar: { show: false },
                animations: { enabled: true, speed: 500 },
                dropShadow: {
                    enabled: true,
                    top: 2,
                    left: 0,
                    blur: 3,
                    opacity: 0.1
                }
            },
            colors: [colors[0], colors[1]], // [Bar color, Line color]
            stroke: { 
                width: [0, 3], // 0 for bar, 3 for line
                curve: 'smooth',
                dashArray: [0, 0] // Solid line
            },
            fill: {
                type: ['solid', 'solid'],
                opacity: [0.9, 1]
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%',
                    borderRadius: 6,
                    dataLabels: { position: 'top' }
                }
            },
            markers: {
                size: [0, 5], // No markers for bar, show for line
                colors: [colors[0], colors[1]],
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: { sizeOffset: 2 }
            },
            xaxis: {
                categories: chartData.labels,
                labels: { 
                    style: { fontSize: '11px', fontWeight: 500 },
                    offsetY: 0
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: {
                    style: { fontSize: '10px' },
                    formatter: val => {
                        if (val >= 1000) {
                            return (val / 1000).toFixed(1) + ' T';
                        }
                        return val.toLocaleString('id-ID', {maximumFractionDigits: 0}) + ' Jt';
                    }
                },
                min: 0
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: { 
                    formatter: val => {
                        if (val >= 1000) {
                            return 'Rp ' + (val / 1000).toFixed(2) + ' Triliun';
                        }
                        return 'Rp ' + val.toLocaleString('id-ID', {maximumFractionDigits: 0}) + ' Juta';
                    }
                }
            },
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0], // Only show on bars (Aktual)
                formatter: val => {
                    if (val >= 1000) {
                        return (val / 1000).toFixed(1) + 'T';
                    }
                    return val.toLocaleString('id-ID', {maximumFractionDigits: 0});
                },
                style: { 
                    fontSize: '10px', 
                    fontWeight: 600,
                    colors: ['#1e3a5f']
                },
                offsetY: -20,
                background: {
                    enabled: true,
                    foreColor: '#fff',
                    borderRadius: 4,
                    padding: 4,
                    opacity: 0.9,
                    borderWidth: 0,
                    dropShadow: { enabled: false }
                }
            },
            legend: { 
                show: true, 
                position: 'top', 
                horizontalAlign: 'right',
                fontSize: '11px',
                fontWeight: 500,
                markers: { width: 10, height: 10, radius: 2 },
                itemMargin: { horizontal: 10 }
            },
            grid: { 
                borderColor: '#e5e7eb', 
                strokeDashArray: 4,
                padding: { left: 10, right: 10 }
            }
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
            // [containerId, metricKey, [barColor, lineColor]]
            ['layer2ChartAsset', 'asset', ['#3b82f6', '#10b981']],        // Blue bar, Green line
            ['layer2ChartKredit', 'kredit', ['#1e3a5f', '#f59e0b']],      // Navy bar, Amber line
            ['layer2ChartPembiayaan', 'pembiayaan', ['#8b5cf6', '#10b981']], // Purple bar, Green line
            ['layer2ChartDPK', 'dpk', ['#0891b2', '#f59e0b']],            // Cyan bar, Amber line
            ['layer2ChartATI', 'ati', ['#14b8a6', '#f97316']],            // Teal bar, Orange line
            ['layer2ChartCKPN', 'ckpn', ['#f59e0b', '#ef4444']],          // Amber bar, Red line
            ['layer2ChartLaba', 'laba', ['#10b981', '#6366f1']],          // Green bar, Indigo line
            ['layer2ChartModal', 'modal', ['#1e3a5f', '#10b981']],        // Navy bar, Green line
            ['layer2ChartPendapatan', 'pendapatan', ['#22c55e', '#3b82f6']], // Green bar, Blue line
            ['layer2ChartBiaya', 'biaya', ['#ef4444', '#f59e0b']]         // Red bar, Amber line
        ];
        
        chartConfigs.forEach(([containerId, metricKey, colors]) => {
            this.renderChart(containerId, metricKey, colors, kodeCabang);
        });
        
        console.log('✅ All charts rendered');
    },
    
    // ========================================
    // FORMAT HELPERS
    // ========================================
    formatCurrency(value, unit = 'Jt') {
        if (!value || value === 0) return 'Rp 0';
        // Semua dalam jutaan
        return `Rp ${value.toLocaleString('id-ID', {maximumFractionDigits: 0})} Jt`;
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

// ========================================
// LISTEN FOR FILTER CHANGES (MULTIPLE SOURCES)
// ========================================

// Listen to filter dropdowns directly
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Listen to month selector - CORRECT ID: headerMonthSelect
        const monthSelector = document.getElementById('headerMonthSelect');
        
        if (monthSelector) {
            monthSelector.addEventListener('change', () => {
                console.log('📅 Month selector changed, refreshing charts...');
                setTimeout(() => {
                    NeracaCharts.renderAllCharts();
                    // Refresh Layer 3 too
                    const layer3Selector = document.getElementById('layer3MetricSelector');
                    if (layer3Selector && typeof changeLayer3Metric === 'function') {
                        changeLayer3Metric(layer3Selector.value);
                    }
                }, 800);
            });
            console.log('✅ headerMonthSelect listener attached');
        } else {
            console.warn('⚠️ headerMonthSelect not found');
        }
        
        // Listen to year selector - CORRECT ID: headerYearSelect
        const yearSelector = document.getElementById('headerYearSelect');
        
        if (yearSelector) {
            yearSelector.addEventListener('change', () => {
                console.log('📅 Year selector changed, refreshing charts...');
                setTimeout(() => {
                    NeracaCharts.renderAllCharts();
                    const layer3Selector = document.getElementById('layer3MetricSelector');
                    if (layer3Selector && typeof changeLayer3Metric === 'function') {
                        changeLayer3Metric(layer3Selector.value);
                    }
                }, 800);
            });
            console.log('✅ headerYearSelect listener attached');
        } else {
            console.warn('⚠️ headerYearSelect not found');
        }
        
        // Listen to branch selector
        const branchSelector = document.getElementById('branchSelector');
        if (branchSelector) {
            branchSelector.addEventListener('change', () => {
                console.log('🏢 Branch selector changed, refreshing charts...');
                setTimeout(() => {
                    NeracaCharts.renderAllCharts();
                    const layer3Selector = document.getElementById('layer3MetricSelector');
                    if (layer3Selector && typeof changeLayer3Metric === 'function') {
                        changeLayer3Metric(layer3Selector.value);
                    }
                }, 800);
            });
            console.log('✅ branchSelector listener attached');
        }
        
    }, 4000); // Wait for DOM to be fully ready
});

// Export for global access
window.NeracaCharts = NeracaCharts;

// Global function to refresh all Layer 2 & 3 charts
window.refreshNeracaCharts = function() {
    console.log('🔄 refreshNeracaCharts called');
    if (window.NeracaCharts) {
        NeracaCharts.renderAllCharts();
    }
    // Refresh Layer 3 too
    const layer3Selector = document.getElementById('layer3MetricSelector');
    if (layer3Selector && typeof changeLayer3Metric === 'function') {
        changeLayer3Metric(layer3Selector.value);
    }
};

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
    
    // Get TRW from chartData (already calculated based on filter)
    const currentTrw = chartData.trw || 'I';
    const currentTrwNum = chartData.trwNum || 1;
    
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
    
    // Format number with thousand separator (Indonesian format)
    const formatNumber = (val) => val.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    document.getElementById('layer3SelectedMetric').textContent = label;
    document.getElementById('layer3NilaiTerakhir').textContent = `Rp ${formatNumber(lastAktual)} ${unit}`;
    
    // Update target card with TRW info
    const targetElement = document.getElementById('layer3Target');
    if (targetElement) {
        targetElement.textContent = lastTarget > 0 ? `Rp ${formatNumber(lastTarget)} ${unit}` : '-';
    }
    
    // Update target label to show TRW (if element exists)
    const targetLabelElement = document.getElementById('layer3TargetLabel');
    if (targetLabelElement) {
        targetLabelElement.textContent = `Target TRW ${currentTrw}`;
    }
    
    // Update TRW info card (if exists)
    const trwInfoElement = document.getElementById('layer3TrwInfo');
    if (trwInfoElement) {
        trwInfoElement.textContent = `TRW ${currentTrw}`;
    }
    
    document.getElementById('layer3Pencapaian').textContent = `${pencapaian}%`;
    document.getElementById('layer3MoM').textContent = `${parseFloat(mom) >= 0 ? '+' : ''}${mom}%`;
    document.getElementById('layer3YoY').textContent = `${parseFloat(yoy) >= 0 ? '+' : ''}${yoy}%`;
    
    // Store current TRW for charts
    window.currentLayer3Trw = currentTrw;
    window.currentLayer3TrwNum = currentTrwNum;
    
    // Render charts
    setTimeout(() => {
        renderLayer3YoYChart(chartData);
        renderLayer3YTDChart(chartData, currentTrw);
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

function renderLayer3YTDChart(data, currentTrw = 'I') {
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
        xaxis: { categories: ['Realisasi', `Target TRW ${currentTrw}`], labels: { style: { fontSize: '11px' } } },
        yaxis: { show: false },
        legend: { show: false },
        dataLabels: { enabled: true, formatter: (val) => val.toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2}), style: { fontSize: '11px' } }
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
