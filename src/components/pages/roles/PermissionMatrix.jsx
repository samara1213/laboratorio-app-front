import { Checkbox } from '@/components/ui/checkbox';

const ACTIONS = [
  { key: 'view', label: 'Ver' },
  { key: 'create', label: 'Crear' },
  { key: 'update', label: 'Editar' },
  { key: 'delete', label: 'Eliminar' },
];

/**
 * Aplica un cambio respetando las reglas: crear, editar o eliminar exigen "ver";
 * quitar "ver" quita todo
 */
export function togglePermission(value, module, action, checked) {
  const current = value[module] ?? { view: false, create: false, update: false, delete: false };
  const next = { ...current, [action]: checked };
  if (action === 'view' && !checked) Object.assign(next, { create: false, update: false, delete: false });
  if (action !== 'view' && checked) next.view = true;
  return { ...value, [module]: next };
}

/**
 * Matriz de permisos por módulo. En tablet y escritorio es una tabla (módulo × acción);
 * en celular, una tarjeta por módulo con sus casillas
 * @param {{ modules: object[], value: Record<string, Record<string, boolean>>, onChange?: (value) => void,
 *   canGrant?: (permission: string) => boolean, readOnly?: boolean }} props
 */
export default function PermissionMatrix({ modules, value, onChange, canGrant = () => true, readOnly = false }) {
  return (
    <div role="group" aria-label="Permisos por módulo" className="flex flex-col rounded-panel border border-border">
      <div className="hidden border-b border-border bg-ground px-4 py-2 text-sm font-semibold text-muted md:grid md:grid-cols-[1fr_repeat(4,5.5rem)] md:items-center">
        <span>Módulo</span>
        {ACTIONS.map((action) => (
          <span key={action.key} className="text-center">
            {action.label}
          </span>
        ))}
      </div>
      {modules.map((module) => (
        <div
          key={module.mod_slug}
          className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0 md:grid md:grid-cols-[1fr_repeat(4,5.5rem)] md:items-center md:gap-0 md:py-1.5"
        >
          <div className="flex flex-col">
            <span className="font-semibold">{module.mod_name}</span>
            {module.mod_description && <span className="text-sm text-muted">{module.mod_description}</span>}
          </div>
          <div className="grid grid-cols-2 gap-x-3 sm:grid-cols-4 md:contents">
            {ACTIONS.map((action) => {
              // la acción no aplica al módulo (por ejemplo, eliminar resultados)
              if (!module.mod_actions?.includes(action.key)) {
                return (
                  <span key={action.key} className="hidden text-center text-muted md:block" aria-hidden="true">
                    —
                  </span>
                );
              }
              const permission = `${module.mod_slug}:${action.key}`;
              const allowed = canGrant(permission);
              return (
                <Checkbox
                  key={action.key}
                  checked={Boolean(value[module.mod_slug]?.[action.key])}
                  disabled={readOnly || !allowed}
                  onChange={(checked) => onChange?.(togglePermission(value, module.mod_slug, action.key, checked))}
                  label={action.label}
                  aria-label={`${action.label} ${module.mod_name}`}
                  title={allowed ? undefined : 'No tienes este permiso, así que no lo puedes conceder'}
                  className="justify-start md:justify-center [&>span]:md:sr-only"
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
