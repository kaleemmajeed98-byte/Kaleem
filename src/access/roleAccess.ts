import type { AuthUser } from '../context/AuthContext';
import type { EnterpriseViewMode } from '../components/enterprise/EnterpriseNavbar';

const hasPermission = (user: AuthUser, ...permissions: string[]) =>
  user.permissions.includes('*') ||
  permissions.some((permission) => user.permissions.includes(permission));

export const isCashier = (user: AuthUser | null) => user?.role === 'CASHIER';

export const isKitchenStaff = (user: AuthUser | null) =>
  user?.role === 'KITCHEN_STAFF';

export const canAccessErpView = (
  user: AuthUser | null,
  view: EnterpriseViewMode
): boolean => {
  if (!user || view === 'landing' || view === 'storefront') return false;
  if (user.role === 'PLATFORM_SUPER_ADMIN') return true;
  if (user.role === 'AUDITOR') return view === 'audit';
  if (isCashier(user) || isKitchenStaff(user)) return false;

  switch (view) {
    case 'merchant':
      return hasPermission(
        user,
        'tenants.manage',
        'reports.financial.view',
        'accounting.reports.export',
        'inventory.stock.view',
        'crm.customers.view'
      );
    case 'branches':
      return hasPermission(user, 'branches.view', 'branches.create', 'branches.edit', 'tenants.manage');
    case 'audit':
      return hasPermission(user, 'audit.view');
    default:
      return false;
  }
};

export const getDefaultErpView = (user: AuthUser): EnterpriseViewMode => {
  if (user.role === 'PLATFORM_SUPER_ADMIN') return 'superadmin';
  if (user.role === 'AUDITOR') return 'audit';

  const preferredViews: EnterpriseViewMode[] = ['merchant', 'branches', 'audit'];
  return preferredViews.find((view) => canAccessErpView(user, view)) ?? 'landing';
};
