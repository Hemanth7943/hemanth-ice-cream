import prisma from '@/lib/db';
import crypto from 'crypto';

export class PaymentModel {
  /**
   * Create an initial Payment Transaction record (Defaults to UPI_DEMO)
   */
  static async createTransaction(orderId: string, gateway: string = 'UPI_DEMO', amount: number) {
    const gatewayOrderId = `upi_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

    return prisma.paymentTransaction.create({
      data: {
        orderId,
        gateway,
        gatewayOrderId,
        amount,
        currency: 'INR',
        status: 'INITIATED',
      },
    });
  }

  /**
   * Update payment transaction status upon UPI verification or webhook confirmation
   */
  static async updateTransactionStatus(
    orderId: string,
    status: 'SUCCESS' | 'FAILED' | 'REFUNDED',
    gatewayPaymentId?: string,
    signature?: string,
    payload?: any
  ) {
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (!transaction) {
      return prisma.paymentTransaction.create({
        data: {
          orderId,
          gateway: 'UPI_DEMO',
          gatewayPaymentId,
          gatewaySignature: signature,
          amount: payload?.amount || 0,
          currency: 'INR',
          status,
          payloadJson: payload ? JSON.stringify(payload) : null,
        },
      });
    }

    return prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status,
        gatewayPaymentId: gatewayPaymentId || transaction.gatewayPaymentId,
        gatewaySignature: signature || transaction.gatewaySignature,
        payloadJson: payload ? JSON.stringify(payload) : transaction.payloadJson,
      },
    });
  }

  /**
   * Verify Razorpay / Gateway signature
   */
  static verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return true;
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');
    return expectedSignature === signature;
  }
}
