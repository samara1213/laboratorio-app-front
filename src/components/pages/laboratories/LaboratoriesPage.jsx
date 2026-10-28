import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import { useLaboratories, useSaveLaboratory } from '../../../hooks/queries/useAdmin';
import { usePermissions } from '../../../hooks/usePermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Select } from '@/components/ui/field';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { errorMessage } from '@/lib/utils';

const required = (message) => ({ required: message, validate: (v) => String(v).trim().length > 0 || message });

/**
 * Crear o editar un laboratorio (datos que salen en el encabezado del PDF)
 */
function LaboratoryFormDialog({ open, onClose, laboratory }) {
  const save = useSaveLaboratory();
  const editing = Boolean(laboratory);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!open) return;
    reset({
      lab_name: laboratory?.lab_name ?? '',
      lab_nit: laboratory?.lab_nit ?? '',
      lab_dv: laboratory?.lab_dv ?? '',
      lab_legal_representative: laboratory?.lab_legal_representative ?? '',
      lab_email: laboratory?.lab_email ?? '',
      lab_phone: laboratory?.lab_phone ?? '',
      lab_address: laboratory?.lab_address ?? '',
      lab_status: laboratory?.lab_status ?? 'ACTIVO',
    });
  }, [open, laboratory, reset]);

  const onSubmit = (values) => {
    const data = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value).trim()]));
    if (!data.lab_dv) delete data.lab_dv;
    save.mutate(
      { id: laboratory?.lab_id, data },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || 'Laboratorio guardado');
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar el laboratorio.')),
      },
    );
  };

  const input = (name, label, rules, props = {}, className) => (
    <Field label={label} error={errors[name]?.message} className={className}>
      {(field) => <Input autoComplete="off" {...props} {...field} {...register(name, rules)} />}
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="2xl"
        title={editing ? 'Editar laboratorio' : 'Nuevo laboratorio'}
        description="El nombre, NIT, dirección, teléfono y correo salen en el encabezado del PDF de resultados."
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="laboratory-form" disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear laboratorio'}
            </Button>
          </>
        }
      >
        <form id="laboratory-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          {input('lab_name', 'Nombre', required('Escribe el nombre'), { maxLength: 250 }, 'sm:col-span-2')}
          <div className="grid grid-cols-[1fr_5rem] gap-3 sm:col-span-2 sm:grid-cols-[1fr_6rem_1fr]">
            {input('lab_nit', 'NIT', { ...required('Escribe el NIT'), pattern: { value: /^[0-9.]{5,12}$/, message: 'Solo números (y puntos), de 5 a 12' } }, { inputMode: 'numeric', maxLength: 12 })}
            {input('lab_dv', 'DV', { pattern: { value: /^\d{0,2}$/, message: '1 o 2 dígitos' } }, { inputMode: 'numeric', maxLength: 2 })}
            <Field label="Estado" className="col-span-2 sm:col-span-1">
              {(field) => (
                <Select {...field} {...register('lab_status')}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </Select>
              )}
            </Field>
          </div>
          {input('lab_legal_representative', 'Representante legal', required('Escribe el representante legal'), { maxLength: 150 }, 'sm:col-span-2')}
          {input('lab_email', 'Correo', { ...required('Escribe el correo'), pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Correo no válido' } }, { type: 'email', inputMode: 'email', autoCapitalize: 'none' })}
          {input('lab_phone', 'Teléfono', { ...required('Escribe el teléfono'), pattern: { value: /^[0-9+\-() ]{7,20}$/, message: 'Teléfono no válido' } }, { type: 'tel', inputMode: 'tel' })}
          {input('lab_address', 'Dirección', required('Escribe la dirección'), {}, 'sm:col-span-2')}
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Laboratorios del sistema (solo super administrador)
 */
export default function LaboratoriesPage() {
  const { can } = usePermissions();
  const { data: laboratories = [], isLoading, isError, refetch } = useLaboratories();
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () =>
      [...laboratories]
        .sort((a, b) => a.lab_name.localeCompare(b.lab_name))
        .map((lab) => ({ ...lab, nit: lab.lab_dv ? `${lab.lab_nit}-${lab.lab_dv}` : lab.lab_nit })),
    [laboratories],
  );

  const columns = [
    {
      key: 'lab_name',
      label: 'Laboratorio',
      cardTitle: true,
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-semibold">{row.lab_name}</span>
          <span className="tabular text-sm text-muted">NIT {row.nit}</span>
        </span>
      ),
    },
    {
      key: 'lab_email',
      label: 'Contacto',
      hideBelow: 'lg',
      render: (row) => (
        <span className="flex flex-col text-sm">
          <span className="break-all">{row.lab_email}</span>
          <span className="tabular text-muted">{row.lab_phone}</span>
        </span>
      ),
    },
    { key: 'lab_legal_representative', label: 'Representante', hideBelow: 'xl' },
    {
      key: 'lab_status',
      label: 'Estado',
      render: (row) => <Badge tone={row.lab_status === 'ACTIVO' ? 'success' : 'neutral'}>{row.lab_status === 'ACTIVO' ? 'Activo' : 'Inactivo'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) =>
        can('laboratories:update') && (
          <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setEditing(row)}>
            Editar
          </Button>
        ),
    },
  ];

  return (
    <LayoutDashboard title="Laboratorios">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Laboratorios del sistema"
          description={`${rows.length} ${rows.length === 1 ? 'laboratorio' : 'laboratorios'}`}
          actions={
            can('laboratories:create') && (
              <Button onClick={() => setEditing({})}>
                <Icon icon="mdi:domain-plus" className="size-5" aria-hidden="true" />
                Nuevo laboratorio
              </Button>
            )
          }
        />
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar los laboratorios.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            getRowKey={(row) => row.lab_id}
            caption="Laboratorios del sistema"
            searchPlaceholder="Buscar por nombre o NIT"
            emptyMessage="Aún no hay laboratorios."
          />
        )}
      </Panel>
      <LaboratoryFormDialog open={editing !== null} onClose={() => setEditing(null)} laboratory={editing?.lab_id ? editing : undefined} />
    </LayoutDashboard>
  );
}
