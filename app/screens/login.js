// app/screens/login.js (SIMPLIFICADO)
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  // En app/screens/login.js, actualizar la función handleLogin:

// En app/screens/login.js, reemplazar la función handleLogin:

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Por favor completa todos los campos');
    return;
  }

  setCargando(true);
  
  try {
    // ✅ DEBUGGING DETALLADO
    console.log('🔐 === INICIO DE LOGIN ===');
    console.log('📧 Email crudo:', `"${email}"`);
    console.log('📧 Email length:', email.length);
    console.log('🔑 Password crudo:', `"${password}"`);
    console.log('🔑 Password length:', password.length);
    
    // Limpiar datos
    const emailLimpio = email.trim().toLowerCase();
    const passwordLimpio = password.trim();
    
    console.log('📧 Email limpio:', `"${emailLimpio}"`);
    console.log('🔑 Password limpio:', `"${passwordLimpio}"`);
    
    // Verificar que no están vacíos después de limpiar
    if (!emailLimpio || !passwordLimpio) {
      Alert.alert('Error', 'Email o contraseña vacíos después de limpiar');
      return;
    }
    
    console.log('🚀 Enviando request a Supabase...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLimpio,
      password: passwordLimpio,
    });

    console.log('📥 Respuesta de Supabase:');
    console.log('✅ Data:', data);
    console.log('❌ Error:', error);

    if (error) {
      console.error('❌ ERROR COMPLETO:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Error de login', 
        `Detalles del error:
        
Código: ${error.status || 'N/A'}
Mensaje: ${error.message || 'Sin mensaje'}
Tipo: ${error.name || 'Sin tipo'}

Email usado: ${emailLimpio}
Password length: ${passwordLimpio.length}

¿Es correcta esta información?`
      );
      return;
    }

    console.log('✅ Login exitoso para:', data.user.email);

    // Verificar rol
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', data.user.id)
      .single();

    if (errorUsuario) {
      console.error('❌ Error obteniendo rol:', errorUsuario);
      Alert.alert('Error', 'No se pudo verificar el rol del usuario');
      return;
    }

    console.log('👤 Rol del usuario:', usuario.rol);

    // Navegar según el rol
    if (usuario?.rol === 'admin') {
      router.replace('/screens/homeAdmin');
    } else {
      router.replace('/screens/homeEmpleado');
    }

  } catch (error) {
    console.error('❌ ERROR DE CATCH:', error);
    Alert.alert('Error', 'Error inesperado: ' + error.message);
  } finally {
    setCargando(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, cargando && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: 'white',
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});