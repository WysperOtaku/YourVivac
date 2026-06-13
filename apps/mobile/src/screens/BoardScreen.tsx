import { View, Text } from 'react-native';

// Worker (tablero+perfil móvil): board con gesture-handler/reanimated.
export function BoardScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-board px-5">
      <Text className="font-display text-2xl text-ink">Tablero</Text>
      <Text className="mt-2 text-ink-2">Mural de pines (móvil) — pendiente.</Text>
    </View>
  );
}
