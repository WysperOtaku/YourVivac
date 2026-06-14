import { Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/" element={<HomeScreen />} />
      <Route path="/crear" element={<CreateTripScreen />} />
      <Route path="/salidas" element={<TripsListScreen />} />
      <Route path="/salida/:id" element={<TripDetailScreen />} />
      <Route path="/salida/:id/tablero" element={<BoardScreen />} />
      <Route path="/salida/:id/chat" element={<ChatScreen />} />
      <Route path="/explorar" element={<ExploreScreen />} />
      <Route path="/equipo" element={<GearScreen />} />
      <Route path="/consejos" element={<TipsScreen />} />
      <Route path="/perfil" element={<ProfileScreen />} />
      <Route path="/perfil/guia" element={<ProfileScreen guide />} />
      <Route path="/ajustes" element={<SettingsScreen />} />
      <Route
        path="/admin"
        element={
          <RoleGuard roles={['admin']}>
            <AdminScreen />
          </RoleGuard>
        }
      />
      <Route path="*" element={<HomeScreen />} />
    </Routes>
  );
}
