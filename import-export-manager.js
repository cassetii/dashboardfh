// ========================================
// IMPORT/EXPORT MANAGER - TEMPLATE ASLI
// Bank Sulselbar - Sesuai Template Original
// ========================================

console.log('ðŸ”§ Import/Export Manager Loading (Template Asli Version)...');

// ========================================
// HELPER FUNCTIONS
// ========================================

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    if (typeof showAlert !== 'undefined') {
        showAlert(message, type);
    } else {
        alert(message);
    }
}

function getAllTargets() {
    try {
        const data = localStorage.getItem('bank_sulselbar_branch_targets');
        if (!data) {
            return {
                version: "1.0",
                lastUpdate: new Date().toISOString(),
                branches: {},
                businessLines: { konsolidasi: {}, konvensional: {}, syariah: {} }
            };
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading targets:', error);
        return {
            version: "1.0",
            lastUpdate: new Date().toISOString(),
            branches: {},
            businessLines: { konsolidasi: {}, konvensional: {}, syariah: {} }
        };
    }
}

function saveTargets(data) {
    try {
        data.lastUpdate = new Date().toISOString();
        localStorage.setItem('bank_sulselbar_branch_targets', JSON.stringify(data));
        console.log('âœ… Targets saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving targets:', error);
        return false;
    }
}

// ========================================
// TEMPLATE DOWNLOAD - SESUAI ASLI
// ========================================

async function downloadExcelTemplate() {
    console.log('ðŸ“¥ Downloading Excel template (Format Asli)...');
    
    try {
        // Download template asli yang sudah ada
        const response = await fetch('Template_Target_Neraca_dan_Laba_Rugi_dan_Adm.xlsx');
        
        if (!response.ok) {
            throw new Error('Template file tidak ditemukan');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Template_Target_Bank_Sulselbar_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('âœ… Template Excel berhasil didownload (Format Asli Bank Sulselbar)', 'success');
        
    } catch (error) {
        console.error('Error downloading template:', error);
        showNotification('âŒ Gagal mendownload template: ' + error.message + '. Pastikan file Template_Target_Neraca_dan_Laba_Rugi_dan_Adm.xlsx ada di folder yang sama.', 'error');
    }
}

function downloadJSONTemplate() {
    console.log('ðŸ“¥ Downloading JSON template...');
    
    try {
        const template = {
            branchInfo: {
                branchCode: "001",
                branchName: "Contoh Cabang Makassar",
                businessLine: "konsolidasi",
                targetPeriod: "2025"
            },
            data: [
                {
                    "POS LAPORAN POSISI KEUANGAN SESUAI LAPORAN BANK UMUM TERINTEGRASI": "ASET",
                    "": "",
                    "SANDI LAPORAN BANK UMUM TERINTEGRASI": "",
                    " 010 ": ""
                },
                {
                    "POS LAPORAN POSISI KEUANGAN SESUAI LAPORAN BANK UMUM TERINTEGRASI": "1.",
                    "": "Kas",
                    "SANDI LAPORAN BANK UMUM TERINTEGRASI": "01.01.00.00.00.00",
                    " 010 ": "8104106000"
                },
                {
                    "POS LAPORAN POSISI KEUANGAN SESUAI LAPORAN BANK UMUM TERINTEGRASI": "TOTAL ASET",
                    "": "",
                    "SANDI LAPORAN BANK UMUM TERINTEGRASI": "01.00.00.00.00.00",
                    " 010 ": "550000000000",
                    " 020 ": "575000000000",
                    " 030 ": "600000000000",
                    " 040 ": "625000000000"
                }
            ]
        };
        
        const jsonStr = JSON.stringify(template, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Template_Target_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('âœ… Template JSON berhasil didownload', 'success');
        
    } catch (error) {
        console.error('Error downloading JSON template:', error);
        showNotification('âŒ Gagal mendownload template JSON: ' + error.message, 'error');
    }
}

// ========================================
// IMPORT FUNCTIONS - SESUAI TEMPLATE ASLI
// ========================================

function importFromExcel(file) {
    console.log('ðŸ“¤ Importing from Excel (Format Asli):', file.name);
    
    return new Promise((resolve, reject) => {
        if (typeof XLSX === 'undefined') {
            reject(new Error('SheetJS library tidak ditemukan'));
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                console.log('ðŸ“Š Workbook sheets:', workbook.SheetNames);
                
                // Get first sheet (Sheet1)
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // Convert to array of arrays
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                
                console.log('ðŸ“‹ Total rows:', jsonData.length);
                
                // Prompt for branch info
                const branchCode = prompt('Masukkan Kode Cabang:', '001');
                const branchName = prompt('Masukkan Nama Cabang:', 'Cabang Makassar');
                
                if (!branchCode || !branchName) {
                    throw new Error('Kode Cabang dan Nama Cabang harus diisi');
                }
                
                const branchData = {
                    branchCode: branchCode,
                    branchName: branchName,
                    businessLine: prompt('Business Line (konsolidasi/konvensional/syariah):', 'konsolidasi') || 'konsolidasi',
                    targetPeriod: prompt('Periode Target (tahun):', '2025') || '2025'
                };
                
                console.log('ðŸ¢ Branch data:', branchData);
                
                // Process data starting from row 4 (after 3 header rows)
                const processedData = [];
                
                for (let i = 3; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row.length > 0) {
                        // Column mapping based on original structure
                        // A-G: POS LAPORAN (merged, use col A)
                        // H: SANDI
                        // I: Q1 Rupiah, J: Q1 Valas
                        // K: Q2 Rupiah, L: Q2 Valas
                        // M: Q3 Rupiah, N: Q3 Valas
                        // O: Q4 Rupiah, P: Q4 Valas
                        
                        processedData.push({
                            "POS LAPORAN POSISI KEUANGAN SESUAI LAPORAN BANK UMUM TERINTEGRASI": row[0] || "",
                            "": row[1] || "",
                            "SANDI LAPORAN BANK UMUM TERINTEGRASI": row[7] || "",  // Col H (index 7)
                            " 010 ": row[8] || "",   // Col I - Q1 Rupiah
                            " 011 ": row[9] || "",   // Col J - Q1 Valas
                            " 020 ": row[10] || "",  // Col K - Q2 Rupiah
                            " 021 ": row[11] || "",  // Col L - Q2 Valas
                            " 030 ": row[12] || "",  // Col M - Q3 Rupiah
                            " 031 ": row[13] || "",  // Col N - Q3 Valas
                            " 040 ": row[14] || "",  // Col O - Q4 Rupiah
                            " 041 ": row[15] || ""   // Col P - Q4 Valas
                        });
                    }
                }
                
                console.log('âœ… Processed data rows:', processedData.length);
                
                resolve({
                    branchInfo: branchData,
                    data: processedData,
                    fileName: file.name,
                    importDate: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('âŒ Import error:', error);
                reject(error);
            }
        };
        
        reader.onerror = (error) => {
            console.error('âŒ File read error:', error);
            reject(error);
        };
        
        reader.readAsArrayBuffer(file);
    });
}

function importFromJSON(file) {
    console.log('ðŸ“¤ Importing from JSON:', file.name);
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                console.log('ðŸ“‹ JSON data:', jsonData);
                
                if (!jsonData.branchInfo || !jsonData.data) {
                    throw new Error('Format JSON tidak valid. Harus ada branchInfo dan data');
                }
                
                if (!jsonData.branchInfo.branchCode || !jsonData.branchInfo.branchName) {
                    throw new Error('Kode Cabang dan Nama Cabang harus diisi');
                }
                
                console.log('âœ… JSON valid, rows:', jsonData.data.length);
                
                resolve({
                    branchInfo: jsonData.branchInfo,
                    data: jsonData.data,
                    fileName: file.name,
                    importDate: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('âŒ JSON parse error:', error);
                reject(error);
            }
        };
        
        reader.onerror = (error) => {
            console.error('âŒ File read error:', error);
            reject(error);
        };
        
        reader.readAsText(file);
    });
}

function calculateMetricsFromData(data) {
    console.log('ðŸ§® Calculating metrics from data...');
    
    const metrics = {
        Q1: {}, Q2: {}, Q3: {}, Q4: {}
    };
    
    const sandiMapping = {
        '01.00.00.00.00.00': 'asset',
        '02.00.00.00.00.00': 'dpk',
        '01.09.01.00.00.00': 'kredit',
        '03.05.02.01.00.00': 'laba',
        '03.01.00.00.00.00': 'pendapatan',
        '03.04.00.00.00.00': 'biaya'
    };
    
    const foundSandi = new Set();
    
    data.forEach(row => {
        const sandi = row["SANDI LAPORAN BANK UMUM TERINTEGRASI"];
        
        if (sandi && sandiMapping[sandi]) {
            const metric = sandiMapping[sandi];
            foundSandi.add(sandi);
            
            // Q1 - col 010 (Rupiah)
            const q1Value = row[" 010 "];
            if (q1Value && q1Value !== '' && q1Value !== '-' && q1Value !== ' -   ') {
                const cleanValue = String(q1Value).replace(/[^\d]/g, '');
                const numValue = parseInt(cleanValue) || 0;
                if (numValue > 0) {
                    metrics.Q1[metric] = numValue;
                    console.log(`  Q1 ${metric}: ${numValue}`);
                }
            }
            
            // Q2 - col 020
            const q2Value = row[" 020 "];
            if (q2Value && q2Value !== '' && q2Value !== '-' && q2Value !== ' -   ') {
                const cleanValue = String(q2Value).replace(/[^\d]/g, '');
                const numValue = parseInt(cleanValue) || 0;
                if (numValue > 0) {
                    metrics.Q2[metric] = numValue;
                    console.log(`  Q2 ${metric}: ${numValue}`);
                }
            }
            
            // Q3 - col 030
            const q3Value = row[" 030 "];
            if (q3Value && q3Value !== '' && q3Value !== '-' && q3Value !== ' -   ') {
                const cleanValue = String(q3Value).replace(/[^\d]/g, '');
                const numValue = parseInt(cleanValue) || 0;
                if (numValue > 0) {
                    metrics.Q3[metric] = numValue;
                    console.log(`  Q3 ${metric}: ${numValue}`);
                }
            }
            
            // Q4 - col 040
            const q4Value = row[" 040 "];
            if (q4Value && q4Value !== '' && q4Value !== '-' && q4Value !== ' -   ') {
                const cleanValue = String(q4Value).replace(/[^\d]/g, '');
                const numValue = parseInt(cleanValue) || 0;
                if (numValue > 0) {
                    metrics.Q4[metric] = numValue;
                    console.log(`  Q4 ${metric}: ${numValue}`);
                }
            }
        }
    });
    
    // Check for missing important sandi
    const missingSandi = [];
    Object.keys(sandiMapping).forEach(sandi => {
        if (!foundSandi.has(sandi)) {
            missingSandi.push(`${sandi} (${sandiMapping[sandi]})`);
        }
    });
    
    if (missingSandi.length > 0) {
        console.warn('âš ï¸ Missing important SANDI codes in data:');
        missingSandi.forEach(s => console.warn(`   - ${s}`));
        console.warn('ðŸ’¡ Solusi: Pastikan template memiliki sandi lengkap, atau isi manual via Settings');
    }
    
    console.log('âœ… Metrics calculated:', metrics);
    console.log(`ðŸ“Š Found ${foundSandi.size} out of ${Object.keys(sandiMapping).length} key metrics`);
    
    return metrics;
}

async function processImportedData(importedData) {
    console.log('âš™ï¸ Processing imported data...');
    
    try {
        const currentTargets = getAllTargets();
        const { branchInfo, data } = importedData;
        
        const metrics = calculateMetricsFromData(data);
        
        const branchTarget = {
            branchCode: branchInfo.branchCode,
            branchName: branchInfo.branchName,
            businessLine: branchInfo.businessLine,
            targetPeriod: branchInfo.targetPeriod,
            targets: metrics,
            rawData: data,
            lastUpdate: new Date().toISOString()
        };
        
        currentTargets.branches[branchInfo.branchCode] = branchTarget;
        
        const businessLine = branchInfo.businessLine || 'konsolidasi';
        if (!currentTargets.businessLines[businessLine]) {
            currentTargets.businessLines[businessLine] = {};
        }
        currentTargets.businessLines[businessLine][branchInfo.branchCode] = branchTarget;
        
        const saved = saveTargets(currentTargets);
        
        if (saved) {
            showNotification(`âœ… Data cabang ${branchInfo.branchName} berhasil diimport!`, 'success');
            
            setTimeout(() => {
                if (typeof location !== 'undefined') {
                    location.reload();
                }
            }, 1500);
            
            return true;
        } else {
            throw new Error('Gagal menyimpan data ke storage');
        }
        
    } catch (error) {
        console.error('âŒ Process error:', error);
        showNotification('âŒ ' + error.message, 'error');
        return false;
    }
}

// ========================================
// EXPORT FUNCTIONS
// ========================================

function exportToExcel(branchCode = null) {
    console.log('ðŸ“¤ Exporting to Excel (Format Asli)...', branchCode);
    
    if (typeof XLSX === 'undefined') {
        showNotification('âŒ SheetJS library tidak ditemukan', 'error');
        return;
    }
    
    try {
        const currentTargets = getAllTargets();
        let branchesToExport = [];
        
        if (branchCode) {
            const branch = currentTargets.branches[branchCode];
            if (branch) branchesToExport.push(branch);
        } else {
            branchesToExport = Object.values(currentTargets.branches);
        }
        
        if (branchesToExport.length === 0) {
            showNotification('âš ï¸ Tidak ada data untuk diexport', 'warning');
            return;
        }
        
        const wb = XLSX.utils.book_new();
        
        // Export each branch in original template format
        branchesToExport.forEach(branch => {
            const sheetName = branch.branchCode.substring(0, 31);
            
            // Create data array matching original structure
            const dataRows = [
                ['POS LAPORAN POSISI KEUANGAN SESUAI LAPORAN BANK UMUM TERINTEGRASI', '', '', '', '', '', '', 'SANDI LAPORAN BANK UMUM TERINTEGRASI', '010', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', 'Triwulan I', '', 'Triwulan II', '', 'Triwulan III', '', 'Triwulan IV', ''],
                ['', '', '', '', '', '', '', '', 'Rupiah', 'Valas', 'Rupiah', 'Valas', 'Rupiah', 'Valas', 'Rupiah', 'Valas']
            ];
            
            // Add raw data
            if (branch.rawData) {
                branch.rawData.forEach(row => {
                    dataRows.push([
                        row["POS LAPORAN POSISI KEUANGAN SESUAI LAPORAN BANK UMUM TERINTEGRASI"] || "",
                        '', '', '', '', '', '',
                        row["SANDI LAPORAN BANK UMUM TERINTEGRASI"] || "",
                        row[" 010 "] || "",
                        row[" 011 "] || "",
                        row[" 020 "] || "",
                        row[" 021 "] || "",
                        row[" 030 "] || "",
                        row[" 031 "] || "",
                        row[" 040 "] || "",
                        row[" 041 "] || ""
                    ]);
                });
            }
            
            const ws = XLSX.utils.aoa_to_sheet(dataRows);
            ws['!cols'] = [
                { wch: 50 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 },
                { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 12 }
            ];
            
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = branchCode 
            ? `Export_${branchCode}_${new Date().getTime()}.xlsx`
            : `Export_All_Branches_${new Date().getTime()}.xlsx`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('âœ… Data berhasil diexport (Format Asli)', 'success');
        
    } catch (error) {
        console.error('âŒ Export error:', error);
        showNotification('âŒ Gagal export: ' + error.message, 'error');
    }
}

function exportToJSON(branchCode = null) {
    console.log('ðŸ“¤ Exporting to JSON...', branchCode);
    
    try {
        const currentTargets = getAllTargets();
        let dataToExport;
        
        if (branchCode) {
            const branch = currentTargets.branches[branchCode];
            if (!branch) {
                showNotification('âš ï¸ Cabang tidak ditemukan', 'warning');
                return;
            }
            dataToExport = {
                branchInfo: {
                    branchCode: branch.branchCode,
                    branchName: branch.branchName,
                    businessLine: branch.businessLine,
                    targetPeriod: branch.targetPeriod
                },
                data: branch.rawData || [],
                exportDate: new Date().toISOString()
            };
        } else {
            dataToExport = {
                ...currentTargets,
                exportDate: new Date().toISOString()
            };
        }
        
        const jsonStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = branchCode 
            ? `Export_${branchCode}_${new Date().getTime()}.json`
            : `Export_All_Branches_${new Date().getTime()}.json`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('âœ… Data JSON berhasil diexport', 'success');
        
    } catch (error) {
        console.error('âŒ Export JSON error:', error);
        showNotification('âŒ Gagal export JSON: ' + error.message, 'error');
    }
}

// ========================================
// UI HANDLERS (Same as before)
// ========================================

function triggerFileImport() {
    console.log('ðŸ–±ï¸ Triggering file import...');
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) {
        fileInput.click();
    } else {
        console.error('âŒ File input not found');
        showNotification('âŒ Error: File input tidak ditemukan', 'error');
    }
}

function toggleTemplateDropdown() {
    const dropdown = document.getElementById('templateDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        const exportDropdown = document.getElementById('exportDropdown');
        if (exportDropdown) exportDropdown.classList.remove('show');
    }
}

function toggleExportDropdown() {
    const dropdown = document.getElementById('exportDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        const templateDropdown = document.getElementById('templateDropdown');
        if (templateDropdown) templateDropdown.classList.remove('show');
    }
}

function showImportPreview(importedData) {
    console.log('ðŸ‘ï¸ Showing import preview...');
    
    const { branchInfo, data } = importedData;
    
    const modalHTML = `
        <div class="modal-overlay" id="importPreviewModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="modal-container" style="background: white; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow: hidden;">
                <div class="modal-header" style="padding: 20px 24px; border-bottom: 1px solid #e4e6eb; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">ðŸ“‹ Preview Data Import (Format Asli)</h3>
                    <button onclick="closeImportPreview()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #888;">Ã—</button>
                </div>
                <div class="modal-body" style="padding: 24px; overflow-y: auto; max-height: 60vh;">
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0;">Informasi Cabang</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #e4e6eb;">
                                <td style="padding: 8px; color: #666;">Kode Cabang:</td>
                                <td style="padding: 8px; font-weight: 500;">${branchInfo.branchCode}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e4e6eb;">
                                <td style="padding: 8px; color: #666;">Nama Cabang:</td>
                                <td style="padding: 8px; font-weight: 500;">${branchInfo.branchName}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e4e6eb;">
                                <td style="padding: 8px; color: #666;">Business Line:</td>
                                <td style="padding: 8px; font-weight: 500;">${branchInfo.businessLine}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; color: #666;">Periode Target:</td>
                                <td style="padding: 8px; font-weight: 500;">${branchInfo.targetPeriod}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0;">Data Target</h4>
                        <p>Total baris data: <strong>${data.length}</strong></p>
                        <p style="font-size: 14px; color: #666;">Format: Sesuai Template Asli Bank Sulselbar</p>
                    </div>
                    
                    <div style="background: #e7f3ff; border-left: 4px solid #0066cc; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <p style="margin: 0; color: #004085;"><strong>â„¹ï¸ Info:</strong> Data akan ditambahkan ke dashboard dengan struktur template asli.</p>
                    </div>
                    
                    <div style="background: #fff3cd; border-left: 4px solid #856404; padding: 12px; border-radius: 8px;">
                        <p style="margin: 0 0 8px 0; color: #856404;"><strong>âš ï¸ Perhatian:</strong></p>
                        <p style="margin: 0; color: #856404; font-size: 14px;">Template asli Bank mungkin tidak memiliki SEMUA sandi yang diperlukan untuk 6 metrics utama. Jika ada metrics yang kosong (DPK, Pendapatan, Biaya), Anda bisa isi manual via Settings â†’ Entry Data Target setelah import.</p>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid #e4e6eb; display: flex; gap: 12px; justify-content: flex-end;">
                    <button onclick="closeImportPreview()" style="padding: 10px 20px; border-radius: 8px; border: none; background: #f0f2f5; color: #333; cursor: pointer;">
                        Batal
                    </button>
                    <button onclick="confirmImport()" style="padding: 10px 20px; border-radius: 8px; border: none; background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; cursor: pointer;">
                        Import Data
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.pendingImportData = importedData;
}

function closeImportPreview() {
    const modal = document.getElementById('importPreviewModal');
    if (modal) modal.remove();
    window.pendingImportData = null;
}

async function confirmImport() {
    console.log('âœ… Confirming import...');
    if (window.pendingImportData) {
        const success = await processImportedData(window.pendingImportData);
        if (success) {
            closeImportPreview();
        }
    }
}

function showBranchExportModal() {
    console.log('ðŸ“‹ Showing branch export modal...');
    const currentTargets = getAllTargets();
    const branches = Object.values(currentTargets.branches || {});
    
    if (branches.length === 0) {
        showNotification('âš ï¸ Tidak ada data cabang untuk diexport', 'warning');
        return;
    }
    
    const branchOptions = branches.map(branch => 
        `<label style="display: block; padding: 12px; margin: 8px 0; border: 2px solid #e4e6eb; border-radius: 8px; cursor: pointer;">
            <input type="radio" name="branchExport" value="${branch.branchCode}" style="margin-right: 8px;">
            <span>${branch.branchCode} - ${branch.branchName}</span>
        </label>`
    ).join('');
    
    const modalHTML = `
        <div class="modal-overlay" id="branchExportModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="modal-container" style="background: white; border-radius: 12px; width: 90%; max-width: 500px;">
                <div class="modal-header" style="padding: 20px 24px; border-bottom: 1px solid #e4e6eb; display: flex; justify-content: space-between;">
                    <h3 style="margin: 0;">ðŸ“¤ Export Data Cabang (Format Asli)</h3>
                    <button onclick="closeBranchExportModal()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #888;">Ã—</button>
                </div>
                <div class="modal-body" style="padding: 24px;">
                    <p style="margin-bottom: 16px;">Pilih cabang yang ingin diexport:</p>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${branchOptions}
                    </div>
                    <div style="margin-top: 20px;">
                        <p style="font-weight: 500; margin-bottom: 8px;">Format Export:</p>
                        <label style="display: inline-flex; align-items: center; margin-right: 20px;">
                            <input type="radio" name="exportFormat" value="excel" checked style="margin-right: 8px;">
                            <span>Excel (.xlsx)</span>
                        </label>
                        <label style="display: inline-flex; align-items: center;">
                            <input type="radio" name="exportFormat" value="json" style="margin-right: 8px;">
                            <span>JSON (.json)</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid #e4e6eb; display: flex; gap: 12px; justify-content: flex-end;">
                    <button onclick="closeBranchExportModal()" style="padding: 10px 20px; border-radius: 8px; border: none; background: #f0f2f5; color: #333; cursor: pointer;">
                        Batal
                    </button>
                    <button onclick="executeBranchExport()" style="padding: 10px 20px; border-radius: 8px; border: none; background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%); color: white; cursor: pointer;">
                        Export
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeBranchExportModal() {
    const modal = document.getElementById('branchExportModal');
    if (modal) modal.remove();
}

function executeBranchExport() {
    const selectedBranch = document.querySelector('input[name="branchExport"]:checked');
    const selectedFormat = document.querySelector('input[name="exportFormat"]:checked');
    
    if (!selectedBranch) {
        showNotification('âš ï¸ Pilih cabang terlebih dahulu', 'warning');
        return;
    }
    
    const branchCode = selectedBranch.value;
    const format = selectedFormat.value;
    
    closeBranchExportModal();
    
    if (format === 'excel') {
        exportToExcel(branchCode);
    } else {
        exportToJSON(branchCode);
    }
}

// ========================================
// INITIALIZATION
// ========================================

function initializeImportHandlers() {
    console.log('ðŸ”§ Initializing import handlers (Template Asli)...');
    
    let fileInput = document.getElementById('importFileInput');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'importFileInput';
        fileInput.accept = '.xlsx,.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        console.log('âœ… File input created');
    }
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        console.log('ðŸ“ File selected:', file.name, file.type);
        
        try {
            showNotification('ðŸ“¤ Memproses file...', 'info');
            
            let importedData;
            if (file.name.endsWith('.xlsx')) {
                importedData = await importFromExcelWithOfficeSelect(file);
            } else if (file.name.endsWith('.json')) {
                importedData = await importFromJSON(file);
            } else {
                throw new Error('Format file tidak didukung. Gunakan .xlsx atau .json');
            }
            
            showImportPreview(importedData);
            
        } catch (error) {
            console.error('âŒ Import error:', error);
            showNotification('âŒ ' + error.message, 'error');
        }
        
        e.target.value = '';
    });
    
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
    
    console.log('âœ… Import handlers initialized (Template Asli)');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeImportHandlers);
} else {
    initializeImportHandlers();
}

console.log('âœ… Import/Export Manager Loaded (Template Asli Version)!');
