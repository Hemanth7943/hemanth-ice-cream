import prisma from '@/lib/db';

export class UserModel {
  /**
   * Find or create user by phone number
   */
  static async upsertCustomer(phoneNumber: string, name: string = 'Esteemed Guest') {
    return prisma.user.upsert({
      where: { phoneNumber },
      update: { name: name || undefined, lastLoginAt: new Date() },
      create: {
        phoneNumber,
        name: name || 'Esteemed Guest',
        role: 'CUSTOMER',
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Find or create user with specific role & PIN
   */
  static async upsertRoleUser(
    phoneNumber: string,
    name: string,
    role: 'CUSTOMER' | 'KITCHEN' | 'ADMIN',
    pinCode?: string
  ) {
    return prisma.user.upsert({
      where: { phoneNumber },
      update: {
        name,
        role,
        pinCode: pinCode || undefined,
        lastLoginAt: new Date(),
      },
      create: {
        phoneNumber,
        name,
        role,
        pinCode: pinCode || undefined,
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Find user by ID
   */
  static async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by phone number
   */
  static async getByPhone(phoneNumber: string) {
    return prisma.user.findUnique({
      where: { phoneNumber },
    });
  }

  /**
   * Fetch all registered customers and their order metrics for Admin View
   */
  static async getAllCustomersWithSpend() {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        loginLogs: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return customers.map((c) => {
      const successfulOrders = c.orders.filter(
        (o) => o.status === 'PAID_CONFIRMED' || o.status === 'PREPARING' || o.status === 'OUT_FOR_DELIVERY' || o.status === 'DELIVERED'
      );
      const totalSpent = successfulOrders.reduce((acc, o) => acc + o.totalAmount, 0);

      return {
        id: c.id,
        name: c.name,
        phoneNumber: c.phoneNumber,
        email: c.email,
        createdAt: c.createdAt,
        lastLoginAt: c.lastLoginAt,
        totalOrders: c.orders.length,
        completedOrders: successfulOrders.length,
        totalSpent,
        recentOrders: c.orders.slice(0, 5),
        recentLogins: c.loginLogs,
      };
    });
  }
}
