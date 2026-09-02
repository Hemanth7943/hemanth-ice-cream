import { OrderController } from '@/controllers/OrderController';

export async function POST(req: Request) {
  return OrderController.createOrder(req);
}

export async function GET() {
  return OrderController.getLiveOrders();
}
