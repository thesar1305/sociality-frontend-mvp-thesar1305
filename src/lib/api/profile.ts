import { apiClient } from '@/lib/api/client';
import type { MyProfileResponse } from '@/types/profile';
import type { UpdateProfileFormValues } from '@/lib/validation/profile';

export async function getMyProfile() {
  const response = await apiClient.get<MyProfileResponse>('/api/me');

  return response.data;
}

export async function updateMyProfile(values: UpdateProfileFormValues) {
  const response = await apiClient.patch('/api/me', values);
  return response.data;
}
