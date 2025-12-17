# 🔄 INSTRUKSI UPDATE PROJECT

## File yang perlu di-COPY ke folder project Anda:

### 1. FILE BARU (taruh di folder utama project)
```
📁 folder-project-anda/
├── firebase-connector.js    ← FILE BARU
├── admin-panel.html         ← FILE BARU
├── dashboard-enhanced.html  ← TIMPA/REPLACE
├── ... (file lainnya tetap)
```

### 2. LANGKAH-LANGKAH:

**OPSI A: Replace dashboard-enhanced.html (Rekomendasi)**
- Download `dashboard-enhanced-firebase.html`
- Rename jadi `dashboard-enhanced.html`
- Timpa file lama di folder project

**OPSI B: Edit Manual**
Jika tidak mau timpa, tambahkan kode berikut di `dashboard-enhanced.html`:

Di bagian `<head>` setelah SheetJS, tambahkan:
```html
<!-- Firebase Integration -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="firebase-connector.js"></script>
```

---

## CHECKLIST:

- [ ] Sudah aktifkan Firestore di Firebase Console
- [ ] Copy `firebase-connector.js` ke folder project  
- [ ] Copy `admin-panel.html` ke folder project
- [ ] Update `dashboard-enhanced.html` (timpa atau edit manual)
- [ ] Buka `admin-panel.html` di browser
- [ ] Klik "Connect to Firebase"
- [ ] Upload `firebase_import_data.json`
- [ ] Klik "Bulk Import ke Firebase"
- [ ] Selesai! ✅

---

## STRUKTUR FOLDER AKHIR:
```
📁 project-bank-sulselbar/
├── index.html
├── login.html
├── dashboard-enhanced.html     ← DIUPDATE
├── firebase-connector.js       ← BARU
├── admin-panel.html            ← BARU
├── styles-enhanced.css
├── app-enhanced.js
├── data-enhanced.js
├── bank-sulselbar-data.js
├── branch-data.js
├── ... (file lainnya tetap)
```
