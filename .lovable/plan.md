
# Vortex Footwear — Build Plan

A premium, minimal shoe e-commerce site inspired by editorial fashion sites. Backend is Lovable Cloud (Postgres + Auth + Storage). Payments via Stripe (INR-ready). Stack stays TanStack Start + React (Node/Express and Clerk aren't compatible with this platform — Cloud covers auth/DB, Stripe covers payments).

## Scope for v1

**Storefront**
- Home (hero, featured collections, new arrivals, editorial sections)
- Shop / catalog with filters (category, size, price, color)
- Product detail (gallery, size selector, add to cart, description)
- Cart drawer + full cart page
- Checkout (address → Stripe payment)
- Order confirmation

**Accounts**
- Email/password + Google sign-in
- My orders, order detail
- Saved addresses

**Admin dashboard** (`/admin`, role-gated)
- Products: create, edit, delete, upload images
- Orders: list, view, update status

**Content pages**
- About, Contact, Shipping & Returns, Privacy, Terms

## Design direction

Premium & minimal — off-white canvas, deep charcoal/black type, single warm accent, generous whitespace, editorial serif display + clean grotesque body. Large product photography, disciplined grid, restrained motion (fade/slide on scroll, hover reveals). No purple gradients, no generic SaaS feel.

## Data model (Lovable Cloud / Postgres)

```text
profiles(id → auth.users, full_name, phone)
user_roles(user_id, role: 'admin' | 'user')   -- separate table, has_role() SECURITY DEFINER
categories(id, slug, name)
products(id, slug, name, description, price_inr, category_id, is_active, created_at)
product_images(id, product_id, url, sort_order)
product_variants(id, product_id, size, stock)
addresses(id, user_id, full_name, phone, line1, line2, city, state, pincode)
orders(id, user_id, status, subtotal_inr, shipping_inr, total_inr,
       stripe_session_id, shipping_address jsonb, created_at)
order_items(id, order_id, product_id, name, size, qty, unit_price_inr)
```

RLS: public SELECT on `products`, `product_images`, `product_variants`, `categories` where active. `orders`/`order_items`/`addresses`/`profiles` scoped to `auth.uid()`. Admin-only write on products/categories via `has_role(auth.uid(),'admin')`.

Cart lives in localStorage (no login required to browse/add). Order + payment requires sign-in.

## Payments

Stripe (built-in, no keys from you). INR is Stripe's default currency for Indian sellers and supports UPI, cards, netbanking, wallets. Flow: checkout server fn → create Stripe Checkout session → redirect → webhook creates the order + clears cart on success.

Note: **Stripe requires an Indian business entity** for accepting payments from Indian customers. You can build and test now; going live needs KYC on the Stripe account.

## Routes

```text
/                      home
/shop                  catalog
/shop/$category        category
/product/$slug         product detail
/cart                  cart
/checkout              checkout (auth required)
/order/success         post-payment confirmation
/auth                  sign in / sign up
/_authenticated/account            account overview
/_authenticated/account/orders     order history
/_authenticated/account/orders/$id order detail
/_authenticated/account/addresses  addresses
/_authenticated/admin              admin dashboard (role-gated)
/_authenticated/admin/products
/_authenticated/admin/products/new
/_authenticated/admin/products/$id
/_authenticated/admin/orders
/about, /contact, /shipping-returns, /privacy, /terms
/api/public/webhooks/stripe        Stripe webhook
sitemap.xml, robots.txt
```

## Build order

1. Design system (tokens, typography, button/card variants) + shared Header/Footer/Layout
2. Database migration (tables, RLS, grants, has_role function) + seed a few sample products
3. Public storefront: home, shop, product detail, cart
4. Auth (email + Google) + account pages
5. Admin dashboard (products CRUD with image upload to Cloud Storage, orders list)
6. Enable Stripe payments → checkout server fn → webhook → order success page
7. Content pages + sitemap/robots + SEO metadata per route

## What I'll need from you along the way

- Brand name (default: **Vortex Footwear**) and tagline
- Confirmation to enable Stripe when we reach step 6 (you'll fill a short form; no keys needed)

## Things worth flagging

- **Clerk** isn't available here — Cloud Auth handles email/password + Google, which covers the same use case.
- **Node/Express** — server logic runs as TanStack server functions (same idea, integrated).
- Your two ZIPs are marked as design reference — I won't extract them into the codebase. If you want the images used as actual site imagery later, let me know.

Approve and I'll start with the design system + database, then work through the list.
