// ========================================
// DATA CABANG BANK SULSELBAR - FIREBASE VERSION
// Semua data diambil dari Firebase Firestore
// TIDAK ADA DATA HARDCODE
// ========================================

const BRANCH_DATA = {
    // Data kinerja per cabang - Akan diisi dari Firebase
    performance: {
        aset: {},
        kredit: {},
        dpk: {},
        giro: {},
        tabungan: {},
        deposito: {},
        laba: {}
    },
    
    // Mapping kode ke nama - dari Firebase atau master
    names: {},
    
    // Status loading
    isLoaded: false,
    currentPeriod: null,
    
    // Helper: Get branch name by code
    getName: function(code) {
        return this.names[code] || code;
    },
    
    // Helper: Get performance for a branch
    getPerformance: function(code, metric) {
        return this.performance[metric]?.[code] || null;
    },
    
    // Helper: Get all performance for a branch
    getAllPerformance: function(code) {
        const result = {};
        Object.keys(this.performance).forEach(metric => {
            if (this.performance[metric][code]) {
                result[metric] = this.performance[metric][code];
            }
        });
        return result;
    },
    
    // Get branch by type
    getBranchesByType: function(type) {
        return Object.entries(this.names)
            .filter(([code, data]) => {
                if (typeof data === 'object') {
                    return data.tipe === type;
                }
                // Jika hanya nama string, cek dari kode
                if (type === 'syariah') {
                    return code.startsWith('5') || code.startsWith('S');
                }
                return !code.startsWith('5') && !code.startsWith('S') && code !== '001';
            })
            .map(([code, data]) => ({
                kode: code,
                nama: typeof data === 'object' ? data.nama : data,
                tipe: typeof data === 'object' ? data.tipe : (code.startsWith('5') ? 'syariah' : 'konvensional')
            }));
    }
};

// ========================================
// BRANCH DATA LOADER FROM FIREBASE
// ========================================

const BranchDataLoader = {
    
    /**
     * Initialize dan load data cabang dari Firebase
     */
    async init(periode = null) {
        console.log('🏢 BranchDataLoader initializing...');
        
        if (typeof FirebaseDataService === 'undefined') {
            console.error('❌ FirebaseDataService not found!');
            return false;
        }
        
        await FirebaseDataService.init();
        
        // Get periode
        if (!periode) {
            const periods = await FirebaseDataService.getAvailablePeriods();
            periode = periods[0]; // Periode terbaru
        }
        
        BRANCH_DATA.currentPeriod = periode;
        
        // Load master branches
        await this.loadBranchesMaster();
        
        // Load branch performance data
        await this.loadBranchPerformance(periode);
        
        BRANCH_DATA.isLoaded = true;
        console.log('✅ BranchDataLoader ready');
        
        return true;
    },
    
    /**
     * Load master data cabang
     */
    async loadBranchesMaster() {
        // Gunakan master dari FirebaseDataService
        const master = FirebaseDataService.BRANCHES_MASTER;
        
        Object.entries(master).forEach(([code, data]) => {
            BRANCH_DATA.names[code] = {
                nama: data.nama,
                tipe: data.tipe
            };
        });
        
        console.log(`📋 Loaded ${Object.keys(BRANCH_DATA.names).length} branches master`);
    },
    
    /**
     * Load performance data untuk semua cabang
     */
    async loadBranchPerformance(periode) {
        console.log(`📊 Loading branch performance for ${periode}...`);
        
        try {
            const branchesData = await FirebaseDataService.getAllBranchesData(periode);
            
            // Reset performance data
            BRANCH_DATA.performance = {
                aset: {},
                kredit: {},
                dpk: {},
                giro: {},
                tabungan: {},
                deposito: {},
                laba: {}
            };
            
            // Convert dan populate data
            const toMiliar = (val) => parseFloat((val / 1e9).toFixed(2)); // Convert to Miliar
            
            Object.entries(branchesData).forEach(([kode, data]) => {
                // Update names jika ada
                if (data.nama && !BRANCH_DATA.names[kode]) {
                    BRANCH_DATA.names[kode] = {
                        nama: data.nama,
                        tipe: data.tipe
                    };
                }
                
                // Aset
                if (data.totalAset) {
                    BRANCH_DATA.performance.aset[kode] = {
                        value: toMiliar(data.totalAset),
                        percentage: 0, // Akan dihitung setelah semua data load
                        target: 0
                    };
                }
                
                // Kredit
                if (data.kredit) {
                    BRANCH_DATA.performance.kredit[kode] = {
                        value: toMiliar(data.kredit),
                        percentage: 0,
                        target: 0
                    };
                }
                
                // DPK
                if (data.dpk) {
                    BRANCH_DATA.performance.dpk[kode] = {
                        value: toMiliar(data.dpk),
                        percentage: 0,
                        target: 0
                    };
                }
                
                // Giro
                if (data.giro) {
                    BRANCH_DATA.performance.giro[kode] = {
                        value: toMiliar(data.giro),
                        percentage: 0,
                        target: 0
                    };
                }
                
                // Tabungan
                if (data.tabungan) {
                    BRANCH_DATA.performance.tabungan[kode] = {
                        value: toMiliar(data.tabungan),
                        percentage: 0,
                        target: 0
                    };
                }
                
                // Deposito
                if (data.deposito) {
                    BRANCH_DATA.performance.deposito[kode] = {
                        value: toMiliar(data.deposito),
                        percentage: 0,
                        target: 0
                    };
                }
            });
            
            // Calculate percentages (relative to total)
            this.calculatePercentages();
            
            console.log(`✅ Loaded performance data for ${Object.keys(branchesData).length} branches`);
            
        } catch (error) {
            console.error('Error loading branch performance:', error);
        }
    },
    
    /**
     * Calculate percentages untuk setiap metric
     */
    calculatePercentages() {
        const metrics = ['aset', 'kredit', 'dpk', 'giro', 'tabungan', 'deposito'];
        
        metrics.forEach(metric => {
            const data = BRANCH_DATA.performance[metric];
            
            // Hitung total
            let total = 0;
            Object.values(data).forEach(item => {
                total += item.value || 0;
            });
            
            // Update percentage
            if (total > 0) {
                Object.keys(data).forEach(kode => {
                    data[kode].percentage = parseFloat(((data[kode].value / total) * 100).toFixed(2));
                    // Set target sebagai 105% dari current (bisa disesuaikan)
                    data[kode].target = parseFloat((data[kode].value * 1.05).toFixed(2));
                });
            }
        });
    },
    
    /**
     * Refresh data untuk periode baru
     */
    async refreshData(periode) {
        BRANCH_DATA.currentPeriod = periode;
        await this.loadBranchPerformance(periode);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('branchDataUpdated', {
            detail: { period: periode }
        }));
    },
    
    /**
     * Get ranking cabang berdasarkan metric
     */
    getRanking(metric, limit = 10, order = 'desc') {
        const data = BRANCH_DATA.performance[metric];
        if (!data) return [];
        
        const sorted = Object.entries(data)
            .map(([kode, item]) => ({
                kode: kode,
                nama: BRANCH_DATA.getName(kode),
                value: item.value,
                percentage: item.percentage
            }))
            .sort((a, b) => order === 'desc' ? b.value - a.value : a.value - b.value);
        
        return limit ? sorted.slice(0, limit) : sorted;
    },
    
    /**
     * Get data untuk specific branch
     */
    async getBranchDetail(kode, periode = null) {
        if (!periode) periode = BRANCH_DATA.currentPeriod;
        
        // Get summary dari Firebase
        const summary = await FirebaseDataService.getSummaryData(periode, kode);
        const ratios = await FirebaseDataService.calculateRatios(periode, kode);
        
        return {
            kode: kode,
            nama: BRANCH_DATA.getName(kode),
            periode: periode,
            summary: summary,
            ratios: ratios,
            performance: BRANCH_DATA.getAllPerformance(kode)
        };
    },
    
    /**
     * Compare multiple branches
     */
    compareBranches(kodeCabangList, metric) {
        const result = [];
        
        kodeCabangList.forEach(kode => {
            const perf = BRANCH_DATA.getPerformance(kode, metric);
            if (perf) {
                result.push({
                    kode: kode,
                    nama: BRANCH_DATA.getName(kode),
                    ...perf
                });
            }
        });
        
        return result.sort((a, b) => b.value - a.value);
    }
};

// ========================================
// AUTO-INITIALIZE
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Tunggu FirebaseDataService ready
    setTimeout(async () => {
        const success = await BranchDataLoader.init();
        
        if (success) {
            console.log('🏢 Branch Data loaded from Firebase!');
            console.log('   Total branches:', Object.keys(BRANCH_DATA.names).length);
            console.log('   Period:', BRANCH_DATA.currentPeriod);
            
            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('branchDataReady'));
        }
    }, 2000); // Tunggu lebih lama untuk pastikan Firebase ready
});

// Listen untuk period change
window.addEventListener('bankDataUpdated', async (e) => {
    if (e.detail && e.detail.period) {
        await BranchDataLoader.refreshData(e.detail.period);
    }
});

// Export
window.BRANCH_DATA = BRANCH_DATA;
window.BranchDataLoader = BranchDataLoader;

console.log('📦 Branch Data Firebase Version loaded');
