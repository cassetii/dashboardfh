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
                    keterangan: ldr >= ratioTargets.ldr.min && ldr <= ratioTargets.ldr.max ? 'Dalam batas sehat' : 'Perlu perhatian'
                },
                casa: {
                    nama: 'CASA Ratio',
                    kategori: 'Likuiditas',
                    nilai: casa.toFixed(2),
                    yoyValue: casaYoY,
                    yoyChange: casaYoY ? formatGrowth(casa - casaYoY) : 'N/A',
                    target: `≥${ratioTargets.casa.target}%`,
                    status: casa >= ratioTargets.casa.target ? '✅ BAIK' : '⚠️ PERLU DITINGKATKAN',
                    keterangan: casa >= ratioTargets.casa.target ? 'Mencapai target' : 'Di bawah target'
                },
                bopo: {
                    nama: 'BOPO',
                    kategori: 'Efisiensi',
                    nilai: bopo.toFixed(2),
                    yoyValue: bopoYoY,
                    yoyChange: bopoYoY ? formatGrowth(bopo - bopoYoY) : 'N/A',
                    target: `≤${ratioTargets.bopo.target}%`,
                    status: bopo <= ratioTargets.bopo.target ? '✅ EFISIEN' : (bopo <= 90 ? '⚠️ CUKUP' : '❌ TIDAK EFISIEN'),
                    keterangan: bopo <= ratioTargets.bopo.target ? 'Operasional efisien' : 'Perlu efisiensi biaya'
                },
                npl: {
                    nama: 'NPL (Non Performing Loan)',
                    kategori: 'Kualitas Aset',
                    nilai: npl.toFixed(2),
                    yoyValue: nplYoY,
                    yoyChange: nplYoY ? formatGrowth(npl - nplYoY) : 'N/A',
                    target: `≤${ratioTargets.npl.target}%`,
                    status: npl <= ratioTargets.npl.target ? '✅ SEHAT' : '❌ BERISIKO',
                    keterangan: npl <= ratioTargets.npl.target ? 'Kualitas kredit baik' : 'Risiko kredit tinggi'
                },
                roa: {
                    nama: 'ROA (Return on Asset)',
                    kategori: 'Profitabilitas',
                    nilai: roa.toFixed(2),
                    yoyValue: roaYoY,
                    yoyChange: roaYoY ? formatGrowth(roa - roaYoY) : 'N/A',
                    target: `≥${ratioTargets.roa.target}%`,
                    status: roa >= ratioTargets.roa.target ? '✅ SANGAT BAIK' : (roa >= 1.25 ? '⚠️ BAIK' : '❌ KURANG'),
                    keterangan: roa >= ratioTargets.roa.target ? 'Profitabilitas tinggi' : 'Perlu peningkatan laba'
                },
                roe: {
                    nama: 'ROE (Return on Equity)',
                    kategori: 'Profitabilitas',
                    nilai: roe.toFixed(2),
                    yoyValue: roeYoY,
                    yoyChange: roeYoY ? formatGrowth(roe - roeYoY) : 'N/A',
                    target: `≥${ratioTargets.roe.target}%`,
                    status: roe >= ratioTargets.roe.target ? '✅ BAIK' : '⚠️ PERLU DITINGKATKAN',
                    keterangan: roe >= ratioTargets.roe.target ? 'Return modal optimal' : 'Optimalisasi modal'
                },
                nim: {
                    nama: 'NIM (Net Interest Margin)',
                    kategori: 'Profitabilitas',
                    nilai: nim.toFixed(2),
                    yoyValue: nimYoY,
                    yoyChange: nimYoY ? formatGrowth(nim - nimYoY) : 'N/A',
                    target: `≥${ratioTargets.nim.target}%`,
                    status: nim >= ratioTargets.nim.target ? '✅ BAIK' : '⚠️ PERLU DITINGKATKAN',
                    keterangan: nim >= ratioTargets.nim.target ? 'Margin bunga optimal' : 'Perlu optimalisasi'
                },
                car: {
                    nama: 'CAR/KPMM',
                    kategori: 'Permodalan',
                    nilai: car.toFixed(2),
                    yoyValue: carYoY,
                    yoyChange: carYoY ? formatGrowth(car - carYoY) : 'N/A',
                    target: `≥${ratioTargets.car.target}%`,
                    status: car >= ratioTargets.car.target ? '✅ MEMENUHI' : '❌ TIDAK MEMENUHI',
                    keterangan: car >= ratioTargets.car.target ? 'Modal mencukupi' : 'Perlu penambahan modal'
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

<div class="report-section highlights">
    <h3>✅ HIGHLIGHT KINERJA POSITIF</h3>
    <ul>
        <li><strong>[Aspek 1]:</strong> [Penjelasan detail dengan angka pendukung dari tabel di atas]</li>
        <li><strong>[Aspek 2]:</strong> [Penjelasan detail dengan angka pendukung]</li>
        <li><strong>[Aspek 3]:</strong> [Penjelasan detail dengan angka pendukung]</li>
        <li><strong>[Aspek 4]:</strong> [Penjelasan detail dengan angka pendukung]</li>
    </ul>
</div>

<div class="report-section concerns">
    <h3>⚠️ AREA YANG MEMERLUKAN PERHATIAN</h3>
    <ul>
        <li><strong>[Concern 1]:</strong> [Penjelasan masalah, dampak potensial, dan rekomendasi]</li>
        <li><strong>[Concern 2]:</strong> [Penjelasan masalah, dampak potensial, dan rekomendasi]</li>
        <li><strong>[Concern 3]:</strong> [Penjelasan masalah, dampak potensial, dan rekomendasi]</li>
    </ul>
</div>

<div class="report-section analysis">
    <h3>🔍 ANALISIS MENDALAM</h3>
    <h4>Struktur Dana Pihak Ketiga</h4>
    <p>[Analisis komposisi DPK: Giro ${data.kpiPasiva.giro.share}%, Tabungan ${data.kpiPasiva.tabungan.share}%, Deposito ${data.kpiPasiva.deposito.share}%. CASA Ratio ${data.kpiRatio.casa.nilai}%. Bahas implikasi biaya dana dan strategi optimalisasi]</p>
    
    <h4>Kualitas Portofolio Kredit</h4>
    <p>[Analisis NPL ${data.kpiRatio.npl.nilai}%, CKPN Rp ${data.kpiAktiva.ckpn.formatted}, coverage ratio. Bahas risiko kredit dan strategi mitigasi]</p>
    
    <h4>Efisiensi Operasional</h4>
    <p>[Analisis BOPO ${data.kpiRatio.bopo.nilai}%, NIM ${data.kpiRatio.nim.nilai}%. Bahas efisiensi biaya dan produktivitas]</p>
    
    <h4>Permodalan</h4>
    <p>[Analisis CAR ${data.kpiRatio.car.nilai}% vs batas minimum 12%. Bahas kecukupan modal dan kapasitas ekspansi]</p>
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
- Gunakan bahasa yang PROFESIONAL namun mudah dipahami`;
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
