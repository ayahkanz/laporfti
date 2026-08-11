# Fitur Poster QR Kampus (dihapus, catatan untuk pengembangan nanti)

## Status
Dihapus dari aplikasi pada [tanggal implementasi ini]. Sebelumnya ada di `src/components/QRAccessView.tsx`, dipanggil dari tombol "Cetak Poster QR Kampus" di `AdminPanel.tsx`.

## Kenapa dihapus
QR code yang ditampilkan **bukan QR code sungguhan** — hanya SVG statis berisi kotak-kotak yang di-hardcode agar terlihat seperti pola QR code, tidak benar-benar encode URL portal apa pun. Jika dicetak dan discan, tidak akan mengarah ke mana-mana. Fitur ini juga di luar kebutuhan inti aplikasi (pelaporan pengaduan), jadi dihapus daripada dipertahankan sebagai kode yang tidak berfungsi.

## Jika suatu saat dibutuhkan lagi
Gunakan library QR generator sungguhan agar hasilnya valid dan bisa discan, misalnya:
- [`qrcode`](https://www.npmjs.com/package/qrcode) (npm) — generate QR sebagai data URL/SVG dari string URL asli (`window.location.origin`), bisa dipakai di client maupun server.
- Alternatif ringan: layanan generator QR eksternal (misal `api.qrserver.com`) jika tidak mau nambah dependency, tapi ini butuh koneksi internet saat generate.

Poin desain yang perlu dipikirkan ulang:
- QR harus encode URL production VPS yang sebenarnya, bukan `localhost` (lihat catatan di `src/utils/whatsapp.ts` — `window.location.origin` otomatis menyesuaikan origin saat runtime, prinsip yang sama bisa dipakai).
- Kalau untuk poster fisik dicetak sekali per lokasi, mungkin generate QR sekali secara manual/offline lebih murah daripada membangun UI generator penuh di dalam Admin Panel.
