# Design.md: Desain UI/UX & Arsitektur Sistem

**Proyek:** Mini Pixel Vault & To-Do Dashboard  

---

## 1. 🎨 Visual & Tema Estetika (UI/UX)
- **Tema:** Retro Cute / Chibi Arcade dengan sentuhan modern pastel.
- **Warna Utama (Palette):**
  - Background: Gradasi lembut (`#667eea` ke `#764ba2` atau krem hangat `#f4ede4`).
  - Card / Box: Putih bersih (`#ffffff`) dengan sudut melengkung (`border-radius: 12px`).
  - Aksen / Highlight: Hijau USRC / Pink lembut (`#ff8cb0` / `#4CAF50`).
  - Text: Cokelat tua hangat (`#43291c`) atau abu-abu gelap (`#333333`).
- **Typography:** Font sans-serif yang bersih dan mudah dibaca (`Segoe UI`, `Inter`).
- **Pixel Art Rule:** 
  - Seluruh gambar hewan wajib menggunakan `image-rendering: pixelated;` agar piksel tetap tajam dan tidak blur saat diperbesar.

---

## 2. 📐 Layout Struktur Halaman (`index.html`)
```text
+-------------------------------------------------------+
|                   HEADER / TITLE                      |
|           "Mini Pixel Vault & To-Do Dashboard"         |
+-------------------------------------------------------+
|  SECTION 1: PIXEL VAULT (Galeri Hewan)                |
|  [ Ayam ] [ Beruang ] [ Gorila ] [ Kucing ]           |
|  [ Monyet] [ Rubah  ] [ Kelinci ] [ Panda   ]           |
+-------------------------------------------------------+
|  SECTION 2: STUDY TO-DO DASHBOARD (Supabase Connected)|
|  +-------------------------------------------------+  |
|  | [ Input Tugas Baru... ]          [ Tambah (+) ]  |  |
|  +-------------------------------------------------+  |
|  | ☑ Belajar Dasar HTML & CSS     [ Hapus ]        |  |
|  | ☐ Setup Supabase Database       [ Hapus ]        |  |
|  +-------------------------------------------------+  |
+-------------------------------------------------------+
|                    FOOTER                             |
|           Created with ❤️ by Aditya (Diditt)          |
+-------------------------------------------------------+
```

---

## 3. 🗄️ Database Schema (Supabase - PostgreSQL)
Tabel: `todos`
| Kolom | Tipe Data | Deskripsi |
|---|---|---|
| `id` | UUID (Primary Key) | Auto-generated ID unik |
| `task` | Text | Isi teks tugas belajar |
| `completed` | Boolean | Status tugas (true / false) |
| `created_at` | Timestamp | Waktu pembuatan tugas |
