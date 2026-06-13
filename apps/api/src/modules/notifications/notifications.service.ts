// notifications.service — listar + contador de no leídas, marcar todo leído.
// Worker: usa NotificationModel; el fan-out de creación lo hace la cola `notifications`.
export const NOTIFICATIONS_MODULE = 'notifications';
