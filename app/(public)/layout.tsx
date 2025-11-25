import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anket - Metro Istanbul',
  description: 'Metro Istanbul anketine katılın',
};

/**
 * Public Layout - Metro Istanbul Branded
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm" style={{ borderTopColor: '#0055a5', borderTopWidth: '4px' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#0055a5' }}>METRO İSTANBUL</h1>
              <div className="h-0.5 w-20 bg-red-600 mt-1"></div>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-2">Anket Katılım Platformu</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-600">
            Metro Istanbul - Güvenli ve Gizli Anket Sistemi
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tüm yanıtlarınız gizli tutulur
          </p>
        </div>
      </footer>
    </div>
  );
}
