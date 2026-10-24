import { apiClient } from '@/lib/api/client';
import type { MyProfileResponse } from '@/types/profile';

export async function getMyProfile() {
  const response = await apiClient.get<MyProfileResponse>('/api/me');

  return response.data;
}
