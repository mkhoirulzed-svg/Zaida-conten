# ZAIDA Content

Aplikasi produksi konten faceless yang mobile-first dengan alur dari ide hingga video.

## Status saat ini

- Fondasi UI mobile-first tersedia.
- Pemilihan 24 gaya visual dan draft lokal tersedia.
- Cloudflare Worker lama menyediakan pencarian stock footage Pixabay.
- Browser-only Smart Timeline prototype tersedia di [smart-timeline.html](./smart-timeline.html).
- Prototype menerima audio, beberapa gambar, dan naskah per gagasan; membagi durasi secara proporsional, menyediakan preview, dan mencoba ekspor WebM.
- AI scene planning, forced alignment, image semantic matching, integrasi ZAIDA Voice, penyimpanan proyek cloud, dan MP4 rendering belum aktif.

## Mulai mencoba Smart Timeline

Buka `smart-timeline.html` melalui GitHub Pages atau server statis. Pilih audio narasi, unggah beberapa gambar, lalu tempel naskah dengan satu baris kosong di antara gagasan. Tekan **Buat timeline otomatis**.

## Dokumen

- [Fondasi Produk & Rencana Pengembangan](docs/FOUNDATION.md)
- [Smart Timeline prototype notes](docs/SMART-TIMELINE-PROTOTYPE.md)
- [Open-source references and attribution](docs/OPEN-SOURCE-ATTRIBUTIONS.md)
- [Automation Worker](automation-worker/README.md)

## Prinsip

- Mobile-first dan sederhana.
- Chromebook menjadi pusat kendali, bukan mesin AI/render berat.
- Mulai dari browser dan Cloudflare Free; layanan AI eksternal hanya saat dikonfigurasi.
- Jangan jalankan FFmpeg.wasm/Remotion render di browser sebagai asumsi.
- Rendering MP4 server-side ditunda sampai kebutuhan dan anggarannya jelas.
