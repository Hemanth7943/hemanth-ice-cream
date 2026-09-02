import { InventoryController } from '@/controllers/InventoryController';

export async function POST(req: Request) {
  return InventoryController.restockItem(req);
}
