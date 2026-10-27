import { useCallback } from 'react';
import { useAuthStore } from './authStore';
import { can as canUser } from '../lib/permissions';

/**
 * Permisos del usuario de la sesión
 * @returns {{ can: (permission: string) => boolean, isSystem: boolean }}
 */
export function usePermissions() {
  const { user } = useAuthStore();
  const can = useCallback((permission) => canUser(user, permission), [user]);
  return { can, isSystem: Boolean(user?.role?.rol_is_system) };
}
