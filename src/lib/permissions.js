// Permisos de la sesión: { modulo: { view, create, update, delete } } (vienen de /auth/me)
// Ocultar un botón es solo comodidad: el backend valida cada permiso.

/**
 * Indica si el usuario puede hacer la acción en el módulo
 * @param {object} user usuario de la sesión
 * @param {string} permission "modulo:accion" (por ejemplo "orders:create"); sin acción es "view"
 */
export function can(user, permission) {
  const [module, action = 'view'] = permission.split(':');
  return Boolean(user?.permissions?.[module]?.[action]);
}

/**
 * Indica si tiene alguno de los permisos
 * @param {object} user usuario de la sesión
 * @param {string[]} permissions lista de "modulo:accion"
 */
export function canAny(user, permissions) {
  return permissions.some((permission) => can(user, permission));
}

/**
 * Primera opción del menú del usuario (para enviarlo a una pantalla que sí puede ver)
 */
export function firstMenuUrl(menus = []) {
  for (const menu of menus) {
    if (menu.men_url) return menu.men_url;
    const child = firstMenuUrl(menu.children);
    if (child) return child;
  }
  return null;
}
