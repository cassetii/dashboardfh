// ========================================
// FORECASTING ENGINE
// Exponential Smoothing & Simple ARIMA Implementation
// Optimized for Banking Dashboard
// ========================================

/**
 * EXPONENTIAL SMOOTHING (Holt-Winters)
 * Lebih cepat dan cocok untuk real-time forecasting
 */
class ExponentialSmoothing {
    constructor(alpha = 0.3, beta = 0.1, gamma = 0.1) {
        this.alpha = alpha; // Level smoothing
        this.beta = beta;   // Trend smoothing
        this.gamma = gamma; // Seasonal smoothing
    }

    /**
     * Forecast next N values
     * @param {Array<number>} data - Historical data
     * @param {number} periods - Number of periods to forecast
     * @returns {Object} - {forecast, confidence}
     */
    forecast(data, periods = 7) {
        if (data.length < 3) {
            throw new Error('Minimal 3 data points diperlukan');
        }

        const n = data.length;
        
        // Initialize
        let level = data[0];
        let trend = (data[n-1] - data[0]) / (n-1);
        
        // Smoothing
        const smoothed = [];
        for (let i = 0; i < n; i++) {
            const prevLevel = level;
            level = this.alpha * data[i] + (1 - this.alpha) * (level + trend);
            trend = this.beta * (level - prevLevel) + (1 - this.beta) * trend;
            smoothed.push(level);
        }

        // Forecast
        const forecast = [];
        let currentLevel = level;
        let currentTrend = trend;
        
        for (let i = 0; i < periods; i++) {
            const forecastValue = currentLevel + currentTrend * (i + 1);
            forecast.push(forecastValue);
        }

        // Calculate confidence intervals
        const errors = data.map((val, idx) => Math.abs(val - smoothed[idx]));
        const mae = errors.reduce((sum, err) => sum + err, 0) / errors.length;
        const confidence = forecast.map(val => ({
            forecast: val,
            lower: val - (1.96 * mae),
            upper: val + (1.96 * mae),
            mae: mae
        }));

        return {
            forecast: forecast,
            confidence: confidence,
            accuracy: {
                mae: mae,
                mape: this.calculateMAPE(data, smoothed)
            }
        };
    }

    calculateMAPE(actual, predicted) {
        let sum = 0;
        let count = 0;
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== 0) {
                sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
                count++;
            }
        }
        return count > 0 ? (sum / count) * 100 : 0;
    }
}

/**
 * SIMPLE MOVING AVERAGE
 * Untuk quick comparison
 */
class SimpleMovingAverage {
    /**
     * Calculate SMA
     * @param {Array<number>} data 
     * @param {number} window 
     * @returns {Array<number>}
     */
    static calculate(data, window = 3) {
        const sma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < window - 1) {
                sma.push(null);
            } else {
                const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
                sma.push(sum / window);
            }
        }
        return sma;
    }

    /**
     * Forecast using SMA
     */
    static forecast(data, window = 3, periods = 7) {
        const lastValues = data.slice(-window);
        const avgValue = lastValues.reduce((a, b) => a + b, 0) / window;
        
        const forecast = Array(periods).fill(avgValue);
        
        return {
            forecast: forecast,
            method: 'SMA',
            window: window
        };
    }
}

/**
 * ARIMA IMPLEMENTATION (Simplified)
 * Auto-regressive Integrated Moving Average
 */
class SimpleARIMA {
    constructor(p = 1, d = 1, q = 1) {
        this.p = p; // AR order
        this.d = d; // Differencing order
        this.q = q; // MA order
    }

    /**
     * Difference the series
     */
    difference(data, order = 1) {
        let diff = [...data];
        for (let i = 0; i < order; i++) {
            const newDiff = [];
            for (let j = 1; j < diff.length; j++) {
                newDiff.push(diff[j] - diff[j-1]);
            }
            diff = newDiff;
        }
        return diff;
    }

    /**
     * Reverse differencing
     */
    inverseDifference(data, original, order = 1) {
        let result = [...data];
        for (let i = 0; i < order; i++) {
            const newResult = [original[original.length - 1]];
            for (let j = 0; j < result.length; j++) {
                newResult.push(newResult[newResult.length - 1] + result[j]);
            }
            result = newResult.slice(1);
        }
        return result;
    }

    /**
     * Fit AR model
     */
    fitAR(data, order) {
        // Simplified AR using least squares
        const n = data.length;
        const y = data.slice(order);
        
        // Create lag matrix
        const X = [];
        for (let i = order; i < n; i++) {
            const row = [];
            for (let j = 1; j <= order; j++) {
                row.push(data[i - j]);
            }
            X.push(row);
        }

        // Simple coefficient estimation (simplified)
        const coeffs = Array(order).fill(0);
        for (let j = 0; j < order; j++) {
            let sum = 0;
            for (let i = 0; i < y.length; i++) {
                sum += X[i][j] * y[i];
            }
            coeffs[j] = sum / y.length;
        }

        return coeffs;
    }

    /**
     * Forecast using ARIMA
     */
    forecast(data, periods = 7) {
        if (data.length < Math.max(this.p, this.q) + this.d + 5) {
            throw new Error('Data terlalu sedikit untuk ARIMA');
        }

        // Differencing
        const diffData = this.d > 0 ? this.difference(data, this.d) : [...data];
        
        // Fit AR model
        const arCoeffs = this.fitAR(diffData, this.p);
        
        // Forecast differenced series
        const forecast = [];
        let current = [...diffData];
        
        for (let i = 0; i < periods; i++) {
            let nextValue = 0;
            for (let j = 0; j < this.p; j++) {
                if (current.length - 1 - j >= 0) {
                    nextValue += arCoeffs[j] * current[current.length - 1 - j];
                }
            }
            forecast.push(nextValue);
            current.push(nextValue);
        }

        // Reverse differencing
        const finalForecast = this.d > 0 
            ? this.inverseDifference(forecast, data, this.d)
            : forecast;

        return {
            forecast: finalForecast,
            method: `ARIMA(${this.p},${this.d},${this.q})`,
            coefficients: arCoeffs
        };
    }
}

/**
 * GAP ANALYSIS ENGINE
 * Analisis gap antara target dan realisasi
 */
class GapAnalyzer {
    /**
     * Analyze gap between target and actual
     * @param {number} target 
     * @param {number} actual 
     * @returns {Object}
     */
    static analyzeGap(target, actual) {
        const gap = actual - target;
        const gapPercentage = target !== 0 ? (gap / target) * 100 : 0;
        
        let status = 'on-track';
        let severity = 'low';
        let recommendation = '';

        if (Math.abs(gapPercentage) < 2) {
            status = 'on-track';
            severity = 'low';
            recommendation = 'Performance sesuai target. Pertahankan momentum.';
        } else if (gapPercentage >= 2 && gapPercentage < 5) {
            status = 'above-target';
            severity = 'low';
            recommendation = 'Performance di atas target. Excellent!';
        } else if (gapPercentage >= 5) {
            status = 'above-target';
            severity = 'medium';
            recommendation = 'Performance jauh di atas target. Review target setting.';
        } else if (gapPercentage <= -2 && gapPercentage > -5) {
            status = 'below-target';
            severity = 'medium';
            recommendation = 'Sedikit di bawah target. Perlu perhatian.';
        } else if (gapPercentage <= -5) {
            status = 'below-target';
            severity = 'high';
            recommendation = 'Signifikan di bawah target. Action plan diperlukan!';
        }

        return {
            gap: gap,
            gapPercentage: gapPercentage,
            status: status,
            severity: severity,
            recommendation: recommendation,
            target: target,
            actual: actual
        };
    }

    /**
     * Analyze time series gap
     * @param {Array} targets 
     * @param {Array} actuals 
     */
    static analyzeTimeSeries(targets, actuals) {
        const gaps = targets.map((target, idx) => ({
            period: idx,
            target: target,
            actual: actuals[idx] || 0,
            gap: (actuals[idx] || 0) - target,
            gapPercentage: target !== 0 ? ((actuals[idx] || 0 - target) / target * 100) : 0
        }));

        const avgGap = gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length;
        const avgGapPercentage = gaps.reduce((sum, g) => sum + g.gapPercentage, 0) / gaps.length;

        const trend = this.calculateTrend(gaps.map(g => g.gap));

        return {
            gaps: gaps,
            summary: {
                averageGap: avgGap,
                averageGapPercentage: avgGapPercentage,
                trend: trend,
                consistency: this.calculateConsistency(gaps)
            }
        };
    }

    static calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const first = values.slice(0, Math.floor(values.length / 2)).reduce((a, b) => a + b, 0);
        const second = values.slice(Math.floor(values.length / 2)).reduce((a, b) => a + b, 0);
        
        const diff = second - first;
        
        if (Math.abs(diff) < values.length * 0.1) return 'stable';
        return diff > 0 ? 'improving' : 'declining';
    }

    static calculateConsistency(gaps) {
        const gapPercentages = gaps.map(g => g.gapPercentage);
        const variance = this.calculateVariance(gapPercentages);
        
        if (variance < 2) return 'very-consistent';
        if (variance < 5) return 'consistent';
        if (variance < 10) return 'moderate';
        return 'volatile';
    }

    static calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }
}

/**
 * FORECASTING COORDINATOR
 * Mengelola berbagai metode forecasting
 */
class ForecastingCoordinator {
    constructor() {
        this.expSmoothing = new ExponentialSmoothing();
        this.arima = new SimpleARIMA(1, 1, 1);
    }

    /**
     * Get best forecast using ensemble method
     * @param {Array<number>} data 
     * @param {number} periods 
     * @returns {Object}
     */
    getBestForecast(data, periods = 7) {
        try {
            // Try multiple methods
            const methods = [];

            // Method 1: Exponential Smoothing
            try {
                const esResult = this.expSmoothing.forecast(data, periods);
                methods.push({
                    name: 'Exponential Smoothing',
                    result: esResult,
                    weight: 0.5
                });
            } catch (e) {
                console.warn('ES failed:', e);
            }

            // Method 2: SMA
            try {
                const smaResult = SimpleMovingAverage.forecast(data, 5, periods);
                methods.push({
                    name: 'Simple Moving Average',
                    result: smaResult,
                    weight: 0.3
                });
            } catch (e) {
                console.warn('SMA failed:', e);
            }

            // Method 3: ARIMA (if enough data)
            if (data.length >= 10) {
                try {
                    const arimaResult = this.arima.forecast(data, periods);
                    methods.push({
                        name: 'ARIMA',
                        result: arimaResult,
                        weight: 0.2
                    });
                } catch (e) {
                    console.warn('ARIMA failed:', e);
                }
            }

            // Ensemble forecast (weighted average)
            const ensemble = this.ensembleForecast(methods, periods);

            return {
                primary: methods[0]?.result || { forecast: [] },
                ensemble: ensemble,
                methods: methods.map(m => ({
                    name: m.name,
                    forecast: m.result.forecast
                })),
                confidence: methods[0]?.result.confidence || []
            };

        } catch (error) {
            console.error('Forecasting error:', error);
            // Fallback to last value
            return {
                primary: {
                    forecast: Array(periods).fill(data[data.length - 1])
                },
                ensemble: Array(periods).fill(data[data.length - 1]),
                methods: [],
                confidence: []
            };
        }
    }

    /**
     * Ensemble forecast (weighted average)
     */
    ensembleForecast(methods, periods) {
        const ensemble = Array(periods).fill(0);
        
        methods.forEach(method => {
            const forecast = method.result.forecast || [];
            for (let i = 0; i < periods && i < forecast.length; i++) {
                ensemble[i] += forecast[i] * method.weight;
            }
        });

        return ensemble;
    }
}

// Export untuk use di aplikasi
if (typeof window !== 'undefined') {
    window.ExponentialSmoothing = ExponentialSmoothing;
    window.SimpleMovingAverage = SimpleMovingAverage;
    window.SimpleARIMA = SimpleARIMA;
    window.GapAnalyzer = GapAnalyzer;
    window.ForecastingCoordinator = ForecastingCoordinator;
}

// Export untuk Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ExponentialSmoothing,
        SimpleMovingAverage,
        SimpleARIMA,
        GapAnalyzer,
        ForecastingCoordinator
    };
}
