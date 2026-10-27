import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import ConfirmDialog from '../../mui/ConfirmDialog';
import UserFormDialog from './UserFormDialog';
import { useAuthStore } from '../../../hooks/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { useChangeUserStatus, useLaboratories, useResetUserPassword, useRoles, useUsers } from '../../../hooks/queries/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Field, Select } from '@/components/ui/field';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { errorMessage, formatDateTime } from '@/lib/utils';

/**
 * Usuarios del laboratorio: crear, editar, activar/desactivar y restablecer contraseña.
 * El super administrador elige el laboratorio que administra
 */
export default function UsersPage() {
  const { user: me } = useAuthStore();
  const { can, isSystem } = usePermissions();
  const [labId, setLabId] = useState(null);
  const { data: laboratories = [] } = useLaboratories({ enabled: isSystem });

  // laboratorio administrado: el propio salvo que el super administrador elija otro
  const managedLabId = isSystem && labId && labId !== me?.laboratory?.lab_id ? labId : undefined;
  const { data: users = [], isLoading, isError, refetch } = useUsers(managedLabId);
  const { data: roles = [] } = useRoles(managedLabId, { enabled: can('users:create') || can('users:update') });

  const changeStatus = useChangeUserStatus();
  const resetPassword = useResetUserPassword();
  const [editing, setEditing] = useState(null); // null cerrado, {} nuevo, usuario para editar
  const [toggling, setToggling] = useState(null);
  const [resetting, setResetting] = useState(null);

  const rows = useMemo(
    () =>
      users.map((u) => ({
        ...u,
        name: [u.use_primer_nombre, u.use_primer_apellido].filter(Boolean).join(' ') || 'Sin nombre',
        // texto de búsqueda de la primera columna: nombre y correo
        who: `${u.use_primer_nombre ?? ''} ${u.use_primer_apellido ?? ''} ${u.use_correo}`,
        roleName: u.role?.rol_nombre ?? 'Sin rol',
        lastLogin: u.use_ultimo_ingreso ? formatDateTime(u.use_ultimo_ingreso) : 'Nunca',
      })),
    [users],
  );

  const columns = [
    {
      key: 'who',
      label: 'Usuario',
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-semibold">{row.name}</span>
          <span className="text-sm break-all text-muted">{row.use_correo}</span>
        </span>
      ),
    },
    { key: 'roleName', label: 'Rol', render: (row) => <span>{row.roleName}</span> },
    {
      key: 'use_estado',
      label: 'Estado',
      render: (row) => (
        <span className="flex flex-wrap gap-1.5">
          <Badge tone={row.use_estado === 'ACTIVO' ? 'success' : 'neutral'}>{row.use_estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}</Badge>
          {row.use_primer_ingreso && <Badge tone="warning">Debe cambiar contraseña</Badge>}
        </span>
      ),
    },
    { key: 'lastLogin', label: 'Último ingreso', hideBelow: 'lg', render: (row) => <span className="tabular text-muted">{row.lastLogin}</span> },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) =>
        can('users:update') &&
        !(row.role?.rol_is_system && !isSystem) && (
          <>
            <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setEditing(row)}>
              Editar
            </Button>
            {row.use_id !== me?.use_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon-sm" aria-label={`Más acciones de ${row.name}`} className="max-md:size-11 max-md:flex-none">
                    <Icon icon="mdi:dots-horizontal" className="size-5" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setResetting(row)}>
                    <Icon icon="mdi:lock-reset" aria-hidden="true" />
                    Restablecer contraseña
                  </DropdownMenuItem>
                  <DropdownMenuItem destructive={row.use_estado === 'ACTIVO'} onSelect={() => setToggling(row)}>
                    <Icon icon={row.use_estado === 'ACTIVO' ? 'mdi:account-off-outline' : 'mdi:account-check-outline'} aria-hidden="true" />
                    {row.use_estado === 'ACTIVO' ? 'Desactivar usuario' : 'Activar usuario'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        ),
    },
  ];

  const deactivating = toggling?.use_estado === 'ACTIVO';
  const confirmToggle = () =>
    changeStatus.mutate(
      { id: toggling.use_id, status: deactivating ? 'INACTIVO' : 'ACTIVO' },
      {
        onSuccess: (response) => toast.success(response.data.message),
        onError: (error) => toast.error(errorMessage(error, 'No fue posible cambiar el estado del usuario.')),
        onSettled: () => setToggling(null),
      },
    );

  const confirmReset = () =>
    resetPassword.mutate(resetting.use_id, {
      onSuccess: (response) => toast.success(response.data.message),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible restablecer la contraseña.')),
      onSettled: () => setResetting(null),
    });

  return (
    <LayoutDashboard title="Usuarios">
      {isSystem && laboratories.length > 0 && (
        <Field label="Laboratorio" className="max-w-md">
          {(field) => (
            <Select {...field} value={labId ?? me?.laboratory?.lab_id ?? ''} onChange={(e) => setLabId(e.target.value)}>
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
          title="Usuarios del laboratorio"
          description={`${users.length} ${users.length === 1 ? 'usuario' : 'usuarios'}`}
          actions={
            can('users:create') && (
              <Button onClick={() => setEditing({})}>
                <Icon icon="mdi:account-plus-outline" className="size-5" aria-hidden="true" />
                Nuevo usuario
              </Button>
            )
          }
        />
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar los usuarios.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            getRowKey={(row) => row.use_id}
            caption="Usuarios del laboratorio"
            searchPlaceholder="Buscar por nombre, correo o rol"
            emptyMessage="Aún no hay usuarios en este laboratorio."
          />
        )}
      </Panel>

      <UserFormDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        user={editing?.use_id ? editing : undefined}
        roles={roles}
        laboratoryId={managedLabId}
        isSelf={editing?.use_id === me?.use_id}
      />
      <ConfirmDialog
        open={Boolean(toggling)}
        title={deactivating ? `Desactivar a ${toggling?.name}` : `Activar a ${toggling?.name}`}
        message={deactivating ? 'No podrá ingresar y su sesión abierta se cerrará en su siguiente acción.' : 'Podrá volver a ingresar con su contraseña.'}
        confirmLabel={deactivating ? 'Desactivar usuario' : 'Activar usuario'}
        confirmVariant={deactivating ? 'danger' : 'primary'}
        loading={changeStatus.isPending}
        onConfirm={confirmToggle}
        onCancel={() => setToggling(null)}
      />
      <ConfirmDialog
        open={Boolean(resetting)}
        title={`Restablecer la contraseña de ${resetting?.name}`}
        message="Se enviará una contraseña temporal a su correo y deberá cambiarla al ingresar. La contraseña actual dejará de funcionar."
        confirmLabel="Enviar contraseña temporal"
        confirmVariant="primary"
        loading={resetPassword.isPending}
        onConfirm={confirmReset}
        onCancel={() => setResetting(null)}
      />
    </LayoutDashboard>
  );
}
