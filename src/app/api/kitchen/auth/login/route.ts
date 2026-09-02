import { KitchenAuthController } from '@/controllers/KitchenAuthController';

export async function POST(req: Request) {
  return KitchenAuthController.login(req);
}
