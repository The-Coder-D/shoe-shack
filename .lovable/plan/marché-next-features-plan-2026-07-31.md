# Marché — Next Features Plan

The storefront is live with a premium home page, catalog, product detail, cart, checkout, account area, and admin dashboard. This plan proposes the highest-impact additions to make the site more functional, trustworthy, and effective at turning visitors into signed-in shoppers who see the full catalogue.

## 1. Features that encourage sign-in and more product discovery

These directly answer your two goals.

### A. "Members unlock more" teaser cards (quick win)
- On shop/category pages, signed-out visitors see the public 5 products plus blurred/locked preview cards for the 6 members-only styles.
- Each locked card shows the product name, a blurred thumbnail, and a CTA: "Sign in to see price and sizes".
- Clicking it opens the auth modal/page and returns the user to the same catalog page after login.
- Why it works: curiosity + scarcity without hiding the existence of the products entirely.

### B. Welcome offer for new accounts
- Show a dismissible banner: "Create a free account and get ₹200 off your first order".
- Store a one-time "welcome_discount_inr" value on the order at checkout.
- Admin can toggle the amount.
- Why it works: immediate, concrete reason to sign up.

### C. Wishlist / Save for later
- Heart icon on product cards and product detail.
- Saved items stored per user in a new `wishlists` table.
- Clicking "Save" when signed out prompts sign-in, then returns to the product.
- Add a `/account/wishlist` page.
- Why it works: creates a reason to return and a reason to create an account.

### D. Recently viewed strip
- Track last 8–12 viewed slugs in localStorage.
- Render a "Recently viewed" horizontal strip on home and product pages.
- Why it works: brings shoppers back to products they already considered.

### E. Related / complete-the-look recommendations
- On each product page, show 4 related products from the same category + 1 from another category.
- Simple rule-based logic first (same category, different slug), can later become AI recommendations.
- Why it works: increases pages per session and average order value.

### F. Early-access drops / limited editions
- Add a `drop_date` column to products.
- Products with a future drop date show a "Drops [date] — notify me" button for signed-out users.
- Signed-in users can click "Notify me" and get added to a `drop_notifications` list.
- Why it works: builds anticipation and collects sign-ups.

## 2. Conversion and trust features

These make shoppers more likely to buy once they are browsing.

### G. Product reviews and ratings
- New `reviews` table: product_id, user_id, rating, comment, created_at.
- Show average rating + review count on cards and product page.
- Allow verified buyers only (checked against orders/order_items).
- Admin can hide/delete reviews.

### H. Size guide / fit finder
- Add a modal size chart linked from every size selector.
- Optional: a 2-question fit quiz ("What size do you wear in Nike/Adidas?" → suggest UK size).
- Reduces returns, increases add-to-cart confidence.

### I. Stock urgency signals
- Show "Low stock — only 3 left" when variant stock is ≤ 3.
- Show "Out of stock" and an "Email me when available" field.
- New `stock_alerts` table for back-in-stock notifications.

### J. Sticky mobile add-to-cart bar
- On product detail, a bottom sheet/bar on mobile with size selector + Add to bag that stays visible while scrolling.
- Major mobile conversion improvement.

### K. Quick-view modal
- Clicking a product card on desktop opens a quick-view modal instead of navigating away.
- Keeps shoppers in the catalog flow longer.

## 3. Operational / admin features

These make the business side easier to run.

### L. Discount codes
- New `coupons` table: code, discount_inr, discount_percent, min_order_inr, expires_at, usage_limit, used_count.
- Apply coupon at checkout; validate server-side.
- Admin CRUD for coupons.

### M. Inventory management in admin
- Admin product list shows total stock per product.
- Inline edit variant stock on the product form.
- Low-stock indicator in admin.

### N. Order detail + status history
- `/admin/orders/$id` page with full order details, shipping address, items, and a status timeline.
- Current list view only shows summary.

### O. Automated customer emails (after domain is configured)
- Order confirmation, shipped, delivered, and refund emails.
- Use Lovable Cloud email integration once your custom domain is set up.
- No custom domain yet, so this is phase-2.

### P. Basic analytics dashboard
- Admin overview extended with: revenue this month, top products, conversion funnel (visitors vs orders), average order value.
- Uses existing `orders` and `order_items` data.

## 4. Content and marketing features

### Q. Lookbook / editorial page
- `/stories` route with large imagery and shoppable product links.
- Reinforces the premium brand story.

### R. Newsletter signup
- Footer email capture.
- New `newsletter_subscribers` table.
- Offer "10% off" for subscribing.

### S. Search
- Global search in the header (product name + category).
- Instant results dropdown.

## Recommended build order

Phase 1 (highest ROI for sign-ins + sales):
1. Members-only teaser cards
2. Welcome discount banner + checkout coupon field
3. Wishlist
4. Recently viewed
5. Related products
6. Stock urgency + back-in-stock alerts

Phase 2 (trust + operations):
7. Reviews and ratings
8. Size guide / fit finder
9. Sticky mobile add-to-cart
10. Discount codes
11. Admin inventory + order detail

Phase 3 (growth):
12. Automated emails (after domain setup)
13. Lookbook / stories
14. Search
15. Analytics dashboard

## What I need from you

Pick which phase you want to start with, or tell me the 3–4 features that matter most right now. If you want, I can build Phase 1 in one go.
