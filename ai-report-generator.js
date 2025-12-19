// ========================================
// AI EXECUTIVE REPORT GENERATOR
// Analytics Section - Bank Sulselbar Dashboard
// ========================================

const AIReportGenerator = (function() {
    'use strict';
    
    // =============================================
    // CLOUDFLARE WORKER URL
    // =============================================
    const API_ENDPOINT = 'https://analyticsdashboard.syntaxvlad.workers.dev';
    
    let isGenerating = false;
    let lastReport = null;
    
    // ========================================
    // COLLECT DASHBOARD DATA
    // ========================================
    
    function collectDashboardData() {
        const filters = window.DashboardFirebase?.getFilters?.() || {};
        const data = window.DashboardFirebase?.getData?.() || {};
        const neracaData = data.neraca || [];
        const labarugiData = data.labarugi || [];
        
        const periode = filters.periode || '2025-11';
        const [tahun, bulan] = periode.split('-');
        const bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        // Previous year periode for YoY
        const prevYearPeriode = `${parseInt(tahun) - 1}-${bulan}`;
        
        // December target periode
        const targetPeriode = `${tahun}-12`;
        
        // Determine kode based on filter
        let kode = 'ALL';
        let tipeLabel = 'Konsolidasi';
        if (filters.cabang && filters.cabang !== 'ALL') {
            kode = filters.cabang;
            tipeLabel = `Cabang ${kode}`;
        } else if (filters.tipe === 'konvensional') {
            kode = 'KON';
            tipeLabel = 'Konvensional';
        } else if (filters.tipe === 'syariah') {
            kode = 'SYR';
            tipeLabel = 'Syariah';
        }
        
        // Helper function to get value
        function getValue(sandi, source = 'neraca', periodeOverride = null) {
            const dataSource = source === 'neraca' ? neracaData : labarugiData;
            const targetPeriod = periodeOverride || periode;
            const item = dataSource.find(d => 
                d.kode_cabang === kode && 
                d.periode === targetPeriod && 
                d.sandi === sandi &&
                !d.is_ratio
            );
            return item ? (item.total || 0) : 0;
        }
        
        function getValueByPrefix(prefix, source = 'neraca', periodeOverride = null) {
            const dataSource = source === 'neraca' ? neracaData : labarugiData;
            const targetPeriod = periodeOverride || periode;
            return dataSource
                .filter(d => d.kode_cabang === kode && d.periode === targetPeriod && 
                            d.sandi && d.sandi.startsWith(prefix) && !d.is_ratio)
                .reduce((sum, d) => sum + (d.total || 0), 0);
        }
        
        // Format to readable number
        function formatTriliun(val) {
            if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(2) + ' T';
            if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(2) + ' M';
            if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(2) + ' Jt';
            return val.toFixed(0);
        }
        
        function formatMiliar(val) {
            if (Math.abs(val) >= 1e12) return (val / 1e12).toFixed(2) + ' T';
            return (val / 1e9).toFixed(2) + ' M';
        }
        
        // Calculate YoY growth
        function calcYoY(current, prevYear) {
            if (!prevYear || prevYear === 0) return null;
            return ((current - prevYear) / Math.abs(prevYear) * 100);
        }
        
        // Calculate achievement vs target
        function calcAchievement(current, target) {
            if (!target || target === 0) return null;
            return (current / target * 100);
        }
        
        // Calculate deviation from target
        function calcDeviation(current, target) {
            if (!target) return null;
            return current - target;
        }
        
        // ==========================================
        // CURRENT PERIOD DATA
        // ==========================================
        const totalAset = getValue('01.00.00.00.00.00');
        const kredit = getValue('01.09.01.00.00.00');
        const pembiayaan = getValueByPrefix('01.09.03');
        const suratBerharga = getValue('01.05.00.00.00.00');
        const kas = getValue('01.01.00.00.00.00');
        const giroBI = getValue('01.02.00.00.00.00');
        const penempatanBank = getValue('01.03.00.00.00.00');
        const ckpn = getValueByPrefix('01.12');
        const atiGross = getValue('01.14.01.00.00.00');
        const atiAkum = getValue('01.14.02.00.00.00');
        const ati = atiGross + atiAkum;
        
        const giro = getValue('02.01.01.00.00.00') + getValueByPrefix('02.01.02');
        const tabungan = getValue('02.02.01.00.00.00') + getValueByPrefix('02.02.02');
        const deposito = getValue('02.03.01.00.00.00') + getValueByPrefix('02.03.02');
        const dpk = giro + tabungan + deposito;
        
        const modal = getValue('03.00.00.00.00.00');
        
        // Laba Bersih = 03.05.02.01.00.00 - 03.05.02.02.00.00
        const labaSebelumPajak = getValue('03.05.02.01.00.00', 'neraca') || getValue('03.05.02.01.00.00', 'labarugi');
        const pajakLaba = getValue('03.05.02.02.00.00', 'neraca') || getValue('03.05.02.02.00.00', 'labarugi');
        const labaBersih = labaSebelumPajak - pajakLaba;
        
        // Pendapatan & Biaya
        const pendapatanBunga = getValue('01.00.00.00.00.00', 'labarugi');
        const bebanBunga = getValue('02.00.00.00.00.00', 'labarugi');
        
        // ==========================================
        // PREVIOUS YEAR DATA (YoY)
        // ==========================================
        const totalAsetYoY = getValue('01.00.00.00.00.00', 'neraca', prevYearPeriode);
        const kreditYoY = getValue('01.09.01.00.00.00', 'neraca', prevYearPeriode);
        const pembiayaanYoY = getValueByPrefix('01.09.03', 'neraca', prevYearPeriode);
        const dpkYoY = getValue('02.01.01.00.00.00', 'neraca', prevYearPeriode) + 
                       getValueByPrefix('02.01.02', 'neraca', prevYearPeriode) +
                       getValue('02.02.01.00.00.00', 'neraca', prevYearPeriode) + 
                       getValueByPrefix('02.02.02', 'neraca', prevYearPeriode) +
                       getValue('02.03.01.00.00.00', 'neraca', prevYearPeriode) + 
                       getValueByPrefix('02.03.02', 'neraca', prevYearPeriode);
        const modalYoY = getValue('03.00.00.00.00.00', 'neraca', prevYearPeriode);
        const labaBersihYoY = getValue('03.05.02.01.00.00', 'neraca', prevYearPeriode) - 
                              getValue('03.05.02.02.00.00', 'neraca', prevYearPeriode);
        
        // ==========================================
        // TARGET DATA (December)
        // ==========================================
        // Get targets from localStorage or use estimates
        const targets = window.getAllTargets?.() || {};
        const branchTargets = targets.branches?.[kode] || {};
        
        // Default targets (estimates based on growth assumptions)
        const targetTotalAset = branchTargets.totalAset || totalAset * 1.1;
        const targetKredit = branchTargets.kredit || kredit * 1.08;
        const targetDPK = branchTargets.dpk || dpk * 1.08;
        const targetLabaBersih = branchTargets.labaBersih || labaBersih * 1.1;
        
        // ==========================================
        // RATIOS FROM EXCEL
        // ==========================================
        function getRatioFromExcel(ratioName, periodeOverride = null) {
            const targetPeriod = periodeOverride || periode;
            const ratioItem = neracaData.find(d => 
                d.kode_cabang === kode && 
                d.periode === targetPeriod && 
                d.is_ratio === true &&
                (d.ratio_name || '').toUpperCase() === ratioName.toUpperCase()
            );
            
            // Fallback untuk cabang Syariah ke SYR
            if (!ratioItem && ['510', '520', '530', '540', '500'].includes(kode)) {
                const fallback = neracaData.find(d => 
                    d.kode_cabang === 'SYR' && 
                    d.periode === targetPeriod && 
                    d.is_ratio === true &&
                    (d.ratio_name || '').toUpperCase() === ratioName.toUpperCase()
                );
                return fallback ? (fallback.value || 0) * 100 : null;
            }
            
            // Fallback untuk cabang Konvensional ke KON
            if (!ratioItem && !['510', '520', '530', '540', '500', 'SYR', 'KON', 'ALL'].includes(kode)) {
                const fallback = neracaData.find(d => 
                    d.kode_cabang === 'KON' && 
                    d.periode === targetPeriod && 
                    d.is_ratio === true &&
                    (d.ratio_name || '').toUpperCase() === ratioName.toUpperCase()
                );
                return fallback ? (fallback.value || 0) * 100 : null;
            }
            
            return ratioItem ? (ratioItem.value || 0) * 100 : null;
        }
        
        // Current ratios
        const ldr = getRatioFromExcel('LDR') || (dpk > 0 ? ((kredit + pembiayaan) / dpk * 100) : 0);
        const casa = getRatioFromExcel('CASA') || (dpk > 0 ? ((giro + tabungan) / dpk * 100) : 0);
        const bopo = getRatioFromExcel('BOPO') || 0;
        const npl = getRatioFromExcel('NPL') || 0;
        const roa = getRatioFromExcel('ROA') || 0;
        const roe = getRatioFromExcel('ROE') || 0;
        const nim = getRatioFromExcel('NIM') || 0;
        const car = getRatioFromExcel('CAR') || 0;
        
        // Previous year ratios (YoY)
        const ldrYoY = getRatioFromExcel('LDR', prevYearPeriode);
        const casaYoY = getRatioFromExcel('CASA', prevYearPeriode);
        const bopoYoY = getRatioFromExcel('BOPO', prevYearPeriode);
        const nplYoY = getRatioFromExcel('NPL', prevYearPeriode);
        const roaYoY = getRatioFromExcel('ROA', prevYearPeriode);
        const roeYoY = getRatioFromExcel('ROE', prevYearPeriode);
        const nimYoY = getRatioFromExcel('NIM', prevYearPeriode);
        const carYoY = getRatioFromExcel('CAR', prevYearPeriode);
        
        // Ratio targets (regulatory/internal)
        const ratioTargets = {
            ldr: { min: 80, max: 92, target: 85 },
            casa: { target: 50 },
            bopo: { target: 85 },
            npl: { target: 5 },
            roa: { target: 1.5 },
            roe: { target: 15 },
            nim: { target: 5 },
            car: { target: 12 }
        };
        
        // Helper for formatting growth
        function formatGrowth(val) {
            if (val === null || isNaN(val)) return 'N/A';
            const sign = val >= 0 ? '+' : '';
            return `${sign}${val.toFixed(2)}%`;
        }
        
        function formatAchievement(val) {
            if (val === null || isNaN(val)) return 'N/A';
            return `${val.toFixed(1)}%`;
        }
        
        function formatDeviation(val, isTriliun = false) {
            if (val === null || isNaN(val)) return 'N/A';
            const sign = val >= 0 ? '+' : '';
            if (isTriliun) {
                return `${sign}${(val / 1e12).toFixed(2)} T`;
            }
            return `${sign}${(val / 1e9).toFixed(2)} M`;
        }
        
        // Build summary object with comprehensive KPI
        const summary = {
            periode: {
                bulan: bulanNames[parseInt(bulan)],
                tahun: tahun,
                full: `${bulanNames[parseInt(bulan)]} ${tahun}`,
                prevYear: `${bulanNames[parseInt(bulan)]} ${parseInt(tahun) - 1}`
            },
            tipe: tipeLabel,
            kodeCabang: kode,
            
            // ==========================================
            // KPI NERACA - AKTIVA
            // ==========================================
            kpiAktiva: {
                totalAset: {
                    nama: 'Total Aset',
                    nilai: totalAset,
                    formatted: formatTriliun(totalAset),
                    yoyValue: totalAsetYoY,
                    yoyGrowth: formatGrowth(calcYoY(totalAset, totalAsetYoY)),
                    target: targetTotalAset,
                    targetFormatted: formatTriliun(targetTotalAset),
                    achievement: formatAchievement(calcAchievement(totalAset, targetTotalAset)),
                    deviation: formatDeviation(calcDeviation(totalAset, targetTotalAset), true)
                },
                kredit: {
                    nama: 'Kredit yang Diberikan',
                    nilai: kredit,
                    formatted: formatTriliun(kredit),
                    yoyValue: kreditYoY,
                    yoyGrowth: formatGrowth(calcYoY(kredit, kreditYoY)),
                    target: targetKredit,
                    targetFormatted: formatTriliun(targetKredit),
                    achievement: formatAchievement(calcAchievement(kredit, targetKredit)),
                    deviation: formatDeviation(calcDeviation(kredit, targetKredit), true)
                },
                pembiayaan: {
                    nama: 'Pembiayaan Syariah',
                    nilai: pembiayaan,
                    formatted: formatMiliar(pembiayaan),
                    yoyValue: pembiayaanYoY,
                    yoyGrowth: formatGrowth(calcYoY(pembiayaan, pembiayaanYoY)),
                    target: null,
                    achievement: 'N/A',
                    deviation: 'N/A'
                },
                suratBerharga: {
                    nama: 'Surat Berharga',
                    nilai: suratBerharga,
                    formatted: formatTriliun(suratBerharga),
                    yoyGrowth: 'N/A',
                    achievement: 'N/A',
                    deviation: 'N/A'
                },
                penempatanBank: {
                    nama: 'Penempatan pada Bank Lain',
                    nilai: penempatanBank,
                    formatted: formatTriliun(penempatanBank),
                    yoyGrowth: 'N/A',
                    achievement: 'N/A',
                    deviation: 'N/A'
                },
                kas: {
                    nama: 'Kas',
                    nilai: kas,
                    formatted: formatMiliar(kas),
                    yoyGrowth: 'N/A',
                    achievement: 'N/A',
                    deviation: 'N/A'
                },
                ckpn: {
                    nama: 'CKPN (Cadangan)',
                    nilai: ckpn,
                    formatted: formatMiliar(ckpn),
                    yoyGrowth: 'N/A',
                    achievement: 'N/A',
                    deviation: 'N/A'
                },
                ati: {
                    nama: 'ATI (Aktiva Tetap & Inventaris)',
                    nilai: ati,
                    formatted: formatMiliar(ati),
                    yoyGrowth: 'N/A',
                    achievement: 'N/A',
                    deviation: 'N/A'
                }
            },
            
            // ==========================================
            // KPI NERACA - PASIVA (DPK)
            // ==========================================
            kpiPasiva: {
                dpk: {
                    nama: 'Dana Pihak Ketiga (DPK)',
                    nilai: dpk,
                    formatted: formatTriliun(dpk),
                    yoyValue: dpkYoY,
                    yoyGrowth: formatGrowth(calcYoY(dpk, dpkYoY)),
                    target: targetDPK,
                    targetFormatted: formatTriliun(targetDPK),
                    achievement: formatAchievement(calcAchievement(dpk, targetDPK)),
                    deviation: formatDeviation(calcDeviation(dpk, targetDPK), true)
                },
                giro: {
                    nama: '• Giro',
                    nilai: giro,
                    formatted: formatTriliun(giro),
                    share: dpk > 0 ? (giro / dpk * 100).toFixed(1) : 0,
                    yoyGrowth: 'N/A',
                    achievement: 'N/A',
                    deviation: 'N/A'
                },
                tabungan: {
                    nama: '• Tabungan',
                    nilai: tabungan,
                    formatted: formatTriliun(tabungan),
                    share: dpk > 0 ? (tabungan / dpk * 100).toFixed(1) : 0,
                    yoyGrowth: 'N/A',
                    achievement: 'N/A',
                    deviation: 'N/A'
                },
                deposito: {
                    nama: '• Deposito',
                    nilai: deposito,
                    formatted: formatTriliun(deposito),
                    share: dpk > 0 ? (deposito / dpk * 100).toFixed(1) : 0,
                    yoyGrowth: 'N/A',
                    achievement: 'N/A',
                    deviation: 'N/A'
                },
                modal: {
                    nama: 'Modal (Ekuitas)',
                    nilai: modal,
                    formatted: formatTriliun(modal),
                    yoyValue: modalYoY,
                    yoyGrowth: formatGrowth(calcYoY(modal, modalYoY)),
                    achievement: 'N/A',
                    deviation: 'N/A'
                },
                labaBersih: {
                    nama: 'Laba Bersih',
                    nilai: labaBersih,
                    formatted: formatMiliar(labaBersih),
                    yoyValue: labaBersihYoY,
                    yoyGrowth: formatGrowth(calcYoY(labaBersih, labaBersihYoY)),
                    target: targetLabaBersih,
                    targetFormatted: formatMiliar(targetLabaBersih),
                    achievement: formatAchievement(calcAchievement(labaBersih, targetLabaBersih)),
                    deviation: formatDeviation(calcDeviation(labaBersih, targetLabaBersih), false)
                }
            },
            
            // ==========================================
            // KPI FINANCIAL RATIO
            // ==========================================
            kpiRatio: {
                ldr: {
                    nama: 'LDR (Loan to Deposit Ratio)',
                    kategori: 'Likuiditas',
                    nilai: ldr.toFixed(2),
                    yoyValue: ldrYoY,
                    yoyChange: ldrYoY ? formatGrowth(ldr - ldrYoY) : 'N/A',
                    target: `${ratioTargets.ldr.min}%-${ratioTargets.ldr.max}%`,
                    status: ldr >= ratioTargets.ldr.min && ldr <= ratioTargets.ldr.max ? '✅ SEHAT' : (ldr > ratioTargets.ldr.max ? '⚠️ TINGGI' : '⚠️ RENDAH'),
                    keterangan: ldr >= ratioTargets.ldr.min && ldr <= ratioTargets.ldr.max ? 'Dalam batas sehat' : 'Perlu perhatian',
                    prevYearValue: ldrYoY ? ldrYoY.toFixed(2) : 'N/A',
                    spread: ldrYoY ? (ldr - ldrYoY).toFixed(2) : 'N/A'
                },
                casa: {
                    nama: 'CASA Ratio',
                    kategori: 'Likuiditas',
                    nilai: casa.toFixed(2),
                    yoyValue: casaYoY,
                    yoyChange: casaYoY ? formatGrowth(casa - casaYoY) : 'N/A',
                    target: `≥${ratioTargets.casa.target}%`,
                    status: casa >= ratioTargets.casa.target ? '✅ BAIK' : '⚠️ PERLU DITINGKATKAN',
                    keterangan: casa >= ratioTargets.casa.target ? 'Mencapai target' : 'Di bawah target',
                    prevYearValue: casaYoY ? casaYoY.toFixed(2) : 'N/A',
                    spread: casaYoY ? (casa - casaYoY).toFixed(2) : 'N/A'
                },
                bopo: {
                    nama: 'BOPO',
                    kategori: 'Efisiensi',
                    nilai: bopo.toFixed(2),
                    yoyValue: bopoYoY,
                    yoyChange: bopoYoY ? formatGrowth(bopo - bopoYoY) : 'N/A',
                    target: `≤${ratioTargets.bopo.target}%`,
                    status: bopo <= ratioTargets.bopo.target ? '✅ EFISIEN' : (bopo <= 90 ? '⚠️ CUKUP' : '❌ TIDAK EFISIEN'),
                    keterangan: bopo <= ratioTargets.bopo.target ? 'Operasional efisien' : 'Perlu efisiensi biaya',
                    prevYearValue: bopoYoY ? bopoYoY.toFixed(2) : 'N/A',
                    spread: bopoYoY ? (bopo - bopoYoY).toFixed(2) : 'N/A'
                },
                npl: {
                    nama: 'NPL (Non Performing Loan)',
                    kategori: 'Kualitas Aset',
                    nilai: npl.toFixed(2),
                    yoyValue: nplYoY,
                    yoyChange: nplYoY ? formatGrowth(npl - nplYoY) : 'N/A',
                    target: `≤${ratioTargets.npl.target}%`,
                    status: npl <= ratioTargets.npl.target ? '✅ SEHAT' : '❌ BERISIKO',
                    keterangan: npl <= ratioTargets.npl.target ? 'Kualitas kredit baik' : 'Risiko kredit tinggi',
                    prevYearValue: nplYoY ? nplYoY.toFixed(2) : 'N/A',
                    spread: nplYoY ? (npl - nplYoY).toFixed(2) : 'N/A'
                },
                roa: {
                    nama: 'ROA (Return on Asset)',
                    kategori: 'Profitabilitas',
                    nilai: roa.toFixed(2),
                    yoyValue: roaYoY,
                    yoyChange: roaYoY ? formatGrowth(roa - roaYoY) : 'N/A',
                    target: `≥${ratioTargets.roa.target}%`,
                    status: roa >= ratioTargets.roa.target ? '✅ SANGAT BAIK' : (roa >= 1.25 ? '⚠️ BAIK' : '❌ KURANG'),
                    keterangan: roa >= ratioTargets.roa.target ? 'Profitabilitas tinggi' : 'Perlu peningkatan laba',
                    prevYearValue: roaYoY ? roaYoY.toFixed(2) : 'N/A',
                    spread: roaYoY ? (roa - roaYoY).toFixed(2) : 'N/A'
                },
                roe: {
                    nama: 'ROE (Return on Equity)',
                    kategori: 'Profitabilitas',
                    nilai: roe.toFixed(2),
                    yoyValue: roeYoY,
                    yoyChange: roeYoY ? formatGrowth(roe - roeYoY) : 'N/A',
                    target: `≥${ratioTargets.roe.target}%`,
                    status: roe >= ratioTargets.roe.target ? '✅ BAIK' : '⚠️ PERLU DITINGKATKAN',
                    keterangan: roe >= ratioTargets.roe.target ? 'Return modal optimal' : 'Optimalisasi modal',
                    prevYearValue: roeYoY ? roeYoY.toFixed(2) : 'N/A',
                    spread: roeYoY ? (roe - roeYoY).toFixed(2) : 'N/A'
                },
                nim: {
                    nama: 'NIM (Net Interest Margin)',
                    kategori: 'Profitabilitas',
                    nilai: nim.toFixed(2),
                    yoyValue: nimYoY,
                    yoyChange: nimYoY ? formatGrowth(nim - nimYoY) : 'N/A',
                    target: `≥${ratioTargets.nim.target}%`,
                    status: nim >= ratioTargets.nim.target ? '✅ BAIK' : '⚠️ PERLU DITINGKATKAN',
                    keterangan: nim >= ratioTargets.nim.target ? 'Margin bunga optimal' : 'Perlu optimalisasi',
                    prevYearValue: nimYoY ? nimYoY.toFixed(2) : 'N/A',
                    spread: nimYoY ? (nim - nimYoY).toFixed(2) : 'N/A'
                },
                car: {
                    nama: 'CAR/KPMM',
                    kategori: 'Permodalan',
                    nilai: car.toFixed(2),
                    yoyValue: carYoY,
                    yoyChange: carYoY ? formatGrowth(car - carYoY) : 'N/A',
                    target: `≥${ratioTargets.car.target}%`,
                    status: car >= ratioTargets.car.target ? '✅ MEMENUHI' : '❌ TIDAK MEMENUHI',
                    keterangan: car >= ratioTargets.car.target ? 'Modal mencukupi' : 'Perlu penambahan modal',
                    prevYearValue: carYoY ? carYoY.toFixed(2) : 'N/A',
                    spread: carYoY ? (car - carYoY).toFixed(2) : 'N/A'
                }
            },
            
            // ==========================================
            // LEGACY FORMAT (for backward compatibility)
            // ==========================================
            neraca: {
                totalAset: { nilai: totalAset, formatted: formatTriliun(totalAset) },
                kredit: { nilai: kredit, formatted: formatTriliun(kredit) },
                pembiayaan: { nilai: pembiayaan, formatted: formatMiliar(pembiayaan) },
                suratBerharga: { nilai: suratBerharga, formatted: formatTriliun(suratBerharga) },
                kas: { nilai: kas, formatted: formatMiliar(kas) },
                penempatanBank: { nilai: penempatanBank, formatted: formatTriliun(penempatanBank) },
                ckpn: { nilai: ckpn, formatted: formatMiliar(ckpn) },
                ati: { nilai: ati, formatted: formatMiliar(ati) }
            },
            
            dpk: {
                total: { nilai: dpk, formatted: formatTriliun(dpk) },
                giro: { nilai: giro, formatted: formatTriliun(giro), share: dpk > 0 ? (giro / dpk * 100).toFixed(1) : 0 },
                tabungan: { nilai: tabungan, formatted: formatTriliun(tabungan), share: dpk > 0 ? (tabungan / dpk * 100).toFixed(1) : 0 },
                deposito: { nilai: deposito, formatted: formatTriliun(deposito), share: dpk > 0 ? (deposito / dpk * 100).toFixed(1) : 0 }
            },
            
            modal: {
                nilai: modal,
                formatted: formatTriliun(modal)
            },
            
            labaRugi: {
                labaBersih: {
                    nilai: labaBersih,
                    formatted: formatMiliar(labaBersih)
                }
            },
            
            ratio: {
                ldr: {
                    nilai: ldr.toFixed(2),
                    status: ldr >= 80 && ldr <= 92 ? 'SEHAT' : (ldr > 92 ? 'TINGGI' : 'RENDAH'),
                    batasMin: 80,
                    batasMax: 92
                },
                casa: {
                    nilai: casa.toFixed(2),
                    status: casa >= 50 ? 'BAIK' : 'PERLU DITINGKATKAN',
                    target: 50
                },
                bopo: {
                    nilai: bopo.toFixed(2),
                    status: bopo <= 85 ? 'EFISIEN' : (bopo <= 90 ? 'CUKUP' : 'TIDAK EFISIEN'),
                    batas: 85
                },
                npl: {
                    nilai: npl.toFixed(2),
                    status: npl <= 5 ? 'SEHAT' : 'BERISIKO',
                    batas: 5
                },
                roa: {
                    nilai: roa.toFixed(2),
                    status: roa >= 1.5 ? 'SANGAT BAIK' : (roa >= 1.25 ? 'BAIK' : 'KURANG'),
                    batas: 1.5
                },
                roe: {
                    nilai: roe.toFixed(2),
                    status: roe >= 15 ? 'BAIK' : 'PERLU DITINGKATKAN',
                    target: 15
                },
                nim: {
                    nilai: nim.toFixed(2),
                    status: nim >= 5 ? 'BAIK' : 'PERLU DITINGKATKAN',
                    target: 5
                },
                car: {
                    nilai: car.toFixed(2),
                    status: car >= 12 ? 'MEMENUHI' : 'TIDAK MEMENUHI',
                    batasMin: 12
                }
            },
            
            komposisiAset: {
                kredit: totalAset > 0 ? ((kredit + pembiayaan) / totalAset * 100).toFixed(1) : 0,
                suratBerharga: totalAset > 0 ? (suratBerharga / totalAset * 100).toFixed(1) : 0,
                penempatanBank: totalAset > 0 ? (penempatanBank / totalAset * 100).toFixed(1) : 0,
                lainnya: totalAset > 0 ? (100 - ((kredit + pembiayaan + suratBerharga + penempatanBank) / totalAset * 100)).toFixed(1) : 0
            }
        };
        
        return summary;
    }
    
    // ========================================
    // GENERATE REPORT VIA CLAUDE API
    // ========================================
    
    async function generateReport() {
        if (isGenerating) {
            showToast('Report sedang di-generate, mohon tunggu...', 'warning');
            return;
        }
        
        isGenerating = true;
        updateUIGenerating(true);
        
        try {
            // Collect data
            const dashboardData = collectDashboardData();
            console.log('📊 Dashboard Data:', dashboardData);
            
            // Build prompt
            const prompt = buildPrompt(dashboardData);
            
            // Call Claude API
            const report = await callClaudeAPI(prompt);
            
            // Store and display
            lastReport = {
                data: dashboardData,
                report: report,
                generatedAt: new Date().toISOString()
            };
            
            displayReport(report, dashboardData);
            showToast('Executive Report berhasil di-generate!', 'success');
            
        } catch (error) {
            console.error('❌ Error generating report:', error);
            showToast('Gagal generate report: ' + error.message, 'error');
            displayError(error.message);
        } finally {
            isGenerating = false;
            updateUIGenerating(false);
        }
    }
    
    function buildPrompt(data) {
        // Build KPI Aktiva rows
        const kpiAktivaRows = Object.values(data.kpiAktiva).map(item => 
            `│ ${item.nama.padEnd(30)} │ Rp ${item.formatted.padStart(12)} │ ${item.yoyGrowth.padStart(10)} │ ${item.achievement.padStart(10)} │ ${item.deviation.padStart(12)} │`
        ).join('\n');
        
        // Build KPI Pasiva rows
        const kpiPasivaRows = Object.values(data.kpiPasiva).map(item => 
            `│ ${item.nama.padEnd(30)} │ Rp ${item.formatted.padStart(12)} │ ${item.yoyGrowth.padStart(10)} │ ${item.achievement.padStart(10)} │ ${item.deviation.padStart(12)} │`
        ).join('\n');
        
        // Build KPI Ratio rows
        const kpiRatioRows = Object.values(data.kpiRatio).map(item => 
            `│ ${item.nama.padEnd(30)} │ ${(item.nilai + '%').padStart(12)} │ ${item.yoyChange.padStart(10)} │ ${item.target.padStart(15)} │ ${item.status.padStart(18)} │`
        ).join('\n');
        
        return `Anda adalah analis keuangan senior PT Bank Pembangunan Daerah Sulawesi Selatan dan Sulawesi Barat (Bank Sulselbar) dengan pengalaman lebih dari 15 tahun.

Berdasarkan data kinerja keuangan berikut, buatkan EXECUTIVE SUMMARY yang KOMPREHENSIF dan PROFESIONAL untuk dilaporkan kepada Direksi dan Dewan Komisaris.

═══════════════════════════════════════════════════════════════════════════════════════
LAPORAN KINERJA KEUANGAN PERIODE ${data.periode.full.toUpperCase()} - ${data.tipe.toUpperCase()}
Perbandingan Year-on-Year (YoY): ${data.periode.prevYear}
═══════════════════════════════════════════════════════════════════════════════════════

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                        📊 INDIKATOR KINERJA UTAMA (KPI) - NERACA                    ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║ AKTIVA (ASET)                                                                       ║
╠════════════════════════════════╦══════════════╦════════════╦════════════╦══════════════╣
║ Indikator                      ║ Posisi       ║ YoY Growth ║ Pencapaian ║ Deviasi      ║
╠════════════════════════════════╬══════════════╬════════════╬════════════╬══════════════╣
║ Total Aset                     ║ Rp ${data.kpiAktiva.totalAset.formatted.padStart(10)} ║ ${data.kpiAktiva.totalAset.yoyGrowth.padStart(10)} ║ ${data.kpiAktiva.totalAset.achievement.padStart(10)} ║ ${data.kpiAktiva.totalAset.deviation.padStart(12)} ║
║ Kredit yang Diberikan          ║ Rp ${data.kpiAktiva.kredit.formatted.padStart(10)} ║ ${data.kpiAktiva.kredit.yoyGrowth.padStart(10)} ║ ${data.kpiAktiva.kredit.achievement.padStart(10)} ║ ${data.kpiAktiva.kredit.deviation.padStart(12)} ║
║ Pembiayaan Syariah             ║ Rp ${data.kpiAktiva.pembiayaan.formatted.padStart(10)} ║ ${data.kpiAktiva.pembiayaan.yoyGrowth.padStart(10)} ║ ${data.kpiAktiva.pembiayaan.achievement.padStart(10)} ║ ${data.kpiAktiva.pembiayaan.deviation.padStart(12)} ║
║ Surat Berharga                 ║ Rp ${data.kpiAktiva.suratBerharga.formatted.padStart(10)} ║ ${data.kpiAktiva.suratBerharga.yoyGrowth.padStart(10)} ║ ${data.kpiAktiva.suratBerharga.achievement.padStart(10)} ║ ${data.kpiAktiva.suratBerharga.deviation.padStart(12)} ║
║ Penempatan pada Bank Lain      ║ Rp ${data.kpiAktiva.penempatanBank.formatted.padStart(10)} ║ ${data.kpiAktiva.penempatanBank.yoyGrowth.padStart(10)} ║ ${data.kpiAktiva.penempatanBank.achievement.padStart(10)} ║ ${data.kpiAktiva.penempatanBank.deviation.padStart(12)} ║
║ Kas                            ║ Rp ${data.kpiAktiva.kas.formatted.padStart(10)} ║ ${data.kpiAktiva.kas.yoyGrowth.padStart(10)} ║ ${data.kpiAktiva.kas.achievement.padStart(10)} ║ ${data.kpiAktiva.kas.deviation.padStart(12)} ║
║ CKPN (Cadangan Kerugian)       ║ Rp ${data.kpiAktiva.ckpn.formatted.padStart(10)} ║ ${data.kpiAktiva.ckpn.yoyGrowth.padStart(10)} ║ ${data.kpiAktiva.ckpn.achievement.padStart(10)} ║ ${data.kpiAktiva.ckpn.deviation.padStart(12)} ║
║ ATI (Aktiva Tetap)             ║ Rp ${data.kpiAktiva.ati.formatted.padStart(10)} ║ ${data.kpiAktiva.ati.yoyGrowth.padStart(10)} ║ ${data.kpiAktiva.ati.achievement.padStart(10)} ║ ${data.kpiAktiva.ati.deviation.padStart(12)} ║
╠════════════════════════════════╩══════════════╩════════════╩════════════╩══════════════╣
║ PASIVA (KEWAJIBAN & EKUITAS)                                                        ║
╠════════════════════════════════╦══════════════╦════════════╦════════════╦══════════════╣
║ Dana Pihak Ketiga (DPK)        ║ Rp ${data.kpiPasiva.dpk.formatted.padStart(10)} ║ ${data.kpiPasiva.dpk.yoyGrowth.padStart(10)} ║ ${data.kpiPasiva.dpk.achievement.padStart(10)} ║ ${data.kpiPasiva.dpk.deviation.padStart(12)} ║
║   • Giro (${data.kpiPasiva.giro.share}%)                   ║ Rp ${data.kpiPasiva.giro.formatted.padStart(10)} ║ ${data.kpiPasiva.giro.yoyGrowth.padStart(10)} ║ ${data.kpiPasiva.giro.achievement.padStart(10)} ║ ${data.kpiPasiva.giro.deviation.padStart(12)} ║
║   • Tabungan (${data.kpiPasiva.tabungan.share}%)               ║ Rp ${data.kpiPasiva.tabungan.formatted.padStart(10)} ║ ${data.kpiPasiva.tabungan.yoyGrowth.padStart(10)} ║ ${data.kpiPasiva.tabungan.achievement.padStart(10)} ║ ${data.kpiPasiva.tabungan.deviation.padStart(12)} ║
║   • Deposito (${data.kpiPasiva.deposito.share}%)               ║ Rp ${data.kpiPasiva.deposito.formatted.padStart(10)} ║ ${data.kpiPasiva.deposito.yoyGrowth.padStart(10)} ║ ${data.kpiPasiva.deposito.achievement.padStart(10)} ║ ${data.kpiPasiva.deposito.deviation.padStart(12)} ║
║ Modal (Ekuitas)                ║ Rp ${data.kpiPasiva.modal.formatted.padStart(10)} ║ ${data.kpiPasiva.modal.yoyGrowth.padStart(10)} ║ ${data.kpiPasiva.modal.achievement.padStart(10)} ║ ${data.kpiPasiva.modal.deviation.padStart(12)} ║
║ Laba Bersih                    ║ Rp ${data.kpiPasiva.labaBersih.formatted.padStart(10)} ║ ${data.kpiPasiva.labaBersih.yoyGrowth.padStart(10)} ║ ${data.kpiPasiva.labaBersih.achievement.padStart(10)} ║ ${data.kpiPasiva.labaBersih.deviation.padStart(12)} ║
╚════════════════════════════════╩══════════════╩════════════╩════════════╩══════════════╝

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                        📈 INDIKATOR KINERJA UTAMA (KPI) - RASIO KEUANGAN            ║
╠════════════════════════════════╦══════════════╦════════════╦═════════════════╦════════════════════╣
║ Rasio                          ║ Nilai        ║ Δ YoY      ║ Target/Batas    ║ Status             ║
╠════════════════════════════════╬══════════════╬════════════╬═════════════════╬════════════════════╣
║ 📊 LIKUIDITAS                                                                                     ║
║ ${data.kpiRatio.ldr.nama.padEnd(30)} ║ ${(data.kpiRatio.ldr.nilai + '%').padStart(12)} ║ ${data.kpiRatio.ldr.yoyChange.padStart(10)} ║ ${data.kpiRatio.ldr.target.padStart(15)} ║ ${data.kpiRatio.ldr.status.padStart(18)} ║
║ ${data.kpiRatio.casa.nama.padEnd(30)} ║ ${(data.kpiRatio.casa.nilai + '%').padStart(12)} ║ ${data.kpiRatio.casa.yoyChange.padStart(10)} ║ ${data.kpiRatio.casa.target.padStart(15)} ║ ${data.kpiRatio.casa.status.padStart(18)} ║
╠════════════════════════════════╬══════════════╬════════════╬═════════════════╬════════════════════╣
║ 💰 PROFITABILITAS                                                                                 ║
║ ${data.kpiRatio.roa.nama.padEnd(30)} ║ ${(data.kpiRatio.roa.nilai + '%').padStart(12)} ║ ${data.kpiRatio.roa.yoyChange.padStart(10)} ║ ${data.kpiRatio.roa.target.padStart(15)} ║ ${data.kpiRatio.roa.status.padStart(18)} ║
║ ${data.kpiRatio.roe.nama.padEnd(30)} ║ ${(data.kpiRatio.roe.nilai + '%').padStart(12)} ║ ${data.kpiRatio.roe.yoyChange.padStart(10)} ║ ${data.kpiRatio.roe.target.padStart(15)} ║ ${data.kpiRatio.roe.status.padStart(18)} ║
║ ${data.kpiRatio.nim.nama.padEnd(30)} ║ ${(data.kpiRatio.nim.nilai + '%').padStart(12)} ║ ${data.kpiRatio.nim.yoyChange.padStart(10)} ║ ${data.kpiRatio.nim.target.padStart(15)} ║ ${data.kpiRatio.nim.status.padStart(18)} ║
╠════════════════════════════════╬══════════════╬════════════╬═════════════════╬════════════════════╣
║ ⚙️ EFISIENSI                                                                                      ║
║ ${data.kpiRatio.bopo.nama.padEnd(30)} ║ ${(data.kpiRatio.bopo.nilai + '%').padStart(12)} ║ ${data.kpiRatio.bopo.yoyChange.padStart(10)} ║ ${data.kpiRatio.bopo.target.padStart(15)} ║ ${data.kpiRatio.bopo.status.padStart(18)} ║
╠════════════════════════════════╬══════════════╬════════════╬═════════════════╬════════════════════╣
║ ⚠️ KUALITAS ASET                                                                                  ║
║ ${data.kpiRatio.npl.nama.padEnd(30)} ║ ${(data.kpiRatio.npl.nilai + '%').padStart(12)} ║ ${data.kpiRatio.npl.yoyChange.padStart(10)} ║ ${data.kpiRatio.npl.target.padStart(15)} ║ ${data.kpiRatio.npl.status.padStart(18)} ║
╠════════════════════════════════╬══════════════╬════════════╬═════════════════╬════════════════════╣
║ 🏦 PERMODALAN                                                                                     ║
║ ${data.kpiRatio.car.nama.padEnd(30)} ║ ${(data.kpiRatio.car.nilai + '%').padStart(12)} ║ ${data.kpiRatio.car.yoyChange.padStart(10)} ║ ${data.kpiRatio.car.target.padStart(15)} ║ ${data.kpiRatio.car.status.padStart(18)} ║
╚════════════════════════════════╩══════════════╩════════════╩═════════════════╩════════════════════╝

📊 KOMPOSISI PORTOFOLIO ASET:
┌─────────────────────────────────────────────────────────────┐
│ Kredit & Pembiayaan     : ${data.komposisiAset.kredit}%                           │
│ Surat Berharga          : ${data.komposisiAset.suratBerharga}%                           │
│ Penempatan Bank Lain    : ${data.komposisiAset.penempatanBank}%                           │
│ Aset Lainnya            : ${data.komposisiAset.lainnya}%                           │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════
                              INSTRUKSI PEMBUATAN LAPORAN
═══════════════════════════════════════════════════════════════════════════════════════

Buatkan EXECUTIVE REPORT dalam format HTML dengan struktur berikut.
Gunakan bahasa Indonesia yang FORMAL, PROFESIONAL, dan ANALITIS.
Fokus pada INSIGHT yang ACTIONABLE untuk pengambilan keputusan Direksi.

HANYA berikan konten HTML (tanpa tag html, head, body):

<div class="report-section summary">
    <h3>📋 RINGKASAN EKSEKUTIF</h3>
    <p><strong>Gambaran Umum:</strong> [Berikan overview kinerja bank periode ${data.periode.full} secara keseluruhan dalam 2-3 kalimat yang padat]</p>
    <p><strong>Posisi Keuangan:</strong> [Analisis posisi aset Rp ${data.kpiAktiva.totalAset.formatted}, DPK Rp ${data.kpiPasiva.dpk.formatted}, dan modal. Bandingkan dengan industri perbankan regional]</p>
    <p><strong>Kinerja YoY:</strong> [Analisis pertumbuhan year-on-year: Aset ${data.kpiAktiva.totalAset.yoyGrowth}, Kredit ${data.kpiAktiva.kredit.yoyGrowth}, DPK ${data.kpiPasiva.dpk.yoyGrowth}]</p>
</div>

<div class="report-section kpi-table">
    <h3>📊 INDIKATOR KINERJA UTAMA (KPI) - NERACA</h3>
    <h4>AKTIVA (ASET)</h4>
    <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 12px;">
        <tr style="background: #1e3a5f; color: white;">
            <th style="padding: 10px; text-align: left;">Indikator</th>
            <th style="padding: 10px; text-align: right;">Posisi Saat Ini</th>
            <th style="padding: 10px; text-align: center;">Pertumbuhan YoY</th>
            <th style="padding: 10px; text-align: center;">Pencapaian Target</th>
            <th style="padding: 10px; text-align: right;">Deviasi vs Target</th>
        </tr>
        <tr style="background: #e8f4ea;"><td style="padding: 8px; font-weight: bold;">Total Aset</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiAktiva.totalAset.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.totalAset.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.totalAset.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiAktiva.totalAset.deviation}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">Kredit yang Diberikan</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiAktiva.kredit.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.kredit.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.kredit.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiAktiva.kredit.deviation}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">Pembiayaan Syariah</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiAktiva.pembiayaan.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.pembiayaan.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.pembiayaan.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiAktiva.pembiayaan.deviation}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">Surat Berharga</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiAktiva.suratBerharga.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.suratBerharga.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.suratBerharga.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiAktiva.suratBerharga.deviation}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">Penempatan pada Bank Lain</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiAktiva.penempatanBank.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.penempatanBank.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.penempatanBank.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiAktiva.penempatanBank.deviation}</td></tr>
        <tr style="background: #fff3cd;"><td style="padding: 8px;">CKPN (Cadangan Kerugian)</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiAktiva.ckpn.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.ckpn.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.ckpn.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiAktiva.ckpn.deviation}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">ATI (Aktiva Tetap)</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiAktiva.ati.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.ati.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiAktiva.ati.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiAktiva.ati.deviation}</td></tr>
    </table>
    
    <h4>PASIVA (KEWAJIBAN & EKUITAS)</h4>
    <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 12px;">
        <tr style="background: #1e3a5f; color: white;">
            <th style="padding: 10px; text-align: left;">Indikator</th>
            <th style="padding: 10px; text-align: right;">Posisi Saat Ini</th>
            <th style="padding: 10px; text-align: center;">Pertumbuhan YoY</th>
            <th style="padding: 10px; text-align: center;">Pencapaian Target</th>
            <th style="padding: 10px; text-align: right;">Deviasi vs Target</th>
        </tr>
        <tr style="background: #e8f4ea;"><td style="padding: 8px; font-weight: bold;">Dana Pihak Ketiga (DPK)</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiPasiva.dpk.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.dpk.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.dpk.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiPasiva.dpk.deviation}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px; padding-left: 20px;">• Giro (${data.kpiPasiva.giro.share}%)</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiPasiva.giro.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.giro.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.giro.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiPasiva.giro.deviation}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px; padding-left: 20px;">• Tabungan (${data.kpiPasiva.tabungan.share}%)</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiPasiva.tabungan.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.tabungan.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.tabungan.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiPasiva.tabungan.deviation}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px; padding-left: 20px;">• Deposito (${data.kpiPasiva.deposito.share}%)</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiPasiva.deposito.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.deposito.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.deposito.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiPasiva.deposito.deviation}</td></tr>
        <tr style="background: #d4edda;"><td style="padding: 8px; font-weight: bold;">Modal (Ekuitas)</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiPasiva.modal.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.modal.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.modal.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiPasiva.modal.deviation}</td></tr>
        <tr style="background: #d4edda;"><td style="padding: 8px; font-weight: bold;">Laba Bersih</td><td style="padding: 8px; text-align: right;">Rp ${data.kpiPasiva.labaBersih.formatted}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.labaBersih.yoyGrowth}</td><td style="padding: 8px; text-align: center;">${data.kpiPasiva.labaBersih.achievement}</td><td style="padding: 8px; text-align: right;">${data.kpiPasiva.labaBersih.deviation}</td></tr>
    </table>
</div>

<div class="report-section neraca-explanation">
    <h3>📋 PENJELASAN REALISASI INDIKATOR NERACA</h3>
    <p style="font-style: italic; color: #666; margin-bottom: 20px;">Analisis detail untuk setiap indikator neraca periode ${data.periode.full}</p>
    
    <div style="background: #e8f4ea; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #155724; margin-top: 0;">📊 ASET</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Realisasi Total Aset Bank sebesar <strong>Rp ${data.kpiAktiva.totalAset.formatted}</strong> atau mencapai <strong>${data.kpiAktiva.totalAset.achievement}</strong> dari target Rp ${data.kpiAktiva.totalAset.targetFormatted} dengan deviasi sebesar <strong>${data.kpiAktiva.totalAset.deviation}</strong>. Secara year-on-year, aset tumbuh sebesar <strong>${data.kpiAktiva.totalAset.yoyGrowth}</strong>. Pertumbuhan aset didorong oleh ekspansi pada komponen-komponen produktif, terutama penyaluran kredit yang merupakan kontributor utama pertumbuhan aset bank. Komposisi aset didominasi oleh Kredit yang Diberikan sebesar Rp ${data.kpiAktiva.kredit.formatted}, Surat Berharga Rp ${data.kpiAktiva.suratBerharga.formatted}, dan Penempatan pada Bank Lain Rp ${data.kpiAktiva.penempatanBank.formatted}. Bank terus mengoptimalkan penempatan aset pada instrumen produktif untuk meningkatkan pendapatan bunga sekaligus menjaga likuiditas yang memadai.
        </p>
    </div>
    
    <div style="background: #e3f2fd; border-left: 4px solid #0d6efd; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #084298; margin-top: 0;">💰 KREDIT & PEMBIAYAAN</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Total penyaluran <strong>Kredit</strong> tercatat sebesar <strong>Rp ${data.kpiAktiva.kredit.formatted}</strong> dengan pencapaian <strong>${data.kpiAktiva.kredit.achievement}</strong> dari target dan pertumbuhan YoY sebesar <strong>${data.kpiAktiva.kredit.yoyGrowth}</strong>, dengan deviasi dari target sebesar <strong>${data.kpiAktiva.kredit.deviation}</strong>. Sementara <strong>Pembiayaan Syariah</strong> tercatat sebesar <strong>Rp ${data.kpiAktiva.pembiayaan.formatted}</strong> dengan pertumbuhan YoY sebesar <strong>${data.kpiAktiva.pembiayaan.yoyGrowth}</strong>. Pertumbuhan kredit didorong oleh meningkatnya permintaan di sektor konsumtif dan produktif, serta dukungan program pemerintah daerah. Namun demikian, terdapat tantangan dalam penyaluran kredit terutama terkait daya serap pasar dan kualitas calon debitur. Kualitas kredit tetap terjaga dengan NPL sebesar ${data.kpiRatio.npl.nilai}% yang masih berada di bawah batas maksimum OJK 5%. Cadangan Kerugian Penurunan Nilai (CKPN) tercatat sebesar Rp ${data.kpiAktiva.ckpn.formatted} untuk mengantisipasi potensi risiko kredit.
        </p>
    </div>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #856404; margin-top: 0;">🏦 DANA PIHAK KETIGA (DPK)</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Penghimpunan <strong>Dana Pihak Ketiga (DPK)</strong> tercatat sebesar <strong>Rp ${data.kpiPasiva.dpk.formatted}</strong> atau mencapai <strong>${data.kpiPasiva.dpk.achievement}</strong> dari target dengan deviasi sebesar <strong>${data.kpiPasiva.dpk.deviation}</strong>. Secara year-on-year, DPK tumbuh sebesar <strong>${data.kpiPasiva.dpk.yoyGrowth}</strong>. Komposisi DPK terdiri dari <strong>Giro</strong> sebesar Rp ${data.kpiPasiva.giro.formatted} (<strong>${data.kpiPasiva.giro.share}%</strong>), <strong>Tabungan</strong> sebesar Rp ${data.kpiPasiva.tabungan.formatted} (<strong>${data.kpiPasiva.tabungan.share}%</strong>), dan <strong>Deposito</strong> sebesar Rp ${data.kpiPasiva.deposito.formatted} (<strong>${data.kpiPasiva.deposito.share}%</strong>). CASA Ratio tercatat sebesar <strong>${data.kpiRatio.casa.nilai}%</strong> yang menunjukkan proporsi dana murah terhadap total DPK. Struktur DPK ini mempengaruhi cost of fund bank, dimana proporsi deposito yang tinggi akan meningkatkan biaya dana. Bank perlu terus meningkatkan penghimpunan dana murah melalui optimalisasi giro pemerintah daerah dan pengembangan produk tabungan yang kompetitif.
        </p>
    </div>
    
    <div style="background: #d4edda; border-left: 4px solid #198754; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #0f5132; margin-top: 0;">💵 MODAL & LABA BERSIH</h4>
        <p style="text-align: justify; line-height: 1.8;">
            <strong>Modal (Ekuitas)</strong> Bank tercatat sebesar <strong>Rp ${data.kpiPasiva.modal.formatted}</strong> dengan pertumbuhan YoY sebesar <strong>${data.kpiPasiva.modal.yoyGrowth}</strong>. Pertumbuhan modal didorong oleh akumulasi laba ditahan serta kebijakan manajemen untuk memperkuat struktur permodalan. <strong>Laba Bersih</strong> periode ${data.periode.full} tercatat sebesar <strong>Rp ${data.kpiPasiva.labaBersih.formatted}</strong> atau mencapai <strong>${data.kpiPasiva.labaBersih.achievement}</strong> dari target dengan deviasi sebesar <strong>${data.kpiPasiva.labaBersih.deviation}</strong>. Secara year-on-year, laba bersih tumbuh sebesar <strong>${data.kpiPasiva.labaBersih.yoyGrowth}</strong>. Pertumbuhan laba didorong oleh peningkatan pendapatan bunga dari ekspansi kredit dan efisiensi biaya operasional dengan BOPO sebesar ${data.kpiRatio.bopo.nilai}%. Rasio kecukupan modal (CAR) sebesar ${data.kpiRatio.car.nilai}% jauh di atas batas minimum OJK 12%, menunjukkan bank memiliki kapasitas yang memadai untuk ekspansi bisnis.
        </p>
    </div>
</div>

<div class="report-section ratio-table">
    <h3>📈 INDIKATOR KINERJA UTAMA (KPI) - RASIO KEUANGAN</h3>
    <table style="width:100%; border-collapse: collapse; margin: 10px 0; font-size: 12px;">
        <tr style="background: #1e3a5f; color: white;">
            <th style="padding: 10px; text-align: left;">Rasio</th>
            <th style="padding: 10px; text-align: center;">Nilai</th>
            <th style="padding: 10px; text-align: center;">Δ YoY</th>
            <th style="padding: 10px; text-align: center;">Target/Batas</th>
            <th style="padding: 10px; text-align: center;">Status</th>
            <th style="padding: 10px; text-align: left;">Keterangan</th>
        </tr>
        <tr style="background: #e3f2fd;"><td colspan="6" style="padding: 8px; font-weight: bold;">📊 LIKUIDITAS</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">${data.kpiRatio.ldr.nama}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.ldr.nilai}%</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.ldr.yoyChange}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.ldr.target}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.ldr.status}</td><td style="padding: 8px;">${data.kpiRatio.ldr.keterangan}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">${data.kpiRatio.casa.nama}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.casa.nilai}%</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.casa.yoyChange}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.casa.target}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.casa.status}</td><td style="padding: 8px;">${data.kpiRatio.casa.keterangan}</td></tr>
        <tr style="background: #e8f5e9;"><td colspan="6" style="padding: 8px; font-weight: bold;">💰 PROFITABILITAS</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">${data.kpiRatio.roa.nama}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.roa.nilai}%</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.roa.yoyChange}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.roa.target}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.roa.status}</td><td style="padding: 8px;">${data.kpiRatio.roa.keterangan}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">${data.kpiRatio.roe.nama}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.roe.nilai}%</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.roe.yoyChange}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.roe.target}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.roe.status}</td><td style="padding: 8px;">${data.kpiRatio.roe.keterangan}</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">${data.kpiRatio.nim.nama}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.nim.nilai}%</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.nim.yoyChange}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.nim.target}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.nim.status}</td><td style="padding: 8px;">${data.kpiRatio.nim.keterangan}</td></tr>
        <tr style="background: #fff3e0;"><td colspan="6" style="padding: 8px; font-weight: bold;">⚙️ EFISIENSI</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">${data.kpiRatio.bopo.nama}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.bopo.nilai}%</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.bopo.yoyChange}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.bopo.target}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.bopo.status}</td><td style="padding: 8px;">${data.kpiRatio.bopo.keterangan}</td></tr>
        <tr style="background: #ffebee;"><td colspan="6" style="padding: 8px; font-weight: bold;">⚠️ KUALITAS ASET</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">${data.kpiRatio.npl.nama}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.npl.nilai}%</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.npl.yoyChange}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.npl.target}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.npl.status}</td><td style="padding: 8px;">${data.kpiRatio.npl.keterangan}</td></tr>
        <tr style="background: #e3f2fd;"><td colspan="6" style="padding: 8px; font-weight: bold;">🏦 PERMODALAN</td></tr>
        <tr style="background: #f8f9fa;"><td style="padding: 8px;">${data.kpiRatio.car.nama}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.car.nilai}%</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.car.yoyChange}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.car.target}</td><td style="padding: 8px; text-align: center;">${data.kpiRatio.car.status}</td><td style="padding: 8px;">${data.kpiRatio.car.keterangan}</td></tr>
    </table>
</div>

<div class="report-section ratio-explanation">
    <h3>📋 PENJELASAN REALISASI RASIO KEUANGAN</h3>
    <p style="font-style: italic; color: #666; margin-bottom: 20px;">Penjelasan detail untuk setiap rasio keuangan periode ${data.periode.full}</p>
    
    <div style="background: #f8f9fa; border-left: 4px solid #1e3a5f; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #1e3a5f; margin-top: 0;"><span style="background: #1e3a5f; color: white; padding: 5px 12px; border-radius: 50%; margin-right: 10px;">1</span> Realisasi Rasio KPMM (CAR) sebesar ${data.kpiRatio.car.nilai}%</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Realisasi Rasio KPMM (CAR) sebesar <strong>${data.kpiRatio.car.nilai}%</strong> dari proyeksi sebesar <strong>${data.kpiRatio.car.target}</strong>, dengan perubahan sebesar <strong>${data.kpiRatio.car.yoyChange}</strong> dibandingkan ${data.periode.prevYear} yang tercatat sebesar <strong>${data.kpiRatio.car.prevYearValue}%</strong>. Kondisi ini disebabkan pertumbuhan Kredit & Pembiayaan sebesar ${data.kpiAktiva.kredit.yoyGrowth} yang mendorong kenaikan ATMR (Aktiva Tertimbang Menurut Risiko). Sementara pertumbuhan Modal sebesar ${data.kpiPasiva.modal.yoyGrowth} belum sepenuhnya mengimbangi pertumbuhan ATMR tersebut. Meski demikian, rasio CAR sebesar ${data.kpiRatio.car.nilai}% masih jauh di atas batas minimum OJK sebesar 12%, menunjukkan bank memiliki buffer permodalan yang memadai. Posisi CAR yang kuat ini memberikan ruang bagi bank untuk melakukan ekspansi kredit secara prudent sambil tetap menjaga kecukupan modal sesuai regulasi.
        </p>
    </div>
    
    <div style="background: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #28a745; margin-top: 0;"><span style="background: #28a745; color: white; padding: 5px 12px; border-radius: 50%; margin-right: 10px;">2</span> Realisasi Rasio Return On Equity (ROE) sebesar ${data.kpiRatio.roe.nilai}%</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Realisasi Rasio Return On Equity (ROE) sebesar <strong>${data.kpiRatio.roe.nilai}%</strong> dari proyeksi sebesar <strong>${data.kpiRatio.roe.target}</strong>, dengan perubahan sebesar <strong>${data.kpiRatio.roe.yoyChange}</strong> dibandingkan ${data.periode.prevYear} yang tercatat sebesar <strong>${data.kpiRatio.roe.prevYearValue}%</strong>. Perubahan ROE dipengaruhi oleh perbandingan pertumbuhan Laba Bersih sebesar ${data.kpiPasiva.labaBersih.yoyGrowth} dengan pertumbuhan Modal sebesar ${data.kpiPasiva.modal.yoyGrowth}. Peningkatan kinerja ROE dibandingkan tahun sebelumnya menunjukkan efektivitas penggunaan modal pemegang saham dalam menghasilkan keuntungan. ROE yang positif mencerminkan kemampuan bank dalam memberikan return yang memadai kepada pemegang saham, meskipun masih terdapat ruang untuk optimalisasi lebih lanjut.
        </p>
    </div>
    
    <div style="background: #f8f9fa; border-left: 4px solid #17a2b8; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #17a2b8; margin-top: 0;"><span style="background: #17a2b8; color: white; padding: 5px 12px; border-radius: 50%; margin-right: 10px;">3</span> Realisasi Rasio Return On Asset (ROA) sebesar ${data.kpiRatio.roa.nilai}%</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Realisasi Rasio Return On Asset (ROA) sebesar <strong>${data.kpiRatio.roa.nilai}%</strong> dari proyeksi sebesar <strong>${data.kpiRatio.roa.target}</strong>, dengan perubahan sebesar <strong>${data.kpiRatio.roa.yoyChange}</strong> dibandingkan ${data.periode.prevYear} yang tercatat sebesar <strong>${data.kpiRatio.roa.prevYearValue}%</strong>. Kondisi ini mencerminkan perbandingan antara pencapaian Aset sebesar ${data.kpiAktiva.totalAset.achievement} dari target dengan pencapaian Laba Bersih sebesar ${data.kpiPasiva.labaBersih.achievement}. Pertumbuhan Laba Bersih Bank sebesar ${data.kpiPasiva.labaBersih.yoyGrowth} dibandingkan pertumbuhan Aset Bank sebesar ${data.kpiAktiva.totalAset.yoyGrowth} menunjukkan tingkat efektivitas penggunaan aset dalam menghasilkan laba. ROA di atas 1,5% mengindikasikan bank berada dalam kategori sangat baik dalam hal profitabilitas aset.
        </p>
    </div>
    
    <div style="background: #f8f9fa; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #856404; margin-top: 0;"><span style="background: #ffc107; color: #856404; padding: 5px 12px; border-radius: 50%; margin-right: 10px;">4</span> Realisasi Rasio Net Interest Margin (NIM) sebesar ${data.kpiRatio.nim.nilai}%</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Realisasi Rasio Net Interest Margin (NIM) sebesar <strong>${data.kpiRatio.nim.nilai}%</strong> dari proyeksi sebesar <strong>${data.kpiRatio.nim.target}</strong>, dengan perubahan sebesar <strong>${data.kpiRatio.nim.yoyChange}</strong> dibandingkan ${data.periode.prevYear} yang tercatat sebesar <strong>${data.kpiRatio.nim.prevYearValue}%</strong>. Kondisi ini dipengaruhi oleh proporsi dana murah (CASA) sebesar ${data.kpiRatio.casa.nilai}% dan komposisi DPK dimana Deposito mencapai ${data.kpiPasiva.deposito.share}% dari total DPK. Proporsi deposito yang tinggi meningkatkan cost of fund karena bunga deposito lebih tinggi dibandingkan giro dan tabungan, sehingga memberikan tekanan pada margin bunga bersih. Bank perlu mengoptimalkan penghimpunan dana murah melalui peningkatan giro pemerintah daerah dan produk tabungan untuk memperbaiki struktur pendanaan dan mendukung NIM yang lebih optimal.
        </p>
    </div>
    
    <div style="background: #f8f9fa; border-left: 4px solid #6c757d; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #6c757d; margin-top: 0;"><span style="background: #6c757d; color: white; padding: 5px 12px; border-radius: 50%; margin-right: 10px;">5</span> Realisasi Rasio BOPO sebesar ${data.kpiRatio.bopo.nilai}%</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Realisasi Rasio Biaya Operasional berbanding Pendapatan Operasional (BOPO) sebesar <strong>${data.kpiRatio.bopo.nilai}%</strong> dari proyeksi sebesar <strong>${data.kpiRatio.bopo.target}</strong>, dengan perubahan sebesar <strong>${data.kpiRatio.bopo.yoyChange}</strong> dibandingkan ${data.periode.prevYear} yang tercatat sebesar <strong>${data.kpiRatio.bopo.prevYearValue}%</strong>. BOPO di bawah 85% menunjukkan bank beroperasi dengan tingkat efisiensi yang baik. Perbaikan rasio BOPO didorong oleh upaya efisiensi pada beberapa komponen Biaya Operasional Bank, termasuk optimalisasi beban CKPN sebesar Rp ${data.kpiAktiva.ckpn.formatted}. Bank terus melakukan pengendalian biaya operasional melalui digitalisasi layanan dan efisiensi proses bisnis untuk mempertahankan tingkat efisiensi yang optimal.
        </p>
    </div>
    
    <div style="background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #dc3545; margin-top: 0;"><span style="background: #dc3545; color: white; padding: 5px 12px; border-radius: 50%; margin-right: 10px;">6</span> Realisasi Rasio NPL (Non Performing Loan) sebesar ${data.kpiRatio.npl.nilai}%</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Realisasi Rasio NPL (Non Performing Loan) sebesar <strong>${data.kpiRatio.npl.nilai}%</strong> dari batas maksimal sebesar <strong>${data.kpiRatio.npl.target}</strong>, dengan perubahan sebesar <strong>${data.kpiRatio.npl.yoyChange}</strong> dibandingkan ${data.periode.prevYear} yang tercatat sebesar <strong>${data.kpiRatio.npl.prevYearValue}%</strong>. NPL yang berada di bawah batas 5% menunjukkan kualitas kredit bank masih dalam kategori sehat. Bank telah membentuk Cadangan Kerugian Penurunan Nilai (CKPN) sebesar Rp ${data.kpiAktiva.ckpn.formatted} untuk mengantisipasi potensi kerugian kredit. Pengelolaan NPL dilakukan melalui upaya intensifikasi penagihan, restrukturisasi kredit bermasalah, dan penguatan proses analisis kredit untuk menjaga kualitas portofolio.
        </p>
    </div>
    
    <div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #007bff; margin-top: 0;"><span style="background: #007bff; color: white; padding: 5px 12px; border-radius: 50%; margin-right: 10px;">7</span> Realisasi Rasio LDR (Loan to Deposit Ratio) sebesar ${data.kpiRatio.ldr.nilai}%</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Realisasi Rasio LDR (Loan to Deposit Ratio) sebesar <strong>${data.kpiRatio.ldr.nilai}%</strong> dari koridor regulasi sebesar <strong>${data.kpiRatio.ldr.target}</strong>, dengan perubahan sebesar <strong>${data.kpiRatio.ldr.yoyChange}</strong> dibandingkan ${data.periode.prevYear} yang tercatat sebesar <strong>${data.kpiRatio.ldr.prevYearValue}%</strong>. Kondisi ini mencerminkan perbandingan pertumbuhan Kredit Rp ${data.kpiAktiva.kredit.formatted} (growth ${data.kpiAktiva.kredit.yoyGrowth}) dengan DPK Rp ${data.kpiPasiva.dpk.formatted} (growth ${data.kpiPasiva.dpk.yoyGrowth}). LDR yang berada dalam koridor 80%-92% menunjukkan keseimbangan antara fungsi intermediasi dan likuiditas bank. Bank terus mengoptimalkan penyaluran kredit yang produktif dengan tetap menjaga likuiditas yang memadai.
        </p>
    </div>
    
    <div style="background: #f8f9fa; border-left: 4px solid #20c997; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
        <h4 style="color: #20c997; margin-top: 0;"><span style="background: #20c997; color: white; padding: 5px 12px; border-radius: 50%; margin-right: 10px;">8</span> Realisasi Rasio CASA sebesar ${data.kpiRatio.casa.nilai}%</h4>
        <p style="text-align: justify; line-height: 1.8;">
            Realisasi Rasio CASA (Current Account Saving Account) sebesar <strong>${data.kpiRatio.casa.nilai}%</strong> dari target sebesar <strong>${data.kpiRatio.casa.target}</strong>, dengan perubahan sebesar <strong>${data.kpiRatio.casa.yoyChange}</strong> dibandingkan ${data.periode.prevYear} yang tercatat sebesar <strong>${data.kpiRatio.casa.prevYearValue}%</strong>. Komposisi DPK saat ini terdiri dari Giro <strong>${data.kpiPasiva.giro.share}%</strong> (Rp ${data.kpiPasiva.giro.formatted}), Tabungan <strong>${data.kpiPasiva.tabungan.share}%</strong> (Rp ${data.kpiPasiva.tabungan.formatted}), dan Deposito <strong>${data.kpiPasiva.deposito.share}%</strong> (Rp ${data.kpiPasiva.deposito.formatted}). CASA yang tinggi sangat penting untuk menekan cost of fund dan meningkatkan NIM. Bank perlu terus meningkatkan penghimpunan dana murah melalui optimalisasi rekening giro pemerintah daerah, pengembangan fitur digital banking untuk tabungan, dan program-program promosi yang menarik untuk meningkatkan jumlah nasabah dan saldo dana murah.
        </p>
    </div>
</div>

<div class="report-section highlights">
    <h3>✅ HIGHLIGHT KINERJA POSITIF</h3>
    <p style="font-style: italic; color: #666; margin-bottom: 15px;">Ringkasan pencapaian positif periode ${data.periode.full}</p>
    <ul>
        <li><strong>[Aspek Positif 1 - ASET/KREDIT]:</strong> [Jelaskan pencapaian terkait aset atau kredit dengan angka spesifik dan perbandingan YoY]</li>
        <li><strong>[Aspek Positif 2 - DPK/FUNDING]:</strong> [Jelaskan pencapaian terkait penghimpunan dana dengan angka spesifik]</li>
        <li><strong>[Aspek Positif 3 - PROFITABILITAS]:</strong> [Jelaskan pencapaian terkait laba/ROA/ROE dengan angka spesifik]</li>
        <li><strong>[Aspek Positif 4 - EFISIENSI/KUALITAS]:</strong> [Jelaskan pencapaian terkait BOPO/NPL/CAR dengan angka spesifik]</li>
    </ul>
</div>

<div class="report-section concerns">
    <h3>⚠️ AREA YANG MEMERLUKAN PERHATIAN</h3>
    <p style="font-style: italic; color: #666; margin-bottom: 15px;">Identifikasi tantangan dan area perbaikan</p>
    <ul>
        <li><strong>[Tantangan 1]:</strong> [Jelaskan masalah, penyebab, dampak potensial, dan rekomendasi perbaikan]</li>
        <li><strong>[Tantangan 2]:</strong> [Jelaskan masalah, penyebab, dampak potensial, dan rekomendasi perbaikan]</li>
        <li><strong>[Tantangan 3]:</strong> [Jelaskan masalah, penyebab, dampak potensial, dan rekomendasi perbaikan]</li>
    </ul>
</div>

<div class="report-section recommendations">
    <h3>💡 REKOMENDASI STRATEGIS</h3>
    <ol>
        <li><strong>[Judul Rekomendasi 1]</strong><p>[Penjelasan detail, langkah implementasi, expected outcome, timeline]</p></li>
        <li><strong>[Judul Rekomendasi 2]</strong><p>[Penjelasan detail, langkah implementasi, expected outcome, timeline]</p></li>
        <li><strong>[Judul Rekomendasi 3]</strong><p>[Penjelasan detail, langkah implementasi, expected outcome, timeline]</p></li>
        <li><strong>[Judul Rekomendasi 4]</strong><p>[Penjelasan detail, langkah implementasi, expected outcome, timeline]</p></li>
    </ol>
</div>

<div class="report-section outlook">
    <h3>📈 OUTLOOK & PROYEKSI DESEMBER ${data.periode.tahun}</h3>
    <p><strong>Proyeksi Pencapaian Target:</strong> [Analisis apakah target Desember akan tercapai berdasarkan tren saat ini. Target Aset: Rp ${data.kpiAktiva.totalAset.targetFormatted}, pencapaian saat ini: ${data.kpiAktiva.totalAset.achievement}]</p>
    <p><strong>Gap Analysis:</strong> [Identifikasi gap antara posisi saat ini vs target Desember dan strategi untuk menutup gap]</p>
    <p><strong>Faktor Risiko:</strong> [Identifikasi risiko eksternal dan internal yang perlu diantisipasi]</p>
    <p><strong>Peluang:</strong> [Identifikasi peluang pertumbuhan hingga akhir tahun]</p>
</div>

<div class="report-section conclusion">
    <h3>📝 KESIMPULAN</h3>
    <p>[Berikan kesimpulan komprehensif dalam 2-3 paragraf yang merangkum kondisi bank, pencapaian target, tantangan utama, dan arah strategis ke depan hingga akhir tahun ${data.periode.tahun}]</p>
</div>

PENTING:
- Gunakan data AKTUAL dari tabel di atas
- Berikan analisis yang OBJEKTIF dan BERBASIS DATA
- Fokus pada PENCAPAIAN TARGET dan DEVIASI
- Perhatikan tren YoY (Year-on-Year) dalam analisis
- Berikan INSIGHT yang dapat ditindaklanjuti oleh manajemen
- Gunakan bahasa yang PROFESIONAL namun mudah dipahami

KHUSUS UNTUK SECTION "PENJELASAN REALISASI INDIKATOR NERACA":
- WAJIB mengisi semua 4 penjelasan indikator neraca (ASET, KREDIT & PEMBIAYAAN, DPK, MODAL & LABA) dengan narasi LENGKAP
- Setiap penjelasan MINIMAL 6-8 kalimat yang saling berkaitan dalam bentuk paragraf naratif
- Format: "Realisasi [INDIKATOR] sebesar Rp [NILAI] atau mencapai [PENCAPAIAN]% dari target Rp [TARGET] dengan deviasi sebesar [DEVIASI]. Secara year-on-year, tumbuh sebesar [YOY GROWTH]. [JELASKAN KOMPONEN-KOMPONEN PEMBENTUK]. [JELASKAN FAKTOR PENDORONG DAN PENGHAMBAT]. [JELASKAN IMPLIKASI DAN STRATEGI]."
- Jelaskan keterkaitan antar indikator (misal: pertumbuhan DPK mendukung ekspansi kredit)

KHUSUS UNTUK SECTION "PENJELASAN REALISASI RASIO KEUANGAN":
- WAJIB mengisi semua 8 penjelasan rasio (CAR, ROE, ROA, NIM, BOPO, NPL, LDR, CASA) dengan narasi LENGKAP dan DETAIL
- Setiap penjelasan rasio harus MINIMAL 5-7 kalimat yang saling berkaitan
- Format penjelasan mengikuti pola: "Realisasi Rasio [NAMA] sebesar [NILAI]% dari proyeksi sebesar [TARGET]%, atau [di bawah/melampaui] target sebesar [DEVIASI]% dan [tumbuh/turun] sebesar [YOY]% dibandingkan tahun sebelumnya. Kondisi ini disebabkan oleh [PENYEBAB DETAIL]. [PENJELASAN LEBIH LANJUT TENTANG FAKTOR-FAKTOR YANG MEMPENGARUHI]. [IMPLIKASI DAN DAMPAK TERHADAP KINERJA BANK]."
- Gunakan data spesifik seperti nilai rupiah, persentase, dan perbandingan
- Jelaskan HUBUNGAN KAUSALITAS antar rasio (misal: penurunan CASA → kenaikan cost of fund → tekanan pada NIM)
- Berikan konteks regulasi OJK/Bank Indonesia jika relevan

SANGAT PENTING:
- Laporan ini untuk DIREKSI dan DEWAN KOMISARIS, harus PROFESIONAL dan INFORMATIF
- JANGAN hanya menampilkan tabel tanpa penjelasan naratif
- Setiap section harus memiliki NARASI yang menjelaskan angka-angka dalam tabel
- Gunakan format paragraf yang mudah dibaca, bukan bullet points berlebihan`;
    }
    
    async function callClaudeAPI(prompt) {
        // Call Netlify Function (proxy to Claude API)
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            throw new Error(result.error || `API Error: ${response.status}`);
        }
        
        return result.content;
    }
    
    // ========================================
    // DISPLAY REPORT
    // ========================================
    
    function displayReport(reportHtml, data) {
        const container = document.getElementById('aiReportContent');
        if (!container) return;
        
        const now = new Date();
        const timestamp = now.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        container.innerHTML = `
            <div class="ai-report">
                <div class="report-header">
                    <div class="report-title">
                        <h2>📊 EXECUTIVE REPORT</h2>
                        <p class="report-subtitle">Bank Sulselbar - ${data.periode.full}</p>
                    </div>
                    <div class="report-meta">
                        <span class="report-badge ${data.tipe.toLowerCase()}">${data.tipe}</span>
                        <span class="report-timestamp">Generated: ${timestamp}</span>
                    </div>
                </div>
                
                <div class="report-body">
                    ${reportHtml}
                </div>
                
                <div class="report-footer">
                    <p><em>Report ini di-generate oleh AI berdasarkan data dashboard. 
                    Mohon verifikasi dengan data sumber untuk pengambilan keputusan.</em></p>
                </div>
            </div>
        `;
        
        // Show export buttons
        const exportBtns = document.getElementById('exportButtons');
        if (exportBtns) exportBtns.style.display = 'flex';
    }
    
    function displayError(message) {
        const container = document.getElementById('aiReportContent');
        if (!container) return;
        
        container.innerHTML = `
            <div class="ai-report-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Gagal Generate Report</h3>
                <p>${message}</p>
                <button class="btn-retry" onclick="AIReportGenerator.generate()">
                    <i class="fas fa-redo"></i> Coba Lagi
                </button>
            </div>
        `;
    }
    
    function updateUIGenerating(isGenerating) {
        const btn = document.getElementById('generateReportBtn');
        const loader = document.getElementById('reportLoader');
        
        if (btn) {
            btn.disabled = isGenerating;
            btn.innerHTML = isGenerating 
                ? '<i class="fas fa-spinner fa-spin"></i> Generating...'
                : '<i class="fas fa-robot"></i> Generate AI Report';
        }
        
        if (loader) {
            loader.style.display = isGenerating ? 'flex' : 'none';
        }
    }
    
    // ========================================
    // EXPORT PDF
    // ========================================
    
    async function exportPDF() {
        if (!lastReport) {
            showToast('Belum ada report untuk di-export', 'warning');
            return;
        }
        
        showToast('Mempersiapkan PDF...', 'info');
        
        try {
            // Use html2pdf library
            const element = document.querySelector('.ai-report');
            if (!element) throw new Error('Report element not found');
            
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `Executive_Report_${lastReport.data.periode.full.replace(' ', '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Check if html2pdf is available
            if (typeof html2pdf !== 'undefined') {
                await html2pdf().set(opt).from(element).save();
                showToast('PDF berhasil di-download!', 'success');
            } else {
                // Fallback: print
                window.print();
            }
            
        } catch (error) {
            console.error('PDF Export error:', error);
            showToast('Gagal export PDF: ' + error.message, 'error');
        }
    }
    
    // ========================================
    // HELPER
    // ========================================
    
    function showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    // ========================================
    // PUBLIC API
    // ========================================
    
    return {
        generate: generateReport,
        exportPDF: exportPDF,
        getLastReport: () => lastReport,
        collectData: collectDashboardData
    };
    
})();

// Make globally available
window.AIReportGenerator = AIReportGenerator;

console.log('🤖 AI Report Generator loaded');
