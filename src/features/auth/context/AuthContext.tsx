'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { tokenManager } from '@/src/lib/api';
import { AuthTokensDto, AuthTestResponse, LoginRequest } from '@/src/types';
import { logError, parseApiError } from '@/src/lib/errors';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

interface User {
  userId: string;
  username: string;
  permissions: string[];
  isSuperAdmin: boolean;
  departmentId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  /**
   * Extract user info from auth test response
   * Backend uses .NET claim types, not simple names
   */
  const extractUserFromClaims = useCallback((response: AuthTestResponse): User | null => {
    console.log('🔍 Auth Test Response:', response);

    if (!response.isAuthenticated) {
      console.log('❌ Not authenticated');
      return null;
    }

    const claims = response.claims;
    console.log('📋 All Claims:', claims);

    // Backend uses .NET standard claim type for nameidentifier
    const userIdClaim = claims.find(
      (c) => c.type === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
    );

    // Backend uses simple "username" claim
    const usernameClaim = claims.find((c) => c.type === 'username');

    // Backend stores permissions as JSON array string, not role claims
    const permissionsClaim = claims.find((c) => c.type === 'permissions');

    // Backend has isSuperAdmin flag
    const isSuperAdminClaim = claims.find((c) => c.type === 'isSuperAdmin');

    // Optional department ID
    const departmentIdClaim = claims.find((c) => c.type === 'departmentId');

    console.log('👤 User ID Claim:', userIdClaim);
    console.log('📛 Username Claim:', usernameClaim);
    console.log('🔑 Permissions Claim:', permissionsClaim);
    console.log('⭐ Super Admin Claim:', isSuperAdminClaim);
    console.log('🏢 Department ID Claim:', departmentIdClaim);

    if (!userIdClaim || !usernameClaim) {
      console.log('❌ Missing required claims (userId or username)');
      return null;
    }

    // Parse permissions from JSON array string
    let permissions: string[] = [];
    if (permissionsClaim?.value) {
      try {
        permissions = JSON.parse(permissionsClaim.value);
      } catch (e) {
        console.warn('Failed to parse permissions claim:', e);
      }
    }

    const user: User = {
      userId: userIdClaim.value,
      username: usernameClaim.value,
      permissions,
      isSuperAdmin: isSuperAdminClaim?.value === 'true',
      departmentId: departmentIdClaim?.value,
    };

    console.log('✅ Extracted User:', user);
    return user;
  }, []);

  /**
   * Check authentication status by calling /auth/test
   */
  const checkAuth = useCallback(async () => {
    const token = tokenManager.getAccessToken();

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<AuthTestResponse>('/auth/test');
      const userData = extractUserFromClaims(response.data);

      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        tokenManager.clearTokens();
      }
    } catch (error) {
      logError(error, 'Auth Check');
      setIsAuthenticated(false);
      setUser(null);
      tokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, [extractUserFromClaims]);

  /**
   * Login function
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        setIsLoading(true);

        const response = await apiClient.post<AuthTokensDto>('/auth/login', credentials);
        const tokens = response.data;

        // Store tokens
        tokenManager.setTokens(tokens);

        // Fetch user info and set auth state
        const authResponse = await apiClient.get<AuthTestResponse>('/auth/test');
        const userData = extractUserFromClaims(authResponse.data);

        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
          toast.success('Giriş başarılı!');
        } else {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }
      } catch (error) {
        logError(error, 'Login');
        const errorMessage = parseApiError(error);
        toast.error(errorMessage);
        tokenManager.clearTokens();
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [extractUserFromClaims]
  );

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();

      if (refreshToken) {
        // Call logout endpoint to invalidate refresh token on backend
        await apiClient.post('/auth/logout', { refreshToken }).catch((error) => {
          // Log but don't throw - we still want to clear local tokens
          logError(error, 'Logout');
        });
      }
    } finally {
      // Clear tokens and state regardless of API call success
      tokenManager.clearTokens();
      setIsAuthenticated(false);
      setUser(null);

      // Show success message
      toast.success('Logged out successfully');

      // Redirect to login page
      router.push('/auth/login');
    }
  }, [router]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Listen for logout events from the API client (e.g., when token refresh fails)
   */
  useEffect(() => {
    const handleLogout = () => {
      tokenManager.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      toast.error('Session expired. Please login again.');
      router.push('/auth/login');
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [router]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
