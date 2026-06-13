import { createApiClient } from '@yourvivac/sdk';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

/** Cliente API singleton para toda la web (interceptor de refresh incluido). */
export const api = createApiClient({
  baseURL,
  withCredentials: true,
  onUnauthorized: () => {
    // El store de auth puede suscribirse / redirigir a login.
    window.dispatchEvent(new CustomEvent('yv:unauthorized'));
  },
});
