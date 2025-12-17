// ========================================
// DATA RIIL BANK SULSELBAR DASHBOARD V3
// Source: Firebase Firestore (Live Data)
// TIDAK ADA DATA HARDCODE - Semua dari Firebase
// ========================================

// Struktur BANK_DATA yang akan diisi dari Firebase
const BANK_DATA = {
    metadata: {
        lastUpdate: null,
        period: null,
        periodType: "monthly",
        bankName: "PT Bank Sulselbar",
        dataSource: "Firebase Firestore",
        version: "4.0 - Live Firebase Data",
        isLoaded: false
    },
    
    // ========================================
    // FINANCIAL RATIOS - Akan diisi dari Firebase
    // ========================================
    ratios: {
        LDR: {
            name: "Loan to Deposit Ratio",
            current: 0,
            target: 92,
            threshold: { min: 78, max: 92 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        },
        NPL: {
            name: "Non Performing Loan",
            current: 0,
            target: 5,
            threshold: { min: 0, max: 5 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        },
        ROA: {
            name: "Return on Assets",
            current: 0,
            target: 1.5,
            threshold: { min: 1.5, max: 100 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        },
        CAR: {
            name: "Capital Adequacy Ratio",
            current: 0,
            target: 12,
            threshold: { min: 12, max: 100 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        },
        NIM: {
            name: "Net Interest Margin",
            current: 0,
            target: 4,
            threshold: { min: 4, max: 100 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        },
        ROE: {
            name: "Return on Equity",
            current: 0,
            target: 15,
            threshold: { min: 15, max: 100 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        },
        BOPO: {
            name: "Beban Operasional / Pendapatan Operasional",
            current: 0,
            target: 85,
            threshold: { min: 0, max: 85 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        },
        LCR: {
            name: "Liquidity Coverage Ratio",
            current: 0,
            target: 100,
            threshold: { min: 100, max: 999 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        },
        NSFR: {
            name: "Net Stable Funding Ratio",
            current: 0,
            target: 100,
            threshold: { min: 100, max: 999 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        },
        CASA: {
            name: "Current Account Saving Account",
            current: 0,
            target: 50,
            threshold: { min: 40, max: 100 },
            status: "loading",
            unit: "%",
            historical: [],
            monthlyData: []
        }
    },
    
    // ========================================
    // NERACA (BALANCE SHEET) - Akan diisi dari Firebase
    // ========================================
    neraca: {
        asset: {
            name: "Total Aset",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        kas: {
            name: "Kas",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        penempatanBI: {
            name: "Penempatan pada BI",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        suratBerharga: {
            name: "Surat Berharga",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        reverseRepo: {
            name: "Reverse Repo",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        kredit: {
            name: "Total Kredit",
            description: "Kredit yang diberikan (Konvensional + Syariah)",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: [],
            breakdown: {
                konvensional: 0,
                syariah: 0
            }
        },
        kreditPembiayaan: {
            name: "Kredit Pembiayaan",
            description: "Kredit untuk pembiayaan usaha",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: [],
            breakdown: {
                modal_kerja: 0,
                investasi: 0,
                konsumsi: 0
            }
        },
        asetTetap: {
            name: "Aset Tetap & Inventaris",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        dpkKonvensional: {
            name: "DPK Konvensional",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: [],
            composition: {
                giro: 0,
                tabungan: 0,
                deposito: 0
            }
        },
        dpkSyariah: {
            name: "DPK Syariah",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: [],
            composition: {
                giro: 0,
                tabungan: 0,
                deposito: 0
            }
        },
        giro: {
            name: "Giro",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        tabungan: {
            name: "Tabungan",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        deposito: {
            name: "Deposito",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        pinjamanDiterima: {
            name: "Pinjaman Diterima",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        modal: {
            name: "Modal (Ekuitas)",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            breakdown: {
                modalInti: 0,
                modalPelengkap: 0
            },
            historical: []
        },
        cadangan: {
            name: "Cadangan",
            current: 0,
            unit: "T",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        labaRugi: {
            name: "Laba Bersih YTD",
            current: 0,
            unit: "M",
            change: 0,
            changeType: "neutral",
            historical: []
        },
        pendapatan: {
            name: "Pendapatan Bunga YTD",
            current: 0,
            unit: "M",
            change: 0,
            changeType: "neutral",
            breakdown: {
                bungaBunga: 0,
                nonBunga: 0
            },
            historical: []
        },
        biaya: {
            name: "Beban Bunga YTD",
            current: 0,
            unit: "M",
            change: 0,
            changeType: "neutral",
            breakdown: {
                bebanBunga: 0,
                bebanOperasional: 0
            },
            historical: []
        },
        nii: {
            name: "Net Interest Income YTD",
            current: 0,
            unit: "M",
            change: 0,
            changeType: "neutral",
            historical: []
        }
    },
    
    // ========================================
    // RAW DATA - For Charts
    // ========================================
    rawData: [],
    
    // ========================================
    // PIPELINE DATA
    // ========================================
    pipeline: {
        dpk: { monthly: [], quarterly: [] },
        kredit: { monthly: [], quarterly: [] }
    },
    
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    getLatestData: function() {
        return {
            period: this.metadata.period,
            totalAset: this.neraca.asset.current,
            dpk: this.neraca.dpkKonvensional.current,
            kredit: this.neraca.kredit.current,
            kreditPembiayaan: this.neraca.kreditPembiayaan.current,
            labaBersih: this.neraca.labaRugi.current,
            car: this.ratios.CAR.current,
            npl: this.ratios.NPL.current,
            roa: this.ratios.ROA.current,
            ldr: this.ratios.LDR.current
        };
    },
    
    formatCurrency: function(value, unit) {
        let juta = value;
        if (unit === 'T') {
            juta = value * 1000000;
        } else if (unit === 'M') {
            juta = value * 1000;
        }
        return `Rp ${juta.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Jt`;
    }
};

// ========================================
// FIREBASE DATA LOADER
// ========================================

const BankDataLoader = {
    currentPeriod: null,
    availablePeriods: [],
    isLoading: false,
    
    /**
     * Initialize dan load data dari Firebase
     */
    async init() {
        console.log('🔄 BankDataLoader initializing...');
        
        // Tunggu FirebaseDataService ready
        if (typeof FirebaseDataService === 'undefined') {
            console.error('❌ FirebaseDataService not found!');
            return false;
        }
        
        await FirebaseDataService.init();
        
        // Get available periods
        this.availablePeriods = await FirebaseDataService.getAvailablePeriods();
        
        if (this.availablePeriods.length === 0) {
            console.warn('⚠️ No data found in Firebase');
            return false;
        }
        
        // Load data periode terbaru
        this.currentPeriod = this.availablePeriods[0];
        await this.loadPeriodData(this.currentPeriod);
        
        // Load historical data
        await this.loadHistoricalData();
        
        BANK_DATA.metadata.isLoaded = true;
        console.log('✅ BankDataLoader ready');
        
        return true;
    },
    
    /**
     * Load data untuk periode tertentu
     */
    async loadPeriodData(periode) {
        if (this.isLoading) return;
        this.isLoading = true;
        
        console.log(`📊 Loading data for period: ${periode}`);
        
        try {
            // Get summary data
            const summary = await FirebaseDataService.getSummaryData(periode, 'konsolidasi');
            const ratios = await FirebaseDataService.calculateRatios(periode, 'konsolidasi');
            
            // Get konven vs syariah
            const konvenSyariah = await FirebaseDataService.getKonvenVsSyariah(periode);
            
            // Update metadata
            BANK_DATA.metadata.lastUpdate = new Date().toISOString();
            BANK_DATA.metadata.period = FirebaseDataService.formatPeriodName(periode);
            
            // Update neraca data (convert dari Rupiah ke Triliun/Miliar)
            this.updateNeracaData(summary, konvenSyariah);
            
            // Update ratios
            this.updateRatiosData(ratios);
            
            this.currentPeriod = periode;
            
            console.log(`✅ Data loaded for ${periode}`);
            
        } catch (error) {
            console.error('Error loading period data:', error);
        } finally {
            this.isLoading = false;
        }
    },
    
    /**
     * Update neraca data dari Firebase summary
     */
    updateNeracaData(summary, konvenSyariah) {
        const toT = (val) => parseFloat((val / 1e12).toFixed(2)); // Convert to Triliun
        const toM = (val) => parseFloat((val / 1e9).toFixed(2));  // Convert to Miliar
        
        // Update aset
        BANK_DATA.neraca.asset.current = toT(summary.totalAset);
        BANK_DATA.neraca.kas.current = toT(summary.kas);
        BANK_DATA.neraca.penempatanBI.current = toT(summary.penempatanBI);
        BANK_DATA.neraca.suratBerharga.current = toT(summary.suratBerharga);
        BANK_DATA.neraca.reverseRepo.current = toT(summary.reverseRepo);
        BANK_DATA.neraca.kredit.current = toT(summary.kredit);
        BANK_DATA.neraca.asetTetap.current = toT(summary.asetTetap);
        
        // Update DPK
        const totalDPK = summary.totalDPK;
        BANK_DATA.neraca.giro.current = toT(summary.giro);
        BANK_DATA.neraca.tabungan.current = toT(summary.tabungan);
        BANK_DATA.neraca.deposito.current = toT(summary.deposito);
        
        // Update DPK Konvensional vs Syariah
        if (konvenSyariah) {
            BANK_DATA.neraca.dpkKonvensional.current = toT(konvenSyariah.konvensional.totalDPK);
            BANK_DATA.neraca.dpkKonvensional.composition.giro = toT(konvenSyariah.konvensional.giro);
            BANK_DATA.neraca.dpkKonvensional.composition.tabungan = toT(konvenSyariah.konvensional.tabungan);
            BANK_DATA.neraca.dpkKonvensional.composition.deposito = toT(konvenSyariah.konvensional.deposito);
            
            BANK_DATA.neraca.dpkSyariah.current = toT(konvenSyariah.syariah.totalDPK);
            BANK_DATA.neraca.dpkSyariah.composition.giro = toT(konvenSyariah.syariah.giro);
            BANK_DATA.neraca.dpkSyariah.composition.tabungan = toT(konvenSyariah.syariah.tabungan);
            BANK_DATA.neraca.dpkSyariah.composition.deposito = toT(konvenSyariah.syariah.deposito);
            
            // Update kredit breakdown
            BANK_DATA.neraca.kredit.breakdown.konvensional = toT(konvenSyariah.konvensional.kredit);
            BANK_DATA.neraca.kredit.breakdown.syariah = toT(konvenSyariah.syariah.kredit);
        }
        
        // Update Ekuitas
        BANK_DATA.neraca.modal.current = toT(summary.modal);
        BANK_DATA.neraca.cadangan.current = toT(summary.cadangan);
        
        // Update Laba Rugi (dalam Miliar)
        BANK_DATA.neraca.labaRugi.current = toM(summary.labaBersih);
        BANK_DATA.neraca.pendapatan.current = toM(summary.pendapatanBunga);
        BANK_DATA.neraca.pendapatan.breakdown.bungaBunga = toM(summary.pendapatanBunga);
        BANK_DATA.neraca.pendapatan.breakdown.nonBunga = toM(summary.pendapatanOperasional);
        BANK_DATA.neraca.biaya.current = toM(summary.bebanBunga);
        BANK_DATA.neraca.biaya.breakdown.bebanBunga = toM(summary.bebanBunga);
        BANK_DATA.neraca.biaya.breakdown.bebanOperasional = toM(summary.bebanOperasional);
        BANK_DATA.neraca.nii.current = toM(summary.nii);
    },
    
    /**
     * Update ratios data dari Firebase
     */
    updateRatiosData(ratios) {
        // Update each ratio
        const ratioKeys = ['LDR', 'NPL', 'ROA', 'CAR', 'NIM', 'ROE', 'BOPO', 'LCR', 'NSFR', 'CASA'];
        
        ratioKeys.forEach(key => {
            if (BANK_DATA.ratios[key] && ratios[key] !== undefined) {
                BANK_DATA.ratios[key].current = ratios[key];
                BANK_DATA.ratios[key].status = this.getRatioStatus(key, ratios[key]);
            }
        });
    },
    
    /**
     * Get status untuk ratio berdasarkan threshold
     */
    getRatioStatus(ratioKey, value) {
        const ratio = BANK_DATA.ratios[ratioKey];
        if (!ratio || !ratio.threshold) return 'neutral';
        
        const { min, max } = ratio.threshold;
        
        // Special handling untuk ratio yang "lower is better" (NPL, BOPO)
        if (ratioKey === 'NPL' || ratioKey === 'BOPO') {
            if (value <= min) return 'safe';
            if (value <= max) return 'warning';
            return 'danger';
        }
        
        // Standard handling (higher is better)
        if (value >= min && value <= max) return 'safe';
        if (value < min) return 'warning';
        return 'safe'; // Above max for CAR, ROA etc is good
    },
    
    /**
     * Load historical data untuk charts
     */
    async loadHistoricalData() {
        if (this.availablePeriods.length === 0) return;
        
        console.log('📈 Loading historical data...');
        
        // Ambil max 12 periode terakhir
        const periodsToLoad = this.availablePeriods.slice(0, 12).reverse();
        
        const historical = await FirebaseDataService.getHistoricalData(periodsToLoad, 'konsolidasi');
        
        // Update historical data untuk setiap item
        const toT = (val) => parseFloat((val / 1e12).toFixed(2));
        const toM = (val) => parseFloat((val / 1e9).toFixed(2));
        
        // Update neraca historical
        BANK_DATA.neraca.asset.historical = historical.map(h => ({
            period: h.periodName,
            value: toT(h.totalAset)
        }));
        
        BANK_DATA.neraca.kredit.historical = historical.map(h => ({
            period: h.periodName,
            value: toT(h.kredit)
        }));
        
        BANK_DATA.neraca.dpkKonvensional.historical = historical.map(h => ({
            period: h.periodName,
            value: toT(h.totalDPK)
        }));
        
        BANK_DATA.neraca.labaRugi.historical = historical.map(h => ({
            period: h.periodName,
            value: toM(h.labaBersih)
        }));
        
        // Update ratios historical & monthlyData
        const ratioKeys = ['LDR', 'NPL', 'ROA', 'CAR', 'NIM', 'ROE', 'BOPO', 'LCR', 'NSFR', 'CASA'];
        
        ratioKeys.forEach(key => {
            if (BANK_DATA.ratios[key]) {
                BANK_DATA.ratios[key].historical = historical.map(h => ({
                    period: h.periodName,
                    value: h.ratios[key] || 0
                }));
                
                BANK_DATA.ratios[key].monthlyData = historical.map(h => ({
                    month: h.periodName.split(' ')[0],
                    value: h.ratios[key] || 0,
                    target: BANK_DATA.ratios[key].target
                }));
            }
        });
        
        console.log('✅ Historical data loaded');
    },
    
    /**
     * Change period dan reload data
     */
    async changePeriod(periode) {
        await this.loadPeriodData(periode);
        await this.loadHistoricalData();
        
        // Trigger UI refresh jika ada
        if (typeof refreshDashboardUI === 'function') {
            refreshDashboardUI();
        }
        
        // Dispatch event untuk komponen lain
        window.dispatchEvent(new CustomEvent('bankDataUpdated', {
            detail: { period: periode }
        }));
    }
};

// ========================================
// AUTO-INITIALIZE
// ========================================

// Initialize saat DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    // Tunggu Firebase scripts load
    setTimeout(async () => {
        const success = await BankDataLoader.init();
        
        if (success) {
            console.log('🎉 Bank Sulselbar Data loaded from Firebase!');
            console.log('   Period:', BANK_DATA.metadata.period);
            console.log('   Total Aset:', BANK_DATA.neraca.asset.current, 'T');
            console.log('   DPK:', BANK_DATA.neraca.dpkKonvensional.current, 'T');
            console.log('   Kredit:', BANK_DATA.neraca.kredit.current, 'T');
            
            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('bankDataReady'));
        } else {
            console.warn('⚠️ Failed to load data from Firebase');
        }
    }, 1500);
});

// Export untuk kompatibilitas
window.BANK_DATA = BANK_DATA;
window.BankDataLoader = BankDataLoader;

console.log('📦 Bank Sulselbar Data V4 (Firebase Live) loaded');
