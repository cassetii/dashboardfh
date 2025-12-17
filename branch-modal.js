// ========================================
// BRANCH MODAL HANDLER
// Mengelola Modal Popup Detail Kinerja Per Cabang
// ========================================

let currentIndicator = null;
let currentBranches = [];
let filteredBranches = [];

// Mapping indikator ke judul
const INDICATOR_TITLES = {
    'aset': {
        title: 'Total Aset',
        subtitle: 'Total aset per cabang dalam miliar rupiah',
        unit: 'Aset'
    },
    'kredit': {
        title: 'Kredit Pembiayaan',
        subtitle: 'Total kredit dan pembiayaan per cabang dalam miliar rupiah',
        unit: 'Kredit'
    },
    'dpk': {
        title: 'Dana Pihak Ketiga (DPK)',
        subtitle: 'Total dana pihak ketiga per cabang dalam miliar rupiah',
        unit: 'DPK'
    },
    'ati': {
        title: 'Aktiva Tetap & Inventaris (ATI)',
        subtitle: 'Total aktiva tetap dan inventaris per cabang dalam miliar rupiah',
        unit: 'ATI'
    }
};

/**
 * Membuka modal dengan indikator tertentu
 */
function openBranchModal(indicator) {
    currentIndicator = indicator;
    
    // Set judul modal
    const titleInfo = INDICATOR_TITLES[indicator];
    document.getElementById('modalIndicatorTitle').textContent = titleInfo.title;
    document.getElementById('modalIndicatorSubtitle').textContent = titleInfo.subtitle;
    
    // Load data cabang
    loadBranchData(indicator);
    
    // Reset filters
    document.getElementById('branchTypeFilter').value = 'all';
    document.getElementById('branchStatusFilter').value = 'all';
    document.getElementById('branchSearchInput').value = '';
    
    // Show modal
    document.getElementById('branchModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Menutup modal
 */
function closeBranchModal() {
    document.getElementById('branchModalOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    currentIndicator = null;
    currentBranches = [];
    filteredBranches = [];
}

/**
 * Load data cabang berdasarkan indikator
 */
function loadBranchData(indicator) {
    const allBranches = BRANCH_DATA.getAllBranches();
    currentBranches = [];
    
    // Ambil data performance untuk setiap cabang
    allBranches.forEach(branch => {
        const performanceData = BRANCH_DATA.getPerformanceData(indicator, branch.id);
        if (performanceData) {
            currentBranches.push({
                ...branch,
                ...performanceData
            });
        }
    });
    
    // Sort by percentage descending
    currentBranches.sort((a, b) => b.percentage - a.percentage);
    
    // Set filtered branches
    filteredBranches = [...currentBranches];
    
    // Render branches
    renderBranches();
    updateSummary();
}

/**
 * Filter branches berdasarkan tipe, status, dan search
 */
function filterBranches() {
    const typeFilter = document.getElementById('branchTypeFilter').value;
    const statusFilter = document.getElementById('branchStatusFilter').value;
    const searchQuery = document.getElementById('branchSearchInput').value.toLowerCase();
    
    filteredBranches = currentBranches.filter(branch => {
        // Filter by type
        let typeMatch = true;
        if (typeFilter === 'konvensional') {
            typeMatch = branch.type !== 'syariah';
        } else if (typeFilter === 'syariah') {
            typeMatch = branch.type === 'syariah';
        } else if (typeFilter === 'utama') {
            typeMatch = branch.type === 'utama';
        }
        
        // Filter by status
        let statusMatch = true;
        if (statusFilter !== 'all') {
            const statusKey = getStatusKey(branch.percentage);
            statusMatch = statusKey === statusFilter;
        }
        
        // Filter by search
        const searchMatch = branch.name.toLowerCase().includes(searchQuery);
        
        return typeMatch && statusMatch && searchMatch;
    });
    
    renderBranches();
    updateSummary();
}

/**
 * Get status key berdasarkan percentage
 */
function getStatusKey(percentage) {
    if (percentage < 50) return 'critical';
    if (percentage >= 50 && percentage < 75) return 'warning';
    if (percentage >= 75 && percentage < 100) return 'good';
    return 'excellent';
}

/**
 * Render branch cards
 */
function renderBranches() {
    const container = document.getElementById('branchModalBody');
    
    if (filteredBranches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Tidak ada cabang yang ditemukan</p>
            </div>
        `;
        return;
    }
    
    const titleInfo = INDICATOR_TITLES[currentIndicator];
    const cardsHTML = filteredBranches.map(branch => {
        const statusKey = getStatusKey(branch.percentage);
        const statusInfo = branch.statusInfo;
        
        return `
            <div class="branch-card status-${statusKey}">
                <div class="branch-card-header">
                    <div>
                        <h3 class="branch-name">${branch.name}</h3>
                        <span class="branch-type ${branch.type}">${branch.type}</span>
                    </div>
                    <div class="branch-status-badge ${statusKey}">
                        <i class="fas ${statusInfo.icon}"></i>
                        ${statusInfo.status}
                    </div>
                </div>
                
                <div class="branch-metrics">
                    <div class="branch-metric-row">
                        <span class="branch-metric-label">${titleInfo.unit} Realisasi</span>
                        <span class="branch-metric-value">${BRANCH_DATA.formatValue(branch.value)}</span>
                    </div>
                    <div class="branch-metric-row">
                        <span class="branch-metric-label">Target</span>
                        <span class="branch-metric-value">${BRANCH_DATA.formatValue(branch.target)}</span>
                    </div>
                </div>
                
                <div class="branch-percentage">
                    <div>
                        <div class="branch-percentage-value ${statusKey}">${branch.percentage.toFixed(1)}%</div>
                        <div class="branch-percentage-label">Pencapaian</div>
                    </div>
                </div>
                
                <div class="branch-progress-bar">
                    <div class="branch-progress-fill ${statusKey}" style="width: ${Math.min(branch.percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `<div class="branch-performance-grid">${cardsHTML}</div>`;
}

/**
 * Update summary statistics
 */
function updateSummary() {
    const totalCount = filteredBranches.length;
    const avgPerformance = totalCount > 0 
        ? (filteredBranches.reduce((sum, b) => sum + b.percentage, 0) / totalCount).toFixed(1)
        : 0;
    const totalValue = filteredBranches.reduce((sum, b) => sum + b.value, 0);
    
    document.getElementById('totalBranchesCount').textContent = totalCount;
    document.getElementById('averagePerformance').textContent = `${avgPerformance}%`;
    document.getElementById('totalValue').textContent = BRANCH_DATA.formatValue(totalValue);
}

/**
 * Export to Excel
 */
function exportBranchData() {
    showToast('Fitur export Excel akan segera tersedia', 'info');
    console.log('Export Excel:', {
        indicator: currentIndicator,
        branches: filteredBranches
    });
}

/**
 * Export to PDF
 */
function exportBranchPDF() {
    showToast('Fitur export PDF akan segera tersedia', 'info');
    console.log('Export PDF:', {
        indicator: currentIndicator,
        branches: filteredBranches
    });
}

/**
 * Close modal when clicking outside
 */
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('branchModalOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeBranchModal();
            }
        });
    }
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeBranchModal();
        }
    });
});

// ========================================
// TOAST NOTIFICATION FUNCTION
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
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
