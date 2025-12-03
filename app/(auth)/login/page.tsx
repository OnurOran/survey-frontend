'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

/**
 * Login Page - Metro Istanbul Branded
 */
export default function LoginPage() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect after authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Small delay to ensure state is fully propagated
      const timer = setTimeout(() => {
        // Redirect to returnUrl if provided, otherwise to admin
        router.push(returnUrl || '/admin');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ username, password });
      // Redirect will happen automatically via the useEffect above
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <Card className="shadow-2xl border-0">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-slate-800">
          Sistem Girişi
        </CardTitle>
        <p className="text-sm text-slate-600">
          Anket yönetim sistemine giriş yapın
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-700 font-medium">
              Kullanıcı Adı
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Kullanıcı adınızı girin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-medium">
              Şifre
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            style={{
              backgroundColor: '#0055a5',
              color: 'white'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Test kullanıcısı: <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">admin</code> / <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">Passw0rd!</code>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
