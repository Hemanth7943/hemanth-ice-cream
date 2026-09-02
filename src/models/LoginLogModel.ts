import prisma from '@/lib/db';

export interface RecordLoginParams {
  userId?: string;
  phoneNumber: string;
  name?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'KITCHEN';
  status: 'SUCCESS' | 'FAILED';
  loginMethod: 'OTP' | 'VIP_ONE_CLICK' | 'STAFF_PIN' | 'ADMIN_SECRET' | 'ADMIN_QUICK' | 'KITCHEN_QUICK';
  ipAddress?: string;
  userAgent?: string;
}

export class LoginLogModel {
  /**
   * Record every customer, staff, or admin login event with audit trail
   */
  static async record(params: RecordLoginParams) {
    try {
      return await prisma.loginLog.create({
        data: {
          userId: params.userId || null,
          phoneNumber: params.phoneNumber,
          name: params.name || null,
          role: params.role,
          status: params.status,
          loginMethod: params.loginMethod,
          ipAddress: params.ipAddress || '127.0.0.1',
          userAgent: params.userAgent || 'Web Browser',
        },
      });
    } catch (e) {
      console.warn('Failed to record login log:', e);
      return null;
    }
  }

  /**
   * Get recent login logs for the Master Admin dashboard
   */
  static async getRecentLogs(limit: number = 50) {
    return prisma.loginLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });
  }

  /**
   * Get login metrics summary for Admin
   */
  static async getLogStats() {
    const total = await prisma.loginLog.count();
    const customerLogins = await prisma.loginLog.count({ where: { role: 'CUSTOMER' } });
    const adminLogins = await prisma.loginLog.count({ where: { role: 'ADMIN' } });
    const kitchenLogins = await prisma.loginLog.count({ where: { role: 'KITCHEN' } });

    return {
      totalLogins: total,
      byRole: {
        customer: customerLogins,
        admin: adminLogins,
        kitchen: kitchenLogins,
      },
    };
  }
}
