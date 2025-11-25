'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * AdminGuard - Protects admin routes by checking if user has roles/permissions
 * Users without any roles are redirected to /no-access (outside admin area)
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }

    // Check if user has any permissions
    const hasPermissions = user.isSuperAdmin || (user.permissions && user.permissions.length > 0);

    // If user doesn't have permissions, redirect them out of admin area
    if (!hasPermissions) {
      router.replace('/no-access');
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Check permissions
  const hasPermissions = user.isSuperAdmin || (user.permissions && user.permissions.length > 0);

  // If user doesn't have permissions, don't render admin content
  if (!hasPermissions) {
    return null;
  }

  // User has permissions, render the protected admin content
  return <>{children}</>;
}
