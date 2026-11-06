import { Router, Response } from 'express';
import crypto from 'node:crypto';
import {
  dbStore,
  hashPassword,
  hashPin,
  isModernPasswordHash,
  isValidPassword,
  isValidPin,
  signJwt,
  verifyPassword,
  verifyPin,
  UserRecord,
} from '../db/store.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/v1/auth/bootstrap (One-time platform administrator provisioning)
authRouter.post('/bootstrap', (req: AuthenticatedRequest, res: Response) => {
  const configuredToken = process.env.BOOTSTRAP_TOKEN;
  const suppliedToken = req.get('x-bootstrap-token') || '';

  if (!configuredToken || Buffer.byteLength(configuredToken, 'utf8') < 32) {
    return res.status(503).json({
      success: false,
      error: { code: 'BOOTSTRAP_DISABLED', message: 'Configure a one-time BOOTSTRAP_TOKEN before provisioning the first administrator' },
    });
  }

  const expected = Buffer.from(configuredToken);
  const supplied = Buffer.from(suppliedToken);
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
    return res.status(403).json({
      success: false,
      error: { code: 'INVALID_BOOTSTRAP_TOKEN', message: 'A valid bootstrap token is required' },
    });
  }

  if (dbStore.users.some((user) => isModernPasswordHash(user.passwordHash))) {
    return res.status(409).json({
      success: false,
      error: { code: 'BOOTSTRAP_ALREADY_COMPLETED', message: 'An active account is already provisioned' },
    });
  }

  const { email, password, firstName, lastName } = req.body;
  if (
    typeof email !== 'string' ||
    !email.includes('@') ||
    typeof firstName !== 'string' ||
    !firstName.trim() ||
    typeof lastName !== 'string' ||
    !lastName.trim() ||
    !isValidPassword(password)
  ) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'A valid email, first name, last name, and password of at least 12 characters are required' },
    });
  }

  if (dbStore.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({
      success: false,
      error: { code: 'USER_EXISTS', message: 'Choose a different email for the first platform administrator' },
    });
  }

  const user: UserRecord = {
    id: `usr-platform-${crypto.randomUUID()}`,
    tenantId: null,
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    pinHash: hashPin(crypto.randomBytes(24).toString('hex')),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: '',
    role: 'PLATFORM_SUPER_ADMIN',
    permissions: ['*'],
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  dbStore.users.push(user);
  dbStore.addAuditLog(
    null,
    user.id,
    user.email,
    'auth.platform_admin_bootstrapped',
    'User',
    user.id,
    {},
    req.ip || '127.0.0.1'
  );

  res.status(201).json({
    success: true,
    data: { id: user.id, email: user.email, role: user.role },
    message: 'Platform administrator provisioned. Remove BOOTSTRAP_TOKEN from the environment.',
  });
});

// POST /api/v1/auth/login (Email + Password)
authRouter.post('/login', (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    password.length === 0 ||
    password.length > 128
  ) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required' },
    });
  }

  const user = dbStore.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive
  );

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password' },
    });
  }

  const token = signJwt({
    sub: user.id,
    tenant_id: user.tenantId,
    role: user.role,
    email: user.email,
  }, 86400); // 24 hours

  const tenant = user.tenantId ? dbStore.tenants.find((t) => t.id === user.tenantId) : null;
  const branches = user.tenantId
    ? dbStore.branches.filter((b) => b.tenantId === user.tenantId && b.isActive)
    : [];

  // Log successful login
  dbStore.addAuditLog(
    user.tenantId,
    user.id,
    user.email,
    'auth.login_success',
    'User',
    user.id,
    { method: 'password', role: user.role },
    req.ip || '127.0.0.1'
  );

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        primaryBranchId: user.primaryBranchId,
      },
      tenant: tenant || null,
      branches,
    },
  });
});

// POST /api/v1/auth/pin-login (Fast POS Cashier PIN switch)
authRouter.post('/pin-login', (req: AuthenticatedRequest, res: Response) => {
  const { pin, tenantId } = req.body;

  if (!pin) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_PIN', message: 'Cashier PIN is required' },
    });
  }

  if (!isValidPin(pin)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PIN', message: 'PIN must contain exactly 6 digits' },
    });
  }

  const user = dbStore.users.find((u) => {
    const matchesPin = verifyPin(pin, u.pinHash) && u.isActive;
    if (tenantId) {
      return matchesPin && (u.tenantId === tenantId || u.role === 'PLATFORM_SUPER_ADMIN');
    }
    return matchesPin;
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_PIN', message: 'Unrecognized Cashier PIN code' },
    });
  }

  const token = signJwt({
    sub: user.id,
    tenant_id: user.tenantId,
    role: user.role,
    email: user.email,
  }, 43200); // 12 hours

  const tenant = user.tenantId ? dbStore.tenants.find((t) => t.id === user.tenantId) : null;
  const branches = user.tenantId
    ? dbStore.branches.filter((b) => b.tenantId === user.tenantId && b.isActive)
    : [];

  dbStore.addAuditLog(
    user.tenantId,
    user.id,
    user.email,
    'auth.pin_login_success',
    'User',
    user.id,
    { method: 'pin', role: user.role },
    req.ip || '127.0.0.1'
  );

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        primaryBranchId: user.primaryBranchId,
      },
      tenant: tenant || null,
      branches,
    },
  });
});

// GET /api/v1/auth/me (Get current session state)
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const tenant = user.tenantId ? dbStore.tenants.find((t) => t.id === user.tenantId) : null;
  const branches = user.tenantId
    ? dbStore.branches.filter((b) => b.tenantId === user.tenantId && b.isActive)
    : [];

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        primaryBranchId: user.primaryBranchId,
      },
      tenant: tenant || null,
      branches,
    },
  });
});
