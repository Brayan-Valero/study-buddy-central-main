
import React, { useEffect, useState } from 'react';
import AsignaturaCard from '../components/AsignaturaCard';
import FormularioAsignatura from '../components/FormularioAsignatura';
import FormularioAlumno from '../components/FormularioAlumno';
import { Button } from '../components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { obtenerAsignaturas } from '../lib/supabase';

const Index = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [mostrarFormAsignatura, setMostrarFormAsignatura] = useState(false);
  const [mostrarFormAlumno, setMostrarFormAlumno] = useState(false);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { toast } = useToast();

  const cargarAsignaturas = async () => {
    setCargando(true);
    try {
      const data = await obtenerAsignaturas();
      setAsignaturas(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las asignaturas",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAsignaturas();
  }, []);

  const abrirFormAsignatura = (asignatura = null) => {
    setAsignaturaSeleccionada(asignatura);
    setMostrarFormAsignatura(true);
    setMostrarFormAlumno(false);
  };

  const abrirFormAlumno = (asignatura) => {
    setAsignaturaSeleccionada(asignatura);
    setMostrarFormAlumno(true);
    setMostrarFormAsignatura(false);
  };

  const cerrarFormularios = () => {
    setMostrarFormAsignatura(false);
    setMostrarFormAlumno(false);
    setAsignaturaSeleccionada(null);
  };

  const onAsignaturaActualizada = () => {
    cerrarFormularios();
    cargarAsignaturas();
    toast({
      description: "Acción completada con éxito",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión Académica</h1>
          <p className="text-gray-600">Administra asignaturas y alumnos</p>
        </div>
        <Button onClick={() => abrirFormAsignatura()} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Asignatura
        </Button>
      </header>

      {/* Formularios Modales */}
      {mostrarFormAsignatura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <FormularioAsignatura 
              asignatura={asignaturaSeleccionada}
              onCancel={cerrarFormularios}
              onSuccess={onAsignaturaActualizada}
            />
          </div>
        </div>
      )}

      {mostrarFormAlumno && asignaturaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <FormularioAlumno 
              codigoAsignatura={asignaturaSeleccionada.codigo}
              nombreAsignatura={asignaturaSeleccionada.descripcion}
              onCancel={cerrarFormularios}
              onSuccess={onAsignaturaActualizada}
            />
          </div>
        </div>
      )}

      {/* Listado de Asignaturas */}
      {cargando ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : asignaturas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asignaturas.map((asignatura) => (
            <AsignaturaCard
              key={asignatura.codigo}
              asignatura={asignatura}
              onEdit={() => abrirFormAsignatura(asignatura)}
              onDelete={cargarAsignaturas}
              onAddStudent={() => abrirFormAlumno(asignatura)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <h3 className="text-xl font-medium text-gray-700">No hay asignaturas</h3>
          <p className="text-gray-500 mb-4">Comienza agregando tu primera asignatura</p>
          <Button onClick={() => abrirFormAsignatura()} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Asignatura
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
