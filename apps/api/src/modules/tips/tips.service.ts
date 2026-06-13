// tips.service — feed por categoría, publicar/borrador (md saneado→moderación),
// detalle, editar, like/comentar (idempotente, actualiza counts, notifica autor).
// Worker: usa TipModel, ReactionModel, CommentModel, ActivityModel; slug/readingMinutes utils.
export const TIPS_MODULE = 'tips';
