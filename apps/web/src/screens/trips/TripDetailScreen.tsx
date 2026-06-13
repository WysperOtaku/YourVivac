import { useParams } from 'react-router-dom';
import { ScreenStub } from '@/components/ScreenStub';

// Worker (crear+detalle salida): detalle de salida (miembros, fechas, lugar, acciones).
export function TripDetailScreen() {
  const { id } = useParams();
  return <ScreenStub unit={`Salida ${id ?? ''}`} title="Detalle de la salida" />;
}
