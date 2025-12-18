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
        function getValue(sandi, source = 'neraca') {
            const dataSource = source === 'neraca' ? neracaData : labarugiData;
            const item = dataSource.find(d => 
                d.kode_cabang === kode && 
                d.periode === periode && 
                d.sandi === sandi
            );
            return item ? (item.total || 0) : 0;
        }
        
        function getValueByPrefix(prefix, source = 'neraca') {
            const dataSource = source === 'neraca' ? neracaData : labarugiData;
            return dataSource
                .filter(d => d.kode_cabang === kode && d.periode === periode && 
                            d.sandi && d.sandi.startsWith(prefix))
                .reduce((sum, d) => sum + (d.total || 0), 0);
        }
        
        // Format to readable number
        function formatTriliun(val) {
            return (val / 1e12).toFixed(2) + ' T';
        }
        
        function formatMiliar(val) {
            return (val / 1e9).toFixed(2) + ' M';
        }
        
        // Collect all metrics
        const totalAset = getValue('01.00.00.00.00.00');
        const kredit = getValue('01.09.01.00.00.00');
        const pembiayaan = getValueByPrefix('01.09.03');
        const suratBerharga = getValue('01.05.00.00.00.00');
        const kas = getValue('01.01.00.00.00.00');
        const giroBI = getValue('01.02.00.00.00.00');
        const penempatanBank = getValue('01.03.00.00.00.00');
        const ckpn = getValueByPrefix('01.12');
        const ati = getValue('01.14.01.00.00.00') + getValue('01.14.02.00.00.00');
        
        const giro = getValue('02.01.01.00.00.00') + getValueByPrefix('02.01.02');
        const tabungan = getValue('02.02.01.00.00.00') + getValueByPrefix('02.02.02');
        const deposito = getValue('02.03.01.00.00.00') + getValueByPrefix('02.03.02');
        const dpk = giro + tabungan + deposito;
        
        const modal = getValue('03.00.00.00.00.00');
        
        // Laba Rugi (if available)
        const labaBersih = getValue('03.05.02.01.00.00', 'labarugi') || 
                          getValue('99.00.00.00.00.00', 'labarugi') || 0;
        
        // Calculate ratios
        const ldr = dpk > 0 ? ((kredit + pembiayaan) / dpk * 100) : 0;
        const casa = dpk > 0 ? ((giro + tabungan) / dpk * 100) : 0;
        
        // Build summary object
        const summary = {
            periode: {
                bulan: bulanNames[parseInt(bulan)],
                tahun: tahun,
                full: `${bulanNames[parseInt(bulan)]} ${tahun}`
            },
            tipe: tipeLabel,
            kodeCabang: kode,
            
            neraca: {
                totalAset: {
                    nilai: totalAset,
                    formatted: formatTriliun(totalAset)
                },
                kredit: {
                    nilai: kredit,
                    formatted: formatTriliun(kredit)
                },
                pembiayaan: {
                    nilai: pembiayaan,
                    formatted: formatMiliar(pembiayaan)
                },
                suratBerharga: {
                    nilai: suratBerharga,
                    formatted: formatTriliun(suratBerharga)
                },
                kas: {
                    nilai: kas,
                    formatted: formatMiliar(kas)
                },
                penempatanBank: {
                    nilai: penempatanBank,
                    formatted: formatTriliun(penempatanBank)
                },
                ckpn: {
                    nilai: ckpn,
                    formatted: formatMiliar(ckpn)
                },
                ati: {
                    nilai: ati,
                    formatted: formatMiliar(ati)
                }
            },
            
            dpk: {
                total: {
                    nilai: dpk,
                    formatted: formatTriliun(dpk)
                },
                giro: {
                    nilai: giro,
                    formatted: formatTriliun(giro),
                    share: dpk > 0 ? (giro / dpk * 100).toFixed(1) : 0
                },
                tabungan: {
                    nilai: tabungan,
                    formatted: formatTriliun(tabungan),
                    share: dpk > 0 ? (tabungan / dpk * 100).toFixed(1) : 0
                },
                deposito: {
                    nilai: deposito,
                    formatted: formatTriliun(deposito),
                    share: dpk > 0 ? (deposito / dpk * 100).toFixed(1) : 0
                }
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
        return `Anda adalah analis keuangan senior PT Bank Pembangunan Daerah Sulawesi Selatan dan Sulawesi Barat (Bank Sulselbar) dengan pengalaman lebih dari 15 tahun.

Berdasarkan data kinerja keuangan berikut, buatkan EXECUTIVE SUMMARY yang KOMPREHENSIF dan PROFESIONAL untuk dilaporkan kepada Direksi dan Dewan Komisaris.

═══════════════════════════════════════════════════════════════
DATA KINERJA PERIODE ${data.periode.full.toUpperCase()} - ${data.tipe.toUpperCase()}
═══════════════════════════════════════════════════════════════

📊 POSISI KEUANGAN (NERACA):
┌─────────────────────────────────────────────────────────────┐
│ ASET                                                        │
├─────────────────────────────────────────────────────────────┤
│ Total Aset              : Rp ${data.neraca.totalAset.formatted.padStart(15)}                │
│ Kredit yang Diberikan   : Rp ${data.neraca.kredit.formatted.padStart(15)}                │
│ Pembiayaan Syariah      : Rp ${data.neraca.pembiayaan.formatted.padStart(15)}                │
│ Surat Berharga          : Rp ${data.neraca.suratBerharga.formatted.padStart(15)}                │
│ Penempatan Bank Lain    : Rp ${data.neraca.penempatanBank.formatted.padStart(15)}                │
│ Kas                     : Rp ${data.neraca.kas.formatted.padStart(15)}                │
│ CKPN (Cadangan)         : Rp ${data.neraca.ckpn.formatted.padStart(15)}                │
│ ATI Bersih              : Rp ${data.neraca.ati.formatted.padStart(15)}                │
└─────────────────────────────────────────────────────────────┘

💰 DANA PIHAK KETIGA (DPK):
┌─────────────────────────────────────────────────────────────┐
│ Total DPK               : Rp ${data.dpk.total.formatted.padStart(15)}                │
├─────────────────────────────────────────────────────────────┤
│ • Giro                  : Rp ${data.dpk.giro.formatted.padStart(15)} (${data.dpk.giro.share}%)      │
│ • Tabungan              : Rp ${data.dpk.tabungan.formatted.padStart(15)} (${data.dpk.tabungan.share}%)      │
│ • Deposito              : Rp ${data.dpk.deposito.formatted.padStart(15)} (${data.dpk.deposito.share}%)      │
└─────────────────────────────────────────────────────────────┘

🏦 PERMODALAN & PROFITABILITAS:
┌─────────────────────────────────────────────────────────────┐
│ Modal                   : Rp ${data.modal.formatted.padStart(15)}                │
│ Laba Bersih             : Rp ${data.labaRugi.labaBersih.formatted.padStart(15)}                │
└─────────────────────────────────────────────────────────────┘

📈 RASIO KEUANGAN:
┌─────────────────────────────────────────────────────────────┐
│ LDR (Loan to Deposit)   : ${data.ratio.ldr.nilai}% [${data.ratio.ldr.status}]              │
│   → Batas Regulasi      : ${data.ratio.ldr.batasMin}% - ${data.ratio.ldr.batasMax}%                        │
│ CASA Ratio              : ${data.ratio.casa.nilai}% [${data.ratio.casa.status}]   │
│   → Target Internal     : >${data.ratio.casa.target}%                              │
└─────────────────────────────────────────────────────────────┘

📊 KOMPOSISI PORTOFOLIO ASET:
┌─────────────────────────────────────────────────────────────┐
│ Kredit & Pembiayaan     : ${data.komposisiAset.kredit}%                           │
│ Surat Berharga          : ${data.komposisiAset.suratBerharga}%                           │
│ Penempatan Bank Lain    : ${data.komposisiAset.penempatanBank}%                           │
│ Aset Lainnya            : ${data.komposisiAset.lainnya}%                           │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
INSTRUKSI PEMBUATAN LAPORAN EKSEKUTIF
═══════════════════════════════════════════════════════════════

Buatkan laporan EXECUTIVE SUMMARY dalam format HTML dengan struktur berikut.
Gunakan bahasa Indonesia yang FORMAL, PROFESIONAL, dan ANALITIS.
Fokus pada INSIGHT yang ACTIONABLE untuk pengambilan keputusan Direksi.

HANYA berikan konten HTML (tanpa tag html, head, body):

<div class="report-section summary">
    <h3>📋 RINGKASAN EKSEKUTIF</h3>
    <p><strong>Gambaran Umum:</strong> [Berikan overview kinerja bank secara keseluruhan dalam 2-3 kalimat yang padat]</p>
    <p><strong>Posisi Keuangan:</strong> [Analisis posisi aset, liabilitas, dan ekuitas. Bandingkan dengan industri perbankan regional]</p>
    <p><strong>Kinerja Operasional:</strong> [Analisis efisiensi operasional, produktivitas aset, dan kualitas portofolio]</p>
</div>

<div class="report-section metrics">
    <h3>📊 INDIKATOR KINERJA UTAMA (KPI)</h3>
    <table style="width:100%; border-collapse: collapse; margin: 10px 0;">
        <tr style="background: #1e3a5f; color: white;">
            <th style="padding: 10px; text-align: left;">Indikator</th>
            <th style="padding: 10px; text-align: right;">Nilai</th>
            <th style="padding: 10px; text-align: center;">Status</th>
            <th style="padding: 10px; text-align: left;">Keterangan</th>
        </tr>
        <tr style="background: #f8f9fa;">
            <td style="padding: 8px;">Total Aset</td>
            <td style="padding: 8px; text-align: right;">Rp ${data.neraca.totalAset.formatted}</td>
            <td style="padding: 8px; text-align: center;">[Evaluasi]</td>
            <td style="padding: 8px;">[Analisis singkat]</td>
        </tr>
        [Tambahkan baris untuk: Kredit, DPK, LDR, CASA, Laba Bersih dengan format serupa]
    </table>
</div>

<div class="report-section highlights">
    <h3>✅ HIGHLIGHT KINERJA POSITIF</h3>
    <ul>
        <li><strong>[Aspek 1]:</strong> [Penjelasan detail dengan angka pendukung]</li>
        <li><strong>[Aspek 2]:</strong> [Penjelasan detail dengan angka pendukung]</li>
        <li><strong>[Aspek 3]:</strong> [Penjelasan detail dengan angka pendukung]</li>
        <li><strong>[Aspek 4]:</strong> [Penjelasan detail dengan angka pendukung]</li>
    </ul>
</div>

<div class="report-section concerns">
    <h3>⚠️ AREA YANG MEMERLUKAN PERHATIAN</h3>
    <ul>
        <li><strong>[Concern 1]:</strong> [Penjelasan masalah dan dampak potensial]</li>
        <li><strong>[Concern 2]:</strong> [Penjelasan masalah dan dampak potensial]</li>
        <li><strong>[Concern 3]:</strong> [Penjelasan masalah dan dampak potensial]</li>
    </ul>
</div>

<div class="report-section analysis">
    <h3>🔍 ANALISIS MENDALAM</h3>
    <h4>Struktur Dana Pihak Ketiga</h4>
    <p>[Analisis komposisi DPK: Giro ${data.dpk.giro.share}%, Tabungan ${data.dpk.tabungan.share}%, Deposito ${data.dpk.deposito.share}%. Bahas implikasi biaya dana dan strategi optimalisasi CASA]</p>
    
    <h4>Kualitas Portofolio Kredit</h4>
    <p>[Analisis kualitas kredit, CKPN, dan coverage ratio. Berikan insight tentang risiko kredit]</p>
    
    <h4>Likuiditas dan Solvabilitas</h4>
    <p>[Analisis LDR ${data.ratio.ldr.nilai}% terhadap batas regulasi. Bahas posisi likuiditas bank]</p>
</div>

<div class="report-section recommendations">
    <h3>💡 REKOMENDASI STRATEGIS</h3>
    <ol>
        <li>
            <strong>[Judul Rekomendasi 1]</strong>
            <p>[Penjelasan detail rekomendasi, langkah implementasi, dan expected outcome]</p>
        </li>
        <li>
            <strong>[Judul Rekomendasi 2]</strong>
            <p>[Penjelasan detail rekomendasi, langkah implementasi, dan expected outcome]</p>
        </li>
        <li>
            <strong>[Judul Rekomendasi 3]</strong>
            <p>[Penjelasan detail rekomendasi, langkah implementasi, dan expected outcome]</p>
        </li>
        <li>
            <strong>[Judul Rekomendasi 4]</strong>
            <p>[Penjelasan detail rekomendasi, langkah implementasi, dan expected outcome]</p>
        </li>
    </ol>
</div>

<div class="report-section outlook">
    <h3>📈 OUTLOOK & PROYEKSI</h3>
    <p><strong>Proyeksi Jangka Pendek (1-3 bulan):</strong> [Proyeksi kinerja berdasarkan tren saat ini]</p>
    <p><strong>Proyeksi Jangka Menengah (3-6 bulan):</strong> [Estimasi pencapaian target dengan asumsi yang realistis]</p>
    <p><strong>Faktor Risiko:</strong> [Identifikasi risiko eksternal dan internal yang perlu diantisipasi]</p>
    <p><strong>Peluang:</strong> [Identifikasi peluang pertumbuhan dan ekspansi]</p>
</div>

<div class="report-section conclusion">
    <h3>📝 KESIMPULAN</h3>
    <p>[Berikan kesimpulan komprehensif dalam 2-3 paragraf yang merangkum kondisi bank, tantangan utama, dan arah strategis ke depan]</p>
</div>

PENTING:
- Gunakan data AKTUAL yang diberikan, jangan membuat angka baru
- Berikan analisis yang OBJEKTIF dan BERBASIS DATA
- Sertakan PERBANDINGAN dengan benchmark industri perbankan jika relevan
- Fokus pada INSIGHT yang dapat ditindaklanjuti oleh manajemen
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
