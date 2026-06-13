import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

let configured = false;
function ensureConfigured(): void {
  if (configured) return;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  configured = true;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
}

/** Sube un buffer (ya optimizado con sharp) a Cloudinary. */
export function uploadBuffer(buffer: Buffer, folder = 'yourvivac'): Promise<UploadResult> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (err, result) => {
        if (err || !result) return reject(err ?? new Error('Subida fallida'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      })
      .end(buffer);
  });
}

export function destroyImage(publicId: string): Promise<unknown> {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId);
}
