import { AdminAuthController } from '@/controllers/AdminAuthController';

export async function POST() {
  return AdminAuthController.quickLogin();
}
