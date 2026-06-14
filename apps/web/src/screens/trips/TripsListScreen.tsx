import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/AppShell';
import { TripCard, type Member } from '@/components/cards';
import { Icon } from '@/ui';
import { api } from '@/lib/api';

const DEMO = [
  { name: 'Vivac en el Aneto', place: 'Benasque, Huesca', date: '14 JUN', m: '1.180', dist: '22', status: 'Confirmada', members: [{ n: 'Marcos' }, { n: 'Lucía', t: 't' }, { n: 'Iker', t: 's' }] as Member[] },
  { name: 'Travesía GR-11', place: 'Pirineo navarro', date: '2 JUL', m: '2.400', dist: '48', status: 'Planeando', members: [{ n: 'Marcos' }, { n: 'Bea', t: 't' }] as Member[] },
  { name: 'Posets por Llardaneta', place: 'Benasque', date: '20 JUL', m: '1.510', dist: '19', status: 'Planeando', members: [{ n: 'Marcos' }] as Member[] },
];

export function TripsListScreen() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ['trips'], queryFn: () => api.trips.list(), retry: false });

  const trips =
    data && data.length > 0
      ? data.map((t) => ({
          id: t.id,
          name: t.title,
          place: t.location?.name ?? '',
          date: new Date(t.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase(),
          m: String(t.elevationGain ?? 0),
          dist: String(t.distanceKm ?? 0),
          status: t.status === 'confirmed' ? 'Confirmada' : 'Planeando',
          members: (t.members ?? []).map((mm) => ({ n: String(mm.userId).slice(0, 6) })) as Member[],
        }))
      : DEMO.map((d) => ({ id: undefined as string | undefined, ...d }));

  return (
    <AppShell topbar={{ title: 'Tus salidas', sub: 'Salidas' }}>
      <div className="mx-auto w-full max-w-5xl px-[18px] pb-6 lg:px-7 lg:pt-4">
        <div className="spread flex-none pb-3 pt-1.5 lg:hidden">
          <h1 className="text-[25px]">Tus salidas</h1>
          <button className="btn px-4 py-2 text-sm" onClick={() => navigate('/crear')}>
            <Icon name="plus" size={18} /> Nueva
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:max-w-none">
          {trips.map((t, i) => (
            <TripCard key={i} {...t} onClick={() => navigate(t.id ? `/salida/${t.id}` : '/salida/demo')} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
