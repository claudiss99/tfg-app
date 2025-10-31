
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeAdmin() {
  const router = useRouter();

  const handleProximosHorarios = () => {
    router.push('/screens/generarHorarios') 
  };

  const handleAltaUsuario = () => {
    // ✅ NUEVA FUNCIONALIDAD: Navegar a pantalla de alta
    router.push('/screens/altaUsuarios');
  };

  const handleBajaUsuario = () => {
    Alert.alert('Baja Usuario', 'Funcionalidad en desarrollo');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración</Text>
      </View>

      {/* Sección Recordatorios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Recordatorios</Text>
        <TouchableOpacity style={styles.linkButton} onPress={handleProximosHorarios}>
          <Text style={styles.linkText}>Realizar próximos horarios</Text>
        </TouchableOpacity>
      </View>

      {/* Sección Avisos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Avisos</Text>
        <View style={styles.avisoContainer}>
          <Text style={styles.avisoText}>• Revisión de horarios pendiente</Text>
          <Text style={styles.avisoText}>• Actualizar configuración del sistema</Text>
          <Text style={styles.avisoText}>• Verificar usuarios inactivos</Text>
        </View>
      </View>

      {/* Sección Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAltaUsuario}>
            <Text style={styles.buttonText}>➕ Dar alta usuario</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleBajaUsuario}>
            <Text style={styles.buttonText}>➖ Dar baja usuario</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  linkButton: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  linkText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '500',
  },
  avisoContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  avisoText: {
    color: '#E65100',
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});