/**
 * ============================================
 * TARGET FIREBASE LOADER
 * Bank Sulselbar Dashboard
 * ============================================
 * 
 * Load data Target dari Firebase collections:
 * - banksulselbar_target_neraca
 * - banksulselbar_target_labarugi
 */

const TargetFirebaseLoader = {
    // State
    targetNeracaData: [],
    targetLabarugiData: [],
    isLoaded: false,
    isLoading: false,
    db: null,

    /**
     * Initialize dan load semua data target
     */
    async init() {
        if (this.isLoaded) {
            console.log('✅ Target data already loaded');
            return true;
        }
        
        if (this.isLoading) {
            console.log('⏳ Target data loading in progress...');
            return this.waitForLoad();
        }

        this.isLoading = true;
        console.log('🎯 Loading Target Data from Firebase...');

        try {
            // Get Firebase db
            await this.getFirebaseDb();
            
            if (!this.db) {
                console.warn('⚠️ Firebase not available');
                this.isLoading = false;
                return false;
            }
            
            // Load data
            await this.loadTargetNeraca();
            await this.loadTargetLabarugi();
            
            this.isLoaded = true;
            this.isLoading = false;
            
            console.log('✅ Target Data loaded successfully!');
            console.log(`   📊 Target Neraca: ${this.targetNeracaData.length} records`);
            console.log(`   📊 Target Laba Rugi: ${this.targetLabarugiData.length} records`);

            // Dispatch event untuk notify komponen lain
            window.dispatchEvent(new CustomEvent('targetDataLoaded', {
                detail: {
                    neraca: this.targetNeracaData.length,
                    labarugi: this.targetLabarugiData.length
                }
            }));

            return true;

        } catch (error) {
            console.error('❌ Error loading target data:', error);
            this.isLoading = false;
            return false;
        }
    },

    /**
     * Get Firebase database reference
     */
    async getFirebaseDb() {
        // Try different ways to get db
        if (window.firebase?.firestore) {
            this.db = window.firebase.firestore();
            console.log('   Firebase db from window.firebase.firestore()');
            return;
        }
        
        if (window.FirebaseConnector?.db) {
            this.db = window.FirebaseConnector.db;
            console.log('   Firebase db from FirebaseConnector');
            return;
        }
        
        // Wait for firebase to initialize
        const timeout = 10000;
        const start = Date.now();
        
        while (Date.now() - start < timeout) {
            if (window.firebase?.firestore) {
                this.db = window.firebase.firestore();
                return;
            }
            if (window.FirebaseConnector?.db) {
                this.db = window.FirebaseConnector.db;
                return;
            }
            await new Promise(r => setTimeout(r, 200));
        }
        
        console.warn('⚠️ Could not get Firebase db');
    },

    /**
     * Wait for load to complete
     */
    async waitForLoad(timeout = 30000) {
        const start = Date.now();
        while (this.isLoading && Date.now() - start < timeout) {
            await new Promise(r => setTimeout(r, 100));
        }
        return this.isLoaded;
    },

    /**
     * Load Target Neraca
     */
    async loadTargetNeraca() {
        try {
            const snapshot = await this.db.collection('banksulselbar_target_neraca').get();
            this.targetNeracaData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`   📋 Target Neraca: ${this.targetNeracaData.length} records`);
        } catch (error) {
            console.warn('   Target Neraca collection empty or error:', error.message);
            this.targetNeracaData = [];
        }
    },

    /**
     * Load Target Laba Rugi
     */
    async loadTargetLabarugi() {
        try {
            const snapshot = await this.db.collection('banksulselbar_target_labarugi').get();
            this.targetLabarugiData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`   💰 Target Laba Rugi: ${this.targetLabarugiData.length} records`);
        } catch (error) {
            console.warn('   Target Laba Rugi collection empty or error:', error.message);
            this.targetLabarugiData = [];
        }
    },

    /**
     * Get target untuk periode dan cabang tertentu
     */
    getTarget(periode, kodeCabang, jenis = 'neraca') {
        const data = jenis === 'neraca' ? this.targetNeracaData : this.targetLabarugiData;
        return data.filter(item => 
            item.periode === periode && 
            item.kode_cabang === kodeCabang
        );
    },

    /**
     * Get target value untuk sandi tertentu
     */
    getTargetValue(sandi, periode, kodeCabang, jenis = 'neraca') {
        const data = this.getTarget(periode, kodeCabang, jenis);
        const item = data.find(d => d.sandi === sandi);
        return item?.total || item?.rupiah || 0;
    },

    /**
     * Get target summary untuk dashboard
     */
    getTargetSummary(tahun = 2025, kodeCabang = 'ALL') {
        const summary = {
            totalAset: { TRW1: 0, TRW2: 0, TRW3: 0, TRW4: 0 },
            kredit: { TRW1: 0, TRW2: 0, TRW3: 0, TRW4: 0 },
            dpk: { TRW1: 0, TRW2: 0, TRW3: 0, TRW4: 0 },
            giro: { TRW1: 0, TRW2: 0, TRW3: 0, TRW4: 0 },
            tabungan: { TRW1: 0, TRW2: 0, TRW3: 0, TRW4: 0 },
            deposito: { TRW1: 0, TRW2: 0, TRW3: 0, TRW4: 0 },
            liabilitas: { TRW1: 0, TRW2: 0, TRW3: 0, TRW4: 0 },
            ekuitas: { TRW1: 0, TRW2: 0, TRW3: 0, TRW4: 0 },
            labaBersih: { TRW1: 0, TRW2: 0, TRW3: 0, TRW4: 0 }
        };

        const sandiMapping = {
            totalAset: '01.00.00.00.00.00',
            kredit: '01.09.01.00.00.00',
            giro: '02.01.01.00.00.00',
            tabungan: '02.01.02.00.00.00',
            deposito: '02.01.03.00.00.00',
            liabilitas: '02.00.00.00.00.00',
            ekuitas: '03.00.00.00.00.00'
        };

        for (let trw = 1; trw <= 4; trw++) {
            const periode = `TRW${trw}_${tahun}`;
            const neracaData = this.getTarget(periode, kodeCabang, 'neraca');
            
            Object.entries(sandiMapping).forEach(([key, sandi]) => {
                const item = neracaData.find(d => d.sandi === sandi);
                summary[key][`TRW${trw}`] = item?.total || item?.rupiah || 0;
            });

            // Calculate DPK (Giro + Tabungan + Deposito)
            summary.dpk[`TRW${trw}`] = 
                summary.giro[`TRW${trw}`] + 
                summary.tabungan[`TRW${trw}`] + 
                summary.deposito[`TRW${trw}`];

            // Get Laba Bersih from labarugi
            const labarugiData = this.getTarget(periode, kodeCabang, 'labarugi');
            const labaBersihItem = labarugiData.find(d => d.sandi === '04.00.00.00.00.00');
            summary.labaBersih[`TRW${trw}`] = labaBersihItem?.total || labaBersihItem?.rupiah || 0;
        }

        return summary;
    },

    /**
     * Get available branches
     */
    getAvailableBranches() {
        return [...new Set(this.targetNeracaData.map(d => d.kode_cabang))];
    },

    /**
     * Get available periodes
     */
    getAvailablePeriodes() {
        return [...new Set(this.targetNeracaData.map(d => d.periode))];
    },

    /**
     * Format currency
     */
    formatCurrency(value) {
        if (!value || value === 0) return 'Rp 0';
        const abs = Math.abs(value);
        if (abs >= 1e12) return `Rp ${(value / 1e12).toFixed(2)} T`;
        if (abs >= 1e9) return `Rp ${(value / 1e9).toFixed(2)} M`;
        if (abs >= 1e6) return `Rp ${(value / 1e6).toFixed(2)} Jt`;
        return `Rp ${value.toLocaleString('id-ID')}`;
    }
};

// Auto-initialize after a delay to ensure Firebase is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Target Firebase Loader module loaded');
    
    // Initialize after Firebase has time to connect
    setTimeout(() => {
        TargetFirebaseLoader.init();
    }, 2000);
    
    // Retry if first attempt failed
    setTimeout(() => {
        if (!TargetFirebaseLoader.isLoaded && !TargetFirebaseLoader.isLoading) {
            console.log('🔄 Retrying target data load...');
            TargetFirebaseLoader.init();
        }
    }, 5000);
});

// Also listen for firebase connected event if available
window.addEventListener('firebaseConnected', () => {
    if (!TargetFirebaseLoader.isLoaded) {
        TargetFirebaseLoader.init();
    }
});

// Export for global access
window.TargetFirebaseLoader = TargetFirebaseLoader;
