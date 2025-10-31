// screens/AltaUsuarioScreen.js
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import FormularioAltaUsuario from '../components/formularioAlta';

export default function AltaUsuarioScreen() {
  const router = useRouter();

  const manejarUsuarioCreado = (resultado) => {
    console.log('Usuario creado:', resultado);
    // Volver al dashboard
    router.back();
  };

  const manejarCancelar = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <FormularioAltaUsuario 
        onUsuarioCreado={manejarUsuarioCreado}
        onCancelar={manejarCancelar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});