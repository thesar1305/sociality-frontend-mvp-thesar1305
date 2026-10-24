export const POST_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const POST_CAPTION_MAX_LENGTH = 280;

export const POST_IMAGE_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export function validatePostImage(file: File) {
  if (!(POST_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return 'Gambar harus berformat PNG, JPG, atau WEBP.';
  }

  if (file.size > POST_IMAGE_MAX_SIZE) {
    return 'Ukuran gambar maksimal 5 MB.';
  }

  return null;
}
