'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useGlobalStats, useDepartmentStats } from '@/src/features/dashboard/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { isSuperAdmin } from '@/src/lib/permissions';

/**
 * Admin Dashboard - Metro Istanbul
 * Protected by AdminGuard in the layout
 * For Super Admin only
 */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user ? isSuperAdmin(user) : false;

  const {
    data: globalStats,
    isLoading: globalLoading,
  } = useGlobalStats({ enabled: isAdmin });

  const {
    data: departmentStats,
    isLoading: departmentLoading,
  } = useDepartmentStats({ enabled: !isAdmin });

  const stats = isAdmin ? globalStats : departmentStats;
  const isLoading = isAdmin ? globalLoading : departmentLoading;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {isAdmin ? 'Yönetim Paneli' : 'Departman Paneli'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isAdmin
                ? `Hoş geldiniz, ${user?.username || 'Admin'}!`
                : `Departman özetiniz hazır, ${user?.username || 'Kullanıcı'}.`}
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
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-slate-600">
                  {isAdmin ? 'Toplam Anket' : 'Departman Anketleri'}
                </p>
                {isLoading ? (
                  <p className="text-3xl font-bold text-slate-400 mt-2">...</p>
                ) : (
                  <p className="text-3xl font-bold text-slate-800 mt-2">{stats?.totalSurveys ?? 0}</p>
                )}
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-slate-600">
                  {isAdmin ? 'Aktif Anket' : 'Aktif Departman Anketleri'}
                </p>
                {isLoading ? (
                  <p className="text-3xl font-bold text-slate-400 mt-2">...</p>
                ) : (
                  <p className="text-3xl font-bold text-green-700 mt-2">{stats?.activeSurveys ?? 0}</p>
                )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-slate-600">
                  {isAdmin ? 'Toplam Katılım' : 'Departman Katılımları'}
                </p>
                {isLoading ? (
                  <p className="text-3xl font-bold text-slate-400 mt-2">...</p>
                ) : (
                  <p className="text-3xl font-bold text-purple-700 mt-2">{stats?.totalParticipations ?? 0}</p>
                )}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow border-blue-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <CardTitle className="text-slate-800">Anketler</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {isAdmin
                  ? 'Anketleri oluşturun, düzenleyin ve yayınlayın'
                  : 'Departman anketlerinizi yönetin'}
              </p>
              <Button
                className="w-full"
                style={{ backgroundColor: '#0055a5' }}
                onClick={() => router.push('/surveys')}
              >
                Anketleri Görüntüle
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-blue-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <CardTitle className="text-slate-800">Rol Yönetimi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Kullanıcı rolleri ve yetkilerini yönetin
              </p>
              <Button
                className="w-full"
                style={{ backgroundColor: '#0055a5' }}
                onClick={() => router.push('/admin/role-management')}
              >
                Rol Yönetimine Git
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-blue-100">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-slate-800">{isAdmin ? 'Raporlar' : 'Katılım Özeti'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                {isAdmin
                  ? 'Anket sonuçlarını görüntüleyin ve analiz edin'
                  : 'Departman katılımlarını izleyin'}
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/surveys')}
              >
                Daha Fazla Gör
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Kullanıcı Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-1">Kullanıcı ID</p>
                <p className="text-sm font-mono text-slate-800">{user?.userId}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-1">Kullanıcı Adı</p>
                <p className="text-sm text-slate-800">{user?.username || 'N/A'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-1">Yetkiler</p>
                <p className="text-sm text-slate-800">
                  {user?.isSuperAdmin ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                      ⭐ Süper Admin
                    </span>
                  ) : user?.permissions && user.permissions.length > 0 ? (
                    user.permissions.join(', ')
                  ) : (
                    'Yetki atanmamış'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
