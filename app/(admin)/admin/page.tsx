'use client';

import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

/**
 * Admin Dashboard - Metro Istanbul
 */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Yönetim Paneli</h1>
            <p className="text-slate-600 mt-1">
              Hoş geldiniz, {user?.username || 'Admin'}!
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Toplam Anket</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">24</p>
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
                  <p className="text-sm font-medium text-slate-600">Aktif Anket</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">8</p>
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
                  <p className="text-sm font-medium text-slate-600">Katılımcı</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">1,247</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-600">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Departman</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">12</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                Anketleri oluşturun, düzenleyin ve yayınlayın
              </p>
              <Button
                className="w-full"
                style={{ backgroundColor: '#0055a5' }}
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
                <CardTitle className="text-slate-800">Kullanıcılar</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Kullanıcıları ve rollerini yönetin
              </p>
              <Button
                className="w-full"
                style={{ backgroundColor: '#0055a5' }}
              >
                Kullanıcıları Yönet
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
                <CardTitle className="text-slate-800">Raporlar</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Anket sonuçlarını görüntüleyin ve analiz edin
              </p>
              <Button
                className="w-full"
                style={{ backgroundColor: '#0055a5' }}
              >
                Raporları Görüntüle
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
    </ProtectedRoute>
  );
}
