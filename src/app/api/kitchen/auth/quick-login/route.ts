import { KitchenAuthController } from '@/controllers/KitchenAuthController';

export async function POST() {
  return KitchenAuthController.quickLogin();
}
