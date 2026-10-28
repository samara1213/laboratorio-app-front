import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import ClassificationFormDialog from './ClassificationFormDialog';
import { useAuthStore } from '../../../hooks/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { useExamClassifications } from '../../../hooks/queries/useCatalog';
import { useLaboratories } from '../../../hooks/queries/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Field, Select } from '@/components/ui/field';
import { Panel, PanelHeader } from '@/components/ui/panel';

/**
 * Clasificaciones de exámenes: cada una es una sección del PDF de resultados, en el orden
 * indicado. Las del sistema las ven todos los laboratorios (solo el super administrador las
 * edita); cada laboratorio puede crear las suyas
 */
export default function ExamClassificationsPage() {
  const { user: me } = useAuthStore();
  const { can, isSystem } = usePermissions();
  const [labId, setLabId] = useState('');
  const { data: laboratories = [] } = useLaboratories({ enabled: isSystem });
  // el super administrador ve todas o filtra por un laboratorio
  const { data: classifications = [], isLoading, isError, refetch } = useExamClassifications(isSystem ? labId || undefined : undefined);
  const [editing, setEditing] = useState(null); // null cerrado, {} nueva, clasificación para editar

  const rows = useMemo(
    () =>
      classifications.map((cla) => ({
        ...cla,
        scope: cla.laboratory ? cla.laboratory.lab_name : 'Sistema',
      })),
    [classifications],
  );

  const columns = [
    {
      key: 'cla_order',
      label: 'Posición',
      className: 'w-24',
      render: (row) => <span className="tabular font-semibold">{row.cla_order}</span>,
    },
    {
      key: 'cla_name',
      label: 'Sección del PDF',
      cardTitle: true,
      render: (row) => (
        <span className="flex flex-col gap-1">
          <span className="font-semibold">{row.cla_name}</span>
          {row.cla_show_images && (
            <span className="flex items-center gap-1 text-sm text-muted">
              <Icon icon="mdi:image-outline" className="size-4" aria-hidden="true" />
              Incluye las imágenes adjuntas a la orden
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'scope',
      label: 'De',
      render: (row) => <Badge tone={row.laboratory ? 'info' : 'primary'}>{row.scope}</Badge>,
    },
    {
      key: 'exams_count',
      label: 'Exámenes',
      hideBelow: 'lg',
      render: (row) => <span className="tabular">{row.exams_count}</span>,
    },
    {
      key: 'cla_active',
      label: 'Estado',
      render: (row) => <Badge tone={row.cla_active ? 'success' : 'neutral'}>{row.cla_active ? 'Activa' : 'Inactiva'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) =>
        row.editable &&
        can('exams:update') && (
          <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setEditing(row)}>
            Editar
          </Button>
        ),
    },
  ];

  return (
    <LayoutDashboard title="Clasificaciones">
      {isSystem && laboratories.length > 0 && (
        <Field label="Laboratorio" className="max-w-md">
          {(field) => (
            <Select {...field} value={labId} onChange={(e) => setLabId(e.target.value)}>
              <option value="">Todos (sistema y laboratorios)</option>
              {laboratories.map((lab) => (
                <option key={lab.lab_id} value={lab.lab_id}>
                  {lab.lab_name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      )}

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Secciones del PDF de resultados"
          description="Cada examen se imprime en la sección de su clasificación, de menor a mayor posición. Los exámenes sin clasificación van al final, en «Otros exámenes»."
          actions={
            can('exams:create') && (
              <Button onClick={() => setEditing({})}>
                <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
                Nueva clasificación
              </Button>
            )
          }
        />
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar las clasificaciones.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            getRowKey={(row) => row.cla_id}
            caption="Clasificaciones de exámenes"
            searchPlaceholder="Buscar por nombre o laboratorio"
            emptyMessage="Aún no hay clasificaciones."
          />
        )}
      </Panel>

      <ClassificationFormDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        classification={editing?.cla_id ? editing : undefined}
        laboratories={isSystem ? laboratories : []}
        defaultLabId={isSystem ? labId : me?.laboratory?.lab_id}
      />
    </LayoutDashboard>
  );
}
