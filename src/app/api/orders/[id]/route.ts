import { OrderController } from '@/controllers/OrderController';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return OrderController.getOrder(params.id);
}
