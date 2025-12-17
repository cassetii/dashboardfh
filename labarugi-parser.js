/**
 * ==========================================
 * LABA RUGI PARSER - BANK SULSELBAR
 * ==========================================
 * Fungsi untuk parsing file Excel Laba Rugi
 * dan menyimpan ke Firebase Firestore
 * 
 * Collection: banksulselbar_labarugi
 * Document ID: {periode}_{kodeCabang}_{sandi}
 * 
 * Author: Claude AI
 * Version: 1.0
 * ==========================================
 */

console.log('📊 Loading Laba Rugi Parser...');

// ==========================================
// KONFIGURASI MAPPING KOLOM EXCEL
// ==========================================

const LABARUGI_CONFIG = {
    // Sheet name yang akan dibaca
    sheetName: 'Labarugi',
    
    // Baris awal data (0-indexed), setelah header
    dataStartRow: 7,
    
    // Kolom untuk sandi laporan (0-indexed)
    sandiColumn: 8,
    
    // Mapping kolom cabang konvensional
    // Format: kode_cabang: { rupiah: col_index, valas: col_index }
    cabangKonvensional: {
        '010': { nama: 'CABANG MAROS', rupiah: 25, valas: 26 },
        '011': { nama: 'CABANG PANGKEP', rupiah: 27, valas: 28 },
        '020': { nama: 'CABANG JENEPONTO', rupiah: 29, valas: 30 },
        '021': { nama: 'CABANG TAKALAR', rupiah: 31, valas: 32 },
        '030': { nama: 'CABANG PAREPARE', rupiah: 33, valas: 34 },
        '031': { nama: 'CABANG BARRU', rupiah: 35, valas: 36 },
        '040': { nama: 'CABANG BULUKUMBA', rupiah: 37, valas: 38 },
        '041': { nama: 'CABANG BANTAENG', rupiah: 39, valas: 40 },
        '042': { nama: 'CABANG SELAYAR', rupiah: 41, valas: 42 },
        '050': { nama: 'CABANG PINRANG', rupiah: 43, valas: 44 },
        '060': { nama: 'CABANG SINJAI', rupiah: 45, valas: 46 },
        '070': { nama: 'CABANG POLMAN', rupiah: 47, valas: 48 },
        '071': { nama: 'CABANG UTAMA MAMUJU', rupiah: 49, valas: 50 },
        '072': { nama: 'CABANG MAJENE', rupiah: 51, valas: 52 },
        '074': { nama: 'CABANG MAMASA', rupiah: 53, valas: 54 },
        '075': { nama: 'CABANG PASANGKAYU', rupiah: 55, valas: 56 },
        '077': { nama: 'CABANG TOPOYO', rupiah: 57, valas: 58 },
        '080': { nama: 'CABANG UTAMA BONE', rupiah: 59, valas: 60 },
        '090': { nama: 'CABANG PALOPO', rupiah: 61, valas: 62 },
        '091': { nama: 'CABANG MASAMBA', rupiah: 63, valas: 64 },
        '092': { nama: 'CABANG BELOPA', rupiah: 65, valas: 66 },
        '093': { nama: 'CABANG MALILI', rupiah: 67, valas: 68 },
        '100': { nama: 'CABANG SENGKANG', rupiah: 69, valas: 70 },
        '101': { nama: 'CABANG SOPPENG', rupiah: 71, valas: 72 },
        '110': { nama: 'CABANG MAKALE', rupiah: 73, valas: 74 },
        '111': { nama: 'CABANG RANTEPAO', rupiah: 75, valas: 76 },
        '120': { nama: 'CABANG SIDRAP', rupiah: 77, valas: 78 },
        '121': { nama: 'CABANG ENREKANG', rupiah: 79, valas: 80 },
        '130': { nama: 'CABANG UTAMA MAKASSAR', rupiah: 81, valas: 82 },
        '131': { nama: 'CABANG GOWA', rupiah: 83, valas: 84 },
        '400': { nama: 'CABANG KHUSUS JAKARTA', rupiah: 85, valas: 86 },
        '001': { nama: 'KANTOR PUSAT', rupiah: 87, valas: 88 }
    },
    
    // Mapping kolom cabang syariah
    cabangSyariah: {
        '510': { nama: 'CABANG SYARIAH MAKASSAR', rupiah: 94, valas: 95 },
        '520': { nama: 'CABANG SYARIAH SENGKANG', rupiah: 96, valas: 97 },
        '530': { nama: 'CABANG SYARIAH MAROS', rupiah: 98, valas: 99 },
        '540': { nama: 'CABANG SYARIAH MAMUJU', rupiah: 100, valas: 101 },
        '500': { nama: 'UUS', rupiah: 102, valas: 103 }
    },
    
    // Kolom untuk total konvensional
    totalKonvensional: {
        rupiah: 9,
        valas: 10,
        total: 11
    },
    
    // Kolom untuk total syariah
    totalSyariah: {
        rupiah: 13,
        valas: 14,
        total: 15
    },
    
    // Kolom untuk total konsolidasi
    totalKonsolidasi: {
        rupiah: 17,
        valas: 18,
        total: 19
    }
};

// ==========================================
// MAPPING NAMA BULAN
// ==========================================

const BULAN_MAP = {
    'jan': { bulan: 'Januari', periode: '01' },
    'januari': { bulan: 'Januari', periode: '01' },
    'feb': { bulan: 'Februari', periode: '02' },
    'februari': { bulan: 'Februari', periode: '02' },
    'mar': { bulan: 'Maret', periode: '03' },
    'maret': { bulan: 'Maret', periode: '03' },
    'apr': { bulan: 'April', periode: '04' },
    'april': { bulan: 'April', periode: '04' },
    'mei': { bulan: 'Mei', periode: '05' },
    'may': { bulan: 'Mei', periode: '05' },
    'jun': { bulan: 'Juni', periode: '06' },
    'juni': { bulan: 'Juni', periode: '06' },
    'jul': { bulan: 'Juli', periode: '07' },
    'juli': { bulan: 'Juli', periode: '07' },
    'agu': { bulan: 'Agustus', periode: '08' },
    'agustus': { bulan: 'Agustus', periode: '08' },
    'aug': { bulan: 'Agustus', periode: '08' },
    'sep': { bulan: 'September', periode: '09' },
    'september': { bulan: 'September', periode: '09' },
    'okt': { bulan: 'Oktober', periode: '10' },
    'oktober': { bulan: 'Oktober', periode: '10' },
    'oct': { bulan: 'Oktober', periode: '10' },
    'nov': { bulan: 'November', periode: '11' },
    'november': { bulan: 'November', periode: '11' },
    'des': { bulan: 'Desember', periode: '12' },
    'desember': { bulan: 'Desember', periode: '12' },
    'dec': { bulan: 'Desember', periode: '12' }
};

// ==========================================
// LABA RUGI PARSER CLASS
// ==========================================

class LabaRugiParser {
    
    constructor() {
        this.config = LABARUGI_CONFIG;
        this.parsedData = [];
        this.summaryData = {};
        this.errors = [];
    }
    
    /**
     * Extract periode dari nama file
     * Contoh: "jan_2025.xlsx" -> { periode: "2025-01", bulan: "Januari", tahun: 2025 }
     */
    extractPeriodeFromFilename(filename) {
        console.log('📅 Extracting periode from:', filename);
        
        // Hapus ekstensi
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').toLowerCase();
        
        // Cari pattern bulan
        let bulanInfo = null;
        let tahun = null;
        
        // Cari bulan
        for (const [key, value] of Object.entries(BULAN_MAP)) {
            if (nameWithoutExt.includes(key)) {
                bulanInfo = value;
                break;
            }
        }
        
        // Cari tahun (4 digit)
        const tahunMatch = nameWithoutExt.match(/20\d{2}/);
        if (tahunMatch) {
            tahun = parseInt(tahunMatch[0]);
        }
        
        if (!bulanInfo || !tahun) {
            throw new Error(`Tidak dapat menentukan periode dari nama file: ${filename}. Format yang diharapkan: Bulan_Tahun.xlsx (contoh: Januari_2025.xlsx)`);
        }
        
        return {
            periode: `${tahun}-${bulanInfo.periode}`,
            bulan: bulanInfo.bulan,
            tahun: tahun,
            periodeName: `${bulanInfo.bulan} ${tahun}`
        };
    }
    
    /**
     * Parse file Excel
     * @param {File} file - File Excel yang diupload
     * @returns {Promise<Object>} - Data hasil parsing
     */
    async parseExcelFile(file) {
        console.log('📂 Parsing Excel file:', file.name);
        
        return new Promise((resolve, reject) => {
            // Check XLSX library
            if (typeof XLSX === 'undefined') {
                reject(new Error('Library XLSX (SheetJS) tidak ditemukan. Pastikan sudah di-load.'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    // Read workbook
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    console.log('📊 Available sheets:', workbook.SheetNames);
                    
                    // Get Labarugi sheet
                    if (!workbook.SheetNames.includes(this.config.sheetName)) {
                        throw new Error(`Sheet "${this.config.sheetName}" tidak ditemukan dalam file Excel`);
                    }
                    
                    const worksheet = workbook.Sheets[this.config.sheetName];
                    
                    // Convert to array of arrays
                    const rows = XLSX.utils.sheet_to_json(worksheet, { 
                        header: 1, 
                        defval: null,
                        raw: true
                    });
                    
                    console.log(`📋 Total rows in sheet: ${rows.length}`);
                    
                    // Extract periode from filename
                    const periodeInfo = this.extractPeriodeFromFilename(file.name);
                    console.log('📅 Periode:', periodeInfo);
                    
                    // Parse the data
                    const result = this.parseRows(rows, periodeInfo);
                    
                    resolve(result);
                    
                } catch (error) {
                    console.error('❌ Parse error:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Gagal membaca file'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * Parse rows dari sheet Excel
     */
    parseRows(rows, periodeInfo) {
        console.log('🔄 Parsing rows...');
        
        this.parsedData = [];
        this.summaryData = {
            konsolidasi: {},
            konvensional: {},
            syariah: {}
        };
        this.errors = [];
        
        const allCabang = {
            ...this.config.cabangKonvensional,
            ...this.config.cabangSyariah
        };
        
        let processedRows = 0;
        let skippedRows = 0;
        
        // Loop through data rows
        for (let i = this.config.dataStartRow; i < rows.length; i++) {
            const row = rows[i];
            
            if (!row) {
                skippedRows++;
                continue;
            }
            
            // Get sandi from column 8
            const sandi = row[this.config.sandiColumn];
            
            // Skip rows without sandi
            if (!sandi || String(sandi).trim() === '' || String(sandi).trim() === 'nan') {
                skippedRows++;
                continue;
            }
            
            const sandiStr = String(sandi).trim();
            
            // Get pos description (combine columns 1-5 for full description)
            const pos = this.extractPosDescription(row);
            
            // Process each cabang
            for (const [kodeCabang, cabangInfo] of Object.entries(allCabang)) {
                const rupiah = this.parseNumber(row[cabangInfo.rupiah]);
                const valas = this.parseNumber(row[cabangInfo.valas]);
                
                // Determine tipe cabang
                const tipe = this.config.cabangSyariah[kodeCabang] ? 'syariah' : 'konvensional';
                
                // Create document ID
                const docId = `${periodeInfo.periode}_${kodeCabang}_${sandiStr.replace(/\./g, '')}`;
                
                // Create data object
                const dataObj = {
                    id: docId,
                    periode: periodeInfo.periode,
                    bulan: periodeInfo.bulan,
                    tahun: periodeInfo.tahun,
                    periodeName: periodeInfo.periodeName,
                    kode_cabang: kodeCabang,
                    nama_cabang: cabangInfo.nama,
                    tipe: tipe,
                    sandi: sandiStr,
                    pos: pos,
                    rupiah: rupiah,
                    valas: valas,
                    total: rupiah + valas,
                    row_index: i,
                    created_at: new Date().toISOString()
                };
                
                this.parsedData.push(dataObj);
            }
            
            // Also capture summary totals
            this.captureSummary(row, sandiStr, pos);
            
            processedRows++;
        }
        
        console.log(`✅ Processed: ${processedRows} rows with sandi`);
        console.log(`⏭️ Skipped: ${skippedRows} rows without sandi`);
        console.log(`📊 Total records: ${this.parsedData.length}`);
        
        return {
            success: true,
            periode: periodeInfo,
            totalRecords: this.parsedData.length,
            totalRows: processedRows,
            skippedRows: skippedRows,
            data: this.parsedData,
            summary: this.summaryData,
            errors: this.errors
        };
    }
    
    /**
     * Extract pos description from row
     */
    extractPosDescription(row) {
        // Columns 1-5 contain the description parts
        const parts = [];
        for (let i = 1; i <= 5; i++) {
            if (row[i] && String(row[i]).trim() !== '' && String(row[i]).trim() !== 'nan') {
                parts.push(String(row[i]).trim());
            }
        }
        return parts.join(' ').trim() || 'Tidak ada deskripsi';
    }
    
    /**
     * Parse number from cell value
     */
    parseNumber(value) {
        if (value === null || value === undefined || value === '' || value === 'nan') {
            return 0;
        }
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }
    
    /**
     * Capture summary totals
     */
    captureSummary(row, sandi, pos) {
        // Konvensional total
        const konvenRp = this.parseNumber(row[this.config.totalKonvensional.rupiah]);
        const konvenVl = this.parseNumber(row[this.config.totalKonvensional.valas]);
        
        this.summaryData.konvensional[sandi] = {
            sandi: sandi,
            pos: pos,
            rupiah: konvenRp,
            valas: konvenVl,
            total: konvenRp + konvenVl
        };
        
        // Syariah total
        const syariahRp = this.parseNumber(row[this.config.totalSyariah.rupiah]);
        const syariahVl = this.parseNumber(row[this.config.totalSyariah.valas]);
        
        this.summaryData.syariah[sandi] = {
            sandi: sandi,
            pos: pos,
            rupiah: syariahRp,
            valas: syariahVl,
            total: syariahRp + syariahVl
        };
        
        // Konsolidasi total
        const konsolRp = this.parseNumber(row[this.config.totalKonsolidasi.rupiah]);
        const konsolVl = this.parseNumber(row[this.config.totalKonsolidasi.valas]);
        
        this.summaryData.konsolidasi[sandi] = {
            sandi: sandi,
            pos: pos,
            rupiah: konsolRp,
            valas: konsolVl,
            total: konsolRp + konsolVl
        };
    }
    
    /**
     * Get parsed data
     */
    getParsedData() {
        return this.parsedData;
    }
    
    /**
     * Get summary data
     */
    getSummaryData() {
        return this.summaryData;
    }
}

// ==========================================
// FIREBASE UPLOAD FUNCTIONS
// ==========================================

/**
 * Upload parsed data ke Firebase
 * @param {Array} data - Array of parsed data objects
 * @param {Object} options - Upload options
 */
async function uploadLabaRugiToFirebase(data, options = {}) {
    console.log('🔥 Uploading Laba Rugi data to Firebase...');
    console.log(`📊 Total records to upload: ${data.length}`);
    
    // Check Firebase
    if (typeof FirebaseConnector === 'undefined' || !FirebaseConnector.isInitialized) {
        throw new Error('Firebase belum diinisialisasi. Panggil FirebaseConnector.init() terlebih dahulu.');
    }
    
    const db = FirebaseConnector.db;
    const collectionName = options.collection || 'banksulselbar_labarugi';
    const batchSize = options.batchSize || 500; // Firestore batch limit
    
    let uploaded = 0;
    let errors = [];
    
    // Process in batches
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = db.batch();
        const chunk = data.slice(i, i + batchSize);
        
        for (const item of chunk) {
            const docRef = db.collection(collectionName).doc(item.id);
            batch.set(docRef, item);
        }
        
        try {
            await batch.commit();
            uploaded += chunk.length;
            console.log(`✅ Batch uploaded: ${uploaded}/${data.length}`);
            
            // Progress callback
            if (options.onProgress) {
                options.onProgress({
                    uploaded: uploaded,
                    total: data.length,
                    percent: Math.round((uploaded / data.length) * 100)
                });
            }
        } catch (error) {
            console.error(`❌ Batch error at index ${i}:`, error);
            errors.push({ index: i, error: error.message });
        }
    }
    
    console.log(`✅ Upload complete: ${uploaded}/${data.length} records`);
    
    return {
        success: errors.length === 0,
        uploaded: uploaded,
        total: data.length,
        errors: errors
    };
}

/**
 * Upload summary data ke monthlyData collection
 */
async function uploadSummaryToFirebase(periode, summary, options = {}) {
    console.log('📊 Uploading summary to Firebase...');
    
    if (typeof FirebaseConnector === 'undefined' || !FirebaseConnector.isInitialized) {
        throw new Error('Firebase belum diinisialisasi.');
    }
    
    const db = FirebaseConnector.db;
    const docRef = db.collection('banksulselbar_monthly').doc(periode);
    
    try {
        // Get existing data
        const doc = await docRef.get();
        const existingData = doc.exists ? doc.data() : {};
        
        // Merge labarugi summary
        const updatedData = {
            ...existingData,
            labarugi: {
                ...existingData.labarugi,
                konsolidasi: summary.konsolidasi,
                konvensional: summary.konvensional,
                syariah: summary.syariah
            },
            metadata: {
                ...existingData.metadata,
                labarugiUpdatedAt: new Date().toISOString()
            }
        };
        
        await docRef.set(updatedData, { merge: true });
        console.log('✅ Summary uploaded successfully');
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Summary upload error:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
// UI INTEGRATION FUNCTIONS
// ==========================================

/**
 * Handle file upload dari input element
 */
async function handleLabaRugiFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📂 File selected:', file.name);
    
    try {
        // Show loading
        showLabaRugiLoading('Membaca file Excel...');
        
        // Parse file
        const parser = new LabaRugiParser();
        const result = await parser.parseExcelFile(file);
        
        if (!result.success) {
            throw new Error('Gagal parsing file');
        }
        
        // Hide loading
        hideLabaRugiLoading();
        
        // Show preview
        showLabaRugiPreview(result);
        
    } catch (error) {
        hideLabaRugiLoading();
        console.error('❌ Error:', error);
        alert('❌ Error: ' + error.message);
    }
    
    // Reset input
    event.target.value = '';
}

/**
 * Show loading indicator
 */
function showLabaRugiLoading(message = 'Memproses...') {
    // Remove existing
    hideLabaRugiLoading();
    
    const html = `
        <div id="labarugiLoadingOverlay" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
                max-width: 400px;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid #e0e0e0;
                    border-top: 4px solid #0066cc;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p style="margin: 0; font-size: 16px; color: #333;" id="labarugiLoadingText">${message}</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Hide loading indicator
 */
function hideLabaRugiLoading() {
    const overlay = document.getElementById('labarugiLoadingOverlay');
    if (overlay) overlay.remove();
}

/**
 * Update loading text
 */
function updateLabaRugiLoadingText(message) {
    const text = document.getElementById('labarugiLoadingText');
    if (text) text.textContent = message;
}

/**
 * Show preview modal before upload
 */
function showLabaRugiPreview(result) {
    // Store for later use
    window.pendingLabaRugiData = result;
    
    const html = `
        <div id="labarugiPreviewModal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        ">
            <div style="
                background: white;
                border-radius: 16px;
                width: 95%;
                max-width: 700px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <div style="
                    padding: 20px 24px;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; font-size: 20px;">
                        📊 Preview Import Laba Rugi
                    </h3>
                    <button onclick="closeLabaRugiPreview()" style="
                        background: none;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: #888;
                    ">×</button>
                </div>
                
                <div style="padding: 24px; overflow-y: auto; flex: 1;">
                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 12px;
                        margin-bottom: 20px;
                    ">
                        <h4 style="margin: 0 0 10px 0;">📅 ${result.periode.periodeName}</h4>
                        <p style="margin: 0; opacity: 0.9;">Periode: ${result.periode.periode}</p>
                    </div>
                    
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 16px;
                        margin-bottom: 20px;
                    ">
                        <div style="
                            background: #e8f5e9;
                            padding: 16px;
                            border-radius: 10px;
                            text-align: center;
                        ">
                            <div style="font-size: 28px; font-weight: bold; color: #2e7d32;">
                                ${result.totalRecords.toLocaleString()}
                            </div>
                            <div style="font-size: 13px; color: #666;">Total Records</div>
                        </div>
                        <div style="
                            background: #e3f2fd;
                            padding: 16px;
                            border-radius: 10px;
                            text-align: center;
                        ">
                            <div style="font-size: 28px; font-weight: bold; color: #1565c0;">
                                ${result.totalRows}
                            </div>
                            <div style="font-size: 13px; color: #666;">Baris dengan Sandi</div>
                        </div>
                        <div style="
                            background: #fff3e0;
                            padding: 16px;
                            border-radius: 10px;
                            text-align: center;
                        ">
                            <div style="font-size: 28px; font-weight: bold; color: #ef6c00;">
                                37
                            </div>
                            <div style="font-size: 13px; color: #666;">Cabang</div>
                        </div>
                    </div>
                    
                    <div style="
                        background: #f5f5f5;
                        padding: 16px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                    ">
                        <h5 style="margin: 0 0 12px 0;">📋 Sample Data (5 records pertama)</h5>
                        <div style="font-size: 12px; overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #e0e0e0;">
                                        <th style="padding: 8px; text-align: left; border: 1px solid #ccc;">Cabang</th>
                                        <th style="padding: 8px; text-align: left; border: 1px solid #ccc;">Sandi</th>
                                        <th style="padding: 8px; text-align: right; border: 1px solid #ccc;">Rupiah</th>
                                        <th style="padding: 8px; text-align: right; border: 1px solid #ccc;">Valas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${result.data.slice(0, 5).map(item => `
                                        <tr>
                                            <td style="padding: 8px; border: 1px solid #ccc;">${item.kode_cabang} - ${item.nama_cabang}</td>
                                            <td style="padding: 8px; border: 1px solid #ccc;">${item.sandi}</td>
                                            <td style="padding: 8px; text-align: right; border: 1px solid #ccc;">${item.rupiah.toLocaleString()}</td>
                                            <td style="padding: 8px; text-align: right; border: 1px solid #ccc;">${item.valas.toLocaleString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div style="
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 16px;
                        border-radius: 8px;
                    ">
                        <p style="margin: 0; color: #856404;">
                            <strong>⚠️ Perhatian:</strong> Data akan disimpan ke collection <code>banksulselbar_labarugi</code> di Firebase.
                            Jika data untuk periode ini sudah ada, akan di-overwrite.
                        </p>
                    </div>
                </div>
                
                <div style="
                    padding: 16px 24px;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                ">
                    <button onclick="closeLabaRugiPreview()" style="
                        padding: 12px 24px;
                        border: none;
                        background: #f0f0f0;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Batal</button>
                    <button onclick="confirmLabaRugiUpload()" style="
                        padding: 12px 24px;
                        border: none;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                    ">🔥 Upload ke Firebase</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Close preview modal
 */
function closeLabaRugiPreview() {
    const modal = document.getElementById('labarugiPreviewModal');
    if (modal) modal.remove();
    window.pendingLabaRugiData = null;
}

/**
 * Confirm and execute upload
 */
async function confirmLabaRugiUpload() {
    const result = window.pendingLabaRugiData;
    if (!result) {
        alert('❌ Tidak ada data untuk diupload');
        return;
    }
    
    closeLabaRugiPreview();
    
    try {
        // Show loading
        showLabaRugiLoading('Mengupload data ke Firebase...');
        
        // Upload detail data
        const uploadResult = await uploadLabaRugiToFirebase(result.data, {
            onProgress: (progress) => {
                updateLabaRugiLoadingText(`Mengupload... ${progress.percent}% (${progress.uploaded}/${progress.total})`);
            }
        });
        
        // Upload summary
        updateLabaRugiLoadingText('Mengupload summary...');
        await uploadSummaryToFirebase(result.periode.periode, result.summary);
        
        // Hide loading
        hideLabaRugiLoading();
        
        // Show success
        alert(`✅ Upload berhasil!\n\n` +
              `📅 Periode: ${result.periode.periodeName}\n` +
              `📊 Total records: ${uploadResult.uploaded.toLocaleString()}\n` +
              `❌ Errors: ${uploadResult.errors.length}`);
        
        // Clear pending data
        window.pendingLabaRugiData = null;
        
    } catch (error) {
        hideLabaRugiLoading();
        console.error('❌ Upload error:', error);
        alert('❌ Error: ' + error.message);
    }
}

/**
 * Create file input and trigger
 */
function triggerLabaRugiImport() {
    let input = document.getElementById('labarugiFileInput');
    
    if (!input) {
        input = document.createElement('input');
        input.type = 'file';
        input.id = 'labarugiFileInput';
        input.accept = '.xlsx,.xls';
        input.style.display = 'none';
        input.addEventListener('change', handleLabaRugiFileUpload);
        document.body.appendChild(input);
    }
    
    input.click();
}

// ==========================================
// QUERY FUNCTIONS (untuk dashboard)
// ==========================================

/**
 * Query data laba rugi dari Firebase
 */
async function queryLabaRugiDetail(options = {}) {
    if (typeof FirebaseConnector === 'undefined' || !FirebaseConnector.isInitialized) {
        throw new Error('Firebase belum diinisialisasi');
    }
    
    const db = FirebaseConnector.db;
    let query = db.collection('banksulselbar_labarugi');
    
    // Filter by periode
    if (options.periode) {
        query = query.where('periode', '==', options.periode);
    }
    
    // Filter by cabang
    if (options.kodeCabang) {
        query = query.where('kode_cabang', '==', options.kodeCabang);
    }
    
    // Filter by sandi
    if (options.sandi) {
        query = query.where('sandi', '==', options.sandi);
    }
    
    // Filter by tipe
    if (options.tipe) {
        query = query.where('tipe', '==', options.tipe);
    }
    
    // Limit
    if (options.limit) {
        query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    const results = [];
    
    snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
}

/**
 * Get laba rugi summary for a period
 */
async function getLabaRugiSummary(periode, kodeCabang = null) {
    const options = { periode };
    if (kodeCabang) options.kodeCabang = kodeCabang;
    
    const data = await queryLabaRugiDetail(options);
    
    // Aggregate by sandi
    const summary = {};
    data.forEach(item => {
        if (!summary[item.sandi]) {
            summary[item.sandi] = {
                sandi: item.sandi,
                pos: item.pos,
                rupiah: 0,
                valas: 0,
                total: 0
            };
        }
        summary[item.sandi].rupiah += item.rupiah;
        summary[item.sandi].valas += item.valas;
        summary[item.sandi].total += item.total;
    });
    
    return summary;
}

// ==========================================
// EXPORTS
// ==========================================

window.LabaRugiParser = LabaRugiParser;
window.uploadLabaRugiToFirebase = uploadLabaRugiToFirebase;
window.uploadSummaryToFirebase = uploadSummaryToFirebase;
window.handleLabaRugiFileUpload = handleLabaRugiFileUpload;
window.triggerLabaRugiImport = triggerLabaRugiImport;
window.showLabaRugiPreview = showLabaRugiPreview;
window.closeLabaRugiPreview = closeLabaRugiPreview;
window.confirmLabaRugiUpload = confirmLabaRugiUpload;
window.queryLabaRugiDetail = queryLabaRugiDetail;
window.getLabaRugiSummary = getLabaRugiSummary;
window.LABARUGI_CONFIG = LABARUGI_CONFIG;

console.log('✅ Laba Rugi Parser loaded!');
