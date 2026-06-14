import { MediaModel } from '../../models/ops.model.js';
import { optimizeImage } from '../../lib/images.js';
import { uploadBuffer } from '../../lib/cloudinary.js';
import { serializeDoc } from '../../lib/serialize.js';
import { getQueue, QUEUE_NAMES } from '../../workers/queues.js';
import { HttpError } from '../../middleware/error.js';

export const mediaService = {
  async upload(userId: string, file: Express.Multer.File) {
    if (!file) throw HttpError.badRequest('Falta el archivo');
    if (!file.mimetype.startsWith('image/')) throw HttpError.badRequest('Solo se permiten imágenes');

    const optimized = await optimizeImage(file.buffer);
    const uploaded = await uploadBuffer(optimized);
    const media = await MediaModel.create({
      uploaderId: userId,
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      bytes: uploaded.bytes,
      moderation: { status: 'pending', labels: [] },
    });

    // Encola la moderación (no bloquea la respuesta). Si Redis no está, no falla la subida.
    try {
      await getQueue(QUEUE_NAMES.imageModeration).add('moderate', { mediaId: String(media._id) });
    } catch {
      /* cola no disponible en este entorno */
    }
    return serializeDoc(media);
  },
};
