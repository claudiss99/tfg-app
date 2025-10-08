import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false); // Nuevo estado

  useEffect(() => {
    // Listener para manejar deep links
    const handleDeepLink = async (url) => { // Hacer asíncrona
      console.log('Deep link recibido:', url);
      
      // Parsear la URL para extraer los parámetros
      const parsed = Linking.parse(url);
      
      if (parsed.queryParams) {
        const { access_token, refresh_token, type } = parsed.queryParams;
        
        if (type === 'recovery' && access_token) {
          console.log('Token de recuperación encontrado');
          // Establecer la sesión con los tokens recibidos
          await setSession(access_token, refresh_token); // Esperar a que termine
        }
      }
    };

    // Obtener URL inicial (si la app se abrió desde un link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listener para URLs mientras la app está abierta
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const setSession = async (accessToken, refreshToken) => {
    try {
      console.log('Intentando establecer sesión...');
      
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (error) {
        console.error('Error estableciendo sesión:', error);
        Alert.alert('Error', 'No se pudo establecer la sesión de recuperación');
        setSessionReady(false);
        return;
      }
      
      console.log('Sesión establecida correctamente:', data);
      setSessionReady(true); // Marcar que la sesión está lista
    } catch (error) {
      console.error('Error inesperado:', error);
      Alert.alert('Error', 'Error inesperado al establecer la sesión');
      setSessionReady(false);
    }
  };

  const handleResetPassword = async () => {
    console.log('Botón pulsado');
    
    // Validaciones de entrada
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      console.log('Verificando sesión...');
      
      // Verificar que hay una sesión activa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('Sesión obtenida:', session);
      console.log('Error de sesión:', sessionError);
      
      if (sessionError) {
        console.error('Error al obtener sesión:', sessionError);
        Alert.alert('Error', 'Error al verificar la sesión: ' + sessionError.message);
        setLoading(false);
        return;
      }
      
      if (!session) {
        console.log('No hay sesión activa');
        Alert.alert('Error', 'No hay una sesión de recuperación activa. Por favor, usa el enlace del email nuevamente.');
        setLoading(false);
        return;
      }

      console.log('Actualizando contraseña...');
      
      // Actualizar la contraseña
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({ 
        password: password 
      });

      console.log('Resultado actualización:', { updateData, updateError });

      setLoading(false);

      if (updateError) {
        console.error('Error al actualizar contraseña:', updateError);
        Alert.alert('Error', 'Error al establecer la contraseña: ' + updateError.message);
      } else {
        console.log('Contraseña actualizada correctamente');
        Alert.alert(
          'Éxito', 
          '¡Contraseña establecida correctamente!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/screens/login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error inesperado en handleResetPassword:', error);
      Alert.alert('Error', 'Error inesperado: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 16, 
      backgroundColor: '#fff' 
    }}>
      <Text style={{ 
        fontSize: 24, 
        marginBottom: 20, 
        color: '#222' 
      }}>
        Establecer contraseña
      </Text>
      
      {/* Indicador de estado de sesión para debugging */}
      <Text style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
        Estado de sesión: {sessionReady ? 'Lista' : 'No establecida'}
      </Text>
      
      <TextInput
        placeholder="Nueva contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ 
          width: '100%', 
          borderWidth: 1, 
          borderRadius: 8, 
          marginBottom: 12, 
          padding: 10, 
          color: '#222', 
          backgroundColor: '#f9f9f9' 
        }}
      />
      
      <TextInput
        placeholder="Repite la nueva contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{ 
          width: '100%', 
          borderWidth: 1, 
          borderRadius: 8, 
          marginBottom: 12, 
          padding: 10, 
          color: '#222', 
          backgroundColor: '#f9f9f9' 
        }}
      />
      
      <Button 
        title={loading ? "Guardando..." : "Establecer Contraseña"} 
        onPress={handleResetPassword} 
        disabled={loading} 
      />
    </View>
  );
}