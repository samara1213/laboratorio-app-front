import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CardWithTitle from '../../CardWithTitle';
import CreateButton from '../../mui/CreateButton';
import CancelButton from '../../mui/CancelButton';
import MuiInput from '../../mui/MuiInput';
import MuiModal from '../../mui/MuiModal';
import MuiSelect from '../../mui/MuiSelect';

export default function EditLaboratoryModal({ lab: initialLab, open, onSave, onClose, loading: loadingProp = false }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialLab || {}
  });

  useEffect(() => {
    reset(initialLab || {});
  }, [initialLab, open, reset]);

  if (!open) return null;

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');

    // agregamos solo la data a pasar al backend
    const dataUpdated = {
      lab_nit : data.lab_nit,
      lab_dv :  data.lab_dv || null,
      lab_name : data.lab_name, 
      lab_address : data.lab_address,
      lab_phone : data.lab_phone,
      lab_status : data.lab_status,
      lab_email : data.lab_email,
      lab_logo : data.lab_logo,
      lab_legal_representative : data.lab_legal_representative,

    }
    try {
      if (onSave) {
        const response = await onSave(data.lab_id, { ...dataUpdated });    
        // Si el backend retorna un mensaje, úsalo
        const successMsg = response?.data?.message || 'Laboratorio actualizado correctamente';
        toast.success(successMsg);
      }
      onClose();
    } catch (e) {
      // Intenta mostrar el mensaje de error del backend si existe
      const errorMsg = e?.response?.data?.message || 'No se pudo actualizar el laboratorio';
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setSaving(false);
  };

  return (
    <MuiModal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <CardWithTitle title="Editar Laboratorio" loading={loadingProp}>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MuiInput
            label="Nombre laboratorio"
            name="lab_name"
            {...register('lab_name', { required: 'El nombre es obligatorio' })}
            error={errors.lab_name?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Dirección"
            name="lab_address"
            {...register('lab_address', { required: 'La dirección es obligatoria' })}
            error={errors.lab_address?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Correo electrónico"
            name="lab_email"
            type="email"
            {...register('lab_email', { required: 'El correo es obligatorio', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Correo no válido' } })}
            error={errors.lab_email?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Representante legal"
            name="lab_legal_representative"
            {...register('lab_legal_representative', { required: 'El representante legal es obligatorio' })}
            error={errors.lab_legal_representative?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Identificacion (NIT)"
            name="lab_nit"
            {...register('lab_nit', { required: 'La identificación es obligatoria' })}
            error={errors.lab_nit?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="DV (dígito de verificación)"
            name="lab_dv"
            placeholder="Opcional"
            {...register('lab_dv')}
            error={errors.lab_dv?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Teléfono"
            name="lab_phone"
            {...register('lab_phone', { required: 'El teléfono es obligatorio', pattern: { value: /^[0-9+\-()\s]*$/, message: 'Solo números y símbolos válidos' } })}
            error={errors.lab_phone?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiSelect
            label="Estado"
            name="lab_status"
            error={errors.lab_status?.message}
            {...register('lab_status', { required: 'El estado es obligatorio' })}
            defaultValue={initialLab?.lab_status || ''}
          >
            <option value="">Seleccione...</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </MuiSelect>
          <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 pt-2">
            <CreateButton type="submit" title={saving ? 'Guardando...' : 'Guardar Cambios'} />
            <CancelButton onClick={onClose} />
          </div>
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
