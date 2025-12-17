// =====================================================
// PIPELINE DPK & KREDIT HANDLER
// Bank Sulselbar Dashboard v20
// Data dari Firebase: banksulselbar_pipeline_dpk & banksulselbar_pipeline_kredit
// Upload data via Admin Panel
// =====================================================

// ==================== GLOBAL STATE ====================
let pipelineDPK = [];
let pipelineKredit = [];
let pipelineYear = 2025;

// ==================== FIREBASE LOADER ====================

async function loadPipelineFromFirebase() {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.warn('Firebase not available');
        showPipelineNotification('Firebase tidak tersedia', 'warning');
        return;
    }

    try {
        showPipelineLoading(true);
        const db = firebase.firestore();

        // Load Pipeline DPK
        const dpkSnapshot = await db.collection('banksulselbar_pipeline_dpk')
            .where('tahun', '==', pipelineYear)
            .get();

        pipelineDPK = [];
        dpkSnapshot.forEach(doc => {
            pipelineDPK.push({ id: doc.id, ...doc.data() });
        });

        // Load Pipeline Kredit
        const kreditSnapshot = await db.collection('banksulselbar_pipeline_kredit')
            .where('tahun', '==', pipelineYear)
            .get();

        pipelineKredit = [];
        kreditSnapshot.forEach(doc => {
            pipelineKredit.push({ id: doc.id, ...doc.data() });
        });

        console.log('✅ Pipeline loaded - DPK:', pipelineDPK.length, 'Kredit:', pipelineKredit.length);

        showPipelineLoading(false);
        renderPipelineDashboard();

    } catch (error) {
        console.error('Pipeline load error:', error);
        showPipelineLoading(false);
        showPipelineNotification('Gagal memuat data pipeline', 'error');
    }
}

// ==================== RENDER DASHBOARD ====================

function renderPipelineDashboard() {
    updatePipelineSummary();
    renderPipelineCharts();
    renderPipelineTable();
}

function updatePipelineSummary() {
    // Calculate totals
    let totalDPK = 0;
    let totalKredit = 0;
    const cabangSet = new Set();

    pipelineDPK.forEach(item => {
        totalDPK += sumRencana(item.rencana);
        if (item.kodeKantor) cabangSet.add(item.kodeKantor);
    });

    pipelineKredit.forEach(item => {
        totalKredit += sumRencana(item.rencana);
        if (item.kodeKantor) cabangSet.add(item.kodeKantor);
    });

    // Update DOM
    const el1 = document.getElementById('pipelineTotalDPK');
    const el2 = document.getElementById('pipelineTotalKredit');
    const el3 = document.getElementById('pipelineCabangCount');
    const el4 = document.getElementById('pipelineProdukCount');

    if (el1) el1.textContent = formatCurrency(totalDPK);
    if (el2) el2.textContent = formatCurrency(totalKredit);
    if (el3) el3.textContent = cabangSet.size;
    if (el4) el4.textContent = pipelineDPK.length + pipelineKredit.length;
}

function sumRencana(rencana) {
    if (!rencana) return 0;
    return Object.values(rencana).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
}

function formatCurrency(value) {
    if (!value || value === 0) return '-';
    if (value >= 1e12) return 'Rp ' + (value / 1e12).toFixed(2) + ' T';
    if (value >= 1e9) return 'Rp ' + (value / 1e9).toFixed(2) + ' M';
    if (value >= 1e6) return 'Rp ' + (value / 1e6).toFixed(2) + ' Jt';
    return 'Rp ' + value.toLocaleString('id-ID');
}

// ==================== CHARTS ====================

function renderPipelineCharts() {
    renderPipelineByMonthChart();
    renderPipelineByBranchChart();
}

function renderPipelineByMonthChart() {
    const el = document.getElementById('pipelineByMonthChart');
    if (!el) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthKeys = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];

    const dpkByMonth = monthKeys.map(key => 
        pipelineDPK.reduce((sum, item) => sum + (item.rencana?.[key] || 0), 0)
    );

    const kreditByMonth = monthKeys.map(key => 
        pipelineKredit.reduce((sum, item) => sum + (item.rencana?.[key] || 0), 0)
    );

    const options = {
        series: [
            { name: 'DPK', data: dpkByMonth },
            { name: 'Kredit/Pembiayaan', data: kreditByMonth }
        ],
        chart: { type: 'bar', height: 350 },
        plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
        colors: ['#28a745', '#007bff'],
        xaxis: { categories: months },
        yaxis: { labels: { formatter: val => formatCurrency(val) } },
        legend: { position: 'top' },
        tooltip: { y: { formatter: val => formatCurrency(val) } },
        dataLabels: { enabled: false }
    };

    el.innerHTML = '';
    new ApexCharts(el, options).render();
}

function renderPipelineByBranchChart() {
    const el = document.getElementById('pipelineByBranchChart');
    if (!el) return;

    // Group by branch
    const branchData = {};

    pipelineDPK.forEach(item => {
        const key = item.namaKantor || item.kodeKantor || 'Unknown';
        if (!branchData[key]) branchData[key] = { dpk: 0, kredit: 0 };
        branchData[key].dpk += sumRencana(item.rencana);
    });

    pipelineKredit.forEach(item => {
        const key = item.namaKantor || item.kodeKantor || 'Unknown';
        if (!branchData[key]) branchData[key] = { dpk: 0, kredit: 0 };
        branchData[key].kredit += sumRencana(item.rencana);
    });

    const branches = Object.keys(branchData);

    if (!branches.length) {
        el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:350px;color:#888;">Belum ada data pipeline</div>';
        return;
    }

    const options = {
        series: [
            { name: 'DPK', data: branches.map(b => branchData[b].dpk) },
            { name: 'Kredit', data: branches.map(b => branchData[b].kredit) }
        ],
        chart: { type: 'bar', height: 350, stacked: true },
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
        colors: ['#28a745', '#007bff'],
        xaxis: { labels: { formatter: val => formatCurrency(val) } },
        yaxis: { categories: branches },
        legend: { position: 'top' },
        tooltip: { y: { formatter: val => formatCurrency(val) } }
    };

    el.innerHTML = '';
    new ApexCharts(el, options).render();
}

// ==================== TABLE ====================

function renderPipelineTable() {
    const tbody = document.getElementById('pipelineTableBody');
    if (!tbody) return;

    const typeFilter = document.getElementById('pipelineTypeFilter')?.value || 'all';

    let allData = [];

    if (typeFilter === 'all' || typeFilter === 'dpk') {
        allData = allData.concat(pipelineDPK.map(d => ({ ...d, tipe: 'dpk' })));
    }
    if (typeFilter === 'all' || typeFilter === 'kredit') {
        allData = allData.concat(pipelineKredit.map(d => ({ ...d, tipe: 'kredit' })));
    }

    if (!allData.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;color:#888;padding:60px;">
                    <i class="fas fa-inbox fa-3x" style="margin-bottom:16px;opacity:0.5;"></i><br>
                    Belum ada data pipeline.<br>
                    <small>Silakan upload data melalui Admin Panel.</small>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    allData.forEach(item => {
        const q1 = (item.rencana?.januari || 0) + (item.rencana?.februari || 0) + (item.rencana?.maret || 0);
        const q2 = (item.rencana?.april || 0) + (item.rencana?.mei || 0) + (item.rencana?.juni || 0);
        const q3 = (item.rencana?.juli || 0) + (item.rencana?.agustus || 0) + (item.rencana?.september || 0);
        const q4 = (item.rencana?.oktober || 0) + (item.rencana?.november || 0) + (item.rencana?.desember || 0);
        const total = q1 + q2 + q3 + q4;

        html += `
            <tr>
                <td>${item.kodeKantor || '-'}</td>
                <td>${item.namaKantor || '-'}</td>
                <td><span class="badge ${item.tipe === 'dpk' ? 'badge-success' : 'badge-primary'}">${item.tipe.toUpperCase()}</span></td>
                <td>${item.kodeProduk || '-'} - ${item.namaProduk || '-'}</td>
                <td style="text-align:right;">${formatCurrency(q1)}</td>
                <td style="text-align:right;">${formatCurrency(q2)}</td>
                <td style="text-align:right;">${formatCurrency(q3)}</td>
                <td style="text-align:right;">${formatCurrency(q4)}</td>
                <td style="text-align:right;"><strong>${formatCurrency(total)}</strong></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ==================== PERIOD CHANGE ====================

function changePipelineYear() {
    const el = document.getElementById('pipelineYearSelect');
    if (el) pipelineYear = parseInt(el.value);
    loadPipelineFromFirebase();
}

// ==================== EXPORT ====================

function exportPipelineData() {
    const allData = [...pipelineDPK, ...pipelineKredit];

    if (!allData.length) {
        showPipelineNotification('Tidak ada data untuk di-export', 'warning');
        return;
    }

    const exportData = allData.map(item => ({
        'Kode Kantor': item.kodeKantor,
        'Nama Kantor': item.namaKantor,
        'Tipe': item.tipe || (pipelineDPK.includes(item) ? 'DPK' : 'KREDIT'),
        'Kode Produk': item.kodeProduk,
        'Nama Produk': item.namaProduk,
        'Januari': item.rencana?.januari || 0,
        'Februari': item.rencana?.februari || 0,
        'Maret': item.rencana?.maret || 0,
        'April': item.rencana?.april || 0,
        'Mei': item.rencana?.mei || 0,
        'Juni': item.rencana?.juni || 0,
        'Juli': item.rencana?.juli || 0,
        'Agustus': item.rencana?.agustus || 0,
        'September': item.rencana?.september || 0,
        'Oktober': item.rencana?.oktober || 0,
        'November': item.rencana?.november || 0,
        'Desember': item.rencana?.desember || 0
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pipeline Data');
    XLSX.writeFile(wb, `Pipeline_Export_${pipelineYear}.xlsx`);

    showPipelineNotification('Export berhasil!', 'success');
}

// ==================== UTILITIES ====================

function showPipelineLoading(show) {
    const loader = document.getElementById('pipelineLoadingOverlay');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function showPipelineNotification(message, type = 'info') {
    const colors = { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#007bff' };
    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' };

    const notif = document.createElement('div');
    notif.style.cssText = `position:fixed;top:20px;right:20px;padding:16px 24px;background:${colors[type]};color:white;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;display:flex;align-items:center;gap:10px;animation:slideIn 0.3s ease;`;
    notif.innerHTML = `<i class="fas fa-${icons[type]}"></i> ${message}`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// ==================== INITIALIZATION ====================

function initPipelineDashboard() {
    console.log('🚀 Initializing Pipeline Dashboard...');
    loadPipelineFromFirebase();
}

// Event listener
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('pipelineTypeFilter')?.addEventListener('change', renderPipelineTable);

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            if (this.dataset.section === 'pipeline') {
                setTimeout(initPipelineDashboard, 100);
            }
        });
    });
});

// ==================== GLOBAL EXPORTS ====================
window.initPipelineDashboard = initPipelineDashboard;
window.loadPipelineFromFirebase = loadPipelineFromFirebase;
window.changePipelineYear = changePipelineYear;
window.exportPipelineData = exportPipelineData;
window.renderPipelineTable = renderPipelineTable;

console.log('✅ Pipeline Module Loaded');
