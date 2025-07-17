import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import MuiModal from '../../mui/MuiModal';
import CardWithTitle from '../../CardWithTitle';
import MuiInput from '../../mui/MuiInput';
import MuiSelect from '../../mui/MuiSelect';
import CancelButton from '../../mui/CancelButton';
import CreateButton from '../../mui/CreateButton';
import { getAllRolesDB } from '../../../services';
import { toast } from 'react-toastify';

export default function CreateUserModal({ open, onClose, onUserCreated, laboratoryId }) {
  const [roles, setRoles] = useState([]);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    defaultValues: {
      use_correo: '',
      use_primer_nombre: '',
      use_primer_apellido: '',
      role: '',
      laboratory: laboratoryId || '',
    }
  });

  useEffect(() => {
    reset({
      use_correo: '',
      use_primer_nombre: '',
      use_primer_apellido: '',
      role: '',
      laboratory: laboratoryId || '',
    });
  }, [laboratoryId, open, reset]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRolesDB();
        setRoles(res.data.data || []);
      } catch {
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = async (data) => {    
    try {
        const response = await onUserCreated(data);
        toast.success(response?.data?.message || 'Usuario creado correctamente');
    } catch (error) {             
        const msg = error?.response?.data?.message;
        const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error buscando exámenes');
        toast.error(errorMsg);        
    }   
    };

  return (
    <MuiModal open={open} onClose={onClose} maxWidth="max-w-lg">
      <CardWithTitle title="Crear nuevo usuario">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
          <MuiInput
            label="Correo electrónico"
            {...register('use_correo', { required: 'El correo es obligatorio' })}
            error={errors.use_correo?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Primer nombre"
            {...register('use_primer_nombre', { required: 'El primer nombre es obligatorio' })}
            error={errors.use_primer_nombre?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Primer apellido"
            {...register('use_primer_apellido', { required: 'El primer apellido es obligatorio' })}
            error={errors.use_primer_apellido?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiSelect
            label="Rol"
            {...register('role', { required: 'El rol es obligatorio' })}
            error={errors.role?.message}
          >
            <option value="">Seleccione un rol</option>
            {roles.map(rol => (
              <option key={rol.rol_id} value={rol.rol_id}>{rol.rol_nombre}</option>
            ))}
          </MuiSelect>
          {/* El laboratorio se asigna automáticamente, no se muestra el select */}
          <div className="flex justify-end gap-2 mt-6">
            <CancelButton onClick={onClose} />
            <CreateButton title={isSubmitting ? 'Creando...' : 'Crear'} type="submit" disabled={isSubmitting} />
          </div>
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
