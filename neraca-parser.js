/**
 * ==========================================
 * NERACA PARSER - BANK SULSELBAR
 * ==========================================
 * Fungsi untuk parsing file Excel Neraca
 * dan menyimpan ke Firebase Firestore
 * 
 * Collection: banksulselbar_neraca
 * Document ID: {periode}_{kodeCabang}_{sandi}
 * 
 * Author: Claude AI
 * Version: 1.0
 * ==========================================
 */

console.log('📊 Loading Neraca Parser...');

// ==========================================
// KONFIGURASI MAPPING KOLOM EXCEL NERACA
// ==========================================

const NERACA_CONFIG = {
    // Sheet name yang akan dibaca
    sheetName: 'Neraca',
    
    // Baris awal data (0-indexed), setelah header
    dataStartRow: 7,
    
    // Kolom untuk sandi laporan (0-indexed dari kolom B karena sheet dimulai dari B)
    sandiColumn: 6, // Col H = index 6 (B=0, C=1, D=2, E=3, F=4, G=5, H=6)
    
    // Mapping kolom cabang konvensional (semua index dikurangi 1)
    cabangKonvensional: {
        '010': { nama: 'CABANG MAROS', rupiah: 22, valas: 23 },           // Col X, Y
        '011': { nama: 'CABANG PANGKEP', rupiah: 24, valas: 25 },         // Col Z, AA
        '020': { nama: 'CABANG JENEPONTO', rupiah: 26, valas: 27 },       // Col AB, AC
        '021': { nama: 'CABANG TAKALAR', rupiah: 28, valas: 29 },         // Col AD, AE
        '030': { nama: 'CABANG PAREPARE', rupiah: 30, valas: 31 },        // Col AF, AG
        '031': { nama: 'CABANG BARRU', rupiah: 32, valas: 33 },           // Col AH, AI
        '040': { nama: 'CABANG BULUKUMBA', rupiah: 34, valas: 35 },       // Col AJ, AK
        '041': { nama: 'CABANG BANTAENG', rupiah: 36, valas: 37 },        // Col AL, AM
        '042': { nama: 'CABANG SELAYAR', rupiah: 38, valas: 39 },         // Col AN, AO
        '050': { nama: 'CABANG PINRANG', rupiah: 40, valas: 41 },         // Col AP, AQ
        '060': { nama: 'CABANG SINJAI', rupiah: 42, valas: 43 },          // Col AR, AS
        '070': { nama: 'CABANG POLMAN', rupiah: 44, valas: 45 },          // Col AT, AU
        '071': { nama: 'CABANG UTAMA MAMUJU', rupiah: 46, valas: 47 },    // Col AV, AW
        '072': { nama: 'CABANG MAJENE', rupiah: 48, valas: 49 },          // Col AX, AY
        '074': { nama: 'CABANG MAMASA', rupiah: 50, valas: 51 },          // Col AZ, BA
        '075': { nama: 'CABANG PASANGKAYU', rupiah: 52, valas: 53 },      // Col BB, BC
        '077': { nama: 'CABANG TOPOYO', rupiah: 54, valas: 55 },          // Col BD, BE
        '080': { nama: 'CABANG UTAMA BONE', rupiah: 56, valas: 57 },      // Col BF, BG
        '090': { nama: 'CABANG PALOPO', rupiah: 58, valas: 59 },          // Col BH, BI
        '091': { nama: 'CABANG MASAMBA', rupiah: 60, valas: 61 },         // Col BJ, BK
        '092': { nama: 'CABANG BELOPA', rupiah: 62, valas: 63 },          // Col BL, BM
        '093': { nama: 'CABANG MALILI', rupiah: 64, valas: 65 },          // Col BN, BO
        '100': { nama: 'CABANG SENGKANG', rupiah: 66, valas: 67 },        // Col BP, BQ
        '101': { nama: 'CABANG SOPPENG', rupiah: 68, valas: 69 },         // Col BR, BS
        '110': { nama: 'CABANG MAKALE', rupiah: 70, valas: 71 },          // Col BT, BU
        '111': { nama: 'CABANG RANTEPAO', rupiah: 72, valas: 73 },        // Col BV, BW
        '120': { nama: 'CABANG SIDRAP', rupiah: 74, valas: 75 },          // Col BX, BY
        '121': { nama: 'CABANG ENREKANG', rupiah: 76, valas: 77 },        // Col BZ, CA
        '130': { nama: 'CABANG UTAMA MAKASSAR', rupiah: 78, valas: 79 },  // Col CB, CC
        '131': { nama: 'CABANG GOWA', rupiah: 80, valas: 81 },            // Col CD, CE
        '400': { nama: 'CABANG KHUSUS JAKARTA', rupiah: 82, valas: 83 },  // Col CF, CG
        '001': { nama: 'KANTOR PUSAT', rupiah: 84, valas: 85 }            // Col CH, CI
    },
    
    // Mapping kolom cabang syariah
    cabangSyariah: {
        '510': { nama: 'CABANG SYARIAH MAKASSAR', rupiah: 93, valas: 94 },  // Col CQ, CR
        '520': { nama: 'CABANG SYARIAH SENGKANG', rupiah: 95, valas: 96 },  // Col CS, CT
        '530': { nama: 'CABANG SYARIAH MAROS', rupiah: 97, valas: 98 },     // Col CU, CV
        '540': { nama: 'CABANG SYARIAH MAMUJU', rupiah: 99, valas: 100 },   // Col CW, CX
        '500': { nama: 'UUS', rupiah: 101, valas: 102 }                     // Col CY, CZ
    },
    
    // Kolom untuk total konvensional (Col I, J, K → index 7, 8, 9)
    totalKonvensional: {
        rupiah: 7,
        valas: 8,
        total: 9
    },
    
    // Kolom untuk total syariah (Col M, N, O → index 11, 12, 13)
    totalSyariah: {
        rupiah: 11,
        valas: 12,
        total: 13
    },
    
    // Kolom untuk total konsolidasi
    totalKonsolidasi: {
        rupiah: 16,
        valas: 17,
        total: 18
    },
    
    // ==========================================
    // RATIO ROWS CONFIGURATION
    // ==========================================
    // Row index (0-based) dan mapping nama ratio
    ratioRows: {
        142: 'LDR',      // Row 143: LOAN TO DEPOSIT RATIO
        143: 'BOPO',     // Row 144: BOPO
        144: 'ROA',      // Row 145: RETURN ON ASSET
        145: 'NIM',      // Row 146: NET INTEREST MARGIN
        146: 'ROE',      // Row 147: RETURN ON EQUITY
        147: 'CAR',      // Row 148: KPMM/CAR
        148: 'NPL',      // Row 149: NON PERFORMING LOAN
        149: 'CASA',     // Row 150: CASA
        150: 'NSFR',     // Row 151: NSFR
        151: 'LCR'       // Row 152: LCR
    },
    
    // Kolom untuk ratio per cabang (Total column for each branch)
    // Cabang Konvensional: use 'total' column (index + 2 from rupiah)
    // Cabang Syariah: same pattern
    ratioColumnOffset: 2  // total = rupiah + 2
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
// NERACA PARSER CLASS
// ==========================================

class NeracaParser {
    
    constructor() {
        this.config = NERACA_CONFIG;
        this.parsedData = [];
        this.summaryData = {};
        this.errors = [];
    }
    
    /**
     * Extract periode dari nama file
     */
    extractPeriodeFromFilename(filename) {
        console.log('📅 Extracting periode from:', filename);
        
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').toLowerCase();
        
        let bulanInfo = null;
        let tahun = null;
        
        for (const [key, value] of Object.entries(BULAN_MAP)) {
            if (nameWithoutExt.includes(key)) {
                bulanInfo = value;
                break;
            }
        }
        
        const tahunMatch = nameWithoutExt.match(/20\d{2}/);
        if (tahunMatch) {
            tahun = parseInt(tahunMatch[0]);
        }
        
        if (!bulanInfo || !tahun) {
            throw new Error(`Tidak dapat menentukan periode dari nama file: ${filename}`);
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
     */
    async parseExcelFile(file) {
        console.log('📂 Parsing Excel file:', file.name);
        
        return new Promise((resolve, reject) => {
            if (typeof XLSX === 'undefined') {
                reject(new Error('Library XLSX (SheetJS) tidak ditemukan.'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    console.log('📊 Available sheets:', workbook.SheetNames);
                    
                    if (!workbook.SheetNames.includes(this.config.sheetName)) {
                        throw new Error(`Sheet "${this.config.sheetName}" tidak ditemukan`);
                    }
                    
                    const worksheet = workbook.Sheets[this.config.sheetName];
                    const rows = XLSX.utils.sheet_to_json(worksheet, { 
                        header: 1, 
                        defval: null,
                        raw: true
                    });
                    
                    console.log(`📋 Total rows in sheet: ${rows.length}`);
                    
                    const periodeInfo = this.extractPeriodeFromFilename(file.name);
                    console.log('📅 Periode:', periodeInfo);
                    
                    const result = this.parseRows(rows, periodeInfo);
                    resolve(result);
                    
                } catch (error) {
                    console.error('❌ Parse error:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Gagal membaca file'));
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
        
        for (let i = this.config.dataStartRow; i < rows.length; i++) {
            const row = rows[i];
            
            if (!row) {
                skippedRows++;
                continue;
            }
            
            const sandi = row[this.config.sandiColumn];
            
            // Skip rows without valid sandi (must contain dots like 01.01.00.00)
            if (!sandi || String(sandi).trim() === '' || !String(sandi).includes('.')) {
                skippedRows++;
                continue;
            }
            
            const sandiStr = String(sandi).trim();
            const pos = this.extractPosDescription(row);
            
            // Process each cabang
            for (const [kodeCabang, cabangInfo] of Object.entries(allCabang)) {
                const rupiah = this.parseNumber(row[cabangInfo.rupiah]);
                const valas = this.parseNumber(row[cabangInfo.valas]);
                const tipe = this.config.cabangSyariah[kodeCabang] ? 'syariah' : 'konvensional';
                
                const docId = `${periodeInfo.periode}_${kodeCabang}_${sandiStr.replace(/\./g, '')}`;
                
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
            
            // Capture summary totals
            this.captureSummary(row, sandiStr, pos);
            processedRows++;
        }
        
        console.log(`✅ Processed: ${processedRows} rows with sandi`);
        console.log(`⏭️ Skipped: ${skippedRows} rows without sandi`);
        console.log(`📊 Total records: ${this.parsedData.length}`);
        
        // ==========================================
        // PARSE RATIO ROWS (Row 143-152)
        // ==========================================
        const ratioRecords = this.parseRatioRows(rows, periodeInfo, allCabang);
        console.log(`📈 Ratio records: ${ratioRecords.length}`);
        
        // Add ratio records to parsed data
        this.parsedData = [...this.parsedData, ...ratioRecords];
        
        return {
            success: true,
            periode: periodeInfo,
            totalRecords: this.parsedData.length,
            totalRows: processedRows,
            skippedRows: skippedRows,
            ratioRecords: ratioRecords.length,
            data: this.parsedData,
            summary: this.summaryData,
            errors: this.errors
        };
    }
    
    /**
     * Parse ratio rows (Row 143-152)
     */
    parseRatioRows(rows, periodeInfo, allCabang) {
        console.log('📈 Parsing ratio rows...');
        const ratioData = [];
        
        const ratioRows = this.config.ratioRows;
        if (!ratioRows) {
            console.log('⚠️ No ratio rows configured');
            return ratioData;
        }
        
        for (const [rowIndex, ratioName] of Object.entries(ratioRows)) {
            const rowIdx = parseInt(rowIndex);
            const row = rows[rowIdx];
            
            if (!row) {
                console.log(`⚠️ Row ${rowIdx} not found`);
                continue;
            }
            
            // Extract ratio description from row
            const description = this.extractPosDescription(row);
            console.log(`📊 Row ${rowIdx}: ${ratioName} - ${description}`);
            
            // Process each cabang
            for (const [kodeCabang, cabangInfo] of Object.entries(allCabang)) {
                // Ratio value is in the same column as rupiah (or total column)
                // Try rupiah column first, then total (rupiah + 2)
                let ratioValue = this.parseNumber(row[cabangInfo.rupiah]);
                
                // If rupiah is 0, try the total column
                if (ratioValue === 0 && row[cabangInfo.rupiah + 2]) {
                    ratioValue = this.parseNumber(row[cabangInfo.rupiah + 2]);
                }
                
                const tipe = this.config.cabangSyariah[kodeCabang] ? 'syariah' : 'konvensional';
                const docId = `${periodeInfo.periode}_${kodeCabang}_RATIO_${ratioName}`;
                
                const ratioObj = {
                    id: docId,
                    periode: periodeInfo.periode,
                    bulan: periodeInfo.bulan,
                    tahun: periodeInfo.tahun,
                    periodeName: periodeInfo.periodeName,
                    kode_cabang: kodeCabang,
                    nama_cabang: cabangInfo.nama,
                    tipe: tipe,
                    ratio_name: ratioName,
                    value: ratioValue,
                    description: description,
                    is_ratio: true,
                    row_index: rowIdx,
                    created_at: new Date().toISOString()
                };
                
                ratioData.push(ratioObj);
            }
            
            // Also process summary ratios (KON, SYR, ALL)
            this.parseRatioSummary(row, rowIdx, ratioName, periodeInfo, ratioData);
        }
        
        console.log(`✅ Total ratio records: ${ratioData.length}`);
        return ratioData;
    }
    
    /**
     * Parse ratio summary (KON, SYR, ALL)
     */
    parseRatioSummary(row, rowIdx, ratioName, periodeInfo, ratioData) {
        // Konvensional Total
        const konValue = this.parseNumber(row[this.config.totalKonvensional.total]);
        ratioData.push({
            id: `${periodeInfo.periode}_KON_RATIO_${ratioName}`,
            periode: periodeInfo.periode,
            bulan: periodeInfo.bulan,
            tahun: periodeInfo.tahun,
            periodeName: periodeInfo.periodeName,
            kode_cabang: 'KON',
            nama_cabang: 'Konvensional',
            tipe: 'konvensional',
            ratio_name: ratioName,
            value: konValue,
            is_ratio: true,
            row_index: rowIdx,
            created_at: new Date().toISOString()
        });
        
        // Syariah Total
        const syrValue = this.parseNumber(row[this.config.totalSyariah.total]);
        ratioData.push({
            id: `${periodeInfo.periode}_SYR_RATIO_${ratioName}`,
            periode: periodeInfo.periode,
            bulan: periodeInfo.bulan,
            tahun: periodeInfo.tahun,
            periodeName: periodeInfo.periodeName,
            kode_cabang: 'SYR',
            nama_cabang: 'Syariah',
            tipe: 'syariah',
            ratio_name: ratioName,
            value: syrValue,
            is_ratio: true,
            row_index: rowIdx,
            created_at: new Date().toISOString()
        });
        
        // Konsolidasi Total
        const allValue = this.parseNumber(row[this.config.totalKonsolidasi.total]);
        ratioData.push({
            id: `${periodeInfo.periode}_ALL_RATIO_${ratioName}`,
            periode: periodeInfo.periode,
            bulan: periodeInfo.bulan,
            tahun: periodeInfo.tahun,
            periodeName: periodeInfo.periodeName,
            kode_cabang: 'ALL',
            nama_cabang: 'Konsolidasi',
            tipe: 'konsolidasi',
            ratio_name: ratioName,
            value: allValue,
            is_ratio: true,
            row_index: rowIdx,
            created_at: new Date().toISOString()
        });
    }
    
    /**
     * Extract pos description from row
     */
    extractPosDescription(row) {
        const parts = [];
        for (let i = 1; i <= 6; i++) {
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
}

// ==========================================
// FIREBASE UPLOAD FUNCTIONS
// ==========================================

async function uploadNeracaToFirebase(data, options = {}) {
    console.log('🔥 Uploading Neraca data to Firebase...');
    console.log(`📊 Total records to upload: ${data.length}`);
    
    if (typeof FirebaseConnector === 'undefined' || !FirebaseConnector.isInitialized) {
        throw new Error('Firebase belum diinisialisasi.');
    }
    
    const db = FirebaseConnector.db;
    const collectionName = options.collection || 'banksulselbar_neraca';
    const batchSize = options.batchSize || 500;
    
    let uploaded = 0;
    let errors = [];
    
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

// ==========================================
// UI HANDLER FUNCTIONS
// ==========================================

let neracaFile = null;
let neracaParsedData = null;

function handleNeracaSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    neracaFile = file;
    
    document.getElementById('neracaInfoContainer').style.display = 'block';
    document.getElementById('neracaFileName').textContent = file.name;
    document.getElementById('neracaFileMeta').textContent = `${(file.size / 1024).toFixed(1)} KB`;
    document.getElementById('parseNeracaBtn').disabled = false;
    document.getElementById('neracaPreview').style.display = 'none';
    
    try {
        const parser = new NeracaParser();
        const periodeInfo = parser.extractPeriodeFromFilename(file.name);
        document.getElementById('nrPeriode').textContent = periodeInfo.periodeName;
        if (typeof log === 'function') {
            log(`File neraca dipilih: ${file.name} - Periode: ${periodeInfo.periodeName}`, 'info');
        }
    } catch (e) {
        if (typeof log === 'function') {
            log(`Warning: ${e.message}`, 'warning');
        }
    }
}

function clearNeracaFile() {
    neracaFile = null;
    neracaParsedData = null;
    document.getElementById('neracaInput').value = '';
    document.getElementById('neracaInfoContainer').style.display = 'none';
    document.getElementById('parseNeracaBtn').disabled = true;
    document.getElementById('uploadNeracaBtn').disabled = true;
    document.getElementById('nrPeriode').textContent = '-';
    document.getElementById('nrRecords').textContent = '0';
    document.getElementById('nrSandi').textContent = '0';
}

async function parseNeracaFile() {
    if (!neracaFile) {
        if (typeof log === 'function') log('Pilih file terlebih dahulu', 'warning');
        return;
    }
    
    if (typeof log === 'function') log('Parsing file neraca...', 'info');
    
    try {
        const parser = new NeracaParser();
        const result = await parser.parseExcelFile(neracaFile);
        
        neracaParsedData = result;
        
        // Update UI
        document.getElementById('nrRecords').textContent = result.totalRecords.toLocaleString();
        document.getElementById('nrSandi').textContent = result.totalRows;
        document.getElementById('uploadNeracaBtn').disabled = typeof isConnected !== 'undefined' ? !isConnected : false;
        
        // Show preview
        const previewBody = document.getElementById('neracaPreviewBody');
        if (previewBody) {
            previewBody.innerHTML = result.data.slice(0, 10).map(item => `
                <tr>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">${item.kode_cabang}</td>
                    <td style="padding: 0.5rem; border-bottom: 1px solid #e2e8f0;">${item.sandi}</td>
                    <td style="padding: 0.5rem; text-align: right; border-bottom: 1px solid #e2e8f0;">${item.rupiah.toLocaleString()}</td>
                    <td style="padding: 0.5rem; text-align: right; border-bottom: 1px solid #e2e8f0;">${item.valas.toLocaleString()}</td>
                </tr>
            `).join('');
            document.getElementById('neracaPreview').style.display = 'block';
        }
        
        if (typeof log === 'function') {
            log(`✅ Parsing selesai: ${result.totalRecords.toLocaleString()} records dari ${result.totalRows} sandi`, 'success');
        }
        
    } catch (error) {
        if (typeof log === 'function') {
            log(`❌ Error parsing: ${error.message}`, 'error');
        }
        console.error(error);
    }
}

async function uploadNeracaData() {
    if (typeof isConnected !== 'undefined' && !isConnected) {
        if (typeof log === 'function') log('Connect ke Firebase terlebih dahulu', 'warning');
        return;
    }
    
    if (!neracaParsedData || !neracaParsedData.data.length) {
        if (typeof log === 'function') log('Parse file terlebih dahulu', 'warning');
        return;
    }
    
    const data = neracaParsedData.data;
    const batchSize = 500;
    let uploaded = 0;
    
    document.getElementById('neracaProgressBar').style.display = 'block';
    document.getElementById('uploadNeracaBtn').disabled = true;
    
    if (typeof log === 'function') {
        log(`🔥 Mulai upload ${data.length.toLocaleString()} records ke banksulselbar_neraca...`, 'info');
    }
    
    try {
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = db.batch();
            const chunk = data.slice(i, i + batchSize);
            
            for (const item of chunk) {
                const docRef = db.collection('banksulselbar_neraca').doc(item.id);
                batch.set(docRef, item);
            }
            
            await batch.commit();
            uploaded += chunk.length;
            
            const percent = Math.round((uploaded / data.length) * 100);
            document.getElementById('neracaProgressFill').style.width = `${percent}%`;
            if (typeof log === 'function') {
                log(`Progress: ${uploaded.toLocaleString()}/${data.length.toLocaleString()} (${percent}%)`, 'info');
            }
        }
        
        if (typeof log === 'function') {
            log(`✅ Upload selesai! ${uploaded.toLocaleString()} records berhasil disimpan`, 'success');
        }
        alert(`✅ Upload Neraca berhasil!\n\nPeriode: ${neracaParsedData.periode.periodeName}\nRecords: ${uploaded.toLocaleString()}`);
        
    } catch (error) {
        if (typeof log === 'function') {
            log(`❌ Error upload: ${error.message}`, 'error');
        }
        alert('❌ Error: ' + error.message);
    }
    
    document.getElementById('uploadNeracaBtn').disabled = false;
}

// ==========================================
// EXPORTS
// ==========================================

window.NeracaParser = NeracaParser;
window.uploadNeracaToFirebase = uploadNeracaToFirebase;
window.handleNeracaSelect = handleNeracaSelect;
window.clearNeracaFile = clearNeracaFile;
window.parseNeracaFile = parseNeracaFile;
window.uploadNeracaData = uploadNeracaData;
window.NERACA_CONFIG = NERACA_CONFIG;

console.log('✅ Neraca Parser loaded!');
