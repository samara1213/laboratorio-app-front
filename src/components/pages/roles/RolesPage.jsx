import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import RoleEditorDialog from './RoleEditorDialog';
import { usePermissions } from '../../../hooks/usePermissions';
import { useDeleteRole, useRoles } from '../../../hooks/queries/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { errorMessage } from '@/lib/utils';

/**
 * Alcance del rol: del sistema, global o de un laboratorio
 */
function scopeOf(role) {
  if (role.rol_is_system) return { label: 'Sistema', tone: 'info' };
  if (!role.laboratory) return { label: 'Global', tone: 'primary' };
  return { label: role.laboratory.lab_name, tone: 'neutral' };
}

/**
 * Roles y permisos: lista de roles con su alcance y editor de la matriz de permisos
 */
export default function RolesPage() {
  const { can } = usePermissions();
  const { data: roles = [], isLoading, isError, refetch } = useRoles();
  const deleteRole = useDeleteRole();
  const [editor, setEditor] = useState(null); // { role?, readOnly }
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(
    () =>
      roles.map((role) => ({
        ...role,
        scope: scopeOf(role).label,
        modulesCount: Object.values(role.permissions ?? {}).filter((p) => p.view).length,
      })),
    [roles],
  );

  const columns = [
    {
      key: 'rol_nombre',
      label: 'Rol',
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-semibold">{row.rol_nombre}</span>
          {row.rol_description && <span className="text-sm text-muted">{row.rol_description}</span>}
        </span>
      ),
    },
    {
      key: 'scope',
      label: 'Alcance',
      render: (row) => {
        const scope = scopeOf(row);
        return (
          <span className="flex flex-wrap gap-1.5">
            <Badge tone={scope.tone}>{scope.label}</Badge>
            {!row.rol_active && <Badge>Inactivo</Badge>}
          </span>
        );
      },
    },
    {
      key: 'modulesCount',
      label: 'Módulos',
      hideBelow: 'lg',
      render: (row) => <span className="tabular">{row.rol_is_system ? 'Todos' : row.modulesCount}</span>,
    },
    { key: 'users_count', label: 'Usuarios', render: (row) => <span className="tabular">{row.users_count}</span> },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => {
        const editable = row.editable && can('roles:update');
        return (
          <>
            <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setEditor({ role: row, readOnly: !editable })}>
              {editable ? 'Editar' : 'Ver permisos'}
            </Button>
            {row.editable && can('roles:delete') && (
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label={`Eliminar el rol ${row.rol_nombre}`}
                className="max-md:size-11 max-md:flex-none"
                onClick={() => setToDelete(row)}
              >
                <Icon icon="mdi:delete-outline" className="size-5 text-danger-ink" aria-hidden="true" />
              </Button>
            )}
          </>
        );
      },
    },
  ];

  const confirmDelete = () =>
    deleteRole.mutate(toDelete.rol_id, {
      onSuccess: (response) => toast.success(response.data.message),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible eliminar el rol.')),
      onSettled: () => setToDelete(null),
    });

  return (
    <LayoutDashboard title="Roles y permisos">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Roles"
          description="Los roles globales los administra el super administrador; los de tu laboratorio los puedes crear y editar."
          actions={
            can('roles:create') && (
              <Button onClick={() => setEditor({ readOnly: false })}>
                <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
                Nuevo rol
              </Button>
            )
          }
        />
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar los roles.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            getRowKey={(row) => row.rol_id}
            caption="Roles"
            searchPlaceholder="Buscar rol o laboratorio"
            emptyMessage="No hay roles. Crea el primero con «Nuevo rol»."
          />
        )}
      </Panel>

      <RoleEditorDialog open={Boolean(editor)} onClose={() => setEditor(null)} role={editor?.role} readOnly={editor?.readOnly} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Eliminar el rol ${toDelete?.rol_nombre ?? ''}`}
        message={
          toDelete?.users_count
            ? `Tiene ${toDelete.users_count} ${toDelete.users_count === 1 ? 'usuario asignado' : 'usuarios asignados'}: cámbialos de rol antes de eliminarlo.`
            : 'El rol se elimina definitivamente.'
        }
        confirmLabel="Eliminar rol"
        loading={deleteRole.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </LayoutDashboard>
  );
}
