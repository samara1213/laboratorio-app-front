import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeUserStatusDB,
  createMenuDB,
  createRoleDB,
  createUserDB,
  deleteMenuDB,
  deleteRoleDB,
  getAllLaboratoriesDB,
  getAllMenusDB,
  getAllRolesDB,
  getAllUsersDB,
  getRoleModulesDB,
  moveMenuDB,
  resetUserPasswordDB,
  updateMenuDB,
  updateRoleDB,
  updateUserDB,
} from '../../services';
import { sessionKey } from './useSession';

// datos de administración: usuarios, roles, módulos, menús y laboratorios
export const adminKeys = {
  users: (labId) => ['admin', 'users', labId ?? 'propio'],
  roles: (labId) => ['admin', 'roles', labId ?? 'propio'],
  modules: ['admin', 'modules'],
  menus: ['admin', 'menus'],
  laboratories: ['admin', 'laboratories'],
};

const dataOf = (response) => response.data.data ?? [];

/**
 * Usuarios del laboratorio (el super administrador puede indicar otro)
 */
export function useUsers(labId) {
  return useQuery({ queryKey: adminKeys.users(labId), queryFn: async () => dataOf(await getAllUsersDB(labId)) });
}

/**
 * Roles visibles; con `assignable` cada uno indica si se puede asignar en ese laboratorio
 */
export function useRoles(labId, { enabled = true } = {}) {
  return useQuery({ queryKey: adminKeys.roles(labId), enabled, queryFn: async () => dataOf(await getAllRolesDB(labId)) });
}

export function useRoleModules() {
  return useQuery({ queryKey: adminKeys.modules, staleTime: 10 * 60_000, queryFn: async () => dataOf(await getRoleModulesDB()) });
}

export function useMenus() {
  return useQuery({ queryKey: adminKeys.menus, queryFn: async () => dataOf(await getAllMenusDB()) });
}

/**
 * Laboratorios (solo el super administrador; para elegir a cuál administrar)
 */
export function useLaboratories({ enabled = true } = {}) {
  return useQuery({ queryKey: adminKeys.laboratories, enabled, staleTime: 5 * 60_000, queryFn: async () => dataOf(await getAllLaboratoriesDB()) });
}

/**
 * Mutación que al terminar refresca las consultas indicadas (por prefijo)
 */
function useAdminMutation(mutationFn, invalidate) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}

export const useSaveUser = () =>
  useAdminMutation(({ id, data }) => (id ? updateUserDB(id, data) : createUserDB(data)), [['admin', 'users'], ['admin', 'roles']]);

export const useChangeUserStatus = () => useAdminMutation(({ id, status }) => changeUserStatusDB(id, status), [['admin', 'users']]);

export const useResetUserPassword = () => useAdminMutation((id) => resetUserPasswordDB(id), [['admin', 'users']]);

// un cambio de roles puede cambiar los permisos de la sesión actual
export const useSaveRole = () =>
  useAdminMutation(({ id, data }) => (id ? updateRoleDB(id, data) : createRoleDB(data)), [['admin', 'roles'], sessionKey]);

export const useDeleteRole = () => useAdminMutation((id) => deleteRoleDB(id), [['admin', 'roles']]);

// los cambios del menú se ven en la barra lateral: también se refresca la sesión
export const useSaveMenu = () =>
  useAdminMutation(({ id, data }) => (id ? updateMenuDB(id, data) : createMenuDB(data)), [adminKeys.menus, sessionKey]);

export const useMoveMenu = () => useAdminMutation(({ id, direction }) => moveMenuDB(id, direction), [adminKeys.menus, sessionKey]);

export const useDeleteMenu = () => useAdminMutation((id) => deleteMenuDB(id), [adminKeys.menus, sessionKey]);
