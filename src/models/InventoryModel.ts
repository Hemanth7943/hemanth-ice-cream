import prisma from '@/lib/db';

export interface ReservationItemRequest {
  inventoryItemId: string;
  quantity: number;
}

export class InventoryModel {
  /**
   * ATOMIC INVENTORY RESERVATION (10-minute pessimistic hold)
   * Executes within an interactive transaction to prevent race conditions & overselling.
   */
  static async reserveStock(orderId: string, items: ReservationItemRequest[], ttlMinutes: number = 10) {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      // 1. Verify availability for all requested items
      for (const item of items) {
        const inv = await tx.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
          include: { flavour: true },
        });

        if (!inv) {
          throw new Error(`Inventory item not found: ${item.inventoryItemId}`);
        }

        const available = inv.stockQuantity - inv.reservedQuantity;
        if (available < item.quantity) {
          throw new Error(
            `Insufficient stock for ${inv.flavour.name} (${inv.size === 'G500' ? '500g' : '1000g'}). Requested: ${item.quantity}, Available: ${Math.max(0, available)}`
          );
        }

        // 2. Increment reserved stock counter
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            reservedQuantity: { increment: item.quantity },
            version: { increment: 1 },
          },
        });

        // 3. Create active reservation record with 10-minute expiry
        await tx.inventoryReservation.create({
          data: {
            orderId,
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
            expiresAt,
            status: 'HELD',
          },
        });
      }

      // 4. Update order reservation expiry timestamp
      await tx.order.update({
        where: { id: orderId },
        data: {
          reservationExpiresAt: expiresAt,
        },
      });

      return { success: true, expiresAt };
    });
  }

  /**
   * PERMANENT STOCK COMMITMENT (Invoked upon verified payment webhook)
   * Deducts from physical stock and releases reservation hold.
   */
  static async commitReservation(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const reservations = await tx.inventoryReservation.findMany({
        where: { orderId, status: 'HELD' },
      });

      if (reservations.length === 0) {
        return { committed: 0, message: 'No active reservations to commit' };
      }

      for (const res of reservations) {
        // Permanently deduct stock and release held counter
        await tx.inventoryItem.update({
          where: { id: res.inventoryItemId },
          data: {
            stockQuantity: { decrement: res.quantity },
            reservedQuantity: { decrement: res.quantity },
            version: { increment: 1 },
          },
        });

        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: 'COMMITTED' },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID_CONFIRMED' },
      });

      return { committed: reservations.length, success: true };
    });
  }

  /**
   * INVENTORY RELEASE (Invoked on payment failure, user cancellation, or timeout)
   */
  static async releaseReservation(orderId: string, reason: string = 'CANCELLED') {
    return prisma.$transaction(async (tx) => {
      const reservations = await tx.inventoryReservation.findMany({
        where: { orderId, status: 'HELD' },
      });

      for (const res of reservations) {
        await tx.inventoryItem.update({
          where: { id: res.inventoryItemId },
          data: {
            reservedQuantity: { decrement: res.quantity },
            version: { increment: 1 },
          },
        });

        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: 'RELEASED' },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: reason === 'TIMEOUT' ? 'EXPIRED' : 'CANCELLED' },
      });

      return { released: reservations.length, success: true };
    });
  }

  /**
   * AUTOMATED CLEANUP OF EXPIRED 10-MINUTE HOLDS
   * Runs periodically or prior to inventory reads.
   */
  static async cleanupExpiredHolds() {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const expiredReservations = await tx.inventoryReservation.findMany({
        where: {
          status: 'HELD',
          expiresAt: { lt: now },
        },
      });

      if (expiredReservations.length === 0) return { cleanedCount: 0 };

      for (const res of expiredReservations) {
        await tx.inventoryItem.update({
          where: { id: res.inventoryItemId },
          data: {
            reservedQuantity: { decrement: res.quantity },
            version: { increment: 1 },
          },
        });

        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: 'EXPIRED' },
        });

        await tx.order.update({
          where: { id: res.orderId, status: 'PENDING_PAYMENT' },
          data: { status: 'EXPIRED' },
        });
      }

      return { cleanedCount: expiredReservations.length };
    });
  }

  /**
   * Fetch live inventory summary for kitchen/admin dashboard
   */
  static async getLiveStockSummary() {
    await this.cleanupExpiredHolds();

    const items = await prisma.inventoryItem.findMany({
      include: {
        flavour: true,
        reservations: {
          where: { status: 'HELD' },
          include: { order: true },
        },
      },
      orderBy: [{ flavour: { displayOrder: 'asc' } }, { size: 'asc' }],
    });

    return items.map((item) => ({
      id: item.id,
      flavourId: item.flavourId,
      flavourName: item.flavour.name,
      slug: item.flavour.slug,
      primaryColor: item.flavour.primaryColor,
      size: item.size,
      sizeLabel: item.size === 'G500' ? '500g Tub' : '1000g Family Tub',
      price: item.price,
      totalStock: item.stockQuantity,
      reservedStock: item.reservedQuantity,
      availableStock: Math.max(0, item.stockQuantity - item.reservedQuantity),
      activeReservations: item.reservations.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        orderNumber: r.order.orderNumber,
        quantity: r.quantity,
        expiresAt: r.expiresAt,
        remainingSeconds: Math.max(0, Math.floor((new Date(r.expiresAt).getTime() - Date.now()) / 1000)),
      })),
    }));
  }

  /**
   * Emergency restock for Admin
   */
  static async addStock(inventoryItemId: string, amount: number) {
    return prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: {
        stockQuantity: { increment: amount },
      },
    });
  }
}
