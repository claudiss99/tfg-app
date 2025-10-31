// app/screens/homeEmpleado.js
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../supabaseClient';

export default function HomeEmpleado() {
  const [empleado, setEmpleado] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    turnosEsteMes: 0,
    horasTrabajadas: 0,
    proximoTurno: null
  });
  
  const router = useRouter();

  // ✅ CARGAR DATOS DEL EMPLEADO AL INICIAR
  useEffect(() => {
    cargarDatosEmpleado();
  }, []);

  const cargarDatosEmpleado = async () => {
    try {
      setCargando(true);
      
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        router.replace('/screens/login');
        return;
      }

      // Obtener datos del empleado
      const { data: datosEmpleado, error: errorEmpleado } = await supabase
        .from('usuarios')
        .select(`
          *,
          empleados (
            codigo_empleado,
            dni,
            horas_semanales,
            is_active
          )
        `)
        .eq('id', user.id)
        .single();

      if (errorEmpleado) {
        console.error('Error cargando empleado:', errorEmpleado);
        Alert.alert('Error', 'No se pudieron cargar los datos del empleado');
        return;
      }

      setEmpleado(datosEmpleado);
      
      // Cargar turnos del empleado
      await cargarTurnos(user.id);
      
      // Calcular estadísticas
      await calcularEstadisticas(user.id);
      
    } catch (error) {
      console.error('Error en cargarDatosEmpleado:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const cargarTurnos = async (userId) => {
    try {
      // Por ahora, simulamos turnos (después conectarás con tu tabla real)
      const turnosSimulados = [
        {
          id: 1,
          fecha: '2025-01-27',
          hora_inicio: '09:00',
          hora_fin: '17:00',
          estado: 'programado',
          tipo: 'Turno Regular'
        },
        {
          id: 2,
          fecha: '2025-01-28',
          hora_inicio: '14:00',
          hora_fin: '22:00',
          estado: 'programado',
          tipo: 'Turno Tarde'
        },
        {
          id: 3,
          fecha: '2025-01-25',
          hora_inicio: '09:00',
          hora_fin: '17:00',
          estado: 'completado',
          tipo: 'Turno Regular'
        }
      ];
      
      setTurnos(turnosSimulados);
    } catch (error) {
      console.error('Error cargando turnos:', error);
    }
  };

  const calcularEstadisticas = async (userId) => {
    try {
      // Simular estadísticas (después las calcularás con datos reales)
      const stats = {
        turnosEsteMes: 12,
        horasTrabajadas: 96,
        proximoTurno: {
          fecha: '2025-01-27',
          hora: '09:00'
        }
      };
      
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarDatosEmpleado();
    setRefrescando(false);
  };

  const cerrarSesion = () => {
    Alert.alert(
      '🚪 Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/screens/login');
          }
        }
      ]
    );
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'programado': return '#3B82F6';
      case 'completado': return '#10B981';
      case 'cancelado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'programado': return 'Programado';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.textoCarga}>Cargando datos del empleado...</Text>
      </View>
    );
  }

  if (!empleado) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.textoError}>No se pudieron cargar los datos del empleado</Text>
        <TouchableOpacity style={styles.botonReintentar} onPress={cargarDatosEmpleado}>
          <Text style={styles.textoBotonReintentar}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
    >
      {/* Header con información del empleado */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.saludo}>¡Hola, {empleado.email.split('@')[0]}!</Text>
          <Text style={styles.rol}>🏷️ {empleado.empleados?.[0]?.codigo_empleado || 'Sin código'}</Text>
          <Text style={styles.infoEmpleado}>👤 {empleado.rol} • 📱 {empleado.telefono}</Text>
        </View>
        
        <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
          <Text style={styles.textoCerrarSesion}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Tarjetas de estadísticas */}
      <View style={styles.estadisticas}>
        <View style={styles.tarjetaEstadistica}>
          <Text style={styles.numeroEstadistica}>{estadisticas.turnosEsteMes}</Text>
          <Text style={styles.labelEstadistica}>Turnos este mes</Text>
        </View>
        
        <View style={styles.tarjetaEstadistica}>
          <Text style={styles.numeroEstadistica}>{estadisticas.horasTrabajadas}h</Text>
          <Text style={styles.labelEstadistica}>Horas trabajadas</Text>
        </View>
        
        <View style={styles.tarjetaEstadistica}>
          <Text style={styles.numeroEstadistica}>
            {empleado.empleados?.[0]?.horas_semanales || 0}h
          </Text>
          <Text style={styles.labelEstadistica}>Horas semanales</Text>
        </View>
      </View>

      {/* Próximo turno destacado */}
      {estadisticas.proximoTurno && (
        <View style={styles.proximoTurno}>
          <Text style={styles.tituloProximoTurno}>🕐 Próximo Turno</Text>
          <Text style={styles.fechaProximoTurno}>
            {formatearFecha(estadisticas.proximoTurno.fecha)}
          </Text>
          <Text style={styles.horaProximoTurno}>
            a las {estadisticas.proximoTurno.hora}
          </Text>
        </View>
      )}

      {/* Lista de turnos */}
      <View style={styles.seccionTurnos}>
        <Text style={styles.tituloSeccion}>📅 Mis Turnos</Text>
        
        {turnos.length === 0 ? (
          <View style={styles.sinTurnos}>
            <Text style={styles.textoSinTurnos}>📭 No tienes turnos asignados</Text>
            <Text style={styles.subtextoSinTurnos}>
              Contacta con tu encargado para que te asigne turnos
            </Text>
          </View>
        ) : (
          turnos.map((turno) => (
            <View key={turno.id} style={styles.tarjetaTurno}>
              <View style={styles.encabezadoTurno}>
                <Text style={styles.fechaTurno}>{formatearFecha(turno.fecha)}</Text>
                <View style={[styles.estadoTurno, { backgroundColor: obtenerColorEstado(turno.estado) }]}>
                  <Text style={styles.textoEstado}>{obtenerTextoEstado(turno.estado)}</Text>
                </View>
              </View>
              
              <Text style={styles.horaTurno}>
                🕐 {turno.hora_inicio} - {turno.hora_fin}
              </Text>
              <Text style={styles.tipoTurno}>📋 {turno.tipo}</Text>
            </View>
          ))
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.acciones}>
        <TouchableOpacity style={styles.botonAccion}>
          <Text style={styles.textoBotonAccion}>📊 Ver Historial</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.botonAccion}>
          <Text style={styles.textoBotonAccion}>⚙️ Mi Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Información adicional */}
      <View style={styles.infoAdicional}>
        <Text style={styles.tituloInfo}>ℹ️ Información</Text>
        <Text style={styles.textoInfo}>
          • Para cambios en turnos, contacta con tu encargado
        </Text>
        <Text style={styles.textoInfo}>
          • Recuerda marcar entrada y salida en cada turno
        </Text>
        <Text style={styles.textoInfo}>
          • Si tienes dudas, consulta con administración
        </Text>
      </View>

      {/* Espaciado inferior */}
      <View style={styles.espacioInferior} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  textoCarga: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  textoError: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  botonReintentar: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBotonReintentar: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  saludo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  rol: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
    marginBottom: 3,
  },
  infoEmpleado: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  botonCerrarSesion: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCerrarSesion: {
    fontSize: 20,
  },

  estadisticas: {
    flexDirection: 'row',
    margin: 15,
    gap: 10,
  },
  tarjetaEstadistica: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  numeroEstadistica: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  labelEstadistica: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  proximoTurno: {
    backgroundColor: '#EBF8FF',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  tituloProximoTurno: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  fechaProximoTurno: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    textTransform: 'capitalize',
  },
  horaProximoTurno: {
    fontSize: 16,
    color: '#3B82F6',
    marginTop: 4,
  },

  seccionTurnos: {
    margin: 15,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  sinTurnos: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  textoSinTurnos: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  subtextoSinTurnos: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  tarjetaTurno: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  encabezadoTurno: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fechaTurno: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textTransform: 'capitalize',
  },
  estadoTurno: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textoEstado: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  horaTurno: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  tipoTurno: {
    fontSize: 14,
    color: '#6B7280',
  },

  acciones: {
    flexDirection: 'row',
    margin: 15,
    gap: 10,
  },
  botonAccion: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textoBotonAccion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  infoAdicional: {
    margin: 15,
    backgroundColor: '#FFFBEB',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tituloInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  textoInfo: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },

  espacioInferior: {
    height: 30,
  },
});