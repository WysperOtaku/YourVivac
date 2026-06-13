import { View, Text } from 'react-native';

// Worker (núcleo móvil): Home con feed/salidas/ranking reusando sdk + stores.
export function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-5">
      <Text className="font-display text-2xl text-ink">Tu cordada</Text>
      <Text className="mt-2 text-ink-2">Inicio (móvil) — pendiente de implementar.</Text>
    </View>
  );
}
