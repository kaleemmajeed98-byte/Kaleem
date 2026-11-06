import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface TenantRecord {
  id: string;
  name: string;
  slug: string;
  legalBusinessName: string;
  taxIdentifier: string;
  currency: string;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  subscriptionTier: 'starter' | 'growth' | 'enterprise';
  maxBranches: number;
  maxTerminals: number;
  monthlyGmv: number;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  logoInitial: string;
  primaryColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchRecord {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  deliveryRadiusKm: number;
  minOrderAmount: number;
  standardDeliveryFee: number;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  tenantId: string | null; // null for platform super admin
  primaryBranchId?: string;
  email: string;
  passwordHash: string;
  pinHash: string; // 6-digit PIN for cashier quick switch
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  tenantId: string | null;
  userId: string | null;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  timestamp: string;
}

export type KitchenStation = 'GRILL' | 'KARAHI_WOK' | 'TANDOOR' | 'BEVERAGE_DESSERT' | 'PACKING';

export interface CategoryRecord {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuItemRecord {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  basePrice: number;
  station: KitchenStation;
  image?: string;
  isAvailable: boolean;
  preparationMinutes: number;
  spiciness?: 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';
  variants?: { name: string; price: number }[];
  modifiers?: { name: string; price: number }[];
}

export interface OrderItemRecord {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  station: KitchenStation;
  notes?: string;
  variant?: string;
  selectedModifiers?: string[];
  itemStatus: 'pending' | 'cooking' | 'ready';
}

export interface OrderRecord {
  id: string;
  tenantId: string;
  branchId: string;
  orderNumber: string;
  channel: 'pos' | 'web' | 'dine_in' | 'takeaway' | 'delivery' | 'drive_thru';
  orderType: 'dine_in' | 'takeaway' | 'delivery' | 'drive_thru';
  tableNumber?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  items: OrderItemRecord[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  serviceCharge: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'split';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'voided';
  kdsStatus: 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  terminalId?: string;
  cashierName?: string;
  clientNonce?: string; // For idempotency and offline sync
}

export interface CashTransactionRecord {
  id: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  reason: string;
  createdAt: string;
  userId: string;
}

export interface CashierShiftRecord {
  id: string;
  tenantId: string;
  branchId: string;
  userId: string;
  cashierName: string;
  terminalId: string;
  openingCash: number;
  transactions: CashTransactionRecord[];
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  expectedCash?: number;
  closingCash?: number;
  cashDifference?: number;
}

const SCRYPT_KEY_LENGTH = 64;

function hashCredential(value: string, purpose: 'password' | 'pin'): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(`${purpose}:${value}`, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return `scrypt-${purpose}$${salt}$${hash}`;
}

function verifyCredential(value: string, encoded: string, purpose: 'password' | 'pin'): boolean {
  const [algorithm, salt, hash, extra] = encoded.split('$');
  if (
    algorithm !== `scrypt-${purpose}` ||
    !salt ||
    !hash ||
    extra !== undefined ||
    !/^[a-f0-9]{32}$/.test(salt) ||
    !/^[a-f0-9]{128}$/.test(hash)
  ) {
    return false;
  }

  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(`${purpose}:${value}`, salt, SCRYPT_KEY_LENGTH);
  return crypto.timingSafeEqual(actual, expected);
}

export function hashPassword(password: string): string {
  return hashCredential(password, 'password');
}

export function verifyPassword(password: string, encoded: string): boolean {
  return verifyCredential(password, encoded, 'password');
}

export function isModernPasswordHash(encoded: string): boolean {
  return /^scrypt-password\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(encoded);
}

export function isValidPassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 12 && password.length <= 128;
}

export function hashPin(pin: string): string {
  return hashCredential(pin, 'pin');
}

export function isValidPin(pin: unknown): pin is string {
  return typeof pin === 'string' && /^\d{6}$/.test(pin);
}

export function verifyPin(pin: string, encoded: string): boolean {
  return verifyCredential(pin, encoded, 'pin');
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 bytes before starting the server.');
  }
  return secret;
}
const JWT_SECRET = getJwtSecret();

export function signJwt(payload: Record<string, any>, expiresInSeconds: number = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${encode(header)}.${encode(fullPayload)}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(unsignedToken)
    .digest('base64url');

  return `${unsignedToken}.${signature}`;
}

export function verifyJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const unsignedToken = `${headerB64}.${payloadB64}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(unsignedToken)
      .digest('base64url');

    const suppliedSignature = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    if (
      suppliedSignature.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(suppliedSignature, expectedSignatureBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null; // expired

    return payload;
  } catch {
    return null;
  }
}

// ==============================================================================
// INITIAL PERSISTENT IN-MEMORY REPOSITORY WITH SEED DATA
// ==============================================================================

class DataStore {
  tenants: TenantRecord[] = [];
  branches: BranchRecord[] = [];
  users: UserRecord[] = [];
  auditLogs: AuditLogRecord[] = [];
  shifts: CashierShiftRecord[] = [];
  categories: CategoryRecord[] = [];
  menuItems: MenuItemRecord[] = [];
  orders: OrderRecord[] = [];
  private orderSequence: number = 1040;

  constructor() {
    if (!this.loadFromDisk()) {
      this.seedInitialData();
      this.saveToDisk();
    }
  }

  saveToDisk() {
    try {
      const dir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, 'eros_data.json');
      const dump = {
        tenants: this.tenants,
        branches: this.branches,
        users: this.users,
        categories: this.categories,
        menuItems: this.menuItems,
        orders: this.orders,
        auditLogs: this.auditLogs,
        shifts: this.shifts,
        orderSequence: this.orderSequence,
      };
      fs.writeFileSync(filePath, JSON.stringify(dump, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Failed to save to disk:', err);
    }
  }

  loadFromDisk(): boolean {
    try {
      const filePath = path.resolve(process.cwd(), 'data', 'eros_data.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.tenants && Array.isArray(data.tenants) && data.tenants.length > 0) {
          this.tenants = data.tenants;
          this.branches = data.branches || [];
          this.users = data.users || [];
          for (const user of this.users) {
            if (!Array.isArray(user.permissions)) user.permissions = [];
            if (
              ['RESTAURANT_OWNER', 'BRANCH_MANAGER'].includes(user.role) &&
              !user.permissions.includes('menu.manage')
            ) {
              user.permissions.push('menu.manage');
            }
            if (
              ['RESTAURANT_OWNER', 'BRANCH_MANAGER'].includes(user.role) &&
              !user.permissions.includes('pos.discount.apply')
            ) {
              user.permissions.push('pos.discount.apply');
            }
          }
          this.categories = data.categories || [];
          this.menuItems = data.menuItems || [];
          this.orders = data.orders || [];
          this.auditLogs = data.auditLogs || [];
          this.shifts = data.shifts || [];
          this.orderSequence = data.orderSequence || 1040;
          console.log(`[DataStore] Loaded persistent data from disk (${this.tenants.length} tenants, ${this.orders.length} orders)`);
          return true;
        }
      }
    } catch (err) {
      console.error('[DataStore] Failed to load from disk:', err);
    }
    return false;
  }

  private seedInitialData() {
    // Tenant 1: Kababjees Group
    const kababjeesId = 'tenant-kababjees-01';
    this.tenants.push({
      id: kababjeesId,
      name: 'Kababjees Group',
      slug: 'kababjees',
      legalBusinessName: 'Kababjees Foods (Pvt) Ltd',
      taxIdentifier: 'NTN-7819234-1',
      currency: 'PKR',
      status: 'active',
      subscriptionTier: 'enterprise',
      maxBranches: 20,
      maxTerminals: 50,
      monthlyGmv: 34500000,
      primaryContactName: 'Muhammad Asif',
      primaryContactEmail: 'owner@kababjees.com',
      primaryContactPhone: '+92 321 8899123',
      logoInitial: 'K',
      primaryColor: '#10b981',
      createdAt: '2026-01-10T12:00:00Z',
      updatedAt: '2026-11-05T00:00:00Z',
    });

    // Branches for Kababjees
    const brKbj1 = 'br-kbj-shaheed-e-millat';
    const brKbj2 = 'br-kbj-clifton';
    const brKbj3 = 'br-kbj-dha-phase6';

    this.branches.push(
      {
        id: brKbj1,
        tenantId: kababjeesId,
        name: 'Shaheed-e-Millat (Flagship)',
        code: 'KHI-01',
        city: 'Karachi',
        address: 'Plot 20, Al-Rehman Corner, DMCHS, Tariq Rd opp Traffic Choki',
        phone: '+92 321 2312279',
        email: 'shaheed@kababjees.com',
        deliveryRadiusKm: 8.5,
        minOrderAmount: 800,
        standardDeliveryFee: 100,
        openingTime: '12:00:00',
        closingTime: '01:30:00',
        isActive: true,
        createdAt: '2026-01-10T12:00:00Z',
      },
      {
        id: brKbj2,
        tenantId: kababjeesId,
        name: 'Clifton (Boat Basin Food Street)',
        code: 'KHI-02',
        city: 'Karachi',
        address: 'Near Boat Basin Park, Block 4, Clifton',
        phone: '+92 21 35876541',
        email: 'clifton@kababjees.com',
        deliveryRadiusKm: 10.0,
        minOrderAmount: 1000,
        standardDeliveryFee: 150,
        openingTime: '12:00:00',
        closingTime: '02:00:00',
        isActive: true,
        createdAt: '2026-02-01T12:00:00Z',
      },
      {
        id: brKbj3,
        tenantId: kababjeesId,
        name: 'DHA Phase 6 (Bukhari Commercial)',
        code: 'KHI-03',
        city: 'Karachi',
        address: 'Plot 14-C, Main Bukhari Commercial, DHA Phase 6',
        phone: '+92 21 35349812',
        email: 'dha@kababjees.com',
        deliveryRadiusKm: 9.0,
        minOrderAmount: 1200,
        standardDeliveryFee: 150,
        openingTime: '13:00:00',
        closingTime: '02:00:00',
        isActive: true,
        createdAt: '2026-03-15T12:00:00Z',
      }
    );

    // Tenant 2: Mehmaan Restaurant
    const mehmaanId = 'tenant-mehmaan-02';
    this.tenants.push({
      id: mehmaanId,
      name: 'Mehmaan Restaurant',
      slug: 'mehmaan',
      legalBusinessName: 'Mehmaan Hospitality Enterprises',
      taxIdentifier: 'NTN-6644211-9',
      currency: 'PKR',
      status: 'active',
      subscriptionTier: 'growth',
      maxBranches: 5,
      maxTerminals: 12,
      monthlyGmv: 4200000,
      primaryContactName: 'Zubair Hashmi',
      primaryContactEmail: 'owner@mehmaan.pk',
      primaryContactPhone: '+92 321 2312279',
      logoInitial: 'M',
      primaryColor: '#f59e0b',
      createdAt: '2026-02-14T10:00:00Z',
      updatedAt: '2026-11-05T00:00:00Z',
    });

    this.branches.push({
      id: 'br-mehmaan-tariq-rd',
      tenantId: mehmaanId,
      name: 'Tariq Road Flagship',
      code: 'MHM-01',
      city: 'Karachi',
      address: 'Plot no 20 Shop 4 Al-Rehman Corner, DMCHS, Tariq Rd opp Traffic Choki',
      phone: '+92 321 2312279',
      email: 'orders@mehmaan.pk',
      deliveryRadiusKm: 8.0,
      minOrderAmount: 600,
      standardDeliveryFee: 100,
      openingTime: '12:00:00',
      closingTime: '01:00:00',
      isActive: true,
      createdAt: '2026-02-14T10:00:00Z',
    });

    // Seed Categories and Menu Items for Kababjees Group & Mehmaan Restaurant
    this.seedDefaultMenuForTenant(kababjeesId, 'Kababjees');
    this.seedDefaultMenuForTenant(mehmaanId, 'Mehmaan Restaurant');

    // 5. Seed Initial Live Orders for KDS & POS
    this.orders.push(
      {
        id: 'ord-1021',
        tenantId: kababjeesId,
        branchId: brKbj1,
        orderNumber: 'IND-1021',
        channel: 'pos',
        orderType: 'dine_in',
        tableNumber: 'T-04',
        customerName: 'Muhammad Salman',
        customerPhone: '+92 300 2345678',
        items: [
          {
            id: 'item-1021-1',
            menuItemId: `item-mhm-1-${kababjeesId}`,
            name: 'Kababjees Special Mutton Karahi',
            quantity: 1,
            unitPrice: 2850,
            totalPrice: 2850,
            station: 'KARAHI_WOK',
            variant: 'Full (1.0 kg)',
            notes: 'Extra ginger & spicy',
            itemStatus: 'cooking',
          },
          {
            id: 'item-1021-2',
            menuItemId: `item-mhm-7-${kababjeesId}`,
            name: 'Roghani Sesame Naan',
            quantity: 4,
            unitPrice: 120,
            totalPrice: 480,
            station: 'TANDOOR',
            itemStatus: 'cooking',
          },
        ],
        subtotal: 3330,
        taxAmount: 433,
        deliveryFee: 0,
        discountAmount: 0,
        serviceCharge: 150,
        grandTotal: 3913,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        kdsStatus: 'preparing',
        createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        cashierName: 'Bilal Ahmed',
      },
      {
        id: 'ord-1022',
        tenantId: kababjeesId,
        branchId: brKbj1,
        orderNumber: 'IND-1022',
        channel: 'web',
        orderType: 'delivery',
        customerName: 'Ayesha Siddiqui',
        customerPhone: '+92 321 8899221',
        deliveryAddress: 'House 42, Block 3, DMCHS, Karachi',
        items: [
          {
            id: 'item-1022-1',
            menuItemId: `item-mhm-3-${kababjeesId}`,
            name: 'Chicken Malai Boti (12 Pcs)',
            quantity: 2,
            unitPrice: 1250,
            totalPrice: 2500,
            station: 'GRILL',
            itemStatus: 'cooking',
          },
          {
            id: 'item-1022-2',
            menuItemId: `item-mhm-8-${kababjeesId}`,
            name: 'Garlic Butter Herb Naan',
            quantity: 4,
            unitPrice: 150,
            totalPrice: 600,
            station: 'TANDOOR',
            itemStatus: 'ready',
          },
          {
            id: 'item-1022-3',
            menuItemId: `item-mhm-9-${kababjeesId}`,
            name: 'Fresh Mint Lemonade Cooler',
            quantity: 2,
            unitPrice: 320,
            totalPrice: 640,
            station: 'BEVERAGE_DESSERT',
            itemStatus: 'ready',
          },
        ],
        subtotal: 3740,
        taxAmount: 486,
        deliveryFee: 120,
        discountAmount: 374,
        serviceCharge: 0,
        grandTotal: 3972,
        paymentMethod: 'jazzcash',
        paymentStatus: 'paid',
        kdsStatus: 'ready',
        createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
      {
        id: 'ord-1023',
        tenantId: mehmaanId,
        branchId: 'br-mehmaan-tariq-rd',
        orderNumber: 'MHM-1023',
        channel: 'pos',
        orderType: 'takeaway',
        customerName: 'Daniyal Khan',
        customerPhone: '+92 345 9876543',
        items: [
          {
            id: 'item-1023-1',
            menuItemId: `item-mhm-1-${mehmaanId}`,
            name: 'Mehmaan Special Mutton Karahi',
            quantity: 1,
            unitPrice: 2850,
            totalPrice: 2850,
            station: 'KARAHI_WOK',
            variant: 'Full (1.0 kg)',
            itemStatus: 'pending',
          },
          {
            id: 'item-1023-2',
            menuItemId: `item-mhm-4-${mehmaanId}`,
            name: 'Beef Seekh Kabab Royal (4 Skewers)',
            quantity: 2,
            unitPrice: 1390,
            totalPrice: 2780,
            station: 'GRILL',
            itemStatus: 'pending',
          },
          {
            id: 'item-1023-3',
            menuItemId: `item-mhm-7-${mehmaanId}`,
            name: 'Roghani Sesame Naan',
            quantity: 6,
            unitPrice: 120,
            totalPrice: 720,
            station: 'TANDOOR',
            itemStatus: 'pending',
          },
        ],
        subtotal: 6350,
        taxAmount: 825,
        deliveryFee: 0,
        discountAmount: 0,
        serviceCharge: 0,
        grandTotal: 7175,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        kdsStatus: 'new',
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        cashierName: 'Zubair Hashmi',
      }
    );

    // 6. Initial Audit Log
    this.addAuditLog(
      null,
      'usr-super-admin',
      'admin@indolj.enterprise',
      'system.boot',
      'System',
      'eros-core',
      { status: 'Initialized Phase 1 multi-tenant architecture & POS/KDS engine' },
      '127.0.0.1'
    );
  }

  getNextOrderNumber(prefix = 'IND'): string {
    this.orderSequence += 1;
    return `${prefix}-${this.orderSequence}`;
  }

  createShift(shiftData: Omit<CashierShiftRecord, 'id' | 'transactions' | 'status' | 'openedAt'>): CashierShiftRecord {
    const shift: CashierShiftRecord = {
      ...shiftData,
      id: `shift-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      transactions: [],
      status: 'open',
      openedAt: new Date().toISOString(),
    };
    this.shifts.unshift(shift);
    this.saveToDisk();
    return shift;
  }

  addCashTransaction(
    shift: CashierShiftRecord,
    transaction: Omit<CashTransactionRecord, 'id' | 'createdAt'>
  ): CashTransactionRecord {
    const record: CashTransactionRecord = {
      ...transaction,
      id: `cash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    shift.transactions.push(record);
    this.saveToDisk();
    return record;
  }

  createOrder(orderData: Partial<OrderRecord>): OrderRecord {
    const tenant = this.tenants.find((t) => t.id === orderData.tenantId);
    const prefix = tenant?.slug ? tenant.slug.substring(0, 3).toUpperCase() : 'ORD';
    const orderNumber = orderData.orderNumber || this.getNextOrderNumber(prefix);
    const now = new Date().toISOString();

    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId: orderData.tenantId!,
      branchId: orderData.branchId!,
      orderNumber,
      channel: orderData.channel || 'pos',
      orderType: orderData.orderType || 'dine_in',
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName || 'Walk-in Guest',
      customerPhone: orderData.customerPhone || '',
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      taxAmount: orderData.taxAmount || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discountAmount: orderData.discountAmount || 0,
      serviceCharge: orderData.serviceCharge || 0,
      grandTotal: orderData.grandTotal || 0,
      paymentMethod: orderData.paymentMethod || 'cash',
      paymentStatus: orderData.paymentStatus || 'paid',
      kdsStatus: orderData.kdsStatus || 'new',
      createdAt: orderData.createdAt || now,
      updatedAt: now,
      terminalId: orderData.terminalId,
      cashierName: orderData.cashierName,
      clientNonce: orderData.clientNonce,
    };

    this.orders.unshift(newOrder);

    // Update tenant GMV
    if (tenant && newOrder.paymentStatus === 'paid') {
      tenant.monthlyGmv = (tenant.monthlyGmv || 0) + newOrder.grandTotal;
    }

    this.saveToDisk();
    return newOrder;
  }

  updateOrderStatus(orderId: string, nextStatus: OrderRecord['kdsStatus']): OrderRecord | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.kdsStatus = nextStatus;
    order.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return order;
  }

  addAuditLog(
    tenantId: string | null,
    userId: string | null,
    userEmail: string,
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, any>,
    ipAddress: string
  ): AuditLogRecord {
    const record: AuditLogRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      userId,
      userEmail,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(record);
    this.saveToDisk();
    return record;
  }

  seedDefaultMenuForTenant(tId: string, restaurantName: string) {
    const existing = this.categories.some((c) => c.tenantId === tId);
    if (existing) return;

    const catBbq = `cat-bbq-${tId}`;
    const catKarahi = `cat-karahi-${tId}`;
    const catRice = `cat-rice-${tId}`;
    const catTandoor = `cat-tandoor-${tId}`;
    const catBev = `cat-bev-${tId}`;

    this.categories.push(
      { id: catBbq, tenantId: tId, name: 'Charcoal BBQ & Grills', slug: 'bbq', displayOrder: 1, isActive: true },
      { id: catKarahi, tenantId: tId, name: 'Karahi & Handi Specials', slug: 'karahi', displayOrder: 2, isActive: true },
      { id: catRice, tenantId: tId, name: 'Rice, Pulao & Biryani', slug: 'rice', displayOrder: 3, isActive: true },
      { id: catTandoor, tenantId: tId, name: 'Tandoor & Fresh Breads', slug: 'tandoor', displayOrder: 4, isActive: true },
      { id: catBev, tenantId: tId, name: 'Beverages & Desserts', slug: 'beverages', displayOrder: 5, isActive: true }
    );

    this.menuItems.push(
      {
        id: `item-1-${tId}`,
        tenantId: tId,
        categoryId: catKarahi,
        categoryName: 'Karahi & Handi Specials',
        name: `${restaurantName} Special Mutton Karahi`,
        description: 'Cooked in pure desi butter with ginger julienne, black pepper, and organic fresh green chilies.',
        basePrice: 2850,
        station: 'KARAHI_WOK',
        isAvailable: true,
        preparationMinutes: 25,
        spiciness: 'Medium',
        variants: [
          { name: 'Half (0.5 kg)', price: 1550 },
          { name: 'Full (1.0 kg)', price: 2850 },
        ],
      },
      {
        id: `item-2-${tId}`,
        tenantId: tId,
        categoryId: catKarahi,
        categoryName: 'Karahi & Handi Specials',
        name: 'Chicken White Makhni Handi',
        description: 'Boneless chicken cubes simmered in dairy cream, almond paste, and cracked white pepper.',
        basePrice: 1950,
        station: 'KARAHI_WOK',
        isAvailable: true,
        preparationMinutes: 20,
        spiciness: 'Mild',
        variants: [
          { name: 'Half Handi', price: 1100 },
          { name: 'Full Handi', price: 1950 },
        ],
      },
      {
        id: `item-3-${tId}`,
        tenantId: tId,
        categoryId: catBbq,
        categoryName: 'Charcoal BBQ & Grills',
        name: 'Chicken Malai Boti (12 Pcs)',
        description: 'Melt-in-mouth chicken breast skewers marinated with cardamom, rich cream, and mild green herbs.',
        basePrice: 1250,
        station: 'GRILL',
        isAvailable: true,
        preparationMinutes: 18,
        spiciness: 'Mild',
      },
      {
        id: `item-4-${tId}`,
        tenantId: tId,
        categoryId: catBbq,
        categoryName: 'Charcoal BBQ & Grills',
        name: 'Beef Seekh Kabab Royal (4 Skewers)',
        description: 'Hand-minced prime beef tenderloin blended with smoked cumin, shallots, and tandoori spices.',
        basePrice: 1390,
        station: 'GRILL',
        isAvailable: true,
        preparationMinutes: 15,
        spiciness: 'Hot',
      },
      {
        id: `item-5-${tId}`,
        tenantId: tId,
        categoryId: catBbq,
        categoryName: 'Charcoal BBQ & Grills',
        name: 'Signature Mutton Chops (6 Pcs)',
        description: 'Charcoal grilled prime baby lamb chops glazed with raw papaya marinade and dry spices.',
        basePrice: 2450,
        station: 'GRILL',
        isAvailable: true,
        preparationMinutes: 22,
        spiciness: 'Medium',
      },
      {
        id: `item-6-${tId}`,
        tenantId: tId,
        categoryId: catRice,
        categoryName: 'Rice, Pulao & Biryani',
        name: `${restaurantName} Royal Dum Biryani`,
        description: 'Aged basmati rice sealed in earthen handi with succulent pieces and saffron essence.',
        basePrice: 1190,
        station: 'KARAHI_WOK',
        isAvailable: true,
        preparationMinutes: 10,
        spiciness: 'Hot',
      },
      {
        id: `item-7-${tId}`,
        tenantId: tId,
        categoryId: catTandoor,
        categoryName: 'Tandoor & Fresh Breads',
        name: 'Roghani Sesame Naan',
        description: 'Baked in hot clay oven with milk wash, clarified butter, and toasted white sesame seeds.',
        basePrice: 120,
        station: 'TANDOOR',
        isAvailable: true,
        preparationMinutes: 6,
      },
      {
        id: `item-8-${tId}`,
        tenantId: tId,
        categoryId: catTandoor,
        categoryName: 'Tandoor & Fresh Breads',
        name: 'Garlic Butter Herb Naan',
        description: 'Infused with roasted garlic cloves and chopped coriander, brushed with salted farm butter.',
        basePrice: 150,
        station: 'TANDOOR',
        isAvailable: true,
        preparationMinutes: 6,
      },
      {
        id: `item-9-${tId}`,
        tenantId: tId,
        categoryId: catBev,
        categoryName: 'Beverages & Desserts',
        name: 'Fresh Mint Lemonade Cooler',
        description: 'Crushed garden mint, freshly squeezed Sindhi lemons, black salt, and sparkling soda.',
        basePrice: 320,
        station: 'BEVERAGE_DESSERT',
        isAvailable: true,
        preparationMinutes: 5,
      },
      {
        id: `item-10-${tId}`,
        tenantId: tId,
        categoryId: catBev,
        categoryName: 'Beverages & Desserts',
        name: 'Zafrani Matka Kheer',
        description: 'Slow-cooked condensed milk rice pudding flavored with green cardamom and pure Kashmiri saffron.',
        basePrice: 380,
        station: 'BEVERAGE_DESSERT',
        isAvailable: true,
        preparationMinutes: 3,
      }
    );
    this.saveToDisk();
  }
}

export const dbStore = new DataStore();
