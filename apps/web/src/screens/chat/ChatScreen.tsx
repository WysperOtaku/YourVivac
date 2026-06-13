import { useParams } from 'react-router-dom';
import { ScreenStub } from '@/components/ScreenStub';

// Worker (chat, opcional web): mensajes del grupo + pin compartido (Socket.IO).
export function ChatScreen() {
  const { id } = useParams();
  return <ScreenStub unit={`Chat ${id ?? ''}`} title="Chat del grupo" />;
}
