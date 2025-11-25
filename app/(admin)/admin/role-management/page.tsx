'use client';

import { useState } from 'react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useDepartments } from '@/src/features/management/hooks/useDepartments';
import { useDepartmentUsers } from '@/src/features/management/hooks/useDepartmentUsers';
import { useRoles } from '@/src/features/management/hooks/useRoles';
import { useAssignRole } from '@/src/features/management/hooks/useAssignRole';
import { useRemoveRole } from '@/src/features/management/hooks/useRemoveRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Select } from '@/src/components/ui/select';

/**
 * Role Management Page
 * - Super Admin: Sees all departments and can assign roles to anyone
 * - Manager: Sees only their department and can assign roles to their team
 */
export default function RoleManagementPage() {
  const { user } = useAuth();

  // Only fetch all departments if user is Super Admin
  // Managers don't have permission for this endpoint
  const { data: departments, isLoading: loadingDepartments } = useDepartments();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  // For Super Admin: allow department selection
  // For Manager: use their department ID directly
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    user?.isSuperAdmin ? null : (user?.departmentId || null)
  );

  const { data: users, isLoading: loadingUsers } = useDepartmentUsers(
    selectedDepartment || undefined
  );

  // Auto-select first department for Super Admin
  if (user?.isSuperAdmin && !selectedDepartment && departments && departments.length > 0) {
    setSelectedDepartment(departments[0].id);
  }

  const handleAssignRole = async (userId: string, roleId: string) => {
    await assignRole.mutateAsync({ userId, roleId });
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    await removeRole.mutateAsync({ userId, roleId });
  };

  // Only wait for departments if Super Admin
  const isInitialLoading = user?.isSuperAdmin
    ? (loadingDepartments || loadingRoles)
    : loadingRoles;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Rol Yönetimi</h1>
          <p className="text-slate-600 mt-1">
            Kullanıcılara rol atayın ve yetkilendirin
          </p>
        </div>

        {/* Department Selector - Only for Super Admin */}
        {user?.isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Departman Seçin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {departments?.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDepartment(dept.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedDepartment === dept.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-800">{dept.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{dept.externalIdentifier}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        {selectedDepartment && (
          <Card>
            <CardHeader>
              <CardTitle>
                {user?.isSuperAdmin
                  ? `Kullanıcılar - ${departments?.find((d) => d.id === selectedDepartment)?.name || 'Departman'}`
                  : 'Departman Kullanıcıları'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                  <p className="mt-2 text-sm text-slate-600">Kullanıcılar yükleniyor...</p>
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{user.username}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Current Roles */}
                        <div className="flex flex-wrap gap-2">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((roleName) => {
                              const roleObj = roles?.find((r) => r.name === roleName);
                              return (
                                <div
                                  key={roleName}
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                                >
                                  <span>{roleName}</span>
                                  {roleObj && (
                                    <button
                                      onClick={() => handleRemoveRole(user.id, roleObj.id)}
                                      disabled={removeRole.isPending}
                                      className="hover:text-red-600"
                                      title="Rolü kaldır"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-sm text-slate-400 italic">Rol yok</span>
                          )}
                        </div>

                        {/* Assign Role Dropdown */}
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignRole(user.id, e.target.value);
                              e.target.value = ''; // Reset
                            }
                          }}
                          disabled={assignRole.isPending}
                          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">+ Rol Ekle</option>
                          {roles
                            ?.filter((role) => !user.roles?.includes(role.name))
                            .map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>Bu departmanda kullanıcı bulunamadı</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
  );
}
