import prisma from '@/lib/db';
import { CreateOrderDTO } from './schemas';
import { calculateCartTotals, generateOrderNumber } from '@/lib/utils';
import { InventoryModel } from './InventoryModel';

export class OrderModel {
  /**
   * Create an Order with line items and initiate an atomic inventory reservation
   */
  static async createOrderWithReservation(dto: CreateOrderDTO) {
    const totals = calculateCartTotals(
      dto.items.map((i) => ({ price: i.price, quantity: i.quantity }))
    );
    const orderNumber = generateOrderNumber();

    // 1. Create order record
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        deliveryType: dto.deliveryType,
        qrContext: dto.qrContext ? JSON.stringify(dto.qrContext) : null,
        latitude: dto.latitude || null,
        longitude: dto.longitude || null,
        deliveryAddress: dto.deliveryAddress,
        subtotal: totals.subtotal,
        tax: totals.tax,
        deliveryFee: totals.deliveryFee,
        totalAmount: totals.totalAmount,
        status: 'PENDING_PAYMENT',
        orderItems: {
          create: dto.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            flavourName: item.flavourName,
            size: item.size === 'G500' ? '500g' : '1000g',
            unitPrice: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // 2. Perform atomic pessimistic stock hold
    try {
      const reservation = await InventoryModel.reserveStock(
        order.id,
        dto.items.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
        })),
        10 // 10 minutes hold
      );

      return {
        ...order,
        reservationExpiresAt: reservation.expiresAt,
      };
    } catch (err) {
      // If reservation fails, mark order as cancelled
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
      throw err;
    }
  }

  /**
   * Get full order details by ID
   */
  static async getById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        reservations: true,
        paymentTransactions: true,
      },
    });
  }

  /**
   * Get full order details by order number
   */
  static async getByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: true,
        reservations: true,
        paymentTransactions: true,
      },
    });
  }

  /**
   * Update order status (for kitchen workflow)
   */
  static async updateStatus(orderId: string, status: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { orderItems: true },
    });
  }

  /**
   * Get all live orders for kitchen dispatch display
   */
  static async getLiveOrders() {
    await InventoryModel.cleanupExpiredHolds();

    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        orderItems: true,
        reservations: true,
        paymentTransactions: true,
      },
    });
  }
}
