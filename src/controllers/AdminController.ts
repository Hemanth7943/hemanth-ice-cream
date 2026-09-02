import { NextResponse } from 'next/server';
import { LoginLogModel } from '@/models/LoginLogModel';
import { UserModel } from '@/models/UserModel';
import { InventoryModel } from '@/models/InventoryModel';
import { OrderModel } from '@/models/OrderModel';
import prisma from '@/lib/db';

export class AdminController {
  /**
   * GET /api/admin/login-logs
   * Master Admin view of all user & staff login activity
   */
  static async getLoginLogs() {
    try {
      const logs = await LoginLogModel.getRecentLogs(100);
      const stats = await LoginLogModel.getLogStats();

      return NextResponse.json({
        success: true,
        data: {
          logs,
          stats,
        },
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to fetch login logs' },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/admin/customers
   * Master Admin view of registered patrons, order metrics, and lifetime value
   */
  static async getCustomers() {
    try {
      const customers = await UserModel.getAllCustomersWithSpend();
      return NextResponse.json({ success: true, data: customers });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to fetch customer directory' },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/admin/analytics
   * Master Admin financial & operational dashboard
   */
  static async getAnalytics() {
    try {
      const orders = await prisma.order.findMany();

      const totalRevenue = orders
        .filter((o) => ['PAID_CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status))
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const totalTubsSold = await prisma.orderItem.aggregate({
        where: {
          order: {
            status: { in: ['PAID_CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
          },
        },
        _sum: { quantity: true },
      });

      const activeHolds = await prisma.inventoryReservation.count({
        where: { status: 'HELD' },
      });

      const orderStatusCounts = {
        pending: orders.filter((o) => o.status === 'PENDING_PAYMENT').length,
        paid: orders.filter((o) => o.status === 'PAID_CONFIRMED').length,
        preparing: orders.filter((o) => o.status === 'PREPARING').length,
        outForDelivery: orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
        delivered: orders.filter((o) => o.status === 'DELIVERED').length,
        cancelled: orders.filter((o) => o.status === 'CANCELLED' || o.status === 'EXPIRED').length,
      };

      return NextResponse.json({
        success: true,
        data: {
          totalRevenue,
          totalOrders: orders.length,
          tubsSold: totalTubsSold._sum.quantity || 0,
          activeHolds,
          orderStatusCounts,
        },
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to generate analytics' },
        { status: 500 }
      );
    }
  }
}
