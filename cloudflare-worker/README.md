# ZAIDA Content — Cloudflare Worker

Worker ini menyediakan API pencarian stock video Pixabay untuk aplikasi ZAIDA Content Studio. Worker ini terpisah dari automation worker Node.js/Playwright yang lama.

## Deploy melalui Cloudflare Dashboard

1. Buka **Workers & Pages** lalu pilih Worker yang sudah dibuat.
2. Buka **Edit code**.
3. Ganti seluruh isi file entrypoint (biasanya `src/index.js` atau `index.js`) dengan isi file `cloudflare-worker/src/index.js` di repository.
4. Klik **Deploy**.
5. Buka **Settings → Variables and Secrets**.
6. Tambahkan secret bernama `PIXABAY_API_KEY` dan isi dengan API key dari https://pixabay.com/api/.
7. (Opsional, disarankan) Tambahkan variable `ALLOWED_ORIGINS` berisi origin frontend yang tepat, misalnya `https://username.github.io,https://domain-kamu.com`. Jangan sertakan path. Jika dibiarkan kosong, Worker mengizinkan CORS dari semua origin karena endpoint pencarian ini bersifat publik dan tidak memakai cookie.

## Endpoint

- `GET /health` — status Worker dan apakah secret Pixabay tersedia.
- `GET /api/footage/search?q=heart&orientation=portrait` — hasil video Pixabay (maksimal 12).

Parameter `orientation`: `portrait`, `landscape`, atau `square`. Parameter opsional `page` bernilai 1–100.

Worker menyimpan respons pencarian di Cloudflare Cache selama 24 jam, sesuai ketentuan cache Pixabay. Hasil mengandung tautan halaman sumber dan nama kontributor untuk atribusi.

## Hubungkan aplikasi

Root `index.html` menggunakan meta `zaida-api-base`. Isi meta tersebut dengan URL Worker tanpa garis miring di akhir. URL yang saat ini diberikan untuk ZAIDA adalah:

`https://zaida-conten.mkhoirulzed.workers.dev`

Setelah Worker berhasil di-deploy dan secret dipasang, buka:

`https://zaida-conten.mkhoirulzed.workers.dev/health`

Pastikan respons menampilkan `"ok":true` dan `"footageConfigured":true`. Lalu tes endpoint pencarian dengan kata kunci sederhana.

## Catatan

- Jangan pernah menaruh `PIXABAY_API_KEY` di JavaScript frontend atau repository.
- Batas permintaan internal aplikasi disarankan diatur melalui Cloudflare WAF/Rate Limiting Rules jika diperlukan.
- API Pixabay sendiri memiliki batas akun. Cache 24 jam membantu mengurangi pemanggilan berulang.
- Worker ini hanya menangani pencarian footage. Otomasi browser berbasis Playwright tetap berjalan di service Node.js terpisah.
