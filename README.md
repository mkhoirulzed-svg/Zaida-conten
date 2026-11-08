# ZAIDA Content

Aplikasi produksi konten faceless yang mobile-first dengan alur otomatis dari ide hingga video MP4.

## Status saat ini

- Fondasi UI mobile-first tersedia.
- Pemilihan 24 gaya visual tersedia.
- Draft proyek dapat dibuat dan disimpan secara lokal di browser.
- Worker Browserless sudah memiliki kerangka smoke test, tetapi belum dikonfigurasi atau dideploy.
- Integrasi AI, voice, cloud project storage, dan render MP4 belum aktif.

## Dokumen

- [Fondasi Produk & Rencana Pengembangan](docs/FOUNDATION.md)
- [Automation Worker](automation-worker/README.md)

## Prinsip

- Mobile-first dan sederhana.
- Gaya visual dipilih sejak awal proyek dan dijaga konsisten antaradegan.
- Browser automation berjalan di worker cloud; HP menjadi pusat kendali.
- FFmpeg untuk merangkai gambar, voice-over, caption, dan musik menjadi MP4.
- Uji dengan free tier/lokal sebelum menambah biaya server.
- Repository ini terpisah dari ZAIDA Voice dan ZAIDA Video Creator.
