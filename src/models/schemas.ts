import { z } from 'zod';

// ==========================================
// ZOD VALIDATION SCHEMAS (MVC MODEL LAYER)
// ==========================================

export const TubSizeEnum = z.enum(['G500', 'G1000']);
export const DeliveryTypeEnum = z.enum(['DELIVERY', 'DINE_IN', 'TAKEAWAY']);
export const OrderStatusEnum = z.enum([
  'PENDING_PAYMENT',
  'PAID_CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'EXPIRED',
]);

export const QRContextSchema = z.object({
  table: z.string().optional(),
  stand: z.string().optional(),
  zone: z.string().optional(),
  deliveryZone: z.string().optional(),
  campaign: z.string().optional(),
}).optional();

export const CartItemSchema = z.object({
  inventoryItemId: z.string().uuid().or(z.string().min(1)),
  flavourId: z.string().uuid().or(z.string().min(1)),
  flavourName: z.string().min(1),
  size: TubSizeEnum,
  price: z.number().positive(),
  quantity: z.number().int().min(1).max(20),
});

export const CreateOrderSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  deliveryType: DeliveryTypeEnum.default('DELIVERY'),
  qrContext: QRContextSchema,
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  items: z.array(CartItemSchema).min(1, 'Order must contain at least one flavour tub'),
});

export const ReserveStockSchema = z.object({
  orderId: z.string().min(1),
  items: z.array(
    z.object({
      inventoryItemId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1),
});

export const ReleaseStockSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().optional(),
});

export const PaymentSessionSchema = z.object({
  orderId: z.string().min(1),
  gateway: z.enum(['UPI_DEMO', 'RAZORPAY', 'STRIPE', 'SIMULATED']).default('UPI_DEMO'),
});

export const VerifyUpiPaymentSchema = z.object({
  orderId: z.string().min(1),
  merchantUpiId: z.string().default('hemanth.icecreams@okhdfcbank'),
  payerUpiId: z.string().optional(),
  utrNumber: z.string().min(4, 'UTR / Transaction Reference number is required'),
  app: z.string().optional(),
});

export const WebhookPayloadSchema = z.object({
  event: z.enum(['payment.captured', 'payment.failed', 'order.paid', 'payment.refunded']),
  orderId: z.string().min(1),
  gatewayPaymentId: z.string().optional(),
  gatewayOrderId: z.string().optional(),
  amount: z.number().optional(),
  signature: z.string().optional(),
  payerUpiId: z.string().optional(),
  utrNumber: z.string().optional(),
});

export const AuthSendOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  name: z.string().optional(),
});

export const AuthVerifyOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
});

export type CartItemDTO = z.infer<typeof CartItemSchema>;
export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
export type QRContextDTO = z.infer<typeof QRContextSchema>;
export type VerifyUpiPaymentDTO = z.infer<typeof VerifyUpiPaymentSchema>;
export type WebhookPayloadDTO = z.infer<typeof WebhookPayloadSchema>;
