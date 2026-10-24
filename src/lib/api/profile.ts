import { apiClient } from '@/lib/api/client';

export async function getMyProfile() {
  const response = await apiClient.get<unknown>('/api/me');

  return response.data;
}
