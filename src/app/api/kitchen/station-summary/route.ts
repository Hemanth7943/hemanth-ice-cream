import { KitchenController } from '@/controllers/KitchenController';

export async function GET() {
  return KitchenController.getStationSummary();
}
