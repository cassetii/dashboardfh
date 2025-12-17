# 📋 INSTRUKSI PENGGUNAAN FILE UPDATE
================================

## 📁 FILE DALAM ZIP INI:

1. **dashboard-firebase-integration.js** - TIMPA file yang ada
2. **financial-analytics.js** - TAMBAH (file baru)
3. **analytics-section-handler.js** - TAMBAH (file baru)

---

## 🔧 LANGKAH 1: TIMPA/TAMBAH FILE

Copy 3 file JS di atas ke folder hajarmi Anda (timpa yang lama jika ada).

---

## 🔧 LANGKAH 2: EDIT dashboard-enhanced.html

### A. Tambahkan November di dropdown periode (sekitar baris 246)

CARI:
```html
<select id="headerPeriodSelect">
    <option value="2025-10">Oktober 2025</option>
```

GANTI MENJADI:
```html
<select id="headerPeriodSelect">
    <option value="2025-11">November 2025</option>
    <option value="2025-10">Oktober 2025</option>
```

### B. Tambahkan script baru (cari baris dengan dashboard-firebase-integration.js)

CARI:
```html
<script src="dashboard-firebase-integration.js"></script>
```

TAMBAH DI BAWAHNYA:
```html
<script src="financial-analytics.js"></script>
<script src="analytics-section-handler.js"></script>
```

### C. (OPSIONAL) Update Analytics Section

Jika ingin tab Analytics yang lebih lengkap, cari section dengan id="analyticsSection" 
dan ganti isinya dengan kode di file ANALYTICS-SECTION-HTML.txt

---

## ✅ HASIL YANG DIDAPAT:

1. **Dropdown periode** dinamis dari Firebase (otomatis detect bulan)
2. **Financial Ratio** mengambil nilai dari Excel (bukan kalkulasi manual):
   - LDR: 107.38% (dari Excel)
   - BOPO: 75.44% (dari Excel)
   - ROA, ROE, NIM, NPL, CAR, CASA, NSFR, LCR

3. **Tab Analytics** dengan:
   - Tabel MoM / YTD / YoY
   - Trend Chart 12 bulan
   - Narasi otomatis
   - Ratio Cards

---

## ⚠️ PENTING - RE-UPLOAD DATA EXCEL

Setelah update, Anda HARUS upload ulang file Excel di Admin Panel
agar data ratio tersimpan dengan benar ke Firebase.

File yang perlu diupload:
- Neraca_31012025.xlsx (dan bulan lainnya)
- Labarugi_31012025.xlsx (dan bulan lainnya)

---

## 🔐 LOGIN:
- Username: simo
- Password: simo1234
