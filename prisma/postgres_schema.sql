-- ========================================================================
-- HEMANTH ICE CREAMS: Production PostgreSQL Schema & Migration
-- High-concurrency pessimistic inventory reservations with row-level locks
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "phoneNumber" VARCHAR(20) UNIQUE NOT NULL,
    "email" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) DEFAULT 'CUSTOMER' NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Flavours Catalog
CREATE TABLE IF NOT EXISTS "Flavour" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "slug" VARCHAR(100) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tagline" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "tastingNotes" TEXT NOT NULL,
    "primaryColor" VARCHAR(20) NOT NULL,
    "secondaryColor" VARCHAR(20) NOT NULL,
    "accentColor" VARCHAR(20) NOT NULL,
    "badge" VARCHAR(100),
    "texturePattern" VARCHAR(100) NOT NULL,
    "ingredients" TEXT NOT NULL,
    "displayOrder" INT DEFAULT 0 NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Inventory Items (500g & 1000g sizes per flavour)
CREATE TABLE IF NOT EXISTS "InventoryItem" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "flavourId" UUID NOT NULL REFERENCES "Flavour"("id") ON DELETE CASCADE,
    "size" VARCHAR(20) NOT NULL, -- 'G500', 'G1000'
    "price" DECIMAL(10,2) NOT NULL,
    "stockQuantity" INT DEFAULT 50 NOT NULL CHECK ("stockQuantity" >= 0),
    "reservedQuantity" INT DEFAULT 0 NOT NULL CHECK ("reservedQuantity" >= 0),
    "version" INT DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "UQ_Inventory_Flavour_Size" UNIQUE ("flavourId", "size"),
    CONSTRAINT "CHK_Stock_Constraint" CHECK ("reservedQuantity" <= "stockQuantity")
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS "Order" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderNumber" VARCHAR(50) UNIQUE NOT NULL,
    "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "customerName" VARCHAR(255) NOT NULL,
    "customerPhone" VARCHAR(20) NOT NULL,
    "deliveryType" VARCHAR(50) DEFAULT 'DELIVERY' NOT NULL,
    "qrContext" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "deliveryAddress" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'PENDING_PAYMENT' NOT NULL,
    "reservationExpiresAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Order Items
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "inventoryItemId" UUID NOT NULL REFERENCES "InventoryItem"("id"),
    "flavourName" VARCHAR(255) NOT NULL,
    "size" VARCHAR(20) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INT NOT NULL CHECK ("quantity" > 0),
    "totalPrice" DECIMAL(10,2) NOT NULL
);

-- 6. Inventory Reservations (Pessimistic Hold with 10-min TTL)
CREATE TABLE IF NOT EXISTS "InventoryReservation" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "inventoryItemId" UUID NOT NULL REFERENCES "InventoryItem"("id") ON DELETE CASCADE,
    "quantity" INT NOT NULL CHECK ("quantity" > 0),
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" VARCHAR(50) DEFAULT 'HELD' NOT NULL, -- 'HELD', 'COMMITTED', 'EXPIRED', 'RELEASED'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Payment Transactions
CREATE TABLE IF NOT EXISTS "PaymentTransaction" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "gateway" VARCHAR(50) DEFAULT 'RAZORPAY' NOT NULL,
    "gatewayOrderId" VARCHAR(255),
    "gatewayPaymentId" VARCHAR(255),
    "gatewaySignature" VARCHAR(255),
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'INR' NOT NULL,
    "status" VARCHAR(50) DEFAULT 'INITIATED' NOT NULL,
    "payloadJson" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for ultra-fast query performance
CREATE INDEX IF NOT EXISTS "IDX_Flavour_Slug" ON "Flavour"("slug");
CREATE INDEX IF NOT EXISTS "IDX_Inventory_Flavour" ON "InventoryItem"("flavourId");
CREATE INDEX IF NOT EXISTS "IDX_Reservation_Expiry_Status" ON "InventoryReservation"("expiresAt", "status");
CREATE INDEX IF NOT EXISTS "IDX_Order_Status" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "IDX_Order_Created" ON "Order"("createdAt" DESC);

-- ========================================================================
-- ATOMIC STORED PROCEDURE: PESSIMISTIC INVENTORY RESERVATION
-- Uses `SELECT ... FOR UPDATE` to lock row during reservation evaluation
-- ========================================================================
CREATE OR REPLACE FUNCTION reserve_inventory_for_order(
    p_order_id UUID,
    p_inventory_item_id UUID,
    p_quantity INT,
    p_ttl_minutes INT DEFAULT 10
) RETURNS BOOLEAN AS $$
DECLARE
    v_available INT;
BEGIN
    -- Pessimistic row-level lock on the specific SKU
    SELECT ("stockQuantity" - "reservedQuantity") INTO v_available
    FROM "InventoryItem"
    WHERE "id" = p_inventory_item_id
    FOR UPDATE;

    IF v_available IS NULL OR v_available < p_quantity THEN
        RETURN FALSE; -- Insufficient inventory
    END IF;

    -- Update reservation counters
    UPDATE "InventoryItem"
    SET "reservedQuantity" = "reservedQuantity" + p_quantity,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = p_inventory_item_id;

    -- Insert active reservation
    INSERT INTO "InventoryReservation" ("orderId", "inventoryItemId", "quantity", "expiresAt", "status")
    VALUES (p_order_id, p_inventory_item_id, p_quantity, CURRENT_TIMESTAMP + (p_ttl_minutes || ' minutes')::INTERVAL, 'HELD');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to release expired holds
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INT AS $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN 
        SELECT "id", "orderId", "inventoryItemId", "quantity"
        FROM "InventoryReservation"
        WHERE "status" = 'HELD' AND "expiresAt" < CURRENT_TIMESTAMP
        FOR UPDATE
    LOOP
        -- Release reserved stock counter
        UPDATE "InventoryItem"
        SET "reservedQuantity" = GREATEST(0, "reservedQuantity" - r.quantity),
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = r."inventoryItemId";

        -- Mark reservation expired
        UPDATE "InventoryReservation"
        SET "status" = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = r.id;

        -- Update order status
        UPDATE "Order"
        SET "status" = 'EXPIRED', "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = r."orderId" AND "status" = 'PENDING_PAYMENT';

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
