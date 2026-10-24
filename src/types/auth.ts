type TokenContainer = {
  token?: string;
  accessToken?: string;
  access_token?: string;
};

export type AuthResponse = TokenContainer & {
  message?: string;
  data?: TokenContainer;
};

export function extractAccessToken(response: AuthResponse) {
  const token =
    response.token ??
    response.accessToken ??
    response.access_token ??
    response.data?.token ??
    response.data?.accessToken ??
    response.data?.access_token;

  if (!token) {
    throw new Error('Token tidak ditemukan pada respons autentikasi.');
  }

  return token;
}
