import { useEffect } from 'react';
import MuiModal from '../../mui/MuiModal';
import { useState } from 'react';
import CardWithTitle from '../../CardWithTitle';
import MuiTable from '../../mui/MuiTable';
import MuiInput from '../../mui/MuiInput';
import SaveButton from '../../mui/SaveButton';
import CancelButton from '../../mui/CancelButton';
import { updateResultExamDB } from '../../../services';
import { toast } from 'react-toastify';


export default function EditExamParamsModal({ open, onClose, exam, orderId, onRefresh }) {
  const [params, setParams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        if (exam && exam.parameters) {
            const sortedParams = [...exam.parameters].sort((a, b) => (a.par_order ?? 0) - (b.par_order ?? 0));
            setParams(prepareParamsData(sortedParams));
            setLoading(false);
        }
    }, [exam]);

  function prepareParamsData(parameters) {
    return parameters.map(param => ({
      ...param,
      value: param.value || '',
    }));
  }

  const handleChange = (idx, changes) => {
    setParams(params => params.map((p, i) => i === idx ? { ...p, ...changes } : p));
  };

  const handleSave = () => {
    // Aquí puedes agregar la lógica para guardar los parámetros editados
    onClose(params);
  };

  const handleClose = (data) => {
    if (onRefresh) onRefresh();
    onClose(data);
  };

  const paramColumns = [
    { key: 'par_name', label: 'Nombre del parámetro' },
    { key: 'result', label: 'Resultado' },
    { key: 'observation', label: 'Observacion' },
    { key: 'accion', label: 'Acciones' },
];

  function getParamsTableData(params, handleChange, handleSaveParam) {
    return params.map((param, idx) => ({
      ...param,
      result: (
        <MuiInput
          className="w-full"
          value={param.result || ''}
          onChange={e => handleChange(idx, { result: e.target.value })}
        />
      ),
      observation: (
        <MuiInput
          className="w-full"
          value={param.observation || ''}
          onChange={e => handleChange(idx, { observation: e.target.value })}
        />
      ),
      accion: (
        <SaveButton onClick={() => handleSaveParam(idx)} title="Guardar parámetro" />
      ),
    }));
  }

  // Handler para guardar un solo parámetro
  async function handleSaveParam(idx) {
    const param = params[idx];
    try {
      const response = await updateResultExamDB(param.id_result, {
        order: orderId,
        exam: exam.exa_id,
        param: param.par_id,
        res_value: param.result,
        res_observation: param.observation,
      });
      toast.success(response.data.message || 'Parámetro guardado correctamente');
    } catch (error) {
        const msg = error?.response?.data?.message;
        const errorMsg = Array.isArray(msg) ? msg[0] : (msg || 'Error buscando exámenes');
        toast.error(errorMsg);
    }
  }

  return (
    <MuiModal open={open} onClose={() => handleClose(null)} maxWidth="max-w-4xl">
      <div className="bg-white p-0 rounded-xl w-full">
        <CardWithTitle title="Editar valores del Examen">
          {loading ? (
            <div className="text-gray-500">Cargando parámetros...</div>
          ) : (
            <MuiTable
              columns={paramColumns}
              data={getParamsTableData(params, handleChange, handleSaveParam)}
            />
          )}
          <div className="flex justify-end gap-2 mt-6">
            <CancelButton onClick={() => handleClose(null)} title="Cerrar" />
          </div>
        </CardWithTitle>
      </div>
    </MuiModal>
  );
}
