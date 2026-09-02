import { AdminController } from '@/controllers/AdminController';

export async function GET() {
  return AdminController.getLoginLogs();
}
