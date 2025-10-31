import { supabase } from '../../../supabaseClient';

export const generarCodigoEmpleado = (rol) => {
  if (rol === 'encargado') {
    const numero = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ENC${numero}`;
  } else if (rol === 'empleado') {
    const numero = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `EMP${numero}`;
  }
  return null;
};

export const verificarCodigoUnico = async (codigo) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('codigo_empleado')
      .eq('codigo_empleado', codigo)
      .maybeSingle();
    
    if (error) {
      console.error('Error verificando código:', error);
      return false;
    }
    
    return !data;
  } catch (error) {
    console.error('Error en verificarCodigoUnico:', error);
    return false;
  }
};

export const generarCodigoUnico = async (rol) => {
  let codigoUnico = false;
  let codigo = '';
  let intentos = 0;
  
  while (!codigoUnico && intentos < 10) {
    codigo = generarCodigoEmpleado(rol);
    codigoUnico = await verificarCodigoUnico(codigo);
    intentos++;
    
    if (!codigoUnico) {
      console.log(`🔄 Intento ${intentos}: código ${codigo} ya existe, generando otro...`);
    }
  }
  
  if (!codigoUnico) {
    throw new Error('No se pudo generar un código único después de 10 intentos');
  }
  
  console.log(`✅ Código único generado: ${codigo} (${intentos} intentos)`);
  return codigo;
};

export default { generarCodigoUnico, generarCodigoEmpleado, verificarCodigoUnico };