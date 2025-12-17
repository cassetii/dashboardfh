// ========================================
// NERACA LAYER 2 DATA - FIREBASE VERSION
// Pos Laporan Posisi Keuangan dari Firebase
// TIDAK ADA DATA HARDCODE
// ========================================

const NERACA_DETAIL_DATA = {
    metadata: {
        lastUpdate: null,
        period: null,
        bankName: "PT Bank Sulselbar",
        reportTitle: "Pos Laporan Posisi Keuangan",
        viewMode: "konsolidasi"
    },
    
    // Struktur akan diisi dari Firebase
    aset: [],
    liabilitas: [],
    ekuitas: [],
    
    // Totals
    totals: {
        aset: 0,
        liabilitas: 0,
        ekuitas: 0
    },
    
    // Status
    isLoaded: false,
    currentPeriod: null
};

// ========================================
// NERACA DETAIL LOADER
// ========================================

const NeracaDetailLoader = {
    
    // Mapping sandi ke section
    SECTION_MAP: {
        '01': 'aset',      // Aset dimulai dengan 01
        '02': 'liabilitas', // Liabilitas dimulai dengan 02
        '03': 'ekuitas'     // Ekuitas dimulai dengan 03
    },
    
    /**
     * Initialize dan load data dari Firebase
     */
    async init(periode = null) {
        console.log('📋 NeracaDetailLoader initializing...');
        
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
        
        await this.loadNeracaDetail(periode);
        
        NERACA_DETAIL_DATA.isLoaded = true;
        console.log('✅ NeracaDetailLoader ready');
        
        return true;
    },
    
    /**
     * Load detail neraca dari Firebase
     */
    async loadNeracaDetail(periode, tipe = 'konsolidasi') {
        console.log(`📊 Loading neraca detail for ${periode} (${tipe})...`);
        
        try {
            const neracaData = await FirebaseDataService.getNeracaData(periode, tipe);
            
            // Reset data
            NERACA_DETAIL_DATA.aset = [];
            NERACA_DETAIL_DATA.liabilitas = [];
            NERACA_DETAIL_DATA.ekuitas = [];
            NERACA_DETAIL_DATA.totals = { aset: 0, liabilitas: 0, ekuitas: 0 };
            
            // Update metadata
            NERACA_DETAIL_DATA.metadata.lastUpdate = new Date().toISOString();
            NERACA_DETAIL_DATA.metadata.period = FirebaseDataService.formatPeriodName(periode);
            NERACA_DETAIL_DATA.metadata.viewMode = tipe;
            NERACA_DETAIL_DATA.currentPeriod = periode;
            
            // Convert to Miliar
            const toM = (val) => parseFloat((val / 1e9).toFixed(2));
            
            // Process each item
            Object.entries(neracaData).forEach(([sandi, data]) => {
                const section = this.getSection(sandi);
                if (!section) return;
                
                const level = this.getLevel(sandi);
                const parentCode = this.getParentCode(sandi);
                
                const item = {
                    code: sandi,
                    name: data.pos,
                    level: level,
                    konsolidasi: toM(data.total),
                    rupiah: toM(data.rupiah),
                    valas: toM(data.valas),
                    hasChildren: this.hasChildren(sandi, neracaData),
                    parent: parentCode
                };
                
                NERACA_DETAIL_DATA[section].push(item);
                
                // Update totals untuk level 1
                if (level === 1) {
                    // Hanya total aset, liabilitas, ekuitas utama
                    if (sandi === '01.00.00.00.00.00') {
                        NERACA_DETAIL_DATA.totals.aset = toM(data.total);
                    }
                }
            });
            
            // Sort by sandi
            NERACA_DETAIL_DATA.aset.sort((a, b) => a.code.localeCompare(b.code));
            NERACA_DETAIL_DATA.liabilitas.sort((a, b) => a.code.localeCompare(b.code));
            NERACA_DETAIL_DATA.ekuitas.sort((a, b) => a.code.localeCompare(b.code));
            
            // Calculate totals jika belum ada
            if (NERACA_DETAIL_DATA.totals.aset === 0) {
                NERACA_DETAIL_DATA.totals.aset = NERACA_DETAIL_DATA.aset
                    .filter(i => i.level === 1)
                    .reduce((sum, i) => sum + i.konsolidasi, 0);
            }
            
            NERACA_DETAIL_DATA.totals.liabilitas = NERACA_DETAIL_DATA.liabilitas
                .filter(i => i.level === 1)
                .reduce((sum, i) => sum + i.konsolidasi, 0);
                
            NERACA_DETAIL_DATA.totals.ekuitas = NERACA_DETAIL_DATA.ekuitas
                .filter(i => i.level === 1)
                .reduce((sum, i) => sum + i.konsolidasi, 0);
            
            console.log(`✅ Loaded ${NERACA_DETAIL_DATA.aset.length} aset, ${NERACA_DETAIL_DATA.liabilitas.length} liabilitas, ${NERACA_DETAIL_DATA.ekuitas.length} ekuitas`);
            
        } catch (error) {
            console.error('Error loading neraca detail:', error);
        }
    },
    
    /**
     * Get section based on sandi
     */
    getSection(sandi) {
        const prefix = sandi.substring(0, 2);
        return this.SECTION_MAP[prefix] || null;
    },
    
    /**
     * Get level based on sandi structure
     */
    getLevel(sandi) {
        const parts = sandi.split('.');
        let level = 1;
        
        // Count non-zero parts after first two
        for (let i = 1; i < parts.length; i++) {
            if (parts[i] !== '00') {
                level++;
            }
        }
        
        return Math.min(level, 4); // Max 4 levels
    },
    
    /**
     * Get parent code
     */
    getParentCode(sandi) {
        const parts = sandi.split('.');
        
        // Find last non-zero part and set it to 00
        for (let i = parts.length - 1; i > 0; i--) {
            if (parts[i] !== '00') {
                parts[i] = '00';
                return parts.join('.');
            }
        }
        
        return null;
    },
    
    /**
     * Check if sandi has children
     */
    hasChildren(sandi, allData) {
        const sandiParts = sandi.replace(/\./g, '');
        
        return Object.keys(allData).some(otherSandi => {
            if (otherSandi === sandi) return false;
            const otherParts = otherSandi.replace(/\./g, '');
            return otherParts.startsWith(sandiParts.substring(0, sandiParts.lastIndexOf('00') > 0 ? sandiParts.lastIndexOf('00') : 2));
        });
    },
    
    /**
     * Load data per cabang
     */
    async loadPerCabang(periode, kodeCabang) {
        return await this.loadNeracaDetail(periode, kodeCabang);
    },
    
    /**
     * Refresh data
     */
    async refreshData(periode, tipe = 'konsolidasi') {
        await this.loadNeracaDetail(periode, tipe);
        
        window.dispatchEvent(new CustomEvent('neracaDetailUpdated', {
            detail: { period: periode, tipe: tipe }
        }));
    }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

function getItemsBySection(section) {
    return NERACA_DETAIL_DATA[section] || [];
}

function getItemByCode(code) {
    const allSections = [
        ...NERACA_DETAIL_DATA.aset, 
        ...NERACA_DETAIL_DATA.liabilitas, 
        ...NERACA_DETAIL_DATA.ekuitas
    ];
    return allSections.find(item => item.code === code);
}

function getChildItems(parentCode) {
    const allSections = [
        ...NERACA_DETAIL_DATA.aset, 
        ...NERACA_DETAIL_DATA.liabilitas, 
        ...NERACA_DETAIL_DATA.ekuitas
    ];
    return allSections.filter(item => item.parent === parentCode);
}

function formatRupiah(value) {
    if (Math.abs(value) >= 1000) {
        return `Rp ${(value / 1000).toFixed(2)} T`;
    }
    return `Rp ${value.toFixed(2)} M`;
}

// ========================================
// AUTO-INITIALIZE
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    setTimeout(async () => {
        const success = await NeracaDetailLoader.init();
        
        if (success) {
            console.log('📋 Neraca Detail loaded from Firebase!');
            window.dispatchEvent(new CustomEvent('neracaDetailReady'));
        }
    }, 2500);
});

// Listen untuk period change
window.addEventListener('bankDataUpdated', async (e) => {
    if (e.detail && e.detail.period) {
        await NeracaDetailLoader.refreshData(e.detail.period);
    }
});

// Export
window.NERACA_DETAIL_DATA = NERACA_DETAIL_DATA;
window.NeracaDetailLoader = NeracaDetailLoader;
window.getItemsBySection = getItemsBySection;
window.getItemByCode = getItemByCode;
window.getChildItems = getChildItems;
window.formatRupiah = formatRupiah;

console.log('📦 Neraca Detail Firebase Version loaded');
