
import React, { useEffect, useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { agregarAlumno, matricularAlumno, obtenerAlumnos } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { X } from 'lucide-react';

interface Alumno {
  codigo: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
}

interface FormularioAlumnoProps {
  codigoAsignatura: string;
  nombreAsignatura: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const FormularioAlumno = ({ codigoAsignatura, nombreAsignatura, onCancel, onSuccess }: FormularioAlumnoProps) => {
  const [modo, setModo] = useState<'existente' | 'nuevo'>('existente');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [nuevoAlumno, setNuevoAlumno] = useState<Omit<Alumno, 'codigo'> & {codigo: string}>({
    codigo: '',
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: ''
  });
  const [cargando, setCargando] = useState(false);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [errores, setErrores] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    const obtenerTodosLosAlumnos = async () => {
      setCargandoAlumnos(true);
      try {
        const data = await obtenerAlumnos();
        setAlumnos(data);
      } catch (error) {
        console.error('Error al obtener alumnos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los alumnos",
          variant: "destructive",
        });
      } finally {
        setCargandoAlumnos(false);
      }
    };
    
    obtenerTodosLosAlumnos();
  }, []);

  const handleInputChange = (campo: keyof typeof nuevoAlumno, valor: string) => {
    setNuevoAlumno(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const validarFormularioNuevo = () => {
    const nuevosErrores: {[key: string]: string} = {};
    
    if (!nuevoAlumno.codigo.trim()) {
      nuevosErrores.codigo = 'El código es obligatorio';
    }
    
    if (!nuevoAlumno.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }
    
    if (!nuevoAlumno.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoAlumno.email)) {
      nuevosErrores.email = 'El email no es válido';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const validarFormularioExistente = () => {
    const nuevosErrores: {[key: string]: string} = {};
    
    if (!alumnoSeleccionado) {
      nuevosErrores.alumnoSeleccionado = 'Debe seleccionar un alumno';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modo === 'nuevo' && !validarFormularioNuevo()) {
      return;
    }
    
    if (modo === 'existente' && !validarFormularioExistente()) {
      return;
    }
    
    setCargando(true);
    
    try {
      if (modo === 'nuevo') {
        // Crear nuevo alumno
        const alumnoCreado = await agregarAlumno(nuevoAlumno);
        
        // Matricular al alumno recién creado
        await matricularAlumno(alumnoCreado.codigo, codigoAsignatura);
        
        toast({
          description: "Alumno creado y matriculado correctamente",
        });
      } else {
        // Matricular alumno existente
        await matricularAlumno(alumnoSeleccionado, codigoAsignatura);
        
        toast({
          description: "Alumno matriculado correctamente",
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Añadir Alumno</h2>
          <p className="text-gray-600 text-sm">Asignatura: {nombreAsignatura}</p>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="h-8 w-8 p-0 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex space-x-2 mb-6">
        <Button 
          type="button" 
          variant={modo === 'existente' ? 'default' : 'outline'} 
          onClick={() => setModo('existente')}
          className={modo === 'existente' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Alumno Existente
        </Button>
        <Button 
          type="button" 
          variant={modo === 'nuevo' ? 'default' : 'outline'} 
          onClick={() => setModo('nuevo')}
          className={modo === 'nuevo' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Nuevo Alumno
        </Button>
      </div>
      
      {modo === 'existente' ? (
        <div className="mb-6">
          <Label htmlFor="alumno">Seleccionar Alumno</Label>
          <Select 
            value={alumnoSeleccionado} 
            onValueChange={setAlumnoSeleccionado}
          >
            <SelectTrigger className={errores.alumnoSeleccionado ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona un alumno" />
            </SelectTrigger>
            <SelectContent>
              {cargandoAlumnos ? (
                <div className="p-2 text-center">
                  <div className="animate-spin mx-auto h-5 w-5 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                </div>
              ) : alumnos.length > 0 ? (
                alumnos.map(alumno => (
                  <SelectItem key={alumno.codigo} value={alumno.codigo}>
                    {alumno.nombre} ({alumno.codigo})
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">No hay alumnos disponibles</div>
              )}
            </SelectContent>
          </Select>
          {errores.alumnoSeleccionado && <p className="text-red-500 text-sm mt-1">{errores.alumnoSeleccionado}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              value={nuevoAlumno.codigo}
              onChange={(e) => handleInputChange('codigo', e.target.value)}
              className={errores.codigo ? 'border-red-500' : ''}
            />
            {errores.codigo && <p className="text-red-500 text-sm mt-1">{errores.codigo}</p>}
          </div>
          
          <div>
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input
              id="nombre"
              value={nuevoAlumno.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className={errores.nombre ? 'border-red-500' : ''}
            />
            {errores.nombre && <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>}
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={nuevoAlumno.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errores.email ? 'border-red-500' : ''}
            />
            {errores.email && <p className="text-red-500 text-sm mt-1">{errores.email}</p>}
          </div>
          
          <div>
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input
              id="telefono"
              value={nuevoAlumno.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="direccion">Dirección (opcional)</Label>
            <Input
              id="direccion"
              value={nuevoAlumno.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento (opcional)</Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={nuevoAlumno.fecha_nacimiento}
              onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={cargando} className="bg-blue-600 hover:bg-blue-700">
          {cargando ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
              Matriculando...
            </>
          ) : (
            'Matricular'
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormularioAlumno;
