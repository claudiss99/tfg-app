// app/components/FormularioAltaUsuario.js (CÓDIGO COMPLETO FINAL)
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { altaUsuario } from '../lib/services/usuarioService';

export default function FormularioAltaUsuario({ onUsuarioCreado, onCancelar }) {
  const [formulario, setFormulario] = useState({
    email: '',
    telefono: '',
    rol: 'empleado',
    dni: '',
    horas_semanales: ''
  });
  
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  
  // ✅ ESTADO PARA MOSTRAR CREDENCIALES
  const [mostrarCredenciales, setMostrarCredenciales] = useState(false);
  const [credencialesCreadas, setCredencialesCreadas] = useState(null);

  // ✅ FUNCIÓN PARA ACTUALIZAR CAMPOS
  const actualizarCampo = (campo, valor) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
    
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }));
    }
    
    if (campo === 'rol') {
      let horasPorDefecto = '';
      if (valor === 'encargado') horasPorDefecto = '40';
      if (valor === 'empleado') horasPorDefecto = '25';
      
      setFormulario(prev => ({ ...prev, horas_semanales: horasPorDefecto }));
    }
  };

  // ✅ FUNCIÓN PARA VALIDAR FORMULARIO
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formulario.email) {
      nuevosErrores.email = 'Email es obligatorio';
    } else if (!emailRegex.test(formulario.email)) {
      nuevosErrores.email = 'Email no válido';
    }
    
    const telefonoRegex = /^[0-9]{9}$/;
    if (!formulario.telefono) {
      nuevosErrores.telefono = 'Teléfono es obligatorio';
    } else if (!telefonoRegex.test(formulario.telefono)) {
      nuevosErrores.telefono = 'Teléfono debe tener 9 dígitos';
    }
    
    if (formulario.rol !== 'admin') {
      const dniRegex = /^[0-9]{8}[A-Z]$/;
      if (!formulario.dni) {
        nuevosErrores.dni = 'DNI es obligatorio';
      } else if (!dniRegex.test(formulario.dni.toUpperCase())) {
        nuevosErrores.dni = 'DNI no válido (formato: 12345678A)';
      }
      
      const horas = parseInt(formulario.horas_semanales);
      if (!formulario.horas_semanales) {
        nuevosErrores.horas_semanales = 'Horas semanales es obligatorio';
      } else if (isNaN(horas) || horas < 1 || horas > 60) {
        nuevosErrores.horas_semanales = 'Horas debe ser entre 1 y 60';
      }
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // ✅ FUNCIÓN PRINCIPAL PARA MANEJAR ENVÍO
  const manejarEnvio = async () => {
    if (!validarFormulario()) {
      Alert.alert('Errores en el formulario', 'Por favor corrige los errores marcados');
      return;
    }
    
    setEnviando(true);
    
    try {
      const datosParaEnviar = {
        email: formulario.email.toLowerCase().trim(),
        telefono: formulario.telefono.trim(),
        rol: formulario.rol,
        ...(formulario.rol !== 'admin' && {
          dni: formulario.dni.toUpperCase().trim(),
          horas_semanales: parseInt(formulario.horas_semanales)
        })
      };
      
      const resultado = await altaUsuario(datosParaEnviar);
      
      if (resultado.exito) {
        setCredencialesCreadas(resultado.credenciales);
        setMostrarCredenciales(true);
      } else {
        Alert.alert('❌ Error', resultado.error);
      }
      
    } catch (error) {
      Alert.alert('❌ Error', 'Ocurrió un error inesperado');
      console.error('Error en formulario:', error);
    } finally {
      setEnviando(false);
    }
  };

  // ✅ FUNCIÓN PARA VOLVER AL FORMULARIO
  const volverAlFormulario = () => {
    setMostrarCredenciales(false);
    setCredencialesCreadas(null);
    
    setFormulario({
      email: '',
      telefono: '',
      rol: 'empleado',
      dni: '',
      horas_semanales: ''
    });
  };

  // ✅ FUNCIÓN PARA COPIAR CREDENCIALES COMPLETAS
  const copiarCredencialesCompletas = () => {
    const fechaCreacion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const horaCreacion = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const mensajeCompleto = `🏢 SISTEMA DE GESTIÓN DE TURNOS
════════════════════════════════════════════════════════

¡Hola! Te he creado tu cuenta de acceso al sistema de turnos.

🔐 TUS CREDENCIALES DE ACCESO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: ${credencialesCreadas.email}
🔑 Contraseña: ${credencialesCreadas.password}
🏷️ Código empleado: ${credencialesCreadas.codigo}
👤 Rol: ${credencialesCreadas.rol}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 INSTRUCCIONES PARA ACCEDER (paso a paso):

1️⃣ DESCARGA/ABRE LA APLICACIÓN
   • Busca la app "Sistema de Turnos" en tu dispositivo
   • Si no la tienes, pide el enlace de descarga

2️⃣ INICIA SESIÓN
   • Abre la aplicación
   • Toca el botón "Iniciar Sesión"
   • NO toques "Registrarse"

3️⃣ INTRODUCE TUS CREDENCIALES
   • Email: ${credencialesCreadas.email}
   • Contraseña: ${credencialesCreadas.password}
   • Toca "Entrar"

4️⃣ ¡YA ESTÁS DENTRO!
   • Podrás ver tus turnos asignados
   • Consultar horarios
   • Gestionar tu perfil

⚠️ MUY IMPORTANTE - SEGURIDAD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 CAMBIA TU CONTRASEÑA en el primer acceso por seguridad
🔒 Ve a tu perfil → Configuración → Cambiar contraseña
🔒 Elige una contraseña personal que solo tú conozcas
🔒 No compartas tus credenciales con nadie

💡 CONSEJOS ÚTILES:
• Guarda este mensaje hasta que cambies la contraseña
• Tu código de empleado (${credencialesCreadas.codigo}) te identifica en el sistema
• Si tienes problemas, contacta con administración
• La app funciona mejor con internet activo

📅 Cuenta creada: ${fechaCreacion} a las ${horaCreacion}
👨‍💼 Creado por: Administración

════════════════════════════════════════════════════════
¡Bienvenido al equipo! 🎉`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mensajeCompleto)
        .then(() => {
          Alert.alert(
            '✅ ¡Credenciales Copiadas!',
            `Mensaje completo copiado al portapapeles con:\n\n📧 Email: ${credencialesCreadas.email}\n🔑 Contraseña: ${credencialesCreadas.password}\n🏷️ Código: ${credencialesCreadas.codigo}\n\n📱 Incluye instrucciones paso a paso y recordatorio de cambiar contraseña.\n\n¿Dónde quieres pegarlo?`,
            [
              {
                text: '📱 WhatsApp Web',
                onPress: () => {
                  if (typeof window !== 'undefined') {
                    window.open('https://web.whatsapp.com/', '_blank');
                  }
                  
                  setTimeout(() => {
                    Alert.alert(
                      '📱 WhatsApp Abierto', 
                      'Ya puedes pegar el mensaje (Ctrl+V) en el chat del empleado.',
                      [{ text: 'Entendido' }]
                    );
                  }, 1000);
                }
              },
              {
                text: '📧 Gmail Web',
                onPress: () => {
                  if (typeof window !== 'undefined') {
                    window.open('https://gmail.com', '_blank');
                  }
                  
                  setTimeout(() => {
                    Alert.alert(
                      '📧 Gmail Abierto',
                      'Crea un nuevo email y pega el contenido (Ctrl+V).',
                      [{ text: 'Entendido' }]
                    );
                  }, 1000);
                }
              },
              {
                text: '💬 Telegram Web',
                onPress: () => {
                  if (typeof window !== 'undefined') {
                    window.open('https://web.telegram.org/', '_blank');
                  }
                }
              },
              {
                text: '✅ Ya Pegado',
                style: 'cancel'
              }
            ]
          );
        })
        .catch(() => {
          Alert.alert(
            '📋 Credenciales Preparadas',
            mensajeCompleto,
            [{ text: 'Cerrar' }]
          );
        });
    } else {
      Alert.alert(
        '📋 Credenciales e Instrucciones',
        mensajeCompleto,
        [{ text: 'Cerrar' }]
      );
    }
  };

  // ✅ PANTALLA DE CREDENCIALES
  if (mostrarCredenciales && credencialesCreadas) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerExito}>
          <Text style={styles.tituloExito}>✅ Usuario Creado</Text>
          <Text style={styles.subtituloExito}>Credenciales generadas exitosamente</Text>
        </View>

        <View style={styles.tarjetaCredenciales}>
          <Text style={styles.tituloCredenciales}>🔐 CREDENCIALES DE ACCESO</Text>
          
          <View style={styles.credencialItem}>
            <Text style={styles.credencialLabel}>📧 Email:</Text>
            <Text style={styles.credencialValor}>{credencialesCreadas.email}</Text>
          </View>

          <View style={styles.credencialItem}>
            <Text style={styles.credencialLabel}>🔑 Contraseña:</Text>
            <View style={styles.passwordContainer}>
              <Text style={styles.credencialValorPassword}>{credencialesCreadas.password}</Text>
            </View>
          </View>

          <View style={styles.credencialItem}>
            <Text style={styles.credencialLabel}>🏷️ Código Empleado:</Text>
            <View style={styles.codigoContainer}>
              <Text style={styles.credencialValorCodigo}>{credencialesCreadas.codigo}</Text>
            </View>
          </View>

          <View style={styles.credencialItem}>
            <Text style={styles.credencialLabel}>👤 Rol:</Text>
            <Text style={styles.credencialValor}>{credencialesCreadas.rol}</Text>
          </View>
        </View>

        <View style={styles.instrucciones}>
          <Text style={styles.instruccionesTitulo}>📱 Instrucciones para el usuario:</Text>
          <Text style={styles.instruccionesTexto}>1. Abre la aplicación de turnos</Text>
          <Text style={styles.instruccionesTexto}>2. Selecciona "Iniciar Sesión"</Text>
          <Text style={styles.instruccionesTexto}>3. Introduce email y contraseña</Text>
          <Text style={styles.instruccionesTexto}>4. ¡Listo para usar!</Text>
        </View>

        <View style={styles.botonesCredenciales}>
          <TouchableOpacity
            style={[styles.boton, styles.botonCopiarCompleto]}
            onPress={copiarCredencialesCompletas}
          >
            <Text style={styles.textoBotonCopiarCompleto}>📋 Copiar Credenciales + Instrucciones</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.boton, styles.botonTerminar]}
          onPress={volverAlFormulario}
        >
          <Text style={styles.textoBotonTerminar}>✅ Terminar</Text>
        </TouchableOpacity>

        <View style={styles.nota}>
          <Text style={styles.notaTexto}>⚠️ El usuario debe cambiar la contraseña en su primer acceso por seguridad</Text>
        </View>
      </ScrollView>
    );
  }

  // ✅ FORMULARIO NORMAL
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>➕ Alta de Usuario</Text>
        <Text style={styles.subtitulo}>Complete los datos para crear un nuevo usuario</Text>
      </View>

      {/* Email */}
      <View style={styles.campo}>
        <Text style={styles.etiqueta}>Email *</Text>
        <TextInput
          style={[styles.input, errores.email && styles.inputError]}
          value={formulario.email}
          onChangeText={(valor) => actualizarCampo('email', valor)}
          placeholder="Introduce el email del usuario"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errores.email && <Text style={styles.textoError}>{errores.email}</Text>}
        <Text style={styles.ejemplo}>Ejemplo: juan.perez@empresa.com</Text>
      </View>

      {/* Teléfono */}
      <View style={styles.campo}>
        <Text style={styles.etiqueta}>Teléfono *</Text>
        <TextInput
          style={[styles.input, errores.telefono && styles.inputError]}
          value={formulario.telefono}
          onChangeText={(valor) => actualizarCampo('telefono', valor)}
          placeholder="Número de teléfono (9 dígitos)"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          maxLength={9}
        />
        {errores.telefono && <Text style={styles.textoError}>{errores.telefono}</Text>}
        <Text style={styles.ejemplo}>Ejemplo: 600123456</Text>
      </View>

      {/* Rol */}
      <View style={styles.campo}>
        <Text style={styles.etiqueta}>Rol *</Text>
        <View style={[styles.pickerContainer, errores.rol && styles.inputError]}>
          <Picker
            selectedValue={formulario.rol}
            onValueChange={(valor) => actualizarCampo('rol', valor)}
            style={styles.picker}
          >
            <Picker.Item label="👤 Empleado" value="empleado" />
            <Picker.Item label="👔 Encargado" value="encargado" />
            <Picker.Item label="👑 Administrador" value="admin" />
          </Picker>
        </View>
        <Text style={styles.ayuda}>
          {formulario.rol === 'empleado' && '• Acceso básico a turnos asignados'}
          {formulario.rol === 'encargado' && '• Puede gestionar empleados y turnos'}
          {formulario.rol === 'admin' && '• Acceso completo al sistema'}
        </Text>
      </View>

      {/* Campos específicos para empleados */}
      {formulario.rol !== 'admin' && (
        <>
          {/* DNI */}
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>DNI *</Text>
            <TextInput
              style={[styles.input, errores.dni && styles.inputError]}
              value={formulario.dni}
              onChangeText={(valor) => actualizarCampo('dni', valor)}
              placeholder="Documento de identidad"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={9}
            />
            {errores.dni && <Text style={styles.textoError}>{errores.dni}</Text>}
            <Text style={styles.ejemplo}>Formato: 12345678A</Text>
          </View>

          {/* Horas Semanales */}
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Horas Semanales *</Text>
            <TextInput
              style={[styles.input, errores.horas_semanales && styles.inputError]}
              value={formulario.horas_semanales}
              onChangeText={(valor) => actualizarCampo('horas_semanales', valor)}
              placeholder="Horas de trabajo por semana"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={2}
            />
            {errores.horas_semanales && <Text style={styles.textoError}>{errores.horas_semanales}</Text>}
            <Text style={styles.ayuda}>
              {formulario.rol === 'encargado' ? '• Recomendado: 40 horas (jornada completa)' : '• Recomendado: 25 horas (jornada parcial)'}
            </Text>
          </View>
        </>
      )}

      {/* Botones */}
      <View style={styles.botones}>
        <TouchableOpacity
          style={[styles.boton, styles.botonCancelar]}
          onPress={onCancelar}
          disabled={enviando}
        >
          <Text style={styles.textoBotonCancelar}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonCrear, enviando && styles.botonDeshabilitado]}
          onPress={manejarEnvio}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.textoBotonCrear}>Crear Usuario</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTexto}>
          📧 Se generará una contraseña automática y se mostrará en pantalla.
        </Text>
        {formulario.rol !== 'admin' && (
          <Text style={styles.infoTexto}>
            🔢 Se generará automáticamente un código de empleado único.
          </Text>
        )}
        <Text style={styles.infoTexto}>
          🚫 No se enviará email automático de confirmación.
        </Text>
      </View>
    </ScrollView>
  );
}

// ✅ ESTILOS COMPLETOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  
  // ESTILOS PARA PANTALLA DE CREDENCIALES
  headerExito: {
    backgroundColor: '#059669',
    padding: 20,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tituloExito: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtituloExito: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  tarjetaCredenciales: {
    margin: 15,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  tituloCredenciales: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 20,
  },
  credencialItem: {
    marginBottom: 15,
  },
  credencialLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  credencialValor: {
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  passwordContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  credencialValorPassword: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    padding: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  codigoContainer: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  credencialValorCodigo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    padding: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  instrucciones: {
    margin: 15,
    padding: 15,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  instruccionesTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  instruccionesTexto: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 4,
  },
  botonesCredenciales: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  botonCopiarCompleto: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textoBotonCopiarCompleto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  botonTerminar: {
    backgroundColor: '#059669',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textoBotonTerminar: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nota: {
    margin: 15,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  notaTexto: {
    color: '#DC2626',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ESTILOS DEL FORMULARIO
  campo: {
    marginHorizontal: 15,
    marginVertical: 10,
  },
  etiqueta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 50,
    color: '#111827',
  },
  textoError: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  ejemplo: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  ayuda: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginVertical: 20,
    gap: 12,
  },
  boton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  botonCancelar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  botonCrear: {
    backgroundColor: '#4CAF50',
  },
  botonDeshabilitado: {
    backgroundColor: '#9CA3AF',
  },
  textoBotonCancelar: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  textoBotonCrear: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    marginHorizontal: 15,
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTexto: {
    color: '#1E40AF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
});