# PANDUAN INTEGRASI DATA REAL EXCEL
## Bank Sulselbar Dashboard

---

## 📁 FILE YANG PERLU DIGANTI

Ganti file-file berikut di folder project Anda:

| File Lama | File Baru | Ukuran |
|-----------|-----------|--------|
| `data-enhanced.js` | ✅ Sudah diupdate | 26 KB |
| `konven-syariah-handler.js` | ✅ Sudah diupdate | 21 KB |
| `branch-data.js` | ✅ Sudah diupdate | 21 KB |

---

## 🔧 LANGKAH INTEGRASI

### Langkah 1: Download File Baru
Download semua file dari output folder dan simpan ke folder project Anda.

### Langkah 2: Pastikan Urutan Script di HTML
Buka `dashboard-enhanced.html` dan pastikan urutan script seperti ini:

```html
<!-- Di bagian bawah sebelum </body> -->

<!-- Data Files - HARUS URUT -->
<script src="data-enhanced.js"></script>
<script src="branch-data.js"></script>
<script src="konven-syariah-handler.js"></script>

<!-- Handler Files -->
<script src="app-enhanced.js"></script>
<!-- script lainnya... -->
```

### Langkah 3: Refresh Browser
Buka dashboard di browser dan refresh (Ctrl+F5 untuk hard refresh).

---

## 📊 CARA MENGAKSES DATA

### A. Data Utama (BANK_DATA)

```javascript
// Ambil metadata
console.log(BANK_DATA.metadata.period);  // "Oktober 2025"

// Ambil data neraca
console.log(BANK_DATA.neraca.asset.current);        // 34.81 (Triliun)
console.log(BANK_DATA.neraca.kredit.current);       // 23.0 (Triliun)
console.log(BANK_DATA.neraca.dpkKonvensional.current); // 23.1 (Triliun)
console.log(BANK_DATA.neraca.labaRugi.current);     // 904.7 (Miliar)

// Ambil data rasio
console.log(BANK_DATA.ratios.LDR.current);   // 92.5
console.log(BANK_DATA.ratios.NPL.current);   // 3.24
console.log(BANK_DATA.ratios.ROA.current);   // 2.57
console.log(BANK_DATA.ratios.CAR.current);   // 28.35
console.log(BANK_DATA.ratios.CASA.current);  // 59.18

// Ambil data historis (untuk chart)
console.log(BANK_DATA.ratios.LDR.monthlyData);
// Output: [{month: "Jan", value: 105.06, target: 92}, ...]

// Helper function
const latest = BANK_DATA.getLatestData();
console.log(latest);
// Output: {period, totalAset, dpk, kredit, labaBersih, car, npl, roa, ldr}
```

### B. Data Konven vs Syariah (KONVEN_SYARIAH_DATA)

```javascript
// Perbandingan utama
const perbandingan = KONVEN_SYARIAH_DATA.perbandingan;

// Aset
console.log(perbandingan.asset.total);      // 34.81 T
console.log(perbandingan.asset.konven);     // 31.64 T (90.9%)
console.log(perbandingan.asset.syariah);    // 3.17 T (9.1%)

// Kredit
console.log(perbandingan.kredit.total);     // 23.0 T
console.log(perbandingan.kredit.konven);    // 21.83 T (94.9%)
console.log(perbandingan.kredit.syariah);   // 1.16 T (5.1%)

// DPK
console.log(perbandingan.dpk.total);        // 24.86 T
console.log(perbandingan.dpk.konven);       // 23.1 T (92.9%)
console.log(perbandingan.dpk.syariah);      // 1.76 T (7.1%)

// Laba
console.log(perbandingan.laba.total);       // 904.7 M
console.log(perbandingan.laba.konven);      // 814.13 M (90%)
console.log(perbandingan.laba.syariah);     // 90.57 M (10%)

// Detail Pendapatan
console.log(KONVEN_SYARIAH_DATA.pendapatan.konven.bunga.value);  // 2093.88 M
console.log(KONVEN_SYARIAH_DATA.pendapatan.syariah.imbalHasil.value); // 139.0 M

// Detail Biaya
console.log(KONVEN_SYARIAH_DATA.biaya.konven.bunga.value);       // 864.56 M
console.log(KONVEN_SYARIAH_DATA.biaya.syariah.bagiHasil.value);  // 21.71 M

// Ringkasan Laba Rugi
console.log(KONVEN_SYARIAH_DATA.ringkasan.konven.labaBersih);    // 814.13 M
console.log(KONVEN_SYARIAH_DATA.ringkasan.syariah.labaBersih);   // 90.57 M

// DPK Breakdown
console.log(KONVEN_SYARIAH_DATA.dpkBreakdown.konven);
// {giro: 8.31, tabungan: 5.36, deposito: 9.43, total: 23.1}
```

### C. Data Cabang (BRANCH_DATA)

```javascript
// Daftar cabang
console.log(BRANCH_DATA.konvensional);  // 31 cabang konvensional
console.log(BRANCH_DATA.syariah);       // 4 cabang syariah

// Data kinerja per cabang
console.log(BRANCH_DATA.performance.aset['jakarta']);
// {value: 7631.06, percentage: 95.2, target: 8012.61}

console.log(BRANCH_DATA.performance.kredit['makassar']);
// {value: 3399.76, percentage: 95.2, target: 3569.75}

// Helper functions
const branch = BranchDataHelper.getBranch('jakarta');
console.log(branch);
// {id: 'jakarta', name: 'Cabang Jakarta', type: 'cabang', kode: '110'}

// Top 10 cabang by aset
const top10 = BranchDataHelper.getRanking('aset', 10);
console.log(top10);
// [{rank: 1, id: 'jakarta', name: 'Cabang Khusus Jakarta', value: 7631.06}, ...]

// Top 5 cabang by kredit
const top5Kredit = BranchDataHelper.getRanking('kredit', 5);
```

---

## 📈 CONTOH PENGGUNAAN DI CHART

### Chart Trend Aset (ApexCharts)

```javascript
// Data untuk line chart
const chartData = BANK_DATA.neraca.asset.historical;

const options = {
    series: [{
        name: 'Total Aset',
        data: chartData.map(d => d.value)
    }],
    chart: { type: 'line', height: 350 },
    xaxis: {
        categories: chartData.map(d => d.period)
    },
    yaxis: {
        labels: {
            formatter: (val) => `Rp ${val} T`
        }
    }
};

const chart = new ApexCharts(document.querySelector("#chart-aset"), options);
chart.render();
```

### Chart Pie Konven vs Syariah

```javascript
const perbandingan = KONVEN_SYARIAH_DATA.perbandingan.asset;

const options = {
    series: [perbandingan.konvenPct, perbandingan.syariahPct],
    labels: ['Konvensional', 'Syariah'],
    chart: { type: 'pie', height: 300 },
    colors: ['#1E40AF', '#059669']
};

const chart = new ApexCharts(document.querySelector("#chart-konven-syariah"), options);
chart.render();
```

### Chart LDR Bulanan

```javascript
const ldrData = BANK_DATA.ratios.LDR.monthlyData;

const options = {
    series: [
        {
            name: 'LDR',
            type: 'column',
            data: ldrData.map(d => d.value)
        },
        {
            name: 'Target',
            type: 'line',
            data: ldrData.map(d => d.target)
        }
    ],
    chart: { height: 350 },
    xaxis: {
        categories: ldrData.map(d => d.month)
    }
};

const chart = new ApexCharts(document.querySelector("#chart-ldr"), options);
chart.render();
```

---

## 🎯 CONTOH UPDATE QUICK STATS CARDS

```javascript
function updateQuickStats() {
    const data = BANK_DATA.neraca;
    
    // Total Aset
    document.getElementById('total-aset').textContent = 
        `Rp ${data.asset.current} T`;
    
    // DPK
    const totalDPK = data.dpkKonvensional.current + data.dpkSyariah.current;
    document.getElementById('total-dpk').textContent = 
        `Rp ${totalDPK.toFixed(2)} T`;
    
    // Kredit
    document.getElementById('total-kredit').textContent = 
        `Rp ${data.kredit.current} T`;
    
    // Laba
    document.getElementById('total-laba').textContent = 
        `Rp ${data.labaRugi.current} M`;
    
    // Pendapatan
    document.getElementById('total-pendapatan').textContent = 
        `Rp ${data.pendapatan.current} M`;
    
    // Biaya
    document.getElementById('total-biaya').textContent = 
        `Rp ${data.biaya.current} M`;
}

// Panggil saat halaman load
document.addEventListener('DOMContentLoaded', updateQuickStats);
```

---

## 🔄 CONTOH FILTER KONSOLIDASI/KONVEN/SYARIAH

```javascript
function updateBySegment(segment) {
    let aset, kredit, dpk, laba;
    
    if (segment === 'konsolidasi') {
        const p = KONVEN_SYARIAH_DATA.perbandingan;
        aset = p.asset.total;
        kredit = p.kredit.total;
        dpk = p.dpk.total;
        laba = p.laba.total;
    } 
    else if (segment === 'konvensional') {
        const p = KONVEN_SYARIAH_DATA.perbandingan;
        aset = p.asset.konven;
        kredit = p.kredit.konven;
        dpk = p.dpk.konven;
        laba = p.laba.konven;
    }
    else if (segment === 'syariah') {
        const p = KONVEN_SYARIAH_DATA.perbandingan;
        aset = p.asset.syariah;
        kredit = p.kredit.syariah;
        dpk = p.dpk.syariah;
        laba = p.laba.syariah;
    }
    
    // Update UI
    document.getElementById('display-aset').textContent = `Rp ${aset} T`;
    document.getElementById('display-kredit').textContent = `Rp ${kredit} T`;
    document.getElementById('display-dpk').textContent = `Rp ${dpk} T`;
    document.getElementById('display-laba').textContent = `Rp ${laba} M`;
}

// Event listener untuk dropdown
document.getElementById('segment-filter').addEventListener('change', (e) => {
    updateBySegment(e.target.value);
});
```

---

## 📋 RINGKASAN DATA OKTOBER 2025

### Neraca Konsolidasi
| Item | Nilai |
|------|-------|
| Total Aset | Rp 34.81 T |
| Kas | Rp 0.55 T |
| Penempatan BI | Rp 2.28 T |
| Surat Berharga | Rp 5.37 T |
| Total Kredit | Rp 23.00 T |
| Total DPK | Rp 24.86 T |
| - Giro | Rp 8.90 T |
| - Tabungan | Rp 5.89 T |
| - Deposito | Rp 10.07 T |

### Laba Rugi Konsolidasi
| Item | Nilai |
|------|-------|
| Pendapatan Bunga | Rp 2,093.88 M |
| Beban Bunga | Rp 864.56 M |
| NII | Rp 1,229.32 M |
| Laba Bersih | Rp 904.70 M |

### Rasio Keuangan
| Rasio | Nilai | Status |
|-------|-------|--------|
| LDR | 92.50% | ⚠️ Warning |
| NPL | 3.24% | ✅ Safe |
| ROA | 2.57% | ✅ Safe |
| CAR | 28.35% | ✅ Safe |
| NIM | 3.89% | ✅ Safe |
| CASA | 59.18% | ✅ Safe |

---

## ❓ TROUBLESHOOTING

### Error: "BANK_DATA is not defined"
- Pastikan `data-enhanced.js` sudah di-load sebelum script lain
- Cek console browser untuk error loading file

### Data tidak terupdate di UI
- Hard refresh browser (Ctrl+F5)
- Clear cache browser
- Pastikan tidak ada error di console

### Chart tidak muncul
- Pastikan ApexCharts sudah di-load
- Cek apakah element target chart ada di HTML
- Cek format data yang dikirim ke chart

---

## 📞 SUPPORT

Jika ada pertanyaan atau masalah, silakan hubungi tim IT Bank Sulselbar.

**Last Updated:** Oktober 2025
**Data Source:** Laporan Keuangan Excel Januari - Oktober 2025
