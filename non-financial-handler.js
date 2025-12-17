// =====================================================
// NON-FINANCIAL DASHBOARD HANDLER
// Bank Sulselbar Dashboard v20
// Layer 1: 18 Pie Chart Divisi
// Layer 2: Detail Departemen + List Proker
// Data dari Firebase: banksulselbar_proker
// =====================================================

// ==================== GLOBAL STATE ====================
let prokerData = {};  // Data dari Firebase
let currentYear = 2025;
let currentTriwulan = 'q3';

// Layout 18 Unit Kerja (6x3) sesuai gambar
const unitKerjaLayout = [
    ['SIMO', 'DTR', 'DKA', 'DCS', 'DHC', 'DTI'],
    ['DIB', 'DDL', 'DUM', 'DJS', 'DRK', 'DKK'],
    ['DKP', 'DMR', 'DAI', 'DSY', 'UPPK', 'DPLK']
];

// Mapping kode ke nama lengkap
const unitKerjaNames = {
    'SIMO': 'Divisi Strategy & Initiative Management Office',
    'DTR': 'Divisi Treasury',
    'DKA': 'Divisi Keuangan & Akuntansi',
    'DCS': 'Divisi Corporate Secretary',
    'DHC': 'Divisi Human Capital',
    'DTI': 'Divisi Teknologi Informasi',
    'DIB': 'Divisi Internasional Banking',
    'DDL': 'Divisi Digitalisasi dan Layanan',
    'DUM': 'Divisi Umum',
    'DJS': 'Divisi Dana & Jasa',
    'DRK': 'Divisi Ritel & Konsumer',
    'DKK': 'Divisi Korporasi & Komersial',
    'DKP': 'Divisi Kepatuhan',
    'DMR': 'Divisi Manajemen Risiko',
    'DAI': 'Divisi Audit Intern & Anti Fraud',
    'DSY': 'Divisi Usaha Syariah',
    'UPPK': 'Unit Penyelamatan & Penyelesaian Kredit',
    'DPLK': 'Unit Dana Pensiun Lembaga Keuangan'
};

// ==================== SAMPLE DATA (dari PDF Rekap Monitoring Proker Q3 2025) ====================
// Data ini akan di-override jika ada data dari Firebase

const sampleProkerData = {
    'SIMO': {
        kode: 'SIMO',
        nama: 'Divisi Strategy & Initiative Management Office',
        jumlahProker: 14,
        progress: { q1: 26.343, q2: 50.438, q3: 59.646, q4: 0 },
        departments: [
            {
                nama: 'Departemen Change Management Office',
                proker: [
                    { nama: 'Change Management Maturity Assessment', q1: 30, q2: 70, q3: 90, q4: 0 },
                    { nama: 'Penyusunan Culture Activation Program (CAP)', q1: 88.89, q2: 80, q3: 80, q4: 0 },
                    { nama: 'Penyusunan Roadmap Budaya Perusahaan', q1: 20, q2: 70, q3: 70, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Pengembangan Organisasi',
                proker: [
                    { nama: 'Penguatan Struktur Organisasi', q1: 30, q2: 50, q3: 70, q4: 0 },
                    { nama: 'Pengukuran Work Load Analysis (WLA)', q1: 0, q2: 0, q3: 0, q4: 0 },
                    { nama: 'Penyusunan Ketentuan Kualifikasi Jabatan', q1: 0, q2: 25, q3: 80, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Pembinaan Cabang',
                proker: [
                    { nama: 'Penetapan Standarisasi Performa Kinerja Bisnis Kantor Cabang', q1: 25, q2: 31.25, q3: 68.75, q4: 0 },
                    { nama: 'Evaluasi & Monitoring Pertumbuhan Dana Murah (CASA)', q1: 90, q2: 80, q3: 100, q4: 0 },
                    { nama: 'Pengadaan Aplikasi Dashboard Management System (Lanjutan)', q1: 0, q2: 37.5, q3: 37.5, q4: 0 },
                    { nama: 'Coaching & Mentoring Untuk Mengoptimalisasi Performa Bisnis', q1: 0, q2: 100, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Perencanaan Strategis & Kinerja Organisasi',
                proker: [
                    { nama: 'Enhancement Aplikasi Project Management', q1: 50, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Penyusunan Roadmap RAKB & Ketentuan RAKB', q1: 0, q2: 80, q3: 80, q4: 0 },
                    { nama: 'Penyusunan Dokumen Corporate Plan 2026-2030', q1: 90, q2: 95, q3: 95, q4: 0 }
                ]
            }
        ]
    },
    'DTR': {
        kode: 'DTR',
        nama: 'Divisi Treasury',
        jumlahProker: 10,
        progress: { q1: 39.583, q2: 74.167, q3: 86.667, q4: 0 },
        departments: [
            {
                nama: 'Departemen Asset & Liability Management',
                proker: [
                    { nama: 'Penyempurnaan SOP Kas Titipan Bank Indonesia', q1: 100, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Penyediaan Alternatif Sumber Pendanaan', q1: 45, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Pengadaan System Otomatisasi Perhitungan SBDK', q1: 0, q2: 60, q3: 60, q4: 0 },
                    { nama: 'Inisiasi Penerbitan Obligasi PUB IV Tahun 2025', q1: 10, q2: 90, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Treasury Product & Sales',
                proker: [
                    { nama: 'Pengadaan Bond Ritel System', q1: 25, q2: 60, q3: 90, q4: 0 },
                    { nama: 'Pengembangan Produk Treasury untuk Nasabah', q1: 55, q2: 90, q3: 90, q4: 0 },
                    { nama: 'Pengembangan Multibiller BPJSTK pada Kanal Digital', q1: 0, q2: 35, q3: 70, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Trading',
                proker: [
                    { nama: 'Optimalisasi Platform Trading Refinitiv Fxt', q1: 30, q2: 60, q3: 100, q4: 0 },
                    { nama: 'Peningkatan Aktivitas Proprietary Trading', q1: 100, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Diversifikasi Transaksi Major Currency Trading PUVA', q1: 30, q2: 60, q3: 60, q4: 0 }
                ]
            }
        ]
    },
    'DKA': {
        kode: 'DKA',
        nama: 'Divisi Keuangan & Akuntansi',
        jumlahProker: 12,
        progress: { q1: 42.917, q2: 70.417, q3: 88.959, q4: 0 },
        departments: [
            {
                nama: 'Departemen Akuntansi & Perpajakan',
                proker: [
                    { nama: 'Middleware PSAK 71/109', q1: 10, q2: 60, q3: 100, q4: 0 },
                    { nama: 'SOP Pajak Penghasilan (PPh 21)', q1: 70, q2: 70, q3: 100, q4: 0 },
                    { nama: 'Aplikasi E-Jurnal', q1: 0, q2: 20, q3: 55, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Operasional Keuangan',
                proker: [
                    { nama: 'Standarisasi Proses Bisnis Transaksi Sistem Pembayaran BI', q1: 30, q2: 70, q3: 92.5, q4: 0 },
                    { nama: 'Pemenuhan ketentuan Aplikasi SWIFT', q1: 100, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Penyusunan Kebijakan Operasional Transaksi Remittance', q1: 0, q2: 30, q3: 75, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Pelaporan & SIM Keuangan',
                proker: [
                    { nama: 'SOP Publikasi Bank', q1: 80, q2: 90, q3: 90, q4: 0 },
                    { nama: 'Evaluasi Dan Monitoring Penerapan DHN & OBOX Cabang', q1: 20, q2: 90, q3: 100, q4: 0 },
                    { nama: 'Enhancement Datamart', q1: 90, q2: 100, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Perencanaan & Pengendalian Keuangan',
                proker: [
                    { nama: 'Automasi Kalkulator Saham PT Bank Sulselbar', q1: 0, q2: 20, q3: 55, q4: 0 },
                    { nama: 'Revisi SOP Pencatatan Modal Saham dan Perhitungan Dividen', q1: 75, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Penyusunan Kebijakan Pengalihan Anggaran', q1: 40, q2: 95, q3: 100, q4: 0 }
                ]
            }
        ]
    },
    'DCS': {
        kode: 'DCS',
        nama: 'Divisi Corporate Secretary',
        jumlahProker: 13,
        progress: { q1: 6.806, q2: 36.639, q3: 55.194, q4: 0 },
        departments: [
            {
                nama: 'Departemen Humas & CSR',
                proker: [
                    { nama: 'Relational maintenance kepada nasabah via sosmed', q1: 18.75, q2: 56.25, q3: 68.75, q4: 0 },
                    { nama: 'Financial Edutainment', q1: 25, q2: 75, q3: 75, q4: 0 },
                    { nama: 'Pengadaan & Perbaikan Perangkat Usaha UMKM', q1: 0, q2: 25, q3: 75, q4: 0 },
                    { nama: 'Pembinaan UMKM', q1: 25, q2: 50, q3: 100, q4: 0 },
                    { nama: 'Daur Ulang Plastik dengan konsep RVM', q1: 0, q2: 60, q3: 80, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Kesekretariatan',
                proker: [
                    { nama: 'Penambahan fitur Digital sign pada Edoc', q1: 20, q2: 40, q3: 55, q4: 0 },
                    { nama: 'Pembuatan Aplikasi penomoran persuratan', q1: 0, q2: 0, q3: 75, q4: 0 },
                    { nama: 'Surat Edaran Implementasi Digital Sign', q1: 0, q2: 0, q3: 0, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Litigasi & Non Litigasi',
                proker: [
                    { nama: 'Sosialisasi Penanganan Hukum Bagi Internal', q1: 0, q2: 60, q3: 60, q4: 0 },
                    { nama: 'Sosialisasi Penanganan Hukum Bagi Pejabat Eksekutif', q1: 0, q2: 70, q3: 100, q4: 0 },
                    { nama: 'REVISI SOP PENANGANAN HUKUM', q1: 0, q2: 0, q3: 0, q4: 0 }
                ]
            }
        ]
    },
    'DHC': {
        kode: 'DHC',
        nama: 'Divisi Human Capital',
        jumlahProker: 10,
        progress: { q1: 26.111, q2: 61.944, q3: 69.445, q4: 0 },
        departments: [
            {
                nama: 'Departemen Strategi Human Capital',
                proker: [
                    { nama: 'Implementasi Reklasifikasi Kelas Cabang & Pemenuhan SDM', q1: 60, q2: 90, q3: 100, q4: 0 },
                    { nama: 'Pelaksanaan Evaluasi Kompetensi Pegawai', q1: 0, q2: 80, q3: 90, q4: 0 },
                    { nama: 'Evaluasi Talent Development Program', q1: 0, q2: 0, q3: 0, q4: 0 },
                    { nama: 'Penyempurnaan Kebijakan Pengelolaan Kinerja (KPI)', q1: 0, q2: 60, q3: 70, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Operasional Human Capital',
                proker: [
                    { nama: 'Penyesuaian ketentuan lembur UU No 6 Tahun 2023', q1: 40, q2: 70, q3: 70, q4: 0 },
                    { nama: 'Peralihan pengelolaan iuran dana pensiun', q1: 0, q2: 10, q3: 15, q4: 0 },
                    { nama: 'Penerapan Pembayaran Uang Pisah', q1: 0, q2: 40, q3: 70, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Pengembangan & Pelatihan',
                proker: [
                    { nama: 'Optimalisasi Aplikasi E-Learning', q1: 0, q2: 75, q3: 85, q4: 0 },
                    { nama: 'Job Development Program', q1: 80, q2: 90, q3: 90, q4: 0 },
                    { nama: 'Profesional Certification Program', q1: 70, q2: 100, q3: 100, q4: 0 }
                ]
            }
        ]
    },
    'DTI': {
        kode: 'DTI',
        nama: 'Divisi Teknologi Informasi',
        jumlahProker: 14,
        progress: { q1: 21.250, q2: 55.042, q3: 75.375, q4: 0 },
        departments: [
            {
                nama: 'Departemen Perencanaan & Pengembangan TI',
                proker: [
                    { nama: 'Penyusunan Dokumen ITSP 2026-2030', q1: 0, q2: 25, q3: 47.5, q4: 0 },
                    { nama: 'CMS Enhancement', q1: 10, q2: 60, q3: 90, q4: 0 },
                    { nama: 'Persiapan Pengembangan New Core Banking System', q1: 15, q2: 30, q3: 65, q4: 0 },
                    { nama: 'Mobile Banking Enhancement', q1: 20, q2: 70, q3: 100, q4: 0 },
                    { nama: 'Interkoneksi dengan pihak ketiga', q1: 5, q2: 45, q3: 42.5, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Infrastruktur & Jaringan',
                proker: [
                    { nama: 'Monitoring Terpusat untuk Data Center', q1: 35, q2: 90, q3: 90, q4: 0 },
                    { nama: 'Peningkatan Availability Internet DC dan DRC', q1: 35, q2: 90, q3: 95, q4: 0 },
                    { nama: 'DRC Enhancement Tahap II', q1: 35, q2: 90, q3: 95, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Operasional TI',
                proker: [
                    { nama: 'Support Upgrade Database Terkini', q1: 20, q2: 50, q3: 75, q4: 0 },
                    { nama: 'Support Pengembangan New CBS', q1: 0, q2: 20, q3: 60, q4: 0 },
                    { nama: 'Pengembangan Inventory Buku Tabungan', q1: 100, q2: 100, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Manajemen Proyek, Risiko & Keamanan TI',
                proker: [
                    { nama: 'Pengujian & Evaluasi Keamanan', q1: 0, q2: 30, q3: 60, q4: 0 },
                    { nama: 'IT Governance Enhancement', q1: 0, q2: 30, q3: 70, q4: 0 },
                    { nama: 'Peningkatan Teknologi Keamanan', q1: 0, q2: 22.5, q3: 52.5, q4: 0 }
                ]
            }
        ]
    },
    'DIB': {
        kode: 'DIB',
        nama: 'Divisi Internasional Banking',
        jumlahProker: 7,
        progress: { q1: 21.111, q2: 46.111, q3: 54.444, q4: 0 },
        departments: [
            {
                nama: 'Departemen Trade Finance & Remittance',
                proker: [
                    { nama: 'Penguatan/perbaikan Proses Bisnis Trade Finance', q1: 65, q2: 75, q3: 90, q4: 0 },
                    { nama: 'Trade Expo Bank Sulselbar', q1: 25, q2: 60, q3: 100, q4: 0 },
                    { nama: 'Otomasi Proses Bisnis Trade Finance (Multi years)', q1: 0, q2: 0, q3: 0, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Financial Institution',
                proker: [
                    { nama: 'Ekstensi Hubungan Korespondensi Dengan Bank Asing', q1: 70, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Review Limit Counterparty Bank', q1: 30, q2: 85, q3: 100, q4: 0 },
                    { nama: 'Aliansi Strategis dengan Manajer Investasi', q1: 0, q2: 95, q3: 100, q4: 0 }
                ]
            }
        ]
    },
    'DDL': {
        kode: 'DDL',
        nama: 'Divisi Digitalisasi dan Layanan',
        jumlahProker: 15,
        progress: { q1: 24.462, q2: 52.448, q3: 77.639, q4: 0 },
        departments: [
            {
                nama: 'Departemen Kualitas Layanan',
                proker: [
                    { nama: 'Layanan Contact Center', q1: 20, q2: 35, q3: 75, q4: 0 },
                    { nama: 'Pembuatan Blueprint Layanan & Produk Digital', q1: 0, q2: 25, q3: 50, q4: 0 },
                    { nama: 'Layanan Advisory Pods', q1: 20, q2: 47.5, q3: 65, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Jaringan & Delivery Channel',
                proker: [
                    { nama: 'Enhancement Aplikasi Laku Pandai', q1: 50, q2: 80, q3: 100, q4: 0 },
                    { nama: 'Standarisasi Penilaian Efektifitas Jaringan Payment Point', q1: 30, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Self Service Banking', q1: 50, q2: 80, q3: 80, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Produk Digital',
                proker: [
                    { nama: 'Kerjasama layanan Digital sektor Korporasi & Pemda', q1: 21.25, q2: 41.25, q3: 85, q4: 0 },
                    { nama: 'Enhancement CMS', q1: 22.5, q2: 22.5, q3: 65, q4: 0 },
                    { nama: 'Enhancement Cardless Withdrawal', q1: 15, q2: 55, q3: 95, q4: 0 },
                    { nama: 'Pengembangan Digital Loan', q1: 20, q2: 50, q3: 77.5, q4: 0 },
                    { nama: 'Program Marketing Digital', q1: 30, q2: 70, q3: 85, q4: 0 }
                ]
            }
        ]
    },
    'DUM': {
        kode: 'DUM',
        nama: 'Divisi Umum',
        jumlahProker: 10,
        progress: { q1: 40.037, q2: 66.944, q3: 80.187, q4: 0 },
        departments: [
            {
                nama: 'Departemen Kearsipan',
                proker: [
                    { nama: 'Penyusunan SE Penjualan Hasil Pemusnahan Arsip', q1: 80, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Pengembangan Aplikasi E-Arsip', q1: 70, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Digitalisasi Arsip Vital', q1: 10, q2: 50, q3: 50, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Manajemen Aset & Perkantoran',
                proker: [
                    { nama: 'Penerapan System Controller Management Building', q1: 31.58, q2: 45, q3: 47.37, q4: 0 },
                    { nama: 'Pengadaan Aplikasi Management Pengelolaan Asset', q1: 13.75, q2: 17.5, q3: 94.32, q4: 0 },
                    { nama: 'Sertifikasi SMK3L', q1: 15, q2: 0, q3: 30, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Pengadaan',
                proker: [
                    { nama: 'Digitalisasi Proses PBJ secara Menyeluruh', q1: 40, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Standarisasi Pelaksanaan Kebijakan Pemilihan Vendor PJTI', q1: 80, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Pemenuhan TKDN/P3DN dalam Pengadaan Barang & Jasa', q1: 20, q2: 90, q3: 100, q4: 0 }
                ]
            }
        ]
    },
    'DJS': {
        kode: 'DJS',
        nama: 'Divisi Dana & Jasa',
        jumlahProker: 13,
        progress: { q1: 32.500, q2: 75.417, q3: 95.208, q4: 0 },
        departments: [
            {
                nama: 'Departemen DPK Priority Banking & Wealth Management',
                proker: [
                    { nama: 'Saoraja Priority Merchant Expansion', q1: 40, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Development Sub-Website Saoraja Priority', q1: 30, q2: 80, q3: 95, q4: 0 },
                    { nama: 'Persiapan Implementasi Bancassurance', q1: 60, q2: 95, q3: 97.5, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Card Centre',
                proker: [
                    { nama: 'Strategi Pemasaran Produk Co-Branding', q1: 70, q2: 70, q3: 100, q4: 0 },
                    { nama: 'Otomatisasi Biaya Ganti Kartu & Reset PIN', q1: 50, q2: 65, q3: 85, q4: 0 },
                    { nama: 'Integrasi Data Card Inventory dan Aplikasi IACSS', q1: 45, q2: 90, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen DPK Retail Banking & E-Channel',
                proker: [
                    { nama: 'CS Cross Selling Reward', q1: 10, q2: 85, q3: 100, q4: 0 },
                    { nama: 'Implementasi Mamiri Bisnis', q1: 10, q2: 50, q3: 100, q4: 0 },
                    { nama: 'Peningkatan Sumber Pendanaan Stabil (Special Program CASA)', q1: 0, q2: 55, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen DPK Corporate Banking & E-Business',
                proker: [
                    { nama: 'Kerjasama Merchant', q1: 40, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Customer Gathering Bank Sulselbar', q1: 0, q2: 25, q3: 75, q4: 0 },
                    { nama: 'CMS Racing Contest', q1: 35, q2: 90, q3: 90, q4: 0 }
                ]
            }
        ]
    },
    'DRK': {
        kode: 'DRK',
        nama: 'Divisi Ritel & Konsumer',
        jumlahProker: 9,
        progress: { q1: 58.375, q2: 82.000, q3: 96.875, q4: 0 },
        departments: [
            {
                nama: 'Departemen Kredit Konsumtif',
                proker: [
                    { nama: 'Pengembangan Aplikasi ELOS', q1: 80, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Pemasaran Produk Kredit melalui Pihak ketiga', q1: 100, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Revisi Kebijakan Kredit Konsumtif', q1: 100, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Penambahan Fitur Permohonan Kredit Multiguna di Mobile Banking', q1: 70, q2: 70, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Kredit Ritel',
                proker: [
                    { nama: 'Literasi Keuangan Kepada UMK', q1: 21.25, q2: 81.25, q3: 81.25, q4: 0 },
                    { nama: 'Pengembangan SIM Data (SIKP, subsidi & IJP KUR)', q1: 40, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Penyusunan SOP Kredit UMK', q1: 30, q2: 45, q3: 100, q4: 0 },
                    { nama: 'Host to Host dengan BP2MI (SISKOP2MI)', q1: 25, q2: 36.25, q3: 100, q4: 0 },
                    { nama: 'Penyusunan Kebijakan Scoring Kredit UMK', q1: 30, q2: 95, q3: 100, q4: 0 }
                ]
            }
        ]
    },
    'DKK': {
        kode: 'DKK',
        nama: 'Divisi Korporasi & Komersial',
        jumlahProker: 8,
        progress: { q1: 43.490, q2: 61.111, q3: 65.000, q4: 0 },
        departments: [
            {
                nama: 'Departemen Kredit Menengah',
                proker: [
                    { nama: 'Ketentuan (SE) Perhitungan Analisa Kredit', q1: 60, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Meningkatkan Hubungan Kelembagaan dengan Pemda', q1: 70, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Reward Realisasi Kredit Produktif 2025', q1: 70, q2: 100, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Kredit Korporasi & Sindikasi',
                proker: [
                    { nama: 'Ketentuan (SE) Perpanjangan Sementara Fasilitas Kredit Revolving', q1: 73.91, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Revisi BPP Perkreditan PT Bank Sulselbar', q1: 25, q2: 60, q3: 85, q4: 0 },
                    { nama: 'Peningkatan Portofolio Kredit Sindikasi & Korporasi', q1: 90, q2: 90, q3: 100, q4: 0 }
                ]
            }
        ]
    },
    'DKP': {
        kode: 'DKP',
        nama: 'Divisi Kepatuhan',
        jumlahProker: 10,
        progress: { q1: 38.055, q2: 78.889, q3: 85.208, q4: 0 },
        departments: [
            {
                nama: 'Departemen Tata Kelola',
                proker: [
                    { nama: 'Surveillance Implementasi ISO-37001 SMAP', q1: 50, q2: 85, q3: 85, q4: 0 },
                    { nama: 'Peningkatan kualitas Aplikasi EWS', q1: 0, q2: 0, q3: 25, q4: 0 },
                    { nama: 'Implementasi Pelindungan Data Pribadi (PDP)', q1: 50, q2: 65, q3: 72.5, q4: 0 },
                    { nama: 'Member Hukum Online', q1: 10, q2: 90, q3: 90, q4: 0 }
                ]
            },
            {
                nama: 'Departemen APU-PPT',
                proker: [
                    { nama: 'Evaluasi dan Pengkinian SOP APU, PPT dan PPPSPM', q1: 0, q2: 55, q3: 87.5, q4: 0 },
                    { nama: 'Pembuatan Booklet terkait APU, PPT dan PPPSPM', q1: 50, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Pengkinian Individual Risk Assessment (IRA)', q1: 20, q2: 100, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Regulasi',
                proker: [
                    { nama: 'Evaluasi dan pengkinian Kebijakan Departemen Regulasi', q1: 60, q2: 90, q3: 90, q4: 0 },
                    { nama: 'Penyusunan Petunjuk Teknis Regulation Centre', q1: 100, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Penyelenggaraan Kompetisi Kefasihan Tahun 2025', q1: 30, q2: 85, q3: 85, q4: 0 }
                ]
            }
        ]
    },
    'DMR': {
        kode: 'DMR',
        nama: 'Divisi Manajemen Risiko',
        jumlahProker: 10,
        progress: { q1: 2.500, q2: 33.611, q3: 70.417, q4: 0 },
        departments: [
            {
                nama: 'Departemen Pengendalian Risiko Kredit/Pembiayaan',
                proker: [
                    { nama: 'Updating Aplikasi SIMR', q1: 0, q2: 35, q3: 80, q4: 0 },
                    { nama: 'Risk Premium', q1: 0, q2: 60, q3: 100, q4: 0 },
                    { nama: 'Penetapan Global Limit Pertanggungan Kredit', q1: 30, q2: 55, q3: 95, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Pengendalian Risiko Operasional & TI',
                proker: [
                    { nama: 'Risk Awareness', q1: 0, q2: 35, q3: 85, q4: 0 },
                    { nama: 'Penguatan kebijakan PDP dari sisi Manajemen risiko', q1: 0, q2: 35, q3: 76.25, q4: 0 },
                    { nama: 'Updating Aplikasi SIMR (Risiko Operasional)', q1: 0, q2: 35, q3: 80, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Pengendalian Risiko Pasar & Likuiditas',
                proker: [
                    { nama: 'Updating Aplikasi SIMR (PRC, PRKP & ORSA)', q1: 0, q2: 35, q3: 80, q4: 0 },
                    { nama: 'Pengkinian SOP LCR & NSFR', q1: 0, q2: 30, q3: 46.25, q4: 0 },
                    { nama: 'Pengukuran IRRBB', q1: 0, q2: 20, q3: 60, q4: 0 }
                ]
            }
        ]
    },
    'DAI': {
        kode: 'DAI',
        nama: 'Divisi Audit Intern & Anti Fraud',
        jumlahProker: 11,
        progress: { q1: 39.778, q2: 60.333, q3: 93.333, q4: 0 },
        departments: [
            {
                nama: 'Departemen Anti Fraud',
                proker: [
                    { nama: 'Penguatan Fraud Detection System (Sirita)', q1: 0, q2: 40, q3: 70, q4: 0 },
                    { nama: 'Strategi Membangun Budaya Sadar Risiko Fraud', q1: 60, q2: 60, q3: 100, q4: 0 },
                    { nama: 'Surprise Audit', q1: 0, q2: 0, q3: 100, q4: 0 },
                    { nama: 'Profiling Risiko Fraud terhadap setiap Pegawai', q1: 60, q2: 80, q3: 80, q4: 0 },
                    { nama: 'Penguatan Fraud Awareness', q1: 60, q2: 100, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Quality Assurance & Tindak Lanjut',
                proker: [
                    { nama: 'SKAI Terintegrasi dengan Perusahaan Anak', q1: 0, q2: 0, q3: 95, q4: 0 },
                    { nama: 'Perbaikan Tata Kelola Audit Internal', q1: 25, q2: 75, q3: 100, q4: 0 },
                    { nama: 'Peningkatan Mutu hasil pemeriksaan Audit Internal', q1: 0, q2: 50, q3: 100, q4: 0 }
                ]
            },
            {
                nama: 'Auditor',
                proker: [
                    { nama: 'Penilaian Efektifitas Pengendalian Internal Unit Kerja', q1: 100, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Audit Pasif', q1: 100, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Aplikasi Deteksi Anomali Login User VBS', q1: 25, q2: 50, q3: 75, q4: 0 }
                ]
            }
        ]
    },
    'DSY': {
        kode: 'DSY',
        nama: 'Divisi Usaha Syariah',
        jumlahProker: 10,
        progress: { q1: 52.258, q2: 70.764, q3: 85.278, q4: 0 },
        departments: [
            {
                nama: 'Departemen Pemasaran & Treasury Syariah',
                proker: [
                    { nama: 'Produk Bank Garansi', q1: 47.83, q2: 82.5, q3: 82.5, q4: 0 },
                    { nama: 'Klinik Bisnis Syariah', q1: 70, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Perizinan sebagai LKS Penerima Wakaf Uang (LKS PWU)', q1: 80, q2: 85, q3: 90, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Operasional Syariah',
                proker: [
                    { nama: 'Pengembangan Aplikasi Pelaporan Bank Sulselbar SLIK', q1: 30, q2: 47.5, q3: 47.5, q4: 0 },
                    { nama: 'Penyediaan Infrastruktur dan Teknologi di KLS', q1: 80, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Pemisahan Neraca UUS dan KCS Makassar', q1: 0, q2: 0, q3: 95, q4: 0 },
                    { nama: 'Pengembangan Produk Refinancing Pada CBS', q1: 30, q2: 65, q3: 82.5, q4: 0 }
                ]
            },
            {
                nama: 'Departemen Perencanaan & Pengembangan Usaha Syariah',
                proker: [
                    { nama: 'Repackaging HBC (Cross Cell Based)', q1: 80, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Employed Engagement on Internal Product', q1: 48.75, q2: 62.5, q3: 80, q4: 0 },
                    { nama: 'Sharia Business Governance Framework (SBGF)', q1: 38.75, q2: 47.5, q3: 71.25, q4: 0 }
                ]
            }
        ]
    },
    'UPPK': {
        kode: 'UPPK',
        nama: 'Unit Penyelamatan & Penyelesaian Kredit',
        jumlahProker: 3,
        progress: { q1: 35.000, q2: 80.000, q3: 86.667, q4: 0 },
        departments: [
            {
                nama: 'Unit Penyelamatan & Penyelesaian Kredit',
                proker: [
                    { nama: 'Penyelesaian Kredit Macet 5 Tahun Terakhir via Diskon Bunga', q1: 0, q2: 60, q3: 65, q4: 0 },
                    { nama: 'Reward Pencapaian Penagihan Kredit Intra & Ekstrakomptabel', q1: 40, q2: 100, q3: 100, q4: 0 },
                    { nama: 'Lelang Serentak Bank Sulselbar dan KPKNL', q1: 65, q2: 80, q3: 95, q4: 0 }
                ]
            }
        ]
    },
    'DPLK': {
        kode: 'DPLK',
        nama: 'Unit Dana Pensiun Lembaga Keuangan',
        jumlahProker: 3,
        progress: { q1: 8.333, q2: 31.667, q3: 79.167, q4: 0 },
        departments: [
            {
                nama: 'Unit Dana Pensiun Lembaga Keuangan',
                proker: [
                    { nama: 'Standarisasi Infrastruktur Dana Pensiun (POJK 15/2019)', q1: 0, q2: 0, q3: 67.5, q4: 0 },
                    { nama: 'Program Marketing DPLK', q1: 25, q2: 95, q3: 95, q4: 0 },
                    { nama: 'Enhancement pemeliharaan Instrument Investasi Peserta', q1: 0, q2: 0, q3: 75, q4: 0 }
                ]
            }
        ]
    }
};

// ==================== FIREBASE LOADER ====================

async function loadProkerFromFirebase() {
    // Use sample data first, then override with Firebase if available
    prokerData = JSON.parse(JSON.stringify(sampleProkerData));
    
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.warn('Firebase not available, using sample data');
        renderNonFinancialLayer1();
        return;
    }

    try {
        showNFLoading(true);
        const db = firebase.firestore();
        
        // Load dari collection banksulselbar_proker
        const snapshot = await db.collection('banksulselbar_proker')
            .where('tahun', '==', currentYear)
            .get();

        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                const data = doc.data();
                const kode = data.kode || data.kode_divisi;
                if (kode && prokerData[kode]) {
                    // Override with Firebase data
                    prokerData[kode] = {
                        ...prokerData[kode],
                        ...data,
                        kode: kode,
                        nama: data.nama || unitKerjaNames[kode] || kode
                    };
                }
            });
            console.log('✅ Proker data loaded from Firebase');
        } else {
            console.log('⚠️ No Firebase data, using sample data for year', currentYear);
        }

        showNFLoading(false);
        renderNonFinancialLayer1();
        
    } catch (error) {
        console.error('Firebase load error:', error);
        showNFLoading(false);
        // Still render with sample data
        renderNonFinancialLayer1();
    }
}

// ==================== LAYER 1: 18 PIE CHARTS ====================

function renderNonFinancialLayer1() {
    const container = document.getElementById('nfLayer1Content');
    if (!container) return;

    // Show Layer 1, hide Layer 2
    document.getElementById('nfLayer1')?.classList.remove('hidden');
    document.getElementById('nfLayer2')?.classList.add('hidden');

    // Update summary
    updateNFSummary();

    // Clear and render grid
    container.innerHTML = '';

    unitKerjaLayout.forEach(row => {
        row.forEach(kode => {
            const card = createDivisiCard(kode);
            container.appendChild(card);
        });
    });
}

function createDivisiCard(kode) {
    const card = document.createElement('div');
    card.className = 'nf-divisi-card';
    card.onclick = () => openDivisiDetail(kode);
    
    const data = prokerData[kode];
    const progress = data?.progress?.[currentTriwulan] || 0;

    card.innerHTML = `
        <div class="nf-chart-wrapper" id="chart-${kode}"></div>
    `;

    // Render chart after DOM insert
    setTimeout(() => renderDivisiPieChart(kode, progress), 50);

    return card;
}

function renderDivisiPieChart(kode, progress) {
    const el = document.getElementById(`chart-${kode}`);
    if (!el) return;

    const data = prokerData[kode];
    const q1 = data?.progress?.q1 || 0;
    const q2 = data?.progress?.q2 || 0;
    const q3 = data?.progress?.q3 || 0;
    const q4 = data?.progress?.q4 || 0;

    // 4 segmen warna seperti gambar (merah, hijau, biru, orange)
    const options = {
        series: [q1 || 0.1, q2 || 0.1, q3 || 0.1, q4 || 0.1],
        chart: {
            type: 'donut',
            height: 150,
            events: {
                click: () => openDivisiDetail(kode)
            }
        },
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        colors: ['#e74c3c', '#2ecc71', '#3498db', '#f39c12'],
        plotOptions: {
            pie: {
                donut: {
                    size: '60%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '11px',
                            fontWeight: 700,
                            offsetY: -5
                        },
                        value: {
                            show: true,
                            fontSize: '14px',
                            fontWeight: 700,
                            offsetY: 3,
                            formatter: () => `${progress.toFixed(0)}%`
                        },
                        total: {
                            show: true,
                            label: kode,
                            fontSize: '11px',
                            fontWeight: 700,
                            formatter: () => `${progress.toFixed(0)}%`
                        }
                    }
                }
            }
        },
        stroke: { width: 2, colors: ['#fff'] },
        legend: { show: false },
        dataLabels: { enabled: false },
        tooltip: {
            y: { formatter: val => `${val.toFixed(1)}%` }
        }
    };

    el.innerHTML = '';
    new ApexCharts(el, options).render();
}

function updateNFSummary() {
    let totalProker = 0;
    let totalProgress = 0;
    let highCount = 0;
    let lowCount = 0;
    let divCount = 0;

    Object.values(prokerData).forEach(div => {
        totalProker += div.jumlahProker || 0;
        const p = div.progress?.[currentTriwulan] || 0;
        totalProgress += p;
        divCount++;
        if (p >= 80) highCount++;
        if (p < 60) lowCount++;
    });

    // Jika tidak ada data dari Firebase, hitung dari layout
    if (divCount === 0) divCount = 18;

    const avgProgress = divCount > 0 ? totalProgress / divCount : 0;

    const el1 = document.getElementById('nfTotalProker');
    const el2 = document.getElementById('nfAvgProgress');
    const el3 = document.getElementById('nfHighPerformers');
    const el4 = document.getElementById('nfNeedsAttention');

    if (el1) el1.textContent = totalProker || '-';
    if (el2) el2.textContent = avgProgress > 0 ? avgProgress.toFixed(1) + '%' : '-';
    if (el3) el3.textContent = highCount;
    if (el4) el4.textContent = lowCount;
}

// ==================== LAYER 2: DETAIL DEPARTEMEN ====================

function openDivisiDetail(kode) {
    const data = prokerData[kode];
    
    // Show Layer 2, hide Layer 1
    document.getElementById('nfLayer1')?.classList.add('hidden');
    document.getElementById('nfLayer2')?.classList.remove('hidden');

    // Update header
    const headerEl = document.getElementById('nfLayer2Header');
    if (headerEl) {
        headerEl.innerHTML = `
            <button class="btn-back" onclick="backToNFLayer1()">
                <i class="fas fa-arrow-left"></i> Kembali
            </button>
            <div class="layer2-title">
                <h3>${kode}</h3>
                <p>${unitKerjaNames[kode] || kode}</p>
            </div>
            <div class="layer2-progress">
                <span class="progress-value">${(data?.progress?.[currentTriwulan] || 0).toFixed(1)}%</span>
                <span class="progress-label">Progress ${currentTriwulan.toUpperCase()}</span>
            </div>
        `;
    }

    // Render departments
    renderDepartmentList(kode, data);
}

function renderDepartmentList(kode, data) {
    const container = document.getElementById('nfLayer2Content');
    if (!container) return;

    const departments = data?.departments || [];

    if (departments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>Belum ada data departemen untuk ${kode}</p>
                <small>Silakan upload data melalui Admin Panel</small>
            </div>
        `;
        return;
    }

    let html = '';

    departments.forEach((dept, idx) => {
        const deptProgress = calculateDeptProgress(dept);
        const statusClass = deptProgress >= 80 ? 'success' : (deptProgress >= 60 ? 'warning' : 'danger');

        html += `
            <div class="dept-card">
                <div class="dept-header" onclick="toggleDeptProker(${idx})">
                    <div class="dept-info">
                        <h4>${dept.nama}</h4>
                        <span class="dept-proker-count">${dept.proker?.length || 0} Program Kerja</span>
                    </div>
                    <div class="dept-progress">
                        <div class="progress-bar-container">
                            <div class="progress-bar ${statusClass}" style="width: ${deptProgress}%"></div>
                        </div>
                        <span class="progress-text">${deptProgress.toFixed(1)}%</span>
                    </div>
                    <i class="fas fa-chevron-down dept-toggle" id="toggle-${idx}"></i>
                </div>
                <div class="dept-proker-list hidden" id="proker-list-${idx}">
                    ${renderProkerList(dept.proker || [])}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderProkerList(prokerList) {
    if (!prokerList.length) {
        return '<p class="no-proker">Tidak ada program kerja</p>';
    }

    let html = '<table class="proker-table"><thead><tr><th>Program Kerja</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Status</th></tr></thead><tbody>';

    prokerList.forEach(proker => {
        const current = proker[currentTriwulan] || proker.q3 || 0;
        const statusClass = current >= 80 ? 'success' : (current >= 60 ? 'warning' : 'danger');
        const statusText = current >= 100 ? 'Selesai' : (current >= 80 ? 'On Track' : (current >= 60 ? 'Progress' : 'Perlu Perhatian'));

        html += `
            <tr>
                <td class="proker-nama">${proker.nama}</td>
                <td>${(proker.q1 || 0).toFixed(0)}%</td>
                <td>${(proker.q2 || 0).toFixed(0)}%</td>
                <td><strong>${(proker.q3 || 0).toFixed(0)}%</strong></td>
                <td>${(proker.q4 || 0).toFixed(0)}%</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    return html;
}

function calculateDeptProgress(dept) {
    const prokerList = dept.proker || [];
    if (!prokerList.length) return 0;

    const total = prokerList.reduce((sum, p) => sum + (p[currentTriwulan] || p.q3 || 0), 0);
    return total / prokerList.length;
}

function toggleDeptProker(idx) {
    const list = document.getElementById(`proker-list-${idx}`);
    const toggle = document.getElementById(`toggle-${idx}`);
    
    if (list) {
        list.classList.toggle('hidden');
    }
    if (toggle) {
        toggle.classList.toggle('rotated');
    }
}

function backToNFLayer1() {
    document.getElementById('nfLayer1')?.classList.remove('hidden');
    document.getElementById('nfLayer2')?.classList.add('hidden');
}

// ==================== PERIOD CHANGE ====================

function changeNFPeriod() {
    const yearEl = document.getElementById('nfYearSelect');
    const triwulanEl = document.getElementById('nfTriwulanSelect');

    if (yearEl) currentYear = parseInt(yearEl.value);
    if (triwulanEl) currentTriwulan = triwulanEl.value;

    loadProkerFromFirebase();
}

// ==================== EXPORT ====================

function exportNonFinancialData() {
    const exportData = [];

    Object.values(prokerData).forEach(div => {
        if (div.departments?.length) {
            div.departments.forEach(dept => {
                dept.proker?.forEach(proker => {
                    exportData.push({
                        'Divisi': div.kode,
                        'Nama Divisi': div.nama,
                        'Departemen': dept.nama,
                        'Program Kerja': proker.nama,
                        'Q1 (%)': proker.q1 || 0,
                        'Q2 (%)': proker.q2 || 0,
                        'Q3 (%)': proker.q3 || 0,
                        'Q4 (%)': proker.q4 || 0
                    });
                });
            });
        } else {
            exportData.push({
                'Divisi': div.kode,
                'Nama Divisi': div.nama,
                'Departemen': '-',
                'Program Kerja': '-',
                'Q1 (%)': div.progress?.q1 || 0,
                'Q2 (%)': div.progress?.q2 || 0,
                'Q3 (%)': div.progress?.q3 || 0,
                'Q4 (%)': div.progress?.q4 || 0
            });
        }
    });

    if (!exportData.length) {
        showNFNotification('Tidak ada data untuk di-export', 'warning');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proker Non-Financial');
    XLSX.writeFile(wb, `NonFinancial_Proker_${currentTriwulan.toUpperCase()}_${currentYear}.xlsx`);

    showNFNotification('Export berhasil!', 'success');
}

// ==================== UTILITIES ====================

function showNFLoading(show) {
    const loader = document.getElementById('nfLoadingOverlay');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function showNFNotification(message, type = 'info') {
    const colors = { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#007bff' };
    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle', info: 'info-circle' };

    const notif = document.createElement('div');
    notif.style.cssText = `position:fixed;top:20px;right:20px;padding:16px 24px;background:${colors[type]};color:white;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;display:flex;align-items:center;gap:10px;animation:slideIn 0.3s ease;`;
    notif.innerHTML = `<i class="fas fa-${icons[type]}"></i> ${message}`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// ==================== INITIALIZATION ====================

function initNonFinancialDashboard() {
    console.log('🚀 Initializing Non-Financial Dashboard...');
    loadProkerFromFirebase();
}

// Event listener untuk navigasi
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            if (this.dataset.section === 'non-financial') {
                setTimeout(initNonFinancialDashboard, 100);
            }
        });
    });
});

// ==================== GLOBAL EXPORTS ====================
window.initNonFinancialDashboard = initNonFinancialDashboard;
window.loadProkerFromFirebase = loadProkerFromFirebase;
window.changeNFPeriod = changeNFPeriod;
window.exportNonFinancialData = exportNonFinancialData;
window.openDivisiDetail = openDivisiDetail;
window.backToNFLayer1 = backToNFLayer1;
window.toggleDeptProker = toggleDeptProker;

console.log('✅ Non-Financial Module Loaded');
