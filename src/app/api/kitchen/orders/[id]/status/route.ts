import { KitchenController } from '@/controllers/KitchenController';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return KitchenController.updatePrepStatus(params.id, req);
}
