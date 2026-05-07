import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Replace these placeholder URLs with /menu/yourphoto.jpg once you upload
// real photos to public/menu/
const IMG = {
  jollof: "https://images.unsplash.com/photo-1604908554007-f8b73a40fc24?w=800",
  friedRice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
  plainRice: "https://images.unsplash.com/photo-1626078299034-94f4be4f4f0a?w=800",
  fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800",
  loadedFries: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800",
  salad: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
  potatoSalad: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800",
  pasta: "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800",
  spaghetti: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
  hotdog: "https://images.unsplash.com/photo-1612392062798-2cdf12d80bff?w=800",
  indomie: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800",
};

type SeedItem = {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  prices: number[]; // ascending portion-size prices
};

function variantLabels(n: number): string[] {
  if (n === 1) return ["Regular"];
  if (n === 2) return ["Small", "Large"];
  if (n === 3) return ["Small", "Medium", "Large"];
  if (n === 4) return ["Small", "Medium", "Large", "Family"];
  if (n === 5) return ["Small", "Medium", "Large", "Family", "Sharing"];
  return Array.from({ length: n }, (_, i) => `Size ${i + 1}`);
}

const items: SeedItem[] = [
  // ---------- RICE ----------
  { category: "Rice", imageUrl: IMG.jollof, name: "Jollof Rice with Charcoal Grilled Chicken", description: "Smoky charcoal grilled chicken on our signature jollof.", prices: [30, 40, 50, 60, 70] },
  { category: "Rice", imageUrl: IMG.jollof, name: "Jollof with Goat Meat", description: "Tender goat meat on rich, spicy jollof.", prices: [80, 90] },
  { category: "Rice", imageUrl: IMG.jollof, name: "Jollof with Red Fish", description: "Grilled red fish served on jollof rice.", prices: [50, 60, 70] },
  { category: "Rice", imageUrl: IMG.jollof, name: "Assorted Jollof", description: "Jollof loaded with mixed proteins for the hungry.", prices: [80, 100, 120, 150] },
  { category: "Rice", imageUrl: IMG.jollof, name: "Jollof Rice with Egg & Sausage", description: "A simple, satisfying combo.", prices: [50, 60] },
  { category: "Rice", imageUrl: IMG.jollof, name: "Jollof Rice with Turkey", description: "Juicy turkey served on jollof.", prices: [70, 80] },
  { category: "Rice", imageUrl: IMG.jollof, name: "Jollof with Beef Sauce", description: "Slow-cooked beef sauce ladled over jollof.", prices: [80, 100] },
  { category: "Rice", imageUrl: IMG.jollof, name: "Jollof with Chicken Sauce", description: "Saucy chicken stew over jollof.", prices: [80, 100] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Fried Rice with Charcoal Grilled Chicken", description: "Wok-tossed fried rice with grilled chicken.", prices: [30, 40, 50, 60, 70] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Assorted Fried Rice", description: "Fried rice with mixed proteins.", prices: [80, 100, 120, 150] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Fried Rice with Turkey", description: "Fried rice with juicy turkey.", prices: [70, 80] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Fried Rice with Goat Meat", description: "Fried rice with tender goat meat.", prices: [80, 100] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Fried Rice with Beef Sauce", description: "Fried rice topped with beef sauce.", prices: [80, 100] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Fried Rice with Chicken Sauce", description: "Fried rice topped with chicken sauce.", prices: [80, 100] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Egg Fried Rice with Grilled Chicken", description: "Egg fried rice with grilled chicken.", prices: [60, 70] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Vegetable Rice with Grilled Chicken", description: "Vegetable rice with grilled chicken.", prices: [60, 70] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Aroni Rice with Grilled Chicken", description: "Aroni rice with grilled chicken.", prices: [60, 70, 80] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Aroni Rice with Goat Meat", description: "Aroni rice with goat meat.", prices: [80, 100] },
  { category: "Rice", imageUrl: IMG.friedRice, name: "Aroni Rice with Red Fish", description: "Aroni rice with red fish.", prices: [70, 80, 100] },
  { category: "Rice", imageUrl: IMG.plainRice, name: "Plain Rice with Gravy Stew", description: "Plain rice served with gravy stew.", prices: [50, 60] },
  { category: "Rice", imageUrl: IMG.plainRice, name: "Plain Rice with Moyo Stew", description: "Plain rice with classic moyo stew.", prices: [60, 70, 80] },

  // ---------- FRIES ----------
  { category: "Fries", imageUrl: IMG.fries, name: "French Fries / Yam Chips + Chicken", description: "Crispy fries or yam chips with chicken.", prices: [50, 60] },
  { category: "Fries", imageUrl: IMG.fries, name: "French Fries / Yam Chips + Gizzard", description: "Crispy fries or yam chips with gizzard.", prices: [50, 60] },
  { category: "Fries", imageUrl: IMG.fries, name: "French Fries / Yam Chips + Sausage", description: "Crispy fries or yam chips with sausage.", prices: [50, 60] },
  { category: "Fries", imageUrl: IMG.fries, name: "French Fries / Yam Chips + Tilapia", description: "Crispy fries or yam chips with grilled tilapia.", prices: [70, 80, 100] },
  { category: "Fries", imageUrl: IMG.loadedFries, name: "Loaded Fries", description: "Fully loaded fries with cheese, sauces and toppings.", prices: [70, 80, 100, 120] },

  // ---------- SALAD ----------
  { category: "Salads", imageUrl: IMG.potatoSalad, name: "Potato Salad", description: "Creamy potato salad.", prices: [40, 50] },
  { category: "Salads", imageUrl: IMG.salad, name: "Beetroot Salad", description: "Fresh beetroot salad.", prices: [30, 40] },
  { category: "Salads", imageUrl: IMG.salad, name: "Chicken Salad", description: "Fresh greens with grilled chicken.", prices: [30, 40, 50] },
  { category: "Salads", imageUrl: IMG.salad, name: "Tuna Salad", description: "Fresh greens with seasoned tuna.", prices: [30, 40, 50] },
  { category: "Salads", imageUrl: IMG.salad, name: "Avocado Salad", description: "Avocado over fresh greens.", prices: [40, 50] },
  { category: "Salads", imageUrl: IMG.salad, name: "Beef Salad", description: "Fresh greens with strips of beef.", prices: [40, 50, 60] },
  { category: "Salads", imageUrl: IMG.salad, name: "3 Seconds Special Salad", description: "Our house signature salad.", prices: [50, 60] },
  { category: "Salads", imageUrl: IMG.pasta, name: "Pasta Salad", description: "Cool pasta salad.", prices: [30, 40, 50] },
  { category: "Salads", imageUrl: IMG.salad, name: "Vegetable / Mixed Salad", description: "Vegetable mixed salad.", prices: [30, 40, 50] },

  // ---------- SANDWICH ----------
  { category: "Sandwiches", imageUrl: IMG.sandwich, name: "Egg Sandwich", description: "Fluffy egg sandwich.", prices: [40] },
  { category: "Sandwiches", imageUrl: IMG.sandwich, name: "Protein Sandwich", description: "Loaded protein sandwich.", prices: [40, 50] },
  { category: "Sandwiches", imageUrl: IMG.sandwich, name: "Vegetable Sandwich", description: "Fresh vegetable sandwich.", prices: [40, 50] },
  { category: "Sandwiches", imageUrl: IMG.sandwich, name: "Club Sandwich", description: "Triple-decker club sandwich.", prices: [40, 50] },
  { category: "Sandwiches", imageUrl: IMG.sandwich, name: "Tuna Club Sandwich", description: "Triple-decker with seasoned tuna.", prices: [40, 50] },
  { category: "Sandwiches", imageUrl: IMG.burger, name: "Chicken Burger", description: "Crispy chicken burger.", prices: [40] },
  { category: "Sandwiches", imageUrl: IMG.burger, name: "Beef Burger", description: "Juicy beef burger.", prices: [40] },
  { category: "Sandwiches", imageUrl: IMG.burger, name: "Cheese Burger", description: "Beef burger topped with melted cheese.", prices: [40] },
  { category: "Sandwiches", imageUrl: IMG.hotdog, name: "Hot Dog", description: "Classic hot dog with your favourite sauces.", prices: [40] },

  // ---------- PASTA ----------
  { category: "Pasta", imageUrl: IMG.spaghetti, name: "Spaghetti Bolognese", description: "Spaghetti in our rich bolognese sauce.", prices: [50, 60] },
  { category: "Pasta", imageUrl: IMG.pasta, name: "Assorted Pasta", description: "Pasta loaded with mixed proteins.", prices: [80, 100] },
  { category: "Pasta", imageUrl: IMG.indomie, name: "Assorted Indomie", description: "Indomie tossed with mixed proteins and vegetables.", prices: [50, 70, 80, 100] },
];

async function main() {
  // --- Manager account ---
  const passwordHash = await bcrypt.hash("kitchen123", 10);
  await prisma.user.upsert({
    where: { email: "manager@3seckitchen.gh" },
    update: {},
    create: {
      email: "manager@3seckitchen.gh",
      password: passwordHash,
      name: "Kitchen Manager",
      role: "manager",
    },
  });

  // --- Wipe and reseed menu ---
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});

  for (const it of items) {
    const labels = variantLabels(it.prices.length);
    const min = Math.min(...it.prices);
    const max = Math.max(...it.prices);
    await prisma.product.create({
      data: {
        name: it.name,
        description: it.description,
        category: it.category,
        imageUrl: it.imageUrl,
        minPriceGhs: min,
        maxPriceGhs: max,
        variants: {
          create: it.prices.map((price, i) => ({
            label: labels[i],
            priceGhs: price,
            position: i,
          })),
        },
      },
    });
  }

  const variantCount = await prisma.productVariant.count();
  console.log(
    `Seed complete. ${items.length} menu items, ${variantCount} portion variants loaded.`
  );
  console.log("Manager login -> manager@3seckitchen.gh / kitchen123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
