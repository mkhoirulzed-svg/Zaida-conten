# ZAIDA Content — Fondasi Produk & Rencana Pengembangan

**Status:** Fondasi awal  
**Tanggal:** 8 November 2026

## 1. Visi Produk

ZAIDA Content adalah aplikasi produksi konten faceless yang **mobile-first**. Pengguna memasukkan ide, memilih format dan gaya visual, lalu ZAIDA membantu menghasilkan naskah, narasi, storyboard, gambar per adegan, caption, dan video MP4.

Prinsip pengalaman: **masukkan ide → pilih gaya → tinjau hasil → unduh video**. Proses teknis berjalan di belakang layar.

## 2. Prinsip Utama

- Mobile-first: semua alur utama nyaman digunakan dari HP.
- Sederhana: minim teks, menu, istilah teknis, dan langkah yang tidak perlu.
- Otomatis: pengguna tidak diwajibkan mengedit manual di CapCut untuk memperoleh MP4.
- Bertahap dan teruji: jangan lanjut sebelum tahap sebelumnya terbukti berfungsi.
- Terisolasi: repository ini terpisah. Jangan mengubah ZAIDA Voice atau ZAIDA Video Creator tanpa persetujuan.
- Hemat biaya: utamakan free tier dan uji lokal sebelum menyewa server.
- Siap berkembang: awalnya untuk penggunaan pribadi, tetapi arsitektur tidak menutup kemungkinan SaaS/multi-user.

## 3. UI/UX

Arah visual: modern, bersih, ramah, dan terasa seperti aplikasi kreator profesional.

- Dark mode elegan dengan aksen ungu/biru dan gradasi secukupnya.
- Kartu bergambar, sudut membulat, thumbnail jelas, bayangan halus.
- Ikon ilustratif dan empty state yang membantu tanpa paragraf panjang.
- Animasi ringan untuk transisi, pemilihan kartu, shimmer, dan progres.
- Responsif dan mudah disentuh di layar HP.

Hindari dashboard seperti panel admin, teks petunjuk panjang, terlalu banyak kontrol di halaman awal, dan animasi berat.

## 4. Pemilihan Gaya Visual

Pengguna memilih satu **visual preset** saat membuat proyek. Pilihan ini diterapkan konsisten ke seluruh adegan. Gunakan kartu bergambar, bukan dropdown panjang. Target awal: **24 gaya visual**.

### Ilustrasi 2D
1. Kartun Flat
2. Doodle
3. Anime Sinematik
4. Komik
5. Stickman
6. Kolase Kertas
7. Pixel Retro
8. Cat Air

### Ilustrasi 3D
9. 3D Clay
10. 3D Animasi
11. Low Poly
12. Diorama Mini
13. 3D Medis
14. 3D Chibi

### Realistis dan Sinematik
15. Realistis Sinematik
16. Dokumenter Foto
17. Foto Arsip Lawas
18. Fantasi Epik
19. Film Noir

### Artistik dan Edukatif
20. Sketsa Pensil
21. Lukisan Minyak
22. Infografis
23. Sejarah Kartun
24. Sketsa Arang

Setiap preset perlu menyimpan prompt dasar gaya, karakter warna/pencahayaan/tekstur/komposisi, instruksi konsistensi antaradegan, negative prompt bila didukung model, dan gambar contoh untuk kartu pemilihan.

Jangan menyalin aset, prompt, atau kode milik Tuyul Content. Produk lain hanya referensi konsep dan pengalaman pengguna; ZAIDA memiliki identitas dan preset sendiri.

Untuk konten dengan karakter berulang, rencanakan dukungan character reference agar wajah, pakaian, dan ciri karakter konsisten. Fitur ini dapat menyusul setelah alur gambar dasar stabil.

## 5. Arsitektur Sasaran

### A. ZAIDA Content Web App
Pusat kendali untuk proyek, pemilihan gaya/format, naskah, storyboard, progres, preview, dan unduhan. Dioptimalkan untuk HP.

### B. Backend / Orchestrator
Mengelola proyek, antrean, status, integrasi AI dan browser worker, metadata, retry, serta penanganan kegagalan.

### C. Browser Automation Worker
Menjalankan browser cloud untuk tugas yang memerlukan interaksi dengan situs AI: membuka layanan, mengisi prompt, menjalankan proses, dan mengambil hasil sesuai kemampuan serta ketentuan layanan.

- HP menjadi pusat kendali; worker berjalan di cloud.
- Jangan mengandalkan ekstensi Chrome desktop yang harus dipasang di HP.
- Antarmuka layanan pihak ketiga dapat berubah; otomatisasi harus diuji dan memiliki penanganan kegagalan.

### D. Video Composition / Renderer
FFmpeg menggabungkan gambar adegan, voice-over, caption, musik, dan transisi menjadi MP4. Tidak perlu editor timeline kompleks seperti CapCut pada MVP.

Sediakan preview dan koreksi sederhana: mengganti gambar, mengubah urutan/durasi adegan, memilih preset caption, dan membuat ulang bagian tertentu.

### E. Penyimpanan
Evaluasi Firebase untuk autentikasi dan metadata proyek serta object storage seperti Cloudflare R2 untuk gambar, audio, dan video. Pilihan final mengikuti hasil uji biaya dan kebutuhan.

## 6. Bedakan Tiga Teknologi

- **Browser automation:** mengendalikan browser untuk menjalankan langkah pada layanan AI, misalnya mengirim prompt gambar dan mengambil hasil.
- **AI video generation:** menghasilkan klip bergerak dari prompt/gambar; bukan bagian MVP.
- **FFmpeg rendering:** merangkai gambar diam, suara, caption, dan efek menjadi MP4; bukan generasi video AI.

MVP berfokus pada **gambar per adegan + voice-over + caption + FFmpeg MP4**.

## 7. Strategi Biaya

Target uji coba: **Rp0 atau serendah mungkin**.

- Gunakan free tier bila kuota dan batasnya mencukupi.
- Uji rendering secara lokal terlebih dahulu.
- Jangan menyewa VPS sebelum prototipe membuktikan kebutuhan.
- Pisahkan pencatatan biaya API AI (teks/gambar/suara), server, dan penyimpanan.
- Periksa harga, kuota, batas sesi, cold start, dan ketentuan terbaru sebelum memilih penyedia.

## 8. Tahapan Pengembangan dan Kriteria Lulus

### Tahap 0 — Pemeriksaan aset dan isolasi
- Verifikasi repository dan deployment ZAIDA Content.
- Periksa ZAIDA Video Creator sebagai referensi.
- Identifikasi komponen yang layak digunakan ulang: storyboard, caption, preview, renderer.
- Jangan menyalin proyek secara membabi buta.
- Pastikan proyek baru tidak mengubah aplikasi lama.

**Lulus:** repository dan deployment baru terpisah serta aplikasi lama tidak berubah.

### Tahap 1 — Fondasi UI
- Dashboard minimalis, mobile-first.
- Alur membuat proyek.
- Kartu pemilihan 24 gaya visual (struktur mendukung semua gaya; boleh mengaktifkan beberapa dahulu untuk uji).
- Simpan pilihan gaya pada proyek.

**Lulus:** pengguna dapat membuat proyek dan memilih gaya dengan nyaman dari HP.

### Tahap 2 — Uji Browser Automation
- Dari HP, pengguna mengirim satu prompt.
- Backend meneruskan pekerjaan ke browser worker.
- Browser menjalankan satu tugas yang didukung.
- Status dan hasil kembali ke aplikasi.

**Lulus:** alur nyata dari HP sampai hasil diterima berhasil; bukan sekadar tombol/UI yang terlihat bekerja.

### Tahap 3 — Naskah, suara, dan storyboard
- Buat naskah dan pembagian adegan.
- Integrasikan voice-over menggunakan API yang benar-benar tersedia dan terdokumentasi.
- Buat gambar per adegan memakai preset visual proyek.
- Uji konsistensi gaya dan karakter.

**Lulus:** satu proyek menghasilkan naskah, audio, dan gambar yang bisa ditinjau.

### Tahap 4 — Caption, preview, dan render
- Preset caption yang bisa dipilih.
- Preview video.
- Render MP4 dengan FFmpeg.
- Status proses dan pesan kegagalan yang mudah dipahami.

**Lulus:** MP4 dapat diputar dan diunduh dari HP.

### Tahap 5 — Penyempurnaan
Retry per adegan, ganti/susun ulang gambar, pengaturan durasi sederhana, penyimpanan riwayat, optimasi biaya/performa, dan kesiapan multi-user.

## 9. Standar Pengujian

Jangan menyatakan fitur selesai hanya karena UI tampil.

Setiap tahap diuji melalui alur nyata:
- Uji dari HP.
- Uji kondisi berhasil, gagal, menunggu, dan timeout.
- Pastikan status mudah dipahami.
- Pastikan fitur lama tidak terganggu.
- Catat batas free tier dan biaya aktual.
- Jangan lanjut ke tahap berikutnya sebelum kriteria lulus terpenuhi.

## 10. Keputusan yang Masih Perlu Dikonfirmasi

- Layanan browser cloud untuk uji awal.
- Layanan AI teks/gambar dan endpoint resminya.
- API/integrasi voice-over ZAIDA Voice (jangan mengasumsikan endpoint).
- Backend dan object storage final.
- Prompt internal dan gambar referensi final untuk 24 preset visual.

---

## Ringkasan untuk Melanjutkan

Bangun ZAIDA Content sebagai aplikasi terpisah, mobile-first, minimalis, dan mudah digunakan. Pengguna memilih satu dari 24 gaya visual sejak awal proyek; gaya diterapkan konsisten ke seluruh adegan. Aplikasi mengorkestrasi naskah, suara, gambar, caption, dan render MP4 melalui backend serta browser automation worker cloud. Gunakan FFmpeg untuk merangkai video; AI video generation bukan bagian MVP. Mulai dengan free tier/lokal, buktikan setiap tahap lewat pengujian nyata, dan jangan mengubah ZAIDA Voice atau ZAIDA Video Creator.
