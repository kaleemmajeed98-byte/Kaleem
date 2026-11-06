import { Router, Response } from 'express';
import {
  dbStore,
  UserRecord,
  hashPassword,
  hashPin,
  isValidPassword,
  isValidPin,
} from '../db/store.js';
import {
  AuthenticatedRequest,
  requireAuth,
  requirePermission,
} from '../middleware/auth.js';

export const userRouter = Router();

// GET /api/v1/users (List staff for current tenant)
userRouter.get('/', requireAuth, requirePermission('branches.view'), (req: AuthenticatedRequest, res: Response) => {
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  const tenantId = isSuperAdmin && req.query.tenantId ? String(req.query.tenantId) : req.tenantId;

  const users = tenantId
    ? dbStore.users.filter((u) => u.tenantId === tenantId)
    : dbStore.users;

  // Mask hashes in response
  const sanitized = users.map((u) => ({
    id: u.id,
    tenantId: u.tenantId,
    primaryBranchId: u.primaryBranchId,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    role: u.role,
    permissions: u.permissions,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));

  res.json({
    success: true,
    data: sanitized,
    meta: { total: sanitized.length },
  });
});

// POST /api/v1/users (Create Staff Account)
userRouter.post(
  '/',
  requireAuth,
  requirePermission('tenants.manage'),
  (req: AuthenticatedRequest, res: Response) => {
    const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
    const tenantId = isSuperAdmin && req.body.tenantId ? req.body.tenantId : req.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TENANT', message: 'Tenant context required' },
      });
    }

    const {
      email,
      password,
      pin,
      firstName,
      lastName,
      phone,
      role = 'CASHIER',
      primaryBranchId,
    } = req.body;

    if (
      typeof email !== 'string' ||
      !email.includes('@') ||
      typeof firstName !== 'string' ||
      !firstName.trim() ||
      typeof lastName !== 'string' ||
      !lastName.trim() ||
      !isValidPassword(password) ||
      !isValidPin(pin)
    ) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid email, first and last names, a password of at least 12 characters, and a 6-digit PIN are required' },
      });
    }

    // Check duplicate
    const existing = dbStore.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User with this email already exists in this tenant' },
      });
    }

    const rolePermissions: Record<string, string[]> = {
      BRANCH_MANAGER: ['branches.view', 'menu.manage', 'pos.discount.apply', 'inventory.stock.view', 'accounting.reports.export'],
      CASHIER: [
        'pos.order.create', 'pos.order.void', 'pos.bill.split', 'pos.payment.collect',
        'pos.drawer.open',
      ],
      KITCHEN_STAFF: ['kds.ticket.view', 'kds.ticket.update'],
      AUDITOR: ['audit.view', 'reports.financial.view', 'compliance.export'],
    };
    const finalPermissions = rolePermissions[role];
    if (!finalPermissions) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Select a supported staff role' },
      });
    }

    const newUser: UserRecord = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      tenantId,
      primaryBranchId: primaryBranchId || undefined,
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      pinHash: hashPin(pin),
      firstName,
      lastName,
      phone: phone || '',
      role,
      permissions: finalPermissions,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    dbStore.users.push(newUser);

    dbStore.addAuditLog(
      tenantId,
      req.user?.id || null,
      req.user?.email || 'system',
      'user.created',
      'User',
      newUser.id,
      { email, role, branchId: primaryBranchId },
      req.ip || '127.0.0.1'
    );

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        permissions: newUser.permissions,
        primaryBranchId: newUser.primaryBranchId,
      },
      message: `Staff user "${firstName} ${lastName}" created successfully`,
    });
  }
);

// PATCH /api/v1/users/:id/password (Reset a user's password)
userRouter.patch(
  '/:id/password',
  requireAuth,
  requirePermission('tenants.manage'),
  (req: AuthenticatedRequest, res: Response) => {
    const user = dbStore.users.find((record) => record.id === req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
    if (!isSuperAdmin && user.tenantId !== req.tenantId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot reset users outside your tenant' },
      });
    }

    const { newPassword } = req.body;
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Password must be between 12 and 128 characters' },
      });
    }

    user.passwordHash = hashPassword(newPassword);
    dbStore.addAuditLog(
      user.tenantId,
      req.user?.id || null,
      req.user?.email || 'system',
      'user.password_reset',
      'User',
      user.id,
      { targetUserId: user.id },
      req.ip || '127.0.0.1'
    );

    return res.json({
      success: true,
      message: 'User password reset successfully',
    });
  }
);

// PATCH /api/v1/users/:id/pin (Update Cashier PIN)
userRouter.patch(
  '/:id/pin',
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { newPin } = req.body;

    if (!isValidPin(newPin)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PIN', message: 'PIN must contain exactly 6 digits' },
      });
    }

    const user = dbStore.users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
    const isOwner = req.user?.role === 'RESTAURANT_OWNER' && user.tenantId === req.tenantId;
    const isSelf = req.user?.id === user.id;

    if (!isSuperAdmin && !isOwner && !isSelf) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to update this PIN' },
      });
    }

    user.pinHash = hashPin(newPin);

    dbStore.addAuditLog(
      user.tenantId,
      req.user?.id || null,
      req.user?.email || 'system',
      'user.pin_updated',
      'User',
      user.id,
      { targetUserId: user.id },
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      message: 'Cashier PIN updated successfully',
    });
  }
);
