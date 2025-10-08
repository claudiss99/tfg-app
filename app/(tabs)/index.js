import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Pantalla Principal</Text>
      <Button
        title="Ir a Login"
        onPress={() => router.push('/screens/login')}
      />
    </View>
  );
}
