import { NextResponse } from 'next/server';
import { OrderModel } from '@/models/OrderModel';
import prisma from '@/lib/db';
import { UpdateOrderStatusSchema } from '@/models/schemas';

export class KitchenController {
  /**
   * GET /api/kitchen/queue
   * Live kitchen queue of active tickets
   */
  static async getLiveQueue() {
    try {
      const orders = await prisma.order.findMany({
        where: {
          status: {
            in: ['PAID_CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 40,
        include: {
          orderItems: true,
        },
      });

      return NextResponse.json({ success: true, orders });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to fetch kitchen queue' },
        { status: 500 }
      );
    }
  }

  /**
   * PATCH /api/kitchen/orders/[id]/status
   * Updates preparation status
   */
  static async updatePrepStatus(orderId: string, req: Request) {
    try {
      const body = await req.json();
      const validated = UpdateOrderStatusSchema.parse(body);

      const updated = await OrderModel.updateStatus(orderId, validated.status);

      return NextResponse.json({
        success: true,
        message: `Order status advanced to ${validated.status}`,
        order: updated,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to update kitchen ticket' },
        { status: 400 }
      );
    }
  }

  /**
   * GET /api/kitchen/station-summary
   * Aggregated batch quantities needed by flavour & size for churning staff
   */
  static async getStationSummary() {
    try {
      const pendingItems = await prisma.orderItem.findMany({
        where: {
          order: {
            status: { in: ['PAID_CONFIRMED', 'PREPARING'] },
          },
        },
      });

      // Group by flavourName and size
      const batchCounts: Record<string, { flavourName: string; size: string; count: number }> = {};

      for (const item of pendingItems) {
        const key = `${item.flavourName}_${item.size}`;
        if (!batchCounts[key]) {
          batchCounts[key] = { flavourName: item.flavourName, size: item.size, count: 0 };
        }
        batchCounts[key].count += item.quantity;
      }

      return NextResponse.json({
        success: true,
        data: Object.values(batchCounts),
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to generate station summary' },
        { status: 500 }
      );
    }
  }
}
