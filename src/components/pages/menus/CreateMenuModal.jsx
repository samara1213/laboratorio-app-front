import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CardWithTitle from '../../CardWithTitle';
import CreateButton from '../../mui/CreateButton';
import CancelButton from '../../mui/CancelButton';
import MuiInput from '../../mui/MuiInput';
import MuiModal from '../../mui/MuiModal';
import MuiSelect from '../../mui/MuiSelect';
import { getMenuByLevelDB } from '../../../services/menuService';

export default function CreateMenuModal({ open, onSave, onClose, loading: loadingProp = false }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [parentOptions, setParentOptions] = useState([]);
  const [parentDisabled, setParentDisabled] = useState(true);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  const men_level = watch('men_level');

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => {
    const fetchParents = async () => {
      if (men_level && Number(men_level) > 1) {
        setParentDisabled(false);
        try {
          const res = await getMenuByLevelDB(Number(men_level) - 1);
          setParentOptions(res.data.data || []);
        } catch {
          setParentOptions([]);
        }
      } else {
        setParentDisabled(true);
        setValue('men_parent', '');
        setParentOptions([]);
      }
    };
    fetchParents();
  }, [men_level, setValue]);

  if (!open) return null;

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    const dataToSend = {
      men_name: data.men_name,
      men_level: +data.men_level,
      men_url: data.men_url || null,
      men_parent: data.men_parent || null,
      men_icon: data.men_icon,
    };
    try {
      if (onSave) {
        const response = await onSave(dataToSend);
        const successMsg = response?.data?.message || 'Menú creado correctamente';
        toast.success(successMsg);
      }
      onClose();
      reset();
    } catch (e) {
      const errorMsg = e?.response?.data?.message || 'No se pudo crear el menú';
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setSaving(false);
  };

  return (
    <MuiModal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <CardWithTitle title="Crear Menú" loading={loadingProp}>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MuiInput
            label="Nombre del menú"
            name="men_name"
            {...register('men_name', { required: 'El nombre es obligatorio' })}
            error={errors.men_name?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Ruta"
            name="men_url"
            {...register('men_url')}
            error={errors.men_url?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Icono (ej: mdi:home)"
            name="men_icon"
            {...register('men_icon', { required: 'El icono es obligatorio' })}
            error={errors.men_icon?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiInput
            label="Nivel"
            name="men_level"
            type="number"
            min={1}
            {...register('men_level', { required: 'El nivel es obligatorio', min: { value: 1, message: 'Nivel mínimo 1' } })}
            error={errors.men_level?.message}
            className="w-full sm:col-span-1 col-span-1"
          />
          <MuiSelect
            label="Menú padre"
            name="men_parent"
            error={errors.men_parent?.message}
            disabled={parentDisabled}
            {...register('men_parent', {
              required: !parentDisabled ? 'El menú padre es obligatorio' : false
            })}
            className="w-full sm:col-span-2 col-span-1"
            defaultValue=""
          >
            <option value="">Seleccione...</option>
            {parentOptions.map(opt => (
              <option key={opt.men_id} value={opt.men_id}>{opt.men_name}</option>
            ))}
          </MuiSelect>
          <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 pt-2">
            <CreateButton type="submit" title={saving ? 'Guardando...' : 'Crear Menú'} />
            <CancelButton onClick={onClose} />
          </div>
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
