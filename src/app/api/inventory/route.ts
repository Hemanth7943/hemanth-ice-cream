import { InventoryController } from '@/controllers/InventoryController';

export async function GET() {
  return InventoryController.getStockSummary();
}
