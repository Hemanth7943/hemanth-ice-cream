import { AuthController } from '@/controllers/AuthController';

export async function POST(req: Request) {
  return AuthController.verifyOtp(req);
}
