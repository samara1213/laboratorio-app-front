import MuiModal from '../../mui/MuiModal';
import MuiInput from '../../mui/MuiInput';
import CreateButton from '../../mui/CreateButton';
import CancelButton from '../../mui/CancelButton';
import CardWithTitle from '../../CardWithTitle';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function CreateAllianceModal({ open, onSave, onClose, loading = false }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
        const response = await onSave(data);
        reset();
        toast.success(response?.data?.message);
    } catch (error) {        
        toast.error('ocurrio un error al crear el aliado');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <MuiModal open={open} onClose={handleClose} maxWidth="max-w-lg">
      <CardWithTitle title="Crear nuevo aliado" loading={loading}>
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
            <CreateButton type="submit" title="Crear" />
            <CancelButton onClick={handleClose} />
          </div>
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
