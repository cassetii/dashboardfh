/**
 * ==========================================
 * FIREBASE CONNECTOR - BANK SULSELBAR
 * ==========================================
 * Module untuk integrasi Firebase Firestore dengan Dashboard
 * 
 * Cara penggunaan:
 * 1. Setup Firebase project di console.firebase.google.com
 * 2. Copy konfigurasi Firebase ke bagian FIREBASE_CONFIG
 * 3. Include file ini di HTML: <script src="firebase-connector.js"></script>
 * 4. Panggil FirebaseConnector.init() setelah halaman load
 */

// ==========================================
// FIREBASE CONFIGURATION - DATABASEBESAR (NALA)
// Data Bank Sulselbar disimpan dengan prefix "banksulselbar_"
// ==========================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBI5T3ZVyHXSRFikTjSlnW9P04cO1UDAwg",
    authDomain: "databasebesar.firebaseapp.com",
    projectId: "databasebesar",
    storageBucket: "databasebesar.firebasestorage.app",
    messagingSenderId: "253231829334",
    appId: "1:253231829334:web:c3233e237b231de3c546f7",
    measurementId: "G-39PNM8NVHK"
};

// ==========================================
// FIREBASE CONNECTOR CLASS
// ==========================================
class FirebaseConnectorClass {
    constructor() {
        this.db = null;
        this.auth = null;
        this.isInitialized = false;
        this.listeners = [];
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 menit cache
    }

    /**
     * Inisialisasi Firebase
     */
    async init(config = FIREBASE_CONFIG) {
        if (this.isInitialized) {
            console.log('⚠️ Firebase already initialized');
            return true;
        }

        try {
            // Check if Firebase SDK loaded
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded. Include Firebase scripts first.');
            }

            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(config);
            }

            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.isInitialized = true;

            console.log('✅ Firebase Connector initialized');
            return true;

        } catch (error) {
            console.error('❌ Firebase init error:', error);
            throw error;
        }
    }

    /**
     * Check if initialized
     */
    checkInit() {
        if (!this.isInitialized) {
            throw new Error('Firebase not initialized. Call FirebaseConnector.init() first.');
        }
    }

    // ==========================================
    // BRANCHES OPERATIONS
    // ==========================================

    /**
     * Get semua cabang
     */
    async getBranches() {
        this.checkInit();
        
        const cacheKey = 'branches_all';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const snapshot = await this.db.collection('banksulselbar_branches').get();
            const branches = {};
            
            snapshot.forEach(doc => {
                branches[doc.id] = { id: doc.id, ...doc.data() };
            });

            this.cache.set(cacheKey, branches);
            return branches;

        } catch (error) {
            console.error('Error getting branches:', error);
            throw error;
        }
    }

    /**
     * Get cabang by kode
     */
    async getBranch(kode) {
        this.checkInit();
        
        try {
            const doc = await this.db.collection('banksulselbar_branches').doc(kode).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting branch:', error);
            throw error;
        }
    }

    /**
     * Get cabang by type (konvensional/syariah)
     */
    async getBranchesByType(type) {
        this.checkInit();
        
        try {
            const snapshot = await this.db.collection('banksulselbar_branches')
                .where('type', '==', type)
                .get();
            
            const branches = [];
            snapshot.forEach(doc => {
                branches.push({ id: doc.id, ...doc.data() });
            });
            
            return branches;
        } catch (error) {
            console.error('Error getting branches by type:', error);
            throw error;
        }
    }

    // ==========================================
    // MONTHLY DATA OPERATIONS
    // ==========================================

    /**
     * Get data bulanan
     * @param {string} period - Format: "2025-01"
     */
    async getMonthlyData(period) {
        this.checkInit();
        
        const cacheKey = `monthly_${period}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const doc = await this.db.collection('banksulselbar_monthly').doc(period).get();
            
            if (doc.exists) {
                const data = { id: doc.id, ...doc.data() };
                this.cache.set(cacheKey, data);
                return data;
            }
            return null;

        } catch (error) {
            console.error('Error getting monthly data:', error);
            throw error;
        }
    }

    /**
     * Get semua data bulanan
     */
    async getAllMonthlyData() {
        this.checkInit();
        
        try {
            const snapshot = await this.db.collection('banksulselbar_monthly')
                .orderBy('metadata.month', 'asc')
                .get();
            
            const data = {};
            snapshot.forEach(doc => {
                data[doc.id] = { id: doc.id, ...doc.data() };
            });
            
            return data;
        } catch (error) {
            console.error('Error getting all monthly data:', error);
            throw error;
        }
    }

    /**
     * Get data bulanan untuk range tertentu
     */
    async getMonthlyDataRange(startPeriod, endPeriod) {
        this.checkInit();
        
        try {
            const snapshot = await this.db.collection('banksulselbar_monthly')
                .where('metadata.period', '>=', startPeriod)
                .where('metadata.period', '<=', endPeriod)
                .orderBy('metadata.period', 'asc')
                .get();
            
            const data = {};
            snapshot.forEach(doc => {
                data[doc.id] = { id: doc.id, ...doc.data() };
            });
            
            return data;
        } catch (error) {
            console.error('Error getting monthly data range:', error);
            throw error;
        }
    }

    /**
     * Get summary semua bulan
     */
    async getMonthlySummary() {
        this.checkInit();
        
        try {
            const doc = await this.db.collection('banksulselbar_summary').doc('allMonths').get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting monthly summary:', error);
            throw error;
        }
    }

    // ==========================================
    // DATA PER CABANG
    // ==========================================

    /**
     * Get data cabang untuk periode tertentu
     */
    async getBranchData(kode, period) {
        this.checkInit();
        
        try {
            const monthlyData = await this.getMonthlyData(period);
            if (monthlyData && monthlyData.neraca && monthlyData.neraca.branches) {
                return monthlyData.neraca.branches[kode] || null;
            }
            return null;
        } catch (error) {
            console.error('Error getting branch data:', error);
            throw error;
        }
    }

    /**
     * Get trend data cabang (multiple periods)
     */
    async getBranchTrend(kode, periods) {
        this.checkInit();
        
        try {
            const trend = [];
            
            for (const period of periods) {
                const monthlyData = await this.getMonthlyData(period);
                if (monthlyData && monthlyData.neraca && monthlyData.neraca.branches) {
                    const branchData = monthlyData.neraca.branches[kode];
                    if (branchData) {
                        trend.push({
                            period: period,
                            periodName: monthlyData.metadata.periodName,
                            ...branchData
                        });
                    }
                }
            }
            
            return trend;
        } catch (error) {
            console.error('Error getting branch trend:', error);
            throw error;
        }
    }

    /**
     * Compare multiple branches for a period
     */
    async compareBranches(kodeBranches, period) {
        this.checkInit();
        
        try {
            const monthlyData = await this.getMonthlyData(period);
            if (!monthlyData) return null;
            
            const comparison = {};
            for (const kode of kodeBranches) {
                const neracaData = monthlyData.neraca?.branches?.[kode];
                const labarugiData = monthlyData.labarugi?.branches?.[kode];
                
                if (neracaData) {
                    comparison[kode] = {
                        ...neracaData,
                        ...labarugiData
                    };
                }
            }
            
            return comparison;
        } catch (error) {
            console.error('Error comparing branches:', error);
            throw error;
        }
    }

    // ==========================================
    // KONSOLIDASI DATA
    // ==========================================

    /**
     * Get data konsolidasi
     */
    async getKonsolidasi(period) {
        this.checkInit();
        
        try {
            const monthlyData = await this.getMonthlyData(period);
            if (!monthlyData) return null;
            
            return {
                neraca: monthlyData.neraca?.konsolidasi || {},
                labarugi: monthlyData.labarugi?.konsolidasi || {},
                ratios: monthlyData.ratios?.konsolidasi || {},
                summary: monthlyData.summary || {}
            };
        } catch (error) {
            console.error('Error getting konsolidasi:', error);
            throw error;
        }
    }

    /**
     * Get perbandingan Konvensional vs Syariah
     */
    async getKonvenVsSyariah(period) {
        this.checkInit();
        
        try {
            const monthlyData = await this.getMonthlyData(period);
            if (!monthlyData) return null;
            
            return {
                konvensional: {
                    neraca: monthlyData.neraca?.konvensional || {},
                    labarugi: monthlyData.labarugi?.konvensional || {},
                    ratios: monthlyData.ratios?.konvensional || {}
                },
                syariah: {
                    neraca: monthlyData.neraca?.syariah || {},
                    labarugi: monthlyData.labarugi?.syariah || {},
                    ratios: monthlyData.ratios?.syariah || {}
                }
            };
        } catch (error) {
            console.error('Error getting konven vs syariah:', error);
            throw error;
        }
    }

    // ==========================================
    // WRITE OPERATIONS (Admin only)
    // ==========================================

    /**
     * Save monthly data
     */
    async saveMonthlyData(period, data) {
        this.checkInit();
        
        try {
            await this.db.collection('banksulselbar_monthly').doc(period).set(data);
            
            // Clear cache
            this.cache.delete(`monthly_${period}`);
            
            console.log(`✅ Monthly data saved: ${period}`);
            return true;
        } catch (error) {
            console.error('Error saving monthly data:', error);
            throw error;
        }
    }

    /**
     * Save branches master
     */
    async saveBranches(branches) {
        this.checkInit();
        
        try {
            const batch = this.db.batch();
            
            for (const [kode, data] of Object.entries(branches)) {
                const ref = this.db.collection('banksulselbar_branches').doc(kode);
                batch.set(ref, data);
            }
            
            await batch.commit();
            
            // Clear cache
            this.cache.delete('branches_all');
            
            console.log(`✅ Branches saved: ${Object.keys(branches).length} entries`);
            return true;
        } catch (error) {
            console.error('Error saving branches:', error);
            throw error;
        }
    }

    /**
     * Bulk import data
     */
    async bulkImport(importData) {
        this.checkInit();
        
        try {
            // Import branches
            if (importData.branches) {
                await this.saveBranches(importData.branches);
            }
            
            // Import monthly data
            if (importData.monthlyData) {
                for (const [period, data] of Object.entries(importData.monthlyData)) {
                    await this.saveMonthlyData(period, data);
                }
            }
            
            console.log('✅ Bulk import completed');
            return true;
        } catch (error) {
            console.error('Error in bulk import:', error);
            throw error;
        }
    }

    // ==========================================
    // REAL-TIME LISTENERS
    // ==========================================

    /**
     * Subscribe to monthly data changes
     */
    subscribeToMonthlyData(period, callback) {
        this.checkInit();
        
        const unsubscribe = this.db.collection('banksulselbar_monthly')
            .doc(period)
            .onSnapshot(doc => {
                if (doc.exists) {
                    callback({ id: doc.id, ...doc.data() });
                }
            }, error => {
                console.error('Subscription error:', error);
            });
        
        this.listeners.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Subscribe to all monthly data changes
     */
    subscribeToAllData(callback) {
        this.checkInit();
        
        const unsubscribe = this.db.collection('banksulselbar_monthly')
            .orderBy('metadata.month', 'asc')
            .onSnapshot(snapshot => {
                const data = {};
                snapshot.forEach(doc => {
                    data[doc.id] = { id: doc.id, ...doc.data() };
                });
                callback(data);
            }, error => {
                console.error('Subscription error:', error);
            });
        
        this.listeners.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Unsubscribe all listeners
     */
    unsubscribeAll() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }

    /**
     * Get available periods
     */
    async getAvailablePeriods() {
        this.checkInit();
        
        try {
            const snapshot = await this.db.collection('banksulselbar_monthly')
                .orderBy('metadata.period', 'desc')
                .get();
            
            const periods = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                periods.push({
                    period: doc.id,
                    periodName: data.metadata?.periodName || doc.id
                });
            });
            
            return periods;
        } catch (error) {
            console.error('Error getting periods:', error);
            throw error;
        }
    }

    /**
     * Format currency (Rupiah)
     */
    formatRupiah(value, unit = 'full') {
        if (!value || isNaN(value)) return 'Rp 0';
        
        let formattedValue = value;
        let suffix = '';
        
        switch (unit) {
            case 'triliun':
                formattedValue = value / 1e12;
                suffix = ' T';
                break;
            case 'miliar':
                formattedValue = value / 1e9;
                suffix = ' M';
                break;
            case 'juta':
                formattedValue = value / 1e6;
                suffix = ' Jt';
                break;
            case 'auto':
                if (value >= 1e12) {
                    formattedValue = value / 1e12;
                    suffix = ' T';
                } else if (value >= 1e9) {
                    formattedValue = value / 1e9;
                    suffix = ' M';
                } else if (value >= 1e6) {
                    formattedValue = value / 1e6;
                    suffix = ' Jt';
                }
                break;
        }
        
        return 'Rp ' + formattedValue.toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + suffix;
    }

    /**
     * Format percentage
     */
    formatPercent(value, decimals = 2) {
        if (!value || isNaN(value)) return '0%';
        return value.toFixed(decimals) + '%';
    }
}

// ==========================================
// EXPORT & INITIALIZE
// ==========================================

// Create global instance
const FirebaseConnector = new FirebaseConnectorClass();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseConnector;
}

// Make available globally
window.FirebaseConnector = FirebaseConnector;

console.log('🔥 Firebase Connector loaded');
