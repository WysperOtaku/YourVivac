import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { RoleGuard } from '@/components/RoleGuard';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { CreateTripScreen } from '@/screens/trips/CreateTripScreen';
import { TripDetailScreen } from '@/screens/trips/TripDetailScreen';
import { TripsListScreen } from '@/screens/trips/TripsListScreen';
import { BoardScreen } from '@/screens/board/BoardScreen';
import { ChatScreen } from '@/screens/chat/ChatScreen';
import { ExploreScreen } from '@/screens/explore/ExploreScreen';
import { GearScreen } from '@/screens/gear/GearScreen';
import { TipsScreen } from '@/screens/tips/TipsScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { AdminScreen } from '@/screens/admin/AdminScreen';

/** Envuelve una pantalla privada con el guard de sesión. */
function Private({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/" element={<Private><HomeScreen /></Private>} />
      <Route path="/crear" element={<Private><CreateTripScreen /></Private>} />
      <Route path="/salidas" element={<Private><TripsListScreen /></Private>} />
      <Route path="/salida/:id" element={<Private><TripDetailScreen /></Private>} />
      <Route path="/salida/:id/tablero" element={<Private><BoardScreen /></Private>} />
      <Route path="/salida/:id/chat" element={<Private><ChatScreen /></Private>} />
      <Route path="/explorar" element={<Private><ExploreScreen /></Private>} />
      <Route path="/equipo" element={<Private><GearScreen /></Private>} />
      <Route path="/consejos" element={<Private><TipsScreen /></Private>} />
      <Route path="/perfil" element={<Private><ProfileScreen /></Private>} />
      <Route path="/u/:username" element={<Private><ProfileScreen /></Private>} />
      <Route path="/ajustes" element={<Private><SettingsScreen /></Private>} />
      <Route
        path="/admin"
        element={
          <RoleGuard roles={['admin']}>
            <AdminScreen />
          </RoleGuard>
        }
      />
      <Route path="*" element={<Private><HomeScreen /></Private>} />
    </Routes>
  );
}
