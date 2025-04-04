
import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { agregarAsignatura, actualizarAsignatura } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { X } from 'lucide-react';

interface Asignatura {
  codigo: string;
  descripcion: string;
  creditos: number;
}

interface FormularioAsignaturaProps {
  asignatura?: Asignatura | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const FormularioAsignatura = ({ asignatura, onCancel, onSuccess }: FormularioAsignaturaProps) => {
  const esEdicion = !!asignatura;
  const [codigo, setCodigo] = useState(asignatura?.codigo || '');
  const [descripcion, setDescripcion] = useState(asignatura?.descripcion || '');
  const [creditos, setCreditos] = useState(asignatura?.creditos?.toString() || '');
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const validarFormulario = () => {
    const nuevosErrores: {[key: string]: string} = {};
    
    if (!codigo.trim()) {
      nuevosErrores.codigo = 'El código es obligatorio';
    }
    
    if (!descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }
    
    if (!creditos) {
      nuevosErrores.creditos = 'Los créditos son obligatorios';
    } else if (isNaN(Number(creditos)) || Number(creditos) <= 0) {
      nuevosErrores.creditos = 'Los créditos deben ser un número positivo';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    const asignaturaData = {
      codigo,
      descripcion,
      creditos: Number(creditos)
    };
    
    setCargando(true);
    
    try {
      if (esEdicion) {
        await actualizarAsignatura(asignatura.codigo, asignaturaData);
        toast({
          description: "Asignatura actualizada correctamente",
        });
      } else {
        await agregarAsignatura(asignaturaData);
        toast({
          description: "Asignatura agregada correctamente",
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
        <h2 className="text-xl font-bold text-gray-800">
          {esEdicion ? 'Editar Asignatura' : 'Nueva Asignatura'}
        </h2>
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
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            disabled={esEdicion}
            className={errores.codigo ? 'border-red-500' : ''}
          />
          {errores.codigo && <p className="text-red-500 text-sm mt-1">{errores.codigo}</p>}
        </div>
        
        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Input
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={errores.descripcion ? 'border-red-500' : ''}
          />
          {errores.descripcion && <p className="text-red-500 text-sm mt-1">{errores.descripcion}</p>}
        </div>
        
        <div>
          <Label htmlFor="creditos">Créditos</Label>
          <Input
            id="creditos"
            type="number"
            min="1"
            value={creditos}
            onChange={(e) => setCreditos(e.target.value)}
            className={errores.creditos ? 'border-red-500' : ''}
          />
          {errores.creditos && <p className="text-red-500 text-sm mt-1">{errores.creditos}</p>}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={cargando} className="bg-blue-600 hover:bg-blue-700">
          {cargando ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
              Guardando...
            </>
          ) : (
            esEdicion ? 'Actualizar' : 'Guardar'
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormularioAsignatura;
