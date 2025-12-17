/**
 * Analytics Section Handler
 * =========================
 * Handles the Financial Analytics tab
 */

(function() {
    'use strict';

    console.log('📈 Analytics Section Handler loading...');

    // ==========================================
    // INJECT STYLES
    // ==========================================
    
    function injectStyles() {
        if (document.getElementById('analytics-section-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'analytics-section-styles';
        style.textContent = `
            .analytics-summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px; }
            .summary-stat-card { padding: 20px; border-radius: 12px; color: white; }
            .analytics-main-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; margin-bottom: 25px; }
            @media (max-width: 1200px) { .analytics-main-grid { grid-template-columns: 1fr; } }
            .ratio-analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
            .ratio-analytics-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .ratio-analytics-card .ratio-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .ratio-analytics-card .ratio-name { font-size: 14px; font-weight: 600; color: #64748b; }
            .ratio-analytics-card .ratio-value { font-size: 28px; font-weight: 700; color: #1e293b; }
            .ratio-analytics-card .ratio-changes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0; }
            .ratio-change-item { text-align: center; }
            .ratio-change-item .change-label { font-size: 11px; color: #94a3b8; margin-bottom: 4px; }
            .ratio-change-item .change-value { font-size: 14px; font-weight: 600; }
            .ratio-change-item .change-value.positive { color: #059669; }
            .ratio-change-item .change-value.negative { color: #dc2626; }
            .ratio-change-item .change-value.neutral { color: #64748b; }
            .ratio-status { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
            .ratio-status.healthy { background: #d1fae5; color: #059669; }
            .ratio-status.warning { background: #fef3c7; color: #d97706; }
            .ratio-status.danger { background: #fee2e2; color: #dc2626; }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // UPDATE SUMMARY CARDS
    // ==========================================
    
    function updateSummaryCards() {
        if (!window.FinancialAnalytics) return;
        
        const FA = window.FinancialAnalytics;
        const mapping = {
            totalAset: { value: 'analyticsTotalAset', mom: 'analyticsTotalAsetMom' },
            dpk: { value: 'analyticsDpk', mom: 'analyticsDpkMom' },
            kredit: { value: 'analyticsKredit', mom: 'analyticsKreditMom' },
            labaBersih: { value: 'analyticsLaba', mom: 'analyticsLabaMom' }
        };
        
        Object.entries(mapping).forEach(([ind, ids]) => {
            const analytics = FA.calculateIndicatorAnalytics(ind);
            if (!analytics) return;
            
            const valueEl = document.getElementById(ids.value);
            const momEl = document.getElementById(ids.mom);
            
            if (valueEl) valueEl.textContent = FA.formatValue(analytics.current, analytics.format);
            if (momEl && analytics.mom.percent !== null) {
                const trend = FA.getTrend(analytics.mom.percent, analytics.goodDirection);
                const arrow = trend === 'positive' ? '↑' : trend === 'negative' ? '↓' : '→';
                momEl.textContent = `MoM: ${arrow} ${FA.formatChange(analytics.mom.percent)}`;
            }
        });
    }

    // ==========================================
    // UPDATE ANALYTICS TABLE
    // ==========================================
    
    function updateAnalyticsTable(viewType) {
        if (!window.FinancialAnalytics) return;
        
        const FA = window.FinancialAnalytics;
        const groups = FA.GROUPS;
        
        let indicatorList;
        switch (viewType) {
            case 'overview': indicatorList = [...groups.overview, ...groups.ratios.slice(0, 4)]; break;
            case 'neraca': indicatorList = groups.neraca; break;
            case 'ratios': indicatorList = groups.ratios; break;
            default: indicatorList = groups.overview;
        }
        
        FA.renderAnalyticsTable('analyticsTableContainer', indicatorList);
    }

    // ==========================================
    // UPDATE NARRATIVE
    // ==========================================
    
    function updateNarrative() {
        if (!window.FinancialAnalytics) return;
        
        const FA = window.FinancialAnalytics;
        const container = document.getElementById('analyticsNarrativeContainer');
        if (!container) return;
        
        const analytics = FA.calculateAllAnalytics([...FA.GROUPS.overview, ...FA.GROUPS.ratios]);
        const narrative = FA.generateNarrative(analytics);
        
        let htmlNarrative = narrative
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        
        container.innerHTML = `<div style="padding: 10px;">${htmlNarrative}</div>`;
    }

    // ==========================================
    // UPDATE TREND CHART
    // ==========================================
    
    function updateTrendChart(indicator) {
        if (!window.FinancialAnalytics || !window.ApexCharts) {
            console.log('⚠️ ApexCharts or FinancialAnalytics not available');
            return;
        }
        
        const FA = window.FinancialAnalytics;
        const historical = FA.getHistoricalData(indicator, 12);
        const config = FA.getIndicators()[indicator];
        
        const container = document.getElementById('analyticsTrendChart');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (historical.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#64748b; padding:40px;">Data tidak tersedia</p>';
            return;
        }
        
        const chartData = historical.map(h => ({
            x: h.label,
            y: config.format === 'percent' ? h.value : (h.value ? h.value / 1e12 : 0)
        }));
        
        const options = {
            series: [{ name: config.name, data: chartData }],
            chart: { type: 'area', height: 280, toolbar: { show: false }, animations: { enabled: true } },
            stroke: { curve: 'smooth', width: 3 },
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] } },
            colors: ['#1e40af'],
            xaxis: { categories: historical.map(h => h.label), labels: { style: { fontSize: '11px' } } },
            yaxis: {
                labels: {
                    formatter: function(val) {
                        if (config.format === 'percent') return val ? val.toFixed(1) + '%' : '0%';
                        return 'Rp ' + (val ? val.toFixed(2) : '0') + ' T';
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        if (config.format === 'percent') return val ? val.toFixed(2) + '%' : '0%';
                        return 'Rp ' + (val ? val.toFixed(2) : '0') + ' Triliun';
                    }
                }
            },
            dataLabels: { enabled: false },
            markers: { size: 4, hover: { size: 6 } }
        };
        
        try {
            const chart = new ApexCharts(container, options);
            chart.render();
        } catch (e) {
            console.error('Chart error:', e);
        }
    }

    // ==========================================
    // UPDATE RATIO CARDS
    // ==========================================
    
    function updateRatioCards() {
        if (!window.FinancialAnalytics) return;
        
        const FA = window.FinancialAnalytics;
        const container = document.getElementById('analyticsRatioGrid');
        if (!container) return;
        
        const ratios = FA.GROUPS.ratios;
        let html = '';
        
        ratios.forEach(ratio => {
            const analytics = FA.calculateIndicatorAnalytics(ratio);
            if (!analytics || analytics.current === null) return;
            
            const momTrend = FA.getTrend(analytics.mom.percent, analytics.goodDirection);
            const ytdTrend = FA.getTrend(analytics.ytd.percent, analytics.goodDirection);
            const yoyTrend = FA.getTrend(analytics.yoy.percent, analytics.goodDirection);
            
            let status = 'healthy', statusText = 'Sehat';
            if (ratio === 'npl' && analytics.current > 5) { status = 'danger'; statusText = 'Perhatian'; }
            else if (ratio === 'npl' && analytics.current > 3) { status = 'warning'; statusText = 'Waspada'; }
            else if (ratio === 'bopo' && analytics.current > 90) { status = 'danger'; statusText = 'Tidak Efisien'; }
            else if (ratio === 'bopo' && analytics.current > 85) { status = 'warning'; statusText = 'Waspada'; }
            else if (ratio === 'ldr' && (analytics.current > 110 || analytics.current < 78)) { status = 'warning'; statusText = 'Di Luar Rentang'; }
            else if (ratio === 'car' && analytics.current < 12) { status = 'warning'; statusText = 'Minimum'; }
            
            const formatRatioChange = (a, type) => {
                if (analytics.format === 'percent') {
                    return a.absolute !== null ? `${a.absolute >= 0 ? '+' : ''}${a.absolute.toFixed(2)}%` : '-';
                }
                return FA.formatChange(a.percent);
            };
            
            html += `
                <div class="ratio-analytics-card">
                    <div class="ratio-header">
                        <span class="ratio-name">${analytics.name}</span>
                        <span class="ratio-status ${status}">
                            <i class="fas fa-${status === 'healthy' ? 'check-circle' : status === 'warning' ? 'exclamation-circle' : 'times-circle'}"></i>
                            ${statusText}
                        </span>
                    </div>
                    <div class="ratio-value">${FA.formatPercent(analytics.current)}</div>
                    <div class="ratio-changes">
                        <div class="ratio-change-item">
                            <div class="change-label">MoM</div>
                            <div class="change-value ${momTrend === 'positive' ? 'positive' : momTrend === 'negative' ? 'negative' : 'neutral'}">${formatRatioChange(analytics.mom)}</div>
                        </div>
                        <div class="ratio-change-item">
                            <div class="change-label">YTD</div>
                            <div class="change-value ${ytdTrend === 'positive' ? 'positive' : ytdTrend === 'negative' ? 'negative' : 'neutral'}">${formatRatioChange(analytics.ytd)}</div>
                        </div>
                        <div class="ratio-change-item">
                            <div class="change-label">YoY</div>
                            <div class="change-value ${yoyTrend === 'positive' ? 'positive' : yoyTrend === 'negative' ? 'negative' : 'neutral'}">${formatRatioChange(analytics.yoy)}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // ==========================================
    // MAIN UPDATE FUNCTION
    // ==========================================
    
    function updateAllAnalytics() {
        console.log('📊 Updating all analytics...');
        
        if (window.DashboardFirebase && window.FinancialAnalytics) {
            const data = window.DashboardFirebase.getData();
            const filters = window.DashboardFirebase.getFilters();
            
            window.FinancialAnalytics.setData(data.neraca, data.labarugi);
            window.FinancialAnalytics.setFilters(filters.periode, filters.cabang || (
                filters.tipe === 'konsolidasi' ? 'ALL' :
                filters.tipe === 'konvensional' ? 'KON' : 'SYR'
            ));
        }
        
        const viewType = document.getElementById('analyticsViewType')?.value || 'overview';
        const chartIndicator = document.getElementById('chartIndicatorSelect')?.value || 'totalAset';
        
        updateSummaryCards();
        updateAnalyticsTable(viewType);
        updateNarrative();
        updateTrendChart(chartIndicator);
        updateRatioCards();
        
        console.log('✅ Analytics updated');
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    function init() {
        console.log('📈 Initializing Analytics Section...');
        
        injectStyles();
        
        // Setup event listeners
        const viewSelect = document.getElementById('analyticsViewType');
        if (viewSelect) viewSelect.addEventListener('change', () => updateAnalyticsTable(viewSelect.value));
        
        const chartSelect = document.getElementById('chartIndicatorSelect');
        if (chartSelect) chartSelect.addEventListener('change', () => updateTrendChart(chartSelect.value));
        
        const refreshBtn = document.getElementById('btnRefreshAnalytics');
        if (refreshBtn) refreshBtn.addEventListener('click', updateAllAnalytics);
        
        const exportBtn = document.getElementById('btnExportAnalytics');
        if (exportBtn) exportBtn.addEventListener('click', exportAnalytics);
        
        // Initial update after data loads
        setTimeout(() => {
            if (window.DashboardFirebase && window.FinancialAnalytics) {
                updateAllAnalytics();
            }
        }, 2500);
        
        console.log('✅ Analytics Section initialized');
    }

    // ==========================================
    // EXPORT FUNCTION
    // ==========================================
    
    function exportAnalytics() {
        if (!window.FinancialAnalytics) return;
        
        const FA = window.FinancialAnalytics;
        const analytics = FA.calculateAllAnalytics();
        
        let csv = 'Indikator,Posisi Bulan Ini,MoM (%),YTD (%),YoY (%)\n';
        
        analytics.forEach(a => {
            const current = a.format === 'currency' ? a.current?.toLocaleString() || '' : a.current?.toFixed(2) + '%' || '';
            const mom = a.mom.percent?.toFixed(2) || '';
            const ytd = a.ytd.percent?.toFixed(2) || '';
            const yoy = a.yoy.percent?.toFixed(2) || '';
            csv += `"${a.name}","${current}","${mom}","${ytd}","${yoy}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analytics_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    }

    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.AnalyticsSection = { init, update: updateAllAnalytics };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }

})();
