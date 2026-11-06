-- ==============================================================================
-- ENTERPRISE RESTAURANT OPERATING SYSTEM (EROS) - DATABASE SCHEMA
-- Target Engine: PostgreSQL 15+
-- Design: Strict Multi-Tenant Relational Isolation with Row-Level Security (RLS)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. SAAS PLATFORM & TENANT MANAGEMENT
-- -----------------------------------------------------------------------------

CREATE TYPE tenant_status AS ENUM ('active', 'trial', 'suspended', 'cancelled');
CREATE TYPE subscription_tier AS ENUM ('starter', 'growth', 'enterprise', 'custom');
CREATE TYPE billing_interval AS ENUM ('monthly', 'annual');

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    legal_business_name VARCHAR(200),
    tax_identifier VARCHAR(50), -- NTN / STRN / VAT / Tax ID
    currency VARCHAR(3) DEFAULT 'PKR',
    status tenant_status NOT NULL DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ,
    primary_contact_name VARCHAR(100),
    primary_contact_email VARCHAR(150) NOT NULL,
    primary_contact_phone VARCHAR(50) NOT NULL,
    branding_logo_url TEXT,
    branding_primary_color VARCHAR(10) DEFAULT '#10b981',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'growth',
    interval billing_interval NOT NULL DEFAULT 'monthly',
    base_price NUMERIC(12, 2) NOT NULL,
    max_branches INT NOT NULL DEFAULT 5,
    max_pos_terminals INT NOT NULL DEFAULT 10,
    max_users INT NOT NULL DEFAULT 30,
    feature_flags JSONB NOT NULL DEFAULT '{"kds": true, "sms_crm": true, "accounting": true, "inventory": true}',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    is_auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL, -- e.g. KHI-01
    city VARCHAR(100) NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    delivery_radius_km NUMERIC(5, 2) DEFAULT 8.0,
    min_order_amount NUMERIC(10, 2) DEFAULT 500.0,
    standard_delivery_fee NUMERIC(10, 2) DEFAULT 100.0,
    opening_time TIME NOT NULL DEFAULT '11:00:00',
    closing_time TIME NOT NULL DEFAULT '01:00:00',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, code)
);

CREATE TABLE terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    terminal_code VARCHAR(30) NOT NULL, -- POS-01, DRIVE-THRU-01
    device_fingerprint VARCHAR(255) UNIQUE,
    assigned_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. RBAC & USER AUTHENTICATION
-- -----------------------------------------------------------------------------

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for platform roles
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) UNIQUE NOT NULL, -- e.g. 'pos.order.create', 'accounting.journal.post'
    module VARCHAR(50) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for Super Admins
    primary_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    phone VARCHAR(50),
    pin_code_hash VARCHAR(255), -- Fast 4-6 digit cashier PIN
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE, -- Optional branch boundary
    PRIMARY KEY (user_id, role_id, branch_id)
);

-- -----------------------------------------------------------------------------
-- 3. MENU & CATALOG ENGINE
-- -----------------------------------------------------------------------------

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    urdu_name VARCHAR(100),
    slug VARCHAR(120) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    urdu_name VARCHAR(150),
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) DEFAULT 0.0,
    image_url TEXT,
    is_deal BOOLEAN NOT NULL DEFAULT FALSE,
    is_tax_inclusive BOOLEAN NOT NULL DEFAULT TRUE,
    tax_rate_percent NUMERIC(5, 2) DEFAULT 13.0, -- Default provincial sales tax
    kitchen_station_code VARCHAR(50) DEFAULT 'GENERAL', -- GRILL, KARAHI, BEVERAGES
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, sku)
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. 'Half', 'Full', '1 KG', 'Single'
    sku_modifier VARCHAR(30),
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. 'Spice Level', 'Add Naan', 'Extra Sauces'
    min_selection INT NOT NULL DEFAULT 0,
    max_selection INT NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- Branch-level price override & stock status
CREATE TABLE branch_product_overrides (
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    custom_price NUMERIC(10, 2),
    is_available BOOLEAN NOT NULL DEFAULT TRUE, -- 86 List toggle
    PRIMARY KEY (branch_id, product_id)
);

-- -----------------------------------------------------------------------------
-- 4. ORDER MANAGEMENT & POS TRANSACTIONS
-- -----------------------------------------------------------------------------

CREATE TYPE order_channel AS ENUM ('pos', 'online_web', 'ios_app', 'android_app', 'qr_dinein', 'whatsapp', 'phone');
CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'pickup', 'delivery', 'drive_thru');
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'accepted', 'in_kitchen', 'ready', 'dispatched', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partially_paid', 'paid', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'jazzcash', 'easypaisa', 'bank_transfer', 'split');

CREATE TABLE dining_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_number VARCHAR(30) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    section_name VARCHAR(50) DEFAULT 'Main Hall', -- e.g. Family Hall, Outdoor, Majlis
    is_occupied BOOLEAN NOT NULL DEFAULT FALSE,
    current_order_id UUID,
    UNIQUE (branch_id, table_number)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    terminal_id UUID REFERENCES terminals(id),
    table_id UUID REFERENCES dining_tables(id),
    cashier_user_id UUID REFERENCES users(id),
    order_number VARCHAR(50) NOT NULL, -- Daily sequence or company sequence e.g. KHI-2026-10491
    offline_client_uuid UUID, -- ID generated on offline POS
    channel order_channel NOT NULL DEFAULT 'pos',
    type order_type NOT NULL DEFAULT 'dine_in',
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    
    customer_id UUID,
    customer_name VARCHAR(120),
    customer_phone VARCHAR(50),
    delivery_address TEXT,
    delivery_area VARCHAR(100),
    special_notes TEXT,
    
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    service_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    tip_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id),
    quantity NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    special_instructions TEXT,
    kitchen_status VARCHAR(30) NOT NULL DEFAULT 'pending' -- pending, preparing, ready, served
);

CREATE TABLE order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method payment_method NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    reference_number VARCHAR(100),
    terminal_payment_auth_code VARCHAR(100),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. KITCHEN DISPLAY SYSTEM (KDS) & ROUTING
-- -----------------------------------------------------------------------------

CREATE TABLE kitchen_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- GRILL, TANDOOR, KARAHI, BEVERAGE
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    UNIQUE (branch_id, code)
);

CREATE TABLE kitchen_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES kitchen_stations(id) ON DELETE RESTRICT,
    ticket_number VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new', -- new, preparing, ready, collected
    started_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. INVENTORY, RECIPES & PROCUREMENTS
-- -----------------------------------------------------------------------------

CREATE TABLE units_of_measure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL, -- kg, g, l, ml, pcs
    name VARCHAR(50) NOT NULL
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uom_id UUID NOT NULL REFERENCES units_of_measure(id),
    item_code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80), -- Meat, Dairy, Spices, Packaging
    current_cost_per_unit NUMERIC(12, 4) NOT NULL DEFAULT 0.0,
    reorder_level NUMERIC(10, 2) DEFAULT 10.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    yield_quantity NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
    yield_unit VARCHAR(30) DEFAULT 'portion',
    instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity_required NUMERIC(12, 4) NOT NULL,
    wastage_allowance_percent NUMERIC(5, 2) DEFAULT 0.0
);

-- Branch level stock balances
CREATE TABLE branch_inventory_balances (
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity_on_hand NUMERIC(12, 4) NOT NULL DEFAULT 0.0,
    last_counted_at TIMESTAMPTZ,
    PRIMARY KEY (branch_id, inventory_item_id)
);

CREATE TYPE stock_movement_type AS ENUM ('pos_sale_deduction', 'purchase_receipt', 'branch_transfer', 'waste_spoilage', 'audit_adjustment');

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    movement_type stock_movement_type NOT NULL,
    quantity_delta NUMERIC(12, 4) NOT NULL, -- negative for sales/waste, positive for receipts
    unit_cost NUMERIC(12, 4) NOT NULL,
    total_cost NUMERIC(12, 2) NOT NULL,
    reference_id UUID, -- order_id or purchase_order_id
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. DOUBLE-ENTRY ACCOUNTING & FINANCE
-- -----------------------------------------------------------------------------

CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL, -- 1010 (Cash on Hand), 1020 (Bank Account), 4010 (Food Sales)
    name VARCHAR(150) NOT NULL,
    type account_type NOT NULL,
    is_reconciled BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (tenant_id, account_code)
);

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT,
    entry_number VARCHAR(50) NOT NULL, -- JV-2026-0001
    entry_date DATE NOT NULL,
    reference_order_id UUID REFERENCES orders(id),
    memo TEXT NOT NULL,
    is_posted BOOLEAN NOT NULL DEFAULT TRUE,
    posted_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    debit NUMERIC(14, 2) NOT NULL DEFAULT 0.0,
    credit NUMERIC(14, 2) NOT NULL DEFAULT 0.0,
    description TEXT,
    CONSTRAINT check_debit_or_credit CHECK (
        (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
    )
);

-- -----------------------------------------------------------------------------
-- 8. AUDIT TRAILS & OFFLINE POS SYNC QUEUE
-- -----------------------------------------------------------------------------

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(80) NOT NULL, -- e.g. 'order.void', 'inventory.adjust', 'role.grant'
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    ip_address VARCHAR(45),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pos_offline_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    terminal_id UUID NOT NULL REFERENCES terminals(id),
    client_transaction_uuid UUID UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'synced',
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ROW-LEVEL SECURITY (RLS) POLICIES EXAMPLE
-- -----------------------------------------------------------------------------

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_orders ON orders
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_products ON products
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_journal ON journal_entries
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
