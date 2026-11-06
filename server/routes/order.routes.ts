import crypto from 'node:crypto';
import { Router, Response } from 'express';
import { dbStore, OrderItemRecord, OrderRecord } from '../db/store.js';
import { AuthenticatedRequest, requireAuth, requirePermission } from '../middleware/auth.js';

export const orderRouter = Router();

function priceOrderItems(
  tenantId: string,
  input: unknown
): { items: OrderItemRecord[]; subtotal: number } | { error: string } {
  if (!Array.isArray(input) || input.length === 0 || input.length > 100) {
    return { error: 'Order must contain between 1 and 100 items' };
  }

  const items: OrderItemRecord[] = [];
  for (const [index, rawItem] of input.entries()) {
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
      return { error: `Order item ${index + 1} is invalid` };
    }

    const item = rawItem as Record<string, unknown>;
    const menuItemId = typeof item.menuItemId === 'string' ? item.menuItemId : '';
    const menuItem = dbStore.menuItems.find(
      (record) => record.id === menuItemId && record.tenantId === tenantId && record.isAvailable
    );
    if (!menuItem) {
      return { error: `Order item ${index + 1} is unavailable` };
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return { error: `Order item ${index + 1} has an invalid quantity` };
    }

    let unitPrice = menuItem.basePrice;
    const variantName = typeof item.variant === 'string' && item.variant.trim()
      ? item.variant.trim()
      : undefined;
    if (variantName) {
      const variant = menuItem.variants?.find((candidate) => candidate.name === variantName);
      if (!variant) {
        return { error: `Order item ${index + 1} has an invalid variant` };
      }
      unitPrice = variant.price;
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return { error: `Order item ${index + 1} has an invalid catalog price` };
    }

    items.push({
      id: `item-${crypto.randomUUID()}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
      station: menuItem.station,
      notes: typeof item.notes === 'string' ? item.notes.slice(0, 500) : '',
      variant: variantName,
      itemStatus: 'pending',
    });
  }

  return {
    items,
    subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
  };
}

// POST /api/v1/orders/public (Public Online Storefront Checkout - No auth required)
orderRouter.post('/public', (req, res) => {
  const {
    tenantId,
    branchId,
    customerName,
    customerPhone,
    deliveryAddress,
    orderType = 'delivery',
    paymentMethod = 'cash',
    items = [],
    specialInstructions = '',
  } = req.body;

  if (!tenantId || !branchId || !Array.isArray(items) || !items.length || !customerName || !customerPhone) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Tenant, branch, customer details, and items are required' },
    });
  }

  const tenant = dbStore.tenants.find((t) => t.id === tenantId);
  if (!tenant || tenant.status === 'suspended' || tenant.status === 'cancelled') {
    return res.status(404).json({
      success: false,
      error: { code: 'TENANT_NOT_FOUND', message: 'Restaurant not found' },
    });
  }

  const branch = dbStore.branches.find(
    (record) => record.id === branchId && record.tenantId === tenantId && record.isActive
  );
  if (!branch) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_BRANCH', message: 'Branch does not belong to this restaurant or is inactive' },
    });
  }

  const pricedOrder = priceOrderItems(tenantId, items);
  if ('error' in pricedOrder) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ORDER_ITEMS', message: pricedOrder.error },
    });
  }
  const orderItems = pricedOrder.items.map((item) => ({
    ...item,
    notes: item.notes || (typeof specialInstructions === 'string' ? specialInstructions.slice(0, 500) : ''),
  }));
  const subtotal = pricedOrder.subtotal;
  const normalizedOrderType = orderType === 'takeaway' ? 'takeaway' : 'delivery';
  const deliveryFee = normalizedOrderType === 'delivery' ? branch.standardDeliveryFee : 0;
  const taxAmount = Math.round(subtotal * 0.13); // 13% GST Sindh SRB
  const grandTotal = subtotal + taxAmount + deliveryFee;
  const paymentMethods: OrderRecord['paymentMethod'][] = ['cash', 'card', 'jazzcash', 'easypaisa', 'bank_transfer', 'split'];
  if (!paymentMethods.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PAYMENT_METHOD', message: 'Payment method is invalid' },
    });
  }

  const order = dbStore.createOrder({
    tenantId,
    branchId,
    channel: 'web',
    orderType: normalizedOrderType,
    customerName,
    customerPhone,
    deliveryAddress: deliveryAddress || '',
    items: orderItems,
    subtotal,
    taxAmount,
    deliveryFee,
    discountAmount: 0,
    serviceCharge: 0,
    grandTotal,
    paymentMethod,
    paymentStatus: 'pending',
    kdsStatus: 'new',
  });

  dbStore.addAuditLog(
    tenantId,
    null,
    'web-customer',
    'storefront.order_placed',
    'Order',
    order.id,
    { orderNumber: order.orderNumber, grandTotal, customerName, customerPhone },
    req.ip || '127.0.0.1'
  );

  res.status(201).json({
    success: true,
    data: order,
    message: `Order #${order.orderNumber} successfully placed and routed to kitchen!`,
  });
});

// GET /api/v1/orders/public/track/:orderNumber (Live Tracker - No auth required)
orderRouter.get('/public/track/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  const order = dbStore.orders.find(
    (o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase() || o.id === orderNumber
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' },
    });
  }

  res.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      kdsStatus: order.kdsStatus,
      channel: order.channel,
      orderType: order.orderType,
      customerName: order.customerName,
      items: order.items,
      grandTotal: order.grandTotal,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  });
});

// GET /api/v1/orders
orderRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  const tenantId = isSuperAdmin && req.query.tenantId ? String(req.query.tenantId) : req.tenantId;

  if (!tenantId && !isSuperAdmin) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Tenant context required' },
    });
  }

  let orders = tenantId ? dbStore.orders.filter((o) => o.tenantId === tenantId) : dbStore.orders;

  if (req.query.branchId) {
    orders = orders.filter((o) => o.branchId === req.query.branchId);
  }

  if (req.query.kdsStatus) {
    orders = orders.filter((o) => o.kdsStatus === req.query.kdsStatus);
  }

  res.json({
    success: true,
    data: orders,
    meta: {
      total: orders.length,
      todayGmv: orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.grandTotal : 0), 0),
    },
  });
});

// POST /api/v1/orders (Create POS / Online Order)
orderRouter.post(
  '/',
  requireAuth,
  requirePermission('pos.order.create'),
  requirePermission('pos.payment.collect'),
  (req: AuthenticatedRequest, res: Response) => {
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  const tenantId = isSuperAdmin && req.body.tenantId ? req.body.tenantId : req.tenantId;

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_TENANT', message: 'Tenant ID is required to place an order' },
    });
  }

  const {
    branchId,
    orderType = 'dine_in',
    tableNumber,
    customerName = 'Walk-in Guest',
    customerPhone = '',
    deliveryAddress,
    items = [],
    clientNonce,
  } = req.body;

  if (!branchId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Branch and at least one order item are required' },
    });
  }
  const branch = dbStore.branches.find(
    (record) => record.id === branchId && record.tenantId === tenantId && record.isActive
  );
  if (!branch) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_BRANCH', message: 'Branch does not belong to the authenticated tenant' },
    });
  }
  if (!['dine_in', 'takeaway', 'delivery', 'drive_thru'].includes(orderType)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ORDER_TYPE', message: 'Order type is invalid' },
    });
  }
  const terminalId = typeof req.body.terminalId === 'string' ? req.body.terminalId.slice(0, 40) : 'POS-01';
  const openShift = dbStore.shifts.find((shift) =>
    shift.tenantId === tenantId &&
    shift.branchId === branchId &&
    shift.userId === req.user?.id &&
    shift.terminalId === terminalId &&
    shift.status === 'open'
  );
  if (!openShift) {
    return res.status(409).json({
      success: false,
      error: { code: 'SHIFT_REQUIRED', message: 'Open a cashier shift before creating a POS order' },
    });
  }

  // Idempotency check: if clientNonce was already processed (from offline replay), return existing
  if (clientNonce) {
    const existing = dbStore.orders.find(
      (order) => order.tenantId === tenantId && order.clientNonce === clientNonce
    );
    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        message: 'Order already recorded (idempotent)',
      });
    }
  }

  const pricedOrder = priceOrderItems(tenantId, items);
  if ('error' in pricedOrder) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ORDER_ITEMS', message: pricedOrder.error },
    });
  }
  const subtotal = pricedOrder.subtotal;
  const discountAmount = Number(req.body.discountAmount ?? 0);
  const serviceCharge = Number(req.body.serviceCharge ?? 0);
  const maximumDiscount = Math.round(subtotal * 0.2);
  if (
    !Number.isFinite(discountAmount) ||
    !Number.isFinite(serviceCharge) ||
    discountAmount < 0 ||
    discountAmount > maximumDiscount ||
    serviceCharge !== 0
  ) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_CHARGES', message: 'Discount cannot exceed 20% of the subtotal; service charges are not configured' },
    });
  }
  if (
    discountAmount > 0 &&
    req.user?.role !== 'PLATFORM_SUPER_ADMIN' &&
    !req.permissions?.includes('pos.discount.apply')
  ) {
    return res.status(403).json({
      success: false,
      error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Manager approval is required to apply a discount' },
    });
  }
  const taxAmount = Math.round(subtotal * 0.13);
  const deliveryFee = orderType === 'delivery' ? branch.standardDeliveryFee : 0;
  const grandTotal = Math.max(0, subtotal + taxAmount + deliveryFee + serviceCharge - discountAmount);
  const paymentMethods: OrderRecord['paymentMethod'][] = [
    'cash',
    'card',
    'jazzcash',
    'easypaisa',
    'bank_transfer',
    'split',
  ];
  const paymentMethod = req.body.paymentMethod ?? 'cash';
  if (!paymentMethods.includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PAYMENT_METHOD', message: 'Payment method is invalid' },
    });
  }
  const order = dbStore.createOrder({
    tenantId,
    branchId,
    channel: 'pos',
    orderType,
    tableNumber,
    customerName,
    customerPhone,
    deliveryAddress,
    items: pricedOrder.items,
    subtotal,
    taxAmount,
    deliveryFee,
    discountAmount,
    serviceCharge,
    grandTotal,
    paymentMethod,
    paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending',
    kdsStatus: 'new',
    cashierName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Cashier',
    terminalId,
    clientNonce,
  });

  dbStore.addAuditLog(
    tenantId,
    req.user?.id || null,
    req.user?.email || 'pos-terminal',
    'order.created',
    'Order',
    order.id,
    { orderNumber: order.orderNumber, grandTotal, channel: 'pos', orderType },
    req.ip || '127.0.0.1'
  );

  res.status(201).json({
    success: true,
    data: order,
    message: `Order #${order.orderNumber} placed successfully`,
    }
  );
});

// PATCH /api/v1/orders/:id/status (Advance KDS Status)
orderRouter.patch(
  '/:id/status',
  requireAuth,
  requirePermission('kds.ticket.update'),
  (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validStatuses.join(', ')}` },
    });
  }

  const order = dbStore.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Order not found' },
    });
  }

  // Tenant boundary verification
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  if (!isSuperAdmin && order.tenantId !== req.tenantId) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized access to this order' },
    });
  }

  order.kdsStatus = status;
  order.updatedAt = new Date().toISOString();

  // If order is ready or completed, mark all sub-items accordingly
  if (status === 'ready' || status === 'completed') {
    order.items.forEach((it) => {
      it.itemStatus = 'ready';
    });
  } else if (status === 'preparing') {
    order.items.forEach((it) => {
      if (it.itemStatus === 'pending') it.itemStatus = 'cooking';
    });
  }

  res.json({
    success: true,
    data: order,
    message: `Order #${order.orderNumber} status changed to ${status}`,
  });
  }
);

// PATCH /api/v1/orders/:id/items/:itemId/status (Item-Level Kitchen Toggle)
orderRouter.patch(
  '/:id/items/:itemId/status',
  requireAuth,
  requirePermission('kds.ticket.update'),
  (req: AuthenticatedRequest, res: Response) => {
  const { id, itemId } = req.params;
  const { status } = req.body;

  const order = dbStore.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }

  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  if (!isSuperAdmin && order.tenantId !== req.tenantId) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Unauthorized access to this order' },
    });
  }

  const item = order.items.find((it) => it.id === itemId);
  if (!item) {
    return res.status(404).json({ success: false, error: { message: 'Order item not found' } });
  }

  const validStatuses = ['pending', 'cooking', 'ready'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validStatuses.join(', ')}` },
    });
  }
  item.itemStatus = status;
  order.updatedAt = new Date().toISOString();

  // If all items are ready, advance order kdsStatus to ready automatically
  const allReady = order.items.every((it) => it.itemStatus === 'ready');
  if (allReady && order.kdsStatus !== 'completed') {
    order.kdsStatus = 'ready';
  }

  res.json({
    success: true,
    data: order,
    }
  );
});

// POST /api/v1/orders/sync-offline (Batch sync offline queued orders)
orderRouter.post(
  '/sync-offline',
  requireAuth,
  requirePermission('pos.order.create'),
  requirePermission('pos.payment.collect'),
  (req: AuthenticatedRequest, res: Response) => {
  const isSuperAdmin = req.user?.role === 'PLATFORM_SUPER_ADMIN';
  const tenantId = isSuperAdmin && req.body.tenantId ? req.body.tenantId : req.tenantId;

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_TENANT', message: 'Tenant ID required for offline sync' },
    });
  }

  const { queuedOrders } = req.body;
  if (!Array.isArray(queuedOrders) || queuedOrders.length > 100) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_BATCH', message: 'Offline sync must contain at most 100 queued orders' },
    });
  }

  const preparedOrders: Partial<OrderRecord>[] = [];
  const duplicates: string[] = [];
  const seenNonces = new Set<string>();

  for (const raw of queuedOrders) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ORDER', message: 'Queued order payload is invalid' },
      });
    }

    // Check if duplicate via clientNonce
    const clientNonce = typeof raw.clientNonce === 'string' ? raw.clientNonce.slice(0, 120) : undefined;
    if (clientNonce) {
      const existing = dbStore.orders.find(
        (order) => order.tenantId === tenantId && order.clientNonce === clientNonce
      );
      if (existing || seenNonces.has(clientNonce)) {
        duplicates.push(clientNonce);
        continue;
      }
      seenNonces.add(clientNonce);
    }

    const branchId = typeof raw.branchId === 'string' ? raw.branchId : req.user?.primaryBranchId;
    const branch = dbStore.branches.find(
      (record) => record.id === branchId && record.tenantId === tenantId && record.isActive
    );
    if (!branch) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BRANCH', message: 'Queued order branch does not belong to the authenticated tenant' },
      });
    }

    const orderType = ['dine_in', 'takeaway', 'delivery', 'drive_thru'].includes(raw.orderType)
      ? raw.orderType
      : null;
    if (!orderType) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ORDER_TYPE', message: 'Queued order type is invalid' },
      });
    }

    const pricedOrder = priceOrderItems(tenantId, raw.items);
    if ('error' in pricedOrder) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ORDER_ITEMS', message: pricedOrder.error },
      });
    }

    const discountAmount = Number(raw.discountAmount ?? 0);
    const serviceCharge = Number(raw.serviceCharge ?? 0);
    const maximumDiscount = Math.round(pricedOrder.subtotal * 0.2);
    if (
      !Number.isFinite(discountAmount) ||
      !Number.isFinite(serviceCharge) ||
      discountAmount < 0 ||
      discountAmount > maximumDiscount ||
      serviceCharge !== 0
    ) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CHARGES', message: 'Queued discount cannot exceed 20% of the subtotal and service charges are not configured' },
      });
    }
    if (
      discountAmount > 0 &&
      req.user?.role !== 'PLATFORM_SUPER_ADMIN' &&
      !req.permissions?.includes('pos.discount.apply')
    ) {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Manager approval is required to sync discounted orders' },
      });
    }

    const paymentMethods: OrderRecord['paymentMethod'][] = [
      'cash',
      'card',
      'jazzcash',
      'easypaisa',
      'bank_transfer',
      'split',
    ];
    const paymentMethod = raw.paymentMethod ?? 'cash';
    if (!paymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYMENT_METHOD', message: 'Queued order payment method is invalid' },
      });
    }
    const taxAmount = Math.round(pricedOrder.subtotal * 0.13);
    const deliveryFee = orderType === 'delivery' ? branch.standardDeliveryFee : 0;
    preparedOrders.push({
      tenantId,
      branchId: branch.id,
      channel: 'pos',
      orderType,
      tableNumber: typeof raw.tableNumber === 'string' ? raw.tableNumber.slice(0, 40) : undefined,
      customerName: typeof raw.customerName === 'string' ? raw.customerName.slice(0, 120) : 'Walk-in Guest',
      customerPhone: typeof raw.customerPhone === 'string' ? raw.customerPhone.slice(0, 40) : '',
      deliveryAddress: typeof raw.deliveryAddress === 'string' ? raw.deliveryAddress.slice(0, 500) : undefined,
      items: pricedOrder.items,
      subtotal: pricedOrder.subtotal,
      taxAmount,
      deliveryFee,
      discountAmount,
      serviceCharge,
      grandTotal: Math.max(0, pricedOrder.subtotal + taxAmount + deliveryFee + serviceCharge - discountAmount),
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending',
      kdsStatus: 'new',
      terminalId: typeof raw.terminalId === 'string' ? raw.terminalId.slice(0, 40) : 'POS-01',
      cashierName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Offline POS Cashier',
      clientNonce,
    });
  }

  const synced = preparedOrders.map((order) => dbStore.createOrder(order));
  dbStore.addAuditLog(
    tenantId,
    req.user?.id || null,
    req.user?.email || 'pos-offline-agent',
    'orders.batch_synced',
    'BatchOrders',
    `batch-${synced.length}`,
    { syncedCount: synced.length, duplicateCount: duplicates.length },
    req.ip || '127.0.0.1'
  );

  res.json({
    success: true,
    data: {
      syncedCount: synced.length,
      duplicateCount: duplicates.length,
      syncedOrders: synced,
    },
    message: `Successfully synchronized ${synced.length} offline orders (${duplicates.length} duplicate nonces ignored safely)`,
    }
  );
});
