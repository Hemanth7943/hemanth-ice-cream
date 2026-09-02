import prisma from '@/lib/db';

export class FlavourModel {
  /**
   * Fetch all active signature flavours with inventory pricing and real-time available stock
   */
  static async getAllActiveFlavours() {
    const flavours = await prisma.flavour.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        inventoryItems: {
          orderBy: { size: 'asc' },
        },
      },
    });

    return flavours.map((flavour) => ({
      ...flavour,
      inventory: flavour.inventoryItems.map((item) => ({
        id: item.id,
        size: item.size,
        sizeLabel: item.size === 'G500' ? '500g Tub' : '1000g Family Tub',
        price: item.price,
        stockQuantity: item.stockQuantity,
        reservedQuantity: item.reservedQuantity,
        availableStock: Math.max(0, item.stockQuantity - item.reservedQuantity),
        isAvailable: item.stockQuantity - item.reservedQuantity > 0,
      })),
    }));
  }

  /**
   * Fetch single flavour by slug with full inventory data
   */
  static async getBySlug(slug: string) {
    return prisma.flavour.findUnique({
      where: { slug },
      include: {
        inventoryItems: true,
      },
    });
  }

  /**
   * Fetch single flavour by ID
   */
  static async getById(id: string) {
    return prisma.flavour.findUnique({
      where: { id },
      include: {
        inventoryItems: true,
      },
    });
  }
}
