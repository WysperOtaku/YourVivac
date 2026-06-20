import { createApiClient } from '@yourvivac/sdk';

// Por defecto, ruta relativa: el navegador llama a su propio origen y el servidor
// web hace de proxy hacia el API. Railway puede fijar VITE_API_URL absoluto.
const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1';

/** Cliente API singleton para toda la web (interceptor de refresh incluido). */
export const api = createApiClient({
  baseURL,
  withCredentials: true,
  onUnauthorized: () => {
    // El store de auth puede suscribirse / redirigir a login.
    window.dispatchEvent(new CustomEvent('yv:unauthorized'));
  },
});
