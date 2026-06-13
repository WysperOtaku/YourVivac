import sharp from 'sharp';

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/** Optimiza una imagen (resize + recompresión a WebP) antes de subirla a Cloudinary. */
export async function optimizeImage(input: Buffer, opts: OptimizeOptions = {}): Promise<Buffer> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 82 } = opts;
  return sharp(input)
    .rotate()
    .resize({ width: maxWidth, height: maxHeight, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}
