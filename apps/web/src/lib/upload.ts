import type { MediaRef } from '@yourvivac/types';
import { api } from '@/lib/api';

/** Sube una imagen a Cloudinary (vía el API) y devuelve su MediaRef. */
export async function uploadImage(file: File): Promise<MediaRef> {
  const m = await api.media.upload(file);
  return { url: m.url, publicId: m.publicId, width: m.width, height: m.height };
}
