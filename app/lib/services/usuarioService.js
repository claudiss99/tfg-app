import { supabase } from '../../../supabaseClient';
import { generarCodigoUnico } from '../utils/generadorCodigos';

// Función para generar contraseña segura
const generarPasswordTemporal = () => {
  const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const minusculas = 'abcdefghijklmnopqrstuvwxyz';
  const numeros = '0123456789';
  const especiales = '!@#$%';
  
  let password = '';
  
  // Asegurar al menos uno de cada tipo
  password += mayusculas[Math.floor(Math.random() * mayusculas.length)];
  password += minusculas[Math.floor(Math.random() * minusculas.length)];
  password += numeros[Math.floor(Math.random() * numeros.length)];
  password += especiales[Math.floor(Math.random() * especiales.length)];
  
  // Completar hasta 8 caracteres
  const todos = mayusculas + minusculas + numeros;
  for (let i = 4; i < 8; i++) {
    password += todos[Math.floor(Math.random() * todos.length)];
  }
  
  // Mezclar los caracteres
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export const altaUsuario = async (datosUsuario) => {
  try {
    console.log('🚀 Iniciando proceso de alta de usuario...');
    
    // 1. Verificar que el email no existe
    const { data: usuarioExistente, error: errCheck } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', datosUsuario.email)
      .maybeSingle();

    if (errCheck) {
      console.error('Error chequeando usuario existente:', errCheck);
      throw errCheck;
    }

    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con este email');
    }

    // 2. Generar contraseña temporal
    const passwordTemporal = generarPasswordTemporal();
    console.log('🔑 Contraseña generada:', passwordTemporal);

    // 3. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: datosUsuario.email,
      password: passwordTemporal,
      options: {
        emailRedirectTo: null,
        data: {
          rol: datosUsuario.rol,
          telefono: datosUsuario.telefono,
          created_by: 'admin',
          manual_creation: true
        }
      }
    });

    if (authError) {
      throw new Error(`Error creando usuario en Auth: ${authError.message}`);
    }

    console.log('✅ Usuario creado en Supabase Auth:', authData.user.id);

    // 4. Crear registro en tabla usuarios
    const { data: usuarioCreado, error: errorUsuario } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email: datosUsuario.email,
        telefono: datosUsuario.telefono,
        rol: datosUsuario.rol
      })
      .select()
      .single();

    if (errorUsuario) {
      console.error('❌ Error creando usuario en BD:', errorUsuario);
      // Intentamos limpiar auth? (opcional) -- dejamos auth como está
      throw new Error(`Error al crear usuario en BD: ${errorUsuario.message}`);
    }

    console.log('✅ Usuario creado en tabla usuarios');

    // 5. Si no es admin, crear registro en empleados
    let empleadoCreado = null;
    if (datosUsuario.rol !== 'admin') {
      const codigoEmpleado = await generarCodigoUnico(datosUsuario.rol);
      
      const { data: empleado, error: errorEmpleado } = await supabase
        .from('empleados')
        .insert({
          user_id: authData.user.id,
          codigo_empleado: codigoEmpleado,
          dni: datosUsuario.dni,
          horas_semanales: datosUsuario.horas_semanales,
          is_active: true
        })
        .select()
        .single();

      if (errorEmpleado) {
        console.error('❌ Error creando empleado:', errorEmpleado);
        // Rollback básico: eliminar usuario en tabla "usuarios" que acabamos de crear (no elimina auth)
        await supabase.from('usuarios').delete().eq('id', authData.user.id);
        throw new Error(`Error al crear empleado: ${errorEmpleado.message}`);
      }

      empleadoCreado = empleado;
      console.log('✅ Empleado creado con código:', empleadoCreado.codigo_empleado);
    }

    // 6. Retornar resultado exitoso
    return {
      exito: true,
      usuario: usuarioCreado,
      empleado: empleadoCreado,
      credenciales: {
        email: datosUsuario.email,
        password: passwordTemporal,
        codigo: empleadoCreado?.codigo_empleado
      },
      mensaje: 'Usuario creado exitosamente con contraseña automática.'
    };

  } catch (error) {
    console.error('❌ Error en alta de usuario:', error);
    return {
      exito: false,
      error: error.message || String(error)
    };
  }
};

export default { altaUsuario };