import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { toast } from 'sonner';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { relativeTime } from '@/lib/format';

function isoDay(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
}

export function AdminScreen() {
  const qc = useQueryClient();

  const metricsQ = useQuery({ queryKey: ['admin-metrics'], queryFn: () => api.admin.metrics(), retry: false });
  const seriesQ = useQuery({
    queryKey: ['admin-series'],
    queryFn: () => api.admin.timeseries({ from: isoDay(-13), to: isoDay(0), metric: 'newUsers' }),
    retry: false,
  });
  const queueQ = useQuery({ queryKey: ['admin-guides'], queryFn: () => api.admin.guideApplications('pending'), retry: false });
  const reportsQ = useQuery({ queryKey: ['admin-reports'], queryFn: () => api.admin.reports(), retry: false });

  const reviewMut = useMutation({
    mutationFn: (v: { id: string; decision: 'approve' | 'reject' }) => api.admin.reviewGuide(v.id, { decision: v.decision }),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ['admin-guides'] });
      qc.invalidateQueries({ queryKey: ['admin-metrics'] });
      toast.success(v.decision === 'approve' ? 'Guía aprobado' : 'Solicitud rechazada');
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo procesar')),
  });
  const resolveMut = useMutation({
    mutationFn: (v: { id: string; status: 'resolved' | 'dismissed' }) => api.admin.resolveReport(v.id, { status: v.status, action: 'none' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo resolver')),
  });

  const m = metricsQ.data;
  const kpis: [string, number, string][] = [
    ['Usuarios', m?.users ?? 0, 'var(--accent)'],
    ['Salidas', m?.trips ?? 0, 'var(--ink)'],
    ['Consejos', m?.tips ?? 0, 'var(--sky)'],
    ['Guías pendientes', m?.pendingGuides ?? 0, 'var(--terra)'],
    ['Reportes abiertos', m?.openReports ?? 0, 'var(--terra)'],
  ];
  const series = (seriesQ.data ?? []).map((p) => ({ day: p.date.slice(8, 10), value: p.value }));
  const queue = queueQ.data ?? [];
  const reports = reportsQ.data ?? [];

  return (
    <AppShell topbar={{ title: 'Resumen', sub: 'Panel de administración' }}>
      <div className="px-[18px] pb-6 pt-3 lg:px-7 lg:pt-5">
        <div className="lg:hidden">
          <span className="chip chip--terra mb-3 inline-flex">
            <Icon name="lock" size={12} /> Admin
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
          {kpis.map(([l, n, c]) => (
            <div key={l} className="card px-4 py-4">
              <div className="eyebrow">{l}</div>
              <div className="mono mt-1.5 text-[28px]" style={{ color: c }}>{n}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start">
          {/* Cola de verificación */}
          <div className="card grow overflow-hidden">
            <div className="spread px-4 py-4 shadow-[inset_0_-1px_0_var(--line)]">
              <div className="row gap8">
                <Icon name="shield" size={18} className="text-terra" />
                <h3 className="font-display text-[18px]">Verificación de guías</h3>
              </div>
              <span className="chip chip--terra">{queue.length} pendientes</span>
            </div>
            <div className="px-4 pb-3 pt-1">
              {queueQ.isLoading ? (
                <div className="faint py-5 text-center text-sm">Cargando…</div>
              ) : queue.length === 0 ? (
                <div className="faint py-5 text-center text-sm">No hay solicitudes pendientes.</div>
              ) : (
                queue.map((app, i) => {
                  const applicant = app.userId as unknown as { displayName?: string; username?: string };
                  return (
                    <div key={app.id} className={`row gap10 flex-wrap py-3 ${i < queue.length - 1 ? 'border-b border-[var(--line)]' : ''}`}>
                      <div className="row gap10 min-w-0 grow">
                        <Avatar name={applicant?.displayName ?? 'Solicitante'} size={32} />
                        <div className="min-w-0">
                          <div className="text-sm">{applicant?.displayName ?? 'Solicitante'}</div>
                          <div className="faint mono text-[10.5px]">{app.certification} · {app.certBody}</div>
                        </div>
                      </div>
                      <span className="faint mono self-center text-xs">{relativeTime(app.createdAt)}</span>
                      <div className="row gap6 justify-end">
                        <button onClick={() => reviewMut.mutate({ id: app.id, decision: 'approve' })} disabled={reviewMut.isPending} className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent text-accent-ink" aria-label="Aprobar">
                          <Icon name="check" size={18} />
                        </button>
                        <button onClick={() => reviewMut.mutate({ id: app.id, decision: 'reject' })} disabled={reviewMut.isPending} className="grid h-[30px] w-[30px] place-items-center rounded-[9px] text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]" aria-label="Rechazar">
                          <Icon name="x" size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Reportes + actividad */}
          <div className="stack gap16 w-full flex-none lg:w-[320px]">
            <div className="card overflow-hidden">
              <div className="spread px-4 py-3.5 shadow-[inset_0_-1px_0_var(--line)]">
                <div className="row gap8">
                  <Icon name="flag" size={18} className="text-terra" />
                  <h3 className="font-display text-[17px]">Reportes</h3>
                </div>
              </div>
              <div className="px-4 pb-2.5 pt-1">
                {reports.length === 0 ? (
                  <div className="faint py-4 text-center text-[13px]">Sin reportes.</div>
                ) : (
                  reports.slice(0, 6).map((r, i) => (
                    <div key={r.id} className={`row gap10 py-3 ${i < Math.min(reports.length, 6) - 1 ? 'border-b border-[var(--line)]' : ''}`}>
                      <div className="grow min-w-0">
                        <div className="text-[13.5px]">{r.reason}</div>
                        <div className="faint mono mt-0.5 text-[10.5px]">{r.targetType} · {relativeTime(r.createdAt)}</div>
                      </div>
                      {r.status === 'open' ? (
                        <button className="chip chip--accent" style={{ fontSize: 10 }} onClick={() => resolveMut.mutate({ id: r.id, status: 'resolved' })}>
                          Resolver
                        </button>
                      ) : (
                        <span className="chip" style={{ fontSize: 10 }}>{r.status}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card px-4 py-4">
              <h3 className="mb-3 font-display text-[17px]">Nuevos usuarios (14 días)</h3>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series}>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'var(--bg-3)' }} contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {series.map((_, i) => (
                        <Cell key={i} fill="var(--accent)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
