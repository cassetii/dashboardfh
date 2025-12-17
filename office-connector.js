// ========================================
// OFFICE CONNECTOR - BANK SULSELBAR
// Data Kode Kantor Lengkap & Akurat
// Total: 101 Unit Kerja Aktif
// ========================================

console.log('ðŸ”— Loading Office Connector Bank Sulselbar...');

// ========================================
// TIPE KANTOR
// ========================================
const OFFICE_TYPES = {
    'PUSAT': { label: 'Kantor Pusat', icon: 'ðŸ›ï¸', color: '#1f2937' },
    'CABANG': { label: 'Cabang', icon: 'ðŸ¢', color: '#0066cc' },
    'KCP': { label: 'Kantor Cabang Pembantu', icon: 'ðŸ¬', color: '#059669' },
    'KF': { label: 'Kantor Fungsional', icon: 'ðŸ’¼', color: '#d97706' },
    'KCS': { label: 'Cabang Syariah', icon: 'ðŸŒ™', color: '#7c3aed' },
    'KF_SYARIAH': { label: 'KF Syariah', icon: 'â˜ªï¸', color: '#be185d' }
};

// ========================================
// DAFTAR KODE KANTOR BANK SULSELBAR
// ========================================

const OFFICE_LIST = {
    '000': { name: 'Kantor Pusat', type: 'PUSAT', parent: null, businessLine: 'konsolidasi', status: 'AKTIF' },
    '10': { name: 'Cabang Maros', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '11': { name: 'Cabang Pangkep', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '12': { name: 'KF Segeri', type: 'KF', parent: '11', businessLine: 'konvensional', status: 'AKTIF' },
    '13': { name: 'KF RSUD Salewangan', type: 'KF', parent: '10', businessLine: 'konvensional', status: 'AKTIF' },
    '14': { name: 'KF Camba', type: 'KF', parent: '10', businessLine: 'konvensional', status: 'AKTIF' },
    '15': { name: 'KF Bantimurung', type: 'KF', parent: '10', businessLine: 'konvensional', status: 'AKTIF' },
    '16': { name: 'KF Bungoro', type: 'KF', parent: '11', businessLine: 'konvensional', status: 'AKTIF' },
    '20': { name: 'Cabang Jeneponto', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '21': { name: 'Cabang Takalar', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '22': { name: 'KF Bangkala', type: 'KF', parent: '20', businessLine: 'konvensional', status: 'AKTIF' },
    '23': { name: 'KF Galesong', type: 'KF', parent: '21', businessLine: 'konvensional', status: 'AKTIF' },
    '24': { name: 'KF Polongbangkeng Utara', type: 'KF', parent: '21', businessLine: 'konvensional', status: 'AKTIF' },
    '30': { name: 'Cabang Parepare', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '31': { name: 'Cabang Barru', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '32': { name: 'KF RSUD Andi Makkasau', type: 'KF', parent: '30', businessLine: 'konvensional', status: 'AKTIF' },
    '33': { name: 'KF Soppeng Riaja', type: 'KF', parent: '31', businessLine: 'konvensional', status: 'AKTIF' },
    '34': { name: 'KF Pekkae', type: 'KF', parent: '31', businessLine: 'konvensional', status: 'AKTIF' },
    '35': { name: 'KF Kas Ralla', type: 'KF', parent: '31', businessLine: 'konvensional', status: 'AKTIF' },
    '40': { name: 'Cabang Bulukumba', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '41': { name: 'Cabang Bantaeng', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '42': { name: 'Cabang Selayar', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '43': { name: 'KF Banyorang', type: 'KF', parent: '41', businessLine: 'konvensional', status: 'AKTIF' },
    '44': { name: 'KF Bupati Selayar', type: 'KF', parent: '42', businessLine: 'konvensional', status: 'TIDAK AKTIF' },
    '45': { name: 'KF Lanto Dg Pasewang', type: 'KF', parent: '40', businessLine: 'konvensional', status: 'AKTIF' },
    '46': { name: 'KF Kajang', type: 'KF', parent: '40', businessLine: 'konvensional', status: 'AKTIF' },
    '47': { name: 'KF Tanete', type: 'KF', parent: '40', businessLine: 'konvensional', status: 'AKTIF' },
    '48': { name: 'KF Bonto Bahari', type: 'KF', parent: '40', businessLine: 'konvensional', status: 'AKTIF' },
    '50': { name: 'Cabang Pinrang', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '51': { name: 'KF Duampanua', type: 'KF', parent: '50', businessLine: 'konvensional', status: 'AKTIF' },
    '52': { name: 'KF PPKAD Pinrang', type: 'KF', parent: '50', businessLine: 'konvensional', status: 'AKTIF' },
    '60': { name: 'Cabang Sinjai', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '61': { name: 'KF Bikeru', type: 'KF', parent: '60', businessLine: 'konvensional', status: 'AKTIF' },
    '62': { name: 'KF KPTSP Sinjai', type: 'KF', parent: '60', businessLine: 'konvensional', status: 'TIDAK AKTIF' },
    '70': { name: 'Cabang Polman', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '71': { name: 'Cabang Utama Mamuju', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '72': { name: 'Cabang Majene', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '73': { name: 'KCP Wonomulyo', type: 'KCP', parent: '70', businessLine: 'konvensional', status: 'AKTIF' },
    '74': { name: 'Cabang Mamasa', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '75': { name: 'Cabang Pasangkayu', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '76': { name: 'KF Tinambung', type: 'KF', parent: '70', businessLine: 'konvensional', status: 'AKTIF' },
    '77': { name: 'Cabang Topoyo', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '78': { name: 'KF Sendana', type: 'KF', parent: '72', businessLine: 'konvensional', status: 'AKTIF' },
    '79': { name: 'KF Kalukku', type: 'KF', parent: '71', businessLine: 'konvensional', status: 'AKTIF' },
    '80': { name: 'Cabang Utama Bone', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '81': { name: 'KF Mare', type: 'KF', parent: '80', businessLine: 'konvensional', status: 'AKTIF' },
    '82': { name: 'KF Uloe', type: 'KF', parent: '80', businessLine: 'konvensional', status: 'AKTIF' },
    '83': { name: 'KF Lappariaja', type: 'KF', parent: '80', businessLine: 'konvensional', status: 'AKTIF' },
    '88': { name: 'KCP Kahu', type: 'KCP', parent: '80', businessLine: 'konvensional', status: 'AKTIF' },
    '90': { name: 'Cabang Palopo', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '91': { name: 'Cabang Masamba', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '92': { name: 'Cabang Belopa', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '93': { name: 'Cabang Malili', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '94': { name: 'KCP Walenrang', type: 'KCP', parent: '92', businessLine: 'konvensional', status: 'AKTIF' },
    '95': { name: 'KCP Tomoni', type: 'KCP', parent: '93', businessLine: 'konvensional', status: 'AKTIF' },
    '96': { name: 'KCP Sorowako', type: 'KCP', parent: '93', businessLine: 'konvensional', status: 'AKTIF' },
    '97': { name: 'KF Padang Sappa', type: 'KF', parent: '92', businessLine: 'konvensional', status: 'AKTIF' },
    '98': { name: 'KF RSU Sawerigading', type: 'KF', parent: '90', businessLine: 'konvensional', status: 'AKTIF' },
    '99': { name: 'KF KPTSP Palopo', type: 'KF', parent: '90', businessLine: 'konvensional', status: 'TIDAK AKTIF' },
    '100': { name: 'Cabang Sengkang', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '101': { name: 'Cabang Soppeng', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '102': { name: 'KCP Siwa', type: 'KCP', parent: '100', businessLine: 'konvensional', status: 'AKTIF' },
    '103': { name: 'KCP Cabenge', type: 'KCP', parent: '101', businessLine: 'konvensional', status: 'AKTIF' },
    '104': { name: 'KF Atapange', type: 'KF', parent: '100', businessLine: 'konvensional', status: 'AKTIF' },
    '105': { name: 'KF Takalala', type: 'KF', parent: '101', businessLine: 'konvensional', status: 'AKTIF' },
    '110': { name: 'Cabang Makale', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '111': { name: 'Cabang Rantepao', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '120': { name: 'Cabang Sidrap', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '121': { name: 'Cabang Enrekang', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '122': { name: 'KCP Tanru Tedong', type: 'KCP', parent: '120', businessLine: 'konvensional', status: 'AKTIF' },
    '123': { name: 'KCP Alla', type: 'KCP', parent: '121', businessLine: 'konvensional', status: 'AKTIF' },
    '124': { name: 'KCP Rappang', type: 'KCP', parent: '120', businessLine: 'konvensional', status: 'AKTIF' },
    '125': { name: 'KF Amparita', type: 'KF', parent: '120', businessLine: 'konvensional', status: 'AKTIF' },
    '126': { name: 'KF Baraka', type: 'KF', parent: '121', businessLine: 'konvensional', status: 'AKTIF' },
    '130': { name: 'Cabang Utama Makassar', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '131': { name: 'Cabang Gowa', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '132': { name: 'KF Samsat Sulsel', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '133': { name: 'KF Gubernur Sulsel', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '134': { name: 'KF Maccini', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '135': { name: 'KF PU Sulsel', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '136': { name: 'KF Disdik Sulsel', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '137': { name: 'KF RSUD Labuang Baji', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '138': { name: 'KCP Daya', type: 'KCP', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '139': { name: 'KCP Antang', type: 'KCP', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '140': { name: 'KF Talasalapang', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '141': { name: 'KF IPDN Makassar', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '142': { name: 'KF RSUD Haji', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '143': { name: 'KF DPRD Sulsel', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '144': { name: 'KF BKPMD Makassar', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '145': { name: 'KF Dispenda Sulsel', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '146': { name: 'KF Balaikota', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '147': { name: 'KF Priority Banking', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '148': { name: 'KF RSKD Dadi', type: 'KF', parent: '130', businessLine: 'konvensional', status: 'AKTIF' },
    '150': { name: 'KF Bajeng', type: 'KF', parent: '131', businessLine: 'konvensional', status: 'AKTIF' },
    '206': { name: 'KF Gubernur Sulbar', type: 'KF', parent: '71', businessLine: 'konvensional', status: 'AKTIF' },
    '221': { name: 'KF Baras', type: 'KF', parent: '75', businessLine: 'konvensional', status: 'AKTIF' },
    '300': { name: 'KF Larompong', type: 'KF', parent: '92', businessLine: 'konvensional', status: 'AKTIF' },
    '301': { name: 'KF Bua', type: 'KF', parent: '92', businessLine: 'konvensional', status: 'AKTIF' },
    '306': { name: 'KF Bone Bone', type: 'KF', parent: '91', businessLine: 'konvensional', status: 'AKTIF' },
    '400': { name: 'Cabang Khusus Jakarta', type: 'CABANG', parent: '000', businessLine: 'konvensional', status: 'AKTIF' },
    '510': { name: 'Cabang Syariah Makassar', type: 'KCS', parent: '000', businessLine: 'syariah', status: 'AKTIF' },
    '511': { name: 'KF Menara UMI', type: 'KF_SYARIAH', parent: '510', businessLine: 'syariah', status: 'AKTIF' },
    '520': { name: 'Cabang Syariah Sengkang', type: 'KCS', parent: '000', businessLine: 'syariah', status: 'AKTIF' },
    '530': { name: 'Cabang Syariah Maros', type: 'KCS', parent: '000', businessLine: 'syariah', status: 'AKTIF' },
    '540': { name: 'Cabang Syariah Mamuju', type: 'KCS', parent: '000', businessLine: 'syariah', status: 'AKTIF' }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

function getOffice(code) { return OFFICE_LIST[code] || null; }
function getAllOfficesArray() { return Object.entries(OFFICE_LIST).map(([code, data]) => ({ code, ...data })); }
function getOfficesByType(type) { return getAllOfficesArray().filter(o => o.type === type); }
function getActiveOffices() { return getAllOfficesArray().filter(o => o.status === 'AKTIF'); }
function getChildOffices(parentCode) { return getAllOfficesArray().filter(o => o.parent === parentCode); }

function generateOfficeOptions(filterType = null, filterBiz = null, activeOnly = true) {
    let offices = getAllOfficesArray();
    if (activeOnly) offices = offices.filter(o => o.status === 'AKTIF');
    if (filterType) offices = offices.filter(o => o.type === filterType);
    if (filterBiz) offices = offices.filter(o => o.businessLine === filterBiz);
    offices.sort((a, b) => parseInt(a.code) - parseInt(b.code));
    
    const konven = offices.filter(o => o.businessLine === 'konvensional' || o.businessLine === 'konsolidasi');
    const syariah = offices.filter(o => o.businessLine === 'syariah');
    
    let html = '';
    if (konven.length > 0) {
        html += `<optgroup label="ðŸ¢ Konvensional (${konven.length})">`;
        konven.forEach(o => {
            const icon = OFFICE_TYPES[o.type]?.icon || 'ðŸ“';
            html += `<option value="${o.code}" data-name="${o.name}" data-type="${o.type}" data-business="${o.businessLine}">${o.code} - ${o.name} ${icon}</option>`;
        });
        html += `</optgroup>`;
    }
    if (syariah.length > 0) {
        html += `<optgroup label="ðŸŒ™ Syariah (${syariah.length})">`;
        syariah.forEach(o => {
            const icon = OFFICE_TYPES[o.type]?.icon || 'ðŸ“';
            html += `<option value="${o.code}" data-name="${o.name}" data-type="${o.type}" data-business="${o.businessLine}">${o.code} - ${o.name} ${icon}</option>`;
        });
        html += `</optgroup>`;
    }
    return html;
}

// ========================================
// STORAGE
// ========================================

function addNewOffice(code, name, type, parent, businessLine, status = 'AKTIF') {
    if (OFFICE_LIST[code]) return false;
    OFFICE_LIST[code] = { name, type, parent, businessLine, status };
    localStorage.setItem('bank_sulselbar_offices', JSON.stringify(OFFICE_LIST));
    return true;
}

function loadOfficeList() {
    try {
        const saved = localStorage.getItem('bank_sulselbar_offices');
        if (saved) Object.assign(OFFICE_LIST, JSON.parse(saved));
    } catch (e) {}
}
loadOfficeList();

const TARGET_KEY = 'bank_sulselbar_targets_v2';
const REAL_KEY = 'bank_sulselbar_realizations_v2';

function saveOfficeTarget(code, period, data) {
    let all = JSON.parse(localStorage.getItem(TARGET_KEY) || '{}');
    if (!all[period]) all[period] = {};
    all[period][code] = data;
    localStorage.setItem(TARGET_KEY, JSON.stringify(all));
}

function getOfficeTarget(code, period) {
    return JSON.parse(localStorage.getItem(TARGET_KEY) || '{}')[period]?.[code] || null;
}

function saveOfficeRealization(code, period, data) {
    let all = JSON.parse(localStorage.getItem(REAL_KEY) || '{}');
    if (!all[period]) all[period] = {};
    all[period][code] = data;
    localStorage.setItem(REAL_KEY, JSON.stringify(all));
}

function getOfficeRealization(code, period) {
    return JSON.parse(localStorage.getItem(REAL_KEY) || '{}')[period]?.[code] || null;
}

// ========================================
// MODAL PILIH KANTOR SAAT IMPORT
// ========================================

function showOfficeSelectionModal(callback) {
    const existing = document.getElementById('officeSelectModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="officeSelectModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;">
            <div style="background:white;border-radius:16px;width:90%;max-width:500px;box-shadow:0 25px 50px rgba(0,0,0,0.25);">
                <div style="padding:20px 24px;background:linear-gradient(135deg,#0066cc,#0052a3);color:white;border-radius:16px 16px 0 0;">
                    <h3 style="margin:0;font-size:18px;"><i class="fas fa-building"></i> Pilih Kantor</h3>
                </div>
                <div style="padding:24px;">
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Filter</label>
                        <select id="officeBusinessFilter" onchange="filterOfficeOptions()" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                            <option value="">Semua</option>
                            <option value="konvensional">Konvensional</option>
                            <option value="syariah">Syariah</option>
                        </select>
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Kantor <span style="color:#ef4444;">*</span></label>
                        <select id="officeCodeSelect" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                            <option value="">-- Pilih Kantor --</option>
                            ${generateOfficeOptions()}
                        </select>
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px;">Periode</label>
                        <select id="targetPeriodSelect" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px;">
                        <p style="margin:0;font-size:13px;color:#166534;"><i class="fas fa-info-circle"></i> Data Excel = <strong>REALISASI</strong></p>
                    </div>
                </div>
                <div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:12px;background:#f9fafb;border-radius:0 0 16px 16px;">
                    <button onclick="closeOfficeSelectModal()" style="padding:10px 20px;border:1px solid #d1d5db;background:white;border-radius:8px;cursor:pointer;">Batal</button>
                    <button onclick="confirmOfficeSelection()" style="padding:10px 20px;border:none;background:#0066cc;color:white;border-radius:8px;cursor:pointer;"><i class="fas fa-check"></i> Konfirmasi</button>
                </div>
            </div>
        </div>`);
    window._officeSelectCallback = callback;
}

function filterOfficeOptions() {
    const biz = document.getElementById('officeBusinessFilter').value;
    document.getElementById('officeCodeSelect').innerHTML = `<option value="">-- Pilih Kantor --</option>` + generateOfficeOptions(null, biz || null);
}

function closeOfficeSelectModal() { document.getElementById('officeSelectModal')?.remove(); }

function confirmOfficeSelection() {
    const sel = document.getElementById('officeCodeSelect');
    if (!sel.value) { alert('Pilih kantor!'); return; }
    const opt = sel.options[sel.selectedIndex];
    closeOfficeSelectModal();
    if (window._officeSelectCallback) window._officeSelectCallback({
        branchCode: sel.value, branchName: opt.dataset.name, businessLine: opt.dataset.business,
        targetPeriod: document.getElementById('targetPeriodSelect').value
    });
}

// ========================================
// IMPORT EXCEL DENGAN OFFICE SELECTION
// ========================================

function importFromExcelWithOfficeSelect(file) {
    return new Promise((resolve, reject) => {
        showOfficeSelectionModal((officeData) => {
            if (typeof XLSX === 'undefined') { reject(new Error('SheetJS not found')); return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                    const processed = [];
                    for (let i = 3; i < json.length; i++) {
                        const r = json[i];
                        if (r.length > 0) processed.push({
                            "POS": r[0] || "", "SANDI": r[7] || "",
                            "010": r[8] || "", "011": r[9] || "", "020": r[10] || "", "021": r[11] || "",
                            "030": r[12] || "", "031": r[13] || "", "040": r[14] || "", "041": r[15] || ""
                        });
                    }
                    resolve({ branchInfo: officeData, data: processed, fileName: file.name, importDate: new Date().toISOString() });
                } catch (err) { reject(err); }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    });
}

// ========================================
// MODAL TARGET
// ========================================

function showTargetEntryModal() {
    document.getElementById('targetEntryModal')?.remove();
    document.body.insertAdjacentHTML('beforeend', `
        <div id="targetEntryModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;overflow-y:auto;">
            <div style="background:white;border-radius:16px;width:100%;max-width:700px;max-height:90vh;overflow-y:auto;">
                <div style="padding:20px 24px;background:linear-gradient(135deg,#059669,#047857);color:white;position:sticky;top:0;z-index:10;border-radius:16px 16px 0 0;">
                    <h3 style="margin:0;"><i class="fas fa-bullseye"></i> Input Target (Pusat)</h3>
                </div>
                <div style="padding:24px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                        <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Kantor *</label><select id="targetOfficeCode" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"><option value="">-- Pilih --</option>${generateOfficeOptions()}</select></div>
                        <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Periode</label><select id="targetPeriodInput" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"><option value="2025-Q1">2025 Q1</option><option value="2025-Q2">2025 Q2</option><option value="2025-Q3">2025 Q3</option><option value="2025-Q4">2025 Q4</option></select></div>
                    </div>
                    <h4 style="margin-bottom:12px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;"><i class="fas fa-balance-scale" style="color:#0066cc;"></i> Neraca</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
                        <div><label style="font-size:12px;color:#6b7280;">Asset (Juta)</label><input type="number" id="targetAsset" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                        <div><label style="font-size:12px;color:#6b7280;">DPK (Juta)</label><input type="number" id="targetDPK" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                        <div><label style="font-size:12px;color:#6b7280;">Kredit (Juta)</label><input type="number" id="targetKredit" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                    </div>
                    <h4 style="margin-bottom:12px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;"><i class="fas fa-chart-line" style="color:#059669;"></i> Laba Rugi</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
                        <div><label style="font-size:12px;color:#6b7280;">Pendapatan (Juta)</label><input type="number" id="targetPendapatan" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                        <div><label style="font-size:12px;color:#6b7280;">Biaya (Juta)</label><input type="number" id="targetBiaya" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                        <div><label style="font-size:12px;color:#6b7280;">Laba (Juta)</label><input type="number" id="targetLaba" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                    </div>
                    <h4 style="margin-bottom:12px;border-bottom:2px solid #e5e7eb;padding-bottom:8px;"><i class="fas fa-percent" style="color:#f59e0b;"></i> Rasio</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;">
                        <div><label style="font-size:12px;color:#6b7280;">NPL Max (%)</label><input type="number" id="targetNPL" step="0.01" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                        <div><label style="font-size:12px;color:#6b7280;">LDR (%)</label><input type="number" id="targetLDR" step="0.01" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                        <div><label style="font-size:12px;color:#6b7280;">CAR Min (%)</label><input type="number" id="targetCAR" step="0.01" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                        <div><label style="font-size:12px;color:#6b7280;">ROA (%)</label><input type="number" id="targetROA" step="0.01" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                    </div>
                </div>
                <div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:12px;background:#f9fafb;border-radius:0 0 16px 16px;">
                    <button onclick="document.getElementById('targetEntryModal').remove()" style="padding:10px 20px;border:1px solid #d1d5db;background:white;border-radius:8px;cursor:pointer;">Batal</button>
                    <button onclick="saveTargetFromModal()" style="padding:10px 20px;border:none;background:#059669;color:white;border-radius:8px;cursor:pointer;"><i class="fas fa-save"></i> Simpan</button>
                </div>
            </div>
        </div>`);
}

function saveTargetFromModal() {
    const code = document.getElementById('targetOfficeCode').value;
    if (!code) { alert('Pilih kantor!'); return; }
    const office = getOffice(code);
    const period = document.getElementById('targetPeriodInput').value;
    saveOfficeTarget(code, period, {
        branchCode: code, branchName: office.name, period,
        targets: {
            asset: parseFloat(document.getElementById('targetAsset').value) || 0,
            dpk: parseFloat(document.getElementById('targetDPK').value) || 0,
            kredit: parseFloat(document.getElementById('targetKredit').value) || 0,
            pendapatan: parseFloat(document.getElementById('targetPendapatan').value) || 0,
            biaya: parseFloat(document.getElementById('targetBiaya').value) || 0,
            laba: parseFloat(document.getElementById('targetLaba').value) || 0,
            npl: parseFloat(document.getElementById('targetNPL').value) || 0,
            ldr: parseFloat(document.getElementById('targetLDR').value) || 0,
            car: parseFloat(document.getElementById('targetCAR').value) || 0,
            roa: parseFloat(document.getElementById('targetROA').value) || 0
        },
        setBy: 'PUSAT', setAt: new Date().toISOString()
    });
    alert(`âœ… Target ${office.name} (${period}) disimpan!`);
    document.getElementById('targetEntryModal').remove();
}

// ========================================
// MODAL DAFTAR KANTOR
// ========================================

function showOfficeListModal() {
    document.getElementById('officeListModal')?.remove();
    
    const offices = getAllOfficesArray();
    const cabang = offices.filter(o => o.type === 'CABANG' && o.status === 'AKTIF');
    const kcp = offices.filter(o => o.type === 'KCP' && o.status === 'AKTIF');
    const kf = offices.filter(o => o.type === 'KF' && o.status === 'AKTIF');
    const kcs = offices.filter(o => o.type === 'KCS' && o.status === 'AKTIF');
    const kfs = offices.filter(o => o.type === 'KF_SYARIAH' && o.status === 'AKTIF');
    
    let rows = '';
    const addSection = (title, bg, list, color) => {
        rows += `<tr style="background:${bg};"><td colspan="4" style="padding:12px;font-weight:700;color:white;">${title} (${list.length})</td></tr>`;
        list.sort((a,b)=>parseInt(a.code)-parseInt(b.code)).forEach(o => {
            const p = getOffice(o.parent);
            const indent = o.type==='CABANG'||o.type==='KCS'||o.type==='PUSAT'?'':'â†³ ';
            rows += `<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 12px;font-family:monospace;font-weight:600;color:${color};">${o.code}</td><td style="padding:10px 12px;">${indent}${o.name}</td><td style="padding:10px 12px;font-size:11px;color:#6b7280;">${OFFICE_TYPES[o.type]?.label||o.type}</td><td style="padding:10px 12px;font-size:12px;color:#9ca3af;">${p?.name||o.parent||'-'}</td></tr>`;
        });
    };
    
    addSection('ðŸ¢ CABANG', 'linear-gradient(135deg,#0066cc,#0052a3)', cabang, '#0066cc');
    addSection('ðŸ¬ KCP', 'linear-gradient(135deg,#059669,#047857)', kcp, '#059669');
    addSection('ðŸ’¼ KF', 'linear-gradient(135deg,#d97706,#b45309)', kf, '#d97706');
    addSection('ðŸŒ™ SYARIAH', 'linear-gradient(135deg,#7c3aed,#5b21b6)', [...kcs,...kfs], '#7c3aed');
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="officeListModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;">
            <div style="background:white;border-radius:16px;width:100%;max-width:900px;max-height:85vh;display:flex;flex-direction:column;">
                <div style="padding:20px 24px;background:linear-gradient(135deg,#1f2937,#111827);color:white;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center;">
                    <h3 style="margin:0;"><i class="fas fa-building"></i> Daftar Kode Kantor</h3>
                    <div style="display:flex;gap:8px;font-size:12px;">
                        <span style="background:#0066cc;padding:4px 10px;border-radius:15px;">Cab: ${cabang.length}</span>
                        <span style="background:#059669;padding:4px 10px;border-radius:15px;">KCP: ${kcp.length}</span>
                        <span style="background:#d97706;padding:4px 10px;border-radius:15px;">KF: ${kf.length}</span>
                        <span style="background:#7c3aed;padding:4px 10px;border-radius:15px;">Syr: ${kcs.length+kfs.length}</span>
                    </div>
                </div>
                <div style="flex:1;overflow-y:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead style="position:sticky;top:0;background:white;z-index:5;"><tr style="border-bottom:2px solid #e5e7eb;"><th style="padding:12px;text-align:left;font-size:11px;color:#6b7280;">KODE</th><th style="padding:12px;text-align:left;font-size:11px;color:#6b7280;">NAMA</th><th style="padding:12px;text-align:left;font-size:11px;color:#6b7280;">TIPE</th><th style="padding:12px;text-align:left;font-size:11px;color:#6b7280;">INDUK</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
                <div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;background:#f9fafb;border-radius:0 0 16px 16px;">
                    <span style="font-size:13px;color:#6b7280;">Total: <strong>${getActiveOffices().length}</strong> aktif</span>
                    <button onclick="document.getElementById('officeListModal').remove()" style="padding:10px 20px;border:1px solid #d1d5db;background:white;border-radius:8px;cursor:pointer;">Tutup</button>
                </div>
            </div>
        </div>`);
}

// ========================================
// MODAL TAMBAH KANTOR - MULTIPLE KCP/KF
// ========================================

let kcpCounter = 0, kfCounter = 0, kfSyariahCounter = 0;

function showAddOfficeModal() {
    document.getElementById('addOfficeModal')?.remove();
    kcpCounter = 0; kfCounter = 0; kfSyariahCounter = 0;
    
    const cabOpts = getOfficesByType('CABANG').filter(o=>o.status==='AKTIF').sort((a,b)=>parseInt(a.code)-parseInt(b.code)).map(o=>`<option value="${o.code}">${o.code} - ${o.name}</option>`).join('');
    const kcsOpts = getOfficesByType('KCS').filter(o=>o.status==='AKTIF').map(o=>`<option value="${o.code}">${o.code} - ${o.name}</option>`).join('');
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="addOfficeModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;overflow-y:auto;">
            <div style="background:white;border-radius:16px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;">
                <div style="padding:20px 24px;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;border-radius:16px 16px 0 0;position:sticky;top:0;z-index:10;">
                    <h3 style="margin:0;"><i class="fas fa-plus-circle"></i> Tambah Kantor Baru</h3>
                </div>
                <div style="padding:24px;">
                    <!-- Tipe -->
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Tipe Kantor <span style="color:#ef4444;">*</span></label>
                        <select id="newOfficeType" onchange="onOfficeTypeChange()" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                            <option value="">-- Pilih --</option>
                            <option value="CABANG">ðŸ¢ Cabang Konvensional</option>
                            <option value="KCP">ðŸ¬ KCP</option>
                            <option value="KF">ðŸ’¼ KF</option>
                            <option value="KCS">ðŸŒ™ Cabang Syariah</option>
                            <option value="KF_SYARIAH">â˜ªï¸ KF Syariah</option>
                        </select>
                    </div>
                    
                    <!-- Induk -->
                    <div id="parentSection" style="display:none;margin-bottom:16px;">
                        <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Kantor Induk <span style="color:#ef4444;">*</span></label>
                        <select id="newOfficeParent" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;">
                            <option value="">-- Pilih --</option>
                            <optgroup label="Cabang Konvensional" id="parentKonven">${cabOpts}</optgroup>
                            <optgroup label="Cabang Syariah" id="parentSyariah">${kcsOpts}</optgroup>
                        </select>
                    </div>
                    
                    <!-- Kode & Nama -->
                    <div style="display:grid;grid-template-columns:120px 1fr;gap:12px;margin-bottom:20px;">
                        <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Kode <span style="color:#ef4444;">*</span></label><input type="text" id="newOfficeCode" placeholder="152" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;font-family:monospace;font-weight:600;font-size:15px;"></div>
                        <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Nama <span style="color:#ef4444;">*</span></label><input type="text" id="newOfficeName" placeholder="Cabang Wajo" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;"></div>
                    </div>
                    
                    <!-- Kode Tambahan -->
                    <div id="additionalCodesSection" style="display:none;padding-top:20px;border-top:2px dashed #e5e7eb;">
                        <h4 style="margin:0 0 16px 0;font-size:14px;color:#374151;"><i class="fas fa-code-branch" style="color:#7c3aed;"></i> Kode Tambahan (Opsional)</h4>
                        
                        <!-- KCP -->
                        <div id="kcpSection" style="margin-bottom:16px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span style="font-size:14px;font-weight:600;color:#059669;">ðŸ¬ KCP</span>
                                <button type="button" onclick="addKcpInput()" style="padding:6px 12px;border:1px solid #059669;background:white;color:#059669;border-radius:6px;cursor:pointer;font-size:12px;"><i class="fas fa-plus"></i> Tambah KCP</button>
                            </div>
                            <div id="kcpContainer"></div>
                        </div>
                        
                        <!-- KF -->
                        <div id="kfSection" style="margin-bottom:16px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span style="font-size:14px;font-weight:600;color:#d97706;">ðŸ’¼ KF</span>
                                <button type="button" onclick="addKfInput()" style="padding:6px 12px;border:1px solid #d97706;background:white;color:#d97706;border-radius:6px;cursor:pointer;font-size:12px;"><i class="fas fa-plus"></i> Tambah KF</button>
                            </div>
                            <div id="kfContainer"></div>
                        </div>
                        
                        <!-- Syariah -->
                        <div id="syariahSection" style="margin-bottom:16px;">
                            <div style="margin-bottom:8px;"><span style="font-size:14px;font-weight:600;color:#7c3aed;">ðŸŒ™ Layanan Syariah</span></div>
                            <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;padding:10px;background:#f5f3ff;border-radius:8px;border:1px solid #ddd6fe;">
                                <input type="text" id="syariahCode" placeholder="Kode" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;font-family:monospace;font-weight:600;">
                                <input type="text" id="syariahName" placeholder="Nama (opsional)" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;">
                            </div>
                        </div>
                        
                        <!-- KF Syariah -->
                        <div id="kfSyariahSection" style="display:none;margin-bottom:16px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span style="font-size:14px;font-weight:600;color:#be185d;">â˜ªï¸ KF Syariah</span>
                                <button type="button" onclick="addKfSyariahInput()" style="padding:6px 12px;border:1px solid #be185d;background:white;color:#be185d;border-radius:6px;cursor:pointer;font-size:12px;"><i class="fas fa-plus"></i> Tambah</button>
                            </div>
                            <div id="kfSyariahContainer"></div>
                        </div>
                    </div>
                </div>
                <div style="padding:16px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:12px;background:#f9fafb;border-radius:0 0 16px 16px;position:sticky;bottom:0;">
                    <button onclick="document.getElementById('addOfficeModal').remove()" style="padding:10px 20px;border:1px solid #d1d5db;background:white;border-radius:8px;cursor:pointer;">Batal</button>
                    <button onclick="saveNewOfficeFromModal()" style="padding:10px 20px;border:none;background:#7c3aed;color:white;border-radius:8px;cursor:pointer;"><i class="fas fa-save"></i> Simpan</button>
                </div>
            </div>
        </div>`);
}

function addKcpInput() {
    kcpCounter++;
    document.getElementById('kcpContainer').insertAdjacentHTML('beforeend', `
        <div id="kcp${kcpCounter}" style="display:grid;grid-template-columns:100px 1fr 30px;gap:8px;margin-bottom:8px;padding:10px;background:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0;">
            <input type="text" class="kcpCode" placeholder="Kode" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;font-family:monospace;font-weight:600;">
            <input type="text" class="kcpName" placeholder="Nama KCP" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;">
            <button type="button" onclick="this.parentElement.remove()" style="padding:4px 8px;border:none;background:#ef4444;color:white;border-radius:4px;cursor:pointer;">âœ•</button>
        </div>`);
}

function addKfInput() {
    kfCounter++;
    document.getElementById('kfContainer').insertAdjacentHTML('beforeend', `
        <div id="kf${kfCounter}" style="display:grid;grid-template-columns:100px 1fr 30px;gap:8px;margin-bottom:8px;padding:10px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a;">
            <input type="text" class="kfCode" placeholder="Kode" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;font-family:monospace;font-weight:600;">
            <input type="text" class="kfName" placeholder="Nama KF" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;">
            <button type="button" onclick="this.parentElement.remove()" style="padding:4px 8px;border:none;background:#ef4444;color:white;border-radius:4px;cursor:pointer;">âœ•</button>
        </div>`);
}

function addKfSyariahInput() {
    kfSyariahCounter++;
    document.getElementById('kfSyariahContainer').insertAdjacentHTML('beforeend', `
        <div id="kfSyr${kfSyariahCounter}" style="display:grid;grid-template-columns:100px 1fr 30px;gap:8px;margin-bottom:8px;padding:10px;background:#fdf2f8;border-radius:8px;border:1px solid #fbcfe8;">
            <input type="text" class="kfSyariahCode" placeholder="Kode" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;font-family:monospace;font-weight:600;">
            <input type="text" class="kfSyariahName" placeholder="Nama" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;">
            <button type="button" onclick="this.parentElement.remove()" style="padding:4px 8px;border:none;background:#ef4444;color:white;border-radius:4px;cursor:pointer;">âœ•</button>
        </div>`);
}

function onOfficeTypeChange() {
    const type = document.getElementById('newOfficeType').value;
    const ps = document.getElementById('parentSection');
    const pk = document.getElementById('parentKonven');
    const psy = document.getElementById('parentSyariah');
    const add = document.getElementById('additionalCodesSection');
    const kcpSec = document.getElementById('kcpSection');
    const kfSec = document.getElementById('kfSection');
    const syrSec = document.getElementById('syariahSection');
    const kfsSec = document.getElementById('kfSyariahSection');
    
    // Clear
    document.getElementById('kcpContainer').innerHTML = '';
    document.getElementById('kfContainer').innerHTML = '';
    document.getElementById('kfSyariahContainer').innerHTML = '';
    document.getElementById('syariahCode').value = '';
    document.getElementById('syariahName').value = '';
    
    if (type === 'KCP' || type === 'KF') {
        ps.style.display = 'block'; pk.style.display = ''; psy.style.display = 'none'; add.style.display = 'none';
    } else if (type === 'KF_SYARIAH') {
        ps.style.display = 'block'; pk.style.display = 'none'; psy.style.display = ''; add.style.display = 'none';
    } else if (type === 'CABANG') {
        ps.style.display = 'none'; add.style.display = 'block';
        kcpSec.style.display = 'block'; kfSec.style.display = 'block'; syrSec.style.display = 'block'; kfsSec.style.display = 'none';
    } else if (type === 'KCS') {
        ps.style.display = 'none'; add.style.display = 'block';
        kcpSec.style.display = 'none'; kfSec.style.display = 'none'; syrSec.style.display = 'none'; kfsSec.style.display = 'block';
    } else {
        ps.style.display = 'none'; add.style.display = 'none';
    }
}

function saveNewOfficeFromModal() {
    const type = document.getElementById('newOfficeType').value;
    const code = document.getElementById('newOfficeCode').value.trim();
    const name = document.getElementById('newOfficeName').value.trim();
    const parent = document.getElementById('newOfficeParent')?.value || '000';
    
    if (!type || !code || !name) { alert('âš ï¸ Lengkapi Tipe, Kode, dan Nama!'); return; }
    if (OFFICE_LIST[code]) { alert(`âš ï¸ Kode ${code} sudah ada!`); return; }
    
    const biz = (type === 'KCS' || type === 'KF_SYARIAH') ? 'syariah' : 'konvensional';
    const parentCode = (type === 'CABANG' || type === 'KCS') ? '000' : parent;
    
    const toAdd = [];
    const errors = [];
    
    // Main
    toAdd.push({ code, name, type, parent: parentCode, businessLine: biz });
    
    // KCPs
    document.querySelectorAll('.kcpCode').forEach((inp, i) => {
        const c = inp.value.trim();
        const n = document.querySelectorAll('.kcpName')[i].value.trim() || `KCP ${name}`;
        if (c) {
            if (OFFICE_LIST[c] || toAdd.find(o => o.code === c)) errors.push(`KCP ${c} duplikat!`);
            else toAdd.push({ code: c, name: n, type: 'KCP', parent: code, businessLine: 'konvensional' });
        }
    });
    
    // KFs
    document.querySelectorAll('.kfCode').forEach((inp, i) => {
        const c = inp.value.trim();
        const n = document.querySelectorAll('.kfName')[i].value.trim() || `KF ${name}`;
        if (c) {
            if (OFFICE_LIST[c] || toAdd.find(o => o.code === c)) errors.push(`KF ${c} duplikat!`);
            else toAdd.push({ code: c, name: n, type: 'KF', parent: code, businessLine: 'konvensional' });
        }
    });
    
    // Syariah
    const syrCode = document.getElementById('syariahCode')?.value.trim();
    const syrName = document.getElementById('syariahName')?.value.trim() || `Layanan Syariah ${name}`;
    if (syrCode) {
        if (OFFICE_LIST[syrCode] || toAdd.find(o => o.code === syrCode)) errors.push(`Syariah ${syrCode} duplikat!`);
        else toAdd.push({ code: syrCode, name: syrName, type: 'KCS', parent: '000', businessLine: 'syariah' });
    }
    
    // KF Syariah
    document.querySelectorAll('.kfSyariahCode').forEach((inp, i) => {
        const c = inp.value.trim();
        const n = document.querySelectorAll('.kfSyariahName')[i].value.trim() || `KF Syariah ${name}`;
        if (c) {
            if (OFFICE_LIST[c] || toAdd.find(o => o.code === c)) errors.push(`KF Syariah ${c} duplikat!`);
            else toAdd.push({ code: c, name: n, type: 'KF_SYARIAH', parent: code, businessLine: 'syariah' });
        }
    });
    
    if (errors.length > 0) { alert('âš ï¸ Error:\n' + errors.join('\n')); return; }
    
    toAdd.forEach(o => addNewOffice(o.code, o.name, o.type, o.parent, o.businessLine));
    
    let msg = `âœ… Berhasil tambah ${toAdd.length} kantor:\n\n`;
    toAdd.forEach((o, i) => { msg += `${i+1}. ${OFFICE_TYPES[o.type]?.icon||'ðŸ“'} ${o.code} - ${o.name}\n`; });
    alert(msg);
    document.getElementById('addOfficeModal').remove();
}

function triggerImportFile() {
    let f = document.getElementById('importFileInput');
    if (!f) { f = document.createElement('input'); f.type='file'; f.id='importFileInput'; f.accept='.xlsx,.json'; f.style.display='none'; document.body.appendChild(f); }
    f.click();
}

// ========================================
// EXPORTS
// ========================================

window.OFFICE_LIST = OFFICE_LIST;
window.OFFICE_TYPES = OFFICE_TYPES;
window.getOffice = getOffice;
window.getAllOfficesArray = getAllOfficesArray;
window.getOfficesByType = getOfficesByType;
window.getActiveOffices = getActiveOffices;
window.getChildOffices = getChildOffices;
window.generateOfficeOptions = generateOfficeOptions;
window.showOfficeSelectionModal = showOfficeSelectionModal;
window.filterOfficeOptions = filterOfficeOptions;
window.closeOfficeSelectModal = closeOfficeSelectModal;
window.confirmOfficeSelection = confirmOfficeSelection;
window.importFromExcelWithOfficeSelect = importFromExcelWithOfficeSelect;
window.addNewOffice = addNewOffice;
window.showTargetEntryModal = showTargetEntryModal;
window.saveTargetFromModal = saveTargetFromModal;
window.showAddOfficeModal = showAddOfficeModal;
window.showOfficeListModal = showOfficeListModal;
window.triggerImportFile = triggerImportFile;
window.saveOfficeTarget = saveOfficeTarget;
window.getOfficeTarget = getOfficeTarget;
window.saveOfficeRealization = saveOfficeRealization;
window.getOfficeRealization = getOfficeRealization;
window.onOfficeTypeChange = onOfficeTypeChange;
window.addKcpInput = addKcpInput;
window.addKfInput = addKfInput;
window.addKfSyariahInput = addKfSyariahInput;

console.log('âœ… Office Connector loaded - ' + getActiveOffices().length + ' kantor aktif');
