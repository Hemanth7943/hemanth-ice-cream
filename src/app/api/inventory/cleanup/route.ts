import { InventoryController } from '@/controllers/InventoryController';

export async function POST() {
  return InventoryController.triggerCleanup();
}
