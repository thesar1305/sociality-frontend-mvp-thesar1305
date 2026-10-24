import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter.')
    .max(50, 'Nama maksimal 50 karakter.'),

  username: z
    .string()
    .trim()
    .min(3, 'Username minimal 3 karakter.')
    .max(30, 'Username maksimal 30 karakter.')
    .regex(
      /^[a-zA-Z0-9._]+$/,
      'Username hanya boleh berisi huruf, angka, titik, dan garis bawah.'
    ),

  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, 'Nomor telepon harus berisi 10–15 angka.'),

  bio: z.string().trim().max(160, 'Bio maksimal 160 karakter.'),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

export const AVATAR_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export function validateAvatarFile(file: File) {
  if (!(AVATAR_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return 'Avatar harus berformat PNG, JPG, atau WEBP.';
  }

  if (file.size > AVATAR_MAX_SIZE) {
    return 'Ukuran avatar maksimal 5 MB.';
  }

  return null;
}
