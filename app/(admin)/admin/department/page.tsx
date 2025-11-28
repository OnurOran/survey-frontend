'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useDepartmentStats } from '@/src/features/dashboard/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { isSuperAdmin } from '@/src/lib/permissions';
import { useEffect } from 'react';

/**
 * Department Dashboard - For Managers
 * Shows department-specific stats and information
 * Super Admins are redirected to /admin instead
 */
export default function DepartmentDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: stats, isLoading } = useDepartmentStats();

  // Redirect Super Admins to main admin dashboard
  useEffect(() => {
    if (user && isSuperAdmin(user)) {
      router.replace('/admin');
    }
  }, [user, router]);

  // Don't render for Super Admins
  if (user && isSuperAdmin(user)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Departman Paneli</h1>
          <p className="text-slate-600 mt-1">
            Hoş geldiniz, {user?.username}!
          </p>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Çıkış Yap
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Anket</CardTitle>
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-slate-400">...</div>
            ) : (
              <div className="text-2xl font-bold text-slate-800">{stats?.totalSurveys ?? 0}</div>
            )}
            <p className="text-xs text-slate-600 mt-1">
              Departmanınızdaki tüm anketler
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Anketler</CardTitle>
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-slate-400">...</div>
            ) : (
              <div className="text-2xl font-bold text-green-700">{stats?.activeSurveys ?? 0}</div>
            )}
            <p className="text-xs text-slate-600 mt-1">
              Şu anda yanıtlanabilir anketler
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Katılım</CardTitle>
            <svg
              className="w-4 h-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-slate-400">...</div>
            ) : (
              <div className="text-2xl font-bold text-orange-700">{stats?.totalParticipations ?? 0}</div>
            )}
            <p className="text-xs text-slate-600 mt-1">
              Toplam anket yanıtı sayısı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Erişim</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow border-blue-100">
            <CardHeader>
              <CardTitle className="text-lg">Rol Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Departman kullanıcılarına rol atayın
              </p>
              <Button
                className="w-full"
                style={{ backgroundColor: '#0055a5' }}
                onClick={() => router.push('/admin/role-management')}
              >
                Rolleri Yönet
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-slate-100">
            <CardHeader>
              <CardTitle className="text-lg">Kullanıcı Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Kullanıcı Adı:</span>
                <span className="font-medium text-slate-800">{user?.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Rol:</span>
                <span className="font-medium text-slate-800">Departman Yöneticisi</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Yetkilendirmeler:</span>
                <span className="font-medium text-slate-800">
                  {user?.permissions && user.permissions.length > 0
                    ? user.permissions.join(', ')
                    : 'Yetki atanmamış'}
                </span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
