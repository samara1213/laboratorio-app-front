import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import ConfirmDialog from '../../mui/ConfirmDialog';
import MenuFormDialog from './MenuFormDialog';
import { useDeleteMenu, useMenus, useMoveMenu, useRoleModules } from '../../../hooks/queries/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Panel, PanelHeader, Skeleton } from '@/components/ui/panel';
import { cn, errorMessage } from '@/lib/utils';

/**
 * Arma el árbol desde la lista plana (ya viene ordenada por men_order)
 */
function buildTree(menus) {
  const byParent = new Map();
  for (const menu of menus) {
    const key = menu.men_parent ?? 'raiz';
    byParent.set(key, [...(byParent.get(key) ?? []), menu]);
  }
  const sort = (list) => [...list].sort((a, b) => a.men_order - b.men_order || a.men_name.localeCompare(b.men_name));
  const build = (key) => sort(byParent.get(key) ?? []).map((menu) => ({ ...menu, children: build(menu.men_id) }));
  return build('raiz');
}

/**
 * Ids de una opción y todas las que contiene (no pueden ser su padre)
 */
function selfAndDescendants(node) {
  return [node.men_id, ...node.children.flatMap(selfAndDescendants)];
}

/**
 * Menús del sistema (solo super administrador): árbol de hasta 3 niveles, orden con
 * subir/bajar (sirve igual en pantallas táctiles), crear, editar y eliminar
 */
export default function MenusPage() {
  const { data: menus = [], isLoading, isError, refetch } = useMenus();
  const { data: modules = [] } = useRoleModules();
  const moveMenu = useMoveMenu();
  const deleteMenu = useDeleteMenu();
  const [form, setForm] = useState(null); // { menu?, parentId? }
  const [toDelete, setToDelete] = useState(null);

  const tree = useMemo(() => buildTree(menus), [menus]);
  const moduleNames = useMemo(() => Object.fromEntries(modules.map((m) => [m.mod_slug, m.mod_name])), [modules]);

  // posibles padres: niveles 1 y 2, sin la opción que se edita ni sus descendientes
  const parents = useMemo(() => {
    if (!form) return [];
    const excluded = new Set(form.menu ? selfAndDescendants(form.menu) : []);
    const list = [];
    const walk = (nodes) =>
      nodes.forEach((node) => {
        if (node.men_level < 3 && !excluded.has(node.men_id)) list.push(node);
        walk(node.children);
      });
    walk(tree);
    return list;
  }, [form, tree]);

  const move = (menu, direction) =>
    moveMenu.mutate({ id: menu.men_id, direction }, { onError: (error) => toast.error(errorMessage(error, 'No fue posible mover la opción.')) });

  const confirmDelete = () =>
    deleteMenu.mutate(toDelete.men_id, {
      onSuccess: (response) => toast.success(response.data.message),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible eliminar la opción.')),
      onSettled: () => setToDelete(null),
    });

  const renderNodes = (nodes, depth = 0) =>
    nodes.map((node, index) => (
      <li key={node.men_id}>
        <div className={cn('flex flex-col gap-2 border-b border-border py-3 pr-4 sm:flex-row sm:items-center sm:gap-3', !node.men_active && 'opacity-60')} style={{ paddingLeft: `${16 + depth * 24}px` }}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-ground text-muted" aria-hidden="true">
              <Icon icon={node.men_icon || (node.men_url ? 'mdi:circle-small' : 'mdi:folder-outline')} className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-semibold">{node.men_name}</span>
              <span className="truncate text-sm text-muted">{node.men_url || 'Grupo'}</span>
            </span>
            <span className="ml-auto flex flex-wrap justify-end gap-1.5 sm:ml-0">
              {node.module && <Badge tone="primary">{moduleNames[node.module] ?? node.module}</Badge>}
              {!node.men_active && <Badge>Oculta</Badge>}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:flex-nowrap">
            <Button variant="secondary" size="icon-sm" className="max-md:size-11" aria-label={`Subir ${node.men_name}`} disabled={index === 0 || moveMenu.isPending} onClick={() => move(node, 'up')}>
              <Icon icon="mdi:arrow-up" className="size-5" aria-hidden="true" />
            </Button>
            <Button variant="secondary" size="icon-sm" className="max-md:size-11" aria-label={`Bajar ${node.men_name}`} disabled={index === nodes.length - 1 || moveMenu.isPending} onClick={() => move(node, 'down')}>
              <Icon icon="mdi:arrow-down" className="size-5" aria-hidden="true" />
            </Button>
            {!node.men_url && node.men_level < 3 && (
              <Button variant="secondary" size="icon-sm" className="max-md:size-11" aria-label={`Agregar opción dentro de ${node.men_name}`} onClick={() => setForm({ parentId: node.men_id })}>
                <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
              </Button>
            )}
            <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setForm({ menu: node })}>
              Editar
            </Button>
            {node.children.length === 0 && (
              <Button variant="secondary" size="icon-sm" className="max-md:size-11" aria-label={`Eliminar ${node.men_name}`} onClick={() => setToDelete(node)}>
                <Icon icon="mdi:delete-outline" className="size-5 text-danger-ink" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
        {node.children.length > 0 && <ul>{renderNodes(node.children, depth + 1)}</ul>}
      </li>
    ));

  return (
    <LayoutDashboard title="Menús">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Opciones del menú"
          description="Cada opción se muestra a los roles que pueden ver su módulo. Los grupos aparecen si tienen alguna opción visible."
          actions={
            <Button onClick={() => setForm({})}>
              <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
              Nueva opción
            </Button>
          }
        />
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar el menú.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <ul aria-label="Árbol del menú">{renderNodes(tree)}</ul>
        )}
      </Panel>

      <MenuFormDialog open={Boolean(form)} onClose={() => setForm(null)} menu={form?.menu} parentId={form?.parentId} parents={parents} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Eliminar ${toDelete?.men_name ?? ''}`}
        message="La opción desaparece del menú de todos los roles. Para quitarla sin borrarla, edítala y desmarca «Visible en el menú»."
        confirmLabel="Eliminar opción"
        loading={deleteMenu.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </LayoutDashboard>
  );
}
