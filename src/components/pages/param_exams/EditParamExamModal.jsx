import React, { useEffect } from 'react';
import MuiModal from '../../mui/MuiModal';
import CardWithTitle from '../../CardWithTitle';
import MuiInput from '../../mui/MuiInput';
import CancelButton from '../../mui/CancelButton';
import CreateButton from '../../mui/CreateButton';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import MuiCheck from '../../mui/MuiCheck';

export default function EditParamExamModal({ open, onClose, onSubmit: onSave, loading = false, param, examId }) {
    const { register, handleSubmit, reset, formState: { errors }, control, setValue } = useForm({
        defaultValues: param || {}
    });

    // Actualizar valores cuando cambia el parámetro a editar
    useEffect(() => {
        if (param) {
            reset(param || {});
        } else {
            reset();
        }
    }, [param, setValue, reset]);

    const aplicaRango = useWatch({ control, name: 'par_range', defaultValue: false });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                exam: examId,
                par_name: data.par_name,
                par_default_value: data.par_default_value,
                par_range: data.par_range,
                par_reference_value: data.par_reference_value || null,
                par_unit_extent: data.par_unit_extent || null,
                par_max_child: +data.par_max_child || null,
                par_min_child: +data.par_min_child || null,
                par_max_man: +data.par_max_man || null,
                par_min_man: +data.par_min_man || null,
                par_min_woman: +data.par_min_woman || null,
                par_max_woman: +data.par_max_woman || null                
             };
            const response = await onSave(payload);
            toast.success(response.data.message || 'Parámetro editado correctamente');
            reset();
            onClose();
        } catch (error) {
            const msg = error?.response?.data?.message;
            const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error al editar el parámetro');
            toast.error(errorMsg);
        }
    };

    return (
        <MuiModal open={open} onClose={handleClose} maxWidth="max-w-3xl">
            <CardWithTitle title="Editar parámetro" loading={loading}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid gap-4 p-2 sm:grid-cols-2 max-w-full w-full"
                    style={{ maxHeight: '70vh', overflowY: 'auto' }}
                >
                    <MuiInput
                        label="Nombre del parámetro"
                        name="par_name"
                        {...register('par_name', { required: 'El nombre es obligatorio' })}
                        error={errors.par_name?.message}
                        className="w-full sm:col-span-2"
                    />
                    <MuiInput
                        label="Valor por defecto"
                        name="par_default_value"
                        {...register('par_default_value', { required: 'El valor por defecto es obligatorio' })}
                        error={errors.par_default_value?.message}
                        className="w-full"
                    />
                    {/* Aplica rango como checkbox */}
                    <MuiCheck
                        label="Aplica rango"
                        name="par_range"
                        {...register('par_range')}
                        className="sm:col-span-2"
                    />
                    {/* Campos de rango, solo visibles y obligatorios si aplicaRango */}
                    {aplicaRango && (
                        <div className="sm:col-span-2 rounded-lg border-2 border-blue-400 bg-blue-50 p-4 flex flex-col gap-2 relative">
                            <span className="absolute -top-3 left-4 bg-blue-400 text-white text-xs px-2 py-0.5 rounded shadow">Valores de rango</span>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <MuiInput
                                    label="Mínimo hombre"
                                    name="par_min_man"
                                    type="number"
                                    {...register('par_min_man', { required: aplicaRango ? 'El mínimo para hombre es obligatorio' : false })}
                                    error={errors.par_min_man?.message}
                                    className="w-full"
                                />
                                <MuiInput
                                    label="Máximo hombre"
                                    name="par_max_man"
                                    type="number"
                                    {...register('par_max_man', { required: aplicaRango ? 'El máximo para hombre es obligatorio' : false })}
                                    error={errors.par_max_man?.message}
                                    className="w-full"
                                />
                                <MuiInput
                                    label="Mínimo mujer"
                                    name="par_min_woman"
                                    type="number"
                                    {...register('par_min_woman', { required: aplicaRango ? 'El mínimo para mujer es obligatorio' : false })}
                                    error={errors.par_min_woman?.message}
                                    className="w-full"
                                />
                                <MuiInput
                                    label="Máximo mujer"
                                    name="par_max_woman"
                                    type="number"
                                    {...register('par_max_woman', { required: aplicaRango ? 'El máximo para mujer es obligatorio' : false })}
                                    error={errors.par_max_woman?.message}
                                    className="w-full"
                                />
                                <MuiInput
                                    label="Mínimo niño"
                                    name="par_min_child"
                                    type="number"
                                    {...register('par_min_child', { required: aplicaRango ? 'El mínimo para niño es obligatorio' : false })}
                                    error={errors.par_min_child?.message}
                                    className="w-full"
                                />
                                <MuiInput
                                    label="Máximo niño"
                                    name="par_max_child"
                                    type="number"
                                    {...register('par_max_child', { required: aplicaRango ? 'El máximo para niño es obligatorio' : false })}
                                    error={errors.par_max_child?.message}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}
                    {/* Input de valor de referencia (opcional) y unidad de medida (opcional) en la misma fila */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2">
                        <MuiInput
                            label="Valor de referencia (opcional)"
                            name="par_reference_value"
                            {...register('par_reference_value')}
                            error={errors.par_reference_value?.message}
                            className="w-full"
                        />
                        <MuiInput
                            label="Unidad de medida (opcional)"
                            name="par_unit_extent"
                            {...register('par_unit_extent')}
                            error={errors.par_reference_unit?.message}
                            className="w-full"
                        />
                    </div>
                    <div className="flex justify-end gap-2 sm:col-span-2 sticky bottom-0 bg-blue-50/80 pt-2 pb-1 z-10">
                        <CreateButton type="submit" title="Guardar cambios" />
                        <CancelButton onClick={handleClose} />
                    </div>
                </form>
            </CardWithTitle>
        </MuiModal>
    );
}
