
// Conexión a Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dvkvmjdefaytycdbsntd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2a3ZtamRlZmF5dHljZGJzbnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MjE1MjAsImV4cCI6MjA1OTI5NzUyMH0.wYHbfTAJyIp2CLfU4LcIJfJAMrVq41zUK6kw5GZ01ts';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Funciones para asignaturas
export async function obtenerAsignaturas() {
  const { data, error } = await supabase
    .from('asignatura')
    .select('*')
    .order('codigo');
  
  if (error) {
    console.error('Error al obtener asignaturas:', error);
    return [];
  }
  return data;
}

export async function agregarAsignatura(asignatura) {
  const { data, error } = await supabase
    .from('asignatura')
    .insert([asignatura])
    .select();
  
  if (error) {
    console.error('Error al agregar asignatura:', error);
    throw error;
  }
  return data[0];
}

export async function actualizarAsignatura(codigo, asignatura) {
  const { data, error } = await supabase
    .from('asignatura')
    .update(asignatura)
    .eq('codigo', codigo)
    .select();
  
  if (error) {
    console.error('Error al actualizar asignatura:', error);
    throw error;
  }
  return data[0];
}

export async function eliminarAsignatura(codigo) {
  const { error } = await supabase
    .from('asignatura')
    .delete()
    .eq('codigo', codigo);
  
  if (error) {
    console.error('Error al eliminar asignatura:', error);
    throw error;
  }
  return true;
}

// Funciones para alumnos
export async function obtenerAlumnos() {
  const { data, error } = await supabase
    .from('alumno')
    .select('*')
    .order('codigo');
  
  if (error) {
    console.error('Error al obtener alumnos:', error);
    return [];
  }
  return data;
}

export async function obtenerAlumnosPorAsignatura(codigoAsignatura) {
  const { data, error } = await supabase
    .from('matricula')
    .select(`
      codigo_alumno,
      alumno (*)
    `)
    .eq('codigo_asignatura', codigoAsignatura);
  
  if (error) {
    console.error('Error al obtener alumnos por asignatura:', error);
    return [];
  }
  
  // Extraer solo la información del alumno
  return data.map(item => item.alumno);
}

export async function contarAlumnosPorAsignatura(codigoAsignatura) {
  const { count, error } = await supabase
    .from('matricula')
    .select('*', { count: 'exact' })
    .eq('codigo_asignatura', codigoAsignatura);
  
  if (error) {
    console.error('Error al contar alumnos:', error);
    return 0;
  }
  return count;
}

export async function matricularAlumno(codigoAlumno, codigoAsignatura) {
  // Primero verificamos si ya existe la matrícula
  const { data: matriculaExistente, error: errorConsulta } = await supabase
    .from('matricula')
    .select('*')
    .eq('codigo_alumno', codigoAlumno)
    .eq('codigo_asignatura', codigoAsignatura);
  
  if (errorConsulta) {
    console.error('Error al verificar matrícula existente:', errorConsulta);
    throw errorConsulta;
  }
  
  // Si ya existe, no hacemos nada
  if (matriculaExistente && matriculaExistente.length > 0) {
    throw new Error('El alumno ya está matriculado en esta asignatura');
  }
  
  // Verificamos el número de alumnos en la asignatura
  const numAlumnos = await contarAlumnosPorAsignatura(codigoAsignatura);
  if (numAlumnos >= 3) {
    throw new Error('La asignatura ya tiene el máximo de 3 alumnos permitidos');
  }
  
  // Si pasa las validaciones, lo matriculamos
  const { data, error } = await supabase
    .from('matricula')
    .insert([{ codigo_alumno: codigoAlumno, codigo_asignatura: codigoAsignatura }])
    .select();
  
  if (error) {
    console.error('Error al matricular alumno:', error);
    throw error;
  }
  
  return data[0];
}

export async function desmatricularAlumno(codigoAlumno, codigoAsignatura) {
  const { error } = await supabase
    .from('matricula')
    .delete()
    .eq('codigo_alumno', codigoAlumno)
    .eq('codigo_asignatura', codigoAsignatura);
  
  if (error) {
    console.error('Error al desmatricular alumno:', error);
    throw error;
  }
  
  return true;
}

export async function agregarAlumno(alumno) {
  const { data, error } = await supabase
    .from('alumno')
    .insert([alumno])
    .select();
  
  if (error) {
    console.error('Error al agregar alumno:', error);
    throw error;
  }
  
  return data[0];
}
