import React, { useState, useEffect } from 'react';
import {
  EnterpriseNavbar,
  EnterpriseViewMode,
} from './components/enterprise/EnterpriseNavbar';
import { OperatorConsole } from './components/enterprise/OperatorConsole';
import { TenantManagementView } from './components/phase1/TenantManagementView';
import { StandalonePosApp } from './components/pos/StandalonePosApp';
import { StandaloneKdsApp } from './components/kds/StandaloneKdsApp';
import { BranchStaffView } from './components/merchant/BranchStaffView';
import { AuditComplianceView } from './components/enterprise/AuditComplianceView';
import { DynamicStorefrontPage } from './components/storefront/DynamicStorefrontPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { canAccessErpView, getDefaultErpView, isCashier, isKitchenStaff } from './access/roleAccess';
import { Flame } from 'lucide-react';

type StandaloneRoute = 'erp' | 'pos' | 'kds' | 'store';

interface AppRouteState {
  route: StandaloneRoute;
  storeSlug: string | null;
}

const getInitialAppRoute = (): AppRouteState => {
  if (typeof window === 'undefined') return { route: 'erp', storeSlug: null };
  const path = window.location.pathname.toLowerCase();

  if (path === '/pos' || path.startsWith('/pos/')) {
    return { route: 'pos', storeSlug: null };
  }
  if (path === '/kds' || path.startsWith('/kds/')) {
    return { route: 'kds', storeSlug: null };
  }
  if (path.startsWith('/store/')) {
    const slug = path.replace('/store/', '').split('/')[0].trim();
    return { route: 'store', storeSlug: slug || null };
  }
  return { route: 'erp', storeSlug: null };
};

function EnterpriseAppContent() {
  const { tenant, user, isLoading, error, login, logout } = useAuth();
  const [viewMode, setViewMode] = useState<EnterpriseViewMode>('landing');
  const [routeState, setRouteState] = useState<AppRouteState>(getInitialAppRoute());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erpTheme, setErpTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('erp_theme') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    localStorage.setItem('erp_theme', erpTheme);
  }, [erpTheme]);

  useEffect(() => {
    const handlePopState = () => {
      setRouteState(getInitialAppRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setRouteState(getInitialAppRoute());
  };

  useEffect(() => {
    if (!user || isLoading) return;

    if (routeState.route === 'erp') {
      if (isCashier(user)) {
        navigateTo('/pos');
      } else if (isKitchenStaff(user)) {
        navigateTo('/kds');
      } else if (!canAccessErpView(user, viewMode)) {
        setViewMode(getDefaultErpView(user));
      }
    }
  }, [user, isLoading, routeState.route, viewMode]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    await login(email, password);
  };

  if (routeState.route === 'store' && routeState.storeSlug) {
    return (
      <DynamicStorefrontPage
        slug={routeState.storeSlug}
        onBackToAdmin={() => navigateTo('/')}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p className="text-sm text-stone-400">Loading your workspace…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="erp-shell min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-stone-950">
              <Flame className="w-5 h-5 fill-stone-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sign in to indolj.ERP</h1>
              <p className="text-xs text-stone-400">Your assigned role determines your workspace.</p>
            </div>
          </div>
          <label className="block space-y-2 text-sm text-stone-300">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
            />
          </label>
          <label className="block space-y-2 text-sm text-stone-300">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-300">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-400 py-2.5 font-bold text-stone-950 hover:bg-emerald-300"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  // 1. STANDALONE POS APP (/pos) - Runs directly on Cashier touch screens without ERP navbars
  if (routeState.route === 'pos' || (routeState.route === 'erp' && isCashier(user))) {
    return isCashier(user) ? (
      <StandalonePosApp />
    ) : (
      <RestrictedWorkspace onReturn={() => navigateTo('/')} />
    );
  }

  // 2. STANDALONE KDS APP (/kds) - Runs directly on Kitchen monitors & tablets without billing/ERP
  if (routeState.route === 'kds' || (routeState.route === 'erp' && isKitchenStaff(user))) {
    return isKitchenStaff(user) ? (
      <StandaloneKdsApp />
    ) : (
      <RestrictedWorkspace onReturn={() => navigateTo('/')} />
    );
  }

  // 4. CLOUD RESTAURANT ERP BACKOFFICE (Web-based management portal)

  return (
    <div data-theme={erpTheme} className="erp-shell min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Main Enterprise Navbar */}
      <EnterpriseNavbar
        viewMode={viewMode}
        theme={erpTheme}
        onThemeChange={setErpTheme}
        onSelectViewMode={(mode) => {
          if (mode === 'storefront') {
            navigateTo('/store/' + (tenant?.slug || 'mehmaan'));
          } else if (mode === 'landing') {
            setViewMode(getDefaultErpView(user));
          } else if (canAccessErpView(user, mode)) {
            setViewMode(mode);
          } else {
            setViewMode(getDefaultErpView(user));
          }
        }}
      />

      {/* ERP workspace routes */}
      <main className="flex-1 flex flex-col">
        {canAccessErpView(user, viewMode) && viewMode === 'merchant' && (
          <OperatorConsole
            onOpenStorefront={() => navigateTo('/store/' + (tenant?.slug || 'mehmaan'))}
            permissions={user.permissions}
          />
        )}

        {canAccessErpView(user, viewMode) && viewMode === 'branches' && <BranchStaffView />}

        {canAccessErpView(user, viewMode) && viewMode === 'superadmin' && (
          <TenantManagementView onOpenStorefront={(slug) => navigateTo('/store/' + slug)} />
        )}

        {canAccessErpView(user, viewMode) && viewMode === 'audit' && <AuditComplianceView />}

        {(viewMode === 'landing' || (!['storefront'].includes(viewMode) && !canAccessErpView(user, viewMode))) && (
          <RestrictedWorkspace
            onReturn={viewMode === 'landing' ? logout : () => setViewMode(getDefaultErpView(user))}
          />
        )}
      </main>

    </div>
  );
}

const RestrictedWorkspace: React.FC<{ onReturn: () => void }> = ({ onReturn }) => (
  <div className="erp-shell min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-4">
    <div className="max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-8 text-center space-y-4">
      <h1 className="text-xl font-bold text-white">Workspace not available</h1>
      <p className="text-sm text-stone-400">
        This screen is not included in the workspace assigned to your role.
      </p>
      <button
        onClick={onReturn}
        className="rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-stone-950 hover:bg-emerald-300"
      >
        Return to my workspace
      </button>
    </div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EnterpriseAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
