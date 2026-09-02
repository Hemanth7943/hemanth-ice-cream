import { AuthController } from '@/controllers/AuthController';

export async function POST() {
  return AuthController.logout();
}
