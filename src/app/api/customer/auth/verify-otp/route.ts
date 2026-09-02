import { CustomerAuthController } from '@/controllers/CustomerAuthController';

export async function POST(req: Request) {
  return CustomerAuthController.verifyOtp(req);
}
