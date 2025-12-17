// ========================================
// DAILY TARGET & REALISASI DATA STRUCTURE
// Bank Sulselbar - Real-time Gap Analysis
// ========================================

/**
 * Generate daily data for last N days
 * @param {number} days 
 * @returns {Array}
 */
function generateDailyData(days = 30) {
    const data = [];
    const today = new Date();
    
    // Base values (dari data konsolidasi)
    const baseValues = {
        asset: 18900, // Miliar Rupiah
        dpk: 16300,
        kredit: 10700,
        laba: 245,
        pendapatan: 1800,
        biaya: 1500
    };

    // Generate target pertumbuhan harian (simulasi)
    const dailyGrowthRate = {
        asset: 0.002,      // 0.2% per hari
        dpk: 0.0018,       // 0.18% per hari
        kredit: 0.0024,    // 0.24% per hari
        laba: 0.004,       // 0.4% per hari
        pendapatan: 0.003, // 0.3% per hari
        biaya: 0.0022      // 0.22% per hari
    };

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dayData = {
            date: date.toISOString().split('T')[0],
            dateObj: date,
            metrics: {}
        };

        // Generate untuk setiap metrik
        Object.keys(baseValues).forEach(metric => {
            const baseValue = baseValues[metric];
            const growthRate = dailyGrowthRate[metric];
            
            // Target: linear growth
            const target = baseValue * (1 + growthRate * (days - i));
            
            // Realisasi: target + random variance (-3% to +3%)
            const variance = (Math.random() - 0.5) * 0.06; // -3% to +3%
            const realisasi = target * (1 + variance);
            
            // Gap
            const gap = realisasi - target;
            const gapPercentage = (gap / target) * 100;

            dayData.metrics[metric] = {
                target: Math.round(target * 100) / 100,
                realisasi: Math.round(realisasi * 100) / 100,
                gap: Math.round(gap * 100) / 100,
                gapPercentage: Math.round(gapPercentage * 100) / 100,
                achievement: Math.round((realisasi / target) * 10000) / 100 // Achievement %
            };
        });

        data.push(dayData);
    }

    return data;
}

/**
 * Get current day summary
 */
function getCurrentDaySummary() {
    const dailyData = generateDailyData(30);
    const today = dailyData[dailyData.length - 1];
    
    return {
        date: today.date,
        metrics: today.metrics,
        status: calculateOverallStatus(today.metrics)
    };
}

/**
 * Calculate overall status
 */
function calculateOverallStatus(metrics) {
    let onTrack = 0;
    let belowTarget = 0;
    let aboveTarget = 0;
    
    Object.values(metrics).forEach(metric => {
        const gap = metric.gapPercentage;
        if (Math.abs(gap) < 2) onTrack++;
        else if (gap < -2) belowTarget++;
        else if (gap > 2) aboveTarget++;
    });

    if (belowTarget > 2) return 'critical';
    if (belowTarget > 0) return 'warning';
    if (aboveTarget > 3) return 'excellent';
    return 'good';
}

/**
 * Get weekly summary
 */
function getWeeklySummary() {
    const dailyData = generateDailyData(30);
    const lastWeek = dailyData.slice(-7);
    
    const summary = {
        asset: { avgGap: 0, trend: 'stable' },
        dpk: { avgGap: 0, trend: 'stable' },
        kredit: { avgGap: 0, trend: 'stable' },
        laba: { avgGap: 0, trend: 'stable' },
        pendapatan: { avgGap: 0, trend: 'stable' },
        biaya: { avgGap: 0, trend: 'stable' }
    };

    Object.keys(summary).forEach(metric => {
        const gaps = lastWeek.map(day => day.metrics[metric].gapPercentage);
        summary[metric].avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        
        // Calculate trend
        const firstHalf = gaps.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const secondHalf = gaps.slice(4).reduce((a, b) => a + b, 0) / 3;
        
        if (secondHalf - firstHalf > 0.5) summary[metric].trend = 'improving';
        else if (secondHalf - firstHalf < -0.5) summary[metric].trend = 'declining';
        else summary[metric].trend = 'stable';
    });

    return summary;
}

/**
 * Get data for specific metric
 */
function getMetricTimeSeries(metricName, days = 30) {
    const dailyData = generateDailyData(days);
    
    return {
        dates: dailyData.map(d => d.date),
        targets: dailyData.map(d => d.metrics[metricName].target),
        realisasi: dailyData.map(d => d.metrics[metricName].realisasi),
        gaps: dailyData.map(d => d.metrics[metricName].gap),
        gapPercentages: dailyData.map(d => d.metrics[metricName].gapPercentage),
        achievements: dailyData.map(d => d.metrics[metricName].achievement)
    };
}

/**
 * Get alerts based on gap thresholds
 */
function getGapAlerts(thresholds = { warning: 2, critical: 5 }) {
    const today = getCurrentDaySummary();
    const alerts = [];

    Object.entries(today.metrics).forEach(([metric, data]) => {
        const absGap = Math.abs(data.gapPercentage);
        
        if (absGap >= thresholds.critical) {
            alerts.push({
                metric: metric,
                severity: 'critical',
                message: `${getMetricLabel(metric)} gap ${data.gapPercentage.toFixed(2)}% (${data.gap.toFixed(2)})`,
                value: data,
                action: 'Immediate action required'
            });
        } else if (absGap >= thresholds.warning) {
            alerts.push({
                metric: metric,
                severity: 'warning',
                message: `${getMetricLabel(metric)} gap ${data.gapPercentage.toFixed(2)}%`,
                value: data,
                action: 'Monitor closely'
            });
        }
    });

    return alerts.sort((a, b) => 
        (b.severity === 'critical' ? 2 : 1) - (a.severity === 'critical' ? 2 : 1)
    );
}

/**
 * Helper: Get metric label
 */
function getMetricLabel(metric) {
    const labels = {
        asset: 'Total Asset',
        dpk: 'DPK Total',
        kredit: 'Total Kredit',
        laba: 'Laba Bersih',
        pendapatan: 'Total Pendapatan',
        biaya: 'Total Biaya'
    };
    return labels[metric] || metric;
}

/**
 * Get forecast dengan gap analysis
 */
function getForecastWithGapAnalysis(metricName, forecastDays = 7) {
    const historical = getMetricTimeSeries(metricName, 30);
    
    // Load forecasting engine (pastikan sudah included)
    if (typeof ForecastingCoordinator === 'undefined') {
        console.warn('Forecasting engine not loaded');
        return null;
    }

    const coordinator = new ForecastingCoordinator();
    
    // Forecast realisasi
    const realisasiForecast = coordinator.getBestForecast(
        historical.realisasi, 
        forecastDays
    );

    // Forecast target (biasanya linear growth)
    const lastTarget = historical.targets[historical.targets.length - 1];
    const avgTargetGrowth = (historical.targets[historical.targets.length - 1] - 
                             historical.targets[0]) / historical.targets.length;
    
    const targetForecast = Array(forecastDays).fill(0).map((_, i) => 
        lastTarget + (avgTargetGrowth * (i + 1))
    );

    // Calculate forecasted gaps
    const forecastedGaps = realisasiForecast.ensemble.map((real, i) => ({
        day: i + 1,
        target: targetForecast[i],
        forecast: real,
        gap: real - targetForecast[i],
        gapPercentage: ((real - targetForecast[i]) / targetForecast[i]) * 100
    }));

    return {
        historical: historical,
        forecast: {
            realisasi: realisasiForecast.ensemble,
            target: targetForecast,
            gaps: forecastedGaps,
            confidence: realisasiForecast.confidence
        },
        analysis: {
            expectedStatus: forecastedGaps[forecastedGaps.length - 1].gapPercentage > 0 
                ? 'above-target' : 'below-target',
            riskLevel: Math.abs(forecastedGaps[forecastedGaps.length - 1].gapPercentage) > 5 
                ? 'high' : 'low'
        }
    };
}

/**
 * Export data untuk chart visualization
 */
function getChartData(metricName, days = 30) {
    const data = getMetricTimeSeries(metricName, days);
    
    return {
        categories: data.dates.map(d => {
            const date = new Date(d);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        series: [
            {
                name: 'Target',
                data: data.targets,
                color: '#3B82F6'
            },
            {
                name: 'Realisasi',
                data: data.realisasi,
                color: '#10B981'
            }
        ],
        gaps: {
            data: data.gaps,
            percentages: data.gapPercentages
        }
    };
}

/**
 * Save current day realisasi (untuk real implementation)
 */
function saveRealisasi(metricName, value) {
    const storageKey = `daily_realisasi_${new Date().toISOString().split('T')[0]}`;
    
    try {
        let data = JSON.parse(localStorage.getItem(storageKey) || '{}');
        data[metricName] = {
            value: value,
            timestamp: new Date().toISOString(),
            savedBy: 'system'
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving realisasi:', error);
        return false;
    }
}

/**
 * Get real data from localStorage (if available)
 */
function getRealRealisasi(date) {
    const storageKey = `daily_realisasi_${date}`;
    try {
        return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
        return {};
    }
}

// ========================================
// BRANCH-SPECIFIC DATA (untuk monitoring per cabang)
// ========================================

/**
 * Get data per cabang
 */
function getBranchDailyData(branchCode, days = 30) {
    // Simulasi data per cabang dengan proporsi dari total
    const branchProportion = 0.1; // 10% dari total (sesuaikan per cabang)
    
    const totalData = generateDailyData(days);
    
    return totalData.map(day => ({
        ...day,
        branchCode: branchCode,
        metrics: Object.fromEntries(
            Object.entries(day.metrics).map(([key, value]) => [
                key,
                {
                    ...value,
                    target: value.target * branchProportion,
                    realisasi: value.realisasi * branchProportion,
                    gap: value.gap * branchProportion
                }
            ])
        )
    }));
}

/**
 * Compare multiple branches
 */
function compareBranches(branchCodes, metricName, days = 7) {
    const comparison = branchCodes.map(code => {
        const data = getBranchDailyData(code, days);
        const latest = data[data.length - 1];
        
        return {
            branchCode: code,
            metric: metricName,
            achievement: latest.metrics[metricName].achievement,
            gap: latest.metrics[metricName].gap,
            gapPercentage: latest.metrics[metricName].gapPercentage,
            trend: calculateTrend(data.map(d => d.metrics[metricName].gapPercentage))
        };
    });

    return comparison.sort((a, b) => b.achievement - a.achievement);
}

function calculateTrend(values) {
    if (values.length < 2) return 'stable';
    const first = values.slice(0, Math.floor(values.length / 2))
        .reduce((a, b) => a + b, 0) / Math.floor(values.length / 2);
    const second = values.slice(Math.floor(values.length / 2))
        .reduce((a, b) => a + b, 0) / (values.length - Math.floor(values.length / 2));
    return second > first ? 'improving' : (second < first ? 'declining' : 'stable');
}

// ========================================
// EXPORT
// ========================================

if (typeof window !== 'undefined') {
    window.DailyData = {
        generateDailyData,
        getCurrentDaySummary,
        getWeeklySummary,
        getMetricTimeSeries,
        getGapAlerts,
        getForecastWithGapAnalysis,
        getChartData,
        saveRealisasi,
        getRealRealisasi,
        getBranchDailyData,
        compareBranches,
        getMetricLabel
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateDailyData,
        getCurrentDaySummary,
        getWeeklySummary,
        getMetricTimeSeries,
        getGapAlerts,
        getForecastWithGapAnalysis,
        getChartData,
        saveRealisasi,
        getRealRealisasi,
        getBranchDailyData,
        compareBranches
    };
}
