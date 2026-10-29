const CLOUDINARY_HOST = 'res.cloudinary.com';
const UPLOAD_SEGMENT = '/image/upload/';
// Harus sama dengan images.remotePatterns di next.config.ts.
const ALLOWED_PATH_PREFIX = '/dvz5kmwqx/image/upload/';

function parseUrl(src: string) {
  try {
    return new URL(src);
  } catch {
    return null;
  }
}

/** Hanya host yang terdaftar di next.config.ts yang boleh lewat optimizer. */
export function isOptimizableImage(src: string) {
  const url = parseUrl(src);

  return (
    url?.protocol === 'https:' &&
    url.hostname === CLOUDINARY_HOST &&
    url.pathname.startsWith(ALLOWED_PATH_PREFIX)
  );
}

/**
 * Thumbnail avatar (MVP Guide: gambar dioptimasi thumb/fit). Menyisipkan
 * transformasi Cloudinary; URL lain (blob:, host lain) dikembalikan apa adanya.
 */
export function avatarThumb(src: string, size = 96) {
  const url = parseUrl(src);

  if (
    !url ||
    url.hostname !== CLOUDINARY_HOST ||
    !url.pathname.includes(UPLOAD_SEGMENT) ||
    url.pathname.includes(`${UPLOAD_SEGMENT}w_`)
  ) {
    return src;
  }

  url.pathname = url.pathname.replace(
    UPLOAD_SEGMENT,
    `${UPLOAD_SEGMENT}c_fill,g_auto,w_${size},h_${size},q_auto,f_auto/`
  );

  return url.toString();
}

/**
 * Loader next/image: browser mengambil gambar langsung dari CDN Cloudinary
 * (lebar disesuaikan lewat transformasi URL). Dengan begitu server Next tidak
 * perlu mengunduh gambar (optimizer bawaan menolak host yang di-resolve ke IP
 * privat, mis. pada jaringan dengan DNS64/NAT64 atau VPN).
 */
export function cloudinaryLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}) {
  const url = parseUrl(src);

  if (
    !url ||
    !url.pathname.includes(UPLOAD_SEGMENT) ||
    url.pathname.includes(`${UPLOAD_SEGMENT}w_`)
  ) {
    return src;
  }

  url.pathname = url.pathname.replace(
    UPLOAD_SEGMENT,
    `${UPLOAD_SEGMENT}c_limit,w_${width},q_auto,f_auto/`
  );

  return url.toString();
}
