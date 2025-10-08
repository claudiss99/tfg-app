import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, TextInput, View } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      // Autenticar usuario
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        Alert.alert('Login fallido', authError.message);
        setLoading(false);
        return;
      }

      const userId = authData.user.id;
      console.log('=== DEBUG INFO ===');
      console.log('Auth User ID:', userId);
      console.log('Auth User Email:', authData.user.email);

      // Verificar qué usuarios existen en la tabla
      const { data: allUsers, error: allUsersError } = await supabase
        .from('usuarios')
        .select('id, email, role');
      
      console.log('Todos los usuarios en la tabla:', allUsers);
      console.log('Error al obtener todos los usuarios:', allUsersError);

      // Buscar el usuario específico
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('role')
        .eq('id', userId)
        .single();

      console.log('Datos del usuario específico:', userData);
      console.log('Error del usuario específico:', userError);

      setLoading(false);

      if (userError) {
        console.error('Error obteniendo datos del usuario:', userError);
        
        const { data: userByEmail, error: emailError } = await supabase
          .from('usuarios')
          .select('id, role')
          .eq('email', authData.user.email)
          .single();
        
        console.log('Búsqueda por email:', userByEmail);
        console.log('Error búsqueda por email:', emailError);
        
        if (emailError) {
          Alert.alert('Error', 'Usuario no encontrado en la base de datos');
          return;
        } else {
          Alert.alert('Login correcto', '¡Bienvenido!');
          if (userByEmail.role === 'admin') {
            router.replace('/screens/homeAdmin');
          } else {
            router.replace('/');
          }
          return;
        }
      }

      Alert.alert('Login correcto', '¡Bienvenido!');
      
      // Redirigir si el role es admin
      if (userData.role === 'admin') {
        router.replace('/screens/homeAdmin');
      } else {
        router.replace('/');
      }

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Ocurrió un error inesperado');
      console.error('Error en login:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          width: '100%',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
        }}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          width: '100%',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
        }}
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Entrar" onPress={handleLogin} />
      )}
    </View>
  );
}