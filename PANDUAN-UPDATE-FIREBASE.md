# 📋 PANDUAN UPDATE KE VERSI FIREBASE

## ✅ Perubahan yang Telah Dilakukan

### File Baru (Semua data dari Firebase):
| File Baru | Menggantikan | Fungsi |
|-----------|--------------|--------|
| `firebase-data-service.js` | - | Service utama query Firebase |
| `data-enhanced-firebase.js` | `data-enhanced.js` | Data ratios & neraca utama |
| `branch-data-firebase.js` | `branch-data.js` | Data kinerja per cabang |
| `konven-syariah-handler-firebase.js` | `konven-syariah-handler.js` | Perbandingan Konven vs Syariah |
| `neraca-detail-data-firebase.js` | `neraca-detail-data.js` | Detail pos neraca |

### File yang Dihapus (Dipindah ke `_backup/`):
- `bank-sulselbar-data.js` - Data harian 366 hari (tidak perlu)
- `arima-integration.js` - Fitur forecasting ARIMA (dihapus sesuai permintaan)

---

## 🔧 Cara Update HTML Dashboard

### LANGKAH 1: Update Script References

Buka file `dashboard-enhanced.html` atau `dashboard-enhanced-firebase.html`

**HAPUS script lama:**
```html
<!-- HAPUS BARIS INI -->
<script src="data-enhanced.js"></script>
<script src="branch-data.js"></script>
<script src="konven-syariah-handler.js"></script>
<script src="neraca-detail-data.js"></script>
<script src="bank-sulselbar-data.js"></script>
<script src="arima-integration.js"></script>
```

**GANTI dengan script baru (urutan penting!):**
```html
<!-- Firebase SDK (letakkan di <head> atau sebelum script lain) -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>

<!-- Firebase Connector (konfigurasi) -->
<script src="firebase-connector.js"></script>

<!-- Firebase Data Service (HARUS PERTAMA setelah connector) -->
<script src="firebase-data-service.js"></script>

<!-- Data Loaders (setelah service) -->
<script src="data-enhanced-firebase.js"></script>
<script src="branch-data-firebase.js"></script>
<script src="konven-syariah-handler-firebase.js"></script>
<script src="neraca-detail-data-firebase.js"></script>

<!-- App Scripts -->
<script src="app-enhanced.js"></script>
<!-- ... script lainnya ... -->
```

---

### LANGKAH 2: Rename File (Opsional)

Jika tidak ingin mengubah banyak referensi di HTML, Anda bisa rename file:

```bash
# Backup file lama
mv data-enhanced.js data-enhanced.js.old
mv branch-data.js branch-data.js.old
mv konven-syariah-handler.js konven-syariah-handler.js.old
mv neraca-detail-data.js neraca-detail-data.js.old

# Rename file baru
mv data-enhanced-firebase.js data-enhanced.js
mv branch-data-firebase.js branch-data.js
mv konven-syariah-handler-firebase.js konven-syariah-handler.js
mv neraca-detail-data-firebase.js neraca-detail-data.js
```

---

## 📊 Struktur Data Firebase yang Digunakan

### Collection: `banksulselbar_neraca`
```javascript
{
    id: "2025-01_001_010000000000",
    periode: "2025-01",
    kode_cabang: "001",
    nama_cabang: "KANTOR PUSAT",
    sandi: "01.00.00.00.00.00",
    pos: "TOTAL ASET",
    tipe: "konvensional",
    rupiah: 8835098738466,
    valas: 207127979516,
    total: 9042226717982
}
```

### Collection: `banksulselbar_labarugi`
```javascript
{
    id: "2025-01_001_030502010000",
    periode: "2025-01",
    kode_cabang: "001",
    nama_cabang: "KANTOR PUSAT",
    sandi: "03.05.02.01.00.00",
    pos: "Laba Bersih Tahun Berjalan",
    tipe: "konvensional",
    rupiah: 0,
    valas: 0,
    total: 0
}
```

---

## 🔍 Sandi/Kode Penting

### NERACA - ASET (dimulai dengan 01)
| Sandi | Pos |
|-------|-----|
| 01.00.00.00.00.00 | TOTAL ASET |
| 01.01.00.00.00.00 | Kas |
| 01.02.00.00.00.00 | Penempatan pada BI |
| 01.03.00.00.00.00 | Penempatan pada Bank Lain |
| 01.05.00.00.00.00 | Surat Berharga |
| 01.09.00.00.00.00 | Kredit |
| 01.09.01.00.00.00 | Kredit yang Diberikan |
| 01.09.02.00.00.00 | Pembiayaan Syariah |
| 01.12.00.00.00.00 | Aset Tetap |

### NERACA - LIABILITAS (dimulai dengan 02)
| Sandi | Pos |
|-------|-----|
| 02.01.00.00.00.00 | Giro |
| 02.02.00.00.00.00 | Tabungan |
| 02.03.00.00.00.00 | Deposito |
| 02.05.00.00.00.00 | Pinjaman Diterima |

### NERACA - EKUITAS (dimulai dengan 03)
| Sandi | Pos |
|-------|-----|
| 03.01.00.00.00.00 | Modal |
| 03.02.00.00.00.00 | Cadangan |
| 03.05.00.00.00.00 | Laba/Rugi |
| 03.05.02.01.00.00 | Laba Bersih |

---

## 🧪 Testing

Setelah update, buka Console browser (F12) dan cek:

```javascript
// Cek FirebaseDataService
FirebaseDataService.isInitialized  // harus true

// Cek BANK_DATA
BANK_DATA.metadata.isLoaded  // harus true
BANK_DATA.neraca.asset.current  // harus ada nilai

// Cek BRANCH_DATA
BRANCH_DATA.isLoaded  // harus true
Object.keys(BRANCH_DATA.names).length  // jumlah cabang

// Cek KONVEN_SYARIAH_DATA
KONVEN_SYARIAH_DATA.isLoaded  // harus true
KONVEN_SYARIAH_DATA.perbandingan.asset  // harus ada data
```

---

## ⚠️ Troubleshooting

### Error: "FirebaseDataService not found"
**Solusi:** Pastikan urutan script benar. `firebase-data-service.js` harus di-load sebelum file data lainnya.

### Error: "Firebase SDK not loaded"
**Solusi:** Pastikan Firebase SDK di-load di awal:
```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
```

### Data tidak muncul / kosong
**Cek:**
1. Buka Console, lihat error message
2. Pastikan Firebase Rules mengizinkan read
3. Cek apakah collection sudah ada data

### Periode tidak ditemukan
**Solusi:** Data di Firebase harus punya field `periode` dengan format "YYYY-MM" (contoh: "2025-01")

---

## 📁 Struktur File Final

```
hajarmi/
├── firebase-connector.js          # Konfigurasi Firebase
├── firebase-data-service.js       # ✨ BARU - Service utama
├── data-enhanced-firebase.js      # ✨ BARU - Data utama
├── branch-data-firebase.js        # ✨ BARU - Data cabang
├── konven-syariah-handler-firebase.js  # ✨ BARU - Konven vs Syariah
├── neraca-detail-data-firebase.js # ✨ BARU - Detail neraca
├── app-enhanced.js                # App logic (tidak berubah)
├── dashboard-enhanced.html        # HTML (perlu update script)
├── _backup/                       # File lama
│   ├── bank-sulselbar-data.js     # Data harian (dihapus)
│   └── arima-integration.js       # ARIMA (dihapus)
└── ...
```

---

## 🎉 Selesai!

Setelah update, dashboard akan:
- ✅ Mengambil semua data dari Firebase secara live
- ✅ Tidak ada data hardcode/statis
- ✅ Auto-refresh saat periode berubah
- ✅ Support multiple periode
- ✅ Support view per cabang
- ✅ Support konvensional vs syariah
