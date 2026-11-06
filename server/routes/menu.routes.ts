import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest, requireAuth, requirePermission } from '../middleware/auth.js';

export const menuRouter = Router();

// GET /api/v1/menu (Categories & Items for tenant)
menuRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  const tenantId = isSuperAdmin && req.query.tenantId ? String(req.query.tenantId) : req.tenantId;

  if (!tenantId && !isSuperAdmin) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Tenant context required' },
    });
  }

  const categories = tenantId
    ? dbStore.categories.filter((c) => c.tenantId === tenantId)
    : dbStore.categories;

  const items = tenantId
    ? dbStore.menuItems.filter((m) => m.tenantId === tenantId)
    : dbStore.menuItems;

  res.json({
    success: true,
    data: {
      categories,
      items,
    },
    meta: {
      categoryCount: categories.length,
      itemCount: items.length,
    },
  });
});

// PATCH /api/v1/menu/items/:id/availability (86 / In-Stock Toggle)
menuRouter.patch(
  '/items/:id/availability',
  requireAuth,
  requirePermission('menu.manage'),
  (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  const item = dbStore.menuItems.find((m) => m.id === id);
  if (!item) {
    return res.status(404).json({ success: false, error: { message: 'Menu item not found' } });
  }

  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  if (!isSuperAdmin && item.tenantId !== req.tenantId) {
    return res.status(403).json({ success: false, error: { message: 'Unauthorized modification' } });
  }

  item.isAvailable = Boolean(isAvailable);

  dbStore.addAuditLog(
    item.tenantId,
    req.user?.id || null,
    req.user?.email || 'system',
    'menu.item_availability_changed',
    'MenuItem',
    item.id,
    { name: item.name, isAvailable: item.isAvailable },
    req.ip || '127.0.0.1'
  );

  res.json({
    success: true,
    data: item,
    message: `Item "${item.name}" marked as ${item.isAvailable ? 'In Stock' : '86 / Sold Out'}`,
    }
  );
});
