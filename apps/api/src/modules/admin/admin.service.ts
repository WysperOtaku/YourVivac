// admin.service — KPIs + series (DailyMetricsModel), gestión de usuarios (rol/suspender/banear),
// cola de guías (aprobar→role='guide' + guide.verifiedAt / rechazar→motivo), reportes.
// Worker: usa UserModel, GuideApplicationModel, ReportModel, DailyMetricsModel; notifica al solicitante.
export const ADMIN_MODULE = 'admin';
