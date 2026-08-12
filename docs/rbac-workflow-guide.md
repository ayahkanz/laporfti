# Panduan Alur Kerja RBAC & Disposisi Tiket — Lapor FIT

Dokumen ini menjelaskan bagaimana laporan/aduan mengalir dari mahasiswa sampai ke staf yang menangani, dan peran masing-masing role dalam sistem.

## Role yang Ada

| Role | Siapa (contoh) | Hak Akses |
|---|---|---|
| **Super Admin** | Pemilik sistem (saat ini: Kepala Divisi TI) | Akses penuh + kelola akun Moderator/Staff/Pimpinan lain + kelola nomor WA hotline publik |
| **Pimpinan** | Dekan, Wakil Dekan (Keuangan, Akademik) | Baca semua laporan lintas divisi (termasuk sensitif) — **tidak bisa** ubah apapun |
| **Moderator** | Kepala Divisi (Adm Umum & RT, Adm Akademik, Adm Keuangan, TI), atau Wakil Dekan Kemahasiswaan untuk kategori Kemahasiswaan/Etika | Lihat & tangani laporan **hanya di divisinya**; bisa update status, balas resmi, dan **disposisikan ke Staff** di divisinya |
| **Staff** | Kepala Urusan, staf pelaksana | Lihat & tangani **hanya tiket yang sudah didisposisikan ke dirinya** — bukan seluruh antrian divisi |

Setiap akun Moderator/Staff terikat ke satu **divisi** (lihat `src/lib/divisions.ts`). Login pertama kali dilakukan dengan Google OAuth, dan hanya email yang sudah didaftarkan Super Admin (lewat menu "Kelola Akun Admin") yang bisa masuk sebagai admin — bukan sekadar siapa saja dengan domain `@uii.ac.id`.

## Pemetaan Kategori Laporan → Divisi

| Kategori Laporan | Divisi Penanggung Jawab |
|---|---|
| Akademik & Kurikulum | Administrasi Akademik |
| Fasilitas & Sarana Prasarana | Administrasi Umum & Rumah Tangga |
| Layanan Administrasi & Staf | Administrasi Umum & Rumah Tangga |
| Sistem Informasi & IT Portal | Teknologi Informasi |
| Keuangan & Biaya Kuliah | Administrasi Keuangan |
| Kemahasiswaan, Minat & Beasiswa | Kemahasiswaan (ditangani langsung Wakil Dekan Kemahasiswaan) |
| Etika, Perundungan & Pelecehan | Kemahasiswaan (ditangani langsung Wakil Dekan Kemahasiswaan) |
| Lainnya | Tidak ada pemilik otomatis — hanya terlihat oleh Super Admin/Pimpinan, perlu triase manual |

Pemetaan ini dikodekan di `CATEGORY_TO_DIVISION` (`src/lib/divisions.ts`) — laporan otomatis "terkunci" ke divisi yang sesuai kategorinya, Moderator divisi lain tidak akan melihatnya sama sekali (difilter di server, bukan cuma disembunyikan di tampilan).

## Alur End-to-End

```
Mahasiswa submit laporan (pilih kategori)
        │
        ▼
Kategori dipetakan otomatis ke Divisi
        │
        ▼
Moderator (Kepala Divisi terkait) login → hanya lihat laporan divisinya
        │
        ├── Tangani langsung: update status / balas resmi
        │
        └── Disposisikan ke Staff di divisinya
                    │
                    ▼
            Staff login → hanya lihat tiket yang didisposisikan ke dirinya
                    │
                    ▼
            Staff update status / balas resmi untuk tiket tsb
```

Pimpinan (Dekan/Wakil Dekan) bisa mengawasi seluruh alur ini kapan saja secara read-only, lintas semua divisi, tanpa perlu menunggu laporan didisposisikan ke mereka.

## Cara Melakukan Disposisi (untuk Moderator)

1. Login sebagai Moderator, buka salah satu laporan di daftar.
2. Di bagian "Disposisi Tugas" (kotak kuning), pilih staf tujuan dari dropdown — hanya menampilkan staf yang divisinya sama dengan laporan tersebut.
3. Isi catatan opsional (misal instruksi tambahan).
4. Klik "Disposisikan". Status disposisi langsung tersimpan dan terlihat oleh Staff yang dituju saat mereka login.

## Cara Menambah Akun Moderator/Staff/Pimpinan (untuk Super Admin)

1. Login sebagai Super Admin → klik "Kelola Akun Admin".
2. Pakai dropdown **"Pilih dari Direktori FTI"** untuk mengisi form otomatis (nama, role, divisi tersarankan) berdasarkan struktur organisasi asli (`src/lib/orgDirectory.ts`, sumber: `Role.xlsx`) — bisa diedit manual sebelum submit kalau perlu.
3. Klik "Tambah Akun Admin". Akun langsung bisa login begitu mereka klik "Dashboard Staf/Admin" dan sign-in dengan Google memakai email tersebut.

## Batasan yang Belum Diimplementasi (di luar scope saat ini)
- **Moderasi konten pra-publikasi**: kolom `moderation_status` sudah ada di skema DB, tapi belum ada UI/endpoint approve-reject untuk menyaring laporan sebelum tayang di "Laporan Publik". Laporan Publik saat ini tayang langsung tanpa tahap approval.
- **Kategori "Lainnya"**: tidak ada divisi otomatis, perlu keputusan manual siapa yang menangani (saat ini hanya Super Admin/Pimpinan yang bisa melihatnya).
