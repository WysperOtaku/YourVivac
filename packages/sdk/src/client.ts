import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

export interface TokenStore {
  getAccessToken(): string | null;
  setAccessToken(token: string | null): void;
}

/** Store en memoria por defecto (web/móvil pueden inyectar uno persistente). */
export function createMemoryTokenStore(): TokenStore {
  let token: string | null = null;
  return {
    getAccessToken: () => token,
    setAccessToken: (t) => {
      token = t;
    },
  };
}

export interface ApiClientOptions {
  baseURL: string;
  tokenStore?: TokenStore;
  /** withCredentials para enviar la cookie httpOnly de refresh (web). */
  withCredentials?: boolean;
  onUnauthorized?: () => void;
}

/**
 * Crea la instancia Axios con interceptores de auth:
 * - añade `Authorization: Bearer` desde el token store
 * - ante un 401, intenta `POST /auth/refresh` una vez y reintenta la request original
 */
export function createHttpClient(options: ApiClientOptions): {
  http: AxiosInstance;
  tokenStore: TokenStore;
} {
  const tokenStore = options.tokenStore ?? createMemoryTokenStore();
  const http = axios.create({
    baseURL: options.baseURL,
    withCredentials: options.withCredentials ?? true,
  });

  http.interceptors.request.use((config) => {
    const token = tokenStore.getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  let refreshing: Promise<string | null> | null = null;

  http.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
      const status = error.response?.status;
      const isRefreshCall = original?.url?.includes('/auth/refresh');

      if (status === 401 && original && !original._retry && !isRefreshCall) {
        original._retry = true;
        try {
          refreshing =
            refreshing ??
            http
              .post<{ accessToken: string }>('/auth/refresh')
              .then((r) => r.data.accessToken)
              .finally(() => {
                refreshing = null;
              });
          const newToken = await refreshing;
          if (newToken) {
            tokenStore.setAccessToken(newToken);
            original.headers = original.headers ?? {};
            (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
            return http(original);
          }
        } catch {
          tokenStore.setAccessToken(null);
          options.onUnauthorized?.();
        }
      }
      return Promise.reject(error);
    },
  );

  return { http, tokenStore };
}
