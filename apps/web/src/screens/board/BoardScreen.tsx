import { useParams } from 'react-router-dom';
import { ScreenStub } from '@/components/ScreenStub';

// Worker (tablero): variantes free/wall/guided con @dnd-kit, 6 tipos de pin, socket en vivo.
export function BoardScreen() {
  const { id } = useParams();
  return <ScreenStub unit={`Tablero ${id ?? ''}`} title="Tablero de la salida" />;
}
