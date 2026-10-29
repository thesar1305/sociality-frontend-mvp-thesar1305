import { apiClient } from '@/lib/api/client';
import type { MyProfileResponse } from '@/types/profile';
import type { UpdateProfileFormValues } from '@/lib/validation/profile';

export async function getMyProfile() {
  const response = await apiClient.get<MyProfileResponse>('/api/me');

  return response.data;
}

// PATCH /api/me menerima multipart/form-data (name, username, phone, bio, avatar).
export async function updateMyProfile(
  values: UpdateProfileFormValues,
  avatar?: File | null
) {
  const formData = new FormData();

  formData.append('name', values.name);
  formData.append('username', values.username);
  formData.append('phone', values.phone);
  formData.append('bio', values.bio);

  if (avatar) {
    formData.append('avatar', avatar);
  }

  const response = await apiClient.patch('/api/me', formData);

  return response.data;
}
