// ========================================
// FIREBASE DATA MANAGER
// Bank Sulselbar Dashboard
// Real-time data sync dengan Firebase
// ========================================

const FirebaseDataManager = {
    // Reference ke database
    db: null,
    
    // Cache data lokal
    cache: {
        konsolidasi: null,
        konvensional: null,
        syariah: null,
        branches: {},
        ratios: null
    },
    
    // Listeners
    listeners: [],
    
    // Initialize
    init: function() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK not loaded!');
            return false;
        }
        
        this.db = firebase.database();
        console.log('✅ FirebaseDataManager initialized');
        
        // Setup listeners
        this.setupListeners();
        
        return true;
    },
    
    // Setup realtime listeners
    setupListeners: function() {
        // Listen to konsolidasi data
        this.db.ref('dashboard/konsolidasi').on('value', (snapshot) => {
            this.cache.konsolidasi = snapshot.val();
            console.log('📊 Konsolidasi data updated');
            this.notifyListeners('konsolidasi', this.cache.konsolidasi);
        });
        
        // Listen to branches
        this.db.ref('dashboard/branches').on('value', (snapshot) => {
            this.cache.branches = snapshot.val() || {};
            console.log('🏢 Branches data updated');
            this.notifyListeners('branches', this.cache.branches);
        });
        
        // Listen to ratios
        this.db.ref('dashboard/ratios').on('value', (snapshot) => {
            this.cache.ratios = snapshot.val();
            console.log('📈 Ratios data updated');
            this.notifyListeners('ratios', this.cache.ratios);
        });
    },
    
    // Add listener
    addListener: function(callback) {
        this.listeners.push(callback);
    },
    
    // Notify all listeners
    notifyListeners: function(type, data) {
        this.listeners.forEach(cb => cb(type, data));
    },
    
    // Get data untuk business line tertentu
    getBusinessLineData: function(businessLine) {
        return new Promise((resolve, reject) => {
            const ref = this.db.ref(`dashboard/${businessLine}`);
            ref.once('value')
                .then(snapshot => {
                    const data = snapshot.val();
                    resolve(data);
                })
                .catch(reject);
        });
    },
    
    // Get data cabang
    getBranchData: function(branchCode) {
        return new Promise((resolve, reject) => {
            const ref = this.db.ref(`dashboard/branches/${branchCode}`);
            ref.once('value')
                .then(snapshot => {
                    const data = snapshot.val();
                    resolve(data);
                })
                .catch(reject);
        });
    },
    
    // Get all branches
    getAllBranches: function() {
        return new Promise((resolve, reject) => {
            this.db.ref('dashboard/branches').once('value')
                .then(snapshot => resolve(snapshot.val() || {}))
                .catch(reject);
        });
    },
    
    // Get ratios
    getRatios: function() {
        return new Promise((resolve, reject) => {
            this.db.ref('dashboard/ratios').once('value')
                .then(snapshot => resolve(snapshot.val()))
                .catch(reject);
        });
    },
    
    // ==========================================
    // INITIAL DATA UPLOAD (Run once to populate)
    // ==========================================
    uploadInitialData: function() {
        const initialData = {
            // Konsolidasi (Total Bank)
            konsolidasi: {
                periode: 'Oktober 2025',
                aset: { value: 34810, unit: 'M', change: 0.7, changeText: '+0.7% MoM' },
                dpk: { value: 24860, unit: 'M', change: 0.8, changeText: '+0.8% MoM' },
                kredit: { value: 23000, unit: 'M', change: 0.1, changeText: '+0.1% MoM' },
                laba: { value: 904.7, unit: 'M', change: 14.0, changeText: '+14.0% MoM' },
                pendapatan: { value: 2093.88, unit: 'M', change: 11.2, changeText: '+11.2% MoM' },
                biaya: { value: 864.56, unit: 'M', change: 11.1, changeText: '+11.1% MoM' }
            },
            
            // Konvensional
            konvensional: {
                periode: 'Oktober 2025',
                aset: { value: 31640, unit: 'M', change: 0.5, changeText: '+0.5% MoM' },
                dpk: { value: 23100, unit: 'M', change: 0.6, changeText: '+0.6% MoM' },
                kredit: { value: 21830, unit: 'M', change: 0.2, changeText: '+0.2% MoM' },
                laba: { value: 814.13, unit: 'M', change: 12.5, changeText: '+12.5% MoM' },
                pendapatan: { value: 2093.88, unit: 'M', change: 11.2, changeText: '+11.2% MoM' },
                biaya: { value: 864.56, unit: 'M', change: 11.1, changeText: '+11.1% MoM' }
            },
            
            // Syariah
            syariah: {
                periode: 'Oktober 2025',
                aset: { value: 3170, unit: 'M', change: 1.2, changeText: '+1.2% MoM' },
                dpk: { value: 1760, unit: 'M', change: 1.5, changeText: '+1.5% MoM' },
                kredit: { value: 1160, unit: 'M', change: 0.8, changeText: '+0.8% MoM' },
                laba: { value: 90.57, unit: 'M', change: 18.2, changeText: '+18.2% MoM' },
                pendapatan: { value: 139.0, unit: 'M', change: 15.0, changeText: '+15.0% MoM' },
                biaya: { value: 21.71, unit: 'M', change: 8.5, changeText: '+8.5% MoM' }
            },
            
            // Ratios
            ratios: {
                CAR: { value: 28.35, status: 'Sangat Baik', threshold: 12, color: 'green' },
                NPL: { value: 3.24, status: 'Baik', threshold: 5, color: 'yellow' },
                ROA: { value: 2.57, status: 'Sangat Baik', threshold: 1.5, color: 'green' },
                LDR: { value: 92.50, status: 'Perhatian', threshold: 92, color: 'orange' },
                NIM: { value: 3.89, status: 'Baik', threshold: 3, color: 'green' },
                ROE: { value: 36.68, status: 'Sangat Baik', threshold: 15, color: 'green' },
                CASA: { value: 59.18, status: 'Baik', threshold: 50, color: 'green' }
            },
            
            // Branches
            branches: {
                '150': { name: 'Cabang Jakarta', aset: 7631.06, kredit: 1128.89, dpk: 7325.85, giro: 6024.19, tabungan: 226.57, deposito: 1075.09 },
                '130': { name: 'Cab. Utama Makassar', aset: 4937.71, kredit: 4059.08, dpk: 3939.28, giro: 1441.57, tabungan: 1218.47, deposito: 1279.24 },
                'S01': { name: 'Syariah Makassar', aset: 2848.81, kredit: 1020.76, dpk: 1607.01, giro: 525.46, tabungan: 492.62, deposito: 588.93 },
                '71': { name: 'Cab. Utama Mamuju', aset: 1032.20, kredit: 834.03, dpk: 792.10, giro: 238.22, tabungan: 254.34, deposito: 299.54 },
                '80': { name: 'Cab. Utama Bone', aset: 1008.70, kredit: 786.96, dpk: 780.04, giro: 191.70, tabungan: 291.42, deposito: 296.92 },
                '90': { name: 'Cabang Palopo', aset: 846.05, kredit: 696.68, dpk: 679.63, giro: 133.53, tabungan: 241.14, deposito: 304.96 },
                '92': { name: 'Cabang Belopa', aset: 846.63, kredit: 696.51, dpk: 576.73, giro: 99.64, tabungan: 212.54, deposito: 264.55 },
                '70': { name: 'Cabang Polman', aset: 869.40, kredit: 739.87, dpk: 686.09, giro: 189.36, tabungan: 183.08, deposito: 313.65 },
                '100': { name: 'Cabang Sengkang', aset: 804.42, kredit: 629.96, dpk: 655.92, giro: 120.49, tabungan: 230.63, deposito: 304.80 },
                '20': { name: 'Cabang Jeneponto', aset: 802.31, kredit: 584.05, dpk: 568.08, giro: 112.91, tabungan: 230.82, deposito: 224.35 },
                '93': { name: 'Cabang Malili', aset: 792.07, kredit: 625.10, dpk: 576.37, giro: 107.23, tabungan: 196.66, deposito: 272.48 },
                '40': { name: 'Cabang Bulukumba', aset: 790.28, kredit: 608.35, dpk: 554.57, giro: 94.16, tabungan: 188.75, deposito: 271.66 },
                '21': { name: 'Cabang Takalar', aset: 783.09, kredit: 535.33, dpk: 608.53, giro: 88.11, tabungan: 259.48, deposito: 260.94 },
                '91': { name: 'Cabang Masamba', aset: 781.95, kredit: 656.86, dpk: 582.47, giro: 104.14, tabungan: 189.32, deposito: 289.01 },
                '120': { name: 'Cabang Sidrap', aset: 768.60, kredit: 568.09, dpk: 585.77, giro: 120.52, tabungan: 196.96, deposito: 268.29 },
                '140': { name: 'Cabang Gowa', aset: 764.68, kredit: 529.43, dpk: 566.37, giro: 77.89, tabungan: 258.81, deposito: 229.67 },
                '10': { name: 'Cabang Maros', aset: 755.75, kredit: 599.01, dpk: 577.86, giro: 120.13, tabungan: 188.18, deposito: 269.55 },
                '50': { name: 'Cabang Pinrang', aset: 722.36, kredit: 607.19, dpk: 574.81, giro: 134.23, tabungan: 169.99, deposito: 270.59 },
                '11': { name: 'Cabang Pangkep', aset: 681.12, kredit: 523.35, dpk: 505.17, giro: 95.36, tabungan: 169.09, deposito: 240.72 },
                '74': { name: 'Cabang Mamasa', aset: 622.05, kredit: 522.02, dpk: 477.91, giro: 63.93, tabungan: 176.69, deposito: 237.29 },
                '60': { name: 'Cabang Sinjai', aset: 577.24, kredit: 419.90, dpk: 429.50, giro: 62.52, tabungan: 159.71, deposito: 207.27 },
                '30': { name: 'Cabang Parepare', aset: 571.57, kredit: 467.37, dpk: 429.73, giro: 83.90, tabungan: 134.21, deposito: 211.62 },
                '31': { name: 'Cabang Barru', aset: 557.56, kredit: 433.35, dpk: 423.16, giro: 65.91, tabungan: 145.72, deposito: 211.53 },
                '101': { name: 'Cabang Soppeng', aset: 555.20, kredit: 436.64, dpk: 412.07, giro: 56.85, tabungan: 144.47, deposito: 210.75 },
                '75': { name: 'Cabang Pasangkayu', aset: 550.25, kredit: 461.80, dpk: 413.68, giro: 94.18, tabungan: 131.69, deposito: 187.81 },
                '41': { name: 'Cabang Bantaeng', aset: 536.93, kredit: 372.94, dpk: 406.48, giro: 51.64, tabungan: 154.51, deposito: 200.33 },
                '72': { name: 'Cabang Majene', aset: 529.17, kredit: 447.08, dpk: 427.33, giro: 95.45, tabungan: 130.50, deposito: 201.38 },
                '110': { name: 'Cabang Makale', aset: 516.88, kredit: 423.97, dpk: 404.37, giro: 63.67, tabungan: 139.74, deposito: 200.96 },
                '111': { name: 'Cabang Rantepao', aset: 489.90, kredit: 356.87, dpk: 403.90, giro: 54.49, tabungan: 142.79, deposito: 206.62 },
                '121': { name: 'Cabang Enrekang', aset: 477.65, kredit: 391.01, dpk: 369.74, giro: 53.62, tabungan: 125.79, deposito: 190.33 },
                'S04': { name: 'Syariah Mamuju', aset: 372.79, kredit: 84.36, dpk: 173.77, giro: 45.24, tabungan: 30.31, deposito: 98.22 },
                'S03': { name: 'Syariah Maros', aset: 345.99, kredit: 78.68, dpk: 165.51, giro: 21.45, tabungan: 12.70, deposito: 131.36 },
                '77': { name: 'Cabang Topoyo', aset: 337.07, kredit: 281.81, dpk: 258.92, giro: 53.70, tabungan: 77.89, deposito: 127.33 },
                'S02': { name: 'Syariah Sengkang', aset: 335.26, kredit: 54.50, dpk: 118.24, giro: 20.65, tabungan: 19.68, deposito: 77.91 },
                '42': { name: 'Cabang Selayar', aset: 308.70, kredit: 198.55, dpk: 233.42, giro: 32.91, tabungan: 82.04, deposito: 118.47 }
            }
        };
        
        // Upload to Firebase
        return this.db.ref('dashboard').set(initialData)
            .then(() => {
                console.log('✅ Initial data uploaded to Firebase!');
                return true;
            })
            .catch(err => {
                console.error('❌ Error uploading data:', err);
                return false;
            });
    }
};

// UI Update Functions
const DashboardUI = {
    // Update stat cards berdasarkan data
    updateStatCards: function(data) {
        if (!data) return;
        
        // Format helper
        const formatValue = (val, unit) => {
            if (val >= 1000) {
                return 'Rp ' + (val/1000).toFixed(2) + ' T';
            }
            return 'Rp ' + val.toLocaleString('id-ID') + ' ' + (unit || 'M');
        };
        
        // Update each card
        const metrics = ['aset', 'dpk', 'kredit', 'laba', 'pendapatan', 'biaya'];
        const cardMapping = {
            'aset': 'asset',
            'dpk': 'dpk', 
            'kredit': 'kredit',
            'laba': 'laba',
            'pendapatan': 'pendapatan',
            'biaya': 'biaya'
        };
        
        metrics.forEach(metric => {
            if (data[metric]) {
                const cardMetric = cardMapping[metric];
                const card = document.querySelector(`.stat-card[data-metric="${cardMetric}"]`);
                
                if (card) {
                    const valueEl = card.querySelector('.stat-value');
                    const changeEl = card.querySelector('.stat-change span');
                    
                    if (valueEl) {
                        valueEl.textContent = formatValue(data[metric].value, data[metric].unit);
                    }
                    if (changeEl && data[metric].changeText) {
                        changeEl.textContent = data[metric].changeText;
                    }
                }
            }
        });
        
        console.log('📊 UI updated with new data');
    },
    
    // Update untuk branch specific
    updateBranchCards: function(branchData) {
        if (!branchData) return;
        
        const formatValue = (val) => {
            if (val >= 1000) {
                return 'Rp ' + (val/1000).toFixed(2) + ' T';
            }
            return 'Rp ' + val.toLocaleString('id-ID', {maximumFractionDigits: 2}) + ' M';
        };
        
        // Map branch data ke cards
        const mapping = {
            'asset': 'aset',
            'dpk': 'dpk',
            'kredit': 'kredit',
            'laba': 'giro',        // Branch level: show giro
            'pendapatan': 'tabungan',  // Branch level: show tabungan
            'biaya': 'deposito'    // Branch level: show deposito
        };
        
        Object.keys(mapping).forEach(cardMetric => {
            const dataKey = mapping[cardMetric];
            if (branchData[dataKey] !== undefined) {
                const card = document.querySelector(`.stat-card[data-metric="${cardMetric}"]`);
                if (card) {
                    const valueEl = card.querySelector('.stat-value');
                    if (valueEl) {
                        valueEl.textContent = formatValue(branchData[dataKey]);
                    }
                    
                    // Update label for branch view
                    if (['laba', 'pendapatan', 'biaya'].includes(cardMetric)) {
                        const labelEl = card.querySelector('.stat-label');
                        if (labelEl) {
                            const labels = { 'laba': 'Giro', 'pendapatan': 'Tabungan', 'biaya': 'Deposito' };
                            labelEl.textContent = labels[cardMetric];
                        }
                    }
                }
            }
        });
        
        console.log('🏢 Branch UI updated:', branchData.name);
    },
    
    // Reset labels ke default
    resetLabels: function() {
        const defaults = {
            'laba': 'Laba Bersih YTD',
            'pendapatan': 'Pendapatan Bunga YTD',
            'biaya': 'Beban Bunga YTD'
        };
        
        Object.keys(defaults).forEach(metric => {
            const label = document.querySelector(`.stat-card[data-metric="${metric}"] .stat-label`);
            if (label) label.textContent = defaults[metric];
        });
    },
    
    // Update KPI cards
    updateKPICards: function(ratios) {
        if (!ratios) return;
        
        Object.keys(ratios).forEach(ratio => {
            const data = ratios[ratio];
            const card = document.querySelector(`.kpi-card[data-ratio="${ratio}"]`);
            
            if (card) {
                const valueEl = card.querySelector('.kpi-value');
                const statusEl = card.querySelector('.kpi-status');
                
                if (valueEl) valueEl.textContent = data.value.toFixed(2) + '%';
                if (statusEl) statusEl.textContent = data.status;
            }
        });
    }
};

// Export
window.FirebaseDataManager = FirebaseDataManager;
window.DashboardUI = DashboardUI;

console.log('✅ Firebase Data Manager loaded');
