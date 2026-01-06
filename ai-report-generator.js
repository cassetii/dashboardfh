// ========================================
// AI EXECUTIVE REPORT GENERATOR
// Analytics Section - Bank Sulselbar Dashboard
// Version: 2.0 - With Firebase Targets & Filter
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
    // HELPER: Convert Month to Triwulan
    // ========================================
    
    function getTriwulanFromMonth(month) {
        const m = parseInt(month);
        if (m >= 1 && m <= 3) return 1;
        if (m >= 4 && m <= 6) return 2;
        if (m >= 7 && m <= 9) return 3;
        return 4; // 10-12
    }
    
    function getTargetPeriode(periode) {
        if (!periode) return null;
        const [tahun, bulan] = periode.split('-');
        const triwulan = getTriwulanFromMonth(bulan);
        return `TRW${triwulan}_${tahun}`;
    }
    
    // ========================================
    // COLLECT DASHBOARD DATA WITH TARGETS
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
        
        // Target periode: TRW4_2025 for November
        const targetPeriode = getTargetPeriode(periode);
        const triwulan = getTriwulanFromMonth(bulan);
        
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
        
        console.log(`📊 AI Report: Periode=${periode}, TargetPeriode=${targetPeriode}, Kode=${kode}`);
        
        // ==========================================
        // HELPER FUNCTIONS
        // ==========================================
        
        function getValue(sandi, source = 'neraca') {
            const dataSource = source === 'neraca' ? neracaData : labarugiData;
            const item = dataSource.find(d => 
                d.kode_cabang === kode && 
                d.periode === periode && 
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
        
        function getValueByPrefix(prefix, source = 'neraca') {
            const dataSource = source === 'neraca' ? neracaData : labarugiData;
            return dataSource
                .filter(d => d.kode_cabang === kode && d.periode === periode && 
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
        
        // Format helpers
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
        
        function calcAchievement(current, target) {
            if (!target || target === 0) return null;
            return (current / target * 100);
        }
        
        function calcDeviation(current, target) {
            if (!target) return null;
            return current - target;
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
        
        // ==========================================
        // REALISASI DATA
        // ==========================================
        const totalAset = getValue('01.00.00.00.00.00');
        const kredit = getValue('01.09.01.00.00.00');
        const pembiayaan = getValueByPrefix('01.09.03');
        
        // DPK
        const giro = getValue('02.01.01.00.00.00') + getValueByPrefix('02.01.02');
        const tabungan = getValue('02.02.01.00.00.00') + getValueByPrefix('02.02.02');
        const deposito = getValue('02.03.01.00.00.00') + getValueByPrefix('02.03.02');
        const dpk = giro + tabungan + deposito;
        
        const modal = getValue('03.00.00.00.00.00');
        
        // Laba Sebelum Pajak
        const labaSebelumPajakPos = getValue('03.05.02.01.10.00', 'labarugi');
        const rugiSebelumPajakPos = Math.abs(getValue('03.05.02.02.10.00', 'labarugi'));
        const labaSebelumPajak = labaSebelumPajakPos - rugiSebelumPajakPos;
        
        // ==========================================
        // TARGET DATA FROM FIREBASE
        // ==========================================
        const targetTotalAset = getTarget('01.00.00.00.00.00');
        const targetKredit = getTarget('01.09.01.00.00.00');
        const targetPembiayaan = getTargetByPrefix('01.09.03');
        
        // DPK Target
        const targetGiro = getTarget('02.01.01.00.00.00') + getTargetByPrefix('02.01.02');
        const targetTabungan = getTarget('02.02.01.00.00.00') + getTargetByPrefix('02.02.02');
        const targetDeposito = getTarget('02.03.01.00.00.00') + getTargetByPrefix('02.03.02');
        const targetDPK = targetGiro + targetTabungan + targetDeposito;
        
        const targetModal = getTarget('03.00.00.00.00.00');
        
        // Laba Target
        const targetLabaPos = getTarget('03.05.02.01.10.00', 'labarugi');
        const targetRugiPos = Math.abs(getTarget('03.05.02.02.10.00', 'labarugi'));
        const targetLaba = targetLabaPos - targetRugiPos;
        
        console.log(`📊 Targets loaded: Aset=${formatTriliun(targetTotalAset)}, Kredit=${formatTriliun(targetKredit)}, DPK=${formatTriliun(targetDPK)}`);
        
        // ==========================================
        // RATIOS FROM EXCEL
        // ==========================================
        function getRatioFromExcel(ratioName) {
            const ratioItem = neracaData.find(d => 
                d.kode_cabang === kode && 
                d.periode === periode && 
                d.is_ratio === true &&
                (d.ratio_name || '').toUpperCase() === ratioName.toUpperCase()
            );
            
            // Fallback untuk cabang Syariah
            if (!ratioItem && ['510', '520', '530', '540', '500'].includes(kode)) {
                const fallback = neracaData.find(d => 
                    d.kode_cabang === 'SYR' && 
                    d.periode === periode && 
                    d.is_ratio === true &&
                    (d.ratio_name || '').toUpperCase() === ratioName.toUpperCase()
                );
                return fallback ? (fallback.value || 0) * 100 : null;
            }
            
            // Fallback untuk cabang Konvensional
            if (!ratioItem && !['510', '520', '530', '540', '500', 'SYR', 'KON', 'ALL'].includes(kode)) {
                const fallback = neracaData.find(d => 
                    d.kode_cabang === 'KON' && 
                    d.periode === periode && 
                    d.is_ratio === true &&
                    (d.ratio_name || '').toUpperCase() === ratioName.toUpperCase()
                );
                return fallback ? (fallback.value || 0) * 100 : null;
            }
            
            return ratioItem ? (ratioItem.value || 0) * 100 : null;
        }
        
        const ldr = getRatioFromExcel('LDR') || (dpk > 0 ? ((kredit + pembiayaan) / dpk * 100) : 0);
        const casa = getRatioFromExcel('CASA') || (dpk > 0 ? ((giro + tabungan) / dpk * 100) : 0);
        const bopo = getRatioFromExcel('BOPO') || 0;
        const npl = getRatioFromExcel('NPL') || 0;
        const roa = getRatioFromExcel('ROA') || 0;
        const roe = getRatioFromExcel('ROE') || 0;
        const nim = getRatioFromExcel('NIM') || 0;
        const car = getRatioFromExcel('CAR') || 0;
        
        // Ratio targets (regulatory)
        const ratioTargets = {
            ldr: { min: 78, max: 92, target: 85 },
            casa: { target: 40 },
            bopo: { target: 85 },
            npl: { target: 5 },
            roa: { target: 1.25 },
            roe: { target: 10 },
            nim: { target: 3.5 },
            car: { target: 12 }
        };
        
        // ==========================================
        // BUILD KPI WITH ACHIEVEMENT
        // ==========================================
        
        const kpiNeraca = [
            {
                nama: 'Total Aset',
                realisasi: totalAset,
                target: targetTotalAset,
                formatted: formatTriliun(totalAset),
                targetFormatted: formatTriliun(targetTotalAset),
                achievement: calcAchievement(totalAset, targetTotalAset),
                achievementFormatted: formatAchievement(calcAchievement(totalAset, targetTotalAset)),
                deviation: calcDeviation(totalAset, targetTotalAset),
                deviationFormatted: formatDeviation(calcDeviation(totalAset, targetTotalAset), true)
            },
            {
                nama: 'Kredit yang Diberikan',
                realisasi: kredit,
                target: targetKredit,
                formatted: formatTriliun(kredit),
                targetFormatted: formatTriliun(targetKredit),
                achievement: calcAchievement(kredit, targetKredit),
                achievementFormatted: formatAchievement(calcAchievement(kredit, targetKredit)),
                deviation: calcDeviation(kredit, targetKredit),
                deviationFormatted: formatDeviation(calcDeviation(kredit, targetKredit), true)
            },
            {
                nama: 'Pembiayaan Syariah',
                realisasi: pembiayaan,
                target: targetPembiayaan,
                formatted: formatTriliun(pembiayaan),
                targetFormatted: formatTriliun(targetPembiayaan),
                achievement: calcAchievement(pembiayaan, targetPembiayaan),
                achievementFormatted: formatAchievement(calcAchievement(pembiayaan, targetPembiayaan)),
                deviation: calcDeviation(pembiayaan, targetPembiayaan),
                deviationFormatted: formatDeviation(calcDeviation(pembiayaan, targetPembiayaan), true)
            },
            {
                nama: 'Dana Pihak Ketiga (DPK)',
                realisasi: dpk,
                target: targetDPK,
                formatted: formatTriliun(dpk),
                targetFormatted: formatTriliun(targetDPK),
                achievement: calcAchievement(dpk, targetDPK),
                achievementFormatted: formatAchievement(calcAchievement(dpk, targetDPK)),
                deviation: calcDeviation(dpk, targetDPK),
                deviationFormatted: formatDeviation(calcDeviation(dpk, targetDPK), true)
            },
            {
                nama: 'Modal (Ekuitas)',
                realisasi: modal,
                target: targetModal,
                formatted: formatTriliun(modal),
                targetFormatted: formatTriliun(targetModal),
                achievement: calcAchievement(modal, targetModal),
                achievementFormatted: formatAchievement(calcAchievement(modal, targetModal)),
                deviation: calcDeviation(modal, targetModal),
                deviationFormatted: formatDeviation(calcDeviation(modal, targetModal), true)
            },
            {
                nama: 'Laba Sebelum Pajak',
                realisasi: labaSebelumPajak,
                target: targetLaba,
                formatted: formatMiliar(labaSebelumPajak),
                targetFormatted: formatMiliar(targetLaba),
                achievement: calcAchievement(labaSebelumPajak, targetLaba),
                achievementFormatted: formatAchievement(calcAchievement(labaSebelumPajak, targetLaba)),
                deviation: calcDeviation(labaSebelumPajak, targetLaba),
                deviationFormatted: formatDeviation(calcDeviation(labaSebelumPajak, targetLaba), false)
            }
        ];
        
        // ==========================================
        // FILTER: Only < 90% or > 110%
        // ==========================================
        
        const outliers = kpiNeraca.filter(kpi => {
            if (kpi.achievement === null || kpi.target === 0) return false;
            return kpi.achievement < 90 || kpi.achievement > 110;
        });
        
        const excellent = outliers.filter(kpi => kpi.achievement > 110);
        const needsAttention = outliers.filter(kpi => kpi.achievement < 90);
        const normal = kpiNeraca.filter(kpi => {
            if (kpi.achievement === null || kpi.target === 0) return true;
            return kpi.achievement >= 90 && kpi.achievement <= 110;
        });
        
        // ==========================================
        // KPI RATIO
        // ==========================================
        
        const kpiRatio = {
            ldr: {
                nama: 'LDR (Loan to Deposit Ratio)',
                nilai: ldr.toFixed(2),
                target: `${ratioTargets.ldr.min}%-${ratioTargets.ldr.max}%`,
                status: ldr >= ratioTargets.ldr.min && ldr <= ratioTargets.ldr.max ? '✅ SEHAT' : (ldr > ratioTargets.ldr.max ? '⚠️ TINGGI' : '⚠️ RENDAH'),
                keterangan: ldr >= ratioTargets.ldr.min && ldr <= ratioTargets.ldr.max ? 'Dalam batas sehat' : 'Perlu perhatian'
            },
            casa: {
                nama: 'CASA Ratio',
                nilai: casa.toFixed(2),
                target: `≥${ratioTargets.casa.target}%`,
                status: casa >= ratioTargets.casa.target ? '✅ BAIK' : '⚠️ PERLU DITINGKATKAN',
                keterangan: casa >= ratioTargets.casa.target ? 'Mencapai target' : 'Di bawah target'
            },
            bopo: {
                nama: 'BOPO',
                nilai: bopo.toFixed(2),
                target: `≤${ratioTargets.bopo.target}%`,
                status: bopo <= ratioTargets.bopo.target ? '✅ EFISIEN' : (bopo <= 90 ? '⚠️ CUKUP' : '❌ TIDAK EFISIEN'),
                keterangan: bopo <= ratioTargets.bopo.target ? 'Operasional efisien' : 'Perlu efisiensi biaya'
            },
            npl: {
                nama: 'NPL (Non Performing Loan)',
                nilai: npl.toFixed(2),
                target: `≤${ratioTargets.npl.target}%`,
                status: npl <= ratioTargets.npl.target ? '✅ SEHAT' : '❌ BERISIKO',
                keterangan: npl <= ratioTargets.npl.target ? 'Kualitas kredit baik' : 'Risiko kredit tinggi'
            },
            roa: {
                nama: 'ROA (Return on Asset)',
                nilai: roa.toFixed(2),
                target: `≥${ratioTargets.roa.target}%`,
                status: roa >= ratioTargets.roa.target ? '✅ SANGAT BAIK' : (roa >= 1.0 ? '⚠️ BAIK' : '❌ KURANG'),
                keterangan: roa >= ratioTargets.roa.target ? 'Profitabilitas tinggi' : 'Perlu peningkatan laba'
            },
            roe: {
                nama: 'ROE (Return on Equity)',
                nilai: roe.toFixed(2),
                target: `≥${ratioTargets.roe.target}%`,
                status: roe >= ratioTargets.roe.target ? '✅ BAIK' : '⚠️ PERLU DITINGKATKAN',
                keterangan: roe >= ratioTargets.roe.target ? 'Return modal optimal' : 'Optimalisasi modal'
            },
            nim: {
                nama: 'NIM (Net Interest Margin)',
                nilai: nim.toFixed(2),
                target: `≥${ratioTargets.nim.target}%`,
                status: nim >= ratioTargets.nim.target ? '✅ BAIK' : '⚠️ PERLU DITINGKATKAN',
                keterangan: nim >= ratioTargets.nim.target ? 'Margin bunga optimal' : 'Perlu optimalisasi'
            },
            car: {
                nama: 'CAR/KPMM',
                nilai: car.toFixed(2),
                target: `≥${ratioTargets.car.target}%`,
                status: car >= ratioTargets.car.target ? '✅ MEMENUHI' : '❌ TIDAK MEMENUHI',
                keterangan: car >= ratioTargets.car.target ? 'Modal mencukupi' : 'Perlu penambahan modal'
            }
        };
        
        // ==========================================
        // DPK COMPOSITION
        // ==========================================
        const dpkComposition = {
            giro: { nilai: giro, formatted: formatTriliun(giro), share: dpk > 0 ? (giro / dpk * 100).toFixed(1) : 0 },
            tabungan: { nilai: tabungan, formatted: formatTriliun(tabungan), share: dpk > 0 ? (tabungan / dpk * 100).toFixed(1) : 0 },
            deposito: { nilai: deposito, formatted: formatTriliun(deposito), share: dpk > 0 ? (deposito / dpk * 100).toFixed(1) : 0 }
        };
        
        // ==========================================
        // SUMMARY OBJECT
        // ==========================================
        return {
            periode: {
                bulan: bulanNames[parseInt(bulan)],
                tahun: tahun,
                full: `${bulanNames[parseInt(bulan)]} ${tahun}`,
                triwulan: `TRW${triwulan}`,
                targetPeriode: targetPeriode
            },
            tipe: tipeLabel,
            kodeCabang: kode,
            
            // KPI Neraca with achievement
            kpiNeraca: kpiNeraca,
            
            // Filtered outliers
            excellent: excellent,
            needsAttention: needsAttention,
            normal: normal,
            
            // Ratios
            kpiRatio: kpiRatio,
            
            // DPK Composition
            dpkComposition: dpkComposition,
            
            // Raw values for additional analysis
            raw: {
                totalAset, kredit, pembiayaan, dpk, modal, labaSebelumPajak,
                giro, tabungan, deposito,
                ldr, casa, bopo, npl, roa, roe, nim, car
            }
        };
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
    // BUILD PROMPT WITH FILTERED DATA
    // ========================================
    
    function buildPrompt(data) {
        // Build KPI Table
        const kpiRows = data.kpiNeraca.map(kpi => 
            `│ ${kpi.nama.padEnd(25)} │ Rp ${kpi.formatted.padStart(12)} │ Rp ${kpi.targetFormatted.padStart(12)} │ ${kpi.achievementFormatted.padStart(10)} │ ${kpi.deviationFormatted.padStart(12)} │`
        ).join('\n');
        
        // Build Excellent List
        const excellentList = data.excellent.length > 0 
            ? data.excellent.map(kpi => `✅ ${kpi.nama}: ${kpi.achievementFormatted} (${kpi.deviationFormatted})`).join('\n')
            : 'Tidak ada indikator yang melebihi 110% dari target.';
        
        // Build Needs Attention List
        const attentionList = data.needsAttention.length > 0
            ? data.needsAttention.map(kpi => `⚠️ ${kpi.nama}: ${kpi.achievementFormatted} (${kpi.deviationFormatted})`).join('\n')
            : 'Tidak ada indikator yang di bawah 90% dari target.';
        
        // Build Ratio Table
        const ratioRows = Object.values(data.kpiRatio).map(r => 
            `│ ${r.nama.padEnd(30)} │ ${(r.nilai + '%').padStart(10)} │ ${r.target.padStart(12)} │ ${r.status.padStart(18)} │`
        ).join('\n');
        
        return `Anda adalah analis keuangan senior PT Bank Pembangunan Daerah Sulawesi Selatan dan Sulawesi Barat (Bank Sulselbar).

Berdasarkan data kinerja keuangan berikut, buatkan EXECUTIVE SUMMARY yang KOMPREHENSIF dan FOKUS untuk dilaporkan kepada Direksi dan Dewan Komisaris.

═══════════════════════════════════════════════════════════════════════════════
LAPORAN KINERJA KEUANGAN PERIODE ${data.periode.full.toUpperCase()} - ${data.tipe.toUpperCase()}
Target: ${data.periode.targetPeriode} (Triwulan ${data.periode.triwulan.replace('TRW', '')})
═══════════════════════════════════════════════════════════════════════════════

╔═══════════════════════════════════════════════════════════════════════════════╗
║                        📊 INDIKATOR KINERJA UTAMA (KPI)                        ║
╠═════════════════════════╦══════════════╦══════════════╦════════════╦══════════════╣
║ Indikator               ║ Realisasi    ║ Target       ║ Pencapaian ║ Deviasi      ║
╠═════════════════════════╬══════════════╬══════════════╬════════════╬══════════════╣
${kpiRows}
╚═════════════════════════╩══════════════╩══════════════╩════════════╩══════════════╝

═══════════════════════════════════════════════════════════════════════════════
🌟 HIGHLIGHT KINERJA (MELEBIHI TARGET >110%)
═══════════════════════════════════════════════════════════════════════════════
${excellentList}

═══════════════════════════════════════════════════════════════════════════════
⚠️ AREA PERLU PERHATIAN (DI BAWAH TARGET <90%)
═══════════════════════════════════════════════════════════════════════════════
${attentionList}

═══════════════════════════════════════════════════════════════════════════════
💰 KOMPOSISI DANA PIHAK KETIGA (DPK)
═══════════════════════════════════════════════════════════════════════════════
• Giro: Rp ${data.dpkComposition.giro.formatted} (${data.dpkComposition.giro.share}%)
• Tabungan: Rp ${data.dpkComposition.tabungan.formatted} (${data.dpkComposition.tabungan.share}%)
• Deposito: Rp ${data.dpkComposition.deposito.formatted} (${data.dpkComposition.deposito.share}%)
• CASA Ratio: ${data.raw.casa.toFixed(2)}%

═══════════════════════════════════════════════════════════════════════════════
📈 RASIO KEUANGAN
═══════════════════════════════════════════════════════════════════════════════
╠══════════════════════════════╬════════════╬══════════════╬════════════════════╣
${ratioRows}
╚══════════════════════════════╩════════════╩══════════════╩════════════════════╝

═══════════════════════════════════════════════════════════════════════════════

INSTRUKSI UNTUK LAPORAN:

1. RINGKASAN EKSEKUTIF (3-4 paragraf):
   - Gambaran umum kondisi keuangan bank periode ${data.periode.full}
   - Highlight pencapaian target ${data.periode.targetPeriode}
   - Posisi keuangan (aset, kredit, DPK, modal)
   - Profitabilitas dan efisiensi

2. TABEL KPI NERACA:
   - Tampilkan tabel lengkap dengan Realisasi, Target, Pencapaian %, dan Deviasi
   - Gunakan format HTML table yang rapi

3. ANALISIS KINERJA BERDASARKAN PENCAPAIAN TARGET:
   - FOKUS pada indikator yang MELEBIHI TARGET (>110%) - jelaskan faktor pendorong
   - FOKUS pada indikator yang DI BAWAH TARGET (<90%) - jelaskan penyebab dan rekomendasi
   - Indikator dalam range normal (90-110%) cukup disebutkan singkat
   
4. TABEL RASIO KEUANGAN:
   - Tampilkan tabel dengan Nilai, Target, Status
   - Berikan penjelasan singkat untuk setiap rasio

5. REKOMENDASI STRATEGIS:
   - Berdasarkan area yang perlu perhatian
   - Actionable dan specific

FORMAT OUTPUT:
- Gunakan HTML dengan styling inline
- Gunakan warna hijau (#10b981) untuk positif, merah (#ef4444) untuk negatif
- Tabel dengan border dan padding yang rapi
- Paragraf justified dengan line-height 1.8

CATATAN PENTING:
- Data YoY tidak tersedia karena keterbatasan data historis
- Fokus analisis pada PENCAPAIAN TARGET periode berjalan
- Laporan ini untuk DIREKSI dan DEWAN KOMISARIS, harus PROFESIONAL`;
    }
    
    async function callClaudeAPI(prompt) {
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
                    Target berdasarkan RKAP ${data.periode.targetPeriode}.
                    Mohon verifikasi dengan data sumber untuk pengambilan keputusan.</em></p>
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
            const element = document.querySelector('.ai-report');
            if (!element) throw new Error('Report element not found');
            
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `Executive_Report_${lastReport.data.periode.full.replace(' ', '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            if (typeof html2pdf !== 'undefined') {
                await html2pdf().set(opt).from(element).save();
                showToast('PDF berhasil di-download!', 'success');
            } else {
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

console.log('🤖 AI Report Generator v2.0 loaded - With Firebase Targets');
