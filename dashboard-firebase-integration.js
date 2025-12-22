/**
 * Dashboard Firebase Integration - FIXED VERSION
 * ===============================================
 * Version: 9.0 - Working Ratio Calculation
 */

(function() {
    'use strict';

    console.log('🚀 Dashboard Firebase Integration v9.0 - FIXED');

    // ==========================================
    // LOADING OVERLAY
    // ==========================================
    
    function createLoadingOverlay() {
        if (document.getElementById('dataLoadingOverlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'dataLoadingOverlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Memuat data...</div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        const style = document.createElement('style');
        style.textContent = `
            #dataLoadingOverlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255,255,255,0.95); display: none;
                justify-content: center; align-items: center; z-index: 99999;
            }
            #dataLoadingOverlay.show { display: flex; }
            #dataLoadingOverlay .loading-spinner {
                width: 50px; height: 50px; border: 4px solid #e0e0e0;
                border-top: 4px solid #2e7d32; border-radius: 50%;
                animation: spin 1s linear infinite; margin: 0 auto 15px;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            
            body.branch-mode .indicator-card[data-ratio="car"],
            body.branch-mode .indicator-card[data-ratio="roa"],
            body.branch-mode .indicator-card[data-ratio="roe"],
            body.branch-mode .indicator-card[data-ratio="nim"],
            body.branch-mode .indicator-card[data-ratio="lcr"],
            body.branch-mode .indicator-card[data-ratio="nsfr"] { display: none !important; }
            
            body.branch-mode .indicator-card[data-ratio="bopo"],
            body.branch-mode .indicator-card[data-ratio="ldr"],
            body.branch-mode .indicator-card[data-ratio="casa"],
            body.branch-mode .indicator-card[data-ratio="npl"] { display: block !important; }
            
            #branchDropdownContainer {
                display: none; 
                position: fixed !important;
                background: white; 
                border: 2px solid #2e7d32;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.25); 
                z-index: 99999 !important;
                min-width: 280px; 
                max-height: 400px; 
                overflow-y: auto; 
                padding: 10px;
            }
            #branchDropdownContainer.show { 
                display: block !important; 
            }
            #branchDropdownContainer .branch-dropdown,
            #branchDropdownContainer select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                background: white;
                cursor: pointer;
            }
            #branchDropdownContainer select:focus {
                outline: none;
                border-color: #2e7d32;
            }
            .filter-controls {
                position: relative;
            }
        `;
        document.head.appendChild(style);
    }

    function showLoading() {
        const overlay = document.getElementById('dataLoadingOverlay');
        if (overlay) overlay.classList.add('show');
    }

    function hideLoading() {
        const overlay = document.getElementById('dataLoadingOverlay');
        if (overlay) overlay.classList.remove('show');
    }

    // ==========================================
    // SANDI MAPPING
    // ==========================================
    
    // ==========================================
    // SANDI CODES - KONVENSIONAL
    // ==========================================
    const SANDI_KONVEN = {
        totalAset: '01.00.00.00.00.00',
        kredit: '01.09.01.00.00.00',
        pembiayaan: '01.10.00.00.00.00',
        ckpnPrefix: '01.12',
        atiGross: '01.14.01.00.00.00',
        atiAkum: '01.14.02.00.00.00',
        giro: '02.01.01.00.00.00',
        tabungan: '02.02.01.00.00.00',
        deposito: '02.03.01.00.00.00',
        modal: '03.00.00.00.00.00',
        labaSebelumPajak: '03.05.02.01.00.00',
        pajakLaba: '03.05.02.02.00.00',
        pendapatanBunga: '04.11.00.00.00.00',
        bebanBunga: '05.11.00.00.00.00'
    };
    
    // ==========================================
    // SANDI CODES - SYARIAH (Multiple sandi per komponen)
    // ==========================================
    const SANDI_SYARIAH = {
        totalAset: '01.00.00.00.00.00',
        kreditPrefix: '01.09.03',  // Sum all 01.09.03.xx.xx.xx
        pembiayaan: '01.10.00.00.00.00',
        ckpnPrefix: '01.12',
        atiGross: '01.14.01.00.00.00',
        atiAkum: '01.14.02.00.00.00',
        // Giro Syariah: Wadiah + Mudharabah + Lainnya
        giroList: ['02.01.02.01.00.00', '02.01.02.02.00.00', '02.01.02.03.00.00'],
        // Tabungan Syariah: Wadiah + Mudharabah + Lainnya
        tabunganList: ['02.02.02.01.00.00', '02.02.02.02.00.00', '02.02.02.03.00.00'],
        // Deposito Syariah: Mudharabah + Lainnya
        depositoList: ['02.03.02.01.00.00', '02.03.02.02.00.00'],
        modal: '03.00.00.00.00.00',
        labaSebelumPajak: '03.05.02.01.00.00',
        pajakLaba: '03.05.02.02.00.00',
        pendapatanBunga: '04.11.00.00.00.00',
        bebanBunga: '05.11.00.00.00.00'
    };
    
    // Default SANDI (for backward compatibility)
    const SANDI = SANDI_KONVEN;
    
    // ==========================================
    // BRANCH TYPE DETECTION
    // ==========================================
    
    // Cabang Syariah: 500 (UUS), 510, 520, 530, 540
    const CABANG_SYARIAH = ['500', '510', '520', '530', '540', 'SYR'];
    
    // Cabang Konvensional: 001 (Pusat), 010-131, 400, CAPEM (073,088,094,102,103,123,138,139)
    const CABANG_KONVEN = [
        '001', '010', '011', '020', '021', '030', '031', '040', '041', '042',
        '050', '060', '070', '071', '072', '074', '075', '077', '080', '090',
        '091', '092', '093', '100', '101', '110', '111', '120', '121', '130',
        '131', '400', '073', '088', '094', '102', '103', '123', '138', '139', 'KON'
    ];
    
    /**
     * Detect if branch code is Syariah or Konvensional
     * @param {string} kode - Branch code or type (510, 001, KON, SYR, ALL, konvensional, syariah)
     * @returns {string} 'syariah' | 'konvensional' | 'konsolidasi'
     */
    function getCabangType(kode) {
        if (!kode || kode === 'ALL' || kode === 'konsolidasi') return 'konsolidasi';
        // Handle tipe filter
        if (kode === 'syariah' || kode === 'SYR') return 'syariah';
        if (kode === 'konvensional' || kode === 'KON') return 'konvensional';
        // Handle cabang spesifik
        if (CABANG_SYARIAH.includes(kode)) return 'syariah';
        if (CABANG_KONVEN.includes(kode)) return 'konvensional';
        // Default: check if starts with 5 (syariah) or not
        if (kode.startsWith('5')) return 'syariah';
        return 'konvensional';
    }

    // ==========================================
    // STATE
    // ==========================================
    
    let db = null;
    let neracaData = [];
    let labarugiData = [];
    let isDataLoaded = false;
    let availablePeriodes = [];
    
    let currentFilters = {
        periode: null,
        tipe: 'konsolidasi',
        cabang: null
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================
    
    async function init() {
        console.log('🔄 Initializing Firebase connection...');
        createLoadingOverlay();
        showLoading();

        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                db = firebase.firestore();
                console.log('✅ Firestore connected');
            } else {
                throw new Error('Firebase not initialized');
            }

            await loadData();
            setupEventListeners();
            // overrideFunctions() - DIHAPUS, sudah di-handle oleh immediate override
            hideLoading();
            
        } catch (error) {
            console.error('❌ Init error:', error);
            hideLoading();
        }
    }

    // ==========================================
    // DATA LOADING
    // ==========================================
    
    async function loadData() {
        console.log('📊 Loading data from Firebase...');
        console.log('📌 db object:', db ? 'exists' : 'NULL');
        
        if (!db) {
            console.error('❌ Firestore db is null!');
            return;
        }
        
        try {
            console.log('📥 Fetching banksulselbar_neraca...');
            const neracaSnapshot = await db.collection('banksulselbar_neraca').get();
            console.log('📥 Neraca snapshot size:', neracaSnapshot.size);
            
            neracaData = [];
            neracaSnapshot.forEach(doc => {
                neracaData.push({ id: doc.id, ...doc.data() });
            });
            console.log('✅ Neraca loaded:', neracaData.length, 'documents');

            console.log('📥 Fetching banksulselbar_labarugi...');
            const labarugiSnapshot = await db.collection('banksulselbar_labarugi').get();
            console.log('📥 Labarugi snapshot size:', labarugiSnapshot.size);
            
            labarugiData = [];
            labarugiSnapshot.forEach(doc => {
                labarugiData.push({ id: doc.id, ...doc.data() });
            });
            console.log('✅ Labarugi loaded:', labarugiData.length, 'documents');

            // Extract available periodes
            const periodeSet = new Set();
            neracaData.forEach(d => { if (d.periode) periodeSet.add(d.periode); });
            labarugiData.forEach(d => { if (d.periode) periodeSet.add(d.periode); });
            
            availablePeriodes = Array.from(periodeSet).sort().reverse();
            
            if (availablePeriodes.length > 0 && !currentFilters.periode) {
                currentFilters.periode = availablePeriodes[0];
            }

            updatePeriodDropdown();

            console.log(`✅ Loaded: ${neracaData.length} neraca, ${labarugiData.length} labarugi`);
            console.log(`📅 Periodes: ${availablePeriodes.join(', ')}`);

            isDataLoaded = true;
            updateAllCards();

        } catch (error) {
            console.error('❌ Load error:', error);
        }
    }

    // ==========================================
    // PERIOD DROPDOWN
    // ==========================================
    
    function updatePeriodDropdown() {
        const select = document.getElementById('headerPeriodSelect');
        if (!select) return;
        
        select.innerHTML = '';
        
        const bulanNames = {
            '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
            '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
            '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
        };
        
        availablePeriodes.forEach(periode => {
            const [tahun, bulan] = periode.split('-');
            const option = document.createElement('option');
            option.value = periode;
            option.textContent = `${bulanNames[bulan] || bulan} ${tahun}`;
            select.appendChild(option);
        });
        
        if (currentFilters.periode) {
            select.value = currentFilters.periode;
        }
        
        console.log(`📅 Period dropdown updated: ${availablePeriodes.length} options`);
    }

    // ==========================================
    // DATA FILTERING
    // ==========================================
    
    function filterData(data) {
        return data.filter(item => {
            if (item.is_ratio === true) return false;
            if (currentFilters.periode && item.periode !== currentFilters.periode) return false;
            
            // Jika filter per cabang spesifik
            if (currentFilters.cabang) {
                return item.kode_cabang === currentFilters.cabang;
            }
            
            // Filter berdasarkan tipe - gunakan kode agregasi yang sudah ada di Firebase
            if (currentFilters.tipe === 'konsolidasi') {
                return item.kode_cabang === 'ALL';
            }
            if (currentFilters.tipe === 'konvensional') {
                return item.kode_cabang === 'KON';
            }
            if (currentFilters.tipe === 'syariah') {
                return item.kode_cabang === 'SYR';
            }
            
            return item.kode_cabang === 'ALL'; // Default ke konsolidasi
        });
    }

    function sumBySandi(data, sandi) {
        // Data sudah di-aggregate di Firebase (ALL/KON/SYR), jadi cukup find 1 item
        const item = data.find(d => d.sandi === sandi);
        return item ? (item.total || 0) : 0;
    }

    function sumBySandiPrefix(data, prefix) {
        return data.filter(d => d.sandi && d.sandi.startsWith(prefix))
            .reduce((sum, d) => sum + (d.total || 0), 0);
    }
    
    /**
     * Sum values from multiple sandi codes (for Syariah DPK)
     * @param {Array} data - Filtered neraca data
     * @param {Array} sandiList - List of sandi codes to sum
     * @returns {number} Total value
     */
    function sumBySandiList(data, sandiList) {
        let total = 0;
        for (const sandi of sandiList) {
            const item = data.find(d => d.sandi === sandi);
            if (item) {
                total += (item.total || 0);
            }
        }
        return total;
    }

    // ==========================================
    // GET RATIOS FROM EXCEL (if available)
    // ==========================================
    
    function getRatiosFromExcel() {
        // Tentukan kode target berdasarkan filter
        const targetKode = currentFilters.cabang || 
            (currentFilters.tipe === 'konsolidasi' ? 'ALL' : 
             currentFilters.tipe === 'konvensional' ? 'KON' : 'SYR');
        
        // Cek apakah cabang Syariah (510-540)
        const isSyariahBranch = CABANG_SYARIAH.includes(targetKode) && targetKode !== 'SYR';
        
        // Coba ambil ratio untuk kode target
        let ratioItems = neracaData.filter(d => 
            d.is_ratio === true && 
            d.periode === currentFilters.periode &&
            d.kode_cabang === targetKode
        );
        
        // Fallback: Untuk cabang Syariah (510-540), ambil dari SYR jika tidak ada
        if (ratioItems.length === 0 && isSyariahBranch) {
            console.log(`📊 No ratio for ${targetKode}, fallback to SYR`);
            ratioItems = neracaData.filter(d => 
                d.is_ratio === true && 
                d.periode === currentFilters.periode &&
                d.kode_cabang === 'SYR'
            );
        }
        
        // Fallback: Untuk cabang Konvensional, ambil dari KON jika tidak ada
        if (ratioItems.length === 0 && !isSyariahBranch && targetKode !== 'ALL' && targetKode !== 'KON' && targetKode !== 'SYR') {
            console.log(`📊 No ratio for ${targetKode}, fallback to KON`);
            ratioItems = neracaData.filter(d => 
                d.is_ratio === true && 
                d.periode === currentFilters.periode &&
                d.kode_cabang === 'KON'
            );
        }
        
        if (ratioItems.length === 0) return null;
        
        console.log(`📊 Found ${ratioItems.length} ratio items from Excel for ${targetKode}`);
        
        const result = {};
        ratioItems.forEach(item => {
            const name = (item.ratio_name || '').toUpperCase().trim();
            const value = (item.value || 0) * 100;
            
            if (name === 'LDR') result.ldr = value;
            else if (name === 'BOPO') result.bopo = value;
            else if (name === 'CASA') result.casa = value;
            else if (name === 'ROA') result.roa = value;
            else if (name === 'ROE') result.roe = value;
            else if (name === 'NIM') result.nim = value;
            else if (name === 'NPL' || name === 'NON PERFORMING LOAN' || name.includes('NPL')) result.npl = value;
            else if (name === 'KPMM' || name === 'CAR') result.car = value;
        });
        
        return result;
    }

    // ==========================================
    // METRICS CALCULATION
    // ==========================================
    
    function calculateMetrics() {
        const neraca = filterData(neracaData);
        const labarugi = filterData(labarugiData);

        console.log(`📊 Calculating: ${neraca.length} neraca, ${labarugi.length} labarugi`);
        
        // ==========================================
        // DETECT BRANCH TYPE FOR CORRECT SANDI
        // ==========================================
        const targetKode = currentFilters.cabang || currentFilters.tipe || 'ALL';
        const cabangType = getCabangType(targetKode);
        const isSyariah = cabangType === 'syariah';
        
        console.log(`🏦 Branch Type: ${cabangType} (kode: ${targetKode}, isSyariah: ${isSyariah})`);

        // ==========================================
        // AKTIVA
        // ==========================================
        const totalAset = sumBySandi(neraca, SANDI_KONVEN.totalAset);
        
        // Kredit/Pembiayaan - different SANDI for Syariah
        let kredit, pembiayaan;
        if (isSyariah) {
            // Syariah only: Sum all 01.09.03.xx.xx.xx (Pembiayaan Syariah)
            kredit = sumBySandiPrefix(neraca, SANDI_SYARIAH.kreditPrefix);
            pembiayaan = kredit; // For syariah, kredit = pembiayaan
        } else {
            // Konvensional atau Konsolidasi
            kredit = sumBySandi(neraca, SANDI_KONVEN.kredit);
            // Pembiayaan Syariah selalu menggunakan prefix 01.09.03 (bukan 01.10)
            pembiayaan = sumBySandiPrefix(neraca, '01.09.03');
        }
        
        const ckpn = sumBySandiPrefix(neraca, SANDI_KONVEN.ckpnPrefix);
        const atiGross = sumBySandi(neraca, SANDI_KONVEN.atiGross);
        const atiAkum = sumBySandi(neraca, SANDI_KONVEN.atiAkum);
        const ati = atiGross + atiAkum;
        
        // ==========================================
        // DPK - CRITICAL: Different SANDI for Syariah!
        // ==========================================
        let giro, tabungan, deposito;
        
        if (isSyariah) {
            // Syariah: Sum multiple sandi codes
            giro = sumBySandiList(neraca, SANDI_SYARIAH.giroList);
            tabungan = sumBySandiList(neraca, SANDI_SYARIAH.tabunganList);
            deposito = sumBySandiList(neraca, SANDI_SYARIAH.depositoList);
            console.log(`💰 DPK Syariah - Giro: ${formatCurrency(giro)}, Tab: ${formatCurrency(tabungan)}, Dep: ${formatCurrency(deposito)}`);
        } else {
            // Konvensional: Single sandi code
            giro = sumBySandi(neraca, SANDI_KONVEN.giro);
            tabungan = sumBySandi(neraca, SANDI_KONVEN.tabungan);
            deposito = sumBySandi(neraca, SANDI_KONVEN.deposito);
        }
        
        const dpk = giro + tabungan + deposito;
        
        const modal = sumBySandi(neraca, SANDI_KONVEN.modal);
        
        // ==========================================
        // LABA RUGI
        // ==========================================
        const pendapatanBunga = sumBySandi(labarugi, SANDI_KONVEN.pendapatanBunga);
        const bebanBunga = sumBySandi(labarugi, SANDI_KONVEN.bebanBunga);
        
        // ==========================================
        // TOTAL PENDAPATAN & BIAYA (untuk Card Neraca)
        // Harus sinkron dengan Detail Pendapatan & Biaya
        // ==========================================
        // Helper untuk avoid double counting
        function getValueOrLeaf(sandi, prefix) {
            const summaryValue = sumBySandi(labarugi, sandi);
            if (summaryValue > 0) return summaryValue;
            // Sum leaf only (exclude .00.00.00)
            return labarugi.filter(d => 
                d.kode_cabang === targetKode && 
                d.periode === currentFilters.periode && 
                d.sandi && d.sandi.startsWith(prefix) &&
                !d.sandi.endsWith('.00.00.00')
            ).reduce((sum, d) => sum + Math.abs(d.total || 0), 0);
        }
        
        // Total Pendapatan = 04.11 + 04.12 + 04.20
        const pendapatanBungaTotal = getValueOrLeaf('04.11.00.00.00.00', '04.11');
        const pendapatanOpLainTotal = getValueOrLeaf('04.12.00.00.00.00', '04.12');
        const pendapatanNonOpTotal = getValueOrLeaf('04.20.00.00.00.00', '04.20');
        const totalPendapatan = pendapatanBungaTotal + pendapatanOpLainTotal + pendapatanNonOpTotal;
        
        // Total Biaya = 05.11 + 05.12 + 05.20
        const bebanBungaTotal = getValueOrLeaf('05.11.00.00.00.00', '05.11');
        const bebanOpLainTotal = getValueOrLeaf('05.12.00.00.00.00', '05.12');
        const bebanNonOpTotal = getValueOrLeaf('05.20.00.00.00.00', '05.20');
        const totalBiaya = bebanBungaTotal + bebanOpLainTotal + bebanNonOpTotal;
        
        console.log(`📊 Total Pendapatan: ${formatCurrency(totalPendapatan)} (Bunga: ${formatCurrency(pendapatanBungaTotal)}, OpLain: ${formatCurrency(pendapatanOpLainTotal)}, NonOp: ${formatCurrency(pendapatanNonOpTotal)})`);
        console.log(`📊 Total Biaya: ${formatCurrency(totalBiaya)} (Bunga: ${formatCurrency(bebanBungaTotal)}, OpLain: ${formatCurrency(bebanOpLainTotal)}, NonOp: ${formatCurrency(bebanNonOpTotal)})`);
        
        // Total Pendapatan & Beban Operasional for BOPO
        const pendapatanOperasional = sumBySandi(labarugi, '01.00.00.00.00.00');
        const bebanOperasional = sumBySandi(labarugi, '02.00.00.00.00.00');
        
        // Laba Bersih = Laba Sebelum Pajak - Pajak
        let labaSebelumPajak = sumBySandi(labarugi, SANDI_KONVEN.labaSebelumPajak);
        let pajakLaba = sumBySandi(labarugi, SANDI_KONVEN.pajakLaba);
        
        // Fallback to neraca if labarugi is empty
        if (labaSebelumPajak === 0) {
            labaSebelumPajak = sumBySandi(neraca, SANDI_KONVEN.labaSebelumPajak);
            pajakLaba = sumBySandi(neraca, SANDI_KONVEN.pajakLaba);
        }
        
        // Calculate Laba Bersih = 03.05.02.01.00.00 - 03.05.02.02.00.00
        let labaBersih = labaSebelumPajak - pajakLaba;
        
        console.log(`💰 Laba Sebelum Pajak: ${formatCurrency(labaSebelumPajak)}`);
        console.log(`💰 Pajak Laba: ${formatCurrency(pajakLaba)}`);
        console.log(`💰 Laba Bersih: ${formatCurrency(labaBersih)}`);

        // Try Excel ratios first
        const excelRatios = getRatiosFromExcel();
        
        let ldr, casa, bopo, roa, roe, nim, npl, car;
        
        if (excelRatios) {
            console.log('📊 Using ratios from Excel');
            ldr = excelRatios.ldr || 0;
            casa = excelRatios.casa || 0;
            bopo = excelRatios.bopo || 0;
            roa = excelRatios.roa || 0;
            roe = excelRatios.roe || 0;
            nim = excelRatios.nim || 0;
            npl = excelRatios.npl || 0;
            car = excelRatios.car || 0;
        } else {
            console.log('📊 Calculating ratios manually');
            // Calculate manually
            ldr = dpk > 0 ? (kredit / dpk) * 100 : 0;
            casa = dpk > 0 ? ((giro + tabungan) / dpk) * 100 : 0;
            
            // BOPO
            if (pendapatanOperasional > 0) {
                bopo = (bebanOperasional / pendapatanOperasional) * 100;
            } else if (pendapatanBunga > 0) {
                bopo = (bebanBunga / pendapatanBunga) * 100;
            } else {
                bopo = 0;
            }
            
            roa = totalAset > 0 ? (labaBersih / totalAset) * 100 : 0;
            roe = modal > 0 ? (labaBersih / modal) * 100 : 0;
            nim = totalAset > 0 ? ((pendapatanBunga - bebanBunga) / totalAset) * 100 : 0;
            npl = 0;
            car = 0;
        }

        console.log(`📈 Total Aset: ${formatCurrency(totalAset)}`);
        console.log(`📊 LDR: ${ldr.toFixed(2)}%, CASA: ${casa.toFixed(2)}%, BOPO: ${bopo.toFixed(2)}%`);

        return {
            totalAset, kredit, pembiayaan, ckpn, ati, atiGross, atiAkum,
            dpk, giro, tabungan, deposito, modal,
            labaBersih, pendapatanBunga, bebanBunga,
            totalPendapatan, totalBiaya,
            // Detail components for reference
            pendapatanBungaTotal, pendapatanOpLainTotal, pendapatanNonOpTotal,
            bebanBungaTotal, bebanOpLainTotal, bebanNonOpTotal,
            ldr, casa, bopo, roa, roe, nim, npl, car
        };
    }

    // ==========================================
    // FORMATTING
    // ==========================================
    
    function formatValue(value) {
        if (value === null || value === undefined || isNaN(value)) {
            return { text: 'Rp 0', unit: '' };
        }
        
        const abs = Math.abs(value);
        const sign = value < 0 ? '-' : '';
        
        if (abs >= 1e12) {
            return { text: `${sign}Rp ${(abs / 1e12).toFixed(2)}`, unit: 'Triliun' };
        } else if (abs >= 1e9) {
            return { text: `${sign}Rp ${(abs / 1e9).toFixed(2)}`, unit: 'Miliar' };
        } else if (abs >= 1e6) {
            return { text: `${sign}Rp ${(abs / 1e6).toFixed(2)}`, unit: 'Jt' };
        }
        return { text: `${sign}Rp ${abs.toLocaleString('id-ID')}`, unit: '' };
    }

    function formatCurrency(value) {
        const f = formatValue(value);
        return f.unit ? `${f.text} ${f.unit}` : f.text;
    }

    // ==========================================
    // UI UPDATE
    // ==========================================
    
    function updateAllCards() {
        if (!isDataLoaded) return;
        
        console.log('🔄 Updating all cards...');
        const m = calculateMetrics();

        // OVERVIEW
        updateText('statValueAsset', formatCurrency(m.totalAset));
        updateText('statValueDpk', formatCurrency(m.dpk));
        updateText('statValueKredit', formatCurrency(m.kredit));
        updateText('statValueLaba', formatCurrency(m.labaBersih));
        updateText('statValuePendapatan', formatCurrency(m.pendapatanBunga));
        updateText('statValueBeban', formatCurrency(m.bebanBunga));

        // NERACA
        updateCard('neracaAssetValue', m.totalAset);
        updateCard('neracaKreditValue', m.kredit);
        updateCard('neracaPembiayaanValue', m.pembiayaan);
        updateCard('neracaAtiValue', m.ati);
        updateCard('neracaCkpnValue', m.ckpn);
        updateCard('neracaDpkValue', m.dpk);
        updateCard('neracaModalValue', m.modal);
        updateCard('neracaLabaValue', m.labaBersih);
        updateCard('neracaPendapatanValue', m.totalPendapatan);
        updateCard('neracaBiayaValue', m.totalBiaya);

        // RATIOS
        updateRatio('ldrValue', m.ldr, 'LDR');
        updateRatio('casaValue', m.casa, 'CASA');
        updateRatio('bopoValue', m.bopo, 'BOPO');
        updateRatio('roaValue', m.roa, 'ROA');
        updateRatio('roeValue', m.roe, 'ROE');
        updateRatio('nimValue', m.nim, 'NIM');
        updateRatio('nplValue', m.npl, 'NPL');
        updateRatio('carValue', m.car, 'CAR');

        window.dashboardMetrics = m;
        if (window.appState) window.appState.dashboardData = m;
        
        // Update analytics
        if (window.FinancialAnalytics) {
            window.FinancialAnalytics.setData(neracaData, labarugiData);
            window.FinancialAnalytics.setFilters(currentFilters.periode, 
                currentFilters.cabang || (currentFilters.tipe === 'konsolidasi' ? 'ALL' : 
                currentFilters.tipe === 'konvensional' ? 'KON' : 'SYR'));
        }
        
        // Update Ratio Layer 3 (MoM, YTD, YoY)
        if (window.refreshRatioLayer3) {
            window.refreshRatioLayer3();
        }
        
        // Update Pendapatan & Biaya
        if (window.refreshPendapatanBiaya) {
            window.refreshPendapatanBiaya();
        }
        
        // Update Konven vs Syariah
        if (window.refreshKonvenSyariah) {
            window.refreshKonvenSyariah();
        }
        
        // ==========================================
        // SHOW/HIDE CARD KREDIT & PEMBIAYAAN
        // - Konsolidasi: tampilkan keduanya
        // - Konvensional/Cabang Konven: hide Pembiayaan
        // - Syariah/Cabang Syariah: hide Kredit
        // ==========================================
        const cardKredit = document.getElementById('cardTotalKredit');
        const cardPembiayaan = document.getElementById('cardTotalPembiayaan');
        const layer2CardKredit = document.getElementById('layer2CardKredit');
        const layer2CardPembiayaan = document.getElementById('layer2CardPembiayaan');
        
        const cabang = currentFilters.cabang;
        const tipe = currentFilters.tipe;
        
        // Check if Syariah filter
        const isSyariahFilter = tipe === 'syariah' || 
                                CABANG_SYARIAH.includes(cabang);
        
        // Check if Konvensional filter
        const isKonvenFilter = tipe === 'konvensional' || 
                               CABANG_KONVEN.includes(cabang);
        
        // Apply visibility to Layer 1 cards
        if (cardKredit && cardPembiayaan) {
            if (isSyariahFilter) {
                cardKredit.style.display = 'none';
                cardPembiayaan.style.display = 'block';
            } else if (isKonvenFilter) {
                cardKredit.style.display = 'block';
                cardPembiayaan.style.display = 'none';
            } else {
                cardKredit.style.display = 'block';
                cardPembiayaan.style.display = 'block';
            }
        }
        
        // Apply visibility to Layer 2 chart cards
        if (layer2CardKredit && layer2CardPembiayaan) {
            if (isSyariahFilter) {
                layer2CardKredit.style.display = 'none';
                layer2CardPembiayaan.style.display = 'block';
            } else if (isKonvenFilter) {
                layer2CardKredit.style.display = 'block';
                layer2CardPembiayaan.style.display = 'none';
            } else {
                layer2CardKredit.style.display = 'block';
                layer2CardPembiayaan.style.display = 'block';
            }
        }
        
        console.log(`📊 Card Visibility: ${isSyariahFilter ? 'Syariah' : isKonvenFilter ? 'Konven' : 'Konsolidasi'}`);
        
        console.log('✅ All cards updated');
    }

    function updateText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function updateCard(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        const f = formatValue(value);
        el.innerHTML = `${f.text} <span>${f.unit}</span>`;
    }

    function updateRatio(id, value, ratioType) {
        const el = document.getElementById(id);
        if (!el) return;
        
        const numValue = parseFloat(value) || 0;
        el.textContent = numValue.toFixed(2);
        
        const card = el.closest('.indicator-card');
        if (!card) return;
        
        const statusEl = card.querySelector('.indicator-status');
        const statusText = card.querySelector('.status-text');
        
        let status = 'good', statusLabel = 'Sehat';
        
        if (ratioType === 'LDR') {
            if (numValue > 110 || numValue < 78) { status = 'danger'; statusLabel = 'Di Luar Batas'; }
            else if (numValue > 100 || numValue < 80) { status = 'warning'; statusLabel = 'Perhatian'; }
            else statusLabel = 'Ideal';
        } else if (ratioType === 'BOPO') {
            if (numValue > 90) { status = 'danger'; statusLabel = 'Tidak Efisien'; }
            else if (numValue > 85) { status = 'warning'; statusLabel = 'Waspada'; }
            else statusLabel = 'Efisien';
        } else if (ratioType === 'CASA') {
            if (numValue < 30) { status = 'danger'; statusLabel = 'Rendah'; }
            else if (numValue < 50) { status = 'warning'; statusLabel = 'Cukup'; }
            else statusLabel = 'Baik';
        } else if (ratioType === 'NPL') {
            if (numValue > 5) { status = 'danger'; statusLabel = 'Berbahaya'; }
            else if (numValue > 3) { status = 'warning'; statusLabel = 'Waspada'; }
            else statusLabel = 'Sehat';
        } else if (ratioType === 'CAR') {
            if (numValue < 8) { status = 'danger'; statusLabel = 'Di Bawah Min'; }
            else if (numValue < 12) { status = 'warning'; statusLabel = 'Cukup'; }
            else statusLabel = 'Kuat';
        }
        
        if (statusEl) statusEl.className = `indicator-status ${status}`;
        if (statusText) statusText.textContent = statusLabel;
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    
    function setupEventListeners() {
        const periodeSelect = document.getElementById('headerPeriodSelect');
        if (periodeSelect) {
            periodeSelect.addEventListener('change', function() {
                currentFilters.periode = this.value;
                console.log(`📅 Period: ${this.value}`);
                updateAllCards();
            });
        }

        const refreshBtn = document.getElementById('headerRefreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async function() {
                showLoading();
                await loadData();
                hideLoading();
            });
        }
    }

    // ==========================================
    // OVERRIDE FUNCTIONS
    // ==========================================
    
    function overrideFunctions() {
        window.selectBusinessLine = function(type) {
            console.log('🔄 selectBusinessLine called with:', type);
            const branchDropdown = document.getElementById('branchDropdownContainer');
            console.log('📦 branchDropdown element:', branchDropdown);
            
            // Jika type adalah 'cabang', toggle dropdown
            if (type === 'cabang') {
                if (branchDropdown) {
                    branchDropdown.classList.toggle('show');
                    console.log('📂 Dropdown toggled, has show class:', branchDropdown.classList.contains('show'));
                } else {
                    console.error('❌ branchDropdownContainer not found!');
                }
                // Update button active state
                document.querySelectorAll('.filter-btn[data-business-line]').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.businessLine === 'cabang') btn.classList.add('active');
                });
                return; // Jangan update data dulu, tunggu pilih cabang
            }
            
            // Untuk type lain (konsolidasi, konvensional, syariah)
            currentFilters.tipe = type;
            currentFilters.cabang = null;
            
            // Update button active state
            document.querySelectorAll('.filter-btn[data-business-line]').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.businessLine === type) btn.classList.add('active');
            });
            
            const names = { 'konsolidasi': 'Konsolidasi', 'konvensional': 'Konvensional', 'syariah': 'Syariah' };
            updateText('currentBusinessLine', names[type] || type);
            
            // Sembunyikan dropdown dan hapus branch mode
            if (branchDropdown) branchDropdown.classList.remove('show');
            document.body.classList.remove('branch-mode');
            
            // Reset branch selector
            const branchSelector = document.getElementById('branchSelector');
            if (branchSelector) branchSelector.value = '';
            
            updateAllCards();
            
            if (window.appState) window.appState.currentBusinessLine = type;
        };

        window.selectBranch = function(branchCode) {
            if (!branchCode) {
                currentFilters.cabang = null;
                document.body.classList.remove('branch-mode');
                updateText('currentBusinessLine', 'Konsolidasi');
            } else {
                currentFilters.cabang = branchCode;
                document.body.classList.add('branch-mode');
                const branchData = neracaData.find(d => d.kode_cabang === branchCode && !d.is_ratio);
                updateText('currentBusinessLine', branchData?.nama_cabang || branchCode);
            }
            
            document.getElementById('branchDropdownContainer')?.classList.remove('show');
            updateAllCards();
        };
    }

    // ==========================================
    // IMMEDIATE OVERRIDE (langsung saat script load)
    // ==========================================
    
    // Override selectBusinessLine SEGERA
    setTimeout(() => {
        const _original = window.selectBusinessLine;
        window.selectBusinessLine = function(type) {
            console.log('🔄 [Firebase] selectBusinessLine:', type);
            const branchDropdown = document.getElementById('branchDropdownContainer');
            const cabangBtn = document.querySelector('[data-business-line="cabang"]');
            
            if (type === 'cabang') {
                if (branchDropdown && cabangBtn) {
                    const isVisible = branchDropdown.classList.contains('show');
                    if (isVisible) {
                        branchDropdown.classList.remove('show');
                        branchDropdown.style.display = 'none';
                        console.log('📂 Dropdown HIDDEN');
                    } else {
                        // Hitung posisi berdasarkan tombol Cabang
                        const btnRect = cabangBtn.getBoundingClientRect();
                        branchDropdown.style.top = (btnRect.bottom + 5) + 'px';
                        branchDropdown.style.left = btnRect.left + 'px';
                        branchDropdown.classList.add('show');
                        branchDropdown.style.display = 'block';
                        console.log('📂 Dropdown SHOWN at', btnRect.bottom + 5, btnRect.left);
                    }
                }
                document.querySelectorAll('.filter-btn[data-business-line]').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.businessLine === 'cabang') btn.classList.add('active');
                });
                return;
            }
            
            currentFilters.tipe = type;
            currentFilters.cabang = null;
            
            document.querySelectorAll('.filter-btn[data-business-line]').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.businessLine === type) btn.classList.add('active');
            });
            
            const names = { 'konsolidasi': 'Konsolidasi', 'konvensional': 'Konvensional', 'syariah': 'Syariah' };
            const el = document.getElementById('currentBusinessLine');
            if (el) el.textContent = names[type] || type;
            
            if (branchDropdown) {
                branchDropdown.classList.remove('show');
                branchDropdown.style.display = 'none';
            }
            document.body.classList.remove('branch-mode');
            
            const sel = document.getElementById('branchSelector');
            if (sel) sel.value = '';
            
            if (isDataLoaded) updateAllCards();
            if (window.appState) window.appState.currentBusinessLine = type;
        };
        
        window.selectBranch = function(branchCode) {
            console.log('🔄 [Firebase] selectBranch:', branchCode);
            const branchDropdown = document.getElementById('branchDropdownContainer');
            
            if (!branchCode) {
                currentFilters.cabang = null;
                currentFilters.tipe = 'konsolidasi';
                document.body.classList.remove('branch-mode');
                const el = document.getElementById('currentBusinessLine');
                if (el) el.textContent = 'Konsolidasi';
            } else {
                currentFilters.cabang = branchCode;
                currentFilters.tipe = null; // Clear tipe when selecting branch
                document.body.classList.add('branch-mode');
                const branch = neracaData.find(d => d.kode_cabang === branchCode && !d.is_ratio);
                const el = document.getElementById('currentBusinessLine');
                if (el) el.textContent = branch?.nama_cabang || branchCode;
            }
            
            // Sembunyikan dropdown setelah pilih
            if (branchDropdown) {
                branchDropdown.classList.remove('show');
                branchDropdown.style.display = 'none';
            }
            
            if (isDataLoaded) updateAllCards();
        };
        
        // Event listener untuk tutup dropdown saat klik di luar
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('branchDropdownContainer');
            const cabangBtn = document.querySelector('[data-business-line="cabang"]');
            
            if (dropdown && dropdown.classList.contains('show')) {
                // Jika klik bukan di dropdown dan bukan di tombol cabang
                if (!dropdown.contains(e.target) && !cabangBtn.contains(e.target)) {
                    dropdown.classList.remove('show');
                    dropdown.style.display = 'none';
                    console.log('📂 Dropdown closed (click outside)');
                }
            }
        });
        
        console.log('✅ Override functions applied');
    }, 100);

    // ==========================================
    // INIT WITH RETRY
    // ==========================================
    
    async function initWithRetry(retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`🔄 Init attempt ${i + 1}/${retries}...`);
                
                // Tunggu Firebase ready
                if (typeof firebase === 'undefined' || !firebase.firestore) {
                    console.log('⏳ Waiting for Firebase...');
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
                
                await init();
                
                // Verifikasi data loaded
                if (neracaData.length > 0) {
                    console.log(`✅ Init success! Loaded ${neracaData.length} neraca documents`);
                    return;
                } else {
                    console.warn('⚠️ Init completed but no data loaded, retrying...');
                }
            } catch (error) {
                console.error(`❌ Init attempt ${i + 1} failed:`, error);
            }
            
            await new Promise(r => setTimeout(r, 1500));
        }
        console.error('❌ All init attempts failed');
    }

    // ==========================================
    // PUBLIC API
    // ==========================================
    
    window.DashboardFirebase = {
        init: initWithRetry,
        forceInit: async function() {
            console.log('🔧 Force initializing...');
            db = firebase.firestore();
            await loadData();
            setupEventListeners();
            overrideFunctions();
            updateAllCards();
            console.log('✅ Force init complete');
        },
        refresh: loadData, 
        updateCards: updateAllCards,
        getFilters: () => currentFilters,
        setFilter: (k, v) => { currentFilters[k] = v; updateAllCards(); },
        getData: () => ({ neraca: neracaData, labarugi: labarugiData }),
        getMetrics: calculateMetrics,
        getPeriodes: () => availablePeriodes
    };

    // AUTO INIT
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initWithRetry, 500));
    } else {
        setTimeout(initWithRetry, 500);
    }

})();
