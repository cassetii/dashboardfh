// ========================================
// NERACA LAYER 2 HANDLER
// Mengelola Modal Detail Pos Laporan Posisi Keuangan
// Toggle: Konsolidasi vs Per Cabang
// ========================================

let currentSection = null; // 'aset', 'liabilitas', or 'ekuitas'
let viewMode = 'konsolidasi'; // 'konsolidasi' or 'per-cabang'
let expandedItems = new Set();

// ========================================
// MODAL CONTROL
// ========================================

/**
 * Buka modal Layer 2 untuk section tertentu
 */
function openNeracaLayer2Modal(section) {
    currentSection = section;
    viewMode = 'konsolidasi';
    expandedItems.clear();
    
    // Set modal title
    const titles = {
        'aset': 'Detail Aset - Pos Laporan Posisi Keuangan',
        'liabilitas': 'Detail Liabilitas - Pos Laporan Posisi Keuangan',
        'ekuitas': 'Detail Ekuitas - Pos Laporan Posisi Keuangan'
    };
    
    document.getElementById('neracaLayer2Title').textContent = titles[section];
    
    // Load data
    loadNeracaDetail();
    
    // Show modal
    document.getElementById('neracaLayer2Overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Tutup modal
 */
function closeNeracaLayer2Modal() {
    document.getElementById('neracaLayer2Overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    currentSection = null;
    expandedItems.clear();
}

// ========================================
// VIEW MODE TOGGLE
// ========================================

/**
 * Toggle between konsolidasi and per-cabang view
 */
function toggleViewMode(mode) {
    viewMode = mode;
    
    // Update button active states
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.view-mode-btn[data-mode="${mode}"]`).classList.add('active');
    
    // Reload data
    renderNeracaTable();
}

// ========================================
// DATA LOADING & RENDERING
// ========================================

/**
 * Load data berdasarkan section
 */
function loadNeracaDetail() {
    const items = getItemsBySection(currentSection);
    renderNeracaTable();
    updateSummaryStats();
}

/**
 * Render tabel neraca
 */
function renderNeracaTable() {
    const container = document.getElementById('neracaTableBody');
    const items = getItemsBySection(currentSection);
    
    if (viewMode === 'konsolidasi') {
        container.innerHTML = renderKonsolidasiView(items);
    } else {
        container.innerHTML = renderPerCabangView(items);
    }
    
    // Attach event listeners for expand/collapse
    attachExpandListeners();
}

/**
 * Render konsolidasi view (tree structure)
 */
function renderKonsolidasiView(items) {
    let html = '';
    
    // Filter level 1 items
    const level1Items = items.filter(item => item.level === 1);
    
    level1Items.forEach(item => {
        html += renderKonsolidasiRow(item, items);
    });
    
    return html || '<tr><td colspan="3" class="empty-state">Tidak ada data</td></tr>';
}

/**
 * Render single row for konsolidasi view (recursive)
 */
function renderKonsolidasiRow(item, allItems) {
    const isExpanded = expandedItems.has(item.code);
    const hasChildren = item.hasChildren;
    const childItems = hasChildren ? allItems.filter(i => i.parent === item.code) : [];
    
    const indent = (item.level - 1) * 30;
    const expandIcon = hasChildren ? 
        (isExpanded ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-right"></i>') : 
        '';
    
    let html = `
        <tr class="neraca-row level-${item.level}" data-code="${item.code}">
            <td class="code-cell">
                <div class="code-wrapper" style="padding-left: ${indent}px">
                    ${hasChildren ? `<button class="expand-btn" data-code="${item.code}">${expandIcon}</button>` : '<span class="no-expand"></span>'}
                    <span class="code-text">${item.code}</span>
                </div>
            </td>
            <td class="name-cell">
                <div class="name-wrapper" style="padding-left: ${indent}px">
                    ${item.name}
                </div>
            </td>
            <td class="value-cell ${item.konsolidasi < 0 ? 'negative' : ''}">
                ${formatRupiah(item.konsolidasi)}
            </td>
        </tr>
    `;
    
    // Render children if expanded
    if (isExpanded && hasChildren) {
        childItems.forEach(child => {
            html += renderKonsolidasiRow(child, allItems);
        });
    }
    
    return html;
}

/**
 * Render per-cabang view (table with branches as columns)
 */
function renderPerCabangView(items) {
    // Get all branches
    const allBranches = BRANCH_DATA.getAllBranches();
    
    let html = `
        <tr class="header-row">
            <th class="sticky-col code-col">Kode</th>
            <th class="sticky-col name-col">Nama Pos</th>
    `;
    
    // Branch headers
    allBranches.forEach(branch => {
        html += `<th class="branch-col">${branch.name}</th>`;
    });
    
    html += `<th class="total-col">Total</th></tr>`;
    
    // Data rows (only level 1 for simplicity, or expandable)
    const level1Items = items.filter(item => item.level === 1);
    
    level1Items.forEach(item => {
        html += `<tr class="neraca-row">
            <td class="code-cell">${item.code}</td>
            <td class="name-cell">${item.name}</td>
        `;
        
        let rowTotal = 0;
        allBranches.forEach(branch => {
            const value = item.perCabang?.[branch.id] || 0;
            rowTotal += value;
            html += `<td class="value-cell">${value > 0 ? formatRupiah(value) : '-'}</td>`;
        });
        
        html += `<td class="total-cell">${formatRupiah(rowTotal)}</td></tr>`;
    });
    
    return html;
}

/**
 * Toggle expand/collapse item
 */
function toggleExpand(code) {
    if (expandedItems.has(code)) {
        expandedItems.delete(code);
    } else {
        expandedItems.add(code);
    }
    renderNeracaTable();
}

/**
 * Attach event listeners for expand buttons
 */
function attachExpandListeners() {
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const code = btn.getAttribute('data-code');
            toggleExpand(code);
        });
    });
}

// ========================================
// SUMMARY STATISTICS
// ========================================

/**
 * Update summary statistics
 */
function updateSummaryStats() {
    const total = NERACA_DETAIL_DATA.totals[currentSection];
    document.getElementById('neracaTotalValue').textContent = formatRupiah(total);
    
    const items = getItemsBySection(currentSection);
    const level1Count = items.filter(item => item.level === 1).length;
    document.getElementById('neracaItemCount').textContent = level1Count;
    
    document.getElementById('neracaViewMode').textContent = 
        viewMode === 'konsolidasi' ? 'Konsolidasi' : 'Per Cabang';
}

// ========================================
// EXPORT FUNCTIONS
// ========================================

/**
 * Export to Excel
 */
function exportNeracaExcel() {
    showToast('Fitur export Excel akan segera tersedia', 'info');
    console.log('Export Excel:', {
        section: currentSection,
        viewMode: viewMode
    });
}

/**
 * Export to PDF
 */
function exportNeracaPDF() {
    showToast('Fitur export PDF akan segera tersedia', 'info');
    console.log('Export PDF:', {
        section: currentSection,
        viewMode: viewMode
    });
}

// ========================================
// PRINT FUNCTION
// ========================================

/**
 * Print neraca report
 */
function printNeraca() {
    window.print();
}

// ========================================
// EXPAND/COLLAPSE ALL
// ========================================

/**
 * Expand all items
 */
function expandAllItems() {
    const items = getItemsBySection(currentSection);
    items.forEach(item => {
        if (item.hasChildren) {
            expandedItems.add(item.code);
        }
    });
    renderNeracaTable();
}

/**
 * Collapse all items
 */
function collapseAllItems() {
    expandedItems.clear();
    renderNeracaTable();
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('neracaLayer2Overlay');
    if (overlay) {
        // Close on outside click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeNeracaLayer2Modal();
            }
        });
    }
    
    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay?.classList.contains('active')) {
            closeNeracaLayer2Modal();
        }
    });
});

// ========================================
// TOAST NOTIFICATION
// ========================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toastContainer') || document.body;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
