import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import MuiInput from '../../mui/MuiInput';
import MuiSelect from '../../mui/MuiSelect';
import MuiModal from '../../mui/MuiModal';
import CardWithTitle from '../../CardWithTitle';
import CancelButton from '../../mui/CancelButton';
import CreateButton from '../../mui/CreateButton';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function EditExamsModal({
  open,
  onClose,
  onSubmit: onSave,
  loading = false,
  alliances,
  defaultValues
}) {
  // Normaliza alliance a ali_id si es objeto
  const normalizedDefaultValues = {
    ...defaultValues,
    alliance: typeof defaultValues?.alliance === 'object' && defaultValues?.alliance !== null
      ? defaultValues.alliance.ali_id
      : defaultValues?.alliance || '',
    exa_classification: defaultValues?.exa_classification ? String(defaultValues.exa_classification) : '',
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: normalizedDefaultValues
  });
  const getInitialAllianceSelect = (dv) => !!(dv && dv.alliance && dv.alliance !== '' && dv.alliance !== null);
  const [showAllianceSelect, setShowAllianceSelect] = useState(getInitialAllianceSelect(normalizedDefaultValues));

  useEffect(() => {
    reset(normalizedDefaultValues);
    setShowAllianceSelect(getInitialAllianceSelect(normalizedDefaultValues));
  }, [defaultValues, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      const dataToSend = {
        exa_name: data.exa_name,
        exa_description: data.exa_description,
        exa_price: data.exa_price,
        alliance: data.alliance || null,
        exa_classification: data.exa_classification || '',
      };
      const response = await onSave(dataToSend);
      reset();
      toast.success(response?.data?.message || 'Examen actualizado correctamente');
    } catch (error) {
      const msg = error?.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error al actualizar el examen');
      toast.error(errorMsg);
    }
  };

  return (
    <MuiModal open={open} onClose={handleClose} maxWidth="max-w-lg">
      <CardWithTitle title="Editar Examen" loading={loading}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2 p-2 sm:grid-cols-2 sm:gap-4">
          <div className="sm:col-span-2">
            <MuiInput
              label="Nombre del examen"
              name="exa_name"
              {...register('exa_name', { required: 'El nombre es obligatorio' })}
              error={errors.exa_name?.message}
              className="w-full mb-1"
            />
          </div>
          <div className="sm:col-span-2">
            <MuiInput
              label="Descripción"
              name="exa_description"
              {...register('exa_description', { required: 'La descripción es obligatoria' })}
              error={errors.exa_description?.message}
              className="w-full mb-1"
            />
          </div>
          <MuiInput
            label="Precio"
            name="exa_price"
            type="number"
            {...register('exa_price', { required: 'El precio es obligatorio', min: { value: 1, message: 'El precio debe ser mayor a 0' } })}
            error={errors.exa_price?.message}
            className="w-full mb-1"
          />
          <div className="sm:col-span-2">
            <MuiSelect
              label="Clasificación del examen"
              name="exa_classification"
              {...register('exa_classification', { required: 'La clasificación es obligatoria' })}
              error={errors.exa_classification?.message}
              className="w-full mb-1"
            >
              <option value="">Seleccione clasificación</option>
              <option value="1">Imagen hemograma</option>
              <option value="2">Hematología</option>
              <option value="3">Química</option>
              <option value="4">Inmunología</option>
              <option value="5">Microscopía</option>
              <option value="6">Macroscopia</option>
              <option value="7">Microbiología</option>
              <option value="8">Hormonas</option>
            </MuiSelect>
          </div>
          <div className="sm:col-span-2">
            {!showAllianceSelect ? (
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 text-blue-800 font-bold rounded-lg shadow hover:from-blue-200 hover:to-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 text-base sm:text-sm mt-2 mb-2"
                style={{ minHeight: '40px' }}
                onClick={() => setShowAllianceSelect(true)}
              >
                <Icon icon="mdi:account-plus" className="h-5 w-5" />
                <span>Agregar aliado (opcional)</span>
              </button>
            ) : (
              <div className="relative mt-4 mb-4 p-4 bg-blue-50 rounded-lg shadow border border-blue-200">
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="alliance">Alianza (opcional)</label>
                <MuiSelect
                  label=""
                  name="alliance"
                  {...register('alliance')}
                  error={errors.alliance?.message}
                  className="w-full border-2 border-blue-300 focus:border-blue-500 bg-blue-50 text-blue-900 font-semibold rounded-lg shadow-sm transition"
                  onBlur={e => { if (!e.target.value) setShowAllianceSelect(false); }}
                >
                  <option value="">Sin alianza</option>
                  {alliances.map(allies => (
                    <option key={allies.ali_id} value={allies.ali_id}>{allies.ali_nombre}</option>
                  ))}
                </MuiSelect>
                <button
                  type="button"
                  className="absolute top-0 right-0 mt-2 mr-2 flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 text-pink-800 font-extrabold uppercase tracking-wide rounded-lg shadow hover:from-pink-300 hover:to-pink-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 text-xs"
                  style={{ minHeight: '32px' }}
                  onClick={() => {
                    setShowAllianceSelect(false);
                    setValue('alliance', '');
                  }}
                >
                  <Icon icon="mdi:close-circle-outline" className="h-4 w-4" />
                  Quitar aliado
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <CreateButton type="submit" title="Guardar" />
            <CancelButton onClick={handleClose} />
          </div>
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
