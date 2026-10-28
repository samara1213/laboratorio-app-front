import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import ExamFormDialog from './ExamFormDialog';
import { useExams } from '../../../hooks/queries/useCatalog';
import { usePermissions } from '../../../hooks/usePermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Panel, PanelHeader } from '@/components/ui/panel';

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/**
 * Catálogo de exámenes del laboratorio: precio, clasificación, convenio y parámetros.
 * El catálogo es corto y otras pantallas lo usan completo: se busca y pagina en memoria
 */
export default function ExamsPage() {
  const { can } = usePermissions();
  const { data: exams = [], isLoading, isError, refetch } = useExams();
  const [editing, setEditing] = useState(null); // null cerrado, {} nuevo, examen para editar

  const rows = useMemo(
    () =>
      [...exams]
        .sort((a, b) => a.exa_name.localeCompare(b.exa_name))
        .map((exam) => ({
          ...exam,
          classificationName: exam.classification?.cla_name ?? 'Sin clasificación',
          allianceName: exam.alliance?.ali_nombre ?? '',
          parametersCount: exam.parameters?.length ?? 0,
        })),
    [exams],
  );

  const columns = [
    {
      key: 'exa_name',
      label: 'Examen',
      cardTitle: true,
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-semibold">{row.exa_name}</span>
          {row.exa_description && <span className="line-clamp-2 text-sm text-muted">{row.exa_description}</span>}
        </span>
      ),
    },
    {
      key: 'classificationName',
      label: 'Clasificación',
      render: (row) => <Badge tone={row.classification ? 'primary' : 'warning'}>{row.classificationName}</Badge>,
    },
    { key: 'exa_price', label: 'Precio', align: 'right', render: (row) => <span className="tabular">{money.format(row.exa_price ?? 0)}</span> },
    { key: 'allianceName', label: 'Convenio', hideBelow: 'lg', render: (row) => <span className={row.allianceName ? '' : 'text-muted'}>{row.allianceName || 'Ninguno'}</span> },
    {
      key: 'parametersCount',
      label: 'Parámetros',
      render: (row) => (
        <Link to={`/param-exams?examen=${row.exa_id}`} className="tabular font-semibold text-primary underline-offset-4 hover:underline">
          {row.parametersCount === 0 ? 'Agregar' : `${row.parametersCount} ${row.parametersCount === 1 ? 'parámetro' : 'parámetros'}`}
        </Link>
      ),
    },
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

  const unclassified = rows.filter((row) => !row.classification).length;

  return (
    <LayoutDashboard title="Exámenes">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Catálogo de exámenes"
          description={
            unclassified
              ? `${rows.length} exámenes · ${unclassified} sin clasificación (salen al final del PDF, en «Otros exámenes»)`
              : `${rows.length} ${rows.length === 1 ? 'examen' : 'exámenes'}`
          }
          actions={
            can('exams:create') && (
              <Button onClick={() => setEditing({})}>
                <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
                Nuevo examen
              </Button>
            )
          }
        />
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar los exámenes.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            getRowKey={(row) => row.exa_id}
            caption="Catálogo de exámenes"
            searchPlaceholder="Buscar por nombre, clasificación o convenio"
            emptyMessage="Aún no hay exámenes. Crea el primero para poder armar órdenes."
          />
        )}
      </Panel>
      <ExamFormDialog open={editing !== null} onClose={() => setEditing(null)} exam={editing?.exa_id ? editing : undefined} />
    </LayoutDashboard>
  );
}
