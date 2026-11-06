import { Router, Response } from 'express';
import {
  dbStore,
  TenantRecord,
  BranchRecord,
  UserRecord,
  hashPassword,
  hashPin,
  isValidPassword,
  isValidPin,
} from '../db/store.js';
import {
  AuthenticatedRequest,
  requireAuth,
  requireSuperAdmin,
} from '../middleware/auth.js';

export const tenantRouter = Router();

// GET /api/v1/tenants/public/:slug (Public Storefront API - No auth required)
tenantRouter.get('/public/:slug', (req, res) => {
  const { slug } = req.params;
  const tenant = dbStore.tenants.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
  if (!tenant || tenant.status === 'suspended' || tenant.status === 'cancelled') {
    return res.status(404).json({
      success: false,
      error: { code: 'STORE_NOT_FOUND', message: `Store with slug "${slug}" not found or inactive` },
    });
  }

  const branches = dbStore.branches.filter((b) => b.tenantId === tenant.id && b.isActive);
  const categories = dbStore.categories
    .filter((c) => c.tenantId === tenant.id && c.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const menuItems = dbStore.menuItems.filter((i) => i.tenantId === tenant.id && i.isAvailable);

  res.json({
    success: true,
    data: {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        legalBusinessName: tenant.legalBusinessName,
        currency: tenant.currency,
        logoInitial: tenant.logoInitial,
        primaryColor: tenant.primaryColor,
        primaryContactPhone: tenant.primaryContactPhone,
        primaryContactEmail: tenant.primaryContactEmail,
      },
      branches,
      categories,
      menuItems,
    },
  });
});

// GET /api/v1/tenants (List tenants based on authorization scope)
tenantRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';

  if (isSuperAdmin) {
    // Super admin sees all registered restaurant companies
    const tenantsWithMetrics = dbStore.tenants.map((t) => {
      const branches = dbStore.branches.filter((b) => b.tenantId === t.id);
      const users = dbStore.users.filter((u) => u.tenantId === t.id);
      return {
        ...t,
        branchCount: branches.length,
        userCount: users.length,
      };
    });

    return res.json({
      success: true,
      data: tenantsWithMetrics,
      meta: { totalCount: tenantsWithMetrics.length },
    });
  }

  // Restaurant Owner sees only their own company
  if (!req.tenantId) {
    return res.status(403).json({
      success: false,
      error: { code: 'NO_TENANT_ASSIGNED', message: 'User is not linked to any tenant' },
    });
  }

  const tenant = dbStore.tenants.find((t) => t.id === req.tenantId);
  if (!tenant) {
    return res.status(404).json({
      success: false,
      error: { code: 'TENANT_NOT_FOUND', message: 'Tenant company not found' },
    });
  }

  const branches = dbStore.branches.filter((b) => b.tenantId === tenant.id);
  const users = dbStore.users.filter((u) => u.tenantId === tenant.id);

  res.json({
    success: true,
    data: [{ ...tenant, branchCount: branches.length, userCount: users.length }],
  });
});

// POST /api/v1/tenants (Onboard New Restaurant Company - Super Admin Only)
tenantRouter.post('/', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    slug,
    legalBusinessName,
    taxIdentifier,
    currency = 'PKR',
    subscriptionTier = 'growth',
    primaryContactName,
    primaryContactEmail,
    primaryContactPhone,
    initialBranchName,
    initialBranchCity = 'Karachi',
    initialBranchAddress,
    adminPassword,
    adminPin,
  } = req.body;

  if (
    !name ||
    !slug ||
    typeof primaryContactEmail !== 'string' ||
    !primaryContactEmail.includes('@') ||
    !isValidPassword(adminPassword) ||
    !isValidPin(adminPin)
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Name, slug, valid contact email, a password of at least 12 characters, and a 6-digit owner PIN are required',
      },
    });
  }

  if (dbStore.users.some((user) => user.email.toLowerCase() === primaryContactEmail.trim().toLowerCase())) {
    return res.status(409).json({
      success: false,
      error: { code: 'USER_EXISTS', message: 'An account with the primary contact email already exists' },
    });
  }

  // Verify unique slug
  const existingSlug = dbStore.tenants.find(
    (t) => t.slug.toLowerCase() === slug.toLowerCase()
  );
  if (existingSlug) {
    return res.status(409).json({
      success: false,
      error: { code: 'SLUG_EXISTS', message: `Tenant slug "${slug}" is already taken` },
    });
  }

  const newTenantId = `tenant-${slug.toLowerCase()}-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  // 1. Create Tenant Record
  const newTenant: TenantRecord = {
    id: newTenantId,
    name,
    slug: slug.toLowerCase(),
    legalBusinessName: legalBusinessName || name,
    taxIdentifier: taxIdentifier || 'NTN-PENDING',
    currency,
    status: 'active',
    subscriptionTier,
    maxBranches: subscriptionTier === 'starter' ? 1 : subscriptionTier === 'growth' ? 5 : 25,
    maxTerminals: subscriptionTier === 'starter' ? 2 : subscriptionTier === 'growth' ? 10 : 50,
    monthlyGmv: 0,
    primaryContactName: primaryContactName || name,
    primaryContactEmail,
    primaryContactPhone: primaryContactPhone || '+92 300 0000000',
    logoInitial: name.charAt(0).toUpperCase(),
    primaryColor: '#10b981',
    createdAt: now,
    updatedAt: now,
  };
  dbStore.tenants.unshift(newTenant);

  // 2. Create Initial Branch
  const newBranchId = `br-${slug.toLowerCase()}-01`;
  const newBranch: BranchRecord = {
    id: newBranchId,
    tenantId: newTenantId,
    name: initialBranchName || `${name} Main Branch`,
    code: '01',
    city: initialBranchCity,
    address: initialBranchAddress || `${initialBranchCity}, Pakistan`,
    phone: primaryContactPhone || '+92 300 0000000',
    email: primaryContactEmail,
    deliveryRadiusKm: 8.0,
    minOrderAmount: 500,
    standardDeliveryFee: 100,
    openingTime: '11:00:00',
    closingTime: '01:00:00',
    isActive: true,
    createdAt: now,
  };
  dbStore.branches.push(newBranch);

  // 3. Create Tenant Administrator Account
  const newAdminUser: UserRecord = {
    id: `usr-${slug.toLowerCase()}-admin`,
    tenantId: newTenantId,
    primaryBranchId: newBranchId,
    email: primaryContactEmail,
    passwordHash: hashPassword(adminPassword),
    pinHash: hashPin(adminPin),
    firstName: primaryContactName ? primaryContactName.split(' ')[0] : 'Admin',
    lastName: primaryContactName ? primaryContactName.split(' ').slice(1).join(' ') || 'User' : 'User',
    phone: primaryContactPhone || '',
    role: 'RESTAURANT_OWNER',
    permissions: [
      'tenants.manage',
      'branches.view', 'branches.create', 'branches.edit',
      'pos.order.create', 'pos.order.void', 'pos.bill.split', 'pos.payment.collect',
      'pos.discount.apply',
      'kds.ticket.view', 'kds.ticket.update',
      'menu.manage',
      'accounting.journal.view', 'accounting.journal.post', 'accounting.reports.export',
      'inventory.stock.view', 'inventory.po.create', 'inventory.adjust',
      'crm.customers.view', 'crm.sms.broadcast',
    ],
    isActive: true,
    createdAt: now,
  };
  dbStore.users.push(newAdminUser);

  // 4. Seed Starter Menu and Categories for this new tenant
  dbStore.seedDefaultMenuForTenant(newTenantId, name);
  dbStore.saveToDisk();

  // 5. Audit Log
  dbStore.addAuditLog(
    newTenantId,
    req.user?.id || null,
    req.user?.email || 'platform-admin',
    'tenant.onboarded',
    'Tenant',
    newTenantId,
    { name, slug, tier: subscriptionTier, branch: newBranch.name },
    req.ip || '127.0.0.1'
  );

  res.status(201).json({
    success: true,
    data: {
      tenant: newTenant,
      initialBranch: newBranch,
      adminUser: {
        id: newAdminUser.id,
        email: newAdminUser.email,
        role: newAdminUser.role,
      },
    },
    message: `Tenant "${name}" successfully onboarded with initial branch and owner account`,
  });
});

// PATCH /api/v1/tenants/:id (Update Tenant Status, Tier or Profile)
tenantRouter.patch('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';

  // Only super admin or owner of this specific tenant can edit
  if (!isSuperAdmin && req.tenantId !== id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You cannot modify other tenant companies' },
    });
  }

  const tenant = dbStore.tenants.find((t) => t.id === id);
  if (!tenant) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Tenant company not found' },
    });
  }

  const {
    name,
    legalBusinessName,
    taxIdentifier,
    status,
    subscriptionTier,
    primaryColor,
    primaryContactPhone,
  } = req.body;

  if (name) tenant.name = name;
  if (legalBusinessName) tenant.legalBusinessName = legalBusinessName;
  if (taxIdentifier) tenant.taxIdentifier = taxIdentifier;
  if (primaryColor) tenant.primaryColor = primaryColor;
  if (primaryContactPhone) tenant.primaryContactPhone = primaryContactPhone;

  // Status and tier changes require Super Admin
  if (status && isSuperAdmin) tenant.status = status;
  if (subscriptionTier && isSuperAdmin) {
    tenant.subscriptionTier = subscriptionTier;
    tenant.maxBranches = subscriptionTier === 'starter' ? 1 : subscriptionTier === 'growth' ? 5 : 25;
  }

  tenant.updatedAt = new Date().toISOString();

  dbStore.addAuditLog(
    tenant.id,
    req.user?.id || null,
    req.user?.email || 'system',
    'tenant.updated',
    'Tenant',
    tenant.id,
    { changes: req.body },
    req.ip || '127.0.0.1'
  );

  res.json({
    success: true,
    data: tenant,
    message: 'Tenant settings updated successfully',
  });
});

// DELETE /api/v1/tenants/:id (Suspend/Deactivate Tenant)
tenantRouter.delete('/:id', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const tenant = dbStore.tenants.find((t) => t.id === id);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Tenant not found' },
    });
  }

  tenant.status = 'suspended';
  tenant.updatedAt = new Date().toISOString();

  dbStore.addAuditLog(
    tenant.id,
    req.user?.id || null,
    req.user?.email || 'platform-admin',
    'tenant.suspended',
    'Tenant',
    tenant.id,
    { reason: req.body.reason || 'Administrative suspension' },
    req.ip || '127.0.0.1'
  );

  res.json({
    success: true,
    message: `Tenant "${tenant.name}" has been suspended`,
  });
});
