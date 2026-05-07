# 3sec Kitchen — Online Ordering

A self-hosted ordering web app for **3sec Kitchen** built with Next.js 14, Prisma, and SQLite.

- **Customers** browse the menu, add items to cart, check out, and get a tracking code.
- **Manager** signs in to a dashboard, watches incoming orders update live, and moves them through statuses: Received → Preparing → Out for delivery → Delivered.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Prisma ORM** with **SQLite** for local dev (swap to PostgreSQL/MySQL for production by changing `prisma/schema.prisma` and `DATABASE_URL`)
- **Zustand** for cart state (persisted to localStorage)
- **bcryptjs + jose** for manager auth (signed JWT in an httpOnly cookie)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Push the Prisma schema to a new SQLite database
npx prisma db push

# 3. Seed sample pizzas + create the manager account
npm run db:seed

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000

## Manager login

After seeding, sign in at http://localhost:3000/manager/login with:

```
email:    manager@3seckitchen.gh
password: kitchen123
```

**Change this immediately after the first run.** Edit `prisma/seed.ts`, change the password, and re-run `npm run db:seed`.

## Project structure

```
3sec-kitchen/
├── app/
│   ├── page.tsx                          # Menu (home)
│   ├── cart/page.tsx                     # Cart
│   ├── checkout/page.tsx                 # Checkout form
│   ├── confirmation/[trackingCode]/...   # Order confirmation
│   ├── manager/
│   │   ├── login/page.tsx                # Manager login
│   │   └── dashboard/page.tsx            # Orders dashboard
│   └── api/
│       ├── orders/route.ts               # POST create / GET list
│       ├── orders/[id]/route.ts          # PATCH status
│       └── auth/                         # login + logout
├── components/                           # Header, PizzaCard, CheckoutForm, OrdersList, etc.
├── lib/
│   ├── prisma.ts                         # Prisma singleton
│   ├── auth.ts                           # JWT helpers
│   ├── cart-store.ts                     # Zustand cart
│   └── utils.ts                          # Currency + status helpers
├── middleware.ts                         # Protects /manager/*
└── prisma/
    ├── schema.prisma                     # User, Product, Order, OrderItem
    └── seed.ts                           # Sample data + manager account
```

## How it works

### Customer flow

1. **Menu** (`/`) — server-rendered list of available products from the `Product` table, grouped by category.
2. **Cart** (`/cart`) — client-side, persisted in `localStorage` via Zustand (so the cart survives a page refresh).
3. **Checkout** (`/checkout`) — collects name, phone, address, payment method (Cash or Mobile Money on delivery), and notes. POSTs to `/api/orders`.
4. **Confirmation** (`/confirmation/[trackingCode]`) — shows the tracking code the customer can save.

The customer never sees the manager pages.

### Manager flow

1. **Login** (`/manager/login`) — credentials POST to `/api/auth/login`, which validates against `bcrypt` and sets a signed JWT cookie.
2. **Dashboard** (`/manager/dashboard`) — protected by `middleware.ts`. Lists last 100 orders, polls every 15 seconds for new ones. Each order can be expanded to see items, contact, delivery address, and to update status.
3. **Sign out** — POSTs to `/api/auth/logout`, which clears the cookie.

### Order states

```
RECEIVED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
                              └──→ CANCELLED
```

The customer sees the status on their confirmation page (refresh to update). The manager updates it from the dashboard.

## Environment variables

`.env`:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-me-to-a-long-random-string-in-production"
```

For production, generate a real `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Switching to PostgreSQL for production

1. Set `DATABASE_URL` to your Postgres connection string.
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Run `npx prisma db push` against the new database.
4. Run `npm run db:seed` to populate the manager and sample products.

## Useful commands

```bash
npm run dev          # dev server with hot reload
npm run build        # production build
npm run start        # serve the production build
npm run db:push      # apply prisma/schema.prisma to the database
npm run db:seed      # seed manager + sample products
npm run db:studio    # open Prisma Studio (GUI for the DB)
```

## Roadmap (suggested next features)

- Real-time order updates with Server-Sent Events instead of 15s polling
- SMS / WhatsApp notification when an order changes status
- Mobile Money payment integration (Hubtel, Paystack)
- Customer self-tracking page (`/track/[trackingCode]`)
- Multiple branches with branch-specific menus
- Daily sales reports for the manager
