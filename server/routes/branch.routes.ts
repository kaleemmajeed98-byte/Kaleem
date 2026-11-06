import { Router, Response } from 'express';
import { dbStore, BranchRecord } from '../db/store.js';
import {
  AuthenticatedRequest,
  requireAuth,
  requirePermission,
} from '../middleware/auth.js';

export const branchRouter = Router();

// GET /api/v1/branches (List branches for current tenant)
branchRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  const targetTenantId = isSuperAdmin && req.query.tenantId ? String(req.query.tenantId) : req.tenantId;

  if (!targetTenantId) {
    return res.json({
      success: true,
      data: dbStore.branches,
      meta: { total: dbStore.branches.length },
    });
  }

  const branches = dbStore.branches.filter((b) => b.tenantId === targetTenantId);

  res.json({
    success: true,
    data: branches,
    meta: { total: branches.length },
  });
});

// POST /api/v1/branches (Create New Branch)
branchRouter.post(
  '/',
  requireAuth,
  requirePermission('branches.create'),
  (req: AuthenticatedRequest, res: Response) => {
    const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
    const tenantId = isSuperAdmin && req.body.tenantId ? req.body.tenantId : req.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TENANT', message: 'Tenant ID is required to create a branch' },
      });
    }

    const tenant = dbStore.tenants.find((t) => t.id === tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { code: 'TENANT_NOT_FOUND', message: 'Tenant company not found' },
      });
    }

    // Verify Branch Limit of Subscription Plan
    const currentBranchCount = dbStore.branches.filter((b) => b.tenantId === tenantId).length;
    if (currentBranchCount >= tenant.maxBranches) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'BRANCH_LIMIT_EXCEEDED',
          message: `Your ${tenant.subscriptionTier} plan is limited to ${tenant.maxBranches} branches. Upgrade to add more locations.`,
        },
      });
    }

    const {
      name,
      code,
      city,
      address,
      phone,
      email,
      deliveryRadiusKm = 8.0,
      minOrderAmount = 500,
      standardDeliveryFee = 100,
      openingTime = '11:00:00',
      closingTime = '01:00:00',
    } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, city, and address are required' },
      });
    }

    const branchCode = code || `B-${currentBranchCount + 1}`;
    const newBranch: BranchRecord = {
      id: `br-${tenant.slug}-${Date.now().toString(36)}`,
      tenantId,
      name,
      code: branchCode,
      city,
      address,
      phone: phone || tenant.primaryContactPhone,
      email: email || tenant.primaryContactEmail,
      deliveryRadiusKm: Number(deliveryRadiusKm),
      minOrderAmount: Number(minOrderAmount),
      standardDeliveryFee: Number(standardDeliveryFee),
      openingTime,
      closingTime,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    dbStore.branches.push(newBranch);

    dbStore.addAuditLog(
      tenantId,
      req.user?.id || null,
      req.user?.email || 'system',
      'branch.created',
      'Branch',
      newBranch.id,
      { name, city, code: branchCode },
      req.ip || '127.0.0.1'
    );

    res.status(201).json({
      success: true,
      data: newBranch,
      message: `Branch "${name}" successfully registered for ${tenant.name}`,
    });
  }
);

// PATCH /api/v1/branches/:id (Update Branch Settings)
branchRouter.patch(
  '/:id',
  requireAuth,
  requirePermission('branches.edit'),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const branch = dbStore.branches.find((b) => b.id === id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Branch not found' },
      });
    }

    // Tenant boundary check
    const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
    if (!isSuperAdmin && branch.tenantId !== req.tenantId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Cannot edit branches of another restaurant' },
      });
    }

    const {
      name,
      address,
      phone,
      email,
      deliveryRadiusKm,
      minOrderAmount,
      standardDeliveryFee,
      openingTime,
      closingTime,
      isActive,
    } = req.body;

    if (name) branch.name = name;
    if (address) branch.address = address;
    if (phone) branch.phone = phone;
    if (email) branch.email = email;
    if (deliveryRadiusKm !== undefined) branch.deliveryRadiusKm = Number(deliveryRadiusKm);
    if (minOrderAmount !== undefined) branch.minOrderAmount = Number(minOrderAmount);
    if (standardDeliveryFee !== undefined) branch.standardDeliveryFee = Number(standardDeliveryFee);
    if (openingTime) branch.openingTime = openingTime;
    if (closingTime) branch.closingTime = closingTime;
    if (isActive !== undefined) branch.isActive = Boolean(isActive);

    dbStore.addAuditLog(
      branch.tenantId,
      req.user?.id || null,
      req.user?.email || 'system',
      'branch.updated',
      'Branch',
      branch.id,
      { changes: req.body },
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      data: branch,
      message: 'Branch updated successfully',
    });
  }
);
