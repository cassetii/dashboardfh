// ========================================
// NERACA SYNC - Sinkronisasi Data dengan UI
// Bank Sulselbar Dashboard
// ========================================

const NeracaSync = {
    
    // Mapping antara data key dan element ID
    mappings: {
        asset: {
            valueId: 'neracaAsset',
            changeId: 'neracaAssetChange',
            dataKey: 'asset',
            unit: 'T',
            unitLabel: 'Triliun'
        },
        kredit: {
            valueId: 'neracaKredit',
            changeId: 'neracaKreditChange',
            dataKey: 'kredit',
            unit: 'T',
            unitLabel: 'Triliun'
        },
        kreditPembiayaan: {
            valueId: 'neracaKreditPembiayaan',
            changeId: 'neracaKreditPembiayaanChange',
            dataKey: 'kreditPembiayaan',
            unit: 'T',
            unitLabel: 'Triliun'
        },
        dpk: {
            valueId: 'neracaDPK',
            changeId: 'neracaDPKChange',
            dataKey: 'dpkKonvensional',
            unit: 'T',
            unitLabel: 'Triliun'
        },
        ati: {
            valueId: 'neracaATI',
            changeId: 'neracaATIChange',
            dataKey: 'asetTetap',
            unit: 'M',
            unitLabel: 'Miliar',
            multiplier: 1000 // Convert T to M
        },
        laba: {
            valueId: 'neracaLaba',
            changeId: 'neracaLabaChange',
            dataKey: 'labaRugi',
            unit: 'M',
            unitLabel: 'Miliar'
        },
        modal: {
            valueId: 'neracaModal',
            changeId: 'neracaModalChange',
            dataKey: 'modal',
            unit: 'T',
            unitLabel: 'Triliun'
        }
    },
    
    // Update semua neraca cards dari BANK_DATA
    syncAll: function() {
        if (typeof BANK_DATA === 'undefined' || !BANK_DATA.neraca) {
            console.warn('âš ï¸ BANK_DATA.neraca not available');
            return;
        }
        
        console.log('ðŸ”„ Syncing Neraca data...');
        
        Object.entries(this.mappings).forEach(([key, config]) => {
            this.syncCard(key, config);
        });
        
        console.log('âœ… Neraca sync complete');
    },
    
    // Update single card
    syncCard: function(key, config) {
        const data = BANK_DATA.neraca[config.dataKey];
        if (!data) {
            console.warn(`âš ï¸ Data not found for: ${config.dataKey}`);
            return;
        }
        
        // Update value
        const valueEl = document.getElementById(config.valueId);
        if (valueEl) {
            let value = data.current;
            if (config.multiplier) {
                value = value * config.multiplier;
            }
            valueEl.innerHTML = `Rp ${this.formatNumber(value)} <span>${config.unitLabel}</span>`;
        }
        
        // Update change
        const changeEl = document.getElementById(config.changeId);
        if (changeEl && data.change !== undefined) {
            const changeValue = data.change;
            const isPositive = changeValue >= 0;
            const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
            changeEl.innerHTML = `${isPositive ? '+' : ''}${changeValue.toFixed(2)}% MoM`;
            
            // Update parent class
            const changeParent = changeEl.closest('.neraca-change');
            if (changeParent) {
                changeParent.className = 'neraca-change ' + (isPositive ? 'positive' : 'negative');
                const iconEl = changeParent.querySelector('i');
                if (iconEl) {
                    iconEl.className = `fas ${icon}`;
                }
            }
        }
    },
    
    // Format number with proper decimal places
    formatNumber: function(num, decimals = 2) {
        if (num === null || num === undefined) return '-';
        return Number(num).toFixed(decimals);
    },
    
    // Update Overview cards juga
    syncOverview: function() {
        if (typeof BANK_DATA === 'undefined') return;
        
        const overviewMappings = [
            { selector: '[data-metric="asset"] .stat-value', value: BANK_DATA.neraca.asset?.current, unit: 'T' },
            { selector: '[data-metric="dpk"] .stat-value', value: BANK_DATA.neraca.dpkKonvensional?.current, unit: 'T' },
            { selector: '[data-metric="kredit"] .stat-value', value: BANK_DATA.neraca.kredit?.current, unit: 'T' },
            { selector: '[data-metric="laba"] .stat-value', value: BANK_DATA.neraca.labaRugi?.current, unit: 'M' }
        ];
        
        overviewMappings.forEach(mapping => {
            const el = document.querySelector(mapping.selector);
            if (el && mapping.value !== undefined) {
                el.textContent = `Rp ${this.formatNumber(mapping.value)} ${mapping.unit}`;
            }
        });
    },
    
    // Update Financial Ratios
    syncRatios: function() {
        if (typeof BANK_DATA === 'undefined' || !BANK_DATA.ratios) return;
        
        const ratioMappings = {
            'CAR': 'carValue',
            'NPL': 'nplValue',
            'ROA': 'roaValue',
            'LDR': 'ldrValue'
        };
        
        Object.entries(ratioMappings).forEach(([ratioKey, elementId]) => {
            const el = document.getElementById(elementId);
            if (el && BANK_DATA.ratios[ratioKey]?.current !== undefined) {
                el.textContent = BANK_DATA.ratios[ratioKey].current.toFixed(1);
            }
        });
        
        // Update KPI cards
        document.querySelectorAll('.kpi-card').forEach(card => {
            const titleEl = card.querySelector('.kpi-title h4');
            if (!titleEl) return;
            
            const title = titleEl.textContent.trim();
            const valueEl = card.querySelector('.kpi-value');
            
            if (valueEl && BANK_DATA.ratios[title]?.current !== undefined) {
                const value = BANK_DATA.ratios[title].current;
                valueEl.innerHTML = `${value.toFixed(1)}<span class="unit">%</span>`;
            }
        });
    },
    
    // Full sync - semua data
    fullSync: function() {
        this.syncAll();
        this.syncOverview();
        this.syncRatios();
        console.log('âœ… Full data sync complete');
    },
    
    // Initialize - auto sync on page load
    init: function() {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.fullSync();
            }, 500);
        });
        
        // Also sync when BANK_DATA changes
        if (typeof window !== 'undefined') {
            const originalBANK_DATA = window.BANK_DATA;
            Object.defineProperty(window, 'BANK_DATA', {
                get: () => originalBANK_DATA,
                set: (newValue) => {
                    Object.assign(originalBANK_DATA, newValue);
                    this.fullSync();
                }
            });
        }
    }
};

// Export
window.NeracaSync = NeracaSync;

// Auto-init
NeracaSync.init();

console.log('ðŸ“Š NeracaSync loaded');
