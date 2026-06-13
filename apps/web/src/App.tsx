import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { CreateTripScreen } from '@/screens/trips/CreateTripScreen';
import { TripDetailScreen } from '@/screens/trips/TripDetailScreen';
import { BoardScreen } from '@/screens/board/BoardScreen';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import { ExploreScreen } from '@/screens/explore/ExploreScreen';
import { GearScreen } from '@/screens/gear/GearScreen';
import { TipsScreen } from '@/screens/tips/TipsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { AdminScreen } from '@/screens/admin/AdminScreen';

const withShell = (node: React.ReactNode) => <AppShell>{node}</AppShell>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/" element={withShell(<HomeScreen />)} />
      <Route path="/crear" element={withShell(<CreateTripScreen />)} />
      <Route path="/salida/:id" element={withShell(<TripDetailScreen />)} />
      <Route path="/salida/:id/tablero" element={withShell(<BoardScreen />)} />
      <Route path="/salida/:id/chat" element={withShell(<ChatScreen />)} />
      <Route path="/explorar" element={withShell(<ExploreScreen />)} />
      <Route path="/equipo" element={withShell(<GearScreen />)} />
      <Route path="/consejos" element={withShell(<TipsScreen />)} />
      <Route path="/perfil" element={withShell(<ProfileScreen />)} />
      <Route path="/ajustes" element={withShell(<SettingsScreen />)} />
      <Route
        path="/admin"
        element={
          <RoleGuard roles={['admin']}>{withShell(<AdminScreen />)}</RoleGuard>
        }
      />
      <Route path="*" element={withShell(<HomeScreen />)} />
    </Routes>
  );
}
