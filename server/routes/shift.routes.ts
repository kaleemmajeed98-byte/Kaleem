import { Router, Response } from 'express';
import { dbStore, CashierShiftRecord } from '../db/store.js';
import { AuthenticatedRequest, requireAuth, requirePermission } from '../middleware/auth.js';

export const shiftRouter = Router();

const ownsShift = (req: AuthenticatedRequest, shift: CashierShiftRecord) =>
  shift.tenantId === req.tenantId && shift.userId === req.user?.id;

const getExpectedCash = (shift: CashierShiftRecord, closedAt = new Date().toISOString()) => {
  const cashSales = dbStore.orders
    .filter((order) =>
      order.tenantId === shift.tenantId &&
      order.branchId === shift.branchId &&
      order.terminalId === shift.terminalId &&
      order.cashierName === shift.cashierName &&
      order.paymentStatus === 'paid' &&
      order.paymentMethod === 'cash' &&
      order.createdAt >= shift.openedAt &&
      order.createdAt <= closedAt
    )
    .reduce((sum, order) => sum + order.grandTotal, 0);
  const cashIn = shift.transactions
    .filter((transaction) => transaction.type === 'cash_in')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const cashOut = shift.transactions
    .filter((transaction) => transaction.type === 'cash_out')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return shift.openingCash + cashSales + cashIn - cashOut;
};

shiftRouter.get('/current', requireAuth, requirePermission('pos.drawer.open'), (req: AuthenticatedRequest, res: Response) => {
  const branchId = String(req.query.branchId || '');
  const shift = dbStore.shifts.find((record) =>
    record.tenantId === req.tenantId &&
    record.branchId === branchId &&
    record.userId === req.user?.id &&
    record.status === 'open'
  );
  res.json({ success: true, data: shift || null });
});

shiftRouter.get('/', requireAuth, requirePermission('pos.drawer.open'), (req: AuthenticatedRequest, res: Response) => {
  const branchId = String(req.query.branchId || '');
  const shifts = dbStore.shifts.filter((record) =>
    record.tenantId === req.tenantId &&
    record.branchId === branchId &&
    record.userId === req.user?.id
  );
  res.json({ success: true, data: shifts });
});

shiftRouter.post('/', requireAuth, requirePermission('pos.drawer.open'), (req: AuthenticatedRequest, res: Response) => {
  const { branchId, terminalId = 'POS-01', openingCash } = req.body;
  const amount = Number(openingCash);
  const branch = dbStore.branches.find((record) => record.id === branchId && record.tenantId === req.tenantId);
  if (!branch || !Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_SHIFT', message: 'A valid branch and non-negative opening cash amount are required' },
    });
  }
  const existing = dbStore.shifts.find((record) =>
    record.tenantId === req.tenantId &&
    record.userId === req.user?.id &&
    record.branchId === branchId &&
    record.status === 'open'
  );
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'SHIFT_ALREADY_OPEN', message: 'An open shift already exists for this cashier and branch' },
    });
  }

  const shift = dbStore.createShift({
    tenantId: req.tenantId!,
    branchId,
    userId: req.user!.id,
    cashierName: `${req.user!.firstName} ${req.user!.lastName}`,
    terminalId: String(terminalId),
    openingCash: amount,
  });
  dbStore.addAuditLog(req.tenantId!, req.user!.id, req.user!.email, 'pos.shift.opened', 'CashierShift', shift.id, {
    openingCash: amount,
    branchId,
  }, req.ip || '127.0.0.1');
  res.status(201).json({ success: true, data: shift });
});

shiftRouter.post('/:id/cash-transactions', requireAuth, requirePermission('pos.drawer.open'), (req: AuthenticatedRequest, res: Response) => {
  const shift = dbStore.shifts.find((record) => record.id === req.params.id);
  const { type, amount, reason } = req.body;
  const value = Number(amount);
  if (!shift || !ownsShift(req, shift)) {
    return res.status(404).json({ success: false, error: { code: 'SHIFT_NOT_FOUND', message: 'Open shift not found' } });
  }
  if (shift.status !== 'open' || !['cash_in', 'cash_out'].includes(type) || !Number.isFinite(value) || value <= 0 || !String(reason || '').trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_CASH_TRANSACTION', message: 'An open shift, valid amount, transaction type, and reason are required' },
    });
  }
  const transaction = dbStore.addCashTransaction(shift, {
    type,
    amount: value,
    reason: String(reason).trim(),
    userId: req.user!.id,
  });
  dbStore.addAuditLog(req.tenantId!, req.user!.id, req.user!.email, `pos.${type}`, 'CashierShift', shift.id, {
    amount: value,
    reason: transaction.reason,
  }, req.ip || '127.0.0.1');
  res.status(201).json({ success: true, data: { shift, transaction } });
});

shiftRouter.post('/:id/close', requireAuth, requirePermission('pos.drawer.open'), (req: AuthenticatedRequest, res: Response) => {
  const shift = dbStore.shifts.find((record) => record.id === req.params.id);
  const closingCash = Number(req.body.closingCash);
  if (!shift || !ownsShift(req, shift)) {
    return res.status(404).json({ success: false, error: { code: 'SHIFT_NOT_FOUND', message: 'Open shift not found' } });
  }
  if (shift.status !== 'open' || !Number.isFinite(closingCash) || closingCash < 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_SHIFT_CLOSE', message: 'A valid non-negative closing cash amount is required' },
    });
  }

  const closedAt = new Date().toISOString();
  const expectedCash = getExpectedCash(shift, closedAt);
  shift.status = 'closed';
  shift.closedAt = closedAt;
  shift.expectedCash = expectedCash;
  shift.closingCash = closingCash;
  shift.cashDifference = closingCash - expectedCash;
  dbStore.saveToDisk();
  dbStore.addAuditLog(req.tenantId!, req.user!.id, req.user!.email, 'pos.shift.closed', 'CashierShift', shift.id, {
    expectedCash,
    closingCash,
    cashDifference: shift.cashDifference,
  }, req.ip || '127.0.0.1');
  res.json({ success: true, data: shift });
});
