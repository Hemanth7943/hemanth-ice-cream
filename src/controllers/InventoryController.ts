import { NextResponse } from 'next/server';
import { InventoryModel } from '@/models/InventoryModel';
import { ReserveStockSchema, ReleaseStockSchema } from '@/models/schemas';

export class InventoryController {
  /**
   * GET /api/inventory
   * Fetches real-time stock levels with active reservations and cleanup
   */
  static async getStockSummary() {
    try {
      const summary = await InventoryModel.getLiveStockSummary();
      return NextResponse.json({ success: true, data: summary });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to fetch inventory' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/inventory/hold
   * Places an atomic 10-minute pessimistic hold on requested inventory
   */
  static async reserveStock(req: Request) {
    try {
      const body = await req.json();
      const validated = ReserveStockSchema.parse(body);

      const result = await InventoryModel.reserveStock(validated.orderId, validated.items, 10);

      return NextResponse.json({
        success: true,
        message: '10-minute stock reservation confirmed',
        expiresAt: result.expiresAt,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Stock reservation conflict' },
        { status: 409 }
      );
    }
  }

  /**
   * POST /api/inventory/release
   * Explicitly releases held stock
   */
  static async releaseStock(req: Request) {
    try {
      const body = await req.json();
      const validated = ReleaseStockSchema.parse(body);

      const result = await InventoryModel.releaseReservation(validated.orderId, validated.reason || 'MANUAL_RELEASE');

      return NextResponse.json({
        success: true,
        message: 'Stock reservation released back to catalog',
        data: result,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to release reservation' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/inventory/cleanup
   * Triggers scheduled scan to release any holds that exceeded 10-min TTL
   */
  static async triggerCleanup() {
    try {
      const result = await InventoryModel.cleanupExpiredHolds();
      return NextResponse.json({
        success: true,
        message: `Processed expired holds: ${result.cleanedCount} cleared`,
        cleanedCount: result.cleanedCount,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Cleanup error' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/inventory/restock
   * Admin restock endpoint
   */
  static async restockItem(req: Request) {
    try {
      const body = await req.json();
      const { inventoryItemId, amount } = body;

      if (!inventoryItemId || !amount || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid restock parameters' },
          { status: 400 }
        );
      }

      const updated = await InventoryModel.addStock(inventoryItemId, parseInt(amount, 10));

      return NextResponse.json({
        success: true,
        message: `Restocked ${amount} units`,
        data: updated,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to restock item' },
        { status: 500 }
      );
    }
  }
}
