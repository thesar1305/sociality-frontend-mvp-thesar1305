# Sociality Frontend MVP

Frontend MVP aplikasi media sosial **Sociality** yang terhubung ke API
`https://be-social-media-api-production.up.railway.app` (dokumentasi Swagger di
`/api-swagger/`). Cakupan fitur mengikuti _Sociality Frontend MVP Guide_ dan
desain Figma "Social Media".

## Fitur

- **Autentikasi:** daftar, masuk, sesi bertahan setelah refresh, keluar, dan
  route privat yang dilindungi (redirect ke login dengan `next`).
- **Feed:** timeline (diri sendiri + yang diikuti) dengan infinite scroll tanpa
  duplikasi, state loading/kosong/error, dan retry.
- **Postingan:** buat (drag & drop, preview, caption), detail, dan hapus milik
  sendiri.
- **Interaksi (optimistic UI):** suka, simpan, ikuti/berhenti mengikuti, serta
  komentar (composer, emoji, hapus oleh pemilik komentar atau pemilik post).
  Modal "Disukai oleh" tersedia di kartu dan halaman detail.
- **Profil saya (`/me`):** statistik, tab Galeri/Tersimpan, edit profil
  (avatar, nama, username, telepon, bio), halaman pengikut/mengikuti dan
  postingan yang disukai.
- **Pengguna lain:** pencarian dengan debounce, profil publik (tab
  Postingan/Disukai), dan daftar pengikut/mengikuti. Bisa dibuka tanpa login;
  aksi privat memunculkan dialog Masuk/Daftar.
- **Lainnya:** toast, mode gelap/terang, gambar dioptimasi, fallback untuk
  gambar yang gagal dimuat, dan analytics ringan.

## Teknologi

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui (base-nova) dengan Base UI
- Redux Toolkit (state sesi dan toast), TanStack Query (data server)
- React Hook Form + Zod, Day.js, Axios

## Menjalankan Proyek

```bash
git clone --branch recovery/sociality-clean https://github.com/thesar1305/sociality-frontend-mvp-thesar1305.git
cd sociality-frontend-mvp-thesar1305
npm install
```

Buat `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=https://be-social-media-api-production.up.railway.app
# Opsional: endpoint yang menerima event analytics (POST JSON via sendBeacon)
# NEXT_PUBLIC_ANALYTICS_URL=
```

Jalankan development server lalu buka <http://localhost:3000>:

```bash
npm run dev
```

## Perintah

| Perintah        | Kegunaan                                          |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Menjalankan development server                    |
| `npm run lint`  | Memeriksa kualitas kode dengan ESLint             |
| `npm run build` | Memeriksa TypeScript dan membuat production build |
| `npm run start` | Menjalankan production server setelah build       |

## Rute

| Rute                                          | Akses  | Keterangan                                   |
| --------------------------------------------- | ------ | -------------------------------------------- |
| `/login`, `/register`                         | Publik | Masuk dan daftar                             |
| `/feed`                                       | Privat | Timeline                                     |
| `/posts/new`                                  | Privat | Buat postingan                               |
| `/posts/[id]`                                 | Publik | Detail postingan dan komentar                |
| `/me`, `/me/edit`                             | Privat | Profil saya (`?tab=saved` untuk Tersimpan)   |
| `/me/likes`, `/me/followers`, `/me/following` | Privat | Daftar milik saya                            |
| `/search`                                     | Publik | Cari pengguna                                |
| `/users/[username]`                           | Publik | Profil publik (`?tab=likes` untuk Disukai)   |
| `/users/[username]/followers`, `/following`   | Privat | Daftar pengikut/mengikuti pengguna           |

`/profile`, `/me/saved`, dan `/posts/[id]/likes` hanya mengalihkan ke halaman
penggantinya agar tautan lama tetap berfungsi.

## Struktur Utama

```text
src/
|-- app/            Rute App Router
|-- components/
|   |-- providers/  Redux, TanStack Query, bootstrap sesi
|   |-- sociality/  Komponen fitur (feed, kartu post, profil, komentar, ...)
|   `-- ui/         Primitif shadcn/ui
|-- lib/
|   |-- api/        Klien axios dan fungsi per endpoint
|   |-- auth/       Penyimpanan token
|   |-- hooks/      Hook bersama (mis. useHydrated)
|   |-- store/      Redux slice (auth, toast)
|   |-- validation/ Skema Zod
|   |-- analytics.ts  track(event, props)
|   `-- images.ts     Loader dan thumbnail Cloudinary
`-- types/          Tipe respons API
```

## Catatan Teknis

- **Gambar:** URL dari API berada di Cloudinary dan dimuat lewat `next/image`
  dengan `cloudinaryLoader` (`src/lib/images.ts`), sehingga browser mengambil
  gambar langsung dari CDN. Avatar kecil memakai `avatarThumb()`.
- **Analytics:** `track()` mengirim `CustomEvent` `sociality:analytics`,
  mencetak ke konsol saat development, dan memakai `sendBeacon` bila
  `NEXT_PUBLIC_ANALYTICS_URL` diisi. Event: `post_view`, `post_like`,
  `post_unlike`, `post_save`, `post_unsave`, `user_follow`, `user_unfollow`,
  `comment_submit`.
- **Hydration:** komponen yang bergantung pada status sesi memakai
  `useHydrated()` agar render pertama sama dengan HTML server.

## Verifikasi

Sebelum commit atau deployment:

```bash
npm run lint
npm run build
git diff --check
```

## Branch

Pengembangan memakai branch `recovery/sociality-clean`.
