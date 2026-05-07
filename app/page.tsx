import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PizzaCard from "@/components/PizzaCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { available: true },
    orderBy: [{ category: "asc" }, { minPriceGhs: "asc" }],
    include: { variants: { orderBy: { position: "asc" } } },
  });

  const categoryOrder = ["Rice", "Fries", "Salads", "Sandwiches", "Pasta"];
  const categories = Array.from(new Set(products.map((p) => p.category))).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <div>
      <section className="bg-brand-500 text-white relative overflow-hidden">
        {/* Big faded "3 SECOND" watermark behind everything */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span className="text-[80px] sm:text-[140px] md:text-[240px] lg:text-[340px] font-black tracking-tighter text-white/[0.07] leading-none whitespace-nowrap">
            3 SECOND
          </span>
        </div>

        {/* Diagonal accent for depth */}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-brand-600/40 -skew-x-12 origin-top-right hidden md:block" />

        {/* Foreground content */}
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12 md:py-20 relative">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 md:gap-8 items-center">
            <div className="order-2 md:order-1">
              <span className="inline-block px-3 py-1 bg-accent-500 text-brand-900 text-[11px] sm:text-xs font-bold rounded-full uppercase tracking-wider">
                Order online · Accra
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mt-3 sm:mt-4 leading-tight">
                Fast. Fresh. <span className="text-accent-400">Flavorful.</span>
                <br />
                Always.
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/90 max-w-xl">
                Hot rice plates, fries, salads, sandwiches and pasta — straight
                from the 3sec Kitchen.
              </p>
              <a
                href="#menu"
                className="inline-block mt-5 sm:mt-6 bg-accent-500 hover:bg-accent-600 text-brand-900 px-5 sm:px-6 py-2.5 sm:py-3 rounded-md font-bold text-sm sm:text-base transition shadow-lg"
              >
                See the menu →
              </a>
            </div>

            {/* Chef image — drop public/chef.jpg to use your own */}
            <div className="order-1 md:order-2 relative h-44 sm:h-64 md:h-[420px] mx-auto md:mx-0 w-full max-w-xs md:max-w-none">
              <Image
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80"
                alt="Chef at 3sec Kitchen"
                fill
                className="object-cover rounded-2xl md:rounded-3xl shadow-2xl ring-4 ring-accent-500/30"
                priority
                sizes="(max-width: 768px) 90vw, 40vw"
              />
              <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 bg-accent-500 text-brand-900 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold shadow-lg">
                Cooked fresh, every order
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="max-w-5xl mx-auto px-4 py-10">
        <nav className="flex flex-wrap gap-2 mb-8 sticky top-16 sm:top-20 bg-[#fffaf3]/95 backdrop-blur py-3 z-20 -mx-4 px-4 border-b border-brand-100">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#cat-${cat}`}
              className="px-3 py-1.5 rounded-md text-sm font-semibold bg-white border border-brand-200 text-brand-700 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition"
            >
              {cat}
            </a>
          ))}
        </nav>

        {categories.map((cat) => (
          <div key={cat} id={`cat-${cat}`} className="mb-12 scroll-mt-32">
            <div className="flex items-end gap-3 mb-5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-900">
                {cat}
              </h2>
              <span className="h-1 flex-1 bg-accent-500 rounded-full mb-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products
                .filter((p) => p.category === cat)
                .map((p) => (
                  <PizzaCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    description={p.description}
                    imageUrl={p.imageUrl}
                    minPriceGhs={p.minPriceGhs}
                    maxPriceGhs={p.maxPriceGhs}
                    variants={p.variants}
                  />
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
