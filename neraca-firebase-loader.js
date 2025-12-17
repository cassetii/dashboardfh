/**
 * ==========================================
 * NERACA FIREBASE LOADER - BANK SULSELBAR
 * ==========================================
 * Fungsi untuk mengambil data Neraca dari Firebase
 * dan menampilkan di Dashboard
 * 
 * Collection: banksulselbar_neraca
 * 
 * Author: Claude AI
 * Version: 1.0
 * ==========================================
 */

console.log('📊 Loading Neraca Firebase Loader...');

// ==========================================
// MAPPING SANDI KE KATEGORI NERACA
// ==========================================

const NERACA_SANDI_KATEGORI = {
    // === ASET ===
    TOTAL_ASET: '01.00.00.00.00.00',
    KAS: '01.01.00.00.00.00',
    PENEMPATAN_BI: '01.02.00.00.00.00',
    PENEMPATAN_BANK_LAIN: '01.03.00.00.00.00',
    SURAT_BERHARGA: '01.05.00.00.00.00',
    KREDIT: '01.09.01.00.00.00',
    
    // Pembiayaan Syariah
    PIUTANG_MURABAHAH: '01.09.03.01.01.00',
    MARGIN_MURABAHAH: '01.09.03.01.02.00',
    PIUTANG_QARDH: '01.09.03.01.05.00',
    PEMBIAYAAN_MUDHARABAH: '01.09.03.02.01.00',
    PEMBIAYAAN_MUSYARAKAH: '01.09.03.02.02.00',
    
    // ATI & CKPN
    ATI: '01.14.01.00.00.00',
    AKUM_PENYUSUTAN_ATI: '01.14.02.00.00.00',
    CKPN_KREDIT: '01.12.02.01.00.00',
    CKPN_MURABAHAH: '01.12.02.02.01.00',
    CKPN_MUSYARAKAH: '01.12.02.02.07.00',
    
    // === LIABILITAS ===
    GIRO: '02.01.01.00.00.00',
    GIRO_SYARIAH: '02.01.02.00.00.00',
    TABUNGAN: '02.02.01.00.00.00',
    TABUNGAN_SYARIAH: '02.02.02.00.00.00',
    DEPOSITO: '02.03.01.00.00.00',
    DEPOSITO_SYARIAH: '02.03.02.00.00.00',
    
    // === EKUITAS ===
    MODAL_DASAR: '03.01.01.00.00.00',
    MODAL_BELUM_DISETOR: '03.01.02.00.00.00',
    CADANGAN_UMUM: '03.04.01.00.00.00',
    CADANGAN_TUJUAN: '03.04.02.00.00.00',
    TOTAL_LIABILITAS_EKUITAS: '03.00.00.00.00.00'
};

// Sandi yang perlu di-load untuk kalkulasi
const NERACA_SANDI_LIST = Object.values(NERACA_SANDI_KATEGORI);

// ==========================================
// NERACA FIREBASE LOADER CLASS
// ==========================================

class NeracaFirebaseLoader {
    
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Load data Neraca untuk periode tertentu
     */
    async loadData(periode, options = {}) {
        console.log(`📊 Loading Neraca data for periode: ${periode}`);
        
        const cacheKey = `neraca_${periode}`;
        
        // Check cache
        if (!options.forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log('📦 Using cached Neraca data');
                return cached.data;
            }
        }
        
        // Validate Firebase
        if (typeof FirebaseConnector === 'undefined' || !FirebaseConnector.db) {
            console.warn('⚠️ Firebase not initialized');
            return null;
        }
        
        try {
            const db = FirebaseConnector.db;
            const snapshot = await db.collection('banksulselbar_neraca')
                .where('periode', '==', periode)
                .get();
            
            const data = [];
            snapshot.forEach(doc => {
                data.push(doc.data());
            });
            
            console.log(`✅ Loaded ${data.length} Neraca records for ${periode}`);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
            
        } catch (error) {
            console.error('❌ Error loading Neraca data:', error);
            return null;
        }
    }
    
    /**
     * Load data YTD (Year to Date)
     */
    async loadLatestData(tahun = 2025, options = {}) {
        console.log(`📊 Loading latest Neraca data for ${tahun}`);
        
        // Try from latest month backwards
        const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        
        for (let i = months.length - 1; i >= 0; i--) {
            const periode = `${tahun}-${months[i]}`;
            const data = await this.loadData(periode, options);
            
            if (data && data.length > 0) {
                console.log(`✅ Found latest data for ${periode}`);
                return {
                    periode: periode,
                    data: data
                };
            }
        }
        
        console.warn('⚠️ No Neraca data found');
        return null;
    }
    
    /**
     * Aggregate data by sandi
     */
    aggregateData(data) {
        if (!data || data.length === 0) {
            return null;
        }
        
        const result = {
            bySandi: {},
            byTipe: {
                konvensional: {},
                syariah: {}
            },
            summary: {}
        };
        
        // Group by sandi
        data.forEach(item => {
            const sandi = item.sandi;
            
            if (!result.bySandi[sandi]) {
                result.bySandi[sandi] = {
                    sandi: sandi,
                    pos: item.pos,
                    rupiah: 0,
                    valas: 0,
                    total: 0,
                    konvensional: { rupiah: 0, valas: 0, total: 0 },
                    syariah: { rupiah: 0, valas: 0, total: 0 }
                };
            }
            
            result.bySandi[sandi].rupiah += item.rupiah || 0;
            result.bySandi[sandi].valas += item.valas || 0;
            result.bySandi[sandi].total += item.total || 0;
            
            if (item.tipe === 'syariah') {
                result.bySandi[sandi].syariah.rupiah += item.rupiah || 0;
                result.bySandi[sandi].syariah.valas += item.valas || 0;
                result.bySandi[sandi].syariah.total += item.total || 0;
            } else {
                result.bySandi[sandi].konvensional.rupiah += item.rupiah || 0;
                result.bySandi[sandi].konvensional.valas += item.valas || 0;
                result.bySandi[sandi].konvensional.total += item.total || 0;
            }
        });
        
        // Calculate summary
        const getSandiTotal = (sandiKey) => {
            const sandi = NERACA_SANDI_KATEGORI[sandiKey];
            return result.bySandi[sandi]?.total || 0;
        };
        
        // Total Aset
        result.summary.totalAset = getSandiTotal('TOTAL_ASET');
        
        // Total Kredit (Konvensional)
        result.summary.totalKredit = getSandiTotal('KREDIT');
        
        // Pembiayaan Syariah
        const piutangMurabahah = getSandiTotal('PIUTANG_MURABAHAH');
        const marginMurabahah = getSandiTotal('MARGIN_MURABAHAH'); // Negative
        const piutangQardh = getSandiTotal('PIUTANG_QARDH');
        const pembiayaanMudharabah = getSandiTotal('PEMBIAYAAN_MUDHARABAH');
        const pembiayaanMusyarakah = getSandiTotal('PEMBIAYAAN_MUSYARAKAH');
        
        result.summary.pembiayaanSyariah = piutangMurabahah + marginMurabahah + piutangQardh + 
                                           pembiayaanMudharabah + pembiayaanMusyarakah;
        
        // Total Kredit + Pembiayaan
        result.summary.totalKreditPembiayaan = result.summary.totalKredit + result.summary.pembiayaanSyariah;
        
        // ATI (Aset Tetap & Inventaris)
        const ati = getSandiTotal('ATI');
        const akumPenyusutanATI = Math.abs(getSandiTotal('AKUM_PENYUSUTAN_ATI'));
        result.summary.ati = ati - akumPenyusutanATI;
        result.summary.atiGross = ati;
        
        // CKPN
        const ckpnKredit = Math.abs(getSandiTotal('CKPN_KREDIT'));
        const ckpnMurabahah = Math.abs(getSandiTotal('CKPN_MURABAHAH'));
        const ckpnMusyarakah = Math.abs(getSandiTotal('CKPN_MUSYARAKAH'));
        result.summary.ckpn = ckpnKredit + ckpnMurabahah + ckpnMusyarakah;
        
        // DPK (Dana Pihak Ketiga)
        const giro = getSandiTotal('GIRO') + getSandiTotal('GIRO_SYARIAH');
        const tabungan = getSandiTotal('TABUNGAN') + getSandiTotal('TABUNGAN_SYARIAH');
        const deposito = getSandiTotal('DEPOSITO') + getSandiTotal('DEPOSITO_SYARIAH');
        
        result.summary.giro = giro;
        result.summary.tabungan = tabungan;
        result.summary.deposito = deposito;
        result.summary.dpk = giro + tabungan + deposito;
        
        // Modal
        const modalDasar = getSandiTotal('MODAL_DASAR');
        const modalBelumDisetor = Math.abs(getSandiTotal('MODAL_BELUM_DISETOR'));
        result.summary.modalDasar = modalDasar;
        result.summary.modalDisetor = modalDasar - modalBelumDisetor;
        
        // Cadangan
        const cadanganUmum = getSandiTotal('CADANGAN_UMUM');
        const cadanganTujuan = getSandiTotal('CADANGAN_TUJUAN');
        result.summary.cadangan = cadanganUmum + cadanganTujuan;
        
        // Total Ekuitas (approximation)
        result.summary.totalEkuitas = result.summary.modalDisetor + result.summary.cadangan;
        
        // Kas & Penempatan
        result.summary.kas = getSandiTotal('KAS');
        result.summary.penempatanBI = getSandiTotal('PENEMPATAN_BI');
        result.summary.penempatanBankLain = getSandiTotal('PENEMPATAN_BANK_LAIN');
        result.summary.suratBerharga = getSandiTotal('SURAT_BERHARGA');
        
        console.log('📊 Neraca Summary:', result.summary);
        
        return result;
    }
    
    /**
     * Update Dashboard dengan data Neraca
     */
    updateDashboard(aggregatedData) {
        if (!aggregatedData || !aggregatedData.summary) {
            console.warn('⚠️ No aggregated Neraca data to display');
            return;
        }
        
        const summary = aggregatedData.summary;
        
        // Update Neraca cards
        this.updateNeracaCards(summary);
        
        console.log('✅ Dashboard Neraca updated');
    }
    
    /**
     * Update Neraca Cards in Dashboard
     */
    updateNeracaCards(summary) {
        // Helper function to format value
        const formatValue = (value) => {
            const absValue = Math.abs(value);
            
            if (absValue >= 1e12) {
                return { value: (value / 1e12).toFixed(2), unit: 'Triliun' };
            } else if (absValue >= 1e9) {
                return { value: (value / 1e9).toFixed(2), unit: 'Miliar' };
            } else if (absValue >= 1e6) {
                return { value: (value / 1e6).toFixed(2), unit: 'Juta' };
            }
            return { value: value.toLocaleString(), unit: '' };
        };
        
        // Helper to update card by ID
        const updateCardById = (elementId, value) => {
            const el = document.getElementById(elementId);
            if (el) {
                const formatted = formatValue(value);
                el.innerHTML = `Rp ${formatted.value} <span>${formatted.unit}</span>`;
            }
        };
        
        // Update Neraca cards with specific IDs
        updateCardById('neracaCardTotalAset', summary.totalAset);
        updateCardById('neracaCardTotalKredit', summary.totalKredit);
        updateCardById('neracaCardPembiayaan', summary.pembiayaanSyariah);
        updateCardById('neracaCardATI', summary.ati);
        updateCardById('neracaCardCKPN', summary.ckpn);
        updateCardById('neracaCardDPK', summary.dpk);
        updateCardById('neracaCardModal', summary.modalDisetor);
        
        // Laba, Pendapatan, Biaya akan diupdate oleh labarugi-firebase-loader
        // Tapi kita set placeholder jika belum ada data
        // updateCardById('neracaCardLabaBersih', 0);
        // updateCardById('neracaCardPendapatan', 0);
        // updateCardById('neracaCardBiaya', 0);
        
        // Update card values using label text as fallback
        const updateCard = (labelText, newValue, newUnit) => {
            const labels = document.querySelectorAll('.neraca-card-label');
            labels.forEach(label => {
                if (label.textContent.toLowerCase().includes(labelText.toLowerCase())) {
                    const card = label.closest('.neraca-card-v2');
                    if (card) {
                        const valueEl = card.querySelector('.neraca-card-value');
                        if (valueEl && !valueEl.id) { // Only update if no ID (not already updated)
                            valueEl.innerHTML = `Rp ${newValue} <span>${newUnit}</span>`;
                        }
                    }
                }
            });
        };
        
        // Fallback updates using label text
        let formatted = formatValue(summary.totalAset);
        updateCard('Total Asset', formatted.value, formatted.unit);
        
        formatted = formatValue(summary.totalKredit);
        updateCard('Total Kredit', formatted.value, formatted.unit);
        
        formatted = formatValue(summary.pembiayaanSyariah);
        updateCard('Kredit Pembiayaan', formatted.value, formatted.unit);
        
        formatted = formatValue(summary.ati);
        updateCard('ATI', formatted.value, formatted.unit);
        
        formatted = formatValue(summary.ckpn);
        updateCard('CKPN', formatted.value, formatted.unit);
        
        formatted = formatValue(summary.dpk);
        updateCard('Dana Pihak Ketiga', formatted.value, formatted.unit);
        
        formatted = formatValue(summary.modalDisetor);
        updateCard('Total Modal', formatted.value, formatted.unit);
        
        console.log('✅ Neraca cards updated');
    }
    
    /**
     * Helper to update element by ID
     */
    updateElementById(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) {
            const formatted = this.formatCurrency(value);
            el.textContent = formatted;
        }
    }
    
    /**
     * Format currency
     */
    formatCurrency(value) {
        const absValue = Math.abs(value);
        
        if (absValue >= 1e12) {
            return `Rp ${(value / 1e12).toFixed(2)} T`;
        } else if (absValue >= 1e9) {
            return `Rp ${(value / 1e9).toFixed(2)} M`;
        } else if (absValue >= 1e6) {
            return `Rp ${(value / 1e6).toFixed(2)} Jt`;
        }
        return `Rp ${value.toLocaleString()}`;
    }
    
    /**
     * Get DPK Composition for charts
     */
    getDPKComposition(aggregatedData) {
        if (!aggregatedData || !aggregatedData.summary) return null;
        
        const summary = aggregatedData.summary;
        
        return {
            labels: ['Giro', 'Tabungan', 'Deposito'],
            values: [summary.giro, summary.tabungan, summary.deposito],
            total: summary.dpk
        };
    }
    
    /**
     * Get Asset Composition for charts
     */
    getAssetComposition(aggregatedData) {
        if (!aggregatedData || !aggregatedData.summary) return null;
        
        const summary = aggregatedData.summary;
        
        const kredit = summary.totalKredit + summary.pembiayaanSyariah;
        const kas = summary.kas;
        const penempatan = summary.penempatanBI + summary.penempatanBankLain;
        const suratBerharga = summary.suratBerharga;
        const lainnya = summary.totalAset - kredit - kas - penempatan - suratBerharga - summary.ati;
        
        return {
            labels: ['Kredit & Pembiayaan', 'Kas', 'Penempatan', 'Surat Berharga', 'ATI', 'Lainnya'],
            values: [kredit, kas, penempatan, suratBerharga, summary.ati, lainnya],
            total: summary.totalAset
        };
    }
    
    /**
     * Render DPK Pie Chart
     */
    renderDPKPieChart(containerId, aggregatedData) {
        const composition = this.getDPKComposition(aggregatedData);
        if (!composition) return;
        
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (typeof ApexCharts === 'undefined') {
            console.warn('ApexCharts not loaded');
            return;
        }
        
        const options = {
            series: composition.values,
            labels: composition.labels,
            chart: {
                type: 'donut',
                height: 280
            },
            colors: ['#3b82f6', '#10b981', '#f59e0b'],
            legend: {
                position: 'bottom'
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(1) + '%';
                }
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        if (val >= 1e12) return 'Rp ' + (val / 1e12).toFixed(2) + ' T';
                        if (val >= 1e9) return 'Rp ' + (val / 1e9).toFixed(2) + ' M';
                        return 'Rp ' + val.toLocaleString();
                    }
                }
            },
            title: {
                text: 'Komposisi DPK',
                align: 'center'
            }
        };
        
        // Clear existing chart
        container.innerHTML = '';
        
        const chart = new ApexCharts(container, options);
        chart.render();
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Neraca cache cleared');
    }
}

// ==========================================
// GLOBAL INSTANCE & FUNCTIONS
// ==========================================

const neracaLoader = new NeracaFirebaseLoader();

/**
 * Load dan update Neraca di Dashboard
 */
async function loadNeracaData(periode, options = {}) {
    const data = await neracaLoader.loadData(periode, options);
    if (data) {
        const aggregated = neracaLoader.aggregateData(data);
        neracaLoader.updateDashboard(aggregated);
        return aggregated;
    }
    return null;
}

/**
 * Load data Neraca terbaru
 */
async function loadLatestNeracaData(tahun = 2025, options = {}) {
    const result = await neracaLoader.loadLatestData(tahun, options);
    if (result && result.data) {
        const aggregated = neracaLoader.aggregateData(result.data);
        neracaLoader.updateDashboard(aggregated);
        return {
            periode: result.periode,
            aggregated: aggregated
        };
    }
    return null;
}

/**
 * Refresh data Neraca
 */
async function refreshNeracaData() {
    neracaLoader.clearCache();
    return await loadLatestNeracaData(2025, { forceRefresh: true });
}

// ==========================================
// AUTO-LOAD ON DASHBOARD
// ==========================================

// Check if we're on the dashboard and Firebase is ready
function initNeracaLoader() {
    // Wait for Firebase to be ready
    if (typeof FirebaseConnector !== 'undefined' && FirebaseConnector.isInitialized) {
        console.log('🚀 Auto-loading Neraca data...');
        loadLatestNeracaData(2025);
    } else {
        // Retry after 2 seconds
        setTimeout(initNeracaLoader, 2000);
    }
}

// Initialize after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initNeracaLoader, 1000);
    });
} else {
    setTimeout(initNeracaLoader, 1000);
}

// ==========================================
// EXPORTS
// ==========================================

window.NeracaFirebaseLoader = NeracaFirebaseLoader;
window.neracaLoader = neracaLoader;
window.loadNeracaData = loadNeracaData;
window.loadLatestNeracaData = loadLatestNeracaData;
window.refreshNeracaData = refreshNeracaData;
window.NERACA_SANDI_KATEGORI = NERACA_SANDI_KATEGORI;

console.log('✅ Neraca Firebase Loader ready!');
