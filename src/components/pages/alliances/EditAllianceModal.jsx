import MuiModal from '../../mui/MuiModal';
import MuiInput from '../../mui/MuiInput';
import CreateButton from '../../mui/CreateButton';
import CancelButton from '../../mui/CancelButton';
import CardWithTitle from '../../CardWithTitle';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function EditAllianceModal({ open, onSave, onClose, initialAlliance, loading: loadingProp = false }) {
  const safeAlliance = initialAlliance || {};
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      ali_nombre: safeAlliance.ali_nombre || '',
      ali_direccion: safeAlliance.ali_direccion || '',
      ali_telefono: safeAlliance.ali_telefono || '',
      ali_nombre_contacto: safeAlliance.ali_nombre_contacto || '',
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        ali_nombre: safeAlliance.ali_nombre || '',
        ali_direccion: safeAlliance.ali_direccion || '',
        ali_telefono: safeAlliance.ali_telefono || '',
        ali_nombre_contacto: safeAlliance.ali_nombre_contacto || '',
      });
      setError('');
    }
  }, [open, initialAlliance]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    try {
      const response = await onSave(data);
      const successMsg = response?.data?.message || 'Aliado actualizado correctamente';
      toast.success(successMsg);
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'No se pudo actualizar el aliado');
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setSaving(false);
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <MuiModal open={open} onClose={handleClose} maxWidth="max-w-lg">
      <CardWithTitle title="Editar aliado" loading={loadingProp}>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 p-2 sm:grid-cols-2 sm:gap-6">
          <div className="sm:col-span-2">
            <MuiInput
              label="Nombre del aliado"
              name="ali_nombre"
              {...register('ali_nombre', { required: 'El nombre es obligatorio' })}
              error={errors.ali_nombre?.message}
              className="w-full"
            />
          </div>
          <MuiInput
            label="Dirección"
            name="ali_direccion"
            {...register('ali_direccion', { required: 'La dirección es obligatoria' })}
            error={errors.ali_direccion?.message}
            className="w-full"
          />
          <MuiInput
            label="Teléfono"
            name="ali_telefono"
            {...register('ali_telefono', { required: 'El teléfono es obligatorio' })}
            error={errors.ali_telefono?.message}
            className="w-full"
          />
          <div className="sm:col-span-2">
            <MuiInput
              label="Nombre de contacto"
              name="ali_nombre_contacto"
              {...register('ali_nombre_contacto', { required: 'El contacto es obligatorio' })}
              error={errors.ali_nombre_contacto?.message}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <CreateButton type="submit" title={saving ? 'Guardando...' : 'Guardar cambios'} />
            <CancelButton onClick={handleClose} />
          </div>
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
