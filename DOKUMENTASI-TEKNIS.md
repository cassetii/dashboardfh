# DOKUMENTASI TEKNIS
## Dashboard Management System - Bank Sulselbar

---

## 1. OVERVIEW APLIKASI

### Jenis Aplikasi
**Single Page Application (SPA)** - Aplikasi web berbasis client-side yang berjalan sepenuhnya di browser tanpa memerlukan backend server khusus.

### Fungsi Utama
- Dashboard monitoring keuangan Bank Sulselbar
- Visualisasi data kinerja (Aset, DPK, Kredit, Laba, Rasio)
- Perbandingan Konvensional vs Syariah
- Import/Export data Excel
- Multi-user dengan role-based access control

---

## 2. TECH STACK

### Frontend (100% Client-Side)
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **HTML5** | - | Struktur halaman |
| **CSS3** | - | Styling & responsive design |
| **JavaScript (ES6+)** | - | Logic aplikasi |
| **ApexCharts** | Latest | Library charting/grafik |
| **SheetJS (XLSX)** | 0.20.1 | Baca/tulis file Excel |
| **Font Awesome** | 6.4.0 | Icon library |
| **Animate.css** | 4.1.1 | CSS animations |
| **Google Fonts (Inter)** | - | Typography |

### Backend
**TIDAK ADA** - Aplikasi ini murni client-side. Data disimpan di:
- LocalStorage browser (untuk session)
- File JavaScript (data statis)
- File Excel (untuk import/export)

---

## 3. ARSITEKTUR APLIKASI

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  HTML Files │  │  CSS Files  │  │  JS Files   │     │
│  │  (4 files)  │  │  (6 files)  │  │  (20 files) │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              DASHBOARD APP                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │ Charts  │ │ Data    │ │ User    │           │   │
│  │  │(Apex)   │ │ Manager │ │ Auth    │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘           │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│         ┌────────────────┼────────────────┐            │
│         ▼                ▼                ▼            │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐      │
│  │LocalStorage│    │Excel Files│    │ CDN Libs  │      │
│  │(Session)   │    │(Import/   │    │(ApexCharts│      │
│  │            │    │ Export)   │    │ SheetJS)  │      │
│  └───────────┘    └───────────┘    └───────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## 4. STRUKTUR FILE

```
Bank-Sulselbar-Final/
│
├── 📄 HTML FILES (Entry Points)
│   ├── index.html              # Redirect ke login
│   ├── login.html              # Halaman login
│   └── dashboard-enhanced.html # Main dashboard (SPA)
│
├── 🎨 CSS FILES (Styling)
│   ├── styles-enhanced.css     # Main stylesheet
│   ├── neraca-charts-styles.css
│   ├── neraca-layer2-styles.css
│   ├── konven-syariah-styles.css
│   ├── pendapatan-biaya-styles.css
│   └── imported-branches-styles.css
│
├── ⚙️ JAVASCRIPT FILES (Logic)
│   │
│   ├── [CORE]
│   │   ├── app-enhanced.js        # Main app controller
│   │   ├── data-enhanced.js       # Data store (BANK_DATA)
│   │   └── branch-data.js         # Data cabang
│   │
│   ├── [USER & AUTH]
│   │   ├── user-manager.js        # Login/logout, users
│   │   └── role-integration.js    # Role-based access
│   │
│   ├── [CHARTS & VISUALIZATION]
│   │   ├── neraca-charts.js       # Neraca section charts
│   │   ├── neraca-layer2-handler.js
│   │   ├── konven-syariah-handler.js
│   │   └── pendapatan-biaya-handler.js
│   │
│   ├── [DATA MANAGEMENT]
│   │   ├── office-connector.js    # Kode kantor (101 unit)
│   │   ├── target-manager.js      # Target management
│   │   ├── import-export-manager.js
│   │   └── daily-data-manager.js
│   │
│   ├── [FORECASTING]
│   │   ├── forecasting-engine.js  # Prediksi
│   │   └── arima-integration.js   # ARIMA model
│   │
│   └── [OTHER]
│       ├── branch-modal.js
│       ├── imported-branches-display.js
│       ├── neraca-detail-data.js
│       └── neraca-sync.js
│
├── 📊 DATA FILES
│   ├── bank-sulselbar-data.js     # Data lengkap
│   ├── bank-sulselbar-data-monthly.json
│   ├── bank-sulselbar-data-compact.json
│   ├── bank-sulselbar-summary.json
│   └── banksulselbardata.csv
│
├── 📁 EXCEL TEMPLATES
│   ├── Template_Import_Realisasi.xlsx
│   ├── Template_Input_Target.xlsx
│   ├── Template_Master_Cabang.xlsx
│   ├── Template_Kinerja_Bulanan.xlsx
│   ├── Daftar_Kode_Kantor.xlsx
│   └── [Januari-Oktober]_2025.xlsx  # Data bulanan
│
└── 📝 DOCUMENTATION
    ├── PANDUAN-DEPLOYMENT.md
    ├── DATA-OKTOBER-2025.md
    └── logobanksulselbar.png
```

---

## 5. EXTERNAL DEPENDENCIES (CDN)

Aplikasi memuat library dari CDN berikut:

| Library | CDN URL | Fungsi |
|---------|---------|--------|
| **ApexCharts** | `cdn.jsdelivr.net/npm/apexcharts` | Charting library untuk grafik interaktif |
| **SheetJS** | `cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js` | Baca/tulis file Excel (.xlsx) |
| **Font Awesome** | `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css` | Icon library |
| **Animate.css** | `cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css` | CSS animations |
| **Google Fonts** | `fonts.googleapis.com/css2?family=Inter` | Font Inter |

### ⚠️ PENTING:
Jika deploy di jaringan **TANPA INTERNET**, library ini harus di-download dan di-host lokal.

---

## 6. REQUIREMENTS

### Browser Support
| Browser | Minimum Version |
|---------|-----------------|
| Google Chrome | 80+ |
| Mozilla Firefox | 75+ |
| Microsoft Edge | 80+ |
| Safari | 13+ |

### Server Requirements
| Requirement | Specification |
|-------------|---------------|
| Web Server | Apache, Nginx, IIS, atau static file server |
| HTTPS | Recommended (untuk localStorage) |
| Backend | **TIDAK DIPERLUKAN** |
| Database | **TIDAK DIPERLUKAN** |
| PHP/Node.js | **TIDAK DIPERLUKAN** |

### Minimum Server Spec (untuk static hosting)
- CPU: 1 Core
- RAM: 512 MB
- Storage: 50 MB
- Bandwidth: Sesuai jumlah user

---

## 7. CARA DEPLOY

### Opsi 1: Web Server Biasa (Apache/Nginx)
```bash
# 1. Extract ZIP ke folder web server
unzip Bank-Sulselbar-Final.zip -d /var/www/html/

# 2. Set permission
chmod -R 755 /var/www/html/Bank-Sulselbar-Final/

# 3. Akses via browser
# http://localhost/Bank-Sulselbar-Final/login.html
```

### Opsi 2: Simple HTTP Server (Testing)
```bash
# Menggunakan Python
cd Bank-Sulselbar-Final
python3 -m http.server 8080

# Akses: http://localhost:8080/login.html
```

### Opsi 3: Nginx Config
```nginx
server {
    listen 80;
    server_name dashboard.banksulselbar.co.id;
    root /var/www/Bank-Sulselbar-Final;
    index login.html;
    
    location / {
        try_files $uri $uri/ /login.html;
    }
}
```

---

## 8. USER & ROLE MANAGEMENT

### Default Users
| Username | Password | Role | Akses |
|----------|----------|------|-------|
| admin | admin123 | Administrator | Full access |
| pincab_maros | pincab123 | Branch Manager | Cabang Maros |
| operator | operator123 | Operator | Input data |
| viewer | viewer123 | Viewer | View only |

### Role Permissions
| Permission | Admin | PINCAB | Operator | Viewer |
|------------|-------|--------|----------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View All Branches | ✅ | ❌ | ❌ | ❌ |
| Input Data | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ✅ | ❌ |

---

## 9. DATA FLOW

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Excel Files  │────▶│ SheetJS      │────▶│ JavaScript   │
│ (.xlsx)      │     │ Parser       │     │ Object       │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Dashboard    │◀────│ ApexCharts   │◀────│ BANK_DATA    │
│ UI           │     │ Render       │     │ Store        │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ LocalStorage │
                                          │ (Session)    │
                                          └──────────────┘
```

---

## 10. SECURITY CONSIDERATIONS

### Current State (Development)
- ⚠️ Password disimpan plain text di JavaScript
- ⚠️ Session menggunakan LocalStorage
- ⚠️ Tidak ada enkripsi

### Rekomendasi untuk Production
1. **Implementasi Backend** - Untuk autentikasi yang aman
2. **Database** - Untuk penyimpanan user & data
3. **HTTPS** - Wajib untuk production
4. **JWT/Session Token** - Untuk autentikasi
5. **Password Hashing** - bcrypt/argon2

---

## 11. MAINTENANCE

### Update Data Bulanan
1. Siapkan file Excel dengan format template
2. Buka dashboard → Menu Import Realisasi
3. Upload file Excel
4. Data otomatis ter-update

### Backup
```bash
# Backup seluruh aplikasi
tar -czvf backup-$(date +%Y%m%d).tar.gz Bank-Sulselbar-Final/
```

---

## 12. TROUBLESHOOTING

| Problem | Cause | Solution |
|---------|-------|----------|
| Chart tidak muncul | CDN blocked | Host ApexCharts lokal |
| Login tidak berfungsi | LocalStorage disabled | Enable LocalStorage di browser |
| Excel import error | Format tidak sesuai | Gunakan template yang disediakan |
| Blank page | JavaScript error | Check browser console (F12) |

---

## 13. CONTACT & SUPPORT

Untuk pertanyaan teknis, hubungi:
- Email: [IT Support Bank Sulselbar]
- Dokumentasi: Lihat file PANDUAN-DEPLOYMENT.md

---

*Dokumen ini dibuat untuk keperluan deployment dan maintenance Dashboard Bank Sulselbar.*
*Versi: 1.0 | Tanggal: Desember 2025*
