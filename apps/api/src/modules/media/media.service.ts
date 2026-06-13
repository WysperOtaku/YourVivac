// media.service — optimiza (lib/images sharp) → sube (lib/cloudinary) → crea Media `pending`
// → encola moderación (cola image-moderation). UC-M1.
// Worker: usa MediaModel; valida MIME + tamaño.
export const MEDIA_MODULE = 'media';
