import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useResultsActions } from '../../../hooks/resultsStore';
import MuiModal from '../../mui/MuiModal';
import CardWithTitle from '../../CardWithTitle';
import MuiTable from '../../mui/MuiTable';
import CancelButton from '../../mui/CancelButton';
import CreateButton from '../../mui/CreateButton';

const paramColumns = [
  { key: 'par_name', label: 'Nombre del parámetro' },
  { key: 'par_unit_extent', label: 'Unidad medida' },
  { key: 'resultado', label: 'Resultado' },
];

function getParamTableData(parameters, completedExams, exam, paramResults, setParamResults) {
  return (parameters || []).map(param => {
    const value = paramResults[param.par_id] ?? '';
    return {
      ...param,
      resultado: (
        <input
          type="text"
          className="w-full text-sm border rounded px-2 py-1"
          value={value}
          onChange={e => setParamResults(prev => ({ ...prev, [param.par_id]: e.target.value }))}
        />
      ),
    };
  });
}

export default function ResultModal({ open, exam, onClose }) {
  const completedExams = useSelector(state => state.results.completedExams);
  const { saveExamResults } = useResultsActions();
  const [paramResults, setParamResults] = useState({});
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (open && exam) {
      const paramDefaults = {};
      (exam.parameters || []).forEach(param => {
        const saved = (completedExams || []).find(r => r.exa_id === exam.exa_id && r.par_id === param.par_id);
        paramDefaults[param.par_id] = saved ? saved.resultado : param.par_default_value ?? '';
      });
      setParamResults(paramDefaults);
      const savedObs = (completedExams || []).find(r => r.exa_id === exam.exa_id)?.observacion || '';
      setObservaciones(savedObs);
    }
  }, [open, exam, completedExams]);

  if (!open || !exam) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    const results = (exam.parameters || []).map(param => ({
      exa_id: exam.exa_id,
      par_id: param.par_id,
      resultado: paramResults[param.par_id] ?? '',
      observacion: observaciones || ''
    }));
    saveExamResults(results);
    onClose();
  };

  return (
    <MuiModal open={open} onClose={onClose} maxWidth="max-w-3xl">
      <CardWithTitle title="Agregar resultado" className="max-w-2xl w-full">
        <div className="mb-4">
          <div className="font-semibold text-blue-700">{exam.exa_name}</div>
        </div>
        <form onSubmit={onSubmit} className="mt-6">
          <MuiTable
            columns={paramColumns}
            data={getParamTableData(exam.parameters, completedExams, exam, paramResults, setParamResults)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Observaciones</label>
          <input
            type="text"
            className="w-full mb-4 border rounded px-2 py-1"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Observaciones generales del examen"
          />
          <div className="flex justify-end gap-2 mt-4">
            <CancelButton
              type="button"
              onClick={onClose}
              title="Cancelar"
              className="!px-4 !py-2 !text-base sm:!text-sm"
            />
            <CreateButton
              type="submit"
              title="Guardar"
              className="!px-4 !py-2 !text-base sm:!text-sm bg-blue-600 hover:bg-blue-700 text-white"
            />
          </div>
        </form>
      </CardWithTitle>
    </MuiModal>
  );
}
