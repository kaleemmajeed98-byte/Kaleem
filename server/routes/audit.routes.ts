import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest, requireAuth, requirePermission } from '../middleware/auth.js';

export const auditRouter = Router();

// GET /api/v1/audit-logs
auditRouter.get('/', requireAuth, requirePermission('audit.view'), (req: AuthenticatedRequest, res: Response) => {
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  const isAuditor = req.user?.role === 'AUDITOR';

  let logs = dbStore.auditLogs;
  if (isSuperAdmin && req.query.tenantId) {
    const targetTenantId = String(req.query.tenantId);
    logs = logs.filter((log) => log.tenantId === targetTenantId || log.tenantId === null);
  } else if (isAuditor && req.tenantId) {
    logs = logs.filter((log) => log.tenantId === req.tenantId || log.tenantId === null);
  } else if (!isSuperAdmin && !isAuditor && req.tenantId) {
    logs = logs.filter((log) => log.tenantId === req.tenantId || log.tenantId === null);
  }

  const limit = Number(req.query.limit) || 100;

  res.json({
    success: true,
    data: logs.slice(0, limit),
    meta: { totalCount: logs.length },
  });
});
