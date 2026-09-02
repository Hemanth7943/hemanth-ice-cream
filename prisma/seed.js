const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATALOG = [
  {
    slug: 'royal-belgian-dark-truffle',
    name: 'Royal Belgian Dark Truffle',
    tagline: '70% Single-Origin Callebaut Cocoa with Molten Truffle Swirls',
    description: 'An opulent symphony of intensely rich Belgian dark chocolate infused with slow-churned Jersey dairy and gold-dusted cocoa nibs.',
    tastingNotes: 'Deep roasted cocoa, Madagascar bourbon woodiness, molten velvet finish.',
    primaryColor: '#18120E',
    secondaryColor: '#D4AF37',
    accentColor: '#FFD700',
    badge: 'Signature Grand Cru',
    texturePattern: 'DARK_TRUFFLE',
    ingredients: 'Fresh Jersey Cream, 70% Belgian Dark Chocolate, Organic Cocoa Nibs, Cane Sugar, Gold Dust',
    displayOrder: 1,
    prices: { G500: 380, G1000: 690 },
    initialStock: { G500: 45, G1000: 30 },
  },
  {
    slug: 'madagascar-bourbon-vanilla',
    name: 'Madagascar Bourbon Vanilla',
    tagline: 'Cured Whole Vanilla Pods Churned with Double Cream',
    description: 'Authentic gourmet vanilla harvested from the Sava region of Madagascar, studded with visible caviar seeds in a velvety golden base.',
    tastingNotes: 'Sweet aromatic warmth, rich custard undertones, floral blossom trail.',
    primaryColor: '#2B231B',
    secondaryColor: '#F5E6C8',
    accentColor: '#E6C786',
    badge: 'Artisanal Classic',
    texturePattern: 'BOURBON_VANILLA',
    ingredients: 'Double Jersey Cream, Madagascar Vanilla Bean Caviar, Whole Milk, Golden Turbinado Sugar',
    displayOrder: 2,
    prices: { G500: 320, G1000: 580 },
    initialStock: { G500: 60, G1000: 40 },
  },
  {
    slug: 'roasted-pistachio-saffron',
    name: 'Roasted Pistachio & Saffron',
    tagline: 'Bronte Pistachio Praline with Kashmiri Mogra Saffron',
    description: 'Slow-roasted Sicilian pistachios folded with hand-picked Kashmiri saffron threads and crushed emerald pistachio praline crunch.',
    tastingNotes: 'Nutty earthiness, fragrant saffron honey, subtle cardamom warmth.',
    primaryColor: '#1B261D',
    secondaryColor: '#C4D6B0',
    accentColor: '#F4D03F',
    badge: 'Royal Heritage',
    texturePattern: 'PISTACHIO_SAFFRON',
    ingredients: 'Roasted Bronte Pistachio Paste, Kashmiri Mogra Saffron, Whole Milk, Crushed Pistachios, Pure Ghee',
    displayOrder: 3,
    prices: { G500: 420, G1000: 750 },
    initialStock: { G500: 35, G1000: 25 },
  },
  {
    slug: 'alphonso-mango-silk',
    name: 'Alphonso Mango Silk',
    tagline: 'Ratnagiri GI Alphonso Mango Reduction with Whipped Mascarpone',
    description: 'Sun-ripened royal Ratnagiri Alphonso mangoes reduced into a vibrant nectar and marbled through rich whipped cream.',
    tastingNotes: 'Tropical sunburst, silky honey-nectar, luscious buttery finish.',
    primaryColor: '#2D1F08',
    secondaryColor: '#FFB830',
    accentColor: '#FF9900',
    badge: 'Summer Reserve',
    texturePattern: 'MANGO_SILK',
    ingredients: 'Pure Ratnagiri Alphonso Mango Pulp, Mascarpone Cheese, Fresh Cream, Unrefined Cane Sugar',
    displayOrder: 4,
    prices: { G500: 340, G1000: 620 },
    initialStock: { G500: 50, G1000: 35 },
  },
  {
    slug: 'wild-berry-mascarpone',
    name: 'Wild Berry & Mascarpone',
    tagline: 'Nordic Forest Berries Swirled in Velvety Italian Mascarpone',
    description: 'A delicate tapestry of wild blackberries, blueberries, and raspberries simmered with citrus zest and folded into Italian mascarpone.',
    tastingNotes: 'Vibrant berry tartness, creamy cheese velvet, lingering pomegranate aroma.',
    primaryColor: '#28111E',
    secondaryColor: '#D980A4',
    accentColor: '#E91E63',
    badge: 'Masterpiece',
    texturePattern: 'BERRY_MASCARPONE',
    ingredients: 'Wild Berry Reduction, Italian Mascarpone, Double Cream, Lemon Zest',
    displayOrder: 5,
    prices: { G500: 390, G1000: 710 },
    initialStock: { G500: 40, G1000: 28 },
  },
  {
    slug: 'salted-butterscotch-crunch',
    name: 'Salted Butterscotch Crunch',
    tagline: 'Smoked Cornish Sea Salt with Toffee Praline Splinters',
    description: 'Old-world caramelized brown butter toffee blended with hand-harvested flaky Cornish sea salt and brittle butterscotch crystals.',
    tastingNotes: 'Caramelized brown sugar, salty-sweet contrast, crunchy praline shards.',
    primaryColor: '#261B12',
    secondaryColor: '#E0A96D',
    accentColor: '#C68B59',
    badge: 'Confectioner Gold',
    texturePattern: 'BUTTERSCOTCH_CRUNCH',
    ingredients: 'Caramelized Brown Butter, Cornish Sea Salt Flakes, Crunchy Toffee Praline, Farmhouse Milk, Cream',
    displayOrder: 6,
    prices: { G500: 330, G1000: 600 },
    initialStock: { G500: 55, G1000: 38 },
  },
];

async function main() {
  console.log('--- Seeding Hemanth Ice Creams Database & Role-Based Profiles ---');

  // 1. Seed Customer User
  const customer = await prisma.user.upsert({
    where: { phoneNumber: '+919876543210' },
    update: { name: 'Lord Hemanth (VIP Connoisseur)', role: 'CUSTOMER' },
    create: {
      phoneNumber: '+919876543210',
      email: 'connoisseur@hemanthicecreams.com',
      name: 'Lord Hemanth (VIP Connoisseur)',
      role: 'CUSTOMER',
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  // 2. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '+919999999999' },
    update: { name: 'Chef Hemanth P (Executive Pâtissier)', role: 'ADMIN', pinCode: '9999' },
    create: {
      phoneNumber: '+919999999999',
      email: 'executive@hemanthicecreams.com',
      name: 'Chef Hemanth P (Executive Pâtissier)',
      role: 'ADMIN',
      pinCode: '9999',
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  // 3. Seed Kitchen Staff User
  const kitchen = await prisma.user.upsert({
    where: { phoneNumber: '+918888888888' },
    update: { name: 'Central Dispatch Kitchen Staff', role: 'KITCHEN', pinCode: '8888' },
    create: {
      phoneNumber: '+918888888888',
      email: 'kitchen@hemanthicecreams.com',
      name: 'Central Dispatch Kitchen Staff',
      role: 'KITCHEN',
      pinCode: '8888',
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  // 4. Seed Initial Login Activity Logs for Admin to inspect
  await prisma.loginLog.createMany({
    data: [
      {
        userId: admin.id,
        phoneNumber: admin.phoneNumber,
        name: admin.name,
        role: 'ADMIN',
        status: 'SUCCESS',
        loginMethod: 'ADMIN_SECRET_KEY',
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        userId: customer.id,
        phoneNumber: customer.phoneNumber,
        name: customer.name,
        role: 'CUSTOMER',
        status: 'SUCCESS',
        loginMethod: 'VIP_ONE_CLICK',
        ipAddress: '103.21.14.88',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        userId: kitchen.id,
        phoneNumber: kitchen.phoneNumber,
        name: kitchen.name,
        role: 'KITCHEN',
        status: 'SUCCESS',
        loginMethod: 'STAFF_PIN',
        ipAddress: '192.168.1.25',
        userAgent: 'Cryo-Station-Terminal/1.0',
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
    ],
  });

  // 5. Seed Catalog Flavours & Inventory
  for (const item of CATALOG) {
    const flavour = await prisma.flavour.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        tagline: item.tagline,
        description: item.description,
        tastingNotes: item.tastingNotes,
        primaryColor: item.primaryColor,
        secondaryColor: item.secondaryColor,
        accentColor: item.accentColor,
        badge: item.badge,
        texturePattern: item.texturePattern,
        ingredients: item.ingredients,
        displayOrder: item.displayOrder,
      },
      create: {
        slug: item.slug,
        name: item.name,
        tagline: item.tagline,
        description: item.description,
        tastingNotes: item.tastingNotes,
        primaryColor: item.primaryColor,
        secondaryColor: item.secondaryColor,
        accentColor: item.accentColor,
        badge: item.badge,
        texturePattern: item.texturePattern,
        ingredients: item.ingredients,
        displayOrder: item.displayOrder,
      },
    });

    // 500g Tub
    await prisma.inventoryItem.upsert({
      where: {
        flavourId_size: {
          flavourId: flavour.id,
          size: 'G500',
        },
      },
      update: { price: item.prices.G500 },
      create: {
        flavourId: flavour.id,
        size: 'G500',
        price: item.prices.G500,
        stockQuantity: item.initialStock.G500,
        reservedQuantity: 0,
      },
    });

    // 1000g Family Tub
    await prisma.inventoryItem.upsert({
      where: {
        flavourId_size: {
          flavourId: flavour.id,
          size: 'G1000',
        },
      },
      update: { price: item.prices.G1000 },
      create: {
        flavourId: flavour.id,
        size: 'G1000',
        price: item.prices.G1000,
        stockQuantity: item.initialStock.G1000,
        reservedQuantity: 0,
      },
    });

    console.log(`✓ Seeded flavour: ${item.name} (500g: ₹${item.prices.G500}, 1000g: ₹${item.prices.G1000})`);
  }

  console.log('--- Database seeding completed with Login Logs and Role Profiles ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
