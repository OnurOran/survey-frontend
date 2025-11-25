import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Metro Istanbul Survey',
  description: 'Login to Metro Istanbul survey management system',
};

/**
 * Auth Layout
 * Metro Istanbul branded authentication layout
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0055a5 0%, #003d7a 100%)' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold">METRO İSTANBUL</h1>
            <div className="h-1 w-24 bg-red-600"></div>
          </div>
          <p className="text-xl text-blue-100">
            Anket Yönetim Sistemi
          </p>
          <p className="text-blue-200">
            Metro İstanbul personel ve müşteri memnuniyet anketleri için güvenli platform
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">METRO İSTANBUL</h1>
            <div className="h-1 w-20 bg-red-600 mx-auto mt-2"></div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
