/**
 * Financial Analytics Module - Bank Sulselbar
 * ============================================
 * Version: 1.0
 * 
 * Features:
 * - MoM (Month over Month) calculation
 * - YTD (Year to Date) calculation  
 * - YoY (Year over Year) calculation
 * - Auto-generated narrative/insights
 */

(function() {
    'use strict';

    console.log('📊 Financial Analytics Module v1.0 loading...');

    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    const INDICATORS = {
        // Neraca - Aktiva
        totalAset: { name: 'Total Aset', sandi: '01.00.00.00.00.00', source: 'neraca', format: 'currency', goodDirection: 'up' },
        kredit: { name: 'Kredit', sandi: '01.09.01.00.00.00', source: 'neraca', format: 'currency', goodDirection: 'up' },
        pembiayaan: { name: 'Pembiayaan', sandi: '01.10.00.00.00.00', source: 'neraca', format: 'currency', goodDirection: 'up' },
        
        // Neraca - Pasiva
        dpk: { name: 'DPK', spiCode: 'DPK', source: 'neraca', format: 'currency', goodDirection: 'up' },
        giro: { name: 'Giro', sandi: '02.01.01.00.00.00', source: 'neraca', format: 'currency', goodDirection: 'up' },
        tabungan: { name: 'Tabungan', sandi: '02.02.01.00.00.00', source: 'neraca', format: 'currency', goodDirection: 'up' },
        deposito: { name: 'Deposito', sandi: '02.03.01.00.00.00', source: 'neraca', format: 'currency', goodDirection: 'up' },
        modal: { name: 'Modal', sandi: '03.00.00.00.00.00', source: 'neraca', format: 'currency', goodDirection: 'up' },
        
        // Laba Rugi
        labaBersih: { name: 'Laba Bersih', sandi: '03.05.02.01.00.00', source: 'labarugi', format: 'currency', goodDirection: 'up' },
        pendapatanBunga: { name: 'Pendapatan Bunga', sandi: '04.11.00.00.00.00', source: 'labarugi', format: 'currency', goodDirection: 'up' },
        bebanBunga: { name: 'Beban Bunga', sandi: '05.11.00.00.00.00', source: 'labarugi', format: 'currency', goodDirection: 'down' },
        
        // Ratios
        ldr: { name: 'LDR', ratioName: 'LDR', source: 'ratio', format: 'percent', goodDirection: 'stable', idealMin: 80, idealMax: 92 },
        bopo: { name: 'BOPO', ratioName: 'BOPO', source: 'ratio', format: 'percent', goodDirection: 'down', threshold: 85 },
        casa: { name: 'CASA', ratioName: 'CASA', source: 'ratio', format: 'percent', goodDirection: 'up', threshold: 50 },
        roa: { name: 'ROA', ratioName: 'ROA', source: 'ratio', format: 'percent', goodDirection: 'up', threshold: 1.5 },
        roe: { name: 'ROE', ratioName: 'ROE', source: 'ratio', format: 'percent', goodDirection: 'up', threshold: 10 },
        nim: { name: 'NIM', ratioName: 'NIM', source: 'ratio', format: 'percent', goodDirection: 'up', threshold: 4 },
        npl: { name: 'NPL (Gross)', ratioName: 'NPL', source: 'ratio', format: 'percent', goodDirection: 'down', threshold: 5 },
        car: { name: 'CAR', ratioName: 'KPMM', source: 'ratio', format: 'percent', goodDirection: 'up', threshold: 12 }
    };

    // ==========================================
    // STATE
    // ==========================================
    
    let analyticsData = { neraca: [], labarugi: [], currentPeriode: null, currentKodeCabang: 'ALL' };

    function setData(neraca, labarugi) {
        analyticsData.neraca = neraca || [];
        analyticsData.labarugi = labarugi || [];
    }

    function setFilters(periode, kodeCabang) {
        analyticsData.currentPeriode = periode;
        analyticsData.currentKodeCabang = kodeCabang || 'ALL';
    }

    // ==========================================
    // PERIOD CALCULATIONS
    // ==========================================
    
    function getPreviousPeriode(periode, monthsBack = 1) {
        if (!periode) return null;
        const [year, month] = periode.split('-').map(Number);
        let newMonth = month - monthsBack;
        let newYear = year;
        while (newMonth <= 0) { newMonth += 12; newYear -= 1; }
        return `${newYear}-${String(newMonth).padStart(2, '0')}`;
    }

    function getYearStartPeriode(periode) {
        if (!periode) return null;
        const [year] = periode.split('-');
        return `${year}-01`;
    }

    function getSamePeriodeLastYear(periode) {
        if (!periode) return null;
        const [year, month] = periode.split('-');
        return `${Number(year) - 1}-${month}`;
    }

    // ==========================================
    // VALUE EXTRACTION
    // ==========================================
    
    function getValueForPeriode(indicator, periode, kodeCabang) {
        const config = INDICATORS[indicator];
        if (!config) return null;
        
        kodeCabang = kodeCabang || analyticsData.currentKodeCabang;
        
        if (config.source === 'ratio') {
            const item = analyticsData.neraca.find(d => 
                d.periode === periode && d.kode_cabang === kodeCabang &&
                d.is_ratio === true && (d.ratio_name || '').toUpperCase() === config.ratioName
            );
            return item ? (item.value * 100) : null;
        }
        
        if (config.spiCode === 'DPK') {
            const giro = getValueForPeriode('giro', periode, kodeCabang);
            const tabungan = getValueForPeriode('tabungan', periode, kodeCabang);
            const deposito = getValueForPeriode('deposito', periode, kodeCabang);
            return (giro || 0) + (tabungan || 0) + (deposito || 0);
        }
        
        const dataSource = config.source === 'neraca' ? analyticsData.neraca : analyticsData.labarugi;
        const item = dataSource.find(d => 
            d.periode === periode && d.kode_cabang === kodeCabang &&
            d.sandi === config.sandi && !d.is_ratio
        );
        return item ? item.total : null;
    }

    // ==========================================
    // ANALYTICS CALCULATIONS
    // ==========================================
    
    function calculateChange(current, previous) {
        if (current === null || previous === null || previous === 0) {
            return { absolute: null, percent: null };
        }
        return { 
            absolute: current - previous, 
            percent: ((current - previous) / Math.abs(previous)) * 100 
        };
    }

    function calculateIndicatorAnalytics(indicator) {
        const config = INDICATORS[indicator];
        if (!config) return null;
        
        const periode = analyticsData.currentPeriode;
        const kodeCabang = analyticsData.currentKodeCabang;
        
        const current = getValueForPeriode(indicator, periode, kodeCabang);
        const prevMonth = getValueForPeriode(indicator, getPreviousPeriode(periode, 1), kodeCabang);
        const yearStart = getValueForPeriode(indicator, getYearStartPeriode(periode), kodeCabang);
        const lastYear = getValueForPeriode(indicator, getSamePeriodeLastYear(periode), kodeCabang);
        
        return {
            indicator, name: config.name, format: config.format, goodDirection: config.goodDirection,
            current, prevMonth, yearStart, lastYear,
            mom: calculateChange(current, prevMonth),
            ytd: calculateChange(current, yearStart),
            yoy: calculateChange(current, lastYear),
            periode
        };
    }

    function calculateAllAnalytics(indicatorList) {
        const list = indicatorList || Object.keys(INDICATORS);
        return list.map(ind => calculateIndicatorAnalytics(ind)).filter(x => x !== null);
    }

    // ==========================================
    // FORMATTING
    // ==========================================
    
    function formatCurrency(value) {
        if (value === null || value === undefined) return '-';
        const abs = Math.abs(value);
        const sign = value < 0 ? '-' : '';
        if (abs >= 1e12) return `${sign}Rp ${(abs / 1e12).toFixed(2)} T`;
        if (abs >= 1e9) return `${sign}Rp ${(abs / 1e9).toFixed(2)} M`;
        if (abs >= 1e6) return `${sign}Rp ${(abs / 1e6).toFixed(2)} Jt`;
        return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
    }

    function formatPercent(value, decimals = 2) {
        if (value === null || value === undefined) return '-';
        return `${value.toFixed(decimals)}%`;
    }

    function formatChange(change) {
        if (change === null || change === undefined) return '-';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}%`;
    }

    function formatValue(value, format) {
        if (format === 'currency') return formatCurrency(value);
        if (format === 'percent') return formatPercent(value);
        return value?.toString() || '-';
    }

    // ==========================================
    // TREND ANALYSIS
    // ==========================================
    
    function getTrend(change, goodDirection) {
        if (change === null) return 'neutral';
        if (Math.abs(change) < 0.1) return 'stable';
        if (goodDirection === 'up') return change > 0 ? 'positive' : 'negative';
        if (goodDirection === 'down') return change < 0 ? 'positive' : 'negative';
        if (goodDirection === 'stable') return Math.abs(change) < 5 ? 'positive' : 'warning';
        return 'neutral';
    }

    function getTrendIcon(trend) {
        const icons = { positive: '↑', negative: '↓', stable: '→', warning: '⚠', neutral: '-' };
        return icons[trend] || '-';
    }

    function getTrendClass(trend) {
        return `trend-${trend}`;
    }

    // ==========================================
    // NARRATIVE GENERATION
    // ==========================================
    
    function generateNarrative(analytics) {
        const narratives = [];
        const periode = analyticsData.currentPeriode;
        const [year, month] = periode ? periode.split('-') : ['2025', '01'];
        
        const bulanNames = {
            '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
            '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
            '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
        };
        const bulanName = bulanNames[month] || month;
        
        narratives.push(`📊 **Ringkasan Kinerja Keuangan ${bulanName} ${year}**`);
        narratives.push('');
        
        const aset = analytics.find(a => a.indicator === 'totalAset');
        const dpk = analytics.find(a => a.indicator === 'dpk');
        const kredit = analytics.find(a => a.indicator === 'kredit');
        const laba = analytics.find(a => a.indicator === 'labaBersih');
        const ldr = analytics.find(a => a.indicator === 'ldr');
        const bopo = analytics.find(a => a.indicator === 'bopo');
        const npl = analytics.find(a => a.indicator === 'npl');
        const car = analytics.find(a => a.indicator === 'car');
        const casa = analytics.find(a => a.indicator === 'casa');
        
        if (aset?.current) {
            let text = `**Total Aset** tercatat sebesar ${formatCurrency(aset.current)}`;
            if (aset.mom.percent !== null) {
                text += `, ${aset.mom.percent >= 0 ? 'meningkat' : 'menurun'} ${Math.abs(aset.mom.percent).toFixed(2)}% (MoM)`;
            }
            if (aset.ytd.percent !== null) text += ` dan ${aset.ytd.percent >= 0 ? 'tumbuh' : 'turun'} ${Math.abs(aset.ytd.percent).toFixed(2)}% YTD`;
            narratives.push(text + '.');
        }
        
        if (dpk?.current && kredit?.current) {
            let text = `**DPK** mencapai ${formatCurrency(dpk.current)}`;
            if (dpk.mom.percent !== null) text += ` (${formatChange(dpk.mom.percent)} MoM)`;
            text += `, **Kredit** tersalurkan ${formatCurrency(kredit.current)}`;
            if (kredit.mom.percent !== null) text += ` (${formatChange(kredit.mom.percent)} MoM)`;
            narratives.push(text + '.');
        }
        
        if (laba?.current) {
            let text = `**Laba Bersih** sebesar ${formatCurrency(laba.current)}`;
            if (laba.ytd.percent !== null && laba.ytd.percent > 0) {
                text += `, pertumbuhan ${laba.ytd.percent.toFixed(2)}% YTD`;
            }
            narratives.push(text + '.');
        }
        
        narratives.push('');
        narratives.push('**Rasio Keuangan:**');
        
        if (ldr?.current !== null) {
            let text = `• **LDR** ${formatPercent(ldr.current)}`;
            text += ldr.current >= 80 && ldr.current <= 92 ? ' (ideal 80-92%)' : 
                    ldr.current > 92 ? ' (di atas 92%)' : ' (di bawah 80%)';
            narratives.push(text);
        }
        
        if (bopo?.current !== null) {
            let text = `• **BOPO** ${formatPercent(bopo.current)}`;
            text += bopo.current <= 85 ? ' (efisien)' : bopo.current <= 90 ? ' (perlu perhatian)' : ' (kurang efisien)';
            narratives.push(text);
        }
        
        if (npl?.current !== null) {
            let text = `• **NPL** ${formatPercent(npl.current)}`;
            text += npl.current <= 2 ? ' (sangat sehat)' : npl.current <= 5 ? ' (aman < 5%)' : ' (PERHATIAN > 5%)';
            narratives.push(text);
        }
        
        if (car?.current !== null) {
            let text = `• **CAR** ${formatPercent(car.current)}`;
            text += car.current >= 14 ? ' (sangat kuat)' : car.current >= 12 ? ' (kuat)' : car.current >= 8 ? ' (memadai)' : ' (di bawah 8%)';
            narratives.push(text);
        }
        
        if (casa?.current !== null) {
            let text = `• **CASA** ${formatPercent(casa.current)}`;
            text += casa.current >= 50 ? ' (baik, dana murah dominan)' : ' (perlu peningkatan)';
            narratives.push(text);
        }
        
        narratives.push('');
        
        // Overall assessment
        let score = 0, total = 0;
        if (ldr?.current >= 80 && ldr?.current <= 92) { score++; total++; } else if (ldr?.current) total++;
        if (bopo?.current <= 85) { score++; total++; } else if (bopo?.current) total++;
        if (npl?.current <= 5) { score++; total++; } else if (npl?.current) total++;
        if (car?.current >= 12) { score++; total++; } else if (car?.current) total++;
        if (casa?.current >= 50) { score++; total++; } else if (casa?.current) total++;
        
        const healthPercent = total > 0 ? (score / total) * 100 : 0;
        let conclusion = '**Kesimpulan:** ';
        if (healthPercent >= 80) conclusion += '✅ Kondisi keuangan **SANGAT SEHAT**.';
        else if (healthPercent >= 60) conclusion += '✅ Kondisi keuangan **SEHAT**.';
        else if (healthPercent >= 40) conclusion += '⚠️ Kondisi **CUKUP SEHAT**, perlu perbaikan.';
        else conclusion += '⚠️ Memerlukan **PERHATIAN KHUSUS**.';
        
        narratives.push(conclusion);
        return narratives.join('\n');
    }

    // ==========================================
    // HISTORICAL DATA
    // ==========================================
    
    function getHistoricalData(indicator, periods = 12) {
        const config = INDICATORS[indicator];
        if (!config) return [];
        
        const kodeCabang = analyticsData.currentKodeCabang;
        let periode = analyticsData.currentPeriode;
        const data = [];
        
        for (let i = 0; i < periods; i++) {
            if (!periode) break;
            const value = getValueForPeriode(indicator, periode, kodeCabang);
            const [year, month] = periode.split('-');
            const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            data.unshift({ periode, value, label: `${shortMonths[parseInt(month) - 1]} ${year.slice(-2)}` });
            periode = getPreviousPeriode(periode, 1);
        }
        
        return data;
    }

    // ==========================================
    // INJECT STYLES
    // ==========================================
    
    function injectStyles() {
        if (document.getElementById('analytics-module-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'analytics-module-styles';
        style.textContent = `
            .analytics-table { width: 100%; border-collapse: collapse; font-size: 14px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .analytics-table th { background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; padding: 12px 15px; text-align: left; font-weight: 600; }
            .analytics-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
            .analytics-table tbody tr:hover { background: #f8fafc; }
            .analytics-table .indicator-name { font-weight: 500; color: #1e293b; }
            .analytics-table .current-value { font-weight: 600; color: #1e40af; }
            .trend-positive { color: #059669; background: #d1fae5; }
            .trend-negative { color: #dc2626; background: #fee2e2; }
            .trend-stable { color: #0284c7; background: #e0f2fe; }
            .trend-warning { color: #d97706; background: #fef3c7; }
            .trend-neutral { color: #6b7280; background: #f3f4f6; }
            .analytics-table .change-cell { border-radius: 4px; padding: 6px 10px; font-weight: 500; white-space: nowrap; }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // RENDER TABLE
    // ==========================================
    
    function renderAnalyticsTable(containerId, indicatorList) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const analytics = calculateAllAnalytics(indicatorList);
        
        let html = `<table class="analytics-table"><thead><tr>
            <th>Indikator</th><th>Posisi Bulan Ini</th><th>MoM</th><th>YTD</th><th>YoY</th>
        </tr></thead><tbody>`;
        
        analytics.forEach(a => {
            const momTrend = getTrend(a.mom.percent, a.goodDirection);
            const ytdTrend = getTrend(a.ytd.percent, a.goodDirection);
            const yoyTrend = getTrend(a.yoy.percent, a.goodDirection);
            
            const momChange = a.format === 'percent' 
                ? (a.mom.absolute !== null ? `${a.mom.absolute >= 0 ? '+' : ''}${a.mom.absolute.toFixed(2)}%` : '-')
                : formatChange(a.mom.percent);
            const ytdChange = a.format === 'percent' 
                ? (a.ytd.absolute !== null ? `${a.ytd.absolute >= 0 ? '+' : ''}${a.ytd.absolute.toFixed(2)}%` : '-')
                : formatChange(a.ytd.percent);
            const yoyChange = a.format === 'percent' 
                ? (a.yoy.absolute !== null ? `${a.yoy.absolute >= 0 ? '+' : ''}${a.yoy.absolute.toFixed(2)}%` : '-')
                : formatChange(a.yoy.percent);
            
            html += `<tr>
                <td class="indicator-name">${a.name}</td>
                <td class="current-value">${formatValue(a.current, a.format)}</td>
                <td class="change-cell ${getTrendClass(momTrend)}">${getTrendIcon(momTrend)} ${momChange}</td>
                <td class="change-cell ${getTrendClass(ytdTrend)}">${getTrendIcon(ytdTrend)} ${ytdChange}</td>
                <td class="change-cell ${getTrendClass(yoyTrend)}">${getTrendIcon(yoyTrend)} ${yoyChange}</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.FinancialAnalytics = {
        setData, setFilters, injectStyles,
        calculateIndicatorAnalytics, calculateAllAnalytics, getHistoricalData,
        renderAnalyticsTable, generateNarrative,
        formatCurrency, formatPercent, formatChange, formatValue,
        getTrend, getTrendIcon, getTrendClass,
        getIndicators: () => INDICATORS,
        GROUPS: {
            overview: ['totalAset', 'dpk', 'kredit', 'labaBersih'],
            neraca: ['totalAset', 'kredit', 'pembiayaan', 'dpk', 'giro', 'tabungan', 'deposito', 'modal'],
            ratios: ['ldr', 'bopo', 'casa', 'roa', 'roe', 'nim', 'npl', 'car']
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }

    console.log('✅ Financial Analytics Module loaded!');

})();
