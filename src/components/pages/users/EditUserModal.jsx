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

export default function EditUserModal({ open, onClose, user, onUserEdited }) {
  const [roles, setRoles] = useState([]);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    defaultValues: {
      use_correo: '',
      use_primer_nombre: '',
      use_primer_apellido: '',
      rele: '',
    }
  });

  useEffect(() => {
    if (user) {
        console.log('Resetting form with user data:', user);
      reset({
        use_correo: user.use_correo || '',
        use_primer_nombre: user.use_primer_nombre || '',
        use_primer_apellido: user.use_primer_apellido || '',
        role: user.role.rol_id || '',
      });
    }
  }, [user, reset, open]);

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
        const userData = {
          use_correo: data.use_correo,
          use_primer_nombre: data.use_primer_nombre,
          use_primer_apellido: data.use_primer_apellido,
          role: data.role,
        };
      const response = await onUserEdited(userData);
      toast.success(response?.data?.message || 'Usuario actualizado correctamente');
    } catch (error) {
        console.error('Error updating user:', error);
      const msg = error?.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error al actualizar usuario');
      toast.error(errorMsg);
    }
  };

  return (
    <MuiModal open={open} onClose={onClose} maxWidth="max-w-lg">
      <CardWithTitle title="Editar usuario">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
          <MuiInput
            label="Correo electrónico"
            {...register('use_correo', { required: 'El correo es obligatorio' })}
            error={errors.use_correo?.message}
            className="w-full"
            disabled
          />
          <MuiInput
            label="Primer nombre"
            {...register('use_primer_nombre', { required: 'El primer nombre es obligatorio' })}
            error={errors.use_primer_nombre?.message}
            className="w-full"
          />
          <MuiInput
            label="Primer apellido"
            {...register('use_primer_apellido', { required: 'El primer apellido es obligatorio' })}
            error={errors.use_primer_apellido?.message}
            className="w-full"
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
          <div className="flex justify-end gap-2 mt-6">
            <CancelButton onClick={onClose} />
            <CreateButton title={isSubmitting ? 'Guardando...' : 'Guardar'} type="submit" disabled={isSubmitting} />
          </div>
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
