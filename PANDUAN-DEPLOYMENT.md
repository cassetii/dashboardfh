# ðŸš€ PANDUAN DEPLOYMENT - Dashboard Bank Sulselbar

## ðŸ“¦ File-file yang Perlu Di-deploy

### File BARU (Copy ke folder project):

| File | Deskripsi |
|------|-----------|
| `login.html` | Halaman login baru dengan multi-user |
| `user-manager.js` | Sistem user & authentication |
| `office-connector.js` | Data 101 kode kantor |
| `role-integration.js` | Integrasi role ke dashboard |
| `dashboard-enhanced.html` | Dashboard dengan integrasi role (REPLACE yang lama) |

### File LAMA (Tetap gunakan):

- `styles-enhanced.css`
- `app-enhanced.js`
- `data-enhanced.js`
- `bank-sulselbar-data.js`
- `branch-data.js`
- `branch-modal.js`
- `target-manager.js`
- `import-export-manager.js`
- `imported-branches-display.js`
- `neraca-detail-data.js`
- `neraca-layer2-handler.js`
- `forecasting-engine.js`
- `daily-data-manager.js`
- `arima-integration.js`
- Semua file CSS lainnya
- Logo files

---

## ðŸ“‚ Struktur Folder Final

```
/your-project/
â”œâ”€â”€ index.html          (redirect ke login.html)
â”œâ”€â”€ login.html          â† BARU
â”œâ”€â”€ dashboard-enhanced.html  â† UPDATED
â”‚
â”œâ”€â”€ CSS Files/
â”‚   â”œâ”€â”€ styles-enhanced.css
â”‚   â”œâ”€â”€ neraca-layer2-styles.css
â”‚   â””â”€â”€ imported-branches-styles.css
â”‚
â”œâ”€â”€ JS Files/
â”‚   â”œâ”€â”€ user-manager.js         â† BARU
â”‚   â”œâ”€â”€ office-connector.js     â† BARU
â”‚   â”œâ”€â”€ role-integration.js     â† BARU
â”‚   â”œâ”€â”€ app-enhanced.js
â”‚   â”œâ”€â”€ data-enhanced.js
â”‚   â”œâ”€â”€ bank-sulselbar-data.js
â”‚   â”œâ”€â”€ branch-data.js
â”‚   â”œâ”€â”€ branch-modal.js
â”‚   â”œâ”€â”€ target-manager.js
â”‚   â”œâ”€â”€ import-export-manager.js
â”‚   â”œâ”€â”€ imported-branches-display.js
â”‚   â”œâ”€â”€ neraca-detail-data.js
â”‚   â”œâ”€â”€ neraca-layer2-handler.js
â”‚   â”œâ”€â”€ forecasting-engine.js
â”‚   â”œâ”€â”€ daily-data-manager.js
â”‚   â””â”€â”€ arima-integration.js
â”‚
â”œâ”€â”€ Assets/
â”‚   â”œâ”€â”€ logobanksulselbar.png
â”‚   â””â”€â”€ logo-bank-sulselbar.png
â”‚
â””â”€â”€ Data/
    â””â”€â”€ (Excel templates, JSON exports, etc.)
```

---

## ðŸ‘¥ Akun User Default

| Username | Password | Role | Akses |
|----------|----------|------|-------|
| `ADMIN_PUSAT` | `admin123` | ðŸ‘‘ Admin | Full access |
| `PIN_MAROS` | `pincab123` | ðŸ‘” Pincab | Cabang Maros |
| `PIN_BONE` | `pincab123` | ðŸ‘” Pincab | Cabang Bone |
| `PIN_MAKASSAR` | `pincab123` | ðŸ‘” Pincab | Cabang Makassar |
| `OPR_010_01` | `operator123` | ðŸ’¼ Operator | Maros |
| `OPR_010_02` | `operator123` | ðŸ’¼ Operator | Maros |
| `OPR_080_01` | `operator123` | ðŸ’¼ Operator | Bone |
| `VIEW_PUSAT` | `viewer123` | ðŸ‘ï¸ Viewer | View only |
| `simo` | `simo1234` | â­ Legacy | Full access |

---

## ðŸ” Fitur per Role

### ðŸ‘‘ ADMIN
- âœ… Lihat semua data
- âœ… Input target semua cabang
- âœ… Input realisasi
- âœ… Kelola user (tambah, edit, hapus)
- âœ… Kelola kantor (tambah, edit)
- âœ… Export semua laporan
- âœ… Approve data

### ðŸ‘” PINCAB (Pimpinan Cabang)
- âœ… Lihat data cabang sendiri + KCP/KF
- âœ… Review & approve data operator
- âœ… Export laporan cabang
- âŒ Input target (hanya pusat)
- âŒ Kelola user
- âŒ Tambah kantor

### ðŸ’¼ OPERATOR
- âœ… Input realisasi
- âœ… Upload Excel
- âœ… Lihat data yang diinput
- âœ… Edit draft (sebelum approve)
- âŒ Approve data
- âŒ Input target
- âŒ Kelola user/kantor

### ðŸ‘ï¸ VIEWER
- âœ… Lihat dashboard
- âœ… Lihat laporan
- âŒ Input apapun
- âŒ Export (opsional)

---

## ðŸ› ï¸ Langkah Deployment

### 1. Backup File Lama
```bash
# Backup folder project
cp -r /path/to/project /path/to/project-backup-$(date +%Y%m%d)
```

### 2. Copy File Baru
```bash
# Copy semua file baru ke project
cp login.html /path/to/project/
cp user-manager.js /path/to/project/
cp office-connector.js /path/to/project/
cp role-integration.js /path/to/project/

# REPLACE dashboard-enhanced.html
cp dashboard-enhanced.html /path/to/project/
```

### 3. Buat index.html (Redirect)
```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=login.html">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="login.html">login page</a>...</p>
</body>
</html>
```

### 4. Test Locally
1. Buka `login.html` di browser
2. Login dengan `ADMIN_PUSAT` / `admin123`
3. Cek semua menu muncul
4. Logout, login dengan `OPR_010_01`
5. Cek menu terbatas sesuai role

### 5. Deploy ke Server
```bash
# Upload semua file ke server
# Atau jika pakai git:
git add .
git commit -m "Add multi-user role-based access"
git push origin main
```

---

## âš ï¸ Catatan Penting

### Data Storage
- Data user disimpan di `localStorage` browser
- Setiap browser/device punya data terpisah
- Untuk production, pertimbangkan backend database

### Keamanan
- Password disimpan plain text (demo only!)
- Untuk production, gunakan hashing (bcrypt)
- Pertimbangkan HTTPS dan token-based auth

### Kompatibilitas
- Login lama (`simo/simo1234`) tetap berfungsi
- Dashboard lama tetap compatible
- Tidak ada breaking changes

---

## ðŸ”§ Troubleshooting

### Login tidak bisa?
1. Buka DevTools (F12)
2. Clear localStorage: `localStorage.clear()`
3. Clear sessionStorage: `sessionStorage.clear()`
4. Refresh dan coba lagi

### Menu tidak muncul?
1. Pastikan semua JS file ter-load
2. Cek console untuk error
3. Pastikan urutan script benar

### User tidak tersimpan?
1. Cek localStorage di DevTools
2. Key: `bank_sulselbar_users`
3. Reset: `localStorage.removeItem('bank_sulselbar_users')`

---

## ðŸ“ž Support

Jika ada masalah, cek:
1. Browser Console (F12 â†’ Console)
2. Network tab untuk failed requests
3. localStorage data

---

## ðŸŽ‰ Selesai!

Dashboard Bank Sulselbar siap digunakan dengan fitur:
- âœ… Multi-user login
- âœ… Role-based access control
- âœ… 101 kode kantor terintegrasi
- âœ… Compatible dengan data lama
- âœ… UI tetap sama, hanya tambah fitur
