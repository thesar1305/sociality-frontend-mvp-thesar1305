export type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  data?: { msg?: string; path?: string }[] | null;
  statusCode?: number;
};
