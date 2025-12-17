# 🔥 PANDUAN INTEGRASI FIREBASE - BANK SULSELBAR

## Ringkasan

Paket ini berisi semua file yang diperlukan untuk mengintegrasikan Dashboard Bank Sulselbar dengan Firebase Firestore sebagai database cloud.

---

## 📁 Daftar File

### Data JSON
| File | Keterangan |
|------|------------|
| `firebase_import_data.json` | Data lengkap untuk bulk import (branches + 10 bulan data) |
| `branches_master.json` | Master data 37 cabang |
| `monthly_2025_XX.json` | Data bulanan per periode |
| `summary_all_months.json` | Ringkasan semua bulan |

### Integration Files
| File | Keterangan |
|------|------------|
| `firebase-connector.js` | Module JavaScript untuk koneksi Firebase di dashboard |
| `admin-panel.html` | Admin panel untuk upload & manage data |

---

## 🚀 LANGKAH-LANGKAH SETUP

### STEP 1: Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik "Create a project" atau "Add project"
3. Beri nama project: `bank-sulselbar-dashboard`
4. Disable Google Analytics (opsional)
5. Klik "Create project"

### STEP 2: Setup Firestore Database

1. Di Firebase Console, klik "Build" → "Firestore Database"
2. Klik "Create database"
3. Pilih "Start in test mode" (untuk development)
4. Pilih lokasi: `asia-southeast2` (Jakarta)
5. Klik "Done"

### STEP 3: Dapatkan Konfigurasi Firebase

1. Di Firebase Console, klik ⚙️ (Settings) → "Project settings"
2. Scroll ke "Your apps" → klik ikon `</>`  (Web)
3. Register app: `bank-sulselbar-web`
4. Copy konfigurasi yang muncul:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "bank-sulselbar-xxx.firebaseapp.com",
  projectId: "bank-sulselbar-xxx",
  storageBucket: "bank-sulselbar-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### STEP 4: Import Data via Admin Panel

1. Buka file `admin-panel.html` di browser
2. Masukkan konfigurasi Firebase
3. Klik "Connect to Firebase"
4. Upload file `firebase_import_data.json`
5. Klik "Bulk Import ke Firebase"
6. Tunggu sampai selesai

### STEP 5: Integrasi ke Dashboard

Tambahkan di `dashboard-enhanced.html` sebelum `</head>`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Firebase Connector -->
<script src="firebase-connector.js"></script>
```

Tambahkan di akhir file (sebelum `</body>`):

```html
<script>
// Inisialisasi Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com"
};

// Connect ke Firebase
FirebaseConnector.init(firebaseConfig).then(() => {
  console.log('Firebase connected!');
  loadDashboardData();
});

// Load data dari Firebase
async function loadDashboardData() {
  try {
    // Get data bulan terbaru
    const periods = await FirebaseConnector.getAvailablePeriods();
    const latestPeriod = periods[0].period;
    
    // Get data konsolidasi
    const data = await FirebaseConnector.getKonsolidasi(latestPeriod);
    console.log('Data loaded:', data);
    
    // Update dashboard dengan data baru
    updateDashboardUI(data);
    
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function updateDashboardUI(data) {
  // Update total aset
  if (document.getElementById('totalAset')) {
    document.getElementById('totalAset').textContent = 
      FirebaseConnector.formatRupiah(data.neraca.total_aset, 'triliun');
  }
  
  // Update total DPK
  if (document.getElementById('totalDPK')) {
    document.getElementById('totalDPK').textContent = 
      FirebaseConnector.formatRupiah(data.neraca.total_dpk, 'triliun');
  }
  
  // Update total kredit
  if (document.getElementById('totalKredit')) {
    document.getElementById('totalKredit').textContent = 
      FirebaseConnector.formatRupiah(data.neraca.kredit, 'triliun');
  }
}
</script>
```

---

## 📊 Struktur Data di Firestore

```
firestore/
├── branches/               # Koleksi master cabang
│   ├── 010/               # Document per kode cabang
│   │   ├── kode: "010"
│   │   ├── nama: "Cabang Maros"
│   │   ├── type: "konvensional"
│   │   └── status: "aktif"
│   ├── 011/
│   └── ...
│
└── monthlyData/           # Koleksi data bulanan
    ├── 2025-01/           # Document per periode
    │   ├── metadata: { period, periodName, month, year }
    │   ├── neraca: {
    │   │   konsolidasi: { total_aset, kredit, total_dpk, ... },
    │   │   konvensional: { ... },
    │   │   syariah: { ... },
    │   │   branches: { 010: {...}, 011: {...}, ... }
    │   │ }
    │   ├── labarugi: { ... }
    │   ├── ratios: { ... }
    │   └── summary: { totalAset, totalDPK, totalKredit, ... }
    ├── 2025-02/
    └── ...
```

---

## 🔧 API Firebase Connector

### Inisialisasi
```javascript
await FirebaseConnector.init(firebaseConfig);
```

### Get Data Cabang
```javascript
// Semua cabang
const branches = await FirebaseConnector.getBranches();

// Cabang tertentu
const maros = await FirebaseConnector.getBranch('010');

// Cabang by type
const syariah = await FirebaseConnector.getBranchesByType('syariah');
```

### Get Data Bulanan
```javascript
// Data satu bulan
const oktober = await FirebaseConnector.getMonthlyData('2025-10');

// Semua data bulanan
const allData = await FirebaseConnector.getAllMonthlyData();

// Range tertentu
const q3 = await FirebaseConnector.getMonthlyDataRange('2025-07', '2025-09');
```

### Get Data Konsolidasi
```javascript
// Data konsolidasi
const konsol = await FirebaseConnector.getKonsolidasi('2025-10');

// Perbandingan Konven vs Syariah
const comparison = await FirebaseConnector.getKonvenVsSyariah('2025-10');
```

### Get Trend Data Cabang
```javascript
const periods = ['2025-01', '2025-02', '2025-03'];
const trend = await FirebaseConnector.getBranchTrend('010', periods);
```

### Compare Branches
```javascript
const branches = ['010', '011', '130'];
const compare = await FirebaseConnector.compareBranches(branches, '2025-10');
```

### Real-time Listener
```javascript
// Subscribe ke perubahan
const unsubscribe = FirebaseConnector.subscribeToMonthlyData('2025-10', (data) => {
  console.log('Data updated:', data);
  updateUI(data);
});

// Unsubscribe
unsubscribe();
```

### Utility Functions
```javascript
// Format Rupiah
FirebaseConnector.formatRupiah(34451934471535, 'triliun'); // "Rp 34.45 T"
FirebaseConnector.formatRupiah(506048733468, 'miliar');    // "Rp 506.05 M"
FirebaseConnector.formatRupiah(value, 'auto');             // Auto detect

// Format Percentage
FirebaseConnector.formatPercent(93.63, 2); // "93.63%"
```

---

## ⚠️ Security Rules (Production)

Untuk production, update Firestore Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Branches - read only untuk semua, write untuk admin
    match /branches/{branchId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Monthly data - read only untuk semua, write untuk admin
    match /monthlyData/{period} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

---

## 📈 Data Summary (Jan - Okt 2025)

| Periode | Total Aset | Total DPK | Total Kredit | LDR |
|---------|------------|-----------|--------------|-----|
| Januari 2025 | Rp 31.94 T | Rp 20.15 T | Rp 21.42 T | 106.30% |
| Februari 2025 | Rp 31.44 T | Rp 19.77 T | Rp 21.48 T | 108.69% |
| Maret 2025 | Rp 32.17 T | Rp 18.81 T | Rp 21.51 T | 114.32% |
| April 2025 | Rp 32.34 T | Rp 20.54 T | Rp 21.44 T | 104.37% |
| Mei 2025 | Rp 32.81 T | Rp 20.88 T | Rp 21.44 T | 102.69% |
| Juni 2025 | Rp 33.13 T | Rp 20.48 T | Rp 21.49 T | 104.94% |
| Juli 2025 | Rp 33.06 T | Rp 21.37 T | Rp 21.44 T | 100.35% |
| Agustus 2025 | Rp 34.86 T | Rp 23.62 T | Rp 21.46 T | 90.85% |
| September 2025 | Rp 34.20 T | Rp 22.71 T | Rp 21.50 T | 94.68% |
| Oktober 2025 | Rp 34.45 T | Rp 22.97 T | Rp 21.51 T | 93.63% |

---

## 🆘 Troubleshooting

### Error: "Firebase not initialized"
- Pastikan Firebase SDK sudah di-include
- Pastikan `FirebaseConnector.init()` dipanggil sebelum operasi lain

### Error: "Permission denied"
- Cek Firestore Rules
- Pastikan dalam "test mode" untuk development

### Data tidak muncul
- Cek Console browser untuk error
- Pastikan data sudah di-import via Admin Panel
- Cek connection status di Admin Panel

---

## 📞 Support

Jika ada pertanyaan atau masalah, silakan hubungi tim IT Bank Sulselbar.

---

*Dokumen ini dibuat pada Desember 2025*
