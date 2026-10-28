import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import ParameterFormDialog, { RANGE_GROUPS } from './ParameterFormDialog';
import { useExamParameters, useExams } from '../../../hooks/queries/useCatalog';
import { usePermissions } from '../../../hooks/usePermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Field, Select } from '@/components/ui/field';
import { Panel, PanelHeader } from '@/components/ui/panel';

// "4.50" → "4.5"
const num = (value) => (value === null || value === undefined || value === '' ? '' : String(Number(value)));

/**
 * Referencia que se imprime: rangos por grupo o el valor de referencia
 */
function referenceOf(parameter) {
  if (!parameter.par_range) return parameter.par_reference_value || '';
  return RANGE_GROUPS.map(([group, label]) => {
    const min = num(parameter[`par_min_${group}`]);
    const max = num(parameter[`par_max_${group}`]);
    return min || max ? `${label}: ${min || '—'} – ${max || '—'}` : null;
  })
    .filter(Boolean)
    .join(' · ');
}

/**
 * Parámetros de un examen (lo que se registra en cada resultado), en el orden de la captura y el PDF
 */
export default function ParamExamsPage() {
  const { can } = usePermissions();
  const [params, setParams] = useSearchParams();
  const { data: exams = [], isLoading: loadingExams } = useExams();
  const sortedExams = useMemo(() => [...exams].sort((a, b) => a.exa_name.localeCompare(b.exa_name)), [exams]);
  const examId = params.get('examen') ?? '';
  const exam = exams.find((e) => e.exa_id === examId);
  const { data: parameters = [], isLoading, isError, refetch } = useExamParameters(exam ? examId : null);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () =>
      [...parameters]
        .sort((a, b) => (a.par_order ?? 0) - (b.par_order ?? 0))
        .map((parameter) => {
          const isTitle = parameter.par_name?.startsWith('*');
          return {
            ...parameter,
            isTitle,
            name: isTitle ? parameter.par_name.slice(1).trim() : parameter.par_name,
            reference: isTitle ? '' : referenceOf(parameter),
          };
        }),
    [parameters],
  );
  const nextOrder = rows.reduce((max, row) => Math.max(max, row.par_order ?? 0), 0) + 1;

  const columns = [
    { key: 'par_order', label: 'Posición', render: (row) => <span className="tabular font-semibold">{row.par_order}</span> },
    {
      key: 'name',
      label: 'Parámetro',
      cardTitle: true,
      render: (row) =>
        row.isTitle ? (
          <span className="flex items-center gap-2">
            <span className="font-bold text-primary">{row.name}</span>
            <Badge tone="primary">Subtítulo</Badge>
          </span>
        ) : (
          <span className="font-semibold">{row.name}</span>
        ),
    },
    { key: 'par_unit_extent', label: 'Unidad', render: (row) => <span className="text-muted">{row.par_unit_extent || '—'}</span> },
    { key: 'reference', label: 'Referencia', render: (row) => <span className="text-sm">{row.reference || '—'}</span> },
    { key: 'par_default_value', label: 'Por defecto', hideBelow: 'xl', render: (row) => <span className="text-muted">{row.par_default_value || '—'}</span> },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) =>
        can('exams:update') && (
          <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setEditing(row)}>
            Editar
          </Button>
        ),
    },
  ];

  return (
    <LayoutDashboard title="Parámetros">
      <Field label="Examen" className="max-w-md">
        {(field) => (
          <Select {...field} value={examId} disabled={loadingExams} onChange={(e) => setParams(e.target.value ? { examen: e.target.value } : {}, { replace: true })}>
            <option value="">{loadingExams ? 'Cargando exámenes…' : 'Elige un examen'}</option>
            {sortedExams.map((e) => (
              <option key={e.exa_id} value={e.exa_id}>
                {e.exa_name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {!exam ? (
        <Panel className="flex flex-col items-center gap-3 px-5 py-12 text-center">
          <Icon icon="mdi:tune-variant" className="size-10 text-muted" aria-hidden="true" />
          <p className="max-w-md text-[15px] text-muted">
            Elige un examen para ver y editar sus parámetros: lo que se registra en cada resultado, con su unidad y rangos de referencia.
          </p>
          {!loadingExams && exams.length === 0 && (
            <Button asChild variant="secondary">
              <Link to="/exams">Crear el primer examen</Link>
            </Button>
          )}
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          <PanelHeader
            title={exam.exa_name}
            description={`${rows.filter((r) => !r.isTitle).length} parámetros${rows.some((r) => r.isTitle) ? ` en ${rows.filter((r) => r.isTitle).length} secciones` : ''}`}
            actions={
              (can('exams:create') || can('exams:update')) && (
                <Button onClick={() => setEditing({})}>
                  <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
                  Nuevo parámetro
                </Button>
              )
            }
          />
          {isError ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <p className="text-[15px] text-muted">No pudimos cargar los parámetros.</p>
              <Button variant="secondary" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              loading={isLoading}
              getRowKey={(row) => row.par_id}
              caption={`Parámetros de ${exam.exa_name}`}
              searchPlaceholder="Buscar parámetro"
              pageSizes={[50, 100]}
              emptyMessage="El examen aún no tiene parámetros. Agrega el primero."
            />
          )}
        </Panel>
      )}

      {exam && (
        <ParameterFormDialog
          open={editing !== null}
          onClose={() => setEditing(null)}
          examId={examId}
          parameter={editing?.par_id ? editing : undefined}
          nextOrder={nextOrder}
        />
      )}
    </LayoutDashboard>
  );
}
