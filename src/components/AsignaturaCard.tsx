
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Edit, Trash2, UserPlus, Users } from 'lucide-react';
import { contarAlumnosPorAsignatura, eliminarAsignatura, obtenerAlumnosPorAsignatura } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';

interface Alumno {
  codigo: string;
  nombre: string;
  email: string;
}

interface Asignatura {
  codigo: string;
  descripcion: string;
  creditos: number;
}

interface AsignaturaCardProps {
  asignatura: Asignatura;
  onEdit: () => void;
  onDelete: () => void;
  onAddStudent: () => void;
}

const AsignaturaCard = ({ asignatura, onEdit, onDelete, onAddStudent }: AsignaturaCardProps) => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [mostrarAlumnos, setMostrarAlumnos] = useState(false);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [cantidadAlumnos, setCantidadAlumnos] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const cargarCantidadAlumnos = async () => {
      try {
        const cantidad = await contarAlumnosPorAsignatura(asignatura.codigo);
        setCantidadAlumnos(cantidad);
      } catch (error) {
        console.error('Error al cargar cantidad de alumnos:', error);
      }
    };
    
    cargarCantidadAlumnos();
  }, [asignatura]);

  const handleEliminar = async () => {
    if (confirm('¿Estás seguro de eliminar esta asignatura?')) {
      try {
        await eliminarAsignatura(asignatura.codigo);
        toast({
          description: "Asignatura eliminada correctamente",
        });
        onDelete();
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la asignatura",
          variant: "destructive",
        });
        console.error(error);
      }
    }
  };

  const toggleMostrarAlumnos = async () => {
    if (!mostrarAlumnos && alumnos.length === 0) {
      setCargandoAlumnos(true);
      try {
        const alumnosData = await obtenerAlumnosPorAsignatura(asignatura.codigo);
        setAlumnos(alumnosData);
      } catch (error) {
        console.error('Error al cargar alumnos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los alumnos",
          variant: "destructive",
        });
      } finally {
        setCargandoAlumnos(false);
      }
    }
    setMostrarAlumnos(!mostrarAlumnos);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold truncate">{asignatura.descripcion}</CardTitle>
            <CardDescription className="text-blue-100">Código: {asignatura.codigo}</CardDescription>
          </div>
          <Badge variant="outline" className="bg-white/20 text-white border-white/40">
            {asignatura.creditos} créditos
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">
              {cantidadAlumnos} {cantidadAlumnos === 1 ? 'alumno' : 'alumnos'}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleMostrarAlumnos}
            disabled={cantidadAlumnos === 0}
          >
            {mostrarAlumnos ? 'Ocultar' : 'Ver alumnos'}
          </Button>
        </div>
        
        {cargandoAlumnos ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : mostrarAlumnos && (
          <div className="mt-2 space-y-2">
            {alumnos.length > 0 ? (
              <ul className="space-y-2">
                {alumnos.map(alumno => (
                  <li key={alumno.codigo} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{alumno.nombre}</p>
                      <p className="text-sm text-gray-500">{alumno.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-2">No hay alumnos matriculados</p>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 border-t flex justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEliminar} className="text-red-600 hover:text-red-800 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={onAddStudent} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={cantidadAlumnos >= 3}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          {cantidadAlumnos >= 3 ? 'Asignatura llena' : 'Añadir alumno'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AsignaturaCard;
