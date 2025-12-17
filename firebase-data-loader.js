/**
 * ==========================================
 * FIREBASE DATA LOADER - BANK SULSELBAR
 * ==========================================
 * File ini mengintegrasikan data dari Firebase Firestore
 * ke dashboard Bank Sulselbar
 * 
 * CARA PAKAI:
 * 1. Copy file ini ke folder project
 * 2. Tambahkan di dashboard-enhanced.html sebelum </body>:
 *    <script src="firebase-data-loader.js"></script>
 * 
 * Dependencies:
 * - firebase-connector.js (harus sudah di-load)
 * - data-enhanced.js (BANK_DATA object)
 * ==========================================
 */

// ==========================================
// FIREBASE DATA LOADER
// ==========================================

const FirebaseDataLoader = {
    
    // Current period
    currentPeriod: '2025-10', // Default Oktober 2025
    availablePeriods: [],
    isLoaded: false,
    
    /**
     * Initialize loader and load data from Firebase
     */
    async init() {
        console.log('🔥 Firebase Data Loader - Initializing...');
        
        try {
            // Wait for Firebase to be ready
            if (typeof FirebaseConnector === 'undefined') {
                console.warn('⚠️ FirebaseConnector not found. Using local data.');
                return false;
            }
            
            // Initialize Firebase connection
            await FirebaseConnector.init();
            console.log('✅ Firebase connected');
            
            // Get available periods
            this.availablePeriods = await FirebaseConnector.getAvailablePeriods();
            console.log('📅 Available periods:', this.availablePeriods.map(p => p.period));
            
            // Set current period to latest
            if (this.availablePeriods.length > 0) {
                this.currentPeriod = this.availablePeriods[0].period;
            }
            
            // Load data for current period
            await this.loadPeriodData(this.currentPeriod);
            
            // Add period selector to dashboard
            this.addPeriodSelector();
            
            this.isLoaded = true;
            console.log('✅ Firebase Data Loader ready');
            
            return true;
            
        } catch (error) {
            console.error('❌ Firebase Data Loader error:', error);
            return false;
        }
    },
    
    /**
     * Load data for specific period and update BANK_DATA
     */
    async loadPeriodData(period) {
        console.log(`📊 Loading data for period: ${period}`);
        
        try {
            const monthlyData = await FirebaseConnector.getMonthlyData(period);
            
            if (!monthlyData) {
                console.warn(`⚠️ No data found for period: ${period}`);
                return false;
            }
            
            // Update BANK_DATA with Firebase data
            this.updateBankData(monthlyData);
            
            // Refresh dashboard UI
            this.refreshDashboardUI();
            
            // Show toast notification
            if (typeof showToast === 'function') {
                showToast(`Data ${monthlyData.metadata.periodName} berhasil dimuat dari Firebase`, 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('Error loading period data:', error);
            return false;
        }
    },
    
    /**
     * Update BANK_DATA object with Firebase data
     */
    updateBankData(firebaseData) {
        console.log('🔄 Updating BANK_DATA with Firebase data...');
        
        // Check if BANK_DATA exists
        if (typeof BANK_DATA === 'undefined') {
            console.error('❌ BANK_DATA not found');
            return;
        }
        
        const neraca = firebaseData.neraca || {};
        const labarugi = firebaseData.labarugi || {};
        const summary = firebaseData.summary || {};
        const ratios = firebaseData.ratios || {};
        const metadata = firebaseData.metadata || {};
        
        // ========================================
        // UPDATE METADATA
        // ========================================
        BANK_DATA.metadata.lastUpdate = metadata.period || this.currentPeriod;
        BANK_DATA.metadata.period = metadata.periodName || 'Oktober 2025';
        BANK_DATA.metadata.dataSource = 'Firebase Firestore';
        
        // ========================================
        // UPDATE NERACA DATA
        // ========================================
        
        // Total Aset (convert from Rupiah to Triliun)
        const totalAset = (neraca.konsolidasi?.total_aset || 0) / 1e12;
        if (BANK_DATA.neraca.asset) {
            BANK_DATA.neraca.asset.current = parseFloat(totalAset.toFixed(2));
        }
        
        // Kas
        const kas = (neraca.konsolidasi?.kas || 0) / 1e12;
        if (BANK_DATA.neraca.kas) {
            BANK_DATA.neraca.kas.current = parseFloat(kas.toFixed(2));
        }
        
        // Penempatan BI
        const penempatanBI = (neraca.konsolidasi?.penempatan_bi || 0) / 1e12;
        if (BANK_DATA.neraca.penempatanBI) {
            BANK_DATA.neraca.penempatanBI.current = parseFloat(penempatanBI.toFixed(2));
        }
        
        // Total Kredit
        const totalKredit = (neraca.konsolidasi?.kredit || 0) / 1e12;
        if (BANK_DATA.neraca.kredit) {
            BANK_DATA.neraca.kredit.current = parseFloat(totalKredit.toFixed(2));
        }
        
        // DPK - Total
        const totalDPK = (neraca.konsolidasi?.total_dpk || 0) / 1e12;
        if (BANK_DATA.neraca.dpkKonvensional) {
            BANK_DATA.neraca.dpkKonvensional.current = parseFloat(totalDPK.toFixed(2));
        }
        
        // Giro
        const giro = (neraca.konsolidasi?.giro || 0) / 1e12;
        if (BANK_DATA.neraca.giro) {
            BANK_DATA.neraca.giro.current = parseFloat(giro.toFixed(2));
        }
        
        // Tabungan
        const tabungan = (neraca.konsolidasi?.tabungan || 0) / 1e12;
        if (BANK_DATA.neraca.tabungan) {
            BANK_DATA.neraca.tabungan.current = parseFloat(tabungan.toFixed(2));
        }
        
        // Deposito
        const deposito = (neraca.konsolidasi?.deposito || 0) / 1e12;
        if (BANK_DATA.neraca.deposito) {
            BANK_DATA.neraca.deposito.current = parseFloat(deposito.toFixed(2));
        }
        
        // Update DPK composition
        if (BANK_DATA.neraca.dpkKonvensional?.composition) {
            BANK_DATA.neraca.dpkKonvensional.composition.giro = parseFloat(giro.toFixed(2));
            BANK_DATA.neraca.dpkKonvensional.composition.tabungan = parseFloat(tabungan.toFixed(2));
            BANK_DATA.neraca.dpkKonvensional.composition.deposito = parseFloat(deposito.toFixed(2));
        }
        
        // Aset Tetap
        const asetTetap = (neraca.konsolidasi?.aset_tetap || 0) / 1e12;
        if (BANK_DATA.neraca.asetTetap) {
            BANK_DATA.neraca.asetTetap.current = parseFloat(asetTetap.toFixed(2));
        }
        
        // Surat Berharga
        const suratBerharga = (neraca.konsolidasi?.surat_berharga || 0) / 1e12;
        if (BANK_DATA.neraca.suratBerharga) {
            BANK_DATA.neraca.suratBerharga.current = parseFloat(suratBerharga.toFixed(2));
        }
        
        // ========================================
        // UPDATE RATIOS
        // ========================================
        
        // LDR
        const ldr = ratios.konsolidasi?.ldr || summary.ldr || 0;
        if (BANK_DATA.ratios.LDR) {
            BANK_DATA.ratios.LDR.current = parseFloat(ldr.toFixed(2));
        }
        
        // ROA
        const roa = ratios.konsolidasi?.roa || 0;
        if (BANK_DATA.ratios.ROA) {
            BANK_DATA.ratios.ROA.current = parseFloat(roa.toFixed(2));
        }
        
        console.log('✅ BANK_DATA updated from Firebase');
        console.log('   Total Aset:', totalAset.toFixed(2), 'T');
        console.log('   Total DPK:', totalDPK.toFixed(2), 'T');
        console.log('   Total Kredit:', totalKredit.toFixed(2), 'T');
        console.log('   LDR:', ldr.toFixed(2), '%');
    },
    
    /**
     * Refresh dashboard UI components
     */
    refreshDashboardUI() {
        console.log('🔄 Refreshing dashboard UI...');
        
        // Call existing dashboard functions if available
        if (typeof updateKPICards === 'function') {
            updateKPICards();
        }
        
        if (typeof renderNeracaSection === 'function') {
            renderNeracaSection();
        }
        
        if (typeof renderRatioCards === 'function') {
            renderRatioCards();
        }
        
        if (typeof renderCharts === 'function') {
            renderCharts();
        }
        
        // Update individual elements directly
        this.updateDashboardElements();
    },
    
    /**
     * Update specific dashboard elements
     */
    updateDashboardElements() {
        // Update Total Aset card
        const asetElement = document.querySelector('[data-metric="asset"] .metric-value') ||
                          document.querySelector('.total-aset-value') ||
                          document.getElementById('totalAset');
        if (asetElement && BANK_DATA.neraca.asset) {
            asetElement.textContent = BANK_DATA.neraca.asset.current.toFixed(2) + ' T';
        }
        
        // Update DPK card
        const dpkElement = document.querySelector('[data-metric="dpk"] .metric-value') ||
                          document.querySelector('.total-dpk-value') ||
                          document.getElementById('totalDPK');
        if (dpkElement && BANK_DATA.neraca.dpkKonvensional) {
            dpkElement.textContent = BANK_DATA.neraca.dpkKonvensional.current.toFixed(2) + ' T';
        }
        
        // Update Kredit card
        const kreditElement = document.querySelector('[data-metric="kredit"] .metric-value') ||
                             document.querySelector('.total-kredit-value') ||
                             document.getElementById('totalKredit');
        if (kreditElement && BANK_DATA.neraca.kredit) {
            kreditElement.textContent = BANK_DATA.neraca.kredit.current.toFixed(2) + ' T';
        }
        
        // Update LDR
        const ldrElement = document.querySelector('[data-ratio="LDR"] .ratio-value') ||
                          document.getElementById('ldrValue');
        if (ldrElement && BANK_DATA.ratios.LDR) {
            ldrElement.textContent = BANK_DATA.ratios.LDR.current.toFixed(2) + '%';
        }
        
        // Update period indicator
        const periodElement = document.querySelector('.current-period') ||
                             document.getElementById('currentPeriod');
        if (periodElement) {
            periodElement.textContent = BANK_DATA.metadata.period;
        }
        
        // Update last update timestamp
        const timestampElement = document.querySelector('.last-update') ||
                                document.getElementById('lastUpdate');
        if (timestampElement) {
            timestampElement.textContent = 'Data dari Firebase: ' + BANK_DATA.metadata.period;
        }
    },
    
    /**
     * Add period selector dropdown to dashboard
     */
    addPeriodSelector() {
        // Find header or filter area
        const filterArea = document.querySelector('.filters-section') ||
                          document.querySelector('.header-actions') ||
                          document.querySelector('.dashboard-header');
        
        if (!filterArea || this.availablePeriods.length === 0) return;
        
        // Check if selector already exists
        if (document.getElementById('firebasePeriodSelector')) return;
        
        // Create selector
        const selectorHTML = `
            <div class="firebase-period-selector" style="display: flex; align-items: center; gap: 10px; margin-left: 15px;">
                <label style="font-size: 14px; color: #666;">
                    <i class="fas fa-database" style="color: #f59e0b; margin-right: 5px;"></i>
                    Firebase:
                </label>
                <select id="firebasePeriodSelector" 
                        onchange="FirebaseDataLoader.onPeriodChange(this.value)"
                        style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; cursor: pointer;">
                    ${this.availablePeriods.map(p => 
                        `<option value="${p.period}" ${p.period === this.currentPeriod ? 'selected' : ''}>
                            ${p.periodName}
                        </option>`
                    ).join('')}
                </select>
                <span class="firebase-status" style="font-size: 12px; color: #10b981;">
                    <i class="fas fa-check-circle"></i> Connected
                </span>
            </div>
        `;
        
        // Insert selector
        const wrapper = document.createElement('div');
        wrapper.innerHTML = selectorHTML;
        filterArea.appendChild(wrapper.firstElementChild);
        
        console.log('✅ Period selector added to dashboard');
    },
    
    /**
     * Handle period change
     */
    async onPeriodChange(period) {
        console.log('📅 Period changed to:', period);
        this.currentPeriod = period;
        
        // Show loading indicator
        if (typeof showLoadingScreen === 'function') {
            showLoadingScreen();
        }
        
        await this.loadPeriodData(period);
        
        // Hide loading
        if (typeof hideLoadingScreen === 'function') {
            hideLoadingScreen();
        }
    },
    
    /**
     * Load historical data for charts
     */
    async loadHistoricalData() {
        console.log('📈 Loading historical data for charts...');
        
        try {
            const allData = await FirebaseConnector.getAllMonthlyData();
            
            // Convert to chart format
            const periods = Object.keys(allData).sort();
            
            const chartData = {
                labels: [],
                aset: [],
                dpk: [],
                kredit: [],
                ldr: []
            };
            
            periods.forEach(period => {
                const data = allData[period];
                const neraca = data.neraca?.konsolidasi || {};
                const ratios = data.ratios?.konsolidasi || {};
                
                chartData.labels.push(data.metadata?.periodName || period);
                chartData.aset.push((neraca.total_aset || 0) / 1e12);
                chartData.dpk.push((neraca.total_dpk || 0) / 1e12);
                chartData.kredit.push((neraca.kredit || 0) / 1e12);
                chartData.ldr.push(ratios.ldr || 0);
            });
            
            // Update BANK_DATA historical arrays
            if (BANK_DATA.neraca.asset) {
                BANK_DATA.neraca.asset.historical = chartData.labels.map((label, i) => ({
                    period: label,
                    value: chartData.aset[i]
                }));
            }
            
            if (BANK_DATA.neraca.dpkKonvensional) {
                BANK_DATA.neraca.dpkKonvensional.historical = chartData.labels.map((label, i) => ({
                    period: label,
                    value: chartData.dpk[i]
                }));
            }
            
            if (BANK_DATA.neraca.kredit) {
                BANK_DATA.neraca.kredit.historical = chartData.labels.map((label, i) => ({
                    period: label,
                    value: chartData.kredit[i]
                }));
            }
            
            if (BANK_DATA.ratios.LDR) {
                BANK_DATA.ratios.LDR.historical = chartData.labels.map((label, i) => ({
                    period: label,
                    value: chartData.ldr[i]
                }));
                
                BANK_DATA.ratios.LDR.monthlyData = chartData.labels.map((label, i) => ({
                    month: label.split(' ')[0], // Get month name
                    value: chartData.ldr[i],
                    target: BANK_DATA.ratios.LDR.target
                }));
            }
            
            console.log('✅ Historical data loaded');
            return chartData;
            
        } catch (error) {
            console.error('Error loading historical data:', error);
            return null;
        }
    },
    
    /**
     * Get branch data for comparison
     */
    async getBranchComparison(branchCodes) {
        try {
            return await FirebaseConnector.compareBranches(branchCodes, this.currentPeriod);
        } catch (error) {
            console.error('Error getting branch comparison:', error);
            return null;
        }
    }
};

// ==========================================
// AUTO-INITIALIZE ON PAGE LOAD
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for other scripts to load
    setTimeout(async () => {
        const success = await FirebaseDataLoader.init();
        
        if (success) {
            // Load historical data for charts
            await FirebaseDataLoader.loadHistoricalData();
            
            // Refresh UI again with historical data
            FirebaseDataLoader.refreshDashboardUI();
            
            console.log('🎉 Dashboard fully loaded with Firebase data!');
        }
    }, 1500);
});

// Export for global access
window.FirebaseDataLoader = FirebaseDataLoader;

console.log('📦 Firebase Data Loader script loaded');
