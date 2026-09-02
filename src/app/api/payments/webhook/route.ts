import { PaymentController } from '@/controllers/PaymentController';

export async function POST(req: Request) {
  return PaymentController.handleWebhook(req);
}
