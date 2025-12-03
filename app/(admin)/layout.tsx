'use client';

import { AdminGuard } from '@/src/features/auth/components/AdminGuard';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { isSuperAdmin } from '@/src/lib/permissions';

/**
 * Admin Layout - Metro Istanbul Branded
 * Protected by AdminGuard - only accessible to users with roles/permissions
 * Navigation adapts based on user permissions
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const isAdmin = user && isSuperAdmin(user);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200" style={{ backgroundColor: '#0055a5' }}>
          <div>
            <h2 className="text-white font-bold text-lg">METRO İSTANBUL</h2>
            <div className="h-0.5 w-16 bg-red-600 mt-1"></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {/* Kontrol Paneli - Everyone sees this */}
          <a
            href="/dashboard"
            className="flex items-center px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kontrol Paneli
          </a>

          {/* Surveys - Everyone sees this */}
          <a
            href="/surveys"
            className="flex items-center px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Anketler
          </a>

          {/* Role Management - Everyone sees this */}
          <a
            href="/admin/role-management"
            className="flex items-center px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Rol Yönetimi
          </a>

          {/* Departments - Super Admin only */}
          {isAdmin && (
            <a
              href="#"
              className="flex items-center px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Departmanlar
            </a>
          )}

          {/* Reports - Super Admin only */}
          {isAdmin && (
            <a
              href="#"
              className="flex items-center px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Raporlar
            </a>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-slate-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium mt-4 border-t border-slate-200 pt-4"
            type="button"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
            </svg>
            Çıkış Yap
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-800">Anket Yönetim Sistemi</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Hoş geldiniz!</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
    </AdminGuard>
  );
}
