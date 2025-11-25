/**
 * Permission constants and utilities
 * Matches the backend permission system
 */

// Permission names from backend
export const PERMISSIONS = {
  MANAGE_USERS: 'ManageUsers', // Super Admin - full access
  MANAGE_DEPARTMENT: 'ManageDepartment', // Manager - department-level access
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  permission: Permission
): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: string[] | undefined,
  permissions: Permission[]
): boolean {
  if (!userPermissions) return false;
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: string[] | undefined,
  permissions: Permission[]
): boolean {
  if (!userPermissions) return false;
  return permissions.every((p) => userPermissions.includes(p));
}

/**
 * Check if user is Super Admin (has ManageUsers permission)
 */
export function isSuperAdmin(user: { isSuperAdmin?: boolean; permissions?: string[] }): boolean {
  return user.isSuperAdmin === true || hasPermission(user.permissions, PERMISSIONS.MANAGE_USERS);
}

/**
 * Check if user is Manager (has ManageDepartment permission but not ManageUsers)
 */
export function isManager(user: { isSuperAdmin?: boolean; permissions?: string[] }): boolean {
  return !isSuperAdmin(user) && hasPermission(user.permissions, PERMISSIONS.MANAGE_DEPARTMENT);
}
