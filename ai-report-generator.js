// ========================================
// AI EXECUTIVE REPORT GENERATOR
// Version: 3.1 - Format Bahasa Resmi Bank Sulselbar
// ========================================

const AIReportGenerator = (function() {
    'use strict';
    
    const API_ENDPOINT = 'https://analyticsdashboard.syntaxvlad.workers.dev';
    
    let isGenerating = false;
    let lastReport = null;
    
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    function getTriwulanFromMonth(month) {
        const m = parseInt(month);
        if (m >= 1 && m <= 3) return 1;
        if (m >= 4 && m <= 6) return 2;
        if (m >= 7 && m <= 9) return 3;
        return 4;
    }
    
    function getTargetPeriode(periode) {
        if (!periode) return null;
        const [tahun, bulan] = periode.split('-');
        const triwulan = getTriwulanFromMonth(bulan);
        return `TRW${triwulan}_${tahun}`;
    }
    
    function formatRupiah(val, unit = 'auto') {
        if (val === null || val === undefined || isNaN(val)) return 'N/A';
        const abs = Math.abs(val);
        const sign = val < 0 ? '-' : '';
        
        if (unit === 'triliun' || (unit === 'auto' && abs >= 1e12)) {
            return `Rp${(abs / 1e12).toFixed(3).replace('.', ',')} triliun`;
        } else if (unit === 'miliar' || (unit === 'auto' && abs >= 1e9)) {
            return `Rp${(abs / 1e9).toFixed(2).replace('.', ',')} miliar`;
        } else if (unit === 'juta' || (unit === 'auto' && abs >= 1e6)) {
            return `Rp${(abs / 1e6).toFixed(2).replace('.', ',')} juta`;
        }
        return `Rp${abs.toLocaleString('id-ID')}`;
    }
    
    function formatPersen(val, decimals = 2) {
        if (val === null || val === undefined || isNaN(val)) return 'N/A';
        return `${val.toFixed(decimals)}%`;
    }
    
    function calcAchievement(realisasi, target) {
        if (!target || target === 0) return null;
        return (realisasi / target) * 100;
    }
    
    function calcYoY(current, prev) {
        if (!prev || prev === 0) return null;
        return ((current - prev) / Math.abs(prev)) * 100;
    }
    
    // ========================================
    // COLLECT DASHBOARD DATA
    // ========================================
    
    function collectDashboardData() {
        const filters = window.DashboardFirebase?.getFilters?.() || {};
        const data = window.DashboardFirebase?.getData?.() || {};
        const neracaData = data.neraca || [];
        const labarugiData = data.labarugi || [];
        const targetNeracaData = data.targetNeraca || [];
        const targetLabarugiData = data.targetLabarugi || [];
        
        const periode = filters.periode || '2025-11';
        const [tahun, bulan] = periode.split('-');
        const bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        // Previous year periode for YoY
        const prevYearPeriode = `${parseInt(tahun) - 1}-${bulan}`;
        
        // Target periode: TRW format
        const targetPeriode = getTargetPeriode(periode);
        const triwulan = getTriwulanFromMonth(bulan);
        const triwulanRomawi = ['I', 'II', 'III', 'IV'][triwulan - 1];
        
        // Determine kode based on filter
        let kode = 'ALL';
        let tipeLabel = 'Konsolidasi';
        if (filters.cabang && filters.cabang !== 'ALL') {
            kode = filters.cabang;
            const cabangInfo = neracaData.find(d => d.kode_cabang === kode && !d.is_ratio);
            tipeLabel = cabangInfo?.nama_cabang || `Cabang ${kode}`;
        } else if (filters.tipe === 'konvensional') {
            kode = 'KON';
            tipeLabel = 'Konvensional';
        } else if (filters.tipe === 'syariah') {
            kode = 'SYR';
            tipeLabel = 'Syariah';
        }
        
        console.log(`📊 AI Report: Periode=${periode}, YoY=${prevYearPeriode}, Target=${targetPeriode}, Kode=${kode}`);
        
        // ==========================================
        // HELPER: Get Value from Data
        // ==========================================
        
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
        
        function getTarget(sandi, source = 'neraca') {
            const dataSource = source === 'neraca' ? targetNeracaData : targetLabarugiData;
            const item = dataSource.find(d => 
                d.kode_cabang === kode && 
                d.periode === targetPeriode && 
                d.sandi === sandi
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
        
        function getTargetByPrefix(prefix, source = 'neraca') {
            const dataSource = source === 'neraca' ? targetNeracaData : targetLabarugiData;
            return dataSource
                .filter(d => d.kode_cabang === kode && d.periode === targetPeriode && 
                            d.sandi && d.sandi.startsWith(prefix))
                .reduce((sum, d) => sum + (d.total || 0), 0);
        }
        
        function getRatio(ratioName) {
            const ratioItem = neracaData.find(d => 
                d.kode_cabang === kode && 
                d.periode === periode && 
                d.is_ratio === true &&
                (d.ratio_name || '').toUpperCase() === ratioName.toUpperCase()
            );
            return ratioItem ? (ratioItem.value || 0) * 100 : null;
        }
        
        function getRatioYoY(ratioName) {
            const ratioItem = neracaData.find(d => 
                d.kode_cabang === kode && 
                d.periode === prevYearPeriode && 
                d.is_ratio === true &&
                (d.ratio_name || '').toUpperCase() === ratioName.toUpperCase()
            );
            return ratioItem ? (ratioItem.value || 0) * 100 : null;
        }
        
        function getTargetRatio(ratioName) {
            const ratioItem = targetNeracaData.find(d => 
                d.kode_cabang === kode && 
                d.periode === targetPeriode && 
                d.is_ratio === true &&
                (d.ratio_name || '').toUpperCase() === ratioName.toUpperCase()
            );
            return ratioItem ? (ratioItem.value || 0) * 100 : null;
        }
        
        // ==========================================
        // A. TOTAL ASET
        // ==========================================
        const totalAset = getValue('01.00.00.00.00.00');
        const totalAsetYoY = getValue('01.00.00.00.00.00', 'neraca', prevYearPeriode);
        const totalAsetTarget = getTarget('01.00.00.00.00.00');
        
        // ==========================================
        // B. KREDIT & PEMBIAYAAN
        // ==========================================
        const kredit = getValue('01.09.01.00.00.00');
        const kreditYoY = getValue('01.09.01.00.00.00', 'neraca', prevYearPeriode);
        const kreditTarget = getTarget('01.09.01.00.00.00');
        
        const pembiayaan = getValueByPrefix('01.09.03');
        const pembiayaanYoY = getValueByPrefix('01.09.03', 'neraca', prevYearPeriode);
        const pembiayaanTarget = getTargetByPrefix('01.09.03');
        
        const kreditPembiayaan = kredit + pembiayaan;
        const kreditPembiayaanYoY = kreditYoY + pembiayaanYoY;
        const kreditPembiayaanTarget = kreditTarget + pembiayaanTarget;
        
        // ==========================================
        // C. DANA PIHAK KETIGA (DPK)
        // ==========================================
        const giroKonven = getValue('02.01.01.00.00.00');
        const tabunganKonven = getValue('02.02.01.00.00.00');
        const depositoKonven = getValue('02.03.01.00.00.00');
        const giroSyariah = getValueByPrefix('02.01.02');
        const tabunganSyariah = getValueByPrefix('02.02.02');
        const depositoSyariah = getValueByPrefix('02.03.02');
        const dpk = giroKonven + tabunganKonven + depositoKonven + giroSyariah + tabunganSyariah + depositoSyariah;
        
        const giroKonvenYoY = getValue('02.01.01.00.00.00', 'neraca', prevYearPeriode);
        const tabunganKonvenYoY = getValue('02.02.01.00.00.00', 'neraca', prevYearPeriode);
        const depositoKonvenYoY = getValue('02.03.01.00.00.00', 'neraca', prevYearPeriode);
        const giroSyariahYoY = getValueByPrefix('02.01.02', 'neraca', prevYearPeriode);
        const tabunganSyariahYoY = getValueByPrefix('02.02.02', 'neraca', prevYearPeriode);
        const depositoSyariahYoY = getValueByPrefix('02.03.02', 'neraca', prevYearPeriode);
        const dpkYoY = giroKonvenYoY + tabunganKonvenYoY + depositoKonvenYoY + giroSyariahYoY + tabunganSyariahYoY + depositoSyariahYoY;
        
        const dpkTarget = getTarget('02.01.01.00.00.00') + getTarget('02.02.01.00.00.00') + getTarget('02.03.01.00.00.00') +
                          getTargetByPrefix('02.01.02') + getTargetByPrefix('02.02.02') + getTargetByPrefix('02.03.02');
        
        // ==========================================
        // D. PENDAPATAN
        // ==========================================
        const pendapatanBunga = Math.abs(getValue('04.11.00.00.00.00', 'labarugi')) || Math.abs(getValueByPrefix('04.11', 'labarugi'));
        const pendapatanOpLain = Math.abs(getValue('04.12.00.00.00.00', 'labarugi')) || Math.abs(getValueByPrefix('04.12', 'labarugi'));
        const pendapatanNonOp = Math.abs(getValue('04.20.00.00.00.00', 'labarugi')) || Math.abs(getValueByPrefix('04.20', 'labarugi'));
        const totalPendapatan = pendapatanBunga + pendapatanOpLain + pendapatanNonOp;
        
        const pendapatanBungaYoY = Math.abs(getValue('04.11.00.00.00.00', 'labarugi', prevYearPeriode)) || Math.abs(getValueByPrefix('04.11', 'labarugi', prevYearPeriode));
        const pendapatanOpLainYoY = Math.abs(getValue('04.12.00.00.00.00', 'labarugi', prevYearPeriode)) || Math.abs(getValueByPrefix('04.12', 'labarugi', prevYearPeriode));
        const pendapatanNonOpYoY = Math.abs(getValue('04.20.00.00.00.00', 'labarugi', prevYearPeriode)) || Math.abs(getValueByPrefix('04.20', 'labarugi', prevYearPeriode));
        const totalPendapatanYoY = pendapatanBungaYoY + pendapatanOpLainYoY + pendapatanNonOpYoY;
        
        const totalPendapatanTarget = Math.abs(getTarget('04.11.00.00.00.00', 'labarugi')) + 
                                      Math.abs(getTarget('04.12.00.00.00.00', 'labarugi')) + 
                                      Math.abs(getTarget('04.20.00.00.00.00', 'labarugi'));
        
        // ==========================================
        // E. BIAYA
        // ==========================================
        const bebanBunga = Math.abs(getValue('05.11.00.00.00.00', 'labarugi')) || Math.abs(getValueByPrefix('05.11', 'labarugi'));
        const bebanOpLain = Math.abs(getValue('05.12.00.00.00.00', 'labarugi')) || Math.abs(getValueByPrefix('05.12', 'labarugi'));
        const bebanNonOp = Math.abs(getValue('05.20.00.00.00.00', 'labarugi')) || Math.abs(getValueByPrefix('05.20', 'labarugi'));
        const totalBiaya = bebanBunga + bebanOpLain + bebanNonOp;
        
        const bebanBungaYoY = Math.abs(getValue('05.11.00.00.00.00', 'labarugi', prevYearPeriode)) || Math.abs(getValueByPrefix('05.11', 'labarugi', prevYearPeriode));
        const bebanOpLainYoY = Math.abs(getValue('05.12.00.00.00.00', 'labarugi', prevYearPeriode)) || Math.abs(getValueByPrefix('05.12', 'labarugi', prevYearPeriode));
        const bebanNonOpYoY = Math.abs(getValue('05.20.00.00.00.00', 'labarugi', prevYearPeriode)) || Math.abs(getValueByPrefix('05.20', 'labarugi', prevYearPeriode));
        const totalBiayaYoY = bebanBungaYoY + bebanOpLainYoY + bebanNonOpYoY;
        
        const totalBiayaTarget = Math.abs(getTarget('05.11.00.00.00.00', 'labarugi')) + 
                                 Math.abs(getTarget('05.12.00.00.00.00', 'labarugi')) + 
                                 Math.abs(getTarget('05.20.00.00.00.00', 'labarugi'));
        
        // ==========================================
        // F. LABA RUGI SEBELUM PAJAK
        // ==========================================
        const labaSebelumPajakPos = getValue('03.05.02.01.10.00', 'labarugi');
        const rugiSebelumPajakPos = Math.abs(getValue('03.05.02.02.10.00', 'labarugi'));
        const labaSebelumPajak = labaSebelumPajakPos - rugiSebelumPajakPos;
        
        const labaSebelumPajakPosYoY = getValue('03.05.02.01.10.00', 'labarugi', prevYearPeriode);
        const rugiSebelumPajakPosYoY = Math.abs(getValue('03.05.02.02.10.00', 'labarugi', prevYearPeriode));
        const labaSebelumPajakYoY = labaSebelumPajakPosYoY - rugiSebelumPajakPosYoY;
        
        const labaSebelumPajakTargetPos = getTarget('03.05.02.01.10.00', 'labarugi');
        const rugiSebelumPajakTargetPos = Math.abs(getTarget('03.05.02.02.10.00', 'labarugi'));
        const labaSebelumPajakTarget = labaSebelumPajakTargetPos - rugiSebelumPajakTargetPos;
        
        // ==========================================
        // G. LABA RUGI SETELAH PAJAK
        // ==========================================
        const labaBersihPos = getValue('03.05.02.01.00.00', 'labarugi');
        const rugiBersihPos = Math.abs(getValue('03.05.02.02.00.00', 'labarugi'));
        const labaBersih = labaBersihPos - rugiBersihPos;
        
        const labaBersihPosYoY = getValue('03.05.02.01.00.00', 'labarugi', prevYearPeriode);
        const rugiBersihPosYoY = Math.abs(getValue('03.05.02.02.00.00', 'labarugi', prevYearPeriode));
        const labaBersihYoY = labaBersihPosYoY - rugiBersihPosYoY;
        
        const labaBersihTargetPos = getTarget('03.05.02.01.00.00', 'labarugi');
        const rugiBersihTargetPos = Math.abs(getTarget('03.05.02.02.00.00', 'labarugi'));
        const labaBersihTarget = labaBersihTargetPos - rugiBersihTargetPos;
        
        // ==========================================
        // H-N. RASIO KEUANGAN
        // ==========================================
        
        // Calculate LDR manually if not available
        const ldrCalc = dpk > 0 ? (kreditPembiayaan / dpk * 100) : 0;
        const ldrCalcYoY = dpkYoY > 0 ? (kreditPembiayaanYoY / dpkYoY * 100) : 0;
        
        // Calculate CASA manually if not available
        const casaCalc = dpk > 0 ? ((giroKonven + tabunganKonven + giroSyariah + tabunganSyariah) / dpk * 100) : 0;
        const casaCalcYoY = dpkYoY > 0 ? ((giroKonvenYoY + tabunganKonvenYoY + giroSyariahYoY + tabunganSyariahYoY) / dpkYoY * 100) : 0;
        
        const ratios = {
            car: {
                nama: 'KPMM (CAR)',
                realisasi: getRatio('CAR') || getRatio('KPMM'),
                yoy: getRatioYoY('CAR') || getRatioYoY('KPMM'),
                target: getTargetRatio('CAR') || getTargetRatio('KPMM') || 24.04
            },
            roe: {
                nama: 'Return On Equity (ROE)',
                realisasi: getRatio('ROE'),
                yoy: getRatioYoY('ROE'),
                target: getTargetRatio('ROE') || 10
            },
            roa: {
                nama: 'Return On Asset (ROA)',
                realisasi: getRatio('ROA'),
                yoy: getRatioYoY('ROA'),
                target: getTargetRatio('ROA') || 2.13
            },
            nim: {
                nama: 'Net Interest Margin (NIM)',
                realisasi: getRatio('NIM'),
                yoy: getRatioYoY('NIM'),
                target: getTargetRatio('NIM') || 5.28
            },
            bopo: {
                nama: 'Biaya Operasional berbanding Pendapatan Operasional (BOPO)',
                realisasi: getRatio('BOPO'),
                yoy: getRatioYoY('BOPO'),
                target: getTargetRatio('BOPO') || 76.97
            },
            ldr: {
                nama: 'LDR',
                realisasi: getRatio('LDR') || ldrCalc,
                yoy: getRatioYoY('LDR') || ldrCalcYoY,
                target: getTargetRatio('LDR') || 106.98
            },
            npl: {
                nama: 'NPL Gross',
                realisasi: getRatio('NPL'),
                yoy: getRatioYoY('NPL'),
                target: getTargetRatio('NPL') || 1.98
            }
        };
        
        // ==========================================
        // RETURN DATA
        // ==========================================
        
        return {
            periode: {
                bulan: bulanNames[parseInt(bulan)],
                tahun: tahun,
                full: `${bulanNames[parseInt(bulan)]} ${tahun}`,
                prevYear: `${bulanNames[parseInt(bulan)]} ${parseInt(tahun) - 1}`,
                triwulan: triwulan,
                triwulanLabel: `Triwulan ${triwulanRomawi} – ${tahun}`,
                targetPeriode: targetPeriode
            },
            tipe: tipeLabel,
            kodeCabang: kode,
            
            // Neraca & Laba Rugi
            indicators: {
                totalAset: { realisasi: totalAset, target: totalAsetTarget, yoy: totalAsetYoY },
                kreditPembiayaan: { realisasi: kreditPembiayaan, target: kreditPembiayaanTarget, yoy: kreditPembiayaanYoY },
                dpk: { realisasi: dpk, target: dpkTarget, yoy: dpkYoY },
                pendapatan: { realisasi: totalPendapatan, target: totalPendapatanTarget, yoy: totalPendapatanYoY },
                biaya: { realisasi: totalBiaya, target: totalBiayaTarget, yoy: totalBiayaYoY },
                labaSebelumPajak: { realisasi: labaSebelumPajak, target: labaSebelumPajakTarget, yoy: labaSebelumPajakYoY },
                labaSetelahPajak: { realisasi: labaBersih, target: labaBersihTarget, yoy: labaBersihYoY }
            },
            
            // Rasio
            ratios: ratios,
            
            // Additional data for analysis
            additional: {
                giro: giroKonven + giroSyariah,
                tabungan: tabunganKonven + tabunganSyariah,
                deposito: depositoKonven + depositoSyariah,
                casa: casaCalc,
                casaYoY: casaCalcYoY
            }
        };
    }
    
    // ========================================
    // BUILD PROMPT
    // ========================================
    
    function buildPrompt(data) {
        const { periode, tipe, indicators, ratios, additional } = data;
        
        // Format indicator text
        function formatIndicator(letter, nama, ind, unit) {
            const ach = calcAchievement(ind.realisasi, ind.target);
            const yoyPct = calcYoY(ind.realisasi, ind.yoy);
            const changeWord = yoyPct >= 0 ? 'peningkatan' : 'penurunan';
            
            return `${letter}. Realisasi ${nama} pada ${periode.full} tercatat sebesar ${formatRupiah(ind.realisasi, unit)}, dengan pencapaian sebesar ${formatPersen(ach)} dari target ${periode.full} sebesar ${formatRupiah(ind.target, unit)}, dan mengalami ${changeWord} sebesar ${formatPersen(Math.abs(yoyPct))} yoy dibandingkan Realisasi ${periode.prevYear} yang sebesar ${formatRupiah(ind.yoy, unit)}.`;
        }
        
        // Format ratio text
        function formatRatio(letter, ratio, isLowerBetter = false) {
            if (ratio.realisasi === null) return '';
            
            const diff = ratio.realisasi - ratio.target;
            const yoyDiff = ratio.yoy !== null ? (ratio.realisasi - ratio.yoy) : null;
            
            let targetStatus;
            if (isLowerBetter) {
                targetStatus = diff <= 0 
                    ? `dibawah target sebesar ${formatPersen(Math.abs(diff))}`
                    : `melampaui target sebesar ${formatPersen(Math.abs(diff))}`;
            } else {
                targetStatus = diff >= 0 
                    ? `melampaui target ${formatPersen(Math.abs(diff))}`
                    : `deviasi sebesar ${formatPersen(Math.abs(diff))}`;
            }
            
            let yoyStatus = '';
            if (yoyDiff !== null) {
                const yoyWord = yoyDiff >= 0 ? 'peningkatan' : 'penurunan';
                yoyStatus = ` dan mengalami ${yoyWord} sebesar ${formatPersen(Math.abs(yoyDiff))} dibandingkan ${periode.prevYear}`;
            }
            
            return `${letter}. Realisasi Rasio ${ratio.nama} sebesar ${formatPersen(ratio.realisasi)} dari proyeksi sebesar ${formatPersen(ratio.target)}, atau ${targetStatus}${yoyStatus}.`;
        }
        
        // Build all indicators
        const indicatorTexts = [
            formatIndicator('a', 'Total Aset', indicators.totalAset, 'triliun'),
            formatIndicator('b', 'Kredit & Pembiayaan', indicators.kreditPembiayaan, 'triliun'),
            formatIndicator('c', 'Dana Pihak Ketiga (DPK)', indicators.dpk, 'triliun'),
            formatIndicator('d', 'Pendapatan', indicators.pendapatan, 'miliar'),
            formatIndicator('e', 'Biaya', indicators.biaya, 'miliar'),
            formatIndicator('f', 'Laba Rugi Sebelum Pajak', indicators.labaSebelumPajak, 'miliar'),
            formatIndicator('g', 'Laba Rugi Setelah Pajak', indicators.labaSetelahPajak, 'miliar')
        ].join('\n\n');
        
        // Build ratio texts
        const ratioTexts = [
            formatRatio('h', ratios.car, false),
            formatRatio('i', ratios.roe, false),
            formatRatio('j', ratios.roa, false),
            formatRatio('k', ratios.nim, false),
            formatRatio('l', ratios.bopo, true), // lower is better
            formatRatio('m', ratios.ldr, false),
            formatRatio('n', ratios.npl, true)   // lower is better
        ].filter(t => t).join('\n\n');
        
        return `Anda adalah analis keuangan senior PT Bank Pembangunan Daerah Sulawesi Selatan dan Sulawesi Barat (Bank Sulselbar).

TUGAS: Buat laporan kinerja keuangan dengan format PERSIS seperti contoh di bawah. JANGAN menambahkan analisis atau rekomendasi lain. Hanya gunakan format yang diberikan.

═══════════════════════════════════════════════════════════════════════════════
LAPORAN KINERJA KEUANGAN BANK SULSELBAR
PERIODE: ${periode.full.toUpperCase()}
UNIT: ${tipe.toUpperCase()}
═══════════════════════════════════════════════════════════════════════════════

DATA NERACA DAN LABA RUGI (sudah dalam format yang benar):

${indicatorTexts}

DATA RASIO KEUANGAN (perlu ditambahkan penjelasan kondisi penyebab):

${ratioTexts}

═══════════════════════════════════════════════════════════════════════════════

INSTRUKSI PENTING:

1. UNTUK INDIKATOR a-g (Neraca & Laba Rugi):
   - Gunakan PERSIS teks yang sudah diberikan di atas
   - TIDAK perlu mengubah atau menambahkan apapun
   - Format sudah benar, langsung salin

2. UNTUK INDIKATOR h-n (Rasio Keuangan):
   - Gunakan teks yang sudah diberikan sebagai AWAL kalimat
   - TAMBAHKAN penjelasan kondisi/penyebab di AKHIR setiap poin
   - Contoh penjelasan yang baik:
     * "Kondisi ini disebabkan oleh..."
     * "Deviasi tersebut disebabkan..."
     * "Pelampauan/Penurunan tersebut karena..."

3. DATA TAMBAHAN untuk analisis rasio:
   - CASA Ratio: ${formatPersen(additional.casa)} (tahun lalu: ${formatPersen(additional.casaYoY)})
   - Komposisi DPK: Giro ${formatRupiah(additional.giro, 'triliun')}, Tabungan ${formatRupiah(additional.tabungan, 'triliun')}, Deposito ${formatRupiah(additional.deposito, 'triliun')}
   - Pencapaian Laba Bersih: ${formatPersen(calcAchievement(indicators.labaSetelahPajak.realisasi, indicators.labaSetelahPajak.target))}

4. OUTPUT dalam format HTML:
   - Setiap poin dalam tag <p>
   - Bold untuk angka-angka penting menggunakan <strong>
   - JANGAN gunakan bullet points atau list
   - JANGAN tambahkan judul section
   - JANGAN tambahkan ringkasan atau kesimpulan
   - JANGAN tambahkan rekomendasi

5. PENTING:
   - SEMUA angka harus SAMA PERSIS dengan data yang diberikan
   - Format angka: Rp[X,XXX] triliun/miliar, [X,XX]%
   - Gunakan koma (,) sebagai pemisah desimal

OUTPUT: Hanya 14 paragraf (a sampai n) dalam format HTML, tanpa tambahan apapun.`;
    }
    
    // ========================================
    // CALL API
    // ========================================
    
    async function callClaudeAPI(prompt) {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        
        const result = await response.json();
        
        if (!response.ok || result.error) {
            throw new Error(result.error || `API Error: ${response.status}`);
        }
        
        return result.content;
    }
    
    // ========================================
    // GENERATE REPORT
    // ========================================
    
    async function generateReport() {
        if (isGenerating) {
            showToast('Report sedang di-generate...', 'warning');
            return;
        }
        
        isGenerating = true;
        updateUIGenerating(true);
        
        try {
            const data = collectDashboardData();
            console.log('📊 Report Data:', data);
            
            const prompt = buildPrompt(data);
            console.log('📝 Prompt length:', prompt.length);
            
            const reportHtml = await callClaudeAPI(prompt);
            
            lastReport = { data, html: reportHtml };
            displayReport(reportHtml, data);
            
            showToast('Report berhasil di-generate!', 'success');
            
        } catch (error) {
            console.error('Generate error:', error);
            displayError(error.message);
            showToast('Gagal generate report: ' + error.message, 'error');
        } finally {
            isGenerating = false;
            updateUIGenerating(false);
        }
    }
    
    // ========================================
    // DISPLAY
    // ========================================
    
    function displayReport(reportHtml, data) {
        const container = document.getElementById('aiReportContent');
        if (!container) return;
        
        const now = new Date();
        const timestamp = now.toLocaleString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        
        container.innerHTML = `
            <div class="ai-report">
                <div class="report-header" style="background: linear-gradient(135deg, #1e3a5f 0%, #2e7d32 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0; font-size: 1.4rem;">LAPORAN KINERJA KEUANGAN</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">PT Bank Pembangunan Daerah Sulawesi Selatan dan Sulawesi Barat</p>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Periode: ${data.periode.full} | ${data.tipe}</p>
                    <p style="margin: 10px 0 0 0; font-size: 0.8rem; opacity: 0.7;">Generated: ${timestamp}</p>
                </div>
                
                <div class="report-body" style="padding: 25px; background: white; line-height: 1.9; text-align: justify;">
                    ${reportHtml}
                </div>
                
                <div class="report-footer" style="padding: 15px 20px; background: #f8f9fa; border-radius: 0 0 8px 8px; font-size: 0.85rem; color: #666;">
                    <p style="margin: 0;"><em>Laporan ini di-generate berdasarkan data dashboard periode ${data.periode.full}. 
                    Target berdasarkan RKAP ${data.periode.triwulanLabel}. 
                    Perbandingan YoY dengan periode ${data.periode.prevYear}.</em></p>
                </div>
            </div>
        `;
        
        const exportBtns = document.getElementById('exportButtons');
        if (exportBtns) exportBtns.style.display = 'flex';
    }
    
    function displayError(message) {
        const container = document.getElementById('aiReportContent');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 3rem; color: #ef4444;">⚠️</div>
                <h3 style="margin: 15px 0;">Gagal Generate Report</h3>
                <p style="color: #666;">${message}</p>
                <button onclick="AIReportGenerator.generate()" 
                    style="margin-top: 15px; padding: 10px 20px; background: #2e7d32; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Coba Lagi
                </button>
            </div>
        `;
    }
    
    function updateUIGenerating(generating) {
        const btn = document.getElementById('generateReportBtn');
        const loader = document.getElementById('reportLoader');
        
        if (btn) {
            btn.disabled = generating;
            btn.innerHTML = generating 
                ? '<i class="fas fa-spinner fa-spin"></i> Generating...'
                : '<i class="fas fa-robot"></i> Generate AI Report';
        }
        
        if (loader) loader.style.display = generating ? 'flex' : 'none';
    }
    
    // ========================================
    // EXPORT
    // ========================================
    
    async function exportPDF() {
        if (!lastReport) {
            showToast('Belum ada report untuk di-export', 'warning');
            return;
        }
        
        showToast('Mempersiapkan PDF...', 'info');
        
        try {
            const element = document.querySelector('.ai-report');
            if (!element) throw new Error('Report element not found');
            
            if (typeof html2pdf !== 'undefined') {
                await html2pdf().set({
                    margin: [10, 10, 10, 10],
                    filename: `Laporan_Kinerja_${lastReport.data.periode.full.replace(' ', '_')}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                }).from(element).save();
                showToast('PDF berhasil di-download!', 'success');
            } else {
                window.print();
            }
        } catch (error) {
            showToast('Gagal export PDF: ' + error.message, 'error');
        }
    }
    
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

window.AIReportGenerator = AIReportGenerator;

console.log('🤖 AI Report Generator v3.1 loaded - Format Bahasa Resmi Bank Sulselbar');
