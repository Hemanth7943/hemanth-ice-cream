import { NextResponse } from 'next/server';
import { InventoryModel } from '@/models/InventoryModel';
import { PaymentModel } from '@/models/PaymentModel';
import { OrderModel } from '@/models/OrderModel';
import { PaymentSessionSchema, VerifyUpiPaymentSchema, WebhookPayloadSchema } from '@/models/schemas';

const DEMO_UPI_ID = 'hemanth.icecreams@okhdfcbank';

export class PaymentController {
  /**
   * POST /api/payments/create
   * Initializes UPI Demo payment session with dynamic deep link
   */
  static async createSession(req: Request) {
    try {
      const body = await req.json();
      const validated = PaymentSessionSchema.parse(body);

      const order = await OrderModel.getById(validated.orderId);
      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      if (order.status !== 'PENDING_PAYMENT') {
        return NextResponse.json(
          { success: false, error: `Order is not awaiting payment (Current status: ${order.status})` },
          { status: 400 }
        );
      }

      const tx = await PaymentModel.createTransaction(order.id, validated.gateway, order.totalAmount);

      // Construct standard UPI payment URI
      const upiUri = `upi://pay?pa=${encodeURIComponent(DEMO_UPI_ID)}&pn=${encodeURIComponent(
        'Hemanth Ice Creams'
      )}&am=${order.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
        `Order ${order.orderNumber}`
      )}`;

      return NextResponse.json({
        success: true,
        gateway: validated.gateway,
        merchantUpiId: DEMO_UPI_ID,
        merchantName: 'Hemanth Ice Creams Haute Glacerie',
        amount: order.totalAmount,
        currency: 'INR',
        orderNumber: order.orderNumber,
        upiUri,
        gatewayOrderId: tx.gatewayOrderId,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Payment session initialization failed' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/payments/verify-upi
   * Verifies customer Demo UPI payment submission and commits stock permanently
   */
  static async verifyUpiPayment(req: Request) {
    try {
      const body = await req.json();
      const validated = VerifyUpiPaymentSchema.parse(body);

      const order = await OrderModel.getById(validated.orderId);
      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      if (order.status !== 'PENDING_PAYMENT') {
        return NextResponse.json(
          { success: false, error: `Order is already in state: ${order.status}` },
          { status: 400 }
        );
      }

      // 1. Permanently commit reserved inventory in the fresh vault
      await InventoryModel.commitReservation(validated.orderId);

      // 2. Record successful UPI transaction with UTR / Reference
      await PaymentModel.updateTransactionStatus(
        validated.orderId,
        'SUCCESS',
        validated.utrNumber,
        undefined,
        {
          merchantUpiId: validated.merchantUpiId,
          payerUpiId: validated.payerUpiId || 'customer@upi',
          utrNumber: validated.utrNumber,
          app: validated.app || 'Demo UPI Gateway',
          amount: order.totalAmount,
        }
      );

      return NextResponse.json({
        success: true,
        message: 'UPI payment verified successfully. Inventory permanently committed to order.',
        orderId: validated.orderId,
        orderNumber: order.orderNumber,
        utrNumber: validated.utrNumber,
        merchantUpiId: validated.merchantUpiId,
      });
    } catch (err: any) {
      console.error('UPI Verification error:', err);
      return NextResponse.json(
        { success: false, error: err.message || 'UPI verification failed' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/payments/webhook
   * Processes payment gateway webhooks (Razorpay / Stripe / UPI Webhook)
   */
  static async handleWebhook(req: Request) {
    try {
      const body = await req.json();
      const validated = WebhookPayloadSchema.parse(body);
      const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_luxury_hemanth_icecreams_test_signature';

      if (validated.signature && validated.gatewayOrderId && validated.gatewayPaymentId) {
        const isValid = PaymentModel.verifySignature(
          validated.gatewayOrderId,
          validated.gatewayPaymentId,
          validated.signature,
          secret
        );
        if (!isValid) {
          return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 403 });
        }
      }

      if (validated.event === 'payment.captured' || validated.event === 'order.paid') {
        await InventoryModel.commitReservation(validated.orderId);

        await PaymentModel.updateTransactionStatus(
          validated.orderId,
          'SUCCESS',
          validated.gatewayPaymentId || validated.utrNumber || `UPI-UTR-${Date.now()}`,
          validated.signature,
          body
        );

        return NextResponse.json({
          success: true,
          message: 'Payment confirmed. Inventory permanently committed to order.',
          orderId: validated.orderId,
        });
      } else if (validated.event === 'payment.failed') {
        await InventoryModel.releaseReservation(validated.orderId, 'PAYMENT_FAILED');

        await PaymentModel.updateTransactionStatus(
          validated.orderId,
          'FAILED',
          validated.gatewayPaymentId || validated.utrNumber,
          validated.signature,
          body
        );

        return NextResponse.json({
          success: true,
          message: 'Payment failed. Inventory reservation released.',
          orderId: validated.orderId,
        });
      }

      return NextResponse.json({ success: true, message: 'Event logged' });
    } catch (err: any) {
      console.error('Webhook error:', err);
      return NextResponse.json(
        { success: false, error: err.message || 'Webhook processing failed' },
        { status: 400 }
      );
    }
  }
}
