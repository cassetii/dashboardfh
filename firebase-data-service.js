/**
 * ==========================================
 * FIREBASE DATA SERVICE - BANK SULSELBAR
 * ==========================================
 * Service utama untuk mengambil semua data dari Firebase
 * Menggantikan semua data hardcode
 * 
 * Version: 1.0
 * Last Update: 2025
 * ==========================================
 */

const FirebaseDataService = {
    
    // Cache untuk mengurangi query Firebase
    cache: {
        neraca: new Map(),
        labarugi: new Map(),
        branches: new Map(),
        lastFetch: null,
        cacheTimeout: 5 * 60 * 1000 // 5 menit
    },
    
    // Status
    isInitialized: false,
    db: null,
    
    // Sandi penting untuk query
    SANDI: {
        // NERACA - ASET
        TOTAL_ASET: '01.00.00.00.00.00',
        KAS: '01.01.00.00.00.00',
        PENEMPATAN_BI: '01.02.00.00.00.00',
        PENEMPATAN_BANK_LAIN: '01.03.00.00.00.00',
        SURAT_BERHARGA: '01.05.00.00.00.00',
        REVERSE_REPO: '01.07.00.00.00.00',
        KREDIT: '01.09.00.00.00.00',
        KREDIT_DIBERIKAN: '01.09.01.00.00.00',
        PEMBIAYAAN_SYARIAH: '01.09.02.00.00.00',
        ASET_TETAP: '01.12.00.00.00.00',
        
        // NERACA - LIABILITAS (DPK)
        GIRO: '02.01.00.00.00.00',
        GIRO_KONVEN: '02.01.01.00.00.00',
        GIRO_SYARIAH: '02.01.02.00.00.00',
        TABUNGAN: '02.02.00.00.00.00',
        TABUNGAN_KONVEN: '02.02.01.00.00.00',
        TABUNGAN_SYARIAH: '02.02.02.00.00.00',
        DEPOSITO: '02.03.00.00.00.00',
        DEPOSITO_KONVEN: '02.03.01.00.00.00',
        DEPOSITO_SYARIAH: '02.03.02.00.00.00',
        PINJAMAN_DITERIMA: '02.05.00.00.00.00',
        
        // NERACA - EKUITAS
        MODAL: '03.01.00.00.00.00',
        CADANGAN: '03.02.00.00.00.00',
        LABA_RUGI: '03.05.00.00.00.00',
        
        // LABA RUGI
        PENDAPATAN_BUNGA: '04.01.00.00.00.00',
        BEBAN_BUNGA: '04.02.00.00.00.00',
        PENDAPATAN_OPERASIONAL: '04.03.00.00.00.00',
        BEBAN_OPERASIONAL: '04.04.00.00.00.00',
        LABA_SEBELUM_PAJAK: '04.07.00.00.00.00',
        LABA_BERSIH: '03.05.02.01.00.00'
    },
    
    // Master cabang (akan di-load atau dari konstanta)
    BRANCHES_MASTER: {
        '001': { kode: '001', nama: 'Kantor Pusat', tipe: 'pusat' },
        '010': { kode: '010', nama: 'Cabang Maros', tipe: 'konvensional' },
        '011': { kode: '011', nama: 'Cabang Pangkep', tipe: 'konvensional' },
        '020': { kode: '020', nama: 'Cabang Jeneponto', tipe: 'konvensional' },
        '021': { kode: '021', nama: 'Cabang Takalar', tipe: 'konvensional' },
        '030': { kode: '030', nama: 'Cabang Parepare', tipe: 'konvensional' },
        '031': { kode: '031', nama: 'Cabang Barru', tipe: 'konvensional' },
        '040': { kode: '040', nama: 'Cabang Bulukumba', tipe: 'konvensional' },
        '041': { kode: '041', nama: 'Cabang Bantaeng', tipe: 'konvensional' },
        '042': { kode: '042', nama: 'Cabang Selayar', tipe: 'konvensional' },
        '050': { kode: '050', nama: 'Cabang Pinrang', tipe: 'konvensional' },
        '060': { kode: '060', nama: 'Cabang Sinjai', tipe: 'konvensional' },
        '070': { kode: '070', nama: 'Cabang Polman', tipe: 'konvensional' },
        '071': { kode: '071', nama: 'Cabang Utama Mamuju', tipe: 'konvensional' },
        '072': { kode: '072', nama: 'Cabang Majene', tipe: 'konvensional' },
        '074': { kode: '074', nama: 'Cabang Mamasa', tipe: 'konvensional' },
        '075': { kode: '075', nama: 'Cabang Pasangkayu', tipe: 'konvensional' },
        '077': { kode: '077', nama: 'Cabang Topoyo', tipe: 'konvensional' },
        '080': { kode: '080', nama: 'Cabang Utama Bone', tipe: 'konvensional' },
        '090': { kode: '090', nama: 'Cabang Palopo', tipe: 'konvensional' },
        '091': { kode: '091', nama: 'Cabang Masamba', tipe: 'konvensional' },
        '092': { kode: '092', nama: 'Cabang Belopa', tipe: 'konvensional' },
        '093': { kode: '093', nama: 'Cabang Malili', tipe: 'konvensional' },
        '100': { kode: '100', nama: 'Cabang Sengkang', tipe: 'konvensional' },
        '101': { kode: '101', nama: 'Cabang Soppeng', tipe: 'konvensional' },
        '110': { kode: '110', nama: 'Cabang Makale', tipe: 'konvensional' },
        '111': { kode: '111', nama: 'Cabang Rantepao', tipe: 'konvensional' },
        '120': { kode: '120', nama: 'Cabang Sidrap', tipe: 'konvensional' },
        '121': { kode: '121', nama: 'Cabang Enrekang', tipe: 'konvensional' },
        '130': { kode: '130', nama: 'Cabang Utama Makassar', tipe: 'konvensional' },
        '140': { kode: '140', nama: 'Cabang Gowa', tipe: 'konvensional' },
        '150': { kode: '150', nama: 'Cabang Jakarta', tipe: 'konvensional' },
        '500': { kode: '500', nama: 'UUS (Unit Usaha Syariah)', tipe: 'syariah' },
        '510': { kode: '510', nama: 'KCS Makassar', tipe: 'syariah' },
        '520': { kode: '520', nama: 'KCS Sengkang', tipe: 'syariah' },
        '530': { kode: '530', nama: 'KCS Maros', tipe: 'syariah' },
        '540': { kode: '540', nama: 'KCS Mamuju', tipe: 'syariah' }
    },
    
    /**
     * Initialize service
     */
    async init() {
        if (this.isInitialized) return true;
        
        try {
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }
            
            if (!firebase.apps.length) {
                // Config sudah ada di firebase-connector.js
                console.warn('Firebase not initialized, waiting...');
                return false;
            }
            
            this.db = firebase.firestore();
            this.isInitialized = true;
            console.log('✅ FirebaseDataService initialized');
            return true;
            
        } catch (error) {
            console.error('❌ FirebaseDataService init error:', error);
            return false;
        }
    },
    
    /**
     * Get available periods dari data yang ada
     */
    async getAvailablePeriods() {
        await this.init();
        
        try {
            // Query distinct periods dari neraca
            const snapshot = await this.db.collection('banksulselbar_neraca')
                .where('sandi', '==', this.SANDI.TOTAL_ASET)
                .orderBy('periode', 'desc')
                .limit(100)
                .get();
            
            const periodsSet = new Set();
            snapshot.forEach(doc => {
                periodsSet.add(doc.data().periode);
            });
            
            const periods = Array.from(periodsSet).sort().reverse();
            console.log('📅 Available periods:', periods);
            return periods;
            
        } catch (error) {
            console.error('Error getting periods:', error);
            return [];
        }
    },
    
    /**
     * Get neraca data untuk periode tertentu
     * @param {string} periode - Format: "2025-01"
     * @param {string} tipe - "konsolidasi" | "konvensional" | "syariah" | kode_cabang
     */
    async getNeracaData(periode, tipe = 'konsolidasi') {
        await this.init();
        
        const cacheKey = `neraca_${periode}_${tipe}`;
        if (this.cache.neraca.has(cacheKey)) {
            return this.cache.neraca.get(cacheKey);
        }
        
        try {
            let query = this.db.collection('banksulselbar_neraca')
                .where('periode', '==', periode);
            
            // Filter berdasarkan tipe
            if (tipe === 'konvensional') {
                query = query.where('tipe', '==', 'konvensional');
            } else if (tipe === 'syariah') {
                query = query.where('tipe', '==', 'syariah');
            } else if (tipe !== 'konsolidasi') {
                // Specific branch
                query = query.where('kode_cabang', '==', tipe);
            }
            
            const snapshot = await query.get();
            
            // Organize data by sandi
            const data = {};
            snapshot.forEach(doc => {
                const item = doc.data();
                const sandi = item.sandi;
                
                if (!data[sandi]) {
                    data[sandi] = {
                        sandi: sandi,
                        pos: item.pos,
                        total: 0,
                        rupiah: 0,
                        valas: 0,
                        items: []
                    };
                }
                
                // Agregasi untuk konsolidasi
                if (tipe === 'konsolidasi' || tipe === 'konvensional' || tipe === 'syariah') {
                    data[sandi].total += item.total || 0;
                    data[sandi].rupiah += item.rupiah || 0;
                    data[sandi].valas += item.valas || 0;
                } else {
                    data[sandi].total = item.total || 0;
                    data[sandi].rupiah = item.rupiah || 0;
                    data[sandi].valas = item.valas || 0;
                }
                
                data[sandi].items.push(item);
            });
            
            this.cache.neraca.set(cacheKey, data);
            return data;
            
        } catch (error) {
            console.error('Error getting neraca:', error);
            return {};
        }
    },
    
    /**
     * Get laba rugi data untuk periode tertentu
     */
    async getLabaRugiData(periode, tipe = 'konsolidasi') {
        await this.init();
        
        const cacheKey = `labarugi_${periode}_${tipe}`;
        if (this.cache.labarugi.has(cacheKey)) {
            return this.cache.labarugi.get(cacheKey);
        }
        
        try {
            let query = this.db.collection('banksulselbar_labarugi')
                .where('periode', '==', periode);
            
            if (tipe === 'konvensional') {
                query = query.where('tipe', '==', 'konvensional');
            } else if (tipe === 'syariah') {
                query = query.where('tipe', '==', 'syariah');
            } else if (tipe !== 'konsolidasi') {
                query = query.where('kode_cabang', '==', tipe);
            }
            
            const snapshot = await query.get();
            
            const data = {};
            snapshot.forEach(doc => {
                const item = doc.data();
                const sandi = item.sandi;
                
                if (!data[sandi]) {
                    data[sandi] = {
                        sandi: sandi,
                        pos: item.pos,
                        total: 0,
                        rupiah: 0,
                        valas: 0,
                        items: []
                    };
                }
                
                if (tipe === 'konsolidasi' || tipe === 'konvensional' || tipe === 'syariah') {
                    data[sandi].total += item.total || 0;
                    data[sandi].rupiah += item.rupiah || 0;
                    data[sandi].valas += item.valas || 0;
                } else {
                    data[sandi].total = item.total || 0;
                    data[sandi].rupiah = item.rupiah || 0;
                    data[sandi].valas = item.valas || 0;
                }
                
                data[sandi].items.push(item);
            });
            
            this.cache.labarugi.set(cacheKey, data);
            return data;
            
        } catch (error) {
            console.error('Error getting labarugi:', error);
            return {};
        }
    },
    
    /**
     * Get summary data (Total Aset, DPK, Kredit, Laba) untuk periode
     */
    async getSummaryData(periode, tipe = 'konsolidasi') {
        const neraca = await this.getNeracaData(periode, tipe);
        const labarugi = await this.getLabaRugiData(periode, tipe);
        
        // Helper untuk ambil nilai dari sandi
        const getValue = (data, sandi) => {
            return data[sandi]?.total || 0;
        };
        
        // Hitung total DPK
        const giro = getValue(neraca, this.SANDI.GIRO);
        const tabungan = getValue(neraca, this.SANDI.TABUNGAN);
        const deposito = getValue(neraca, this.SANDI.DEPOSITO);
        const totalDPK = giro + tabungan + deposito;
        
        // Hitung kredit
        const kredit = getValue(neraca, this.SANDI.KREDIT) || getValue(neraca, this.SANDI.KREDIT_DIBERIKAN);
        
        // Ambil nilai
        const summary = {
            totalAset: getValue(neraca, this.SANDI.TOTAL_ASET),
            kas: getValue(neraca, this.SANDI.KAS),
            penempatanBI: getValue(neraca, this.SANDI.PENEMPATAN_BI),
            penempatanBankLain: getValue(neraca, this.SANDI.PENEMPATAN_BANK_LAIN),
            suratBerharga: getValue(neraca, this.SANDI.SURAT_BERHARGA),
            reverseRepo: getValue(neraca, this.SANDI.REVERSE_REPO),
            kredit: kredit,
            asetTetap: getValue(neraca, this.SANDI.ASET_TETAP),
            
            // DPK
            totalDPK: totalDPK,
            giro: giro,
            tabungan: tabungan,
            deposito: deposito,
            
            // Ekuitas
            modal: getValue(neraca, this.SANDI.MODAL),
            cadangan: getValue(neraca, this.SANDI.CADANGAN),
            
            // Laba Rugi
            pendapatanBunga: getValue(labarugi, this.SANDI.PENDAPATAN_BUNGA),
            bebanBunga: getValue(labarugi, this.SANDI.BEBAN_BUNGA),
            pendapatanOperasional: getValue(labarugi, this.SANDI.PENDAPATAN_OPERASIONAL),
            bebanOperasional: getValue(labarugi, this.SANDI.BEBAN_OPERASIONAL),
            labaBersih: getValue(labarugi, this.SANDI.LABA_BERSIH),
            
            // Metadata
            periode: periode,
            tipe: tipe
        };
        
        // Hitung NII (Net Interest Income)
        summary.nii = summary.pendapatanBunga - summary.bebanBunga;
        
        return summary;
    },
    
    /**
     * Calculate financial ratios
     */
    async calculateRatios(periode, tipe = 'konsolidasi') {
        const summary = await this.getSummaryData(periode, tipe);
        
        // LDR = Kredit / DPK * 100
        const ldr = summary.totalDPK > 0 ? (summary.kredit / summary.totalDPK) * 100 : 0;
        
        // CASA = (Giro + Tabungan) / DPK * 100
        const casa = summary.totalDPK > 0 ? ((summary.giro + summary.tabungan) / summary.totalDPK) * 100 : 0;
        
        // BOPO = Beban Operasional / Pendapatan Operasional * 100
        const totalPendapatan = summary.pendapatanBunga + summary.pendapatanOperasional;
        const totalBeban = summary.bebanBunga + summary.bebanOperasional;
        const bopo = totalPendapatan > 0 ? (totalBeban / totalPendapatan) * 100 : 0;
        
        // NIM = NII / Rata-rata Aset Produktif * 100 (simplified)
        const nim = summary.totalAset > 0 ? (summary.nii / summary.totalAset) * 100 : 0;
        
        // ROA = Laba Bersih / Total Aset * 100
        const roa = summary.totalAset > 0 ? (summary.labaBersih / summary.totalAset) * 100 : 0;
        
        // ROE = Laba Bersih / Modal * 100
        const roe = summary.modal > 0 ? (summary.labaBersih / summary.modal) * 100 : 0;
        
        return {
            LDR: parseFloat(ldr.toFixed(2)),
            CASA: parseFloat(casa.toFixed(2)),
            BOPO: parseFloat(bopo.toFixed(2)),
            NIM: parseFloat(nim.toFixed(2)),
            ROA: parseFloat(roa.toFixed(2)),
            ROE: parseFloat(roe.toFixed(2)),
            // NPL dan CAR butuh data tambahan
            NPL: 0,
            CAR: 0,
            LCR: 0,
            NSFR: 0
        };
    },
    
    /**
     * Get data per cabang untuk periode tertentu
     */
    async getBranchData(periode, kodeCabang) {
        return await this.getSummaryData(periode, kodeCabang);
    },
    
    /**
     * Get all branches data untuk periode
     */
    async getAllBranchesData(periode) {
        await this.init();
        
        try {
            // Query semua data neraca untuk periode ini
            const snapshot = await this.db.collection('banksulselbar_neraca')
                .where('periode', '==', periode)
                .where('sandi', '==', this.SANDI.TOTAL_ASET)
                .get();
            
            const branches = {};
            snapshot.forEach(doc => {
                const item = doc.data();
                const kode = item.kode_cabang;
                
                branches[kode] = {
                    kode: kode,
                    nama: item.nama_cabang,
                    tipe: item.tipe,
                    totalAset: item.total
                };
            });
            
            // Tambahkan data DPK dan Kredit
            const dpkSnapshot = await this.db.collection('banksulselbar_neraca')
                .where('periode', '==', periode)
                .where('sandi', 'in', [this.SANDI.GIRO, this.SANDI.TABUNGAN, this.SANDI.DEPOSITO])
                .get();
            
            dpkSnapshot.forEach(doc => {
                const item = doc.data();
                const kode = item.kode_cabang;
                
                if (branches[kode]) {
                    if (!branches[kode].dpk) branches[kode].dpk = 0;
                    branches[kode].dpk += item.total || 0;
                    
                    // Breakdown DPK
                    if (item.sandi === this.SANDI.GIRO) {
                        branches[kode].giro = item.total || 0;
                    } else if (item.sandi === this.SANDI.TABUNGAN) {
                        branches[kode].tabungan = item.total || 0;
                    } else if (item.sandi === this.SANDI.DEPOSITO) {
                        branches[kode].deposito = item.total || 0;
                    }
                }
            });
            
            // Tambahkan kredit
            const kreditSnapshot = await this.db.collection('banksulselbar_neraca')
                .where('periode', '==', periode)
                .where('sandi', '==', this.SANDI.KREDIT)
                .get();
            
            kreditSnapshot.forEach(doc => {
                const item = doc.data();
                const kode = item.kode_cabang;
                
                if (branches[kode]) {
                    branches[kode].kredit = item.total || 0;
                }
            });
            
            return branches;
            
        } catch (error) {
            console.error('Error getting all branches data:', error);
            return {};
        }
    },
    
    /**
     * Get historical data untuk multiple periods
     */
    async getHistoricalData(periods, tipe = 'konsolidasi') {
        const historical = [];
        
        for (const periode of periods) {
            const summary = await this.getSummaryData(periode, tipe);
            const ratios = await this.calculateRatios(periode, tipe);
            
            historical.push({
                periode: periode,
                periodName: this.formatPeriodName(periode),
                ...summary,
                ratios: ratios
            });
        }
        
        return historical.sort((a, b) => a.periode.localeCompare(b.periode));
    },
    
    /**
     * Get perbandingan Konvensional vs Syariah
     */
    async getKonvenVsSyariah(periode) {
        const konven = await this.getSummaryData(periode, 'konvensional');
        const syariah = await this.getSummaryData(periode, 'syariah');
        const konsolidasi = await this.getSummaryData(periode, 'konsolidasi');
        
        return {
            konsolidasi: konsolidasi,
            konvensional: konven,
            syariah: syariah,
            perbandingan: {
                asset: {
                    total: konsolidasi.totalAset,
                    konven: konven.totalAset,
                    syariah: syariah.totalAset,
                    konvenPct: konsolidasi.totalAset > 0 ? (konven.totalAset / konsolidasi.totalAset * 100) : 0,
                    syariahPct: konsolidasi.totalAset > 0 ? (syariah.totalAset / konsolidasi.totalAset * 100) : 0
                },
                kredit: {
                    total: konsolidasi.kredit,
                    konven: konven.kredit,
                    syariah: syariah.kredit,
                    konvenPct: konsolidasi.kredit > 0 ? (konven.kredit / konsolidasi.kredit * 100) : 0,
                    syariahPct: konsolidasi.kredit > 0 ? (syariah.kredit / konsolidasi.kredit * 100) : 0
                },
                dpk: {
                    total: konsolidasi.totalDPK,
                    konven: konven.totalDPK,
                    syariah: syariah.totalDPK,
                    konvenPct: konsolidasi.totalDPK > 0 ? (konven.totalDPK / konsolidasi.totalDPK * 100) : 0,
                    syariahPct: konsolidasi.totalDPK > 0 ? (syariah.totalDPK / konsolidasi.totalDPK * 100) : 0
                },
                laba: {
                    total: konsolidasi.labaBersih,
                    konven: konven.labaBersih,
                    syariah: syariah.labaBersih,
                    konvenPct: konsolidasi.labaBersih > 0 ? (konven.labaBersih / konsolidasi.labaBersih * 100) : 0,
                    syariahPct: konsolidasi.labaBersih > 0 ? (syariah.labaBersih / konsolidasi.labaBersih * 100) : 0
                }
            }
        };
    },
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.neraca.clear();
        this.cache.labarugi.clear();
        this.cache.branches.clear();
        this.cache.lastFetch = null;
        console.log('🗑️ Cache cleared');
    },
    
    /**
     * Format periode ke nama bulan
     */
    formatPeriodName(periode) {
        const months = {
            '01': 'Januari', '02': 'Februari', '03': 'Maret',
            '04': 'April', '05': 'Mei', '06': 'Juni',
            '07': 'Juli', '08': 'Agustus', '09': 'September',
            '10': 'Oktober', '11': 'November', '12': 'Desember'
        };
        
        const [year, month] = periode.split('-');
        return `${months[month] || month} ${year}`;
    },
    
    /**
     * Format angka ke Triliun/Miliar
     */
    formatCurrency(value, autoUnit = true) {
        if (!value || isNaN(value)) return 'Rp 0';
        
        if (autoUnit) {
            if (Math.abs(value) >= 1e12) {
                return `Rp ${(value / 1e12).toFixed(2)} T`;
            } else if (Math.abs(value) >= 1e9) {
                return `Rp ${(value / 1e9).toFixed(2)} M`;
            } else if (Math.abs(value) >= 1e6) {
                return `Rp ${(value / 1e6).toFixed(2)} Jt`;
            }
        }
        
        return `Rp ${value.toLocaleString('id-ID')}`;
    },
    
    /**
     * Convert to Triliun
     */
    toTriliun(value) {
        return value / 1e12;
    },
    
    /**
     * Convert to Miliar
     */
    toMiliar(value) {
        return value / 1e9;
    }
};

// Export
window.FirebaseDataService = FirebaseDataService;

console.log('🔥 FirebaseDataService loaded');
