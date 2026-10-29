import axios from 'axios';

import { getAccessToken } from '@/lib/auth/storage';
import type { ApiErrorResponse } from '@/types/api';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const body = error.response?.data;

    if (Array.isArray(body?.data)) {
      const details = body.data
        .map((item) => item?.msg)
        .filter((msg): msg is string => typeof msg === 'string' && msg !== '');

      if (details.length > 0) {
        return details.join(', ');
      }
    }

    const message = body?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message ?? 'Permintaan ke server gagal.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan yang tidak diketahui.';
}
