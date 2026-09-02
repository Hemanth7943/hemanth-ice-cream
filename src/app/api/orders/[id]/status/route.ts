import { OrderController } from '@/controllers/OrderController';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return OrderController.updateStatus(params.id, req);
}
