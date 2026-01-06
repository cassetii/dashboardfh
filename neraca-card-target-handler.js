// ========================================
// NERACA CARD TARGET HANDLER
// Progress Bar + MoM/YoY/YTD Indicators
// Version: 2.0 - Exact match for neraca-card-v2
// ========================================

(function() {
    'use strict';
    
    console.log('🎯 Neraca Card Target Handler v2.0 loading...');
    
    // ==========================================
    // CARD LABEL TO CONFIG MAPPING
    // Exact labels from HTML
    // ==========================================
    
    const CARD_CONFIG = {
        'Total Asset': {
            key: 'totalAset',
            sandi: '01.00.00.00.00.00',
            type: 'neraca'
        },
        'Total Kredit': {
            key: 'kredit',
            sandi: '01.09.01.00.00.00',
            type: 'neraca'
        },
        'Total Pembiayaan': {
            key: 'pembiayaan',
            sandiPrefix: '01.09.03',
            type: 'neraca'
        },
        'ATI (Aktiva Tetap & Inventaris)': {
            key: 'ati',
            sandiList: ['01.13.01.00.00.00', '01.13.02.00.00.00', '01.14.01.00.00.00', '01.14.02.00.00.00'],
            type: 'neraca'
        },
        'CKPN (Cad. Kerugian Penurunan Nilai)': {
            key: 'ckpn',
            sandiPrefix: '01.12',
            type: 'neraca',
            isNegative: true
        },
        'Dana Pihak Ketiga (DPK)': {
            key: 'dpk',
            sandiList: [
                '02.01.01.00.00.00', '02.02.01.00.00.00', '02.03.01.00.00.00',
                '02.01.02.01.00.00', '02.01.02.02.00.00', '02.01.02.03.00.00',
                '02.02.02.01.00.00', '02.02.02.02.00.00', '02.02.02.03.00.00',
                '02.03.02.01.00.00', '02.03.02.02.00.00'
            ],
            type: 'neraca'
        },
        'Total Modal': {
            key: 'modal',
            sandi: '03.00.00.00.00.00',
            type: 'neraca'
        },
        'Laba Sebelum Pajak': {
            key: 'labaSebelumPajak',
            sandiCalc: [
                { sandi: '03.05.02.01.10.00', sign: 1 },
                { sandi: '03.05.02.02.10.00', sign: -1 }
            ],
            type: 'labarugi'
        },
        'Total Pendapatan': {
            key: 'pendapatan',
            sandiPrefixList: ['04.11', '04.12', '04.20'],
            type: 'labarugi',
            useAbs: true
        },
        'Total Biaya': {
            key: 'biaya',
            sandiPrefixList: ['05.11', '05.12', '05.20'],
            type: 'labarugi',
            useAbs: true
        }
    };
    
    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    
    function getTargetPeriodeDesember(tahun) {
        return `TRW4_${tahun}`;
    }
    
    function getPrevMonthPeriode(periode) {
        const [tahun, bulan] = periode.split('-');
        let prevMonth = parseInt(bulan) - 1;
        let prevYear = parseInt(tahun);
        
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }
        
        return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    }
    
    function getPrevYearPeriode(periode) {
        const [tahun, bulan] = periode.split('-');
        return `${parseInt(tahun) - 1}-${bulan}`;
    }
    
    function getYTDStartPeriode(periode) {
        const [tahun] = periode.split('-');
        return `${tahun}-01`;
    }
    
    // ==========================================
    // GET VALUE FROM DATA
    // ==========================================
    
    function getValue(neracaData, labarugiData, config, kode, periode) {
        const dataSource = config.type === 'neraca' ? neracaData : labarugiData;
        
        // Single sandi
        if (config.sandi) {
            const item = dataSource.find(d => 
                d.kode_cabang === kode && 
                d.periode === periode && 
                d.sandi === config.sandi &&
                !d.is_ratio
            );
            return item ? (item.total || 0) : 0;
        }
        
        // Prefix sum (string)
        if (config.sandiPrefix && typeof config.sandiPrefix === 'string') {
            return dataSource
                .filter(d => d.kode_cabang === kode && d.periode === periode && 
                            d.sandi && d.sandi.startsWith(config.sandiPrefix) && !d.is_ratio)
                .reduce((sum, d) => sum + (config.useAbs ? Math.abs(d.total || 0) : (d.total || 0)), 0);
        }
        
        // Multiple prefix sum (array) - for pendapatan/biaya
        if (config.sandiPrefixList && Array.isArray(config.sandiPrefixList)) {
            let total = 0;
            config.sandiPrefixList.forEach(prefix => {
                const items = dataSource.filter(d => 
                    d.kode_cabang === kode && 
                    d.periode === periode && 
                    d.sandi && d.sandi.startsWith(prefix) && 
                    !d.is_ratio
                );
                items.forEach(item => {
                    total += config.useAbs ? Math.abs(item.total || 0) : (item.total || 0);
                });
            });
            return total;
        }
        
        // Sandi list sum
        if (config.sandiList) {
            let total = 0;
            config.sandiList.forEach(sandi => {
                const item = dataSource.find(d => 
                    d.kode_cabang === kode && 
                    d.periode === periode && 
                    d.sandi === sandi &&
                    !d.is_ratio
                );
                if (item) {
                    total += config.useAbs ? Math.abs(item.total || 0) : (item.total || 0);
                }
            });
            return total;
        }
        
        // Calculation with sign (laba sebelum pajak)
        if (config.sandiCalc) {
            let total = 0;
            config.sandiCalc.forEach(calc => {
                const item = dataSource.find(d => 
                    d.kode_cabang === kode && 
                    d.periode === periode && 
                    d.sandi === calc.sandi &&
                    !d.is_ratio
                );
                if (item) {
                    total += (item.total || 0) * calc.sign;
                }
            });
            return total;
        }
        
        return 0;
    }
    
    function getTargetValue(targetNeracaData, targetLabarugiData, config, kode, targetPeriode) {
        const dataSource = config.type === 'neraca' ? targetNeracaData : targetLabarugiData;
        
        if (!dataSource || dataSource.length === 0) return 0;
        
        // Single sandi
        if (config.sandi) {
            const item = dataSource.find(d => 
                d.kode_cabang === kode && 
                d.periode === targetPeriode && 
                d.sandi === config.sandi
            );
            return item ? (item.total || 0) : 0;
        }
        
        // Prefix sum
        if (config.sandiPrefix && typeof config.sandiPrefix === 'string') {
            return dataSource
                .filter(d => d.kode_cabang === kode && d.periode === targetPeriode && 
                            d.sandi && d.sandi.startsWith(config.sandiPrefix))
                .reduce((sum, d) => sum + (config.useAbs ? Math.abs(d.total || 0) : (d.total || 0)), 0);
        }
        
        // Multiple prefix
        if (config.sandiPrefixList && Array.isArray(config.sandiPrefixList)) {
            let total = 0;
            config.sandiPrefixList.forEach(prefix => {
                const items = dataSource.filter(d => 
                    d.kode_cabang === kode && 
                    d.periode === targetPeriode && 
                    d.sandi && d.sandi.startsWith(prefix)
                );
                items.forEach(item => {
                    total += config.useAbs ? Math.abs(item.total || 0) : (item.total || 0);
                });
            });
            return total;
        }
        
        // Sandi list sum
        if (config.sandiList) {
            let total = 0;
            config.sandiList.forEach(sandi => {
                const item = dataSource.find(d => 
                    d.kode_cabang === kode && 
                    d.periode === targetPeriode && 
                    d.sandi === sandi
                );
                if (item) {
                    total += config.useAbs ? Math.abs(item.total || 0) : (item.total || 0);
                }
            });
            return total;
        }
        
        // Calculation with sign
        if (config.sandiCalc) {
            let total = 0;
            config.sandiCalc.forEach(calc => {
                const item = dataSource.find(d => 
                    d.kode_cabang === kode && 
                    d.periode === targetPeriode && 
                    d.sandi === calc.sandi
                );
                if (item) {
                    total += (item.total || 0) * calc.sign;
                }
            });
            return total;
        }
        
        return 0;
    }
    
    // ==========================================
    // CALCULATE INDICATORS FOR A CARD
    // ==========================================
    
    function calculateIndicators(config, neracaData, labarugiData, targetNeracaData, targetLabarugiData, filters) {
        const periode = filters.periode;
        const [tahun] = periode.split('-');
        
        // Determine kode
        let kode = 'ALL';
        if (filters.cabang && filters.cabang !== 'ALL') {
            kode = filters.cabang;
        } else if (filters.tipe === 'konvensional') {
            kode = 'KON';
        } else if (filters.tipe === 'syariah') {
            kode = 'SYR';
        }
        
        // Current value
        const current = getValue(neracaData, labarugiData, config, kode, periode);
        
        // Previous month (MoM)
        const prevMonthPeriode = getPrevMonthPeriode(periode);
        const prevMonth = getValue(neracaData, labarugiData, config, kode, prevMonthPeriode);
        
        // Previous year same month (YoY)
        const prevYearPeriode = getPrevYearPeriode(periode);
        const prevYear = getValue(neracaData, labarugiData, config, kode, prevYearPeriode);
        
        // YTD Start (January)
        const ytdStartPeriode = getYTDStartPeriode(periode);
        const ytdStart = getValue(neracaData, labarugiData, config, kode, ytdStartPeriode);
        
        // Target Desember (TRW4)
        const targetPeriode = getTargetPeriodeDesember(tahun);
        const targetDes = getTargetValue(targetNeracaData, targetLabarugiData, config, kode, targetPeriode);
        
        // Calculate percentages
        const mom = prevMonth !== 0 ? ((current - prevMonth) / Math.abs(prevMonth)) * 100 : 0;
        const yoy = prevYear !== 0 ? ((current - prevYear) / Math.abs(prevYear)) * 100 : null;
        const ytd = ytdStart !== 0 ? ((current - ytdStart) / Math.abs(ytdStart)) * 100 : 0;
        
        // Progress to target (percentage of target achieved)
        const progress = targetDes !== 0 ? (Math.abs(current) / Math.abs(targetDes)) * 100 : 0;
        
        return {
            current,
            prevMonth,
            prevYear,
            ytdStart,
            targetDes,
            mom,
            yoy,
            ytd,
            progress
        };
    }
    
    // ==========================================
    // INJECT CSS STYLES
    // ==========================================
    
    function injectStyles() {
        if (document.getElementById('neracaCardTargetStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'neracaCardTargetStyles';
        style.textContent = `
            /* Progress Bar Container */
            .target-progress-wrapper {
                margin: 12px 0;
                padding: 0;
            }
            
            .target-progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #64748b;
                margin-bottom: 6px;
            }
            
            .target-progress-header .target-label {
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .target-progress-header .target-value {
                font-weight: 700;
                color: #1e293b;
            }
            
            .target-progress-track {
                width: 100%;
                height: 8px;
                background: #e2e8f0;
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }
            
            .target-progress-bar {
                height: 100%;
                border-radius: 4px;
                transition: width 0.6s ease-out;
                position: relative;
            }
            
            /* Progress Colors */
            .target-progress-bar.excellent {
                background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            }
            
            .target-progress-bar.good {
                background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
            }
            
            .target-progress-bar.warning {
                background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
            }
            
            .target-progress-bar.danger {
                background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
            }
            
            /* Indicators Row */
            .indicators-row {
                display: flex;
                gap: 6px;
                margin: 12px 0;
                flex-wrap: wrap;
            }
            
            .indicator-chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 600;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .indicator-chip:hover {
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            
            .indicator-chip .chip-label {
                font-weight: 500;
                opacity: 0.9;
                font-size: 10px;
            }
            
            .indicator-chip .chip-value {
                font-weight: 700;
            }
            
            .indicator-chip .chip-icon {
                font-size: 10px;
            }
            
            /* Chip Colors */
            .indicator-chip.positive {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                color: #15803d;
            }
            
            .indicator-chip.negative {
                background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                color: #dc2626;
            }
            
            .indicator-chip.neutral {
                background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                color: #64748b;
            }
            
            .indicator-chip.na {
                background: #f8fafc;
                color: #94a3b8;
            }
            
            /* Hide original change indicator when enhanced */
            .neraca-card-v2.card-enhanced .neraca-card-change {
                display: none !important;
            }
            
            /* Card Enhancement */
            .neraca-card-v2.card-enhanced {
                transition: all 0.3s ease;
            }
            
            .neraca-card-v2.card-enhanced:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 35px rgba(0,0,0,0.12);
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .indicators-row {
                    gap: 4px;
                }
                
                .indicator-chip {
                    padding: 4px 8px;
                    font-size: 10px;
                }
                
                .indicator-chip .chip-label {
                    font-size: 9px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ==========================================
    // CREATE PROGRESS BAR HTML
    // ==========================================
    
    function createProgressBarHTML(progress, targetValue) {
        const cappedProgress = Math.min(progress, 150);
        const displayWidth = Math.min(cappedProgress, 100);
        
        let colorClass = 'danger';
        if (progress >= 100) colorClass = 'excellent';
        else if (progress >= 90) colorClass = 'good';
        else if (progress >= 75) colorClass = 'warning';
        
        const formatTarget = (val) => {
            if (!val || val === 0) return 'N/A';
            const abs = Math.abs(val);
            if (abs >= 1e12) return `Rp${(abs/1e12).toFixed(1)}T`;
            if (abs >= 1e9) return `Rp${(abs/1e9).toFixed(1)}M`;
            if (abs >= 1e6) return `Rp${(abs/1e6).toFixed(0)}Jt`;
            return `Rp${abs.toLocaleString('id-ID')}`;
        };
        
        const progressText = targetValue > 0 ? `${progress.toFixed(1)}%` : 'N/A';
        
        return `
            <div class="target-progress-wrapper">
                <div class="target-progress-header">
                    <span class="target-label">
                        <i class="fas fa-bullseye" style="color: #8b5cf6;"></i>
                        Target Des
                    </span>
                    <span class="target-value">${formatTarget(targetValue)} (${progressText})</span>
                </div>
                <div class="target-progress-track">
                    <div class="target-progress-bar ${colorClass}" style="width: ${displayWidth}%"></div>
                </div>
            </div>
        `;
    }
    
    // ==========================================
    // CREATE INDICATORS HTML
    // ==========================================
    
    function createIndicatorsHTML(mom, yoy, ytd) {
        const getClass = (val) => {
            if (val === null) return 'na';
            if (val > 0.01) return 'positive';
            if (val < -0.01) return 'negative';
            return 'neutral';
        };
        
        const formatVal = (val) => {
            if (val === null) return 'N/A';
            const sign = val >= 0 ? '+' : '';
            return `${sign}${val.toFixed(2)}%`;
        };
        
        const getIcon = (val) => {
            if (val === null) return 'fa-minus';
            if (val > 0.01) return 'fa-arrow-up';
            if (val < -0.01) return 'fa-arrow-down';
            return 'fa-minus';
        };
        
        return `
            <div class="indicators-row">
                <span class="indicator-chip ${getClass(mom)}" title="Month over Month - Perbandingan dengan bulan lalu">
                    <i class="fas ${getIcon(mom)} chip-icon"></i>
                    <span class="chip-label">MoM</span>
                    <span class="chip-value">${formatVal(mom)}</span>
                </span>
                <span class="indicator-chip ${getClass(yoy)}" title="Year over Year - Perbandingan dengan tahun lalu">
                    <i class="fas ${getIcon(yoy)} chip-icon"></i>
                    <span class="chip-label">YoY</span>
                    <span class="chip-value">${formatVal(yoy)}</span>
                </span>
                <span class="indicator-chip ${getClass(ytd)}" title="Year to Date - Perbandingan dengan awal tahun">
                    <i class="fas ${getIcon(ytd)} chip-icon"></i>
                    <span class="chip-label">YTD</span>
                    <span class="chip-value">${formatVal(ytd)}</span>
                </span>
            </div>
        `;
    }
    
    // ==========================================
    // UPDATE SINGLE CARD
    // ==========================================
    
    function updateCard(card, indicators, labelText) {
        if (!card) return;
        
        // Add enhanced class
        card.classList.add('card-enhanced');
        
        // Remove existing additions if any
        const existingProgress = card.querySelector('.target-progress-wrapper');
        const existingIndicators = card.querySelector('.indicators-row');
        if (existingProgress) existingProgress.remove();
        if (existingIndicators) existingIndicators.remove();
        
        // Find elements in card structure
        const changeEl = card.querySelector('.neraca-card-change');
        const sparklineEl = card.querySelector('.neraca-card-sparkline');
        const buttonEl = card.querySelector('.neraca-detail-btn');
        
        // Create wrapper for new elements
        const wrapper = document.createElement('div');
        wrapper.className = 'card-target-additions';
        wrapper.innerHTML = createProgressBarHTML(indicators.progress, indicators.targetDes) +
                           createIndicatorsHTML(indicators.mom, indicators.yoy, indicators.ytd);
        
        // Insert after change element (which will be hidden by CSS)
        if (changeEl && changeEl.parentNode) {
            changeEl.parentNode.insertBefore(wrapper, changeEl.nextSibling);
        } else if (sparklineEl && sparklineEl.parentNode) {
            sparklineEl.parentNode.insertBefore(wrapper, sparklineEl);
        } else if (buttonEl && buttonEl.parentNode) {
            buttonEl.parentNode.insertBefore(wrapper, buttonEl);
        } else {
            card.appendChild(wrapper);
        }
        
        console.log(`  ✓ ${labelText}: Progress=${indicators.progress.toFixed(1)}%, MoM=${indicators.mom?.toFixed(2)}%, YoY=${indicators.yoy?.toFixed(2) || 'N/A'}%`);
    }
    
    // ==========================================
    // UPDATE ALL CARDS
    // ==========================================
    
    function updateAllCards() {
        const data = window.DashboardFirebase?.getData?.();
        const filters = window.DashboardFirebase?.getFilters?.();
        
        if (!data || !filters) {
            console.warn('⚠️ DashboardFirebase not ready');
            return;
        }
        
        const { neraca, labarugi, targetNeraca, targetLabarugi } = data;
        
        if (!neraca || neraca.length === 0) {
            console.warn('⚠️ No neraca data available');
            return;
        }
        
        console.log('🎯 Updating neraca cards with targets...');
        console.log(`   📊 Data: ${neraca.length} neraca, ${labarugi?.length || 0} labarugi`);
        console.log(`   🎯 Targets: ${targetNeraca?.length || 0} target neraca, ${targetLabarugi?.length || 0} target labarugi`);
        
        // Find all neraca-card-v2 elements
        const cards = document.querySelectorAll('.neraca-card-v2');
        let updatedCount = 0;
        
        cards.forEach(card => {
            // Get the label to identify the card
            const labelEl = card.querySelector('.neraca-card-label');
            if (!labelEl) return;
            
            const labelText = labelEl.textContent.trim();
            const config = CARD_CONFIG[labelText];
            
            if (!config) {
                console.log(`   ⚠️ No config for: "${labelText}"`);
                return;
            }
            
            // Calculate indicators
            const indicators = calculateIndicators(
                config,
                neraca,
                labarugi || [],
                targetNeraca || [],
                targetLabarugi || [],
                filters
            );
            
            // Update the card
            updateCard(card, indicators, labelText);
            updatedCount++;
        });
        
        console.log(`✅ Updated ${updatedCount} cards with progress bars and indicators`);
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function init() {
        console.log('🎯 Initializing Neraca Card Target Handler...');
        
        // Inject styles
        injectStyles();
        
        // Initial update (with delays to ensure data is loaded)
        setTimeout(updateAllCards, 2000);
        setTimeout(updateAllCards, 4000);
        setTimeout(updateAllCards, 6000);
        
        // Listen for filter changes
        window.addEventListener('filterChanged', () => {
            console.log('🔄 Filter changed, updating card targets...');
            setTimeout(updateAllCards, 500);
        });
        
        // Listen for data loaded events
        window.addEventListener('dashboardDataLoaded', () => {
            console.log('🔄 Dashboard data loaded, updating card targets...');
            setTimeout(updateAllCards, 500);
        });
        
        window.addEventListener('targetDataLoaded', () => {
            console.log('🔄 Target data loaded, updating card targets...');
            setTimeout(updateAllCards, 500);
        });
        
        // Expose refresh function globally
        window.refreshNeracaCardTargets = updateAllCards;
        
        console.log('✅ Neraca Card Target Handler initialized');
    }
    
    // ==========================================
    // AUTO INIT
    // ==========================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1500));
    } else {
        setTimeout(init, 1500);
    }
    
    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.NeracaCardTargetHandler = {
        init,
        refresh: updateAllCards,
        calculateIndicators
    };
    
})();
