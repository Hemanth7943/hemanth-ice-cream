import { NextResponse } from 'next/server';
import { OrderModel } from '@/models/OrderModel';
import { PaymentModel } from '@/models/PaymentModel';
import { CreateOrderSchema, UpdateOrderStatusSchema } from '@/models/schemas';

export class OrderController {
  /**
   * POST /api/orders
   * Creates an order, verifies GPS/QR context, and executes atomic 10-min stock reservation
   */
  static async createOrder(req: Request) {
    try {
      const body = await req.json();
      const validated = CreateOrderSchema.parse(body);

      // 1. Create order & reserve stock atomically
      const order = await OrderModel.createOrderWithReservation(validated);

      // 2. Initialize payment transaction record
      const paymentTx = await PaymentModel.createTransaction(
        order.id,
        'RAZORPAY',
        order.totalAmount
      );

      return NextResponse.json({
        success: true,
        message: 'Order created with 10-minute inventory reservation',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          subtotal: order.subtotal,
          tax: order.tax,
          deliveryFee: order.deliveryFee,
          status: order.status,
          reservationExpiresAt: order.reservationExpiresAt,
          items: order.orderItems,
        },
        payment: {
          gatewayOrderId: paymentTx.gatewayOrderId,
          amount: paymentTx.amount,
          currency: paymentTx.currency,
          keyId: 'rzp_test_luxury_hemanth_icecreams',
        },
      });
    } catch (err: any) {
      console.error('Order creation error:', err);
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to place order' },
        { status: 400 }
      );
    }
  }

  /**
   * GET /api/orders/[id]
   */
  static async getOrder(orderId: string) {
    try {
      const order = await OrderModel.getById(orderId);
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, order });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to retrieve order' },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/orders (Kitchen / Admin feed)
   */
  static async getLiveOrders() {
    try {
      const orders = await OrderModel.getLiveOrders();
      return NextResponse.json({ success: true, orders });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to fetch live orders' },
        { status: 500 }
      );
    }
  }

  /**
   * PATCH /api/orders/[id]/status
   */
  static async updateStatus(orderId: string, req: Request) {
    try {
      const body = await req.json();
      const validated = UpdateOrderStatusSchema.parse(body);

      const updated = await OrderModel.updateStatus(orderId, validated.status);
      return NextResponse.json({
        success: true,
        message: `Order status updated to ${validated.status}`,
        order: updated,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to update order status' },
        { status: 400 }
      );
    }
  }
}
