// ========================================
// KONVEN VS SYARIAH HANDLER - FIREBASE VERSION
// Semua data diambil dari Firebase Firestore
// TIDAK ADA DATA HARDCODE
// ========================================

// Data Konven vs Syariah - Akan diisi dari Firebase
const KONVEN_SYARIAH_DATA = {
    // Status
    isLoaded: false,
    currentPeriod: null,
    
    // Perbandingan utama
    perbandingan: {
        asset: { total: 0, konven: 0, syariah: 0, konvenPct: 0, syariahPct: 0 },
        kredit: { total: 0, konven: 0, syariah: 0, konvenPct: 0, syariahPct: 0 },
        dpk: { total: 0, konven: 0, syariah: 0, konvenPct: 0, syariahPct: 0 },
        laba: { total: 0, konven: 0, syariah: 0, konvenPct: 0, syariahPct: 0, unit: 'M' }
    },
    
    // Detail Pendapatan
    pendapatan: {
        konven: {
            bunga: { value: 0, change: 0, label: 'Pendapatan Bunga' },
            operasional: { value: 0, change: 0, label: 'Pendapatan Operasional' },
            nonOperasional: { value: 0, change: 0, label: 'Pendapatan Non-Operasional' },
            total: 0
        },
        syariah: {
            imbalHasil: { value: 0, change: 0, label: 'Pendapatan Imbal Hasil' },
            operasional: { value: 0, change: 0, label: 'Pendapatan Operasional' },
            nonOperasional: { value: 0, change: 0, label: 'Pendapatan Non-Operasional' },
            total: 0
        }
    },
    
    // Detail Biaya
    biaya: {
        konven: {
            bunga: { value: 0, change: 0, label: 'Beban Bunga' },
            operasional: { value: 0, change: 0, label: 'Beban Operasional' },
            nonOperasional: { value: 0, change: 0, label: 'Beban Non-Operasional' },
            total: 0
        },
        syariah: {
            bagiHasil: { value: 0, change: 0, label: 'Beban Bagi Hasil' },
            operasional: { value: 0, change: 0, label: 'Beban Operasional' },
            nonOperasional: { value: 0, change: 0, label: 'Beban Non-Operasional' },
            total: 0
        }
    },
    
    // Ringkasan Laba Rugi
    ringkasan: {
        konven: {
            pendapatanBungaBersih: 0,
            pendapatanOperasional: 0,
            bebanOperasional: 0,
            labaOperasional: 0,
            pendapatanNonOps: 0,
            bebanNonOps: 0,
            labaSebelumPajak: 0,
            pajak: 0,
            labaBersih: 0
        },
        syariah: {
            pendapatanImbalHasilBersih: 0,
            pendapatanOperasional: 0,
            bebanOperasional: 0,
            labaOperasional: 0,
            pendapatanNonOps: 0,
            bebanNonOps: 0,
            labaSebelumPajak: 0,
            pajak: 0,
            labaBersih: 0
        }
    },
    
    // DPK Breakdown
    dpkBreakdown: {
        konven: { giro: 0, tabungan: 0, deposito: 0, total: 0 },
        syariah: { giro: 0, tabungan: 0, deposito: 0, total: 0 }
    }
};

// Chart instances
let pieCharts = {};
let konvenSyariahInitialized = false;

// ========================================
// KONVEN SYARIAH DATA LOADER
// ========================================

const KonvenSyariahLoader = {
    
    /**
     * Initialize dan load data dari Firebase
     */
    async init(periode = null) {
        console.log('⚖️ KonvenSyariahLoader initializing...');
        
        if (typeof FirebaseDataService === 'undefined') {
            console.error('❌ FirebaseDataService not found!');
            return false;
        }
        
        await FirebaseDataService.init();
        
        // Get periode
        if (!periode) {
            const periods = await FirebaseDataService.getAvailablePeriods();
            periode = periods[0];
        }
        
        await this.loadData(periode);
        
        KONVEN_SYARIAH_DATA.isLoaded = true;
        console.log('✅ KonvenSyariahLoader ready');
        
        return true;
    },
    
    /**
     * Load data perbandingan dari Firebase
     */
    async loadData(periode) {
        console.log(`📊 Loading Konven vs Syariah data for ${periode}...`);
        
        try {
            // Get data dari FirebaseDataService
            const comparison = await FirebaseDataService.getKonvenVsSyariah(periode);
            
            if (!comparison) {
                console.warn('No comparison data found');
                return;
            }
            
            KONVEN_SYARIAH_DATA.currentPeriod = periode;
            
            // Helper convert
            const toT = (val) => parseFloat((val / 1e12).toFixed(2));
            const toM = (val) => parseFloat((val / 1e9).toFixed(2));
            
            // Update perbandingan
            KONVEN_SYARIAH_DATA.perbandingan = {
                asset: {
                    total: toT(comparison.konsolidasi.totalAset),
                    konven: toT(comparison.konvensional.totalAset),
                    syariah: toT(comparison.syariah.totalAset),
                    konvenPct: parseFloat(comparison.perbandingan.asset.konvenPct.toFixed(1)),
                    syariahPct: parseFloat(comparison.perbandingan.asset.syariahPct.toFixed(1))
                },
                kredit: {
                    total: toT(comparison.konsolidasi.kredit),
                    konven: toT(comparison.konvensional.kredit),
                    syariah: toT(comparison.syariah.kredit),
                    konvenPct: parseFloat(comparison.perbandingan.kredit.konvenPct.toFixed(1)),
                    syariahPct: parseFloat(comparison.perbandingan.kredit.syariahPct.toFixed(1))
                },
                dpk: {
                    total: toT(comparison.konsolidasi.totalDPK),
                    konven: toT(comparison.konvensional.totalDPK),
                    syariah: toT(comparison.syariah.totalDPK),
                    konvenPct: parseFloat(comparison.perbandingan.dpk.konvenPct.toFixed(1)),
                    syariahPct: parseFloat(comparison.perbandingan.dpk.syariahPct.toFixed(1))
                },
                laba: {
                    total: toM(comparison.konsolidasi.labaBersih),
                    konven: toM(comparison.konvensional.labaBersih),
                    syariah: toM(comparison.syariah.labaBersih),
                    konvenPct: parseFloat(comparison.perbandingan.laba.konvenPct.toFixed(1)),
                    syariahPct: parseFloat(comparison.perbandingan.laba.syariahPct.toFixed(1)),
                    unit: 'M'
                }
            };
            
            // Update pendapatan
            KONVEN_SYARIAH_DATA.pendapatan = {
                konven: {
                    bunga: { 
                        value: toM(comparison.konvensional.pendapatanBunga), 
                        change: 0, 
                        label: 'Pendapatan Bunga' 
                    },
                    operasional: { 
                        value: toM(comparison.konvensional.pendapatanOperasional), 
                        change: 0, 
                        label: 'Pendapatan Operasional' 
                    },
                    nonOperasional: { value: 0, change: 0, label: 'Pendapatan Non-Operasional' },
                    total: toM(comparison.konvensional.pendapatanBunga + comparison.konvensional.pendapatanOperasional)
                },
                syariah: {
                    imbalHasil: { 
                        value: toM(comparison.syariah.pendapatanBunga), 
                        change: 0, 
                        label: 'Pendapatan Imbal Hasil' 
                    },
                    operasional: { 
                        value: toM(comparison.syariah.pendapatanOperasional), 
                        change: 0, 
                        label: 'Pendapatan Operasional' 
                    },
                    nonOperasional: { value: 0, change: 0, label: 'Pendapatan Non-Operasional' },
                    total: toM(comparison.syariah.pendapatanBunga + comparison.syariah.pendapatanOperasional)
                }
            };
            
            // Update biaya
            KONVEN_SYARIAH_DATA.biaya = {
                konven: {
                    bunga: { 
                        value: toM(comparison.konvensional.bebanBunga), 
                        change: 0, 
                        label: 'Beban Bunga' 
                    },
                    operasional: { 
                        value: toM(comparison.konvensional.bebanOperasional), 
                        change: 0, 
                        label: 'Beban Operasional' 
                    },
                    nonOperasional: { value: 0, change: 0, label: 'Beban Non-Operasional' },
                    total: toM(comparison.konvensional.bebanBunga + comparison.konvensional.bebanOperasional)
                },
                syariah: {
                    bagiHasil: { 
                        value: toM(comparison.syariah.bebanBunga), 
                        change: 0, 
                        label: 'Beban Bagi Hasil' 
                    },
                    operasional: { 
                        value: toM(comparison.syariah.bebanOperasional), 
                        change: 0, 
                        label: 'Beban Operasional' 
                    },
                    nonOperasional: { value: 0, change: 0, label: 'Beban Non-Operasional' },
                    total: toM(comparison.syariah.bebanBunga + comparison.syariah.bebanOperasional)
                }
            };
            
            // Update ringkasan
            KONVEN_SYARIAH_DATA.ringkasan = {
                konven: {
                    pendapatanBungaBersih: toM(comparison.konvensional.nii),
                    pendapatanOperasional: toM(comparison.konvensional.pendapatanOperasional),
                    bebanOperasional: toM(comparison.konvensional.bebanOperasional),
                    labaOperasional: toM(comparison.konvensional.nii - comparison.konvensional.bebanOperasional),
                    pendapatanNonOps: 0,
                    bebanNonOps: 0,
                    labaSebelumPajak: toM(comparison.konvensional.labaBersih),
                    pajak: 0,
                    labaBersih: toM(comparison.konvensional.labaBersih)
                },
                syariah: {
                    pendapatanImbalHasilBersih: toM(comparison.syariah.nii),
                    pendapatanOperasional: toM(comparison.syariah.pendapatanOperasional),
                    bebanOperasional: toM(comparison.syariah.bebanOperasional),
                    labaOperasional: toM(comparison.syariah.nii - comparison.syariah.bebanOperasional),
                    pendapatanNonOps: 0,
                    bebanNonOps: 0,
                    labaSebelumPajak: toM(comparison.syariah.labaBersih),
                    pajak: 0,
                    labaBersih: toM(comparison.syariah.labaBersih)
                }
            };
            
            // Update DPK Breakdown
            KONVEN_SYARIAH_DATA.dpkBreakdown = {
                konven: {
                    giro: toT(comparison.konvensional.giro),
                    tabungan: toT(comparison.konvensional.tabungan),
                    deposito: toT(comparison.konvensional.deposito),
                    total: toT(comparison.konvensional.totalDPK)
                },
                syariah: {
                    giro: toM(comparison.syariah.giro), // Syariah dalam miliar
                    tabungan: toM(comparison.syariah.tabungan),
                    deposito: toM(comparison.syariah.deposito),
                    total: toM(comparison.syariah.totalDPK)
                }
            };
            
            console.log('✅ Konven vs Syariah data loaded');
            
        } catch (error) {
            console.error('Error loading konven syariah data:', error);
        }
    },
    
    /**
     * Refresh data untuk periode baru
     */
    async refreshData(periode) {
        await this.loadData(periode);
        
        // Re-render UI jika sudah initialized
        if (konvenSyariahInitialized) {
            renderAllPieCharts();
        }
        
        window.dispatchEvent(new CustomEvent('konvenSyariahDataUpdated', {
            detail: { period: periode }
        }));
    }
};

// ========================================
// TAB SWITCHING
// ========================================

function switchKonvenTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.konven-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.querySelector(`.konven-tab[data-tab="${tabName}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Hide all content
    document.querySelectorAll('.konven-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected content
    if (tabName === 'perbandingan') {
        document.getElementById('tabPerbandingan').style.display = 'block';
        setTimeout(() => renderAllPieCharts(), 300);
    } else if (tabName === 'pendapatan') {
        document.getElementById('tabPendapatan').style.display = 'block';
        renderDetailPendapatan();
    } else if (tabName === 'biaya') {
        document.getElementById('tabBiaya').style.display = 'block';
        renderDetailBiaya();
    } else if (tabName === 'ringkasan') {
        document.getElementById('tabRingkasan').style.display = 'block';
        renderRingkasanLabaRugi();
    }
}

// ========================================
// PIE CHARTS
// ========================================

function renderAllPieCharts() {
    if (!KONVEN_SYARIAH_DATA.isLoaded) {
        console.warn('Data not loaded yet');
        return;
    }
    
    const metrics = ['asset', 'kredit', 'dpk', 'laba'];
    
    metrics.forEach(metric => {
        const elementId = `pie${metric.charAt(0).toUpperCase() + metric.slice(1)}`;
        const element = document.getElementById(elementId);
        
        if (!element) {
            console.warn(`Element ${elementId} not found`);
            return;
        }
        
        const data = KONVEN_SYARIAH_DATA.perbandingan[metric];
        
        // Destroy existing chart
        if (pieCharts[metric]) {
            try { pieCharts[metric].destroy(); } catch(e) {}
        }
        
        // Clear element
        element.innerHTML = '';
        
        // Use ApexCharts instead of Chart.js
        if (typeof ApexCharts === 'undefined') {
            console.warn('ApexCharts not available');
            return;
        }
        
        const options = {
            series: [data.konvenPct || 0, data.syariahPct || 0],
            chart: {
                type: 'donut',
                height: 200
            },
            labels: ['Konvensional', 'Syariah'],
            colors: ['#001e51', '#8ac01e'],
            legend: {
                show: false // Legend ada di HTML
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val.toFixed(1) + '%';
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '60%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: function() {
                                    const unit = metric === 'laba' ? 'M' : 'T';
                                    return data.total.toFixed(2) + ' ' + unit;
                                }
                            }
                        }
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val.toFixed(1) + '%';
                    }
                }
            }
        };
        
        pieCharts[metric] = new ApexCharts(element, options);
        pieCharts[metric].render();
    });
    
    // Update value displays
    updatePerbandinganValues();
}

function updatePerbandinganValues() {
    const data = KONVEN_SYARIAH_DATA.perbandingan;
    
    // Asset
    updateValueDisplay('asset', data.asset);
    updateValueDisplay('kredit', data.kredit);
    updateValueDisplay('dpk', data.dpk);
    updateValueDisplay('laba', data.laba);
}

function updateValueDisplay(metric, data) {
    const unit = metric === 'laba' ? 'M' : 'T';
    
    const totalEl = document.getElementById(`${metric}Total`);
    const konvenEl = document.getElementById(`${metric}Konven`);
    const syariahEl = document.getElementById(`${metric}Syariah`);
    
    if (totalEl) totalEl.textContent = `${data.total.toFixed(2)} ${unit}`;
    if (konvenEl) konvenEl.textContent = `${data.konven.toFixed(2)} ${unit} (${data.konvenPct}%)`;
    if (syariahEl) syariahEl.textContent = `${data.syariah.toFixed(2)} ${unit} (${data.syariahPct}%)`;
}

// ========================================
// DETAIL RENDERERS
// ========================================

function renderDetailPendapatan() {
    const container = document.getElementById('pendapatanDetailContent');
    if (!container) {
        console.warn('pendapatanDetailContent not found');
        return;
    }
    
    const data = KONVEN_SYARIAH_DATA.pendapatan;
    
    // Update header badges
    const tabPendapatan = document.getElementById('tabPendapatan');
    if (tabPendapatan) {
        const badges = tabPendapatan.querySelectorAll('.badge');
        if (badges[0]) badges[0].textContent = `Konven: Rp ${data.konven.total.toFixed(2)} M`;
        if (badges[1]) badges[1].textContent = `Syariah: Rp ${data.syariah.total.toFixed(2)} M`;
    }
    
    container.innerHTML = `
        <div class="detail-grid">
            <div class="detail-card konven-card">
                <h4><i class="fas fa-building"></i> Konvensional</h4>
                <div class="detail-items">
                    <div class="detail-item">
                        <span class="label">${data.konven.bunga.label}</span>
                        <span class="value">Rp ${data.konven.bunga.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">${data.konven.operasional.label}</span>
                        <span class="value">Rp ${data.konven.operasional.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">${data.konven.nonOperasional.label}</span>
                        <span class="value">Rp ${data.konven.nonOperasional.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item total">
                        <span class="label">Total Pendapatan</span>
                        <span class="value">Rp ${data.konven.total.toFixed(2)} M</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-card syariah-card">
                <h4><i class="fas fa-moon"></i> Syariah</h4>
                <div class="detail-items">
                    <div class="detail-item">
                        <span class="label">${data.syariah.imbalHasil.label}</span>
                        <span class="value">Rp ${data.syariah.imbalHasil.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">${data.syariah.operasional.label}</span>
                        <span class="value">Rp ${data.syariah.operasional.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">${data.syariah.nonOperasional.label}</span>
                        <span class="value">Rp ${data.syariah.nonOperasional.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item total">
                        <span class="label">Total Pendapatan</span>
                        <span class="value">Rp ${data.syariah.total.toFixed(2)} M</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDetailBiaya() {
    const container = document.getElementById('biayaDetailContent');
    if (!container) {
        console.warn('biayaDetailContent not found');
        return;
    }
    
    const data = KONVEN_SYARIAH_DATA.biaya;
    
    // Update header badges
    const tabBiaya = document.getElementById('tabBiaya');
    if (tabBiaya) {
        const badges = tabBiaya.querySelectorAll('.badge');
        if (badges[0]) badges[0].textContent = `Konven: Rp ${data.konven.total.toFixed(2)} M`;
        if (badges[1]) badges[1].textContent = `Syariah: Rp ${data.syariah.total.toFixed(2)} M`;
    }
    
    container.innerHTML = `
        <div class="detail-grid">
            <div class="detail-card konven-card">
                <h4><i class="fas fa-building"></i> Konvensional</h4>
                <div class="detail-items">
                    <div class="detail-item">
                        <span class="label">${data.konven.bunga.label}</span>
                        <span class="value">Rp ${data.konven.bunga.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">${data.konven.operasional.label}</span>
                        <span class="value">Rp ${data.konven.operasional.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">${data.konven.nonOperasional.label}</span>
                        <span class="value">Rp ${data.konven.nonOperasional.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item total">
                        <span class="label">Total Biaya</span>
                        <span class="value">Rp ${data.konven.total.toFixed(2)} M</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-card syariah-card">
                <h4><i class="fas fa-moon"></i> Syariah</h4>
                <div class="detail-items">
                    <div class="detail-item">
                        <span class="label">${data.syariah.bagiHasil.label}</span>
                        <span class="value">Rp ${data.syariah.bagiHasil.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">${data.syariah.operasional.label}</span>
                        <span class="value">Rp ${data.syariah.operasional.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">${data.syariah.nonOperasional.label}</span>
                        <span class="value">Rp ${data.syariah.nonOperasional.value.toFixed(2)} M</span>
                    </div>
                    <div class="detail-item total">
                        <span class="label">Total Biaya</span>
                        <span class="value">Rp ${data.syariah.total.toFixed(2)} M</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRingkasanLabaRugi() {
    const container = document.getElementById('ringkasanContent');
    if (!container) return;
    
    const konven = KONVEN_SYARIAH_DATA.ringkasan.konven;
    const syariah = KONVEN_SYARIAH_DATA.ringkasan.syariah;
    
    container.innerHTML = `
        <div class="ringkasan-table">
            <table>
                <thead>
                    <tr>
                        <th>Komponen</th>
                        <th>Konvensional</th>
                        <th>Syariah</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Pendapatan Bunga/Imbal Hasil Bersih</td>
                        <td>Rp ${konven.pendapatanBungaBersih.toFixed(2)} M</td>
                        <td>Rp ${syariah.pendapatanImbalHasilBersih.toFixed(2)} M</td>
                    </tr>
                    <tr>
                        <td>Pendapatan Operasional</td>
                        <td>Rp ${konven.pendapatanOperasional.toFixed(2)} M</td>
                        <td>Rp ${syariah.pendapatanOperasional.toFixed(2)} M</td>
                    </tr>
                    <tr>
                        <td>Beban Operasional</td>
                        <td>Rp ${konven.bebanOperasional.toFixed(2)} M</td>
                        <td>Rp ${syariah.bebanOperasional.toFixed(2)} M</td>
                    </tr>
                    <tr class="highlight">
                        <td><strong>Laba Bersih</strong></td>
                        <td><strong>Rp ${konven.labaBersih.toFixed(2)} M</strong></td>
                        <td><strong>Rp ${syariah.labaBersih.toFixed(2)} M</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// ========================================
// UPDATE FROM DASHBOARDFIREBASE
// ========================================

function updateKonvenSyariahFromDashboard() {
    console.log('⚖️ Updating Konven vs Syariah from DashboardFirebase...');
    
    if (typeof DashboardFirebase === 'undefined') {
        console.warn('DashboardFirebase not available');
        return false;
    }
    
    const data = DashboardFirebase.getData();
    const filters = DashboardFirebase.getFilters();
    
    if (!data || !data.neraca || data.neraca.length === 0) {
        console.warn('No neraca data available');
        return false;
    }
    
    const neraca = data.neraca;
    const labarugi = data.labarugi || [];
    const periode = filters.periode;
    
    // Helper functions
    function getNeracaValue(kode, sandi) {
        const item = neraca.find(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi === sandi
        );
        return item ? Math.abs(item.total || 0) : 0;
    }
    
    function getLabarugiValue(kode, sandi) {
        const item = labarugi.find(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi === sandi
        );
        return item ? Math.abs(item.total || 0) : 0;
    }
    
    function sumLabarugiByPrefix(kode, prefix) {
        const items = labarugi.filter(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi && d.sandi.startsWith(prefix)
        );
        return items.reduce((sum, d) => sum + Math.abs(d.total || 0), 0);
    }
    
    // Helper: Sum multiple sandi codes from neraca
    function sumNeracaBySandi(kode, sandiList) {
        let total = 0;
        for (const sandi of sandiList) {
            total += getNeracaValue(kode, sandi);
        }
        return total;
    }
    
    // Helper: Sum neraca by sandi prefix
    function sumNeracaByPrefix(kode, prefix) {
        const items = neraca.filter(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi && d.sandi.startsWith(prefix)
        );
        return items.reduce((sum, d) => sum + Math.abs(d.total || 0), 0);
    }
    
    // Converters
    const toT = (val) => parseFloat((val / 1e12).toFixed(2));
    const toM = (val) => parseFloat((val / 1e9).toFixed(2));
    
    // ========================================
    // GET VALUES FROM FIREBASE DATA
    // ========================================
    
    // Total Aset (sandi: 01.00.00.00.00.00) - CORRECT ✓
    const asetALL = getNeracaValue('ALL', '01.00.00.00.00.00');
    const asetKON = getNeracaValue('KON', '01.00.00.00.00.00');
    const asetSYR = getNeracaValue('SYR', '01.00.00.00.00.00');
    
    // ========================================
    // KREDIT/PEMBIAYAAN - FIXED SANDI
    // ========================================
    // Konven: 01.09.01.00.00.00
    // Syariah: Sum of 01.09.03.xx.xx.00 (multiple sub-codes)
    const kreditKON = getNeracaValue('KON', '01.09.01.00.00.00');
    // Try individual sandi first, fallback to prefix sum
    let kreditSYR = sumNeracaByPrefix('SYR', '01.09.03');
    // Fallback: check if aggregate sandi exists
    if (kreditSYR === 0) {
        kreditSYR = getNeracaValue('SYR', '01.09.03.00.00.00');
    }
    const kreditALL = kreditKON + kreditSYR;
    
    // ========================================
    // DPK - GIRO - FIXED SANDI
    // ========================================
    // Konven: 02.01.01.00.00.00
    // Syariah: Sum of 02.01.02.01, 02.01.02.02, 02.01.02.03
    const giroKON = getNeracaValue('KON', '02.01.01.00.00.00');
    let giroSYR = sumNeracaBySandi('SYR', [
        '02.01.02.01.00.00',
        '02.01.02.02.00.00',
        '02.01.02.03.00.00'
    ]);
    // Fallback: check if aggregate sandi exists
    if (giroSYR === 0) {
        giroSYR = getNeracaValue('SYR', '02.01.02.00.00.00');
    }
    const giroALL = giroKON + giroSYR;
    
    // ========================================
    // DPK - TABUNGAN - FIXED SANDI
    // ========================================
    // Konven: 02.02.01.00.00.00
    // Syariah: Sum of 02.02.02.01, 02.02.02.02, 02.02.02.03
    const tabunganKON = getNeracaValue('KON', '02.02.01.00.00.00');
    let tabunganSYR = sumNeracaBySandi('SYR', [
        '02.02.02.01.00.00',
        '02.02.02.02.00.00',
        '02.02.02.03.00.00'
    ]);
    // Fallback: check if aggregate sandi exists
    if (tabunganSYR === 0) {
        tabunganSYR = getNeracaValue('SYR', '02.02.02.00.00.00');
    }
    const tabunganALL = tabunganKON + tabunganSYR;
    
    // ========================================
    // DPK - DEPOSITO - FIXED SANDI
    // ========================================
    // Konven: 02.03.01.00.00.00
    // Syariah: Sum of 02.03.02.01, 02.03.02.02
    const depositoKON = getNeracaValue('KON', '02.03.01.00.00.00');
    let depositoSYR = sumNeracaBySandi('SYR', [
        '02.03.02.01.00.00',
        '02.03.02.02.00.00'
    ]);
    // Fallback: check if aggregate sandi exists
    if (depositoSYR === 0) {
        depositoSYR = getNeracaValue('SYR', '02.03.02.00.00.00');
    }
    const depositoALL = depositoKON + depositoSYR;
    
    const dpkALL = giroALL + tabunganALL + depositoALL;
    const dpkKON = giroKON + tabunganKON + depositoKON;
    const dpkSYR = giroSYR + tabunganSYR + depositoSYR;
    
    // Laba Bersih (sandi: 03.05.02.01.00.00)
    const labaALL = getLabarugiValue('ALL', '03.05.02.01.00.00');
    const labaKON = getLabarugiValue('KON', '03.05.02.01.00.00');
    const labaSYR = getLabarugiValue('SYR', '03.05.02.01.00.00');
    
    // Pendapatan (04.xx)
    const pendapatanBungaKON = sumLabarugiByPrefix('KON', '04.11');
    const pendapatanBungaSYR = sumLabarugiByPrefix('SYR', '04.11');
    const pendapatanOpKON = sumLabarugiByPrefix('KON', '04.12');
    const pendapatanOpSYR = sumLabarugiByPrefix('SYR', '04.12');
    const pendapatanNonOpKON = sumLabarugiByPrefix('KON', '04.20');
    const pendapatanNonOpSYR = sumLabarugiByPrefix('SYR', '04.20');
    
    // Beban (05.xx)
    const bebanBungaKON = sumLabarugiByPrefix('KON', '05.11');
    const bebanBungaSYR = sumLabarugiByPrefix('SYR', '05.11');
    const bebanOpKON = sumLabarugiByPrefix('KON', '05.12');
    const bebanOpSYR = sumLabarugiByPrefix('SYR', '05.12');
    const bebanNonOpKON = sumLabarugiByPrefix('KON', '05.20');
    const bebanNonOpSYR = sumLabarugiByPrefix('SYR', '05.20');
    
    // ========================================
    // DEBUG LOGGING - Remove in production
    // ========================================
    console.log('📊 [Konven-Syariah] Data Extraction Results:');
    console.log('   ASET - Konven:', (asetKON/1e12).toFixed(2), 'T | Syariah:', (asetSYR/1e12).toFixed(2), 'T');
    console.log('   KREDIT - Konven:', (kreditKON/1e12).toFixed(2), 'T | Syariah:', (kreditSYR/1e12).toFixed(2), 'T');
    console.log('   GIRO - Konven:', (giroKON/1e12).toFixed(2), 'T | Syariah:', (giroSYR/1e9).toFixed(2), 'M');
    console.log('   TABUNGAN - Konven:', (tabunganKON/1e12).toFixed(2), 'T | Syariah:', (tabunganSYR/1e9).toFixed(2), 'M');
    console.log('   DEPOSITO - Konven:', (depositoKON/1e12).toFixed(2), 'T | Syariah:', (depositoSYR/1e9).toFixed(2), 'M');
    console.log('   DPK TOTAL - Konven:', (dpkKON/1e12).toFixed(2), 'T | Syariah:', (dpkSYR/1e12).toFixed(2), 'T');
    console.log('   LABA - Konven:', (labaKON/1e9).toFixed(2), 'M | Syariah:', (labaSYR/1e9).toFixed(2), 'M');
    
    // ========================================
    // UPDATE KONVEN_SYARIAH_DATA
    // ========================================
    
    KONVEN_SYARIAH_DATA.currentPeriod = periode;
    KONVEN_SYARIAH_DATA.isLoaded = true;
    
    // Perbandingan
    KONVEN_SYARIAH_DATA.perbandingan = {
        asset: {
            total: toT(asetALL),
            konven: toT(asetKON),
            syariah: toT(asetSYR),
            konvenPct: asetALL > 0 ? parseFloat((asetKON / asetALL * 100).toFixed(1)) : 0,
            syariahPct: asetALL > 0 ? parseFloat((asetSYR / asetALL * 100).toFixed(1)) : 0
        },
        kredit: {
            total: toT(kreditALL),
            konven: toT(kreditKON),
            syariah: toT(kreditSYR),
            konvenPct: kreditALL > 0 ? parseFloat((kreditKON / kreditALL * 100).toFixed(1)) : 0,
            syariahPct: kreditALL > 0 ? parseFloat((kreditSYR / kreditALL * 100).toFixed(1)) : 0
        },
        dpk: {
            total: toT(dpkALL),
            konven: toT(dpkKON),
            syariah: toT(dpkSYR),
            konvenPct: dpkALL > 0 ? parseFloat((dpkKON / dpkALL * 100).toFixed(1)) : 0,
            syariahPct: dpkALL > 0 ? parseFloat((dpkSYR / dpkALL * 100).toFixed(1)) : 0
        },
        laba: {
            total: toM(labaALL),
            konven: toM(labaKON),
            syariah: toM(labaSYR),
            konvenPct: labaALL > 0 ? parseFloat((labaKON / labaALL * 100).toFixed(1)) : 0,
            syariahPct: labaALL > 0 ? parseFloat((labaSYR / labaALL * 100).toFixed(1)) : 0,
            unit: 'M'
        }
    };
    
    // Detail Pendapatan
    KONVEN_SYARIAH_DATA.pendapatan = {
        konven: {
            bunga: { value: toM(pendapatanBungaKON), change: 0, label: 'Pendapatan Bunga' },
            operasional: { value: toM(pendapatanOpKON), change: 0, label: 'Pendapatan Operasional' },
            nonOperasional: { value: toM(pendapatanNonOpKON), change: 0, label: 'Pendapatan Non-Operasional' },
            total: toM(pendapatanBungaKON + pendapatanOpKON + pendapatanNonOpKON)
        },
        syariah: {
            imbalHasil: { value: toM(pendapatanBungaSYR), change: 0, label: 'Pendapatan Imbal Hasil' },
            operasional: { value: toM(pendapatanOpSYR), change: 0, label: 'Pendapatan Operasional' },
            nonOperasional: { value: toM(pendapatanNonOpSYR), change: 0, label: 'Pendapatan Non-Operasional' },
            total: toM(pendapatanBungaSYR + pendapatanOpSYR + pendapatanNonOpSYR)
        }
    };
    
    // Detail Biaya
    KONVEN_SYARIAH_DATA.biaya = {
        konven: {
            bunga: { value: toM(bebanBungaKON), change: 0, label: 'Beban Bunga' },
            operasional: { value: toM(bebanOpKON), change: 0, label: 'Beban Operasional' },
            nonOperasional: { value: toM(bebanNonOpKON), change: 0, label: 'Beban Non-Operasional' },
            total: toM(bebanBungaKON + bebanOpKON + bebanNonOpKON)
        },
        syariah: {
            bagiHasil: { value: toM(bebanBungaSYR), change: 0, label: 'Beban Bagi Hasil' },
            operasional: { value: toM(bebanOpSYR), change: 0, label: 'Beban Operasional' },
            nonOperasional: { value: toM(bebanNonOpSYR), change: 0, label: 'Beban Non-Operasional' },
            total: toM(bebanBungaSYR + bebanOpSYR + bebanNonOpSYR)
        }
    };
    
    // Ringkasan Laba Rugi
    const pendapatanBungaBersihKON = pendapatanBungaKON - bebanBungaKON;
    const pendapatanBungaBersihSYR = pendapatanBungaSYR - bebanBungaSYR;
    const labaOpKON = pendapatanBungaBersihKON + pendapatanOpKON - bebanOpKON;
    const labaOpSYR = pendapatanBungaBersihSYR + pendapatanOpSYR - bebanOpSYR;
    
    KONVEN_SYARIAH_DATA.ringkasan = {
        konven: {
            pendapatanBungaBersih: toM(pendapatanBungaBersihKON),
            pendapatanOperasional: toM(pendapatanOpKON),
            bebanOperasional: toM(bebanOpKON),
            labaOperasional: toM(labaOpKON),
            pendapatanNonOps: toM(pendapatanNonOpKON),
            bebanNonOps: toM(bebanNonOpKON),
            labaSebelumPajak: toM(labaKON),
            pajak: 0,
            labaBersih: toM(labaKON)
        },
        syariah: {
            pendapatanImbalHasilBersih: toM(pendapatanBungaBersihSYR),
            pendapatanOperasional: toM(pendapatanOpSYR),
            bebanOperasional: toM(bebanOpSYR),
            labaOperasional: toM(labaOpSYR),
            pendapatanNonOps: toM(pendapatanNonOpSYR),
            bebanNonOps: toM(bebanNonOpSYR),
            labaSebelumPajak: toM(labaSYR),
            pajak: 0,
            labaBersih: toM(labaSYR)
        }
    };
    
    // DPK Breakdown
    KONVEN_SYARIAH_DATA.dpkBreakdown = {
        konven: { giro: toM(giroKON), tabungan: toM(tabunganKON), deposito: toM(depositoKON), total: toM(dpkKON) },
        syariah: { giro: toM(giroSYR), tabungan: toM(tabunganSYR), deposito: toM(depositoSYR), total: toM(dpkSYR) }
    };
    
    console.log('⚖️ Konven vs Syariah Data:', {
        asset: KONVEN_SYARIAH_DATA.perbandingan.asset,
        kredit: KONVEN_SYARIAH_DATA.perbandingan.kredit,
        dpk: KONVEN_SYARIAH_DATA.perbandingan.dpk,
        laba: KONVEN_SYARIAH_DATA.perbandingan.laba
    });
    
    console.log('✅ Konven vs Syariah updated from DashboardFirebase');
    return true;
}

function refreshKonvenSyariah() {
    if (updateKonvenSyariahFromDashboard()) {
        // Re-render current tab
        const activeTab = document.querySelector('.konven-tab.active');
        if (activeTab) {
            switchKonvenTab(activeTab.dataset.tab);
        }
    }
}

// ========================================
// INITIALIZATION
// ========================================

function initKonvenSyariah() {
    if (konvenSyariahInitialized) {
        // Jika sudah initialized, cukup refresh data
        refreshKonvenSyariah();
        return;
    }
    
    // Setup tab listeners
    document.querySelectorAll('.konven-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchKonvenTab(this.dataset.tab);
        });
    });
    
    // Load data from DashboardFirebase
    updateKonvenSyariahFromDashboard();
    
    // Initial render
    switchKonvenTab('perbandingan');
    
    konvenSyariahInitialized = true;
    console.log('✅ Konven Syariah UI initialized');
}

// ========================================
// AUTO-INITIALIZE
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Tunggu DashboardFirebase ready
    setTimeout(() => {
        // Coba load dari DashboardFirebase dulu
        if (typeof DashboardFirebase !== 'undefined') {
            const success = updateKonvenSyariahFromDashboard();
            if (success) {
                initKonvenSyariah();
                console.log('⚖️ Konven vs Syariah loaded from DashboardFirebase!');
                window.dispatchEvent(new CustomEvent('konvenSyariahDataReady'));
                return;
            }
        }
        
        // Fallback ke FirebaseDataService jika DashboardFirebase tidak tersedia
        if (typeof FirebaseDataService !== 'undefined') {
            KonvenSyariahLoader.init().then(success => {
                if (success) {
                    initKonvenSyariah();
                    console.log('⚖️ Konven vs Syariah loaded from FirebaseDataService!');
                    window.dispatchEvent(new CustomEvent('konvenSyariahDataReady'));
                }
            });
        }
    }, 1500);
});

// Listen untuk period change
window.addEventListener('bankDataUpdated', async (e) => {
    if (e.detail && e.detail.period) {
        // Refresh dari DashboardFirebase
        refreshKonvenSyariah();
    }
});

// Export
window.KONVEN_SYARIAH_DATA = KONVEN_SYARIAH_DATA;
window.KonvenSyariahLoader = KonvenSyariahLoader;
window.switchKonvenTab = switchKonvenTab;
window.initKonvenSyariah = initKonvenSyariah;
window.updateKonvenSyariahFromDashboard = updateKonvenSyariahFromDashboard;
window.refreshKonvenSyariah = refreshKonvenSyariah;

console.log('📦 Konven Syariah Handler Firebase Version loaded');
