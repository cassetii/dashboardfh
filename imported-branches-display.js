// ========================================
// IMPORTED BRANCHES DISPLAY
// Show imported branch data in dashboard
// ========================================

console.log('ðŸ“Š Loading Imported Branches Display...');

/**
 * Render imported branches list
 */
function renderImportedBranches() {
    const container = document.getElementById('importedBranchesContainer');
    if (!container) {
        console.log('âš ï¸ Imported branches container not found');
        return;
    }
    
    const currentTargets = getAllTargets();
    const branches = Object.values(currentTargets.branches || {});
    
    console.log('ðŸ“‹ Total imported branches:', branches.length);
    
    if (branches.length === 0) {
        container.innerHTML = `
            <div class="imported-branches-section">
                <div class="section-header">
                    <h3><i class="fas fa-building"></i> Data Cabang yang Sudah Diimport</h3>
                    <p class="section-subtitle">Belum ada data cabang yang diimport</p>
                </div>
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <p style="color: #666;">Belum ada data target cabang</p>
                    <p style="color: #999; font-size: 14px;">Gunakan tombol "Import Data" untuk menambahkan data cabang</p>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="imported-branches-section">
            <div class="section-header">
                <h3><i class="fas fa-building"></i> Data Cabang yang Sudah Diimport</h3>
                <p class="section-subtitle">Total ${branches.length} cabang</p>
            </div>
            
            <div class="branches-grid">
    `;
    
    branches.forEach(branch => {
        const hasQ1 = branch.targets && branch.targets.Q1 && Object.keys(branch.targets.Q1).length > 0;
        const hasQ2 = branch.targets && branch.targets.Q2 && Object.keys(branch.targets.Q2).length > 0;
        const hasQ3 = branch.targets && branch.targets.Q3 && Object.keys(branch.targets.Q3).length > 0;
        const hasQ4 = branch.targets && branch.targets.Q4 && Object.keys(branch.targets.Q4).length > 0;
        
        const totalQuarters = (hasQ1 ? 1 : 0) + (hasQ2 ? 1 : 0) + (hasQ3 ? 1 : 0) + (hasQ4 ? 1 : 0);
        
        html += `
            <div class="branch-card" onclick="showBranchDetail('${branch.branchCode}')">
                <div class="branch-card-header">
                    <div class="branch-info">
                        <h4>${branch.branchName}</h4>
                        <p class="branch-code">Kode: ${branch.branchCode}</p>
                    </div>
                    <div class="branch-badge ${branch.businessLine}">
                        ${branch.businessLine}
                    </div>
                </div>
                
                <div class="branch-card-body">
                    <div class="branch-stat">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <div class="stat-label">Periode Target</div>
                            <div class="stat-value">${branch.targetPeriod}</div>
                        </div>
                    </div>
                    
                    <div class="branch-stat">
                        <i class="fas fa-chart-line"></i>
                        <div>
                            <div class="stat-label">Triwulan Tersedia</div>
                            <div class="stat-value">${totalQuarters} dari 4</div>
                        </div>
                    </div>
                    
                    <div class="branch-stat">
                        <i class="fas fa-database"></i>
                        <div>
                            <div class="stat-label">Total Data</div>
                            <div class="stat-value">${branch.rawData ? branch.rawData.length : 0} baris</div>
                        </div>
                    </div>
                </div>
                
                <div class="branch-card-footer">
                    <div class="quarters-indicator">
                        <span class="quarter-dot ${hasQ1 ? 'active' : ''}" title="Q1">Q1</span>
                        <span class="quarter-dot ${hasQ2 ? 'active' : ''}" title="Q2">Q2</span>
                        <span class="quarter-dot ${hasQ3 ? 'active' : ''}" title="Q3">Q3</span>
                        <span class="quarter-dot ${hasQ4 ? 'active' : ''}" title="Q4">Q4</span>
                    </div>
                    <button class="btn-view-detail" onclick="event.stopPropagation(); showBranchDetail('${branch.branchCode}')">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                </div>
                
                <div class="branch-card-actions">
                    <button class="btn-icon" onclick="event.stopPropagation(); exportBranchData('${branch.branchCode}')" title="Export">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon danger" onclick="event.stopPropagation(); deleteBranchData('${branch.branchCode}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Show branch detail modal
 */
function showBranchDetail(branchCode) {
    console.log('ðŸ‘ï¸ Showing detail for branch:', branchCode);
    
    const currentTargets = getAllTargets();
    const branch = currentTargets.branches[branchCode];
    
    if (!branch) {
        showNotification('âš ï¸ Data cabang tidak ditemukan', 'warning');
        return;
    }
    
    const modalHTML = `
        <div class="modal-overlay" id="branchDetailModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="modal-container" style="background: white; border-radius: 12px; width: 90%; max-width: 900px; max-height: 90vh; overflow: hidden;">
                <div class="modal-header" style="padding: 20px 24px; border-bottom: 1px solid #e4e6eb; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin: 0 0 5px 0;">${branch.branchName}</h3>
                        <p style="margin: 0; color: #666; font-size: 14px;">Kode: ${branch.branchCode} | ${branch.businessLine} | Periode ${branch.targetPeriod}</p>
                    </div>
                    <button onclick="closeBranchDetail()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #888;">Ã—</button>
                </div>
                
                <div class="modal-body" style="padding: 24px; overflow-y: auto; max-height: calc(90vh - 200px);">
                    <!-- Metrics per Quarter -->
                    <h4 style="margin: 0 0 16px 0; color: #0066cc;">ðŸ“Š Target Metrics per Triwulan</h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 30px;">
                        ${renderQuarterCards(branch.targets)}
                    </div>
                    
                    <!-- Metrics Table -->
                    <h4 style="margin: 24px 0 16px 0; color: #0066cc;">ðŸ“ˆ Detail Metrics (Summary)</h4>
                    ${renderMetricsTable(branch.targets)}
                    
                    <!-- Raw Data Table -->
                    <h4 style="margin: 30px 0 16px 0; color: #0066cc;">ðŸ“‹ Data Lengkap (${branch.rawData ? branch.rawData.length : 0} baris)</h4>
                    <div style="margin-bottom: 12px;">
                        <button onclick="toggleRawDataView('${branch.branchCode}')" id="toggleRawDataBtn_${branch.branchCode}" style="padding: 8px 16px; border-radius: 6px; border: none; background: #dc3545; color: white; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-eye-slash"></i> Sembunyikan Data
                        </button>
                        <button onclick="exportRawDataToExcel('${branch.branchCode}')" style="padding: 8px 16px; border-radius: 6px; border: none; background: #28a745; color: white; cursor: pointer; font-size: 14px; margin-left: 8px;">
                            <i class="fas fa-file-excel"></i> Export ke Excel
                        </button>
                    </div>
                    <div id="rawDataContainer_${branch.branchCode}" style="display: block; max-height: 600px; overflow: auto; border: 2px solid #e4e6eb; border-radius: 8px;">
                        ${renderRawDataTable(branch.rawData, branch.branchCode)}
                    </div>
                    
                    <!-- Update Info -->
                    <div style="margin-top: 20px; padding: 12px; background: #f8f9fa; border-radius: 8px; font-size: 14px;">
                        <strong>Last Update:</strong> ${new Date(branch.lastUpdate).toLocaleString('id-ID')}
                    </div>
                </div>
                
                <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid #e4e6eb; display: flex; gap: 12px; justify-content: space-between;">
                    <button onclick="exportBranchData('${branch.branchCode}')" style="padding: 10px 20px; border-radius: 8px; border: none; background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: white; cursor: pointer;">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                    <button onclick="closeBranchDetail()" style="padding: 10px 20px; border-radius: 8px; border: none; background: #f0f2f5; color: #333; cursor: pointer;">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function renderQuarterCards(targets) {
    let html = '';
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
        const qData = targets[quarter] || {};
        const hasData = Object.keys(qData).length > 0;
        
        html += `
            <div style="padding: 16px; background: ${hasData ? 'linear-gradient(135deg, #e7f3ff 0%, #c3cfe2 100%)' : '#f8f9fa'}; border-radius: 8px; border: 2px solid ${hasData ? '#0066cc' : '#e4e6eb'};">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Triwulan ${quarter.replace('Q', '')}</div>
                <div style="font-size: 24px; font-weight: bold; color: ${hasData ? '#0066cc' : '#ccc'};">
                    ${hasData ? Object.keys(qData).length : 0}
                </div>
                <div style="font-size: 12px; color: #666;">metrics</div>
            </div>
        `;
    });
    return html;
}

function renderMetricsTable(targets) {
    const metricLabels = {
        asset: 'Total Asset',
        dpk: 'DPK Total',
        kredit: 'Total Kredit',
        laba: 'Laba Bersih',
        pendapatan: 'Total Pendapatan',
        biaya: 'Total Biaya'
    };
    
    let html = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e4e6eb;">Metric</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e4e6eb;">Q1</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e4e6eb;">Q2</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e4e6eb;">Q3</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e4e6eb;">Q4</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    Object.keys(metricLabels).forEach(key => {
        const q1 = targets.Q1 && targets.Q1[key] ? formatCurrency(targets.Q1[key]) : '-';
        const q2 = targets.Q2 && targets.Q2[key] ? formatCurrency(targets.Q2[key]) : '-';
        const q3 = targets.Q3 && targets.Q3[key] ? formatCurrency(targets.Q3[key]) : '-';
        const q4 = targets.Q4 && targets.Q4[key] ? formatCurrency(targets.Q4[key]) : '-';
        
        html += `
            <tr style="border-bottom: 1px solid #e4e6eb;">
                <td style="padding: 12px; font-weight: 500;">${metricLabels[key]}</td>
                <td style="padding: 12px; text-align: right; font-family: monospace;">${q1}</td>
                <td style="padding: 12px; text-align: right; font-family: monospace;">${q2}</td>
                <td style="padding: 12px; text-align: right; font-family: monospace;">${q3}</td>
                <td style="padding: 12px; text-align: right; font-family: monospace;">${q4}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    return html;
}

function formatCurrency(value) {
    if (!value) return '-';
    return 'Rp ' + value.toLocaleString('id-ID');
}

function renderRawDataTable(rawData, branchCode) {
    if (!rawData || rawData.length === 0) {
        return '<p style="padding: 20px; text-align: center; color: #666;">Tidak ada raw data</p>';
    }
    
    let html = `
        <div style="padding: 16px;">
            <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; color: #333;">Total: ${rawData.length} baris</span>
                <input type="text" id="searchRawData_${branchCode}" placeholder="ðŸ” Search..." 
                       onkeyup="searchRawData('${branchCode}')"
                       style="padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; width: 250px;">
            </div>
            <table id="rawDataTable_${branchCode}" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead style="position: sticky; top: 0; background: #f8f9fa; z-index: 10;">
                    <tr>
                        <th rowspan="2" style="padding: 10px 6px; text-align: center; border: 1px solid #dee2e6; white-space: nowrap;">No</th>
                        <th rowspan="2" style="padding: 10px 8px; text-align: left; border: 1px solid #dee2e6; min-width: 250px;">POS LAPORAN</th>
                        <th rowspan="2" style="padding: 10px 6px; text-align: left; border: 1px solid #dee2e6; white-space: nowrap;">SANDI</th>
                        <th colspan="2" style="padding: 8px; text-align: center; border: 1px solid #dee2e6; background: #e3f2fd;">Triwulan I</th>
                        <th colspan="2" style="padding: 8px; text-align: center; border: 1px solid #dee2e6; background: #e8f5e9;">Triwulan II</th>
                        <th colspan="2" style="padding: 8px; text-align: center; border: 1px solid #dee2e6; background: #fff3e0;">Triwulan III</th>
                        <th colspan="2" style="padding: 8px; text-align: center; border: 1px solid #dee2e6; background: #fce4ec;">Triwulan IV</th>
                    </tr>
                    <tr>
                        <th style="padding: 8px 6px; text-align: center; border: 1px solid #dee2e6; background: #e3f2fd; font-size: 11px;">Rupiah</th>
                        <th style="padding: 8px 6px; text-align: center; border: 1px solid #dee2e6; background: #e3f2fd; font-size: 11px;">Valas</th>
                        <th style="padding: 8px 6px; text-align: center; border: 1px solid #dee2e6; background: #e8f5e9; font-size: 11px;">Rupiah</th>
                        <th style="padding: 8px 6px; text-align: center; border: 1px solid #dee2e6; background: #e8f5e9; font-size: 11px;">Valas</th>
                        <th style="padding: 8px 6px; text-align: center; border: 1px solid #dee2e6; background: #fff3e0; font-size: 11px;">Rupiah</th>
                        <th style="padding: 8px 6px; text-align: center; border: 1px solid #dee2e6; background: #fff3e0; font-size: 11px;">Valas</th>
                        <th style="padding: 8px 6px; text-align: center; border: 1px solid #dee2e6; background: #fce4ec; font-size: 11px;">Rupiah</th>
                        <th style="padding: 8px 6px; text-align: center; border: 1px solid #dee2e6; background: #fce4ec; font-size: 11px;">Valas</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    rawData.forEach((row, index) => {
        const posLaporan = row["POS LAPORAN POSISI KEUANGAN SESUAI LAPORAN BANK UMUM TERINTEGRASI"] || "";
        const deskripsi = row[""] || "";
        const sandi = row["SANDI LAPORAN BANK UMUM TERINTEGRASI"] || "";
        
        // Q1
        const q1Rupiah = row[" 010 "] || "";
        const q1Valas = row[" 011 "] || "";
        
        // Q2
        const q2Rupiah = row[" 020 "] || "";
        const q2Valas = row[" 021 "] || "";
        
        // Q3
        const q3Rupiah = row[" 030 "] || "";
        const q3Valas = row[" 031 "] || "";
        
        // Q4
        const q4Rupiah = row[" 040 "] || "";
        const q4Valas = row[" 041 "] || "";
        
        // Format values
        const formatValue = (val) => {
            if (!val || val === '-' || val === ' -   ') return '-';
            const numVal = String(val).replace(/[^\d]/g, '');
            if (numVal && parseInt(numVal) > 0) {
                return parseInt(numVal).toLocaleString('id-ID');
            }
            return val === 0 || val === '0' ? '0' : '-';
        };
        
        // Highlight rows with sandi
        const rowStyle = sandi ? 'background: #f8f9fa;' : '';
        const boldStyle = sandi ? 'font-weight: 500;' : '';
        
        html += `
            <tr style="${rowStyle}">
                <td style="padding: 6px; border: 1px solid #e9ecef; text-align: center;">${index + 1}</td>
                <td style="padding: 6px 8px; border: 1px solid #e9ecef; ${boldStyle}">
                    ${posLaporan}
                    ${deskripsi ? '<span style="color: #666; font-size: 11px; font-weight: normal;"> ' + deskripsi + '</span>' : ''}
                </td>
                <td style="padding: 6px; border: 1px solid #e9ecef; font-family: monospace; font-size: 10px;">
                    ${sandi}
                </td>
                <td style="padding: 6px; border: 1px solid #e9ecef; text-align: right; font-family: monospace; font-size: 11px; background: #f5faff;">
                    ${formatValue(q1Rupiah)}
                </td>
                <td style="padding: 6px; border: 1px solid #e9ecef; text-align: right; font-family: monospace; font-size: 11px; background: #f5faff;">
                    ${formatValue(q1Valas)}
                </td>
                <td style="padding: 6px; border: 1px solid #e9ecef; text-align: right; font-family: monospace; font-size: 11px; background: #f5faf5;">
                    ${formatValue(q2Rupiah)}
                </td>
                <td style="padding: 6px; border: 1px solid #e9ecef; text-align: right; font-family: monospace; font-size: 11px; background: #f5faf5;">
                    ${formatValue(q2Valas)}
                </td>
                <td style="padding: 6px; border: 1px solid #e9ecef; text-align: right; font-family: monospace; font-size: 11px; background: #fffbf5;">
                    ${formatValue(q3Rupiah)}
                </td>
                <td style="padding: 6px; border: 1px solid #e9ecef; text-align: right; font-family: monospace; font-size: 11px; background: #fffbf5;">
                    ${formatValue(q3Valas)}
                </td>
                <td style="padding: 6px; border: 1px solid #e9ecef; text-align: right; font-family: monospace; font-size: 11px; background: #fffafc;">
                    ${formatValue(q4Rupiah)}
                </td>
                <td style="padding: 6px; border: 1px solid #e9ecef; text-align: right; font-family: monospace; font-size: 11px; background: #fffafc;">
                    ${formatValue(q4Valas)}
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

function toggleRawDataView(branchCode) {
    const container = document.getElementById(`rawDataContainer_${branchCode}`);
    const btn = document.getElementById(`toggleRawDataBtn_${branchCode}`);
    
    if (container.style.display === 'none' || container.style.display === '') {
        // Show data
        container.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Sembunyikan Data';
        btn.style.background = '#dc3545';
    } else {
        // Hide data
        container.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-eye"></i> Tampilkan Semua Data';
        btn.style.background = '#6c757d';
    }
}

function searchRawData(branchCode) {
    const input = document.getElementById(`searchRawData_${branchCode}`);
    const filter = input.value.toLowerCase();
    const table = document.getElementById(`rawDataTable_${branchCode}`);
    const rows = table.getElementsByTagName('tr');
    
    let visibleCount = 0;
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length; j++) {
            const cellText = cells[j].textContent || cells[j].innerText;
            if (cellText.toLowerCase().indexOf(filter) > -1) {
                found = true;
                break;
            }
        }
        
        if (found) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }
    
    console.log(`Search "${filter}": ${visibleCount} results found`);
}

function exportRawDataToExcel(branchCode) {
    console.log('ðŸ“¤ Exporting raw data to Excel:', branchCode);
    
    if (typeof XLSX === 'undefined') {
        alert('SheetJS library tidak tersedia');
        return;
    }
    
    const currentTargets = getAllTargets();
    const branch = currentTargets.branches[branchCode];
    
    if (!branch || !branch.rawData) {
        alert('Data tidak ditemukan');
        return;
    }
    
    // Prepare data for export
    const exportData = [
        ['DATA LENGKAP - ' + branch.branchName],
        ['Kode Cabang: ' + branch.branchCode],
        ['Business Line: ' + branch.businessLine],
        ['Periode: ' + branch.targetPeriod],
        ['Total Baris: ' + branch.rawData.length],
        [],
        ['No', 'POS LAPORAN', 'DESKRIPSI', 'SANDI', 
         'Q1 Rupiah', 'Q1 Valas', 'Q2 Rupiah', 'Q2 Valas', 
         'Q3 Rupiah', 'Q3 Valas', 'Q4 Rupiah', 'Q4 Valas']
    ];
    
    branch.rawData.forEach((row, index) => {
        exportData.push([
            index + 1,
            row["POS LAPORAN POSISI KEUANGAN SESUAI LAPORAN BANK UMUM TERINTEGRASI"] || "",
            row[""] || "",
            row["SANDI LAPORAN BANK UMUM TERINTEGRASI"] || "",
            row[" 010 "] || "",  // Q1 Rupiah
            row[" 011 "] || "",  // Q1 Valas
            row[" 020 "] || "",  // Q2 Rupiah
            row[" 021 "] || "",  // Q2 Valas
            row[" 030 "] || "",  // Q3 Rupiah
            row[" 031 "] || "",  // Q3 Valas
            row[" 040 "] || "",  // Q4 Rupiah
            row[" 041 "] || ""   // Q4 Valas
        ]);
    });
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 5 },   // No
        { wch: 40 },  // POS LAPORAN
        { wch: 15 },  // DESKRIPSI
        { wch: 20 },  // SANDI
        { wch: 15 },  // Q1 Rupiah
        { wch: 12 },  // Q1 Valas
        { wch: 15 },  // Q2 Rupiah
        { wch: 12 },  // Q2 Valas
        { wch: 15 },  // Q3 Rupiah
        { wch: 12 },  // Q3 Valas
        { wch: 15 },  // Q4 Rupiah
        { wch: 12 }   // Q4 Valas
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Data Lengkap");
    
    // Generate and download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Raw_Data_${branchCode}_${new Date().getTime()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('âœ… Raw data berhasil di-export ke Excel (dengan Rupiah & Valas)', 'success');
}

function formatCurrency(value) {
    if (!value) return '-';
    return 'Rp ' + value.toLocaleString('id-ID');
}

function closeBranchDetail() {
    const modal = document.getElementById('branchDetailModal');
    if (modal) modal.remove();
}

function exportBranchData(branchCode) {
    console.log('ðŸ“¤ Exporting branch:', branchCode);
    closeBranchDetail();
    
    // Trigger export from import-export-manager
    if (typeof exportToExcel === 'function') {
        exportToExcel(branchCode);
    } else {
        showNotification('âš ï¸ Export function not available', 'warning');
    }
}

function deleteBranchData(branchCode) {
    if (!confirm('Yakin ingin menghapus data cabang ini?')) {
        return;
    }
    
    console.log('ðŸ—‘ï¸ Deleting branch:', branchCode);
    
    const currentTargets = getAllTargets();
    const branch = currentTargets.branches[branchCode];
    
    if (!branch) {
        showNotification('âš ï¸ Data cabang tidak ditemukan', 'warning');
        return;
    }
    
    // Remove from branches
    delete currentTargets.branches[branchCode];
    
    // Remove from business lines
    const businessLine = branch.businessLine || 'konsolidasi';
    if (currentTargets.businessLines[businessLine]) {
        delete currentTargets.businessLines[businessLine][branchCode];
    }
    
    // Save
    saveTargets(currentTargets);
    
    showNotification(`âœ… Data cabang ${branch.branchName} berhasil dihapus`, 'success');
    
    // Refresh display
    renderImportedBranches();
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('ðŸ“Š Initializing Imported Branches Display...');
        renderImportedBranches();
    });
} else {
    renderImportedBranches();
}

console.log('âœ… Imported Branches Display Loaded');
