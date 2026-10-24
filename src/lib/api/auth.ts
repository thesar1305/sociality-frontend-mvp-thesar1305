import { apiClient } from '@/lib/api/client';
import type {
  LoginFormValues,
  RegisterFormValues,
} from '@/lib/validation/auth';
import type { AuthResponse } from '@/types/auth';

export async function loginUser(values: LoginFormValues) {
  const response = await apiClient.post<AuthResponse>(
    '/api/auth/login',
    values
  );

  return response.data;
}

export async function registerUser(values: RegisterFormValues) {
  const payload = {
    name: values.name,
    username: values.username,
    email: values.email,
    phone: values.phone,
    password: values.password,
  };

  const response = await apiClient.post<AuthResponse>(
    '/api/auth/register',
    payload
  );

  return response.data;
}
