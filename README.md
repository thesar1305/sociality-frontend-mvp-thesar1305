# Sociality Frontend MVP

Sociality adalah MVP aplikasi media sosial berbasis frontend. Pengguna dapat membuat postingan, memberikan suka, menambahkan komentar, serta mengelola postingannya langsung dari browser.

## Fitur

- Menampilkan feed postingan.
- Membuat postingan baru dengan batas 280 karakter.
- Memberikan dan membatalkan suka.
- Menambahkan komentar dengan batas 180 karakter.
- Mengedit postingan milik pengguna.
- Menghapus postingan milik pengguna dengan konfirmasi.
- Menampilkan halaman profil.
- Menggunakan mode terang dan gelap.
- Menyimpan aktivitas feed dan preferensi tema di browser.
- Mendukung tampilan desktop dan perangkat berukuran kecil.
- Menggunakan elemen formulir dan atribut aksesibilitas yang sesuai.

## Teknologi

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui dan Base UI
- Geist Font
- Browser Local Storage

## Menjalankan Proyek

Clone branch stabil proyek:

```bash
git clone --branch recovery/sociality-clean https://github.com/thesar1305/sociality-frontend-mvp-thesar1305.git
cd sociality-frontend-mvp-thesar1305
```

Instal dependencies:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) melalui browser.

## Perintah Tersedia

| Perintah        | Kegunaan                                          |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Menjalankan development server                    |
| `npm run lint`  | Memeriksa kualitas kode dengan ESLint             |
| `npm run build` | Memeriksa TypeScript dan membuat production build |
| `npm run start` | Menjalankan production server setelah build       |

## Struktur Utama

```text
src/
|-- app/
|   |-- profile/
|   |   `-- page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- sociality/
|   |   |-- post-card.tsx
|   |   |-- social-feed.tsx
|   |   `-- theme-toggle.tsx
|   `-- ui/
|       `-- button.tsx
|-- data/
|   |-- posts.ts
|   `-- profile.ts
|-- lib/
|   `-- utils.ts
`-- types/
    |-- post.ts
    `-- profile.ts
```

## Penyimpanan Data

MVP ini belum menggunakan backend atau database. Data berikut disimpan di Local Storage browser:

- Postingan yang dibuat pengguna.
- Perubahan isi postingan.
- Status suka.
- Komentar baru.
- Penghapusan postingan.
- Pilihan mode terang atau gelap.

Karena penyimpanan bersifat lokal:

- Data tidak tersinkron antarperangkat atau browser.
- Data dapat hilang jika penyimpanan browser dibersihkan.
- Belum tersedia autentikasi atau akun pengguna sebenarnya.

## Verifikasi

Sebelum membuat commit atau melakukan deployment, jalankan:

```bash
npm run lint
npm run build
git diff --check
```

## Branch Stabil

Pengembangan dan deployment proyek ini menggunakan branch:

```text
recovery/sociality-clean
```
