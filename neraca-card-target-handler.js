// ========================================
// NERACA CARD TARGET HANDLER
// Progress Bar + MoM/YoY/YTD Indicators
// Version: 2.2 - Filter hooks + Target debug
// ========================================

(function() {
    'use strict';
    
    console.log('🎯 Neraca Card Target Handler v2.2 loading...');
    
    // ==========================================
    // CARD LABEL TO CONFIG MAPPING
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
        'Laba Bersih': {
            key: 'labaBersih',
            sandi: '03.05.02.01.00.00',
            type: 'neraca'
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
    // GET VALUE FROM DATA - FIXED VERSION
    // ==========================================
    
    function getValue(neracaData, labarugiData, config, kode, periode, debug = false) {
        const dataSource = config.type === 'neraca' ? neracaData : labarugiData;
        
        if (!dataSource || dataSource.length === 0) {
            if (debug) console.log(`   ⚠️ No ${config.type} data source`);
            return 0;
        }
        
        // FIXED: Check what field name is used for kode (kode_cabang vs kode)
        const getKode = (d) => d.kode_cabang || d.kode || d.cabang || '';
        
        // Single sandi
        if (config.sandi) {
            const item = dataSource.find(d => 
                getKode(d) === kode && 
                d.periode === periode && 
                d.sandi === config.sandi
            );
            if (debug && item) console.log(`   📊 Found ${config.sandi}: ${item.total}`);
            return item ? (item.total || 0) : 0;
        }
        
        // Prefix sum (string)
        if (config.sandiPrefix && typeof config.sandiPrefix === 'string') {
            const items = dataSource.filter(d => 
                getKode(d) === kode && 
                d.periode === periode && 
                d.sandi && d.sandi.startsWith(config.sandiPrefix)
            );
            const total = items.reduce((sum, d) => sum + (config.useAbs ? Math.abs(d.total || 0) : (d.total || 0)), 0);
            if (debug) console.log(`   📊 Prefix ${config.sandiPrefix}: ${items.length} items, total=${total}`);
            return total;
        }
        
        // Multiple prefix sum (array)
        if (config.sandiPrefixList && Array.isArray(config.sandiPrefixList)) {
            let total = 0;
            let itemCount = 0;
            config.sandiPrefixList.forEach(prefix => {
                const items = dataSource.filter(d => 
                    getKode(d) === kode && 
                    d.periode === periode && 
                    d.sandi && d.sandi.startsWith(prefix)
                );
                items.forEach(item => {
                    total += config.useAbs ? Math.abs(item.total || 0) : (item.total || 0);
                    itemCount++;
                });
            });
            if (debug) console.log(`   📊 PrefixList: ${itemCount} items, total=${total}`);
            return total;
        }
        
        // Sandi list sum
        if (config.sandiList) {
            let total = 0;
            let foundCount = 0;
            config.sandiList.forEach(sandi => {
                const item = dataSource.find(d => 
                    getKode(d) === kode && 
                    d.periode === periode && 
                    d.sandi === sandi
                );
                if (item) {
                    total += config.useAbs ? Math.abs(item.total || 0) : (item.total || 0);
                    foundCount++;
                }
            });
            if (debug) console.log(`   📊 SandiList: ${foundCount}/${config.sandiList.length} found, total=${total}`);
            return total;
        }
        
        // Calculation with sign (laba sebelum pajak)
        if (config.sandiCalc) {
            let total = 0;
            config.sandiCalc.forEach(calc => {
                const item = dataSource.find(d => 
                    getKode(d) === kode && 
                    d.periode === periode && 
                    d.sandi === calc.sandi
                );
                if (item) {
                    total += (item.total || 0) * calc.sign;
                    if (debug) console.log(`   📊 Calc ${calc.sandi}: ${item.total} * ${calc.sign}`);
                }
            });
            return total;
        }
        
        return 0;
    }
    
    function getTargetValue(targetNeracaData, targetLabarugiData, config, kode, targetPeriode, debug = false) {
        const dataSource = config.type === 'neraca' ? targetNeracaData : targetLabarugiData;
        
        if (!dataSource || dataSource.length === 0) {
            if (debug) console.log(`   ⚠️ No target ${config.type} data`);
            return 0;
        }
        
        const getKode = (d) => d.kode_cabang || d.kode || d.cabang || '';
        
        // Single sandi
        if (config.sandi) {
            const item = dataSource.find(d => 
                getKode(d) === kode && 
                d.periode === targetPeriode && 
                d.sandi === config.sandi
            );
            if (debug && item) console.log(`   🎯 Target ${config.sandi}: ${item.total}`);
            return item ? (item.total || 0) : 0;
        }
        
        // Prefix sum
        if (config.sandiPrefix && typeof config.sandiPrefix === 'string') {
            const items = dataSource.filter(d => 
                getKode(d) === kode && 
                d.periode === targetPeriode && 
                d.sandi && d.sandi.startsWith(config.sandiPrefix)
            );
            return items.reduce((sum, d) => sum + (config.useAbs ? Math.abs(d.total || 0) : (d.total || 0)), 0);
        }
        
        // Multiple prefix
        if (config.sandiPrefixList && Array.isArray(config.sandiPrefixList)) {
            let total = 0;
            config.sandiPrefixList.forEach(prefix => {
                const items = dataSource.filter(d => 
                    getKode(d) === kode && 
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
                    getKode(d) === kode && 
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
                    getKode(d) === kode && 
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
    // CALCULATE INDICATORS - FIXED WITH DEBUG
    // ==========================================
    
    function calculateIndicators(config, neracaData, labarugiData, targetNeracaData, targetLabarugiData, filters, debug = false) {
        const periode = filters.periode;
        const [tahun] = periode.split('-');
        
        // Determine kode - FIXED: Better detection
        let kode = 'ALL';
        
        // Check various filter field names
        const cabang = filters.cabang || filters.branch || filters.kode_cabang;
        const tipe = filters.tipe || filters.type || filters.businessLine;
        
        if (cabang && cabang !== 'ALL' && cabang !== '' && cabang !== 'konsolidasi') {
            kode = cabang;
        } else if (tipe === 'konvensional' || tipe === 'Konvensional') {
            kode = 'KON';
        } else if (tipe === 'syariah' || tipe === 'Syariah') {
            kode = 'SYR';
        }
        
        if (debug) {
            console.log(`\n📊 Calculating indicators for: ${config.key}`);
            console.log(`   Periode: ${periode}, Kode: ${kode}, Tipe: ${tipe}`);
            console.log(`   Neraca records: ${neracaData?.length || 0}`);
            console.log(`   Labarugi records: ${labarugiData?.length || 0}`);
            console.log(`   Target Neraca records: ${targetNeracaData?.length || 0}`);
            console.log(`   Target Labarugi records: ${targetLabarugiData?.length || 0}`);
        }
        
        // Current value
        const current = getValue(neracaData, labarugiData, config, kode, periode, debug);
        
        // Previous month (MoM)
        const prevMonthPeriode = getPrevMonthPeriode(periode);
        const prevMonth = getValue(neracaData, labarugiData, config, kode, prevMonthPeriode, false);
        
        // Previous year same month (YoY)
        const prevYearPeriode = getPrevYearPeriode(periode);
        const prevYear = getValue(neracaData, labarugiData, config, kode, prevYearPeriode, false);
        
        // YTD Start (January)
        const ytdStartPeriode = getYTDStartPeriode(periode);
        const ytdStart = getValue(neracaData, labarugiData, config, kode, ytdStartPeriode, false);
        
        // Target Desember (TRW4)
        const targetPeriode = getTargetPeriodeDesember(tahun);
        const targetDes = getTargetValue(targetNeracaData, targetLabarugiData, config, kode, targetPeriode, debug);
        
        if (debug) {
            console.log(`   📈 Values found:`);
            console.log(`      Current (${periode}): ${current}`);
            console.log(`      PrevMonth (${prevMonthPeriode}): ${prevMonth}`);
            console.log(`      PrevYear (${prevYearPeriode}): ${prevYear}`);
            console.log(`      YTD Start (${ytdStartPeriode}): ${ytdStart}`);
            console.log(`      Target (${targetPeriode}): ${targetDes}`);
        }
        
        // Calculate percentages - FIXED: Better handling of zero/null values
        let mom = null;
        let yoy = null;
        let ytd = null;
        let progress = 0;
        
        // MoM calculation
        if (prevMonth !== 0 && prevMonth !== null) {
            mom = ((current - prevMonth) / Math.abs(prevMonth)) * 100;
        } else if (current !== 0) {
            mom = 100; // If no previous month but current has value, show 100%
        } else {
            mom = 0;
        }
        
        // YoY calculation - null if no previous year data
        if (prevYear !== 0 && prevYear !== null) {
            yoy = ((current - prevYear) / Math.abs(prevYear)) * 100;
        }
        // If prevYear is 0 or null, yoy stays null (N/A)
        
        // YTD calculation
        if (ytdStart !== 0 && ytdStart !== null) {
            ytd = ((current - ytdStart) / Math.abs(ytdStart)) * 100;
        } else if (current !== 0) {
            ytd = 100;
        } else {
            ytd = 0;
        }
        
        // Progress to target
        if (targetDes !== 0 && targetDes !== null) {
            progress = (Math.abs(current) / Math.abs(targetDes)) * 100;
        }
        
        if (debug) {
            console.log(`   📊 Calculated indicators:`);
            console.log(`      MoM: ${mom?.toFixed(2)}%`);
            console.log(`      YoY: ${yoy?.toFixed(2) || 'N/A'}%`);
            console.log(`      YTD: ${ytd?.toFixed(2)}%`);
            console.log(`      Progress: ${progress.toFixed(2)}%`);
        }
        
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
    // FORMAT HELPERS
    // ==========================================
    
    function formatCurrency(value) {
        if (value === 0 || value === null) return 'Rp 0';
        const abs = Math.abs(value);
        if (abs >= 1e12) return `Rp ${(value / 1e12).toFixed(2)} T`;
        if (abs >= 1e9) return `Rp ${(value / 1e9).toFixed(2)} M`;
        if (abs >= 1e6) return `Rp ${(value / 1e6).toFixed(0)} Jt`;
        return `Rp ${value.toLocaleString('id-ID')}`;
    }
    
    function formatTarget(value) {
        if (value === 0 || value === null) return '-';
        const abs = Math.abs(value);
        if (abs >= 1e12) return `Rp${(value / 1e12).toFixed(1)}T`;
        if (abs >= 1e9) return `Rp${(value / 1e9).toFixed(1)}M`;
        if (abs >= 1e6) return `Rp${(value / 1e6).toFixed(0)}Jt`;
        return `Rp${value.toLocaleString('id-ID')}`;
    }
    
    // ==========================================
    // INJECT CSS STYLES
    // ==========================================
    
    function injectStyles() {
        if (document.getElementById('neracaCardTargetStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'neracaCardTargetStyles';
        style.textContent = `
            /* Hide original change element on enhanced cards */
            .card-enhanced .neraca-card-change {
                display: none !important;
            }
            
            /* Card hover effect */
            .card-enhanced {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .card-enhanced:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
            }
            
            /* Target additions container */
            .card-target-additions {
                margin: 10px 0;
            }
            
            /* Progress Bar Container */
            .target-progress-wrapper {
                margin: 8px 0;
                padding: 0;
            }
            
            .target-progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #64748b;
                margin-bottom: 5px;
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
                height: 8px;
                background: #e2e8f0;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .target-progress-bar {
                height: 100%;
                border-radius: 4px;
                transition: width 0.6s ease;
            }
            
            .target-progress-bar.excellent {
                background: linear-gradient(90deg, #10b981, #059669);
            }
            .target-progress-bar.good {
                background: linear-gradient(90deg, #3b82f6, #2563eb);
            }
            .target-progress-bar.warning {
                background: linear-gradient(90deg, #f59e0b, #d97706);
            }
            .target-progress-bar.danger {
                background: linear-gradient(90deg, #ef4444, #dc2626);
            }
            
            /* Indicator Chips */
            .indicators-row {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 8px;
            }
            
            .indicator-chip {
                display: inline-flex;
                align-items: center;
                gap: 3px;
                padding: 4px 8px;
                border-radius: 20px;
                font-size: 10px;
                font-weight: 600;
                transition: transform 0.15s ease, box-shadow 0.15s ease;
                cursor: default;
            }
            
            .indicator-chip:hover {
                transform: scale(1.05);
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            }
            
            .indicator-chip .chip-icon {
                font-size: 8px;
            }
            
            .indicator-chip .chip-label {
                font-weight: 500;
                opacity: 0.9;
            }
            
            .indicator-chip .chip-value {
                font-weight: 700;
            }
            
            .indicator-chip.positive {
                background: linear-gradient(135deg, #d1fae5, #a7f3d0);
                color: #047857;
            }
            
            .indicator-chip.negative {
                background: linear-gradient(135deg, #fee2e2, #fecaca);
                color: #b91c1c;
            }
            
            .indicator-chip.neutral {
                background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                color: #475569;
            }
            
            .indicator-chip.na {
                background: #f8fafc;
                color: #94a3b8;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .indicator-chip {
                    padding: 3px 6px;
                    font-size: 9px;
                }
                .indicators-row {
                    gap: 4px;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Styles injected');
    }
    
    // ==========================================
    // CREATE PROGRESS BAR HTML
    // ==========================================
    
    function createProgressBarHTML(progress, targetValue) {
        const displayProgress = Math.min(progress, 150);
        const displayWidth = Math.min(progress, 100);
        
        let colorClass = 'danger';
        if (progress >= 100) colorClass = 'excellent';
        else if (progress >= 90) colorClass = 'good';
        else if (progress >= 75) colorClass = 'warning';
        
        const progressText = progress > 0 ? `${progress.toFixed(1)}%` : '0%';
        
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
            if (val === null || val === undefined) return 'na';
            if (val > 0.01) return 'positive';
            if (val < -0.01) return 'negative';
            return 'neutral';
        };
        
        const formatVal = (val) => {
            if (val === null || val === undefined) return 'N/A';
            const sign = val >= 0 ? '+' : '';
            return `${sign}${val.toFixed(2)}%`;
        };
        
        const getIcon = (val) => {
            if (val === null || val === undefined) return 'fa-minus';
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
        const existingAdditions = card.querySelector('.card-target-additions');
        if (existingAdditions) existingAdditions.remove();
        
        // Find elements in card structure
        const changeEl = card.querySelector('.neraca-card-change');
        const sparklineEl = card.querySelector('.neraca-card-sparkline');
        const buttonEl = card.querySelector('.neraca-detail-btn');
        
        // Create wrapper for new elements
        const wrapper = document.createElement('div');
        wrapper.className = 'card-target-additions';
        wrapper.innerHTML = createProgressBarHTML(indicators.progress, indicators.targetDes) +
                           createIndicatorsHTML(indicators.mom, indicators.yoy, indicators.ytd);
        
        // Insert after change element
        if (changeEl && changeEl.parentNode) {
            changeEl.parentNode.insertBefore(wrapper, changeEl.nextSibling);
        } else if (sparklineEl && sparklineEl.parentNode) {
            sparklineEl.parentNode.insertBefore(wrapper, sparklineEl);
        } else if (buttonEl && buttonEl.parentNode) {
            buttonEl.parentNode.insertBefore(wrapper, buttonEl);
        } else {
            card.appendChild(wrapper);
        }
        
        console.log(`  ✓ ${labelText}: Progress=${indicators.progress.toFixed(1)}%, MoM=${indicators.mom?.toFixed(2) || 'N/A'}%, YoY=${indicators.yoy?.toFixed(2) || 'N/A'}%, YTD=${indicators.ytd?.toFixed(2) || 'N/A'}%`);
    }
    
    // ==========================================
    // UPDATE ALL CARDS
    // ==========================================
    
    function updateAllCards(debug = false) {
        const data = window.DashboardFirebase?.getData?.();
        const filters = window.DashboardFirebase?.getFilters?.();
        
        if (!data) {
            console.warn('⚠️ DashboardFirebase.getData() returned null/undefined');
            return;
        }
        
        if (!filters) {
            console.warn('⚠️ DashboardFirebase.getFilters() returned null/undefined');
            return;
        }
        
        const { neraca, labarugi, targetNeraca, targetLabarugi } = data;
        
        console.log('🎯 Updating neraca cards with targets...');
        console.log(`   📊 Data available:`);
        console.log(`      - Neraca: ${neraca?.length || 0} records`);
        console.log(`      - Labarugi: ${labarugi?.length || 0} records`);
        console.log(`      - Target Neraca: ${targetNeraca?.length || 0} records`);
        console.log(`      - Target Labarugi: ${targetLabarugi?.length || 0} records`);
        console.log(`   🔧 Filters: periode=${filters.periode}, tipe=${filters.tipe || filters.type}, cabang=${filters.cabang || 'ALL'}`);
        
        if (!neraca || neraca.length === 0) {
            console.warn('⚠️ No neraca data available');
            return;
        }
        
        // Debug: Show sample data structure
        if (debug && neraca.length > 0) {
            console.log('   📋 Sample neraca record:', JSON.stringify(neraca[0], null, 2));
        }
        
        // Find all neraca-card-v2 elements
        const cards = document.querySelectorAll('.neraca-card-v2');
        console.log(`   🔍 Found ${cards.length} neraca cards`);
        
        let updatedCount = 0;
        
        cards.forEach((card, index) => {
            const labelEl = card.querySelector('.neraca-card-label');
            if (!labelEl) {
                console.log(`   ⚠️ Card ${index}: No label element found`);
                return;
            }
            
            const labelText = labelEl.textContent.trim();
            const config = CARD_CONFIG[labelText];
            
            if (!config) {
                console.log(`   ⚠️ No config for: "${labelText}"`);
                return;
            }
            
            // Calculate indicators - debug first card only
            const shouldDebug = debug && updatedCount === 0;
            const indicators = calculateIndicators(
                config,
                neraca,
                labarugi || [],
                targetNeraca || [],
                targetLabarugi || [],
                filters,
                shouldDebug
            );
            
            // Update the card
            updateCard(card, indicators, labelText);
            updatedCount++;
        });
        
        console.log(`✅ Updated ${updatedCount} cards with progress bars and indicators`);
    }
    
    // ==========================================
    // DEBUG FUNCTION - Call from console
    // ==========================================
    
    function debugData() {
        console.log('\n========== DEBUG NERACA CARD TARGET HANDLER ==========');
        
        const data = window.DashboardFirebase?.getData?.();
        const filters = window.DashboardFirebase?.getFilters?.();
        
        console.log('\n1. DATA AVAILABILITY:');
        console.log('   DashboardFirebase exists:', !!window.DashboardFirebase);
        console.log('   getData exists:', !!window.DashboardFirebase?.getData);
        console.log('   getFilters exists:', !!window.DashboardFirebase?.getFilters);
        
        if (!data) {
            console.log('   ❌ getData() returned:', data);
            return;
        }
        
        console.log('\n2. DATA CONTENTS:');
        console.log('   neraca:', data.neraca?.length || 0, 'records');
        console.log('   labarugi:', data.labarugi?.length || 0, 'records');
        console.log('   targetNeraca:', data.targetNeraca?.length || 0, 'records');
        console.log('   targetLabarugi:', data.targetLabarugi?.length || 0, 'records');
        
        console.log('\n3. FILTERS:');
        console.log('   ', JSON.stringify(filters, null, 2));
        
        if (data.neraca?.length > 0) {
            console.log('\n4. SAMPLE NERACA RECORD:');
            console.log('   ', JSON.stringify(data.neraca[0], null, 2));
            
            // Check available kode values
            const kodes = [...new Set(data.neraca.map(d => d.kode_cabang || d.kode))];
            console.log('\n5. AVAILABLE KODE VALUES:', kodes.slice(0, 20));
            
            // Check available periodes
            const periodes = [...new Set(data.neraca.map(d => d.periode))].sort();
            console.log('6. AVAILABLE PERIODES:', periodes);
        }
        
        if (data.targetNeraca?.length > 0) {
            console.log('\n7. SAMPLE TARGET NERACA RECORD:');
            console.log('   ', JSON.stringify(data.targetNeraca[0], null, 2));
            
            const targetPeriodes = [...new Set(data.targetNeraca.map(d => d.periode))];
            console.log('8. TARGET PERIODES:', targetPeriodes);
        }
        
        console.log('\n9. TESTING CALCULATION FOR Total Asset:');
        const assetConfig = CARD_CONFIG['Total Asset'];
        const testIndicators = calculateIndicators(
            assetConfig,
            data.neraca || [],
            data.labarugi || [],
            data.targetNeraca || [],
            data.targetLabarugi || [],
            filters,
            true // debug mode
        );
        console.log('   Result:', testIndicators);
        
        console.log('\n========== END DEBUG ==========\n');
    }
    
    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function init() {
        console.log('🎯 Initializing Neraca Card Target Handler v2.2...');
        
        // Inject styles
        injectStyles();
        
        // Initial update with delays
        setTimeout(() => updateAllCards(true), 2000);  // First with debug
        setTimeout(() => updateAllCards(false), 4000);
        setTimeout(() => updateAllCards(false), 6000);
        
        // Listen for filter changes
        window.addEventListener('filterChanged', () => {
            console.log('🔄 Filter changed event, updating card targets...');
            setTimeout(() => updateAllCards(false), 500);
        });
        
        // Listen for data loaded events
        window.addEventListener('dashboardDataLoaded', () => {
            console.log('🔄 Dashboard data loaded, updating card targets...');
            setTimeout(() => updateAllCards(false), 500);
        });
        
        window.addEventListener('targetDataLoaded', () => {
            console.log('🔄 Target data loaded, updating card targets...');
            setTimeout(() => updateAllCards(false), 500);
        });
        
        // ==========================================
        // HOOK INTO EXISTING FILTER FUNCTIONS
        // ==========================================
        
        // Hook into header period selects
        const yearSelect = document.getElementById('headerYearSelect');
        const monthSelect = document.getElementById('headerMonthSelect');
        
        if (yearSelect) {
            yearSelect.addEventListener('change', () => {
                console.log('🔄 Year filter changed');
                setTimeout(() => updateAllCards(false), 1000);
            });
        }
        
        if (monthSelect) {
            monthSelect.addEventListener('change', () => {
                console.log('🔄 Month filter changed');
                setTimeout(() => updateAllCards(false), 1000);
            });
        }
        
        // Hook into business line filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn[data-business-line]');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('🔄 Business line filter clicked:', btn.dataset.businessLine);
                setTimeout(() => updateAllCards(false), 1000);
            });
        });
        
        // Hook into branch selector
        const branchSelector = document.getElementById('branchSelector');
        if (branchSelector) {
            branchSelector.addEventListener('change', () => {
                console.log('🔄 Branch filter changed');
                setTimeout(() => updateAllCards(false), 1000);
            });
        }
        
        // Observe DashboardFirebase filter changes via polling
        let lastPeriode = '';
        let lastTipe = '';
        setInterval(() => {
            const filters = window.DashboardFirebase?.getFilters?.();
            if (filters) {
                const currentPeriode = filters.periode || '';
                const currentTipe = filters.tipe || '';
                
                if (currentPeriode !== lastPeriode || currentTipe !== lastTipe) {
                    console.log(`🔄 Filter change detected: ${lastPeriode} → ${currentPeriode}, ${lastTipe} → ${currentTipe}`);
                    lastPeriode = currentPeriode;
                    lastTipe = currentTipe;
                    updateAllCards(false);
                }
            }
        }, 2000); // Check every 2 seconds
        
        // Expose functions globally
        window.refreshNeracaCardTargets = () => updateAllCards(false);
        window.debugNeracaCardTargets = debugData;
        window.debugTargetData = debugTargetData;
        
        console.log('✅ Neraca Card Target Handler v2.2 initialized');
        console.log('💡 TIP: Run debugNeracaCardTargets() or debugTargetData() in console');
    }
    
    // ==========================================
    // DEBUG TARGET DATA SPECIFICALLY
    // ==========================================
    
    function debugTargetData() {
        console.log('\n========== DEBUG TARGET DATA ==========');
        
        const data = window.DashboardFirebase?.getData?.();
        if (!data) {
            console.log('❌ No data available');
            return;
        }
        
        const { targetNeraca, targetLabarugi } = data;
        
        console.log('\n1. TARGET NERACA:');
        console.log('   Total records:', targetNeraca?.length || 0);
        
        if (targetNeraca?.length > 0) {
            // Get unique sandi values
            const sandiValues = [...new Set(targetNeraca.map(d => d.sandi))].sort();
            console.log('   Unique sandi values:', sandiValues);
            
            // Get unique kode values
            const kodeValues = [...new Set(targetNeraca.map(d => d.kode_cabang || d.kode))];
            console.log('   Unique kode values:', kodeValues);
            
            // Check for specific sandi we need
            const neededSandi = [
                '01.00.00.00.00.00', // Total Aset
                '01.09.01.00.00.00', // Kredit
                '02.01.01.00.00.00', // DPK - Giro
                '03.00.00.00.00.00', // Modal
            ];
            
            console.log('\n   Checking needed sandi:');
            neededSandi.forEach(sandi => {
                const found = targetNeraca.filter(d => d.sandi === sandi);
                console.log(`   - ${sandi}: ${found.length} records`, found.length > 0 ? found[0] : '');
            });
        }
        
        console.log('\n2. TARGET LABARUGI:');
        console.log('   Total records:', targetLabarugi?.length || 0);
        
        if (targetLabarugi?.length > 0) {
            const sandiValues = [...new Set(targetLabarugi.map(d => d.sandi))].sort();
            console.log('   Unique sandi values:', sandiValues);
            
            // Check for laba sebelum pajak sandi
            const labaSandi = ['03.05.02.01.10.00', '03.05.02.02.10.00'];
            console.log('\n   Checking laba sandi:');
            labaSandi.forEach(sandi => {
                const found = targetLabarugi.filter(d => d.sandi === sandi);
                console.log(`   - ${sandi}: ${found.length} records`);
            });
        }
        
        console.log('\n========== END DEBUG ==========\n');
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
        refresh: () => updateAllCards(false),
        refreshDebug: () => updateAllCards(true),
        debug: debugData,
        debugTarget: debugTargetData,
        calculateIndicators
    };
    
})();
