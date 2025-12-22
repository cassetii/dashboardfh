// ========================================
// PENDAPATAN & BIAYA KONSOLIDASI HANDLER
// Bank Sulselbar Dashboard - Integrasi Firebase
// ========================================

// ========================================
// FUNGSI UPDATE DARI FIREBASE
// ========================================

function updatePBFromFirebase() {
    console.log('📊 Updating Pendapatan & Biaya from Firebase...');
    
    if (typeof DashboardFirebase === 'undefined') {
        console.warn('DashboardFirebase not available');
        return;
    }
    
    const data = DashboardFirebase.getData();
    const filters = DashboardFirebase.getFilters();
    
    if (!data || !data.labarugi || data.labarugi.length === 0) {
        console.warn('No labarugi data available');
        return;
    }
    
    const labarugi = data.labarugi;
    const periode = filters.periode;
    
    // ========================================
    // TENTUKAN TARGET KODE BERDASARKAN FILTER
    // ========================================
    let targetKode = 'ALL'; // default konsolidasi
    let targetKodeKon = 'KON';
    let targetKodeSyr = 'SYR';
    
    if (filters.cabang) {
        // Jika ada filter cabang spesifik
        targetKode = filters.cabang;
        targetKodeKon = filters.cabang;
        targetKodeSyr = filters.cabang;
    } else if (filters.tipe === 'konvensional') {
        targetKode = 'KON';
        targetKodeKon = 'KON';
        targetKodeSyr = null; // tidak ada syariah
    } else if (filters.tipe === 'syariah') {
        targetKode = 'SYR';
        targetKodeKon = null; // tidak ada konven
        targetKodeSyr = 'SYR';
    }
    
    console.log('📊 PB Filter:', { periode, targetKode, tipe: filters.tipe, cabang: filters.cabang });
    
    // Helper function to format currency
    function formatMiliar(value) {
        const absVal = Math.abs(value);
        if (absVal >= 1e12) {
            return (value / 1e12).toFixed(2) + ' T';
        } else if (absVal >= 1e9) {
            return (value / 1e9).toFixed(2) + ' M';
        } else if (absVal >= 1e6) {
            return (value / 1e6).toFixed(2) + ' Jt';
        }
        return value.toLocaleString('id-ID');
    }
    
    // Helper to get value by exact sandi
    function getValueBySandi(kode, sandi) {
        if (!kode) return 0;
        const item = labarugi.find(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi === sandi
        );
        return item ? Math.abs(item.total || 0) : 0;
    }
    
    // Helper to sum by sandi prefix
    function sumByPrefix(kode, sandiPrefix) {
        if (!kode) return 0;
        const items = labarugi.filter(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi && d.sandi.startsWith(sandiPrefix)
        );
        return items.reduce((sum, d) => sum + Math.abs(d.total || 0), 0);
    }
    
    // ========================================
    // SANDI YANG BENAR UNTUK LABA RUGI:
    // Pendapatan = 04.xx (bukan 01.xx)
    // Beban = 05.xx (bukan 02.xx)  
    // Laba = 03.05.02.01.xx
    // ========================================
    
    // PENDAPATAN - menggunakan targetKode dari filter
    // 04.11 = Pendapatan Bunga/Imbal Hasil
    // 04.12 = Pendapatan Operasional Lainnya
    // 04.20 = Pendapatan Non Operasional
    const pendapatanBungaAll = getValueBySandi(targetKode, '04.11.00.00.00.00') || sumByPrefix(targetKode, '04.11');
    const pendapatanBungaKon = targetKodeKon ? (getValueBySandi(targetKodeKon, '04.11.00.00.00.00') || sumByPrefix(targetKodeKon, '04.11')) : 0;
    const pendapatanBungaSyr = targetKodeSyr ? (getValueBySandi(targetKodeSyr, '04.11.00.00.00.00') || sumByPrefix(targetKodeSyr, '04.11')) : 0;
    
    const pendapatanOpLainAll = sumByPrefix(targetKode, '04.12');
    const pendapatanOpLainKon = targetKodeKon ? sumByPrefix(targetKodeKon, '04.12') : 0;
    const pendapatanOpLainSyr = targetKodeSyr ? sumByPrefix(targetKodeSyr, '04.12') : 0;
    
    const pendapatanNonOpAll = sumByPrefix(targetKode, '04.20');
    const pendapatanNonOpKon = targetKodeKon ? sumByPrefix(targetKodeKon, '04.20') : 0;
    const pendapatanNonOpSyr = targetKodeSyr ? sumByPrefix(targetKodeSyr, '04.20') : 0;
    
    // Gunakan nilai dari pos ringkasan jika ada
    const pendapatanOpBunga = getValueBySandi(targetKode, '03.05.02.01.11.10'); // Pendapatan Operasional Bunga
    const pendapatanOpLain = getValueBySandi(targetKode, '03.05.02.01.11.20');  // Pendapatan Operasional Lainnya
    
    const pendapatanAll = pendapatanBungaAll + pendapatanOpLainAll + pendapatanNonOpAll;
    const pendapatanKon = pendapatanBungaKon + pendapatanOpLainKon + pendapatanNonOpKon;
    const pendapatanSyr = pendapatanBungaSyr + pendapatanOpLainSyr + pendapatanNonOpSyr;
    
    // Alternatif: gunakan pendapatan dari ringkasan
    const totalPendapatanFromSummary = pendapatanOpBunga + pendapatanOpLain + pendapatanNonOpAll;
    const finalPendapatanAll = pendapatanAll > 0 ? pendapatanAll : totalPendapatanFromSummary;
    
    // BIAYA/BEBAN - menggunakan targetKode dari filter
    // 05.11 = Beban Bunga/Imbal Hasil
    // 05.12 = Beban Operasional Lainnya
    // 05.20 = Beban Non Operasional
    const bebanBungaAll = getValueBySandi(targetKode, '05.11.00.00.00.00') || sumByPrefix(targetKode, '05.11');
    const bebanBungaKon = targetKodeKon ? (getValueBySandi(targetKodeKon, '05.11.00.00.00.00') || sumByPrefix(targetKodeKon, '05.11')) : 0;
    const bebanBungaSyr = targetKodeSyr ? (getValueBySandi(targetKodeSyr, '05.11.00.00.00.00') || sumByPrefix(targetKodeSyr, '05.11')) : 0;
    
    const bebanOpLainAll = sumByPrefix(targetKode, '05.12');
    const bebanOpLainKon = targetKodeKon ? sumByPrefix(targetKodeKon, '05.12') : 0;
    const bebanOpLainSyr = targetKodeSyr ? sumByPrefix(targetKodeSyr, '05.12') : 0;
    
    const bebanNonOpAll = sumByPrefix(targetKode, '05.20');
    const bebanNonOpKon = targetKodeKon ? sumByPrefix(targetKodeKon, '05.20') : 0;
    const bebanNonOpSyr = targetKodeSyr ? sumByPrefix(targetKodeSyr, '05.20') : 0;
    
    // Gunakan nilai dari pos ringkasan jika ada
    const bebanOpBunga = getValueBySandi(targetKode, '03.05.02.02.11.10');  // Beban Operasional Bunga
    const bebanOpLain = getValueBySandi(targetKode, '03.05.02.02.11.20');   // Beban Operasional Lainnya (1.226 T)
    
    const biayaAll = bebanBungaAll + bebanOpLainAll + bebanNonOpAll;
    const biayaKon = bebanBungaKon + bebanOpLainKon + bebanNonOpKon;
    const biayaSyr = bebanBungaSyr + bebanOpLainSyr + bebanNonOpSyr;
    
    // Alternatif: gunakan beban dari ringkasan
    const totalBebanFromSummary = bebanOpBunga + bebanOpLain + bebanNonOpAll;
    const finalBiayaAll = biayaAll > 0 ? biayaAll : totalBebanFromSummary;
    
    // LABA - menggunakan targetKode dari filter
    const labaAll = getValueBySandi(targetKode, '03.05.02.01.00.00');
    const labaKon = targetKodeKon ? getValueBySandi(targetKodeKon, '03.05.02.01.00.00') : 0;
    const labaSyr = targetKodeSyr ? getValueBySandi(targetKodeSyr, '03.05.02.01.00.00') : 0;
    
    // Calculate Cost to Income Ratio
    const cti = finalPendapatanAll > 0 ? (finalBiayaAll / finalPendapatanAll) * 100 : 0;
    
    console.log('📊 PB Data:', {
        pendapatan: { all: finalPendapatanAll, kon: pendapatanKon, syr: pendapatanSyr },
        biaya: { all: finalBiayaAll, kon: biayaKon, syr: biayaSyr },
        laba: { all: labaAll, kon: labaKon, syr: labaSyr },
        cti: cti
    });
    
    // Update UI elements
    const updateEl = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = text;
    };
    
    // Update Pendapatan
    updateEl('pbTotalPendapatan', formatMiliar(finalPendapatanAll) + ' <span>Rp</span>');
    updateEl('pbPendapatanKonven', 'Konven: ' + formatMiliar(pendapatanKon));
    updateEl('pbPendapatanSyariah', 'Syariah: ' + formatMiliar(pendapatanSyr));
    
    // Update Biaya
    updateEl('pbTotalBiaya', formatMiliar(finalBiayaAll) + ' <span>Rp</span>');
    updateEl('pbBiayaKonven', 'Konven: ' + formatMiliar(biayaKon));
    updateEl('pbBiayaSyariah', 'Syariah: ' + formatMiliar(biayaSyr));
    
    // Update Laba
    updateEl('pbLabaBersih', formatMiliar(labaAll) + ' <span>Rp</span>');
    updateEl('pbLabaKonven', 'Konven: ' + formatMiliar(labaKon));
    updateEl('pbLabaSyariah', 'Syariah: ' + formatMiliar(labaSyr));
    
    // Update CTI
    updateEl('pbCostToIncome', cti.toFixed(2) + '<span>%</span>');
    
    const ctiStatusEl = document.getElementById('pbCTIStatus');
    if (ctiStatusEl) {
        if (cti < 60) {
            ctiStatusEl.innerHTML = '✓ Sehat';
            ctiStatusEl.className = 'status-good';
        } else if (cti < 80) {
            ctiStatusEl.innerHTML = '⚠ Perhatian';
            ctiStatusEl.className = 'status-warning';
        } else {
            ctiStatusEl.innerHTML = '✗ Tinggi';
            ctiStatusEl.className = 'status-danger';
        }
    }
    
    // Update static data object for charts (in Miliar)
    PENDAPATAN_BIAYA_DATA.summary.totalPendapatan = finalPendapatanAll / 1e9;
    PENDAPATAN_BIAYA_DATA.summary.totalBiaya = finalBiayaAll / 1e9;
    PENDAPATAN_BIAYA_DATA.summary.labaBersih = labaAll / 1e9;
    PENDAPATAN_BIAYA_DATA.summary.costToIncomeRatio = cti;
    
    // Update detail pendapatan
    PENDAPATAN_BIAYA_DATA.pendapatan.bungaImbalHasil.total = pendapatanBungaAll / 1e9;
    PENDAPATAN_BIAYA_DATA.pendapatan.bungaImbalHasil.konven = pendapatanBungaKon / 1e9;
    PENDAPATAN_BIAYA_DATA.pendapatan.bungaImbalHasil.syariah = pendapatanBungaSyr / 1e9;
    
    PENDAPATAN_BIAYA_DATA.pendapatan.operasionalLainnya.total = pendapatanOpLainAll / 1e9;
    PENDAPATAN_BIAYA_DATA.pendapatan.operasionalLainnya.konven = pendapatanOpLainKon / 1e9;
    PENDAPATAN_BIAYA_DATA.pendapatan.operasionalLainnya.syariah = pendapatanOpLainSyr / 1e9;
    
    PENDAPATAN_BIAYA_DATA.pendapatan.nonOperasional.total = pendapatanNonOpAll / 1e9;
    PENDAPATAN_BIAYA_DATA.pendapatan.nonOperasional.konven = pendapatanNonOpKon / 1e9;
    PENDAPATAN_BIAYA_DATA.pendapatan.nonOperasional.syariah = pendapatanNonOpSyr / 1e9;
    
    // Update detail biaya
    PENDAPATAN_BIAYA_DATA.biaya.bungaBagiHasil.total = bebanBungaAll / 1e9;
    PENDAPATAN_BIAYA_DATA.biaya.bungaBagiHasil.konven = bebanBungaKon / 1e9;
    PENDAPATAN_BIAYA_DATA.biaya.bungaBagiHasil.syariah = bebanBungaSyr / 1e9;
    
    PENDAPATAN_BIAYA_DATA.biaya.operasional.total = bebanOpLainAll / 1e9;
    PENDAPATAN_BIAYA_DATA.biaya.operasional.konven = bebanOpLainKon / 1e9;
    PENDAPATAN_BIAYA_DATA.biaya.operasional.syariah = bebanOpLainSyr / 1e9;
    
    PENDAPATAN_BIAYA_DATA.biaya.nonOperasional.total = bebanNonOpAll / 1e9;
    PENDAPATAN_BIAYA_DATA.biaya.nonOperasional.konven = bebanNonOpKon / 1e9;
    PENDAPATAN_BIAYA_DATA.biaya.nonOperasional.syariah = bebanNonOpSyr / 1e9;
    
    // ========================================
    // UPDATE TABEL LAPORAN LABA RUGI (TAB RINGKASAN)
    // ========================================
    
    // Pendapatan
    updateEl('pbLrPendapatanBunga', 'Rp ' + formatMiliar(pendapatanBungaAll));
    updateEl('pbLrPendapatanBungaKon', 'Rp ' + formatMiliar(pendapatanBungaKon));
    updateEl('pbLrPendapatanBungaSyr', 'Rp ' + formatMiliar(pendapatanBungaSyr));
    updateEl('pbLrPendapatanOpLain', 'Rp ' + formatMiliar(pendapatanOpLainAll));
    updateEl('pbLrPendapatanNonOp', 'Rp ' + formatMiliar(pendapatanNonOpAll));
    updateEl('pbLrTotalPendapatan', 'Rp ' + formatMiliar(finalPendapatanAll));
    
    // Beban
    updateEl('pbLrBebanBunga', '(Rp ' + formatMiliar(bebanBungaAll) + ')');
    updateEl('pbLrBebanBungaKon', '(Rp ' + formatMiliar(bebanBungaKon) + ')');
    updateEl('pbLrBebanBungaSyr', '(Rp ' + formatMiliar(bebanBungaSyr) + ')');
    updateEl('pbLrBebanOp', '(Rp ' + formatMiliar(bebanOpLainAll) + ')');
    updateEl('pbLrBebanNonOp', '(Rp ' + formatMiliar(bebanNonOpAll) + ')');
    updateEl('pbLrTotalBeban', '(Rp ' + formatMiliar(finalBiayaAll) + ')');
    
    // Laba - menggunakan targetKode
    const labaSblmPajak = getValueBySandi(targetKode, '03.05.02.01.10.00');
    const pajak = getValueBySandi(targetKode, '03.05.02.01.40.00');
    updateEl('pbLrLabaSblmPajak', 'Rp ' + formatMiliar(labaSblmPajak));
    updateEl('pbLrPajak', '(Rp ' + formatMiliar(pajak) + ')');
    updateEl('pbLrLabaBersih', 'Rp ' + formatMiliar(labaAll));
    
    // Update period badge
    const periodBadge = document.querySelector('.period-badge');
    if (periodBadge) {
        const [year, month] = periode.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        periodBadge.textContent = `Jan - ${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    console.log('✅ Pendapatan & Biaya updated from Firebase');
}

// Data Konsolidasi (Konven + Syariah) - Fallback/Default
const PENDAPATAN_BIAYA_DATA = {
    // Summary
    summary: {
        totalPendapatan: 2766.47,
        totalBiaya: 1537.15,
        labaBersih: 904.70,
        costToIncomeRatio: 55.57
    },
    
    // Detail Pendapatan
    pendapatan: {
        bungaImbalHasil: {
            label: 'Pendapatan Bunga / Imbal Hasil',
            total: 2232.88,
            konven: 2093.88,
            syariah: 139.00,
            change: 8.5,
            items: [
                { name: 'Penempatan pada Bank Indonesia', value: 13.22, konven: 13.22, syariah: 0 },
                { name: 'Penempatan pada bank lain', value: 0, konven: 0, syariah: 0 },
                { name: 'Surat Berharga yang dimiliki', value: 341.01, konven: 341.01, syariah: 0 },
                { name: 'Kredit/piutang/pembiayaan', value: 1850.50, konven: 1720.50, syariah: 130.00 },
                { name: 'Lainnya', value: 28.15, konven: 19.15, syariah: 9.00 }
            ]
        },
        operasionalLainnya: {
            label: 'Pendapatan Operasional Lainnya',
            total: 298.80,
            konven: 288.30,
            syariah: 10.50,
            change: 3.2,
            items: [
                { name: 'Provisi & Komisi', value: 156.20, konven: 150.20, syariah: 6.00 },
                { name: 'Fee Based Income', value: 98.60, konven: 94.10, syariah: 4.50 },
                { name: 'Pendapatan Valas', value: 44.00, konven: 44.00, syariah: 0 }
            ]
        },
        nonOperasional: {
            label: 'Pendapatan Non-Operasional',
            total: 33.00,
            konven: 33.00,
            syariah: 0,
            change: 1.5,
            items: [
                { name: 'Keuntungan Penjualan Aset', value: 18.00, konven: 18.00, syariah: 0 },
                { name: 'Pendapatan Lainnya', value: 15.00, konven: 15.00, syariah: 0 }
            ]
        }
    },
    
    // Detail Biaya
    biaya: {
        bungaBagiHasil: {
            label: 'Beban Bunga / Bagi Hasil',
            total: 886.30,
            konven: 864.60,
            syariah: 21.70,
            change: 5.2,
            items: [
                { name: 'Bunga Deposito', value: 520.80, konven: 505.80, syariah: 15.00 },
                { name: 'Bunga Tabungan', value: 245.50, konven: 238.80, syariah: 6.70 },
                { name: 'Bunga Giro', value: 120.00, konven: 120.00, syariah: 0 }
            ]
        },
        operasional: {
            label: 'Beban Operasional',
            total: 608.60,
            konven: 476.90,
            syariah: 131.70,
            change: 4.1,
            items: [
                { name: 'Beban Tenaga Kerja', value: 285.40, konven: 220.40, syariah: 65.00 },
                { name: 'Beban Umum & Administrasi', value: 198.20, konven: 156.50, syariah: 41.70 },
                { name: 'Beban Penyusutan', value: 75.00, konven: 60.00, syariah: 15.00 },
                { name: 'Beban CKPN', value: 50.00, konven: 40.00, syariah: 10.00 }
            ]
        },
        nonOperasional: {
            label: 'Beban Non-Operasional',
            total: 42.20,
            konven: 41.90,
            syariah: 0.30,
            change: 2.3,
            items: [
                { name: 'Kerugian Penjualan Aset', value: 22.20, konven: 22.00, syariah: 0.20 },
                { name: 'Beban Lainnya', value: 20.00, konven: 19.90, syariah: 0.10 }
            ]
        }
    },
    
    // Trend Bulanan
    trend: {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
        pendapatan: [245.5, 258.2, 265.8, 272.4, 278.5, 282.1, 285.3, 288.7, 292.1, 297.87],
        biaya: [142.5, 148.2, 151.8, 154.4, 156.5, 158.1, 160.3, 162.7, 165.1, 137.45],
        laba: [78.2, 82.5, 86.2, 88.8, 91.2, 93.5, 95.8, 98.2, 100.5, 89.27]
    }
};

// Chart instances
let pbCharts = {};

// ========================================
// TAB SWITCHING
// ========================================

function switchPBTab(tabName) {
    console.log('Switching to PB tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.pb-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.querySelector(`.pb-tab[data-tab="${tabName}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Hide all content
    document.querySelectorAll('.pb-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected content
    if (tabName === 'ringkasan') {
        document.getElementById('pbTabRingkasan').style.display = 'block';
        setTimeout(renderPBRingkasanCharts, 300);
    } else if (tabName === 'detail-pendapatan') {
        document.getElementById('pbTabDetailPendapatan').style.display = 'block';
        renderPBDetailPendapatan();
    } else if (tabName === 'detail-biaya') {
        document.getElementById('pbTabDetailBiaya').style.display = 'block';
        renderPBDetailBiaya();
    } else if (tabName === 'trend') {
        document.getElementById('pbTabTrend').style.display = 'block';
        setTimeout(renderPBTrendCharts, 300);
    }
}

// ========================================
// RINGKASAN CHARTS
// ========================================

function renderPBRingkasanCharts() {
    renderPBPendapatanPie();
    renderPBBiayaPie();
}

function renderPBPendapatanPie() {
    const element = document.getElementById('pbPendapatanPieChart');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    if (pbCharts.pendapatanPie) {
        try { pbCharts.pendapatanPie.destroy(); } catch(e) {}
    }
    
    element.innerHTML = '';
    
    const data = PENDAPATAN_BIAYA_DATA.pendapatan;
    const options = {
        series: [data.bungaImbalHasil.total, data.operasionalLainnya.total, data.nonOperasional.total],
        chart: { type: 'donut', height: 250 },
        colors: ['#00b894', '#3498db', '#9b59b6'],
        labels: ['Bunga/Imbal Hasil', 'Operasional Lainnya', 'Non-Operasional'],
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: {
            enabled: true,
            formatter: (val) => val.toFixed(1) + '%'
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '55%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: () => 'Rp 2,766 M'
                        }
                    }
                }
            }
        }
    };
    
    pbCharts.pendapatanPie = new ApexCharts(element, options);
    pbCharts.pendapatanPie.render();
}

function renderPBBiayaPie() {
    const element = document.getElementById('pbBiayaPieChart');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    if (pbCharts.biayaPie) {
        try { pbCharts.biayaPie.destroy(); } catch(e) {}
    }
    
    element.innerHTML = '';
    
    const data = PENDAPATAN_BIAYA_DATA.biaya;
    const options = {
        series: [data.bungaBagiHasil.total, data.operasional.total, data.nonOperasional.total],
        chart: { type: 'donut', height: 250 },
        colors: ['#e74c3c', '#f39c12', '#e67e22'],
        labels: ['Bunga/Bagi Hasil', 'Operasional', 'Non-Operasional'],
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: {
            enabled: true,
            formatter: (val) => val.toFixed(1) + '%'
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '55%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: () => 'Rp 1,537 M'
                        }
                    }
                }
            }
        }
    };
    
    pbCharts.biayaPie = new ApexCharts(element, options);
    pbCharts.biayaPie.render();
}

// ========================================
// DETAIL PENDAPATAN
// ========================================

function renderPBDetailPendapatan() {
    const container = document.getElementById('pbDetailPendapatanContent');
    if (!container) return;
    
    // Get data from Firebase if available
    const detailData = getDetailPendapatanFromFirebase();
    
    let html = `<div class="pb-detail-grid">`;
    
    Object.keys(detailData).forEach(key => {
        const category = detailData[key];
        html += `
            <div class="pb-detail-card">
                <div class="pb-detail-header income-header">
                    <i class="fas fa-arrow-up"></i>
                    <h5>${category.label}</h5>
                </div>
                <div class="pb-detail-body">
                    ${category.items.map(item => `
                        <div class="pb-detail-item">
                            <span class="pb-item-name">${item.name}</span>
                            <span class="pb-item-value">Rp ${formatPBNumber(item.value)} M</span>
                        </div>
                    `).join('')}
                    <div class="pb-detail-item total-row">
                        <span class="pb-item-name">Total ${category.label}</span>
                        <span class="pb-item-value" style="color: #00b894;">Rp ${formatPBNumber(category.total)} M</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>
        <div class="pb-chart-card" style="margin-top: 1.5rem;">
            <div class="pb-chart-header">
                <h5><i class="fas fa-chart-bar"></i> Perbandingan Pendapatan per Kategori</h5>
            </div>
            <div id="pbPendapatanBarDetail" style="height: 300px;"></div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Render bar chart
    setTimeout(() => renderPBPendapatanBarDetail(detailData), 200);
}

function getDetailPendapatanFromFirebase() {
    // Default: gunakan data dari PENDAPATAN_BIAYA_DATA yang sudah di-update
    const data = PENDAPATAN_BIAYA_DATA.pendapatan;
    
    if (typeof DashboardFirebase === 'undefined') {
        return data;
    }
    
    const fbData = DashboardFirebase.getData();
    const filters = DashboardFirebase.getFilters();
    
    if (!fbData || !fbData.labarugi || fbData.labarugi.length === 0) {
        return data;
    }
    
    const labarugi = fbData.labarugi;
    const periode = filters.periode;
    
    // Tentukan target kode
    let targetKode = 'ALL';
    if (filters.cabang) {
        targetKode = filters.cabang;
    } else if (filters.tipe === 'konvensional') {
        targetKode = 'KON';
    } else if (filters.tipe === 'syariah') {
        targetKode = 'SYR';
    }
    
    // Helper functions
    function getValueBySandi(kode, sandi) {
        const item = labarugi.find(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi === sandi
        );
        return item ? Math.abs(item.total || 0) : 0;
    }
    
    function sumByPrefix(kode, sandiPrefix) {
        const items = labarugi.filter(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi && d.sandi.startsWith(sandiPrefix)
        );
        return items.reduce((sum, d) => sum + Math.abs(d.total || 0), 0);
    }
    
    function toMiliar(val) {
        return val / 1e9;
    }
    
    // Build detail data from Firebase
    // 04.11 = Pendapatan Bunga
    // 04.12 = Pendapatan Operasional Lainnya
    // 04.20 = Pendapatan Non Operasional
    
    const pendapatanBunga = {
        label: 'Pendapatan Bunga / Imbal Hasil',
        total: toMiliar(sumByPrefix(targetKode, '04.11')),
        konven: toMiliar(sumByPrefix('KON', '04.11')),
        syariah: toMiliar(sumByPrefix('SYR', '04.11')),
        items: [
            { 
                name: 'Penempatan pada Bank Indonesia', 
                value: toMiliar(sumByPrefix(targetKode, '04.11.01')),
                konven: toMiliar(sumByPrefix('KON', '04.11.01')),
                syariah: toMiliar(sumByPrefix('SYR', '04.11.01'))
            },
            { 
                name: 'Penempatan pada bank lain', 
                value: toMiliar(sumByPrefix(targetKode, '04.11.02')),
                konven: toMiliar(sumByPrefix('KON', '04.11.02')),
                syariah: toMiliar(sumByPrefix('SYR', '04.11.02'))
            },
            { 
                name: 'Surat Berharga yang dimiliki', 
                value: toMiliar(sumByPrefix(targetKode, '04.11.03')),
                konven: toMiliar(sumByPrefix('KON', '04.11.03')),
                syariah: toMiliar(sumByPrefix('SYR', '04.11.03'))
            },
            { 
                name: 'Kredit/piutang/pembiayaan', 
                value: toMiliar(sumByPrefix(targetKode, '04.11.04')),
                konven: toMiliar(sumByPrefix('KON', '04.11.04')),
                syariah: toMiliar(sumByPrefix('SYR', '04.11.04'))
            },
            { 
                name: 'Lainnya', 
                value: toMiliar(sumByPrefix(targetKode, '04.11.99')),
                konven: toMiliar(sumByPrefix('KON', '04.11.99')),
                syariah: toMiliar(sumByPrefix('SYR', '04.11.99'))
            }
        ]
    };
    
    const pendapatanOpLain = {
        label: 'Pendapatan Operasional Lainnya',
        total: toMiliar(sumByPrefix(targetKode, '04.12')),
        konven: toMiliar(sumByPrefix('KON', '04.12')),
        syariah: toMiliar(sumByPrefix('SYR', '04.12')),
        items: [
            { 
                name: 'Provisi & Komisi', 
                value: toMiliar(sumByPrefix(targetKode, '04.12.07')),
                konven: toMiliar(sumByPrefix('KON', '04.12.07')),
                syariah: toMiliar(sumByPrefix('SYR', '04.12.07'))
            },
            { 
                name: 'Keuntungan Transaksi Valas', 
                value: toMiliar(sumByPrefix(targetKode, '04.12.04')),
                konven: toMiliar(sumByPrefix('KON', '04.12.04')),
                syariah: toMiliar(sumByPrefix('SYR', '04.12.04'))
            },
            { 
                name: 'Pemulihan Aset/Kerugian', 
                value: toMiliar(sumByPrefix(targetKode, '04.12.10')),
                konven: toMiliar(sumByPrefix('KON', '04.12.10')),
                syariah: toMiliar(sumByPrefix('SYR', '04.12.10'))
            },
            { 
                name: 'Pendapatan Lainnya', 
                value: toMiliar(sumByPrefix(targetKode, '04.12.99')),
                konven: toMiliar(sumByPrefix('KON', '04.12.99')),
                syariah: toMiliar(sumByPrefix('SYR', '04.12.99'))
            }
        ]
    };
    
    const pendapatanNonOp = {
        label: 'Pendapatan Non-Operasional',
        total: toMiliar(sumByPrefix(targetKode, '04.20')),
        konven: toMiliar(sumByPrefix('KON', '04.20')),
        syariah: toMiliar(sumByPrefix('SYR', '04.20')),
        items: [
            { 
                name: 'Keuntungan Penjualan Aset', 
                value: toMiliar(getValueBySandi(targetKode, '04.20.01.00.00.00')),
                konven: toMiliar(getValueBySandi('KON', '04.20.01.00.00.00')),
                syariah: toMiliar(getValueBySandi('SYR', '04.20.01.00.00.00'))
            },
            { 
                name: 'Pendapatan Non-Op Lainnya', 
                value: toMiliar(sumByPrefix(targetKode, '04.20.99')),
                konven: toMiliar(sumByPrefix('KON', '04.20.99')),
                syariah: toMiliar(sumByPrefix('SYR', '04.20.99'))
            }
        ]
    };
    
    return {
        bungaImbalHasil: pendapatanBunga,
        operasionalLainnya: pendapatanOpLain,
        nonOperasional: pendapatanNonOp
    };
}

function renderPBPendapatanBarDetail(detailData) {
    const element = document.getElementById('pbPendapatanBarDetail');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    const data = detailData || PENDAPATAN_BIAYA_DATA.pendapatan;
    
    const options = {
        series: [{
            name: 'Konvensional',
            data: [data.bungaImbalHasil.konven, data.operasionalLainnya.konven, data.nonOperasional.konven]
        }, {
            name: 'Syariah',
            data: [data.bungaImbalHasil.syariah, data.operasionalLainnya.syariah, data.nonOperasional.syariah]
        }],
        chart: { type: 'bar', height: 300, stacked: true },
        colors: ['#1e3a5f', '#00b894'],
        plotOptions: {
            bar: { horizontal: false, columnWidth: '55%' }
        },
        xaxis: {
            categories: ['Bunga/Imbal Hasil', 'Operasional Lainnya', 'Non-Operasional']
        },
        yaxis: {
            labels: {
                formatter: (val) => 'Rp ' + val.toFixed(0) + ' M'
            }
        },
        legend: { position: 'top' },
        tooltip: {
            y: {
                formatter: (val) => 'Rp ' + val.toFixed(2) + ' Miliar'
            }
        }
    };
    
    new ApexCharts(element, options).render();
}

// ========================================
// DETAIL BIAYA
// ========================================

function renderPBDetailBiaya() {
    const container = document.getElementById('pbDetailBiayaContent');
    if (!container) return;
    
    // Get data from Firebase if available
    const detailData = getDetailBiayaFromFirebase();
    
    let html = `<div class="pb-detail-grid">`;
    
    Object.keys(detailData).forEach(key => {
        const category = detailData[key];
        html += `
            <div class="pb-detail-card">
                <div class="pb-detail-header expense-header">
                    <i class="fas fa-arrow-down"></i>
                    <h5>${category.label}</h5>
                </div>
                <div class="pb-detail-body">
                    ${category.items.map(item => `
                        <div class="pb-detail-item">
                            <span class="pb-item-name">${item.name}</span>
                            <span class="pb-item-value">(Rp ${formatPBNumber(item.value)} M)</span>
                        </div>
                    `).join('')}
                    <div class="pb-detail-item total-row">
                        <span class="pb-item-name">Total ${category.label}</span>
                        <span class="pb-item-value" style="color: #e74c3c;">(Rp ${formatPBNumber(category.total)} M)</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>
        <div class="pb-chart-card" style="margin-top: 1.5rem;">
            <div class="pb-chart-header">
                <h5><i class="fas fa-chart-bar"></i> Perbandingan Biaya per Kategori</h5>
            </div>
            <div id="pbBiayaBarDetail" style="height: 300px;"></div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Render bar chart
    setTimeout(() => renderPBBiayaBarDetail(detailData), 200);
}

function getDetailBiayaFromFirebase() {
    // Default: gunakan data dari PENDAPATAN_BIAYA_DATA yang sudah di-update
    const data = PENDAPATAN_BIAYA_DATA.biaya;
    
    if (typeof DashboardFirebase === 'undefined') {
        return data;
    }
    
    const fbData = DashboardFirebase.getData();
    const filters = DashboardFirebase.getFilters();
    
    if (!fbData || !fbData.labarugi || fbData.labarugi.length === 0) {
        return data;
    }
    
    const labarugi = fbData.labarugi;
    const periode = filters.periode;
    
    // Tentukan target kode
    let targetKode = 'ALL';
    if (filters.cabang) {
        targetKode = filters.cabang;
    } else if (filters.tipe === 'konvensional') {
        targetKode = 'KON';
    } else if (filters.tipe === 'syariah') {
        targetKode = 'SYR';
    }
    
    // Helper functions
    function getValueBySandi(kode, sandi) {
        const item = labarugi.find(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi === sandi
        );
        return item ? Math.abs(item.total || 0) : 0;
    }
    
    function sumByPrefix(kode, sandiPrefix) {
        const items = labarugi.filter(d => 
            d.kode_cabang === kode && 
            d.periode === periode && 
            d.sandi && d.sandi.startsWith(sandiPrefix)
        );
        return items.reduce((sum, d) => sum + Math.abs(d.total || 0), 0);
    }
    
    function toMiliar(val) {
        return val / 1e9;
    }
    
    // Build detail data from Firebase
    // 05.11 = Beban Bunga
    // 05.12 = Beban Operasional Lainnya
    // 05.20 = Beban Non Operasional
    
    const bebanBunga = {
        label: 'Beban Bunga / Bagi Hasil',
        total: toMiliar(sumByPrefix(targetKode, '05.11')),
        konven: toMiliar(sumByPrefix('KON', '05.11')),
        syariah: toMiliar(sumByPrefix('SYR', '05.11')),
        items: [
            { 
                name: 'Bunga Deposito', 
                value: toMiliar(sumByPrefix(targetKode, '05.11.03.03')),
                konven: toMiliar(sumByPrefix('KON', '05.11.03.03')),
                syariah: toMiliar(sumByPrefix('SYR', '05.11.03.03'))
            },
            { 
                name: 'Bunga Tabungan', 
                value: toMiliar(sumByPrefix(targetKode, '05.11.03.02')),
                konven: toMiliar(sumByPrefix('KON', '05.11.03.02')),
                syariah: toMiliar(sumByPrefix('SYR', '05.11.03.02'))
            },
            { 
                name: 'Bunga Giro', 
                value: toMiliar(sumByPrefix(targetKode, '05.11.03.01')),
                konven: toMiliar(sumByPrefix('KON', '05.11.03.01')),
                syariah: toMiliar(sumByPrefix('SYR', '05.11.03.01'))
            },
            { 
                name: 'Bunga Pinjaman Diterima', 
                value: toMiliar(sumByPrefix(targetKode, '05.11.05')),
                konven: toMiliar(sumByPrefix('KON', '05.11.05')),
                syariah: toMiliar(sumByPrefix('SYR', '05.11.05'))
            }
        ]
    };
    
    const bebanOperasional = {
        label: 'Beban Operasional',
        total: toMiliar(sumByPrefix(targetKode, '05.12')),
        konven: toMiliar(sumByPrefix('KON', '05.12')),
        syariah: toMiliar(sumByPrefix('SYR', '05.12')),
        items: [
            { 
                name: 'Beban Tenaga Kerja', 
                value: toMiliar(sumByPrefix(targetKode, '05.12.13')),
                konven: toMiliar(sumByPrefix('KON', '05.12.13')),
                syariah: toMiliar(sumByPrefix('SYR', '05.12.13'))
            },
            { 
                name: 'Beban CKPN/Penyisihan', 
                value: toMiliar(sumByPrefix(targetKode, '05.12.07')),
                konven: toMiliar(sumByPrefix('KON', '05.12.07')),
                syariah: toMiliar(sumByPrefix('SYR', '05.12.07'))
            },
            { 
                name: 'Beban Penyusutan', 
                value: toMiliar(sumByPrefix(targetKode, '05.12.11')),
                konven: toMiliar(sumByPrefix('KON', '05.12.11')),
                syariah: toMiliar(sumByPrefix('SYR', '05.12.11'))
            },
            { 
                name: 'Beban Umum & Administrasi', 
                value: toMiliar(sumByPrefix(targetKode, '05.12.99')),
                konven: toMiliar(sumByPrefix('KON', '05.12.99')),
                syariah: toMiliar(sumByPrefix('SYR', '05.12.99'))
            }
        ]
    };
    
    const bebanNonOp = {
        label: 'Beban Non-Operasional',
        total: toMiliar(sumByPrefix(targetKode, '05.20')),
        konven: toMiliar(sumByPrefix('KON', '05.20')),
        syariah: toMiliar(sumByPrefix('SYR', '05.20')),
        items: [
            { 
                name: 'Kerugian Penjualan Aset', 
                value: toMiliar(getValueBySandi(targetKode, '05.20.01.00.00.00')),
                konven: toMiliar(getValueBySandi('KON', '05.20.01.00.00.00')),
                syariah: toMiliar(getValueBySandi('SYR', '05.20.01.00.00.00'))
            },
            { 
                name: 'Beban Non-Op Lainnya', 
                value: toMiliar(sumByPrefix(targetKode, '05.20.99')),
                konven: toMiliar(sumByPrefix('KON', '05.20.99')),
                syariah: toMiliar(sumByPrefix('SYR', '05.20.99'))
            }
        ]
    };
    
    return {
        bungaBagiHasil: bebanBunga,
        operasional: bebanOperasional,
        nonOperasional: bebanNonOp
    };
}

function renderPBBiayaBarDetail(detailData) {
    const element = document.getElementById('pbBiayaBarDetail');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    const data = detailData || PENDAPATAN_BIAYA_DATA.biaya;
    
    const options = {
        series: [{
            name: 'Konvensional',
            data: [data.bungaBagiHasil.konven, data.operasional.konven, data.nonOperasional.konven]
        }, {
            name: 'Syariah',
            data: [data.bungaBagiHasil.syariah, data.operasional.syariah, data.nonOperasional.syariah]
        }],
        chart: { type: 'bar', height: 300, stacked: true },
        colors: ['#c0392b', '#f39c12'],
        plotOptions: {
            bar: { horizontal: false, columnWidth: '55%' }
        },
        xaxis: {
            categories: ['Bunga/Bagi Hasil', 'Operasional', 'Non-Operasional']
        },
        yaxis: {
            labels: {
                formatter: (val) => 'Rp ' + val.toFixed(0) + ' M'
            }
        },
        legend: { position: 'top' },
        tooltip: {
            y: {
                formatter: (val) => 'Rp ' + val.toFixed(2) + ' Miliar'
            }
        }
    };
    
    new ApexCharts(element, options).render();
}

// ========================================
// TREND CHARTS
// ========================================

function renderPBTrendCharts() {
    renderPBTrendMainChart();
    renderPBPendapatanBarChart();
    renderPBBiayaBarChart();
}

function renderPBTrendMainChart() {
    const element = document.getElementById('pbTrendChart');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    if (pbCharts.trendMain) {
        try { pbCharts.trendMain.destroy(); } catch(e) {}
    }
    
    element.innerHTML = '';
    
    const trend = PENDAPATAN_BIAYA_DATA.trend;
    
    const options = {
        series: [{
            name: 'Pendapatan',
            type: 'area',
            data: trend.pendapatan
        }, {
            name: 'Biaya',
            type: 'area',
            data: trend.biaya
        }, {
            name: 'Laba Bersih',
            type: 'line',
            data: trend.laba
        }],
        chart: { height: 400, type: 'line' },
        colors: ['#00b894', '#e74c3c', '#3498db'],
        stroke: {
            curve: 'smooth',
            width: [2, 2, 3]
        },
        fill: {
            type: ['gradient', 'gradient', 'solid'],
            gradient: { opacityFrom: 0.4, opacityTo: 0.1 }
        },
        xaxis: { categories: trend.months },
        yaxis: {
            labels: {
                formatter: (val) => 'Rp ' + val.toFixed(0) + ' M'
            }
        },
        legend: { position: 'top' },
        tooltip: {
            y: {
                formatter: (val) => 'Rp ' + val.toFixed(2) + ' Miliar'
            }
        }
    };
    
    pbCharts.trendMain = new ApexCharts(element, options);
    pbCharts.trendMain.render();
}

function renderPBPendapatanBarChart() {
    const element = document.getElementById('pbPendapatanBarChart');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    const trend = PENDAPATAN_BIAYA_DATA.trend;
    
    const options = {
        series: [{
            name: 'Pendapatan',
            data: trend.pendapatan
        }],
        chart: { type: 'bar', height: 300 },
        colors: ['#00b894'],
        plotOptions: {
            bar: { columnWidth: '60%', borderRadius: 4 }
        },
        xaxis: { categories: trend.months },
        yaxis: {
            labels: {
                formatter: (val) => val.toFixed(0) + ' M'
            }
        }
    };
    
    new ApexCharts(element, options).render();
}

function renderPBBiayaBarChart() {
    const element = document.getElementById('pbBiayaBarChart');
    if (!element || typeof ApexCharts === 'undefined') return;
    
    const trend = PENDAPATAN_BIAYA_DATA.trend;
    
    const options = {
        series: [{
            name: 'Biaya',
            data: trend.biaya
        }],
        chart: { type: 'bar', height: 300 },
        colors: ['#e74c3c'],
        plotOptions: {
            bar: { columnWidth: '60%', borderRadius: 4 }
        },
        xaxis: { categories: trend.months },
        yaxis: {
            labels: {
                formatter: (val) => val.toFixed(0) + ' M'
            }
        }
    };
    
    new ApexCharts(element, options).render();
}

// ========================================
// EXPORT EXCEL
// ========================================

function exportPendapatanBiayaExcel() {
    alert('Fitur Export Excel akan segera tersedia!');
    // TODO: Implement Excel export using SheetJS
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function formatPBNumber(num) {
    if (num === undefined || num === null) return '0.00';
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ========================================
// INITIALIZATION
// ========================================

function initPendapatanBiaya() {
    console.log('Initializing Pendapatan & Biaya module...');
    
    // Show default tab
    const tabRingkasan = document.getElementById('pbTabRingkasan');
    if (tabRingkasan) {
        tabRingkasan.style.display = 'block';
    }
    
    // Set first tab as active
    const firstTab = document.querySelector('.pb-tab[data-tab="ringkasan"]');
    if (firstTab) {
        document.querySelectorAll('.pb-tab').forEach(t => t.classList.remove('active'));
        firstTab.classList.add('active');
    }
    
    // Update from Firebase first
    setTimeout(() => {
        updatePBFromFirebase();
        renderPBRingkasanCharts();
        console.log('✅ Pendapatan & Biaya module initialized');
    }, 500);
}

function refreshPendapatanBiaya() {
    console.log('🔄 Refreshing Pendapatan & Biaya...');
    updatePBFromFirebase();
    renderPBRingkasanCharts();
}

// Export functions
window.switchPBTab = switchPBTab;
window.initPendapatanBiaya = initPendapatanBiaya;
window.refreshPendapatanBiaya = refreshPendapatanBiaya;
window.updatePBFromFirebase = updatePBFromFirebase;
window.exportPendapatanBiayaExcel = exportPendapatanBiayaExcel;
window.PENDAPATAN_BIAYA_DATA = PENDAPATAN_BIAYA_DATA;

console.log('Pendapatan & Biaya handler loaded');
