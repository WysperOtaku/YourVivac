import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/AppShell';
import { TripCard } from '@/components/cards';
import { Icon } from '@/ui';
import { api } from '@/lib/api';
import { tripToCard } from '@/lib/format';

export function TripsListScreen() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['trips'], queryFn: () => api.trips.list(), retry: false });
  const trips = data ?? [];

  return (
    <AppShell topbar={{ title: 'Tus salidas', sub: 'Salidas' }}>
      <div className="mx-auto w-full max-w-5xl px-[18px] pb-6 lg:px-7 lg:pt-4">
        <div className="spread flex-none pb-3 pt-1.5 lg:hidden">
          <h1 className="text-[25px]">Tus salidas</h1>
          <button className="btn px-4 py-2 text-sm" onClick={() => navigate('/crear')}>
            <Icon name="plus" size={18} /> Nueva
          </button>
        </div>

        {isLoading ? (
          <div className="faint py-10 text-center text-sm">Cargando salidas…</div>
        ) : trips.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="muted">No tienes salidas todavía.</p>
            <button className="btn mt-3" onClick={() => navigate('/crear')}>
              <Icon name="plus" size={16} /> Crear la primera
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:max-w-none">
            {trips.map((t) => (
              <TripCard key={t.id} {...tripToCard(t)} onClick={() => navigate(`/salida/${t.id}`)} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
