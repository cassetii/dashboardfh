// ========================================
// FINANCIAL RATIO HANDLER
// Standar Regulator (OJK) vs Internal Bank (Risk Appetite)
// ========================================

const FinancialRatioHandler = {
    
    // Current standard: 'regulator' or 'internal'
    currentStandard: 'regulator',
    
    // ========================================
    // THRESHOLD DEFINITIONS
    // ========================================
    thresholds: {
        regulator: {
            CAR: { min: 12, target: 14, label: '> 12%', direction: 'higher', unit: '%' },
            ROA: { min: 1.25, target: 1.5, label: '> 1.25%', direction: 'higher', unit: '%' },
            ROE: { min: 10, target: 12, label: '> 10%', direction: 'higher', unit: '%' },
            NIM: { min: 3.5, target: 4, label: '> 3.5%', direction: 'higher', unit: '%' },
            BOPO: { max: 85, target: 80, label: '< 85%', direction: 'lower', unit: '%' },
            LDR: { min: 78, max: 92, target: 85, label: '78-92%', direction: 'range', unit: '%' },
            NPL: { max: 5, target: 3, label: '< 5%', direction: 'lower', unit: '%' },
            NPLNet: { max: 5, target: 2, label: '< 5%', direction: 'lower', unit: '%' },
            LCR: { min: 100, target: 120, label: '> 100%', direction: 'higher', unit: '%' },
            NSFR: { min: 100, target: 110, label: '> 100%', direction: 'higher', unit: '%' },
            CASA: { min: 40, target: 50, label: '> 40%', direction: 'higher', unit: '%' }
        },
        internal: {
            // Bank's internal Risk Appetite - biasanya lebih ketat
            CAR: { min: 15, target: 18, label: '> 15%', direction: 'higher', unit: '%' },
            ROA: { min: 2.0, target: 2.5, label: '> 2.0%', direction: 'higher', unit: '%' },
            ROE: { min: 12, target: 15, label: '> 12%', direction: 'higher', unit: '%' },
            NIM: { min: 4.5, target: 5, label: '> 4.5%', direction: 'higher', unit: '%' },
            BOPO: { max: 75, target: 70, label: '< 75%', direction: 'lower', unit: '%' },
            LDR: { min: 80, max: 90, target: 85, label: '80-90%', direction: 'range', unit: '%' },
            NPL: { max: 3, target: 2, label: '< 3%', direction: 'lower', unit: '%' },
            NPLNet: { max: 2, target: 1, label: '< 2%', direction: 'lower', unit: '%' },
            LCR: { min: 120, target: 150, label: '> 120%', direction: 'higher', unit: '%' },
            NSFR: { min: 110, target: 130, label: '> 110%', direction: 'higher', unit: '%' },
            CASA: { min: 50, target: 55, label: '> 50%', direction: 'higher', unit: '%' }
        }
    },
    
    // ========================================
    // CURRENT RATIO VALUES (from Firebase or calculated)
    // ========================================
    ratioValues: {
        CAR: 28.35,
        ROA: 2.34,
        ROE: 15.67,
        NIM: 5.82,
        BOPO: 75.73,
        LDR: 89.45,
        NPL: 3.24,
        NPLNet: 1.85,
        LCR: 145.32,
        NSFR: 125.67,
        CASA: 48.25
    },
    
    // ========================================
    // SWITCH STANDARD
    // ========================================
    switchStandard(standard) {
        this.currentStandard = standard;
        console.log(`📊 Switching ratio standard to: ${standard}`);
        
        // Update button states
        const btnRegulator = document.getElementById('btnRegulator');
        const btnInternal = document.getElementById('btnInternal');
        const infoEl = document.getElementById('ratioStandardInfo');
        
        if (btnRegulator && btnInternal) {
            if (standard === 'regulator') {
                btnRegulator.style.background = '#1e3a5f';
                btnRegulator.style.color = 'white';
                btnInternal.style.background = 'transparent';
                btnInternal.style.color = '#1e3a5f';
                if (infoEl) infoEl.innerHTML = '<i class="fas fa-info-circle"></i> Menggunakan threshold OJK';
            } else {
                btnInternal.style.background = '#1e3a5f';
                btnInternal.style.color = 'white';
                btnRegulator.style.background = 'transparent';
                btnRegulator.style.color = '#1e3a5f';
                if (infoEl) infoEl.innerHTML = '<i class="fas fa-info-circle"></i> Menggunakan Risk Appetite Bank';
            }
        }
        
        // Refresh all indicator cards
        this.refreshAllIndicators();
    },
    
    // ========================================
    // EVALUATE RATIO STATUS
    // ========================================
    evaluateStatus(ratioKey, value) {
        const threshold = this.thresholds[this.currentStandard][ratioKey];
        if (!threshold) return { status: 'safe', text: 'N/A' };
        
        if (threshold.direction === 'higher') {
            if (value >= threshold.target) return { status: 'safe', text: 'Sangat Baik' };
            if (value >= threshold.min) return { status: 'good', text: 'Baik' };
            return { status: 'danger', text: 'Di Bawah Target' };
        }
        
        if (threshold.direction === 'lower') {
            if (value <= threshold.target) return { status: 'safe', text: 'Sangat Baik' };
            if (value <= threshold.max) return { status: 'warning', text: 'Perhatian' };
            return { status: 'danger', text: 'Melebihi Batas' };
        }
        
        if (threshold.direction === 'range') {
            if (value >= threshold.min && value <= threshold.max) {
                if (Math.abs(value - threshold.target) <= 3) return { status: 'safe', text: 'Optimal' };
                return { status: 'good', text: 'Dalam Range' };
            }
            if (value < threshold.min) return { status: 'warning', text: 'Di Bawah Range' };
            return { status: 'warning', text: 'Mendekati Batas Atas' };
        }
        
        return { status: 'safe', text: 'N/A' };
    },
    
    // ========================================
    // REFRESH ALL INDICATORS
    // ========================================
    refreshAllIndicators() {
        const ratios = ['CAR', 'ROA', 'ROE', 'NIM', 'BOPO', 'LDR', 'NPL'];
        
        ratios.forEach(ratio => {
            this.updateIndicatorCard(ratio);
        });
        
        console.log('✅ All ratio indicators refreshed');
    },
    
    // ========================================
    // UPDATE INDICATOR CARD
    // ========================================
    updateIndicatorCard(ratioKey) {
        const value = this.ratioValues[ratioKey];
        const threshold = this.thresholds[this.currentStandard][ratioKey];
        const evaluation = this.evaluateStatus(ratioKey, value);
        
        // Find card by data-ratio attribute
        const card = document.querySelector(`[data-ratio="${ratioKey.toLowerCase()}"]`);
        if (!card) return;
        
        // Update card class
        card.className = `indicator-card ${evaluation.status} clickable`;
        
        // Update value
        const valueEl = card.querySelector('.value');
        if (valueEl) valueEl.textContent = value.toFixed(2);
        
        // Update status
        const statusEl = card.querySelector('.indicator-status');
        if (statusEl) {
            statusEl.className = `indicator-status ${evaluation.status}`;
            const statusIcon = evaluation.status === 'safe' ? 'check-circle' : 
                              evaluation.status === 'warning' ? 'exclamation-triangle' : 'times-circle';
            statusEl.innerHTML = `
                <span class="status-icon"><i class="fas fa-${statusIcon}"></i></span>
                <span class="status-text">${evaluation.text}</span>
            `;
        }
        
        // Update target
        const targetEl = card.querySelector('.indicator-target');
        if (targetEl && threshold) {
            targetEl.innerHTML = `Target: <span>${threshold.label}</span>`;
        }
    },
    
    // ========================================
    // UPDATE RATIO VALUES FROM FIREBASE
    // ========================================
    updateFromFirebase() {
        const data = window.DashboardFirebase?.getData?.();
        if (!data) return;
        
        const filters = window.DashboardFirebase?.getFilters?.() || {};
        const periode = filters.periode || '2025-10';
        const kodeCabang = 'ALL';
        
        const neraca = data.neraca || [];
        const labarugi = data.labarugi || [];
        
        // Helper function
        const getValue = (collection, sandi) => {
            const items = collection === 'neraca' ? neraca : labarugi;
            const item = items.find(d => 
                d.kode_cabang === kodeCabang && 
                d.periode === periode && 
                d.sandi === sandi
            );
            return item?.total || 0;
        };
        
        // Calculate ratios from Firebase data
        // Total Asset
        const totalAset = getValue('neraca', '01.00.00.00.00.00');
        // Total Kredit
        const totalKredit = getValue('neraca', '01.09.00.00.00.00');
        // DPK
        const totalDPK = getValue('neraca', '02.01.00.00.00.00') + 
                        getValue('neraca', '02.02.00.00.00.00') + 
                        getValue('neraca', '02.03.00.00.00.00');
        // Modal
        const modal = getValue('neraca', '03.00.00.00.00.00');
        // ATMR (simplified - use modal * 3.5 as proxy if not available)
        const atmr = modal > 0 ? modal * 3.5 : totalAset * 0.8;
        
        // Laba
        const labaBersih = getValue('neraca', '03.05.02.01.00.00') - 
                          Math.abs(getValue('neraca', '03.05.02.02.00.00'));
        
        // Pendapatan & Beban Bunga
        const pendapatanBunga = getValue('labarugi', '04.11.00.00.00.00');
        const bebanBunga = Math.abs(getValue('labarugi', '05.11.00.00.00.00'));
        
        // NPL (Kredit bermasalah)
        const kreditBermasalah = getValue('neraca', '01.09.00.01.00.00') || totalKredit * 0.0324;
        
        // Calculate ratios
        if (modal > 0 && atmr > 0) {
            this.ratioValues.CAR = (modal / atmr) * 100;
        }
        
        if (totalAset > 0) {
            this.ratioValues.ROA = (labaBersih / totalAset) * 100;
        }
        
        if (modal > 0) {
            this.ratioValues.ROE = (labaBersih / modal) * 100;
        }
        
        if (totalAset > 0) {
            this.ratioValues.NIM = ((pendapatanBunga - bebanBunga) / totalAset) * 100;
        }
        
        if (pendapatanBunga > 0) {
            const bebanOp = Math.abs(getValue('labarugi', '05.20.00.00.00.00') || 0);
            this.ratioValues.BOPO = ((bebanBunga + bebanOp) / pendapatanBunga) * 100;
        }
        
        if (totalDPK > 0) {
            this.ratioValues.LDR = (totalKredit / totalDPK) * 100;
        }
        
        if (totalKredit > 0) {
            this.ratioValues.NPL = (kreditBermasalah / totalKredit) * 100;
        }
        
        console.log('📊 Ratio values updated from Firebase:', this.ratioValues);
        
        // Refresh display
        this.refreshAllIndicators();
    },
    
    // ========================================
    // INIT
    // ========================================
    init() {
        console.log('🚀 Financial Ratio Handler initialized');
        
        // Try to load from Firebase
        this.updateFromFirebase();
        
        // Listen for data updates
        window.addEventListener('dashboardDataUpdated', () => {
            this.updateFromFirebase();
        });
        
        window.addEventListener('filterChanged', () => {
            setTimeout(() => this.updateFromFirebase(), 500);
        });
        
        // Initial refresh
        this.refreshAllIndicators();
    }
};

// Global function for button onclick
window.switchRatioStandard = function(standard) {
    FinancialRatioHandler.switchStandard(standard);
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        FinancialRatioHandler.init();
    }, 2500);
});

// Export
window.FinancialRatioHandler = FinancialRatioHandler;

console.log('📦 Financial Ratio Handler loaded');
