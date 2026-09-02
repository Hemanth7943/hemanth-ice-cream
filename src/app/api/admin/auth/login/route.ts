import { AdminAuthController } from '@/controllers/AdminAuthController';

export async function POST(req: Request) {
  return AdminAuthController.login(req);
}
