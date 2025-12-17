/**
 * ==========================================
 * LABA RUGI FIREBASE LOADER
 * Bank Sulselbar Dashboard
 * ==========================================
 * 
 * Modul untuk memuat data Laba Rugi dari Firebase
 * Collection: banksulselbar_labarugi
 * 
 * Fitur:
 * - Load data berdasarkan periode
 * - Aggregate data per sandi
 * - Filter per cabang / tipe (konven/syariah)
 * - Update tampilan dashboard secara dinamis
 */

console.log('📊 Loading Laba Rugi Firebase Loader...');

// ==========================================
// MAPPING SANDI KE KATEGORI LABA RUGI
// ==========================================

const SANDI_KATEGORI = {
    // PENDAPATAN BUNGA / IMBAL HASIL
    'PENDAPATAN_BUNGA': {
        label: 'Pendapatan Bunga / Imbal Hasil',
        sandi: '04.11.00.00.00.00',
        type: 'income'
    },
    
    // BEBAN BUNGA / BAGI HASIL
    'BEBAN_BUNGA': {
        label: 'Beban Bunga / Bagi Hasil',
        sandi: '05.11.00.00.00.00',
        type: 'expense'
    },
    
    // PENDAPATAN BUNGA BERSIH (NII)
    'PENDAPATAN_BUNGA_BERSIH': {
        label: 'Pendapatan Operasional Bunga Bersih',
        sandi: '03.05.02.01.11.10',
        type: 'income'
    },
    
    // PENDAPATAN OPERASIONAL LAINNYA
    'PENDAPATAN_OPERASIONAL': {
        label: 'Pendapatan Operasional Lainnya',
        sandi: '03.05.02.01.11.20',
        type: 'income'
    },
    
    // BEBAN OPERASIONAL LAINNYA
    'BEBAN_OPERASIONAL': {
        label: 'Beban Operasional Lainnya',
        sandi: '03.05.02.02.11.20',
        type: 'expense'
    },
    
    // LABA OPERASIONAL
    'LABA_OPERASIONAL': {
        label: 'Laba Operasional',
        sandi: '03.05.02.01.11.00',
        type: 'profit'
    },
    
    // RUGI OPERASIONAL
    'RUGI_OPERASIONAL': {
        label: 'Rugi Operasional',
        sandi: '03.05.02.02.11.00',
        type: 'loss'
    },
    
    // PENDAPATAN NON OPERASIONAL
    'PENDAPATAN_NON_OPS': {
        label: 'Pendapatan Non-Operasional',
        sandi: '04.20.99.00.00.00',
        type: 'income'
    },
    
    // BEBAN NON OPERASIONAL
    'BEBAN_NON_OPS': {
        label: 'Beban Non-Operasional',
        sandi: '05.20.99.00.00.00',
        type: 'expense'
    },
    
    // LABA NON OPERASIONAL
    'LABA_NON_OPS': {
        label: 'Laba Non-Operasional',
        sandi: '03.05.02.01.12.00',
        type: 'profit'
    },
    
    // RUGI NON OPERASIONAL
    'RUGI_NON_OPS': {
        label: 'Rugi Non-Operasional',
        sandi: '03.05.02.02.12.00',
        type: 'loss'
    },
    
    // LABA SEBELUM PAJAK
    'LABA_SEBELUM_PAJAK': {
        label: 'Laba Sebelum Pajak',
        sandi: '03.05.02.01.10.00',
        type: 'profit'
    },
    
    // RUGI SEBELUM PAJAK
    'RUGI_SEBELUM_PAJAK': {
        label: 'Rugi Sebelum Pajak',
        sandi: '03.05.02.02.10.00',
        type: 'loss'
    },
    
    // PAJAK PENGHASILAN
    'PAJAK': {
        label: 'Taksiran Pajak Tahun Berjalan',
        sandi: '03.05.02.01.40.00',
        type: 'expense'
    },
    
    // LABA BERSIH
    'LABA_BERSIH': {
        label: 'Laba Bersih Tahun Berjalan',
        sandi: '03.05.02.01.00.00',
        type: 'profit'
    },
    
    // RUGI BERSIH
    'RUGI_BERSIH': {
        label: 'Rugi Bersih Tahun Berjalan',
        sandi: '03.05.02.02.00.00',
        type: 'loss'
    }
};

// ==========================================
// LABA RUGI LOADER CLASS
// ==========================================

class LabaRugiFirebaseLoader {
    constructor() {
        this.data = [];
        this.aggregatedData = {};
        this.currentPeriode = null;
        this.currentFilter = 'all'; // all, konvensional, syariah
        this.isLoading = false;
        this.cache = new Map();
    }
    
    /**
     * Load data dari Firebase berdasarkan periode
     * @param {string} periode - Format: "2025-01"
     * @param {object} options - Filter options
     */
    async loadData(periode, options = {}) {
        console.log(`📊 Loading laba rugi data for periode: ${periode}`);
        
        // Check Firebase
        if (typeof FirebaseConnector === 'undefined' || !FirebaseConnector.isInitialized) {
            console.warn('⚠️ Firebase not initialized, attempting init...');
            try {
                await FirebaseConnector.init();
            } catch (e) {
                console.error('❌ Firebase init failed:', e);
                return null;
            }
        }
        
        // Check cache
        const cacheKey = `${periode}_${options.tipe || 'all'}_${options.kodeCabang || 'all'}`;
        if (this.cache.has(cacheKey)) {
            console.log('📦 Using cached data');
            return this.cache.get(cacheKey);
        }
        
        this.isLoading = true;
        this.currentPeriode = periode;
        
        try {
            const db = FirebaseConnector.db;
            let query = db.collection('banksulselbar_labarugi').where('periode', '==', periode);
            
            // Filter by tipe
            if (options.tipe && options.tipe !== 'all') {
                query = query.where('tipe', '==', options.tipe);
            }
            
            // Filter by cabang
            if (options.kodeCabang) {
                query = query.where('kode_cabang', '==', options.kodeCabang);
            }
            
            const snapshot = await query.get();
            
            this.data = [];
            snapshot.forEach(doc => {
                this.data.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`✅ Loaded ${this.data.length} records`);
            
            // Aggregate data
            this.aggregatedData = this.aggregateData(this.data);
            
            // Cache result
            const result = {
                periode: periode,
                totalRecords: this.data.length,
                data: this.data,
                aggregated: this.aggregatedData
            };
            
            this.cache.set(cacheKey, result);
            this.isLoading = false;
            
            return result;
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.isLoading = false;
            return null;
        }
    }
    
    /**
     * Load data untuk multiple periode (YTD)
     */
    async loadYTDData(tahun, bulanAkhir, options = {}) {
        console.log(`📊 Loading YTD data: ${tahun} s/d bulan ${bulanAkhir}`);
        
        const allData = [];
        
        for (let bulan = 1; bulan <= bulanAkhir; bulan++) {
            const periode = `${tahun}-${String(bulan).padStart(2, '0')}`;
            const result = await this.loadData(periode, options);
            if (result && result.data) {
                allData.push(...result.data);
            }
        }
        
        console.log(`✅ Loaded YTD total: ${allData.length} records`);
        
        // Aggregate semua data YTD
        const ytdAggregated = this.aggregateData(allData);
        
        return {
            tahun: tahun,
            bulanAkhir: bulanAkhir,
            totalRecords: allData.length,
            data: allData,
            aggregated: ytdAggregated
        };
    }
    
    /**
     * Aggregate data berdasarkan sandi
     */
    aggregateData(data) {
        const result = {
            bySandi: {},
            byTipe: {
                konvensional: {},
                syariah: {}
            },
            summary: {
                totalPendapatan: 0,
                totalBeban: 0,
                labaBersih: 0,
                pendapatanBunga: 0,
                bebanBunga: 0,
                pendapatanBungaBersih: 0,
                pendapatanOperasional: 0,
                bebanOperasional: 0,
                labaOperasional: 0,
                pendapatanNonOps: 0,
                bebanNonOps: 0,
                labaSebelumPajak: 0,
                pajak: 0
            },
            konvensional: {
                totalPendapatan: 0,
                totalBeban: 0,
                labaBersih: 0
            },
            syariah: {
                totalPendapatan: 0,
                totalBeban: 0,
                labaBersih: 0
            }
        };
        
        // Group by sandi
        data.forEach(item => {
            const sandi = item.sandi;
            const tipe = item.tipe;
            const total = item.rupiah + item.valas;
            
            // By sandi (all)
            if (!result.bySandi[sandi]) {
                result.bySandi[sandi] = {
                    sandi: sandi,
                    pos: item.pos,
                    rupiah: 0,
                    valas: 0,
                    total: 0,
                    count: 0
                };
            }
            result.bySandi[sandi].rupiah += item.rupiah;
            result.bySandi[sandi].valas += item.valas;
            result.bySandi[sandi].total += total;
            result.bySandi[sandi].count++;
            
            // By tipe
            if (!result.byTipe[tipe][sandi]) {
                result.byTipe[tipe][sandi] = {
                    sandi: sandi,
                    pos: item.pos,
                    rupiah: 0,
                    valas: 0,
                    total: 0
                };
            }
            result.byTipe[tipe][sandi].rupiah += item.rupiah;
            result.byTipe[tipe][sandi].valas += item.valas;
            result.byTipe[tipe][sandi].total += total;
        });
        
        // Calculate summary dari sandi utama
        for (const [key, config] of Object.entries(SANDI_KATEGORI)) {
            const sandiData = result.bySandi[config.sandi];
            if (sandiData) {
                const value = sandiData.total;
                
                switch (key) {
                    case 'PENDAPATAN_BUNGA':
                        result.summary.pendapatanBunga = value;
                        result.summary.totalPendapatan += value;
                        break;
                    case 'BEBAN_BUNGA':
                        result.summary.bebanBunga = Math.abs(value);
                        result.summary.totalBeban += Math.abs(value);
                        break;
                    case 'PENDAPATAN_BUNGA_BERSIH':
                        result.summary.pendapatanBungaBersih = value;
                        break;
                    case 'PENDAPATAN_OPERASIONAL':
                        result.summary.pendapatanOperasional = value;
                        result.summary.totalPendapatan += value;
                        break;
                    case 'BEBAN_OPERASIONAL':
                        result.summary.bebanOperasional = Math.abs(value);
                        result.summary.totalBeban += Math.abs(value);
                        break;
                    case 'LABA_OPERASIONAL':
                        result.summary.labaOperasional = value;
                        break;
                    case 'PENDAPATAN_NON_OPS':
                        result.summary.pendapatanNonOps = value;
                        result.summary.totalPendapatan += value;
                        break;
                    case 'BEBAN_NON_OPS':
                        result.summary.bebanNonOps = Math.abs(value);
                        result.summary.totalBeban += Math.abs(value);
                        break;
                    case 'LABA_SEBELUM_PAJAK':
                        result.summary.labaSebelumPajak = value;
                        break;
                    case 'PAJAK':
                        result.summary.pajak = Math.abs(value);
                        break;
                    case 'LABA_BERSIH':
                        result.summary.labaBersih = value;
                        break;
                }
            }
        }
        
        // Calculate per tipe (konvensional & syariah)
        ['konvensional', 'syariah'].forEach(tipe => {
            const tipeData = result.byTipe[tipe];
            
            // Pendapatan Bunga
            if (tipeData[SANDI_KATEGORI.PENDAPATAN_BUNGA.sandi]) {
                result[tipe].totalPendapatan += tipeData[SANDI_KATEGORI.PENDAPATAN_BUNGA.sandi].total;
            }
            // Pendapatan Operasional
            if (tipeData[SANDI_KATEGORI.PENDAPATAN_OPERASIONAL?.sandi]) {
                result[tipe].totalPendapatan += tipeData[SANDI_KATEGORI.PENDAPATAN_OPERASIONAL.sandi].total;
            }
            // Beban Bunga
            if (tipeData[SANDI_KATEGORI.BEBAN_BUNGA?.sandi]) {
                result[tipe].totalBeban += Math.abs(tipeData[SANDI_KATEGORI.BEBAN_BUNGA.sandi].total);
            }
            // Beban Operasional
            if (tipeData[SANDI_KATEGORI.BEBAN_OPERASIONAL?.sandi]) {
                result[tipe].totalBeban += Math.abs(tipeData[SANDI_KATEGORI.BEBAN_OPERASIONAL.sandi].total);
            }
            // Laba Bersih
            if (tipeData[SANDI_KATEGORI.LABA_BERSIH?.sandi]) {
                result[tipe].labaBersih = tipeData[SANDI_KATEGORI.LABA_BERSIH.sandi].total;
            }
        });
        
        return result;
    }
    
    /**
     * Format angka ke format rupiah
     */
    formatRupiah(value, inMilliar = true) {
        if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
        
        const absValue = Math.abs(value);
        const isNegative = value < 0;
        
        let formatted;
        if (inMilliar) {
            const miliar = absValue / 1000000000;
            formatted = `Rp ${miliar.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} M`;
        } else {
            formatted = `Rp ${absValue.toLocaleString('id-ID')}`;
        }
        
        return isNegative ? `(${formatted})` : formatted;
    }
    
    /**
     * Update tampilan dashboard dengan data
     */
    updateDashboard(aggregatedData) {
        if (!aggregatedData) {
            console.warn('⚠️ No data to display');
            return;
        }
        
        const summary = aggregatedData.summary;
        
        console.log('🔄 Updating dashboard with laba rugi data...');
        console.log('Summary:', summary);
        
        // Update Summary Cards
        this.updateSummaryCards(summary, aggregatedData);
        
        // Update Laba Rugi Table
        this.updateLabaRugiTable(summary, aggregatedData);
        
        // Update Charts (if available)
        this.updateCharts(aggregatedData);
        
        console.log('✅ Dashboard updated');
    }
    
    /**
     * Update summary cards di section Pendapatan & Biaya
     */
    updateSummaryCards(summary, aggregatedData) {
        // Total Pendapatan
        const pendapatanEl = document.querySelector('.pb-summary-card.income .pb-value');
        if (pendapatanEl) {
            const pendapatanMiliar = summary.totalPendapatan / 1000000000;
            pendapatanEl.innerHTML = `Rp ${pendapatanMiliar.toFixed(2)} <span>Miliar</span>`;
        }
        
        // Detail Pendapatan (Konven vs Syariah)
        const pendapatanDetailEl = document.querySelector('.pb-summary-card.income .pb-detail');
        if (pendapatanDetailEl && aggregatedData) {
            const konvenPendapatan = aggregatedData.konvensional.totalPendapatan / 1000000000;
            const syariahPendapatan = aggregatedData.syariah.totalPendapatan / 1000000000;
            pendapatanDetailEl.innerHTML = `
                <span>Konven: Rp ${konvenPendapatan.toFixed(2)} M</span>
                <span>Syariah: Rp ${syariahPendapatan.toFixed(2)} M</span>
            `;
        }
        
        // Total Beban
        const bebanEl = document.querySelector('.pb-summary-card.expense .pb-value');
        if (bebanEl) {
            const bebanMiliar = summary.totalBeban / 1000000000;
            bebanEl.innerHTML = `Rp ${bebanMiliar.toFixed(2)} <span>Miliar</span>`;
        }
        
        // Detail Beban
        const bebanDetailEl = document.querySelector('.pb-summary-card.expense .pb-detail');
        if (bebanDetailEl && aggregatedData) {
            const konvenBeban = aggregatedData.konvensional.totalBeban / 1000000000;
            const syariahBeban = aggregatedData.syariah.totalBeban / 1000000000;
            bebanDetailEl.innerHTML = `
                <span>Konven: Rp ${konvenBeban.toFixed(2)} M</span>
                <span>Syariah: Rp ${syariahBeban.toFixed(2)} M</span>
            `;
        }
        
        // Laba Bersih
        const labaEl = document.querySelector('.pb-summary-card.profit .pb-value');
        if (labaEl) {
            const labaMiliar = summary.labaBersih / 1000000000;
            labaEl.innerHTML = `Rp ${labaMiliar.toFixed(2)} <span>Miliar</span>`;
        }
        
        // Detail Laba
        const labaDetailEl = document.querySelector('.pb-summary-card.profit .pb-detail');
        if (labaDetailEl && aggregatedData) {
            const konvenLaba = aggregatedData.konvensional.labaBersih / 1000000000;
            const syariahLaba = aggregatedData.syariah.labaBersih / 1000000000;
            labaDetailEl.innerHTML = `
                <span>Konven: Rp ${konvenLaba.toFixed(2)} M</span>
                <span>Syariah: Rp ${syariahLaba.toFixed(2)} M</span>
            `;
        }
        
        // Cost to Income Ratio
        const ctirEl = document.querySelector('.pb-summary-card.ratio .pb-value');
        if (ctirEl && summary.totalPendapatan > 0) {
            const ctir = (summary.totalBeban / summary.totalPendapatan) * 100;
            ctirEl.innerHTML = `${ctir.toFixed(2)}<span>%</span>`;
        }
    }
    
    /**
     * Update tabel laba rugi
     */
    updateLabaRugiTable(summary, aggregatedData) {
        // Pendapatan Bunga
        this.updateRowValue('.income-section .labarugi-row:nth-child(2) .row-value', summary.pendapatanBunga, 'income');
        
        // Pendapatan Bunga - Konvensional
        if (aggregatedData.byTipe.konvensional[SANDI_KATEGORI.PENDAPATAN_BUNGA.sandi]) {
            const konvenPB = aggregatedData.byTipe.konvensional[SANDI_KATEGORI.PENDAPATAN_BUNGA.sandi].total;
            this.updateRowValue('.income-section .labarugi-row:nth-child(3) .row-value', konvenPB);
        }
        
        // Pendapatan Bunga - Syariah
        if (aggregatedData.byTipe.syariah[SANDI_KATEGORI.PENDAPATAN_BUNGA.sandi]) {
            const syariahPB = aggregatedData.byTipe.syariah[SANDI_KATEGORI.PENDAPATAN_BUNGA.sandi].total;
            this.updateRowValue('.income-section .labarugi-row:nth-child(4) .row-value', syariahPB);
        }
        
        // Pendapatan Operasional Lainnya
        this.updateRowValue('.income-section .labarugi-row:nth-child(5) .row-value', summary.pendapatanOperasional, 'income');
        
        // Pendapatan Non-Operasional
        this.updateRowValue('.income-section .labarugi-row:nth-child(6) .row-value', summary.pendapatanNonOps, 'income');
        
        // Total Pendapatan
        this.updateRowValue('.income-section .labarugi-row.total .row-value', summary.totalPendapatan, 'income');
        
        // Beban Bunga
        this.updateRowValue('.expense-section .labarugi-row:nth-child(2) .row-value', -summary.bebanBunga, 'expense');
        
        // Beban Operasional
        this.updateRowValue('.expense-section .labarugi-row:nth-child(5) .row-value', -summary.bebanOperasional, 'expense');
        
        // Beban Non-Operasional
        this.updateRowValue('.expense-section .labarugi-row:nth-child(6) .row-value', -summary.bebanNonOps, 'expense');
        
        // Total Beban
        this.updateRowValue('.expense-section .labarugi-row.total .row-value', -summary.totalBeban, 'expense');
        
        // Laba Sebelum Pajak
        this.updateRowValue('.profit-section .labarugi-row:nth-child(1) .row-value', summary.labaSebelumPajak);
        
        // Pajak
        this.updateRowValue('.profit-section .labarugi-row:nth-child(2) .row-value', -summary.pajak, 'expense');
        
        // Laba Bersih
        this.updateRowValue('.profit-section .labarugi-row.grand-total .row-value', summary.labaBersih, 'profit');
    }
    
    /**
     * Helper untuk update nilai di row
     */
    updateRowValue(selector, value, type = '') {
        const el = document.querySelector(selector);
        if (el) {
            const formatted = this.formatRupiah(value);
            el.textContent = formatted;
            
            // Update class
            el.classList.remove('income', 'expense', 'profit');
            if (type) el.classList.add(type);
        }
    }
    
    /**
     * Update charts
     */
    updateCharts(aggregatedData) {
        // Pie Chart Pendapatan
        if (typeof ApexCharts !== 'undefined') {
            this.renderPendapatanPieChart(aggregatedData);
            this.renderBiayaPieChart(aggregatedData);
        }
    }
    
    /**
     * Render pie chart pendapatan
     */
    renderPendapatanPieChart(aggregatedData) {
        const chartEl = document.getElementById('pbPendapatanPieChart');
        if (!chartEl) return;
        
        const summary = aggregatedData.summary;
        
        const options = {
            series: [
                summary.pendapatanBunga / 1000000000,
                summary.pendapatanOperasional / 1000000000,
                summary.pendapatanNonOps / 1000000000
            ],
            labels: ['Pendapatan Bunga', 'Pendapatan Operasional', 'Pendapatan Non-Ops'],
            chart: {
                type: 'donut',
                height: 250
            },
            colors: ['#10b981', '#3b82f6', '#8b5cf6'],
            legend: {
                position: 'bottom'
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(1) + '%';
                }
            }
        };
        
        // Clear existing
        chartEl.innerHTML = '';
        
        const chart = new ApexCharts(chartEl, options);
        chart.render();
    }
    
    /**
     * Render pie chart biaya
     */
    renderBiayaPieChart(aggregatedData) {
        const chartEl = document.getElementById('pbBiayaPieChart');
        if (!chartEl) return;
        
        const summary = aggregatedData.summary;
        
        const options = {
            series: [
                summary.bebanBunga / 1000000000,
                summary.bebanOperasional / 1000000000,
                summary.bebanNonOps / 1000000000
            ],
            labels: ['Beban Bunga', 'Beban Operasional', 'Beban Non-Ops'],
            chart: {
                type: 'donut',
                height: 250
            },
            colors: ['#ef4444', '#f97316', '#eab308'],
            legend: {
                position: 'bottom'
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(1) + '%';
                }
            }
        };
        
        // Clear existing
        chartEl.innerHTML = '';
        
        const chart = new ApexCharts(chartEl, options);
        chart.render();
    }
    
    /**
     * Get data per cabang
     */
    async getDataPerCabang(periode, kodeCabang) {
        const result = await this.loadData(periode, { kodeCabang: kodeCabang });
        return result;
    }
    
    /**
     * Get comparison data (bulan ini vs bulan lalu)
     */
    async getComparisonData(periodeCurrent, periodePrevious) {
        const currentData = await this.loadData(periodeCurrent);
        const previousData = await this.loadData(periodePrevious);
        
        if (!currentData || !previousData) return null;
        
        const comparison = {};
        
        for (const [key, config] of Object.entries(SANDI_KATEGORI)) {
            const currentValue = currentData.aggregated.bySandi[config.sandi]?.total || 0;
            const previousValue = previousData.aggregated.bySandi[config.sandi]?.total || 0;
            const change = previousValue !== 0 ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100 : 0;
            
            comparison[key] = {
                label: config.label,
                current: currentValue,
                previous: previousValue,
                change: change,
                changeFormatted: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
            };
        }
        
        return comparison;
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }
}

// ==========================================
// GLOBAL INSTANCE & FUNCTIONS
// ==========================================

const LabaRugiLoader = new LabaRugiFirebaseLoader();

/**
 * Load dan tampilkan data laba rugi
 * Dipanggil dari dashboard
 */
async function loadLabaRugiData(periode = null, options = {}) {
    // Default ke Oktober 2025
    if (!periode) {
        periode = '2025-10';
    }
    
    console.log(`🔄 Loading laba rugi: ${periode}`);
    
    const result = await LabaRugiLoader.loadData(periode, options);
    
    if (result && result.aggregated) {
        LabaRugiLoader.updateDashboard(result.aggregated);
    }
    
    return result;
}

/**
 * Load data YTD
 */
async function loadLabaRugiYTD(tahun = 2025, bulanAkhir = 10, options = {}) {
    console.log(`🔄 Loading YTD: ${tahun} s/d bulan ${bulanAkhir}`);
    
    const result = await LabaRugiLoader.loadYTDData(tahun, bulanAkhir, options);
    
    if (result && result.aggregated) {
        LabaRugiLoader.updateDashboard(result.aggregated);
    }
    
    return result;
}

/**
 * Refresh data laba rugi
 */
async function refreshLabaRugiData() {
    LabaRugiLoader.clearCache();
    return loadLabaRugiData(LabaRugiLoader.currentPeriode);
}

// ==========================================
// AUTO-LOAD SAAT FIREBASE READY
// ==========================================

// Event listener untuk auto-load setelah Firebase ready
document.addEventListener('DOMContentLoaded', () => {
    // Tunggu Firebase init
    setTimeout(async () => {
        if (typeof FirebaseConnector !== 'undefined' && FirebaseConnector.isInitialized) {
            console.log('🚀 Auto-loading laba rugi data...');
            // Load YTD data (Jan-Okt 2025)
            await loadLabaRugiYTD(2025, 10);
        } else {
            console.log('⏳ Waiting for Firebase to initialize...');
            // Retry after 2 seconds
            setTimeout(async () => {
                if (typeof FirebaseConnector !== 'undefined') {
                    try {
                        await FirebaseConnector.init();
                        await loadLabaRugiYTD(2025, 10);
                    } catch (e) {
                        console.warn('⚠️ Could not auto-load laba rugi data:', e);
                    }
                }
            }, 2000);
        }
    }, 1000);
});

// ==========================================
// EXPORTS
// ==========================================

window.LabaRugiLoader = LabaRugiLoader;
window.loadLabaRugiData = loadLabaRugiData;
window.loadLabaRugiYTD = loadLabaRugiYTD;
window.refreshLabaRugiData = refreshLabaRugiData;
window.SANDI_KATEGORI = SANDI_KATEGORI;

console.log('✅ Laba Rugi Firebase Loader ready!');
