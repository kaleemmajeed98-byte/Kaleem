import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  primaryBranchId?: string;
}

export interface AuthTenant {
  id: string;
  name: string;
  slug: string;
  legalBusinessName: string;
  taxIdentifier: string;
  currency: string;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  subscriptionTier: 'starter' | 'growth' | 'enterprise';
  maxBranches: number;
  maxTerminals: number;
  monthlyGmv: number;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  logoInitial: string;
  primaryColor: string;
  branchCount?: number;
  userCount?: number;
}

export interface AuthBranch {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  deliveryRadiusKm: number;
  minOrderAmount: number;
  standardDeliveryFee: number;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  branches: AuthBranch[];
  activeBranch: AuthBranch | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  pinLogin: (pin: string) => Promise<boolean>;
  logout: () => void;
  switchBranch: (branch: AuthBranch) => void;
  switchTenantContext: (tenantId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<AuthTenant | null>(null);
  const [branches, setBranches] = useState<AuthBranch[]>([]);
  const [activeBranch, setActiveBranch] = useState<AuthBranch | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('eros_jwt_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (authToken: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setTenant(data.data.tenant);
        setBranches(data.data.branches || []);
        if (data.data.branches && data.data.branches.length > 0) {
          const defaultBranch =
            data.data.branches.find((b: AuthBranch) => b.id === data.data.user.primaryBranchId) ||
            data.data.branches[0];
          setActiveBranch(defaultBranch);
        } else {
          setActiveBranch(null);
        }
        setError(null);
      } else {
        // Token invalid
        localStorage.removeItem('eros_jwt_token');
        setToken(null);
        setUser(null);
      }
    } catch (e: any) {
      console.error('[AuthContext] Profile fetch error:', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error?.message || 'Login failed');
        return false;
      }

      const { token: newToken, user: newUser, tenant: newTenant, branches: newBranches } = result.data;
      localStorage.setItem('eros_jwt_token', newToken);
      setToken(newToken);
      setUser(newUser);
      setTenant(newTenant);
      setBranches(newBranches || []);
      if (newBranches && newBranches.length > 0) {
        setActiveBranch(newBranches[0]);
      }
      return true;
    } catch (e: any) {
      setError(e.message || 'Network error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const pinLogin = async (pin: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/v1/auth/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, tenantId: tenant?.id }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error?.message || 'PIN Authentication Failed');
        return false;
      }

      const { token: newToken, user: newUser, tenant: newTenant, branches: newBranches } = result.data;
      localStorage.setItem('eros_jwt_token', newToken);
      setToken(newToken);
      setUser(newUser);
      setTenant(newTenant);
      setBranches(newBranches || []);
      if (newBranches && newBranches.length > 0) {
        setActiveBranch(newBranches[0]);
      }
      return true;
    } catch (e: any) {
      setError(e.message || 'Network error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenantContext = async (tenantId: string) => {
    if (user?.role === 'PLATFORM_SUPER_ADMIN') {
      // Super admin viewing a tenant
      const res = await fetch('/api/v1/tenants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const targetTenant = (data.data || []).find((t: AuthTenant) => t.id === tenantId);
      if (targetTenant) {
        setTenant(targetTenant);
        // Load branches for this tenant
        const bRes = await fetch(`/api/v1/branches?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bData = await bRes.json();
        setBranches(bData.data || []);
        if (bData.data && bData.data.length > 0) {
          setActiveBranch(bData.data[0]);
        } else {
          setActiveBranch(null);
        }
      }
    }
  };

  const switchBranch = (branch: AuthBranch) => {
    setActiveBranch(branch);
  };

  const logout = () => {
    localStorage.removeItem('eros_jwt_token');
    setToken(null);
    setUser(null);
    setTenant(null);
    setBranches([]);
    setActiveBranch(null);
    setError(null);
  };

  const refreshProfile = async () => {
    if (token) await fetchProfile(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        branches,
        activeBranch,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        pinLogin,
        logout,
        switchBranch,
        switchTenantContext,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
