import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { guideRouter } from '../modules/guide/guide.routes.js';
import { tripsRouter, exploreRouter } from '../modules/trips/trips.routes.js';
import { boardRouter, pinsRouter } from '../modules/board/board.routes.js';
import { gearRouter, productsRouter } from '../modules/gear/gear.routes.js';
import { chatRouter, messagesRouter } from '../modules/chat/chat.routes.js';
import { tipsRouter } from '../modules/tips/tips.routes.js';
import { notificationsRouter } from '../modules/notifications/notifications.routes.js';
import { mediaRouter } from '../modules/media/media.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';
import { feedRouter } from '../modules/feed/feed.routes.js';
import { mapsRouter } from '../modules/maps/maps.routes.js';
import { routingRouter } from '../modules/routing/routing.routes.js';

/**
 * Registro central de rutas (/api/v1). Cada módulo ya está cableado aquí; los
 * workers sólo rellenan la lógica dentro de su carpeta `modules/<dominio>/`.
 * Nota: `boardRouter` y `chatRouter` comparten el prefijo `/trips` con `tripsRouter`
 * (Express compone varios routers sobre el mismo path).
 */
export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/guide', guideRouter);
apiRouter.use('/trips', tripsRouter);
apiRouter.use('/trips', boardRouter);
apiRouter.use('/trips', chatRouter);
apiRouter.use('/explore', exploreRouter);
apiRouter.use('/pins', pinsRouter);
apiRouter.use('/gear-lists', gearRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/messages', messagesRouter);
apiRouter.use('/tips', tipsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/feed', feedRouter);
apiRouter.use('/maps', mapsRouter);
apiRouter.use('/routing', routingRouter);
