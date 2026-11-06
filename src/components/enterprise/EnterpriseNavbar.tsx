import React from 'react';
import {
  Building2,
  Flame,
  History,
  LayoutDashboard,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { canAccessErpView } from '../../access/roleAccess';

export type EnterpriseViewMode =
  | 'landing'
  | 'superadmin'
  | 'merchant'
  | 'branches'
  | 'audit'
  | 'storefront';

interface EnterpriseNavbarProps {
  viewMode: EnterpriseViewMode;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onSelectViewMode: (mode: EnterpriseViewMode) => void;
}

export const EnterpriseNavbar: React.FC<EnterpriseNavbarProps> = ({
  viewMode,
  theme,
  onThemeChange,
  onSelectViewMode,
}) => {
  const { user, tenant, logout } = useAuth();
  const isAuditor = user?.role === 'AUDITOR';
  const isSuperAdmin = user?.role === 'PLATFORM_SUPER_ADMIN';

  const navItems = isAuditor
    ? [{ mode: 'audit' as const, label: 'Audit log', icon: History }]
    : isSuperAdmin
      ? [
          { mode: 'merchant' as const, label: 'Overview', icon: LayoutDashboard },
          { mode: 'superadmin' as const, label: 'Tenants', icon: ShieldCheck },
          { mode: 'audit' as const, label: 'Audit log', icon: History },
        ]
      : [
          ...(canAccessErpView(user, 'merchant')
            ? [{ mode: 'merchant' as const, label: 'Overview', icon: LayoutDashboard }]
            : []),
          ...(canAccessErpView(user, 'branches')
            ? [{ mode: 'branches' as const, label: 'Branches & staff', icon: Building2 }]
            : []),
          ...(canAccessErpView(user, 'audit')
            ? [{ mode: 'audit' as const, label: 'Audit log', icon: History }]
            : []),
        ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-stone-950/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => onSelectViewMode(navItems[0]?.mode || 'landing')}
          className="flex min-w-0 items-center gap-3 text-left"
          aria-label="Go to ERP home"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Flame className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.95rem] font-bold tracking-tight text-white">
              Mehmaan<span className="text-emerald-400">.ERP</span>
            </span>
            <span className="block truncate text-[0.7rem] text-stone-400">
              {isSuperAdmin ? 'Platform workspace' : tenant?.name || 'Restaurant workspace'}
            </span>
          </span>
        </button>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto px-2" aria-label="ERP navigation">
          {navItems.map(({ mode, label, icon: Icon }) => {
            const selected = viewMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onSelectViewMode(mode)}
                aria-current={selected ? 'page' : undefined}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden max-w-36 truncate text-xs text-stone-400 xl:block">
            {user?.firstName} {user?.lastName}
          </span>
          <button
            type="button"
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-800 text-stone-300 transition-colors hover:bg-white/[0.05] hover:text-white"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-800 px-3 text-sm font-medium text-stone-300 transition-colors hover:bg-white/[0.05] hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
