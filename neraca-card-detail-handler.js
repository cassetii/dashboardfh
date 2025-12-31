// ========================================
// NERACA CARD DETAIL HANDLER
// Modal untuk detail komponen ketika klik card
// ========================================

const NeracaCardDetail = (function() {
    'use strict';
    
    // ========================================
    // KONFIGURASI SANDI PER CARD
    // ========================================
    
    const CARD_CONFIG = {
        'aset': {
            title: 'TOTAL ASSET',
            icon: 'fa-chart-pie',
            color: '#f97316',
            spiType: 'produktif-nonproduktif',
            komponen: {
                produktif: [
                    { sandi: '01.09.01.00.00.00', nama: 'Kredit', kategori: 'kredit' },
                    { sandi: '01.09.03', nama: 'Pembiayaan Syariah', prefix: true, kategori: 'kredit' },
                    { sandi: '01.05.00.00.00.00', nama: 'Surat Berharga', kategori: 'investasi' },
                    { sandi: '01.03.00.00.00.00', nama: 'Penempatan pada Bank Lain', kategori: 'investasi' },
                    { sandi: '01.02.00.00.00.00', nama: 'Giro pada Bank Indonesia', kategori: 'investasi' },
                    { sandi: '01.07.00.00.00.00', nama: 'Tagihan SB Repo', kategori: 'investasi' },
                    { sandi: '01.08.00.00.00.00', nama: 'Tagihan Akseptasi', kategori: 'investasi' },
                    { sandi: '01.10.00.00.00.00', nama: 'Penyertaan Modal', kategori: 'investasi' },
                    { sandi: '01.11.00.00.00.00', nama: 'Aset Keuangan Lainnya', kategori: 'lainnya' },
                ],
                nonProduktif: [
                    { sandi: '01.01.00.00.00.00', nama: 'Kas', kategori: 'kas' },
                    { sandi: '01.14.01.00.00.00', nama: 'ATI (Gross)', kategori: 'ati' },
                    { sandi: '01.14.02.00.00.00', nama: 'Akum. Penyusutan ATI', kategori: 'ati' },
                    { sandi: '01.13.01.00.00.00', nama: 'Aset Tidak Berwujud', kategori: 'intangible' },
                    { sandi: '01.13.02.00.00.00', nama: 'Akum. Amortisasi', kategori: 'intangible' },
                    { sandi: '01.19.00.00.00.00', nama: 'Aset Lainnya', kategori: 'lainnya' },
                ],
                pengurang: [
                    { sandi: '01.12', nama: 'CKPN', prefix: true, kategori: 'ckpn' },
                ]
            }
        },
        'kredit': {
            title: 'TOTAL KREDIT',
            icon: 'fa-hand-holding-usd',
            color: '#1e3a5f',
            splitType: 'konven-syariah',
            komponen: {
                konvensional: [
                    { sandi: '01.09.01.00.00.00', nama: 'Kredit Konvensional' },
                ],
                syariah: [
                    { sandi: '01.09.03', nama: 'Pembiayaan Syariah', prefix: true },
                ]
            }
        },
        'pembiayaan': {
            title: 'TOTAL PEMBIAYAAN SYARIAH',
            icon: 'fa-mosque',
            color: '#059669',
            splitType: 'jenis-pembiayaan',
            komponen: {
                piutang: [
                    { sandi: '01.09.03.01', nama: 'Piutang Syariah', prefix: true },
                ],
                pembiayaan: [
                    { sandi: '01.09.03.02', nama: 'Pembiayaan Syariah', prefix: true },
                ]
            }
        },
        'dpk': {
            title: 'DANA PIHAK KETIGA',
            icon: 'fa-piggy-bank',
            color: '#3b82f6',
            splitType: 'giro-tabungan-deposito',
            komponen: {
                giro: [
                    { sandi: '02.01.01.00.00.00', nama: 'Giro Konvensional' },
                    { sandi: '02.01.02.01.00.00', nama: 'Giro Syariah Wadiah' },
                    { sandi: '02.01.02.02.00.00', nama: 'Giro Syariah Mudharabah' },
                    { sandi: '02.01.02.03.00.00', nama: 'Giro Syariah Lainnya' },
                ],
                tabungan: [
                    { sandi: '02.02.01.00.00.00', nama: 'Tabungan Konvensional' },
                    { sandi: '02.02.02.01.00.00', nama: 'Tabungan Syariah Wadiah' },
                    { sandi: '02.02.02.02.00.00', nama: 'Tabungan Syariah Mudharabah' },
                    { sandi: '02.02.02.03.00.00', nama: 'Tabungan Syariah Lainnya' },
                ],
                deposito: [
                    { sandi: '02.03.01.00.00.00', nama: 'Deposito Konvensional' },
                    { sandi: '02.03.02.01.00.00', nama: 'Deposito Syariah Wadiah' },
                    { sandi: '02.03.02.02.00.00', nama: 'Deposito Syariah Mudharabah' },
                ]
            }
        },
        'ati': {
            title: 'AKTIVA TETAP & INVENTARIS',
            icon: 'fa-building',
            color: '#14b8a6',
            splitType: 'gross-akumulasi',
            komponen: {
                gross: [
                    { sandi: '01.13.01.00.00.00', nama: 'Aset Tidak Berwujud' },
                    { sandi: '01.14.01.00.00.00', nama: 'Aset Tetap & Inventaris' },
                ],
                akumulasi: [
                    { sandi: '01.13.02.00.00.00', nama: 'Akumulasi Amortisasi' },
                    { sandi: '01.14.02.00.00.00', nama: 'Akumulasi Penyusutan' },
                ]
            }
        },
        'ckpn': {
            title: 'CKPN (Cadangan Kerugian)',
            icon: 'fa-shield-alt',
            color: '#f59e0b',
            splitType: 'jenis-ckpn',
            komponen: {
                suratBerharga: [
                    { sandi: '01.12.01.00.00.00', nama: 'CKPN Surat Berharga' },
                ],
                kredit: [
                    { sandi: '01.12.02.01.00.00', nama: 'CKPN Kredit Konvensional' },
                    { sandi: '01.12.02.02.01.00', nama: 'CKPN Piutang Murabahah' },
                    { sandi: '01.12.02.02.02.00', nama: 'CKPN Piutang Istishna' },
                    { sandi: '01.12.02.02.03.00', nama: 'CKPN Piutang Qardh' },
                    { sandi: '01.12.02.02.04.00', nama: 'CKPN Piutang Sewa' },
                    { sandi: '01.12.02.02.05.00', nama: 'CKPN Piutang Multijasa' },
                    { sandi: '01.12.02.02.06.00', nama: 'CKPN Pembiayaan Mudharabah' },
                    { sandi: '01.12.02.02.07.00', nama: 'CKPN Pembiayaan Musyarakah' },
                    { sandi: '01.12.02.02.99.00', nama: 'CKPN Pembiayaan Bagi Hasil Lain' },
                ],
                asetLain: [
                    { sandi: '01.12.03.00.00.00', nama: 'CKPN Aset Keuangan Lainnya' },
                ]
            }
        },
        'modal': {
            title: 'TOTAL MODAL (EKUITAS)',
            icon: 'fa-landmark',
            color: '#1e3a5f',
            splitType: 'ekuitas-5-komponen',
            komponen: {
                modalDisetor: [
                    { sandi: '03.01.01.00.00.00', nama: 'Modal Dasar' },
                    { sandi: '03.01.02.00.00.00', nama: 'Modal Belum Disetor -/-' },
                    { sandi: '03.01.03.00.00.00', nama: 'Treasury Stock -/-' },
                ],
                tambahanModal: [
                    { sandi: '03.02.01.00.00.00', nama: 'Agio' },
                    { sandi: '03.02.02.00.00.00', nama: 'Disagio -/-' },
                    { sandi: '03.02.06.00.00.00', nama: 'Dana Setoran Modal' },
                    { sandi: '03.02.03.00.00.00', nama: 'Modal Sumbangan' },
                    { sandi: '03.02.04.00.00.00', nama: 'Waran Diterbitkan' },
                    { sandi: '03.02.05.00.00.00', nama: 'Opsi Saham' },
                    { sandi: '03.02.99.01.00.00', nama: 'Lainnya - Keuntungan' },
                    { sandi: '03.02.99.02.00.00', nama: 'Lainnya - Kerugian -/-' },
                ],
                pkl: [
                    { sandi: '03.03.01.00.00.00', nama: 'PKL - Keuntungan' },
                    { sandi: '03.03.02.00.00.00', nama: 'PKL - Kerugian -/-' },
                ],
                cadangan: [
                    { sandi: '03.04.01.00.00.00', nama: 'Cadangan Umum' },
                    { sandi: '03.04.02.00.00.00', nama: 'Cadangan Tujuan' },
                ],
                labaRugi: [
                    { sandi: '03.05.01.01.00.00', nama: 'Laba Tahun Lalu' },
                    { sandi: '03.05.01.02.00.00', nama: 'Rugi Tahun Lalu -/-' },
                    { sandi: '03.05.02.01.00.00', nama: 'Laba Tahun Berjalan' },
                    { sandi: '03.05.02.02.00.00', nama: 'Rugi Tahun Berjalan -/-' },
                    { sandi: '03.05.03.00.00.00', nama: 'Dividen Dibayarkan -/-' },
                ]
            }
        },
        'laba': {
            title: 'LABA SEBELUM PAJAK',
            icon: 'fa-chart-line',
            color: '#3b82f6',
            splitType: 'laba-3-grup',
            dataSource: 'labarugi',  // Ambil dari labarugi, bukan neraca
            komponen: {
                // Grup 1: Laba (Rugi) Tahun Berjalan Sebelum Pajak
                sebelumPajak: [
                    { sandi: '03.05.02.01.10.00', nama: 'Laba Tahun Berjalan Sebelum Pajak' },
                    { sandi: '03.05.02.02.10.00', nama: 'Rugi Tahun Berjalan Sebelum Pajak -/-', isNegative: true },
                ],
                // Grup 2: Pajak Penghasilan
                pajakPenghasilan: [
                    { sandi: '03.05.02.01.40.00', nama: 'Taksiran Pajak Tahun Berjalan -/-', isNegative: true },
                    { sandi: '03.05.02.02.40.01', nama: 'Pendapatan Pajak Tangguhan' },
                    { sandi: '03.05.02.02.40.02', nama: 'Beban Pajak Tangguhan -/-', isNegative: true },
                ],
                // Grup 3: Laba (Rugi) Bersih Tahun Berjalan
                bersih: [
                    { sandi: '03.05.02.01.00.00', nama: 'Laba Bersih Tahun Berjalan' },
                    { sandi: '03.05.02.02.00.00', nama: 'Rugi Bersih Tahun Berjalan -/-', isNegative: true },
                ]
            }
        },
        'pendapatan': {
            title: 'TOTAL PENDAPATAN',
            icon: 'fa-arrow-trend-up',
            color: '#10b981',
            splitType: 'pendapatan-3-komponen',
            komponen: {
                bunga: [
                    { sandi: '04.11', nama: 'Pendapatan Bunga / Imbal Hasil', prefix: true },
                ],
                opLain: [
                    { sandi: '04.12', nama: 'Pendapatan Operasional Lainnya', prefix: true },
                ],
                nonOp: [
                    { sandi: '04.20', nama: 'Pendapatan Non Operasional', prefix: true },
                ]
            }
        },
        'biaya': {
            title: 'TOTAL BIAYA',
            icon: 'fa-arrow-trend-down',
            color: '#ef4444',
            splitType: 'biaya-3-komponen',
            komponen: {
                bunga: [
                    { sandi: '05.11', nama: 'Beban Bunga / Bagi Hasil', prefix: true },
                ],
                opLain: [
                    { sandi: '05.12', nama: 'Beban Operasional Lainnya', prefix: true },
                ],
                nonOp: [
                    { sandi: '05.20', nama: 'Beban Non Operasional', prefix: true },
                ]
            }
        }
    };
    
    // State
    let currentCard = null;
    let chartInstance = null;
    
    // ========================================
    // INIT MODAL HTML
    // ========================================
    
    function initModal() {
        // Cek apakah modal sudah ada
        if (document.getElementById('neracaCardDetailModal')) return;
        
        const modalHTML = `
        <div id="neracaCardDetailModal" class="ncd-modal-overlay">
            <div class="ncd-modal">
                <div class="ncd-modal-header">
                    <div class="ncd-header-left">
                        <div class="ncd-icon" id="ncdIcon">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <div class="ncd-title-group">
                            <h2 id="ncdTitle">DETAIL</h2>
                            <div class="ncd-subtitle-row">
                                <p id="ncdSubtitle">Periode: Januari 2025</p>
                                <div class="ncd-filter-badges" id="ncdFilterBadges">
                                    <!-- Dynamic filter badges -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ncd-header-right">
                        <div class="ncd-total-value">
                            <span class="ncd-label">Total</span>
                            <span class="ncd-value" id="ncdTotalValue">Rp 0</span>
                        </div>
                        <button class="ncd-close-btn" onclick="NeracaCardDetail.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="ncd-modal-body">
                    <div class="ncd-content-wrapper">
                        <!-- Left: Table -->
                        <div class="ncd-table-section">
                            <div class="ncd-section-header">
                                <i class="fas fa-list"></i>
                                <span>Komponen</span>
                            </div>
                            <div class="ncd-table-wrapper" id="ncdTableWrapper">
                                <table class="ncd-table">
                                    <thead>
                                        <tr>
                                            <th>Komponen</th>
                                            <th>Nilai (Rp)</th>
                                            <th>%</th>
                                        </tr>
                                    </thead>
                                    <tbody id="ncdTableBody">
                                        <tr><td colspan="3" class="loading">Loading...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Right: Chart -->
                        <div class="ncd-chart-section">
                            <div class="ncd-section-header">
                                <i class="fas fa-chart-bar"></i>
                                <span>Visualisasi</span>
                            </div>
                            <div class="ncd-chart-wrapper">
                                <canvas id="ncdChart"></canvas>
                            </div>
                            <div class="ncd-chart-legend" id="ncdChartLegend"></div>
                        </div>
                    </div>
                </div>
                
                <div class="ncd-modal-footer">
                    <div class="ncd-footer-stats" id="ncdFooterStats">
                        <!-- Dynamic stats -->
                    </div>
                    <div class="ncd-footer-actions">
                        <button class="ncd-btn" onclick="NeracaCardDetail.exportExcel()">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <button class="ncd-btn" onclick="NeracaCardDetail.print()">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        addStyles();
    }
    
    // ========================================
    // STYLES
    // ========================================
    
    function addStyles() {
        if (document.getElementById('ncdStyles')) return;
        
        const styles = `
        <style id="ncdStyles">
        .ncd-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .ncd-modal-overlay.active {
            display: flex;
            opacity: 1;
        }
        
        .ncd-modal {
            background: #fff;
            border-radius: 16px;
            width: 95%;
            max-width: 1100px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .ncd-modal-overlay.active .ncd-modal {
            transform: scale(1);
        }
        
        /* Header */
        .ncd-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
            border-radius: 16px 16px 0 0;
            color: white;
        }
        
        .ncd-header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .ncd-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        
        .ncd-title-group h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
        }
        
        .ncd-subtitle-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 4px;
        }
        
        .ncd-title-group p {
            margin: 0;
            font-size: 13px;
            opacity: 0.8;
        }
        
        .ncd-filter-badges {
            display: flex;
            gap: 6px;
        }
        
        .ncd-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .ncd-badge.konsolidasi {
            background: #22c55e;
            color: white;
        }
        
        .ncd-badge.konvensional {
            background: #3b82f6;
            color: white;
        }
        
        .ncd-badge.syariah {
            background: #22c55e;
            color: white;
        }
        
        .ncd-badge.cabang {
            background: #f59e0b;
            color: white;
        }
        
        .ncd-header-right {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .ncd-total-value {
            text-align: right;
        }
        
        .ncd-total-value .ncd-label {
            display: block;
            font-size: 12px;
            opacity: 0.8;
        }
        
        .ncd-total-value .ncd-value {
            font-size: 24px;
            font-weight: 700;
        }
        
        .ncd-close-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: none;
            background: rgba(255,255,255,0.2);
            color: white;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .ncd-close-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: rotate(90deg);
        }
        
        /* Body */
        .ncd-modal-body {
            flex: 1;
            overflow: hidden;
            padding: 24px;
        }
        
        .ncd-content-wrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            height: 100%;
        }
        
        .ncd-section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #1e3a5f;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        /* Table Section */
        .ncd-table-section {
            display: flex;
            flex-direction: column;
        }
        
        .ncd-table-wrapper {
            flex: 1;
            overflow-y: auto;
            max-height: 400px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
        }
        
        .ncd-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        
        .ncd-table thead {
            position: sticky;
            top: 0;
            background: #f8fafc;
            z-index: 1;
        }
        
        .ncd-table th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #64748b;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .ncd-table th:nth-child(2),
        .ncd-table th:nth-child(3) {
            text-align: right;
        }
        
        .ncd-table td {
            padding: 10px 16px;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .ncd-table td:nth-child(2),
        .ncd-table td:nth-child(3) {
            text-align: right;
            font-family: 'JetBrains Mono', monospace;
        }
        
        .ncd-table tr:hover {
            background: #f8fafc;
        }
        
        .ncd-table .group-header {
            background: #f1f5f9;
            font-weight: 600;
            color: #1e3a5f;
        }
        
        .ncd-table .group-header td:first-child {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .ncd-table .group-header .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }
        
        .ncd-table .group-header .dot.green { background: #22c55e; }
        .ncd-table .group-header .dot.red { background: #ef4444; }
        .ncd-table .group-header .dot.yellow { background: #f59e0b; }
        .ncd-table .group-header .dot.blue { background: #3b82f6; }
        
        .ncd-table .item-row td:first-child {
            padding-left: 32px;
            color: #64748b;
        }
        
        .ncd-table .subtotal-row {
            background: #fefce8;
            font-weight: 600;
        }
        
        .ncd-table .total-row {
            background: #1e3a5f;
            color: white;
            font-weight: 700;
        }
        
        .ncd-table .negative {
            color: #ef4444;
        }
        
        /* Chart Section */
        .ncd-chart-section {
            display: flex;
            flex-direction: column;
        }
        
        .ncd-chart-wrapper {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 250px;
        }
        
        .ncd-chart-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            margin-top: 16px;
        }
        
        .ncd-legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #64748b;
        }
        
        .ncd-legend-dot {
            width: 12px;
            height: 12px;
            border-radius: 3px;
        }
        
        /* Footer */
        .ncd-modal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            background: #f8fafc;
            border-radius: 0 0 16px 16px;
            border-top: 1px solid #e5e7eb;
        }
        
        .ncd-footer-stats {
            display: flex;
            gap: 24px;
        }
        
        .ncd-stat-item {
            display: flex;
            flex-direction: column;
        }
        
        .ncd-stat-item .label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
        }
        
        .ncd-stat-item .value {
            font-size: 16px;
            font-weight: 700;
            color: #1e3a5f;
        }
        
        .ncd-footer-actions {
            display: flex;
            gap: 8px;
        }
        
        .ncd-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: white;
            font-size: 13px;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .ncd-btn:hover {
            background: #1e3a5f;
            color: white;
            border-color: #1e3a5f;
        }
        
        /* Loading */
        .ncd-table td.loading {
            text-align: center;
            padding: 40px;
            color: #64748b;
        }
        
        /* Responsive */
        @media (max-width: 900px) {
            .ncd-content-wrapper {
                grid-template-columns: 1fr;
            }
            
            .ncd-chart-section {
                order: -1;
            }
        }
        </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    // ========================================
    // OPEN MODAL
    // ========================================
    
    async function open(cardType) {
        initModal();
        currentCard = cardType;
        
        const config = CARD_CONFIG[cardType];
        if (!config) {
            console.error('Card type not found:', cardType);
            return;
        }
        
        // Update header
        document.getElementById('ncdTitle').textContent = config.title;
        document.getElementById('ncdIcon').innerHTML = `<i class="fas ${config.icon}"></i>`;
        document.getElementById('ncdIcon').style.background = config.color + '33';
        document.getElementById('ncdIcon').style.color = config.color;
        
        // Get periode from filters
        const filters = window.DashboardFirebase?.getFilters?.() || {};
        const periode = filters.periode || '2025-01';
        const [tahun, bulan] = periode.split('-');
        const bulanNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        document.getElementById('ncdSubtitle').textContent = `Periode: ${bulanNames[parseInt(bulan)]} ${tahun}`;
        
        // Update filter badges
        updateFilterBadges(filters);
        
        // Show modal
        document.getElementById('neracaCardDetailModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Load data
        await loadData(cardType, filters);
    }
    
    // ========================================
    // UPDATE FILTER BADGES
    // ========================================
    
    function updateFilterBadges(filters) {
        const badgesContainer = document.getElementById('ncdFilterBadges');
        if (!badgesContainer) return;
        
        let badgeHtml = '';
        
        // Determine active filter based on dashboard buttons
        // Dashboard has: Konsolidasi, Konvensional, Syariah, Cabang
        if (filters.cabang && filters.cabang !== 'ALL' && filters.cabang !== 'SYR' && filters.cabang !== 'KON') {
            // Specific branch selected
            const branchName = getBranchName(filters.cabang);
            const isSyariahBranch = ['500', '510', '520', '530', '540'].includes(filters.cabang);
            badgeHtml = `<span class="ncd-badge cabang"><i class="fas fa-building"></i> ${branchName}</span>`;
            if (isSyariahBranch) {
                badgeHtml += `<span class="ncd-badge syariah"><i class="fas fa-mosque"></i> Syariah</span>`;
            }
        } else if (filters.tipe === 'syariah' || filters.cabang === 'SYR') {
            badgeHtml = `<span class="ncd-badge syariah"><i class="fas fa-mosque"></i> Syariah</span>`;
        } else if (filters.tipe === 'konvensional' || filters.cabang === 'KON') {
            badgeHtml = `<span class="ncd-badge konvensional"><i class="fas fa-university"></i> Konvensional</span>`;
        } else {
            // Default: Konsolidasi (ALL)
            badgeHtml = `<span class="ncd-badge konsolidasi"><i class="fas fa-layer-group"></i> Konsolidasi</span>`;
        }
        
        badgesContainer.innerHTML = badgeHtml;
    }
    
    function getBranchName(kode) {
        const branchNames = {
            '001': 'Kantor Pusat',
            '010': 'Makassar Somba Opu',
            '011': 'Makassar Veteran',
            '020': 'Maros',
            '030': 'Pangkep',
            '040': 'Barru',
            '050': 'Pare-Pare',
            '060': 'Pinrang',
            '070': 'Sidrap',
            '080': 'Soppeng',
            '090': 'Wajo',
            '100': 'Bone',
            '110': 'Sinjai',
            '120': 'Bulukumba',
            '130': 'Selayar',
            '400': 'Jakarta',
            '500': 'UUS (Pusat Syariah)',
            '510': 'KCS Makassar',
            '520': 'KCS Maros',
            '530': 'KCS Bone',
            '540': 'KCS Pare-Pare',
        };
        return branchNames[kode] || `Cabang ${kode}`;
    }
    
    // ========================================
    // CLOSE MODAL
    // ========================================
    
    function close() {
        document.getElementById('neracaCardDetailModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
    }
    
    // ========================================
    // LOAD DATA
    // ========================================
    
    async function loadData(cardType, filters) {
        const config = CARD_CONFIG[cardType];
        const periode = filters.periode || '2025-01';
        
        // Determine kode_cabang based on filter
        // Dashboard buttons: Konsolidasi (ALL), Konvensional (KON), Syariah (SYR), Cabang (specific)
        let kode = 'ALL'; // default Konsolidasi
        if (filters.cabang && filters.cabang !== 'ALL' && filters.cabang !== 'KON' && filters.cabang !== 'SYR') {
            kode = filters.cabang; // Specific branch
        } else if (filters.tipe === 'konvensional' || filters.cabang === 'KON') {
            kode = 'KON';
        } else if (filters.tipe === 'syariah' || filters.cabang === 'SYR') {
            kode = 'SYR';
        }
        
        console.log('Loading data for:', { cardType, periode, kode, filters });
        
        // Get data from Firebase (use existing loaded data)
        const data = window.DashboardFirebase?.getData?.() || {};
        const neracaData = data.neraca || [];
        const labarugiDataAll = data.labarugi || [];
        
        console.log('📊 Data available - Neraca:', neracaData.length, 'LabaRugi:', labarugiDataAll.length);
        
        // Helper function
        function getValue(sandi, isPrefix = false) {
            if (isPrefix) {
                return neracaData
                    .filter(d => d.kode_cabang === kode && d.periode === periode && 
                                d.sandi && d.sandi.startsWith(sandi))
                    .reduce((sum, d) => sum + (d.total || 0), 0);
            }
            const item = neracaData.find(d => 
                d.kode_cabang === kode && 
                d.periode === periode && 
                d.sandi === sandi
            );
            return item ? (item.total || 0) : 0;
        }
        
        // Process data based on card type
        let tableData = [];
        let chartData = {};
        let totalValue = 0;
        
        if (cardType === 'aset') {
            // ASET: Produktif vs Non-Produktif
            let produktifTotal = 0;
            let nonProduktifTotal = 0;
            let pengurangTotal = 0;
            
            const produktifItems = [];
            const nonProduktifItems = [];
            const pengurangItems = [];
            
            // Produktif
            for (const item of config.komponen.produktif) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    produktifItems.push({ nama: item.nama, nilai });
                    produktifTotal += nilai;
                }
            }
            
            // Non-Produktif
            for (const item of config.komponen.nonProduktif) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    nonProduktifItems.push({ nama: item.nama, nilai });
                    nonProduktifTotal += nilai;
                }
            }
            
            // Pengurang
            for (const item of config.komponen.pengurang) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    pengurangItems.push({ nama: item.nama, nilai });
                    pengurangTotal += nilai;
                }
            }
            
            totalValue = produktifTotal + nonProduktifTotal + pengurangTotal;
            
            tableData = {
                groups: [
                    { 
                        nama: 'ASET PRODUKTIF', 
                        color: 'green', 
                        items: produktifItems, 
                        subtotal: produktifTotal 
                    },
                    { 
                        nama: 'ASET NON-PRODUKTIF', 
                        color: 'red', 
                        items: nonProduktifItems, 
                        subtotal: nonProduktifTotal 
                    },
                    { 
                        nama: 'PENGURANG (CKPN)', 
                        color: 'yellow', 
                        items: pengurangItems, 
                        subtotal: pengurangTotal 
                    },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Produktif', 'Non-Produktif', 'CKPN'],
                data: [Math.abs(produktifTotal), Math.abs(nonProduktifTotal), Math.abs(pengurangTotal)],
                colors: ['#22c55e', '#ef4444', '#f59e0b']
            };
            
        } else if (cardType === 'dpk') {
            // DPK: Giro, Tabungan, Deposito
            let giroTotal = 0, tabunganTotal = 0, depositoTotal = 0;
            const giroItems = [], tabunganItems = [], depositoItems = [];
            
            for (const item of config.komponen.giro) {
                const nilai = getValue(item.sandi);
                if (nilai !== 0) {
                    giroItems.push({ nama: item.nama, nilai });
                    giroTotal += nilai;
                }
            }
            
            for (const item of config.komponen.tabungan) {
                const nilai = getValue(item.sandi);
                if (nilai !== 0) {
                    tabunganItems.push({ nama: item.nama, nilai });
                    tabunganTotal += nilai;
                }
            }
            
            for (const item of config.komponen.deposito) {
                const nilai = getValue(item.sandi);
                if (nilai !== 0) {
                    depositoItems.push({ nama: item.nama, nilai });
                    depositoTotal += nilai;
                }
            }
            
            totalValue = giroTotal + tabunganTotal + depositoTotal;
            
            tableData = {
                groups: [
                    { nama: 'GIRO', color: 'blue', items: giroItems, subtotal: giroTotal },
                    { nama: 'TABUNGAN', color: 'green', items: tabunganItems, subtotal: tabunganTotal },
                    { nama: 'DEPOSITO', color: 'yellow', items: depositoItems, subtotal: depositoTotal },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Giro', 'Tabungan', 'Deposito'],
                data: [giroTotal, tabunganTotal, depositoTotal],
                colors: ['#3b82f6', '#22c55e', '#f59e0b']
            };
            
        } else if (cardType === 'kredit') {
            // Kredit: Konvensional vs Syariah
            let konvenTotal = 0, syariahTotal = 0;
            const konvenItems = [], syariahItems = [];
            
            for (const item of config.komponen.konvensional) {
                const nilai = getValue(item.sandi);
                if (nilai !== 0) {
                    konvenItems.push({ nama: item.nama, nilai });
                    konvenTotal += nilai;
                }
            }
            
            for (const item of config.komponen.syariah) {
                const nilai = getValue(item.sandi);
                if (nilai !== 0) {
                    syariahItems.push({ nama: item.nama, nilai });
                    syariahTotal += nilai;
                }
            }
            
            totalValue = konvenTotal + syariahTotal;
            
            tableData = {
                groups: [
                    { nama: 'KONVENSIONAL', color: 'blue', items: konvenItems, subtotal: konvenTotal },
                    { nama: 'SYARIAH', color: 'green', items: syariahItems, subtotal: syariahTotal },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Konvensional', 'Syariah'],
                data: [konvenTotal, syariahTotal],
                colors: ['#1e3a5f', '#22c55e']
            };
            
        } else if (cardType === 'pembiayaan') {
            // Pembiayaan Syariah: Piutang vs Pembiayaan
            let piutangTotal = 0, pembiayaanTotal = 0;
            const piutangItems = [], pembiayaanItems = [];
            
            for (const item of config.komponen.piutang) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    piutangItems.push({ nama: item.nama, nilai });
                    piutangTotal += nilai;
                }
            }
            
            for (const item of config.komponen.pembiayaan) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    pembiayaanItems.push({ nama: item.nama, nilai });
                    pembiayaanTotal += nilai;
                }
            }
            
            totalValue = piutangTotal + pembiayaanTotal;
            
            tableData = {
                groups: [
                    { nama: 'PIUTANG', color: 'blue', items: piutangItems, subtotal: piutangTotal },
                    { nama: 'PEMBIAYAAN', color: 'green', items: pembiayaanItems, subtotal: pembiayaanTotal },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Piutang', 'Pembiayaan'],
                data: [piutangTotal, pembiayaanTotal],
                colors: ['#3b82f6', '#22c55e']
            };
            
        } else if (cardType === 'ati') {
            // ATI: Gross vs Akumulasi Penyusutan
            let grossTotal = 0, akumTotal = 0;
            const grossItems = [], akumItems = [];
            
            for (const item of config.komponen.gross) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    grossItems.push({ nama: item.nama, nilai });
                    grossTotal += nilai;
                }
            }
            
            for (const item of config.komponen.akumulasi) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    akumItems.push({ nama: item.nama, nilai });
                    akumTotal += nilai;
                }
            }
            
            totalValue = grossTotal + akumTotal; // akumTotal is negative
            
            tableData = {
                groups: [
                    { nama: 'NILAI PEROLEHAN (GROSS)', color: 'blue', items: grossItems, subtotal: grossTotal },
                    { nama: 'AKUMULASI PENYUSUTAN', color: 'red', items: akumItems, subtotal: akumTotal },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Nilai Perolehan', 'Akum. Penyusutan'],
                data: [Math.abs(grossTotal), Math.abs(akumTotal)],
                colors: ['#3b82f6', '#ef4444']
            };
            
        } else if (cardType === 'ckpn') {
            // CKPN: Surat Berharga, Kredit, Aset Lain
            let sbTotal = 0, kreditTotal = 0, asetLainTotal = 0;
            const sbItems = [], kreditItems = [], asetLainItems = [];
            
            for (const item of config.komponen.suratBerharga) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    sbItems.push({ nama: item.nama, nilai });
                    sbTotal += nilai;
                }
            }
            
            for (const item of config.komponen.kredit) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    kreditItems.push({ nama: item.nama, nilai });
                    kreditTotal += nilai;
                }
            }
            
            for (const item of config.komponen.asetLain) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    asetLainItems.push({ nama: item.nama, nilai });
                    asetLainTotal += nilai;
                }
            }
            
            totalValue = sbTotal + kreditTotal + asetLainTotal;
            
            tableData = {
                groups: [
                    { nama: 'CKPN SURAT BERHARGA', color: 'blue', items: sbItems, subtotal: sbTotal },
                    { nama: 'CKPN KREDIT / PEMBIAYAAN', color: 'yellow', items: kreditItems, subtotal: kreditTotal },
                    { nama: 'CKPN ASET KEUANGAN LAINNYA', color: 'red', items: asetLainItems, subtotal: asetLainTotal },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Surat Berharga', 'Kredit/Pembiayaan', 'Aset Lainnya'],
                data: [Math.abs(sbTotal), Math.abs(kreditTotal), Math.abs(asetLainTotal)],
                colors: ['#3b82f6', '#f59e0b', '#ef4444']
            };
        } else if (cardType === 'modal') {
            // MODAL (EKUITAS): 5 Komponen Utama
            let modalDisetorTotal = 0, tambahanModalTotal = 0, pklTotal = 0, cadanganTotal = 0, labaRugiTotal = 0;
            const modalDisetorItems = [], tambahanModalItems = [], pklItems = [], cadanganItems = [], labaRugiItems = [];
            
            for (const item of config.komponen.modalDisetor) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    modalDisetorItems.push({ nama: item.nama, nilai });
                    modalDisetorTotal += nilai;
                }
            }
            
            for (const item of config.komponen.tambahanModal) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    tambahanModalItems.push({ nama: item.nama, nilai });
                    tambahanModalTotal += nilai;
                }
            }
            
            for (const item of config.komponen.pkl) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    pklItems.push({ nama: item.nama, nilai });
                    pklTotal += nilai;
                }
            }
            
            for (const item of config.komponen.cadangan) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    cadanganItems.push({ nama: item.nama, nilai });
                    cadanganTotal += nilai;
                }
            }
            
            for (const item of config.komponen.labaRugi) {
                const nilai = getValue(item.sandi, item.prefix);
                if (nilai !== 0) {
                    labaRugiItems.push({ nama: item.nama, nilai });
                    labaRugiTotal += nilai;
                }
            }
            
            totalValue = modalDisetorTotal + tambahanModalTotal + pklTotal + cadanganTotal + labaRugiTotal;
            
            tableData = {
                groups: [
                    { nama: '15. MODAL DISETOR', color: 'blue', items: modalDisetorItems, subtotal: modalDisetorTotal },
                    { nama: '16. TAMBAHAN MODAL DISETOR', color: 'green', items: tambahanModalItems, subtotal: tambahanModalTotal },
                    { nama: '17. PENGHASILAN KOMPREHENSIF LAIN', color: 'purple', items: pklItems, subtotal: pklTotal },
                    { nama: '18. CADANGAN', color: 'yellow', items: cadanganItems, subtotal: cadanganTotal },
                    { nama: '19. LABA/RUGI', color: 'red', items: labaRugiItems, subtotal: labaRugiTotal },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Modal Disetor', 'Tambahan Modal', 'PKL', 'Cadangan', 'Laba/Rugi'],
                data: [Math.abs(modalDisetorTotal), Math.abs(tambahanModalTotal), Math.abs(pklTotal), Math.abs(cadanganTotal), Math.abs(labaRugiTotal)],
                colors: ['#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b', '#ef4444']
            };
            
        } else if (cardType === 'laba') {
            // LABA SEBELUM PAJAK: 3 Grup dari LABARUGI
            const labarugiData = data.labarugi || [];
            
            console.log('📊 Laba - LabaRugi data:', labarugiData.length, 'records');
            console.log('📊 Filter - Kode:', kode, 'Periode:', periode);
            
            // Helper: get value from labarugi
            function getValueLR(sandi) {
                const item = labarugiData.find(d => 
                    d.kode_cabang === kode && 
                    d.periode === periode && 
                    d.sandi === sandi
                );
                return item ? (item.total || 0) : 0;
            }
            
            let sebelumPajakTotal = 0, pajakTotal = 0, bersihTotal = 0;
            const sebelumPajakItems = [], pajakItems = [], bersihItems = [];
            
            // Grup 1: Laba (Rugi) Tahun Berjalan Sebelum Pajak
            for (const item of config.komponen.sebelumPajak) {
                let nilai = getValueLR(item.sandi);
                if (item.isNegative && nilai > 0) nilai = -nilai;
                if (nilai !== 0) {
                    sebelumPajakItems.push({ nama: item.nama, nilai });
                    sebelumPajakTotal += nilai;
                }
            }
            
            // Grup 2: Pajak Penghasilan
            for (const item of config.komponen.pajakPenghasilan) {
                let nilai = getValueLR(item.sandi);
                if (item.isNegative && nilai > 0) nilai = -nilai;
                if (nilai !== 0) {
                    pajakItems.push({ nama: item.nama, nilai });
                    pajakTotal += nilai;
                }
            }
            
            // Grup 3: Laba (Rugi) Bersih Tahun Berjalan
            for (const item of config.komponen.bersih) {
                let nilai = getValueLR(item.sandi);
                if (item.isNegative && nilai > 0) nilai = -nilai;
                if (nilai !== 0) {
                    bersihItems.push({ nama: item.nama, nilai });
                    bersihTotal += nilai;
                }
            }
            
            // Total = Laba Sebelum Pajak (nilai yang ditampilkan di card)
            totalValue = sebelumPajakTotal;
            
            console.log('📊 Laba Sebelum Pajak:', sebelumPajakTotal);
            console.log('📊 Pajak Penghasilan:', pajakTotal);
            console.log('📊 Laba Bersih:', bersihTotal);
            
            tableData = {
                groups: [
                    { nama: 'LABA (RUGI) TAHUN BERJALAN SEBELUM PAJAK', color: 'blue', items: sebelumPajakItems, subtotal: sebelumPajakTotal },
                    { nama: 'PAJAK PENGHASILAN', color: 'orange', items: pajakItems, subtotal: pajakTotal },
                    { nama: 'LABA (RUGI) BERSIH TAHUN BERJALAN', color: 'green', items: bersihItems, subtotal: bersihTotal },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Laba Sebelum Pajak', 'Pajak Penghasilan', 'Laba Bersih'],
                data: [Math.abs(sebelumPajakTotal), Math.abs(pajakTotal), Math.abs(bersihTotal)],
                colors: ['#3b82f6', '#f97316', '#22c55e']
            };
            
        } else if (cardType === 'pendapatan') {
            // PENDAPATAN: Bunga + Op Lain + Non-Op (dari Laba Rugi)
            const labarugiData = data.labarugi || [];
            
            console.log('📊 Pendapatan - LabaRugi data:', labarugiData.length, 'records');
            console.log('📊 Filter - Kode:', kode, 'Periode:', periode);
            
            // Helper: get exact sandi value
            function getValueLR(sandi) {
                const item = labarugiData.find(d => 
                    d.kode_cabang === kode && 
                    d.periode === periode && 
                    d.sandi === sandi
                );
                return item ? Math.abs(item.total || 0) : 0;
            }
            
            // Helper: sum leaf nodes only (exclude .00.00.00 to avoid double counting)
            function sumLeafOnly(sandiPrefix) {
                const filtered = labarugiData.filter(d => 
                    d.kode_cabang === kode && 
                    d.periode === periode && 
                    d.sandi && d.sandi.startsWith(sandiPrefix) &&
                    !d.sandi.endsWith('.00.00.00') // Exclude summary
                );
                return filtered.reduce((sum, d) => sum + Math.abs(d.total || 0), 0);
            }
            
            // Get values using same logic as pendapatan-biaya-handler.js
            const bungaTotal = getValueLR('04.11.00.00.00.00') || sumLeafOnly('04.11');
            const opLainTotal = getValueLR('04.12.00.00.00.00') || sumLeafOnly('04.12');
            const nonOpTotal = getValueLR('04.20.00.00.00.00') || sumLeafOnly('04.20');
            
            console.log('📊 Pendapatan Components:', { bungaTotal, opLainTotal, nonOpTotal });
            
            const bungaItems = bungaTotal > 0 ? [{ nama: 'Pendapatan Bunga / Imbal Hasil', nilai: bungaTotal }] : [];
            const opLainItems = opLainTotal > 0 ? [{ nama: 'Pendapatan Operasional Lainnya', nilai: opLainTotal }] : [];
            const nonOpItems = nonOpTotal > 0 ? [{ nama: 'Pendapatan Non Operasional', nilai: nonOpTotal }] : [];
            
            totalValue = bungaTotal + opLainTotal + nonOpTotal;
            console.log('📊 Pendapatan Total:', totalValue);
            
            tableData = {
                groups: [
                    { nama: 'PENDAPATAN BUNGA / IMBAL HASIL', color: 'green', items: bungaItems, subtotal: bungaTotal },
                    { nama: 'PENDAPATAN OPERASIONAL LAINNYA', color: 'blue', items: opLainItems, subtotal: opLainTotal },
                    { nama: 'PENDAPATAN NON OPERASIONAL', color: 'purple', items: nonOpItems, subtotal: nonOpTotal },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Bunga/Imbal Hasil', 'Op. Lainnya', 'Non-Operasional'],
                data: [Math.abs(bungaTotal), Math.abs(opLainTotal), Math.abs(nonOpTotal)],
                colors: ['#22c55e', '#3b82f6', '#8b5cf6']
            };
            
        } else if (cardType === 'biaya') {
            // BIAYA: Bunga + Op Lain + Non-Op (dari Laba Rugi)
            const labarugiData = data.labarugi || [];
            
            console.log('📊 Biaya - LabaRugi data:', labarugiData.length, 'records');
            console.log('📊 Filter - Kode:', kode, 'Periode:', periode);
            
            // Helper: get exact sandi value
            function getValueLR(sandi) {
                const item = labarugiData.find(d => 
                    d.kode_cabang === kode && 
                    d.periode === periode && 
                    d.sandi === sandi
                );
                return item ? Math.abs(item.total || 0) : 0;
            }
            
            // Helper: sum leaf nodes only (exclude .00.00.00 to avoid double counting)
            function sumLeafOnly(sandiPrefix) {
                const filtered = labarugiData.filter(d => 
                    d.kode_cabang === kode && 
                    d.periode === periode && 
                    d.sandi && d.sandi.startsWith(sandiPrefix) &&
                    !d.sandi.endsWith('.00.00.00') // Exclude summary
                );
                return filtered.reduce((sum, d) => sum + Math.abs(d.total || 0), 0);
            }
            
            // Get values using same logic as pendapatan-biaya-handler.js
            const bungaTotal = getValueLR('05.11.00.00.00.00') || sumLeafOnly('05.11');
            const opLainTotal = getValueLR('05.12.00.00.00.00') || sumLeafOnly('05.12');
            const nonOpTotal = getValueLR('05.20.00.00.00.00') || sumLeafOnly('05.20');
            
            console.log('📊 Biaya Components:', { bungaTotal, opLainTotal, nonOpTotal });
            
            const bungaItems = bungaTotal > 0 ? [{ nama: 'Beban Bunga / Bagi Hasil', nilai: bungaTotal }] : [];
            const opLainItems = opLainTotal > 0 ? [{ nama: 'Beban Operasional Lainnya', nilai: opLainTotal }] : [];
            const nonOpItems = nonOpTotal > 0 ? [{ nama: 'Beban Non Operasional', nilai: nonOpTotal }] : [];
            
            totalValue = bungaTotal + opLainTotal + nonOpTotal;
            console.log('📊 Biaya Total:', totalValue);
            
            tableData = {
                groups: [
                    { nama: 'BEBAN BUNGA / BAGI HASIL', color: 'red', items: bungaItems, subtotal: bungaTotal },
                    { nama: 'BEBAN OPERASIONAL LAINNYA', color: 'yellow', items: opLainItems, subtotal: opLainTotal },
                    { nama: 'BEBAN NON OPERASIONAL', color: 'purple', items: nonOpItems, subtotal: nonOpTotal },
                ],
                total: totalValue
            };
            
            chartData = {
                type: 'doughnut',
                labels: ['Bunga/Bagi Hasil', 'Op. Lainnya', 'Non-Operasional'],
                data: [Math.abs(bungaTotal), Math.abs(opLainTotal), Math.abs(nonOpTotal)],
                colors: ['#ef4444', '#f59e0b', '#8b5cf6']
            };
        }
        
        // Update total FIRST (before render yang bisa error)
        document.getElementById('ncdTotalValue').textContent = formatRupiah(totalValue);
        
        // Render table
        renderTable(tableData);
        
        // Render chart with error handling
        try {
            renderChart(chartData);
        } catch (e) {
            console.warn('Chart render error:', e);
            document.getElementById('ncdChartLegend').innerHTML = '<p style="color:#64748b;text-align:center;">Chart tidak tersedia</p>';
        }
        
        // Render footer
        renderFooter(tableData);
    }
    
    // ========================================
    // RENDER TABLE
    // ========================================
    
    function renderTable(data) {
        const tbody = document.getElementById('ncdTableBody');
        if (!tbody) return;
        
        let html = '';
        
        for (const group of data.groups) {
            // Group header
            html += `
                <tr class="group-header">
                    <td><span class="dot ${group.color}"></span> ${group.nama}</td>
                    <td>${formatRupiah(group.subtotal)}</td>
                    <td>${data.total !== 0 ? ((group.subtotal / data.total) * 100).toFixed(1) : 0}%</td>
                </tr>
            `;
            
            // Items
            for (const item of group.items) {
                const isNegative = item.nilai < 0;
                html += `
                    <tr class="item-row">
                        <td>${item.nama}</td>
                        <td class="${isNegative ? 'negative' : ''}">${formatRupiah(item.nilai)}</td>
                        <td>${data.total !== 0 ? ((item.nilai / data.total) * 100).toFixed(1) : 0}%</td>
                    </tr>
                `;
            }
        }
        
        // Total row
        html += `
            <tr class="total-row">
                <td>TOTAL</td>
                <td>${formatRupiah(data.total)}</td>
                <td>100%</td>
            </tr>
        `;
        
        tbody.innerHTML = html;
    }
    
    // ========================================
    // RENDER CHART
    // ========================================
    
    function renderChart(data) {
        const canvas = document.getElementById('ncdChart');
        if (!canvas) {
            console.warn('Chart canvas not found');
            return;
        }
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            document.getElementById('ncdChartLegend').innerHTML = `
                <div style="text-align:center;padding:20px;">
                    <p style="color:#64748b;">Loading chart...</p>
                </div>
            `;
            // Try again after a short delay
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    renderChart(data);
                }
            }, 500);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        chartInstance = new Chart(ctx, {
            type: data.type,
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.colors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${formatRupiah(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Render legend
        const legendHtml = data.labels.map((label, i) => `
            <div class="ncd-legend-item">
                <span class="ncd-legend-dot" style="background: ${data.colors[i]}"></span>
                <span>${label}: ${formatRupiah(data.data[i])}</span>
            </div>
        `).join('');
        
        document.getElementById('ncdChartLegend').innerHTML = legendHtml;
    }
    
    // ========================================
    // RENDER FOOTER
    // ========================================
    
    function renderFooter(data) {
        const statsHtml = data.groups.map(group => `
            <div class="ncd-stat-item">
                <span class="label">${group.nama}</span>
                <span class="value">${data.total !== 0 ? ((group.subtotal / data.total) * 100).toFixed(1) : 0}%</span>
            </div>
        `).join('');
        
        document.getElementById('ncdFooterStats').innerHTML = statsHtml;
    }
    
    // ========================================
    // HELPERS
    // ========================================
    
    function formatRupiah(value) {
        const abs = Math.abs(value);
        const sign = value < 0 ? '-' : '';
        
        if (abs >= 1e12) {
            return `${sign}Rp ${(abs / 1e12).toFixed(2)} T`;
        } else if (abs >= 1e9) {
            return `${sign}Rp ${(abs / 1e9).toFixed(2)} M`;
        } else if (abs >= 1e6) {
            return `${sign}Rp ${(abs / 1e6).toFixed(2)} Jt`;
        }
        return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
    }
    
    // ========================================
    // EXPORT FUNCTIONS
    // ========================================
    
    function exportExcel() {
        alert('Export Excel - Coming soon!');
    }
    
    function print() {
        window.print();
    }
    
    // ========================================
    // PUBLIC API
    // ========================================
    
    return {
        open,
        close,
        exportExcel,
        print
    };
    
})();

// Make it globally available
window.NeracaCardDetail = NeracaCardDetail;
