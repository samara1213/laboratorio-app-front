import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import { useAlliances, useExams, useSaveAlliance } from '../../../hooks/queries/useCatalog';
import { usePermissions } from '../../../hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/field';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { errorMessage } from '@/lib/utils';

const FIELDS = [
  ['ali_nombre', 'Nombre de la empresa o entidad', 100, {}],
  ['ali_nombre_contacto', 'Persona de contacto', 100, {}],
  ['ali_telefono', 'Teléfono', 20, { type: 'tel', inputMode: 'tel' }],
  ['ali_direccion', 'Dirección', 200, {}],
];

/**
 * Crear o editar un convenio
 */
function AllianceFormDialog({ open, onClose, alliance }) {
  const save = useSaveAlliance();
  const editing = Boolean(alliance);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (open) reset(Object.fromEntries(FIELDS.map(([name]) => [name, alliance?.[name] ?? ''])));
  }, [open, alliance, reset]);

  const onSubmit = (values) =>
    save.mutate(
      { id: alliance?.ali_id, data: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])) },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || 'Convenio guardado');
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar el convenio.')),
      },
    );

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="xl"
        title={editing ? 'Editar convenio' : 'Nuevo convenio'}
        description="Empresa o entidad con la que el laboratorio tiene un acuerdo; se asocia a los exámenes."
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="alliance-form" disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear convenio'}
            </Button>
          </>
        }
      >
        <form id="alliance-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          {FIELDS.map(([name, label, max, input]) => (
            <Field key={name} label={label} error={errors[name]?.message} className={name === 'ali_direccion' ? 'sm:col-span-2' : undefined}>
              {(field) => (
                <Input
                  autoComplete="off"
                  maxLength={max}
                  {...input}
                  {...field}
                  {...register(name, { required: 'Este dato es obligatorio', validate: (v) => v.trim().length > 0 || 'Este dato es obligatorio' })}
                />
              )}
            </Field>
          ))}
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Convenios del laboratorio, con cuántos exámenes los usan
 */
export default function AlliancesPage() {
  const { can } = usePermissions();
  const { data: alliances = [], isLoading, isError, refetch } = useAlliances();
  const { data: exams = [] } = useExams();
  const [editing, setEditing] = useState(null);

  const rows = useMemo(() => {
    const counts = new Map();
    for (const exam of exams) if (exam.alliance?.ali_id) counts.set(exam.alliance.ali_id, (counts.get(exam.alliance.ali_id) ?? 0) + 1);
    return [...alliances]
      .sort((a, b) => a.ali_nombre.localeCompare(b.ali_nombre))
      .map((alliance) => ({ ...alliance, examsCount: counts.get(alliance.ali_id) ?? 0 }));
  }, [alliances, exams]);

  const columns = [
    {
      key: 'ali_nombre',
      label: 'Convenio',
      cardTitle: true,
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-semibold">{row.ali_nombre}</span>
          <span className="text-sm text-muted">{row.ali_direccion}</span>
        </span>
      ),
    },
    {
      key: 'ali_nombre_contacto',
      label: 'Contacto',
      render: (row) => (
        <span className="flex flex-col">
          <span>{row.ali_nombre_contacto}</span>
          <a href={`tel:${row.ali_telefono}`} className="tabular text-sm text-primary underline-offset-4 hover:underline">
            {row.ali_telefono}
          </a>
        </span>
      ),
    },
    { key: 'examsCount', label: 'Exámenes', render: (row) => <span className="tabular">{row.examsCount}</span> },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) =>
        can('alliances:update') && (
          <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setEditing(row)}>
            Editar
          </Button>
        ),
    },
  ];

  return (
    <LayoutDashboard title="Convenios">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Convenios del laboratorio"
          description={`${rows.length} ${rows.length === 1 ? 'convenio' : 'convenios'}`}
          actions={
            can('alliances:create') && (
              <Button onClick={() => setEditing({})}>
                <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
                Nuevo convenio
              </Button>
            )
          }
        />
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar los convenios.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            getRowKey={(row) => row.ali_id}
            caption="Convenios del laboratorio"
            searchPlaceholder="Buscar por nombre o contacto"
            emptyMessage="Aún no hay convenios."
          />
        )}
      </Panel>
      <AllianceFormDialog open={editing !== null} onClose={() => setEditing(null)} alliance={editing?.ali_id ? editing : undefined} />
    </LayoutDashboard>
  );
}
