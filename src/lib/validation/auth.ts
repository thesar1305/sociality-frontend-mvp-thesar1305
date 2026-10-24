import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Format email tidak valid.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
});

export const registerSchema = z
  .object({
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
        'Username hanya boleh berisi huruf, angka, titik, dan underscore.'
      ),
    email: z.string().trim().email('Format email tidak valid.'),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9]{10,15}$/, 'Nomor telepon harus berisi 10–15 digit.'),
    password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak sama.',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
