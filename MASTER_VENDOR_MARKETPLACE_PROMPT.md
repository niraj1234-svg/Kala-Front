# MASTER DEVELOPMENT PROMPT — BUILD KALA MULTI-VENDOR MARKETPLACE & B2B BUSINESS NETWORK

Act as a Principal Full-Stack Software Architect, Senior React & TypeScript Specialist, Node.js/Express Backend Engineer, MongoDB Data Architect, and Luxury E-Commerce Platform Developer.

Your objective is to transform the existing **KALA** e-commerce platform (`f:\Final kala`) into a **production-ready Multi-Vendor Marketplace and Vendor-to-Vendor B2B Network**.

---

## 0. STRICT RULES & PRESERVATION MANDATE

1. **PRESERVE ALL EXISTING FUNCTIONALITY**:
   - Do NOT delete, break, or alter existing KALA consumer shopping routes (`/`, `/shop`, `/product/:id`, `/cart`, `/checkout`, `/custom-apparel`, `/customize`, `/showroom`, `/bundle`, `/campus-corporate-solutions`, `/business-branding`, `/about`, `/account`, `/wishlist`, `/orders`, `/designathon`).
   - Do NOT delete or modify existing admin routes (`/admin/products`, `/admin/orders`, `/admin/customers`, etc.).
   - Do NOT overwrite existing products, seed data, or database documents.
2. **RESPECT ACTUAL PROJECT TECH STACK & DESIGN TOKENS**:
   - **Frontend**: React 19 (`client/package.json`), Vite, TypeScript, React Router v7.
   - **Styling**: **Vanilla / Custom Luxury CSS** matching KALA's design tokens in `client/src/styles/globals.css`:
     - `--kala-orange: #D94700`, `--kala-black: #111111`, `--kala-bg-warm: #FAF9F6`, `--kala-border: #E5E2DD`, `--kala-text-secondary: #5F6368`
     - Typography: `'Inter'`, responsive clamps (`--kala-fs-h1`, `--kala-fs-h2`, `--kala-fs-body`).
     - **DO NOT** assume Tailwind CSS is installed. Use clean modular CSS in `client/src/styles/` (e.g. `Marketplace.css`, `VendorDashboard.css`, `VendorNetwork.css`, `VendorShop.css`).
   - **Backend**: Node.js, Express (`backend/src/server.ts`), TypeScript (`tsx`), Mongoose, JWT (`authMiddleware.ts`), Helmet, CORS, Rate Limiters (`rateLimiter.ts`), Razorpay.
3. **REAL PRODUCTION CODE ONLY**:
   - No mock buttons, dummy dashboards, or non-functional placeholders.
   - All state must sync with MongoDB Atlas via Express REST APIs.
   - Multi-vendor carts must split orders into verifiable vendor suborders.

---

## 1. ARCHITECTURE & WORKSPACE SPECIFICS

### Frontend Location: `f:\Final kala\client`
- Central API base: `client/src/config/api.ts` (`API_BASE_URL`).
- Auth token handling: `client/src/services/authApi.ts` (`kala_auth_token` in `localStorage`).
- Navigation: `client/src/components/Navbar.tsx` (`NAV_ROUTES`).
- App Router: `client/src/App.tsx`.

### Backend Location: `f:\Final kala\backend`
- Entry point: `backend/src/server.ts`.
- Auth middleware: `backend/src/middleware/authMiddleware.ts` (`requireAuth`, `requireAdmin`, extend with `requireVendor`).
- Database models: `backend/src/models/`.

---

## 2. DATABASE MODELS SPECIFICATION

Create or extend the following Mongoose schemas in `backend/src/models/`:

### A. Extend `User.ts`
- Extend `UserRole = 'customer' | 'admin' | 'vendor'`.
- Add `vendorProfileId?: Schema.Types.ObjectId | string`.

### B. New `VendorProfile.ts`
```typescript
- userId: string (ref User.userId, required, unique, indexed)
- businessName: string (required, trim)
- businessType: 'Manufacturer' | 'Wholesaler' | 'Retailer' | 'Printing business' | 'Clothing brand' | 'Fabric Supplier' | 'Distributor' | 'Other'
- businessEmail: string
- businessPhone: string
- businessAddress: { address: string; city: string; state: string; pincode: string }
- gstin?: string
- pan?: string
- website?: string
- verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' (default 'PENDING', indexed)
- verificationDocuments: [{ documentType: string; documentUrl: string; uploadedAt: Date }]
- adminNotes?: string
- bankDetails?: { accountName: string; accountNumber: string; ifscCode: string; bankName: string }
- timestamps: true
```

### C. New `VendorShop.ts`
```typescript
- vendorId: string (ref User.userId, required, unique, indexed)
- shopName: string (required)
- slug: string (required, unique, lowercase, trim, indexed) // e.g. /shop/:slug
- logo?: string
- banner?: string
- bio?: string
- categories: string[]
- location: { city: string; state: string }
- socialLinks?: { instagram?: string; linkedin?: string; website?: string }
- storePolicies?: { shippingPolicy?: string; returnPolicy?: string }
- isActive: boolean (default true, indexed)
- rating: { average: number; count: number }
- timestamps: true
```

### D. Extend `Product.ts`
- Add `vendorId?: string` (indexed)
- Add `vendorShopId?: Schema.Types.ObjectId | string`
- Add `isMarketplaceProduct?: boolean` (default false, indexed)
- Add `approvalStatus?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'` (default 'APPROVED' for platform products, 'PENDING' for vendor products)
- Add `stock?: number` (default 50)
- Add `sku?: string`
- Expand `category` enum or allow dynamic categories (e.g. `'Streetwear' | 'Gaming' | 'Gymwear' | 'Custom Clothing' | 'Corporate Merchandise' | 'Printing Services' | 'Fabric Supplies' | 'Accessories' | string`).

### E. New `VendorSubOrder.ts`
```typescript
- subOrderId: string (required, unique, indexed) // e.g. SUB-KALA-XXXXX-V1
- parentOrderId: string (ref Order.orderId, required, indexed)
- vendorId: string (required, indexed)
- customer: { firstName: string; lastName: string; email: string; phone: string }
- shippingAddress: { address: string; city: string; state: string; pincode: string }
- items: [{
    productId: string;
    name: string;
    image: string;
    size: string;
    color?: string;
    quantity: number;
    price: number;
  }]
- subtotal: number
- commissionPercentage: number (e.g. 10%)
- commissionAmount: number
- netVendorPayable: number
- subOrderStatus: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' (default 'PLACED', indexed)
- trackingInfo?: { carrier?: string; trackingNumber?: string; shippedAt?: Date; estimatedDelivery?: Date }
- payoutStatus: 'PENDING' | 'APPROVED' | 'PAID' | 'ON_HOLD' (default 'PENDING', indexed)
- timestamps: true
```

### F. New `VendorConnection.ts`
```typescript
- requesterVendorId: string (required, indexed)
- recipientVendorId: string (required, indexed)
- status: 'PENDING' | 'ACCEPTED' | 'REJECTED' (default 'PENDING', indexed)
- timestamps: true
- unique compound index: [requesterVendorId, recipientVendorId]
```

### G. New `VendorMessage.ts` & `VendorConversation.ts`
```typescript
VendorConversation:
- participants: string[] (vendor userIds, length 2, indexed)
- lastMessage?: string
- lastMessageAt?: Date
- unreadCounts: Map<string, number>
- timestamps: true

VendorMessage:
- conversationId: Schema.Types.ObjectId (ref VendorConversation, required, indexed)
- senderVendorId: string (required, indexed)
- recipientVendorId: string (required)
- messageText: string (required, trim)
- attachmentUrl?: string
- isRead: boolean (default false)
- timestamps: true
```

### H. New `CollaborationRequest.ts`
```typescript
- vendorId: string (required, indexed)
- title: string (required)
- description: string (required)
- category: 'Printing Services' | 'Fabric Supplier' | 'Clothing Manufacturer' | 'Custom Merch' | 'Wholesale Sourcing' | 'Other'
- location: { city: string; state: string }
- budgetRange?: string
- status: 'OPEN' | 'IN_DISCUSSION' | 'CLOSED' (default 'OPEN')
- timestamps: true
```

### I. New `VendorPayout.ts`
```typescript
- payoutId: string (required, unique, indexed)
- vendorId: string (required, indexed)
- subOrderIds: string[]
- grossAmount: number
- commissionDeducted: number
- netPayoutAmount: number
- payoutMethod: 'NEFT' | 'UPI' | 'MANUAL' | 'RAZORPAY_X'
- transactionReference?: string
- status: 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED' (default 'PENDING', indexed)
- processedAt?: Date
- processedBy?: string
- notes?: string
- timestamps: true
```

---

## 3. BACKEND API ROUTES & CONTROLLERS

Register all modular route handlers in `backend/src/server.ts`:

### 1. Vendor Authentication & Onboarding (`/api/auth/vendor`)
- `POST /api/auth/vendor/register` (Register vendor account with business profile & initial document upload).
- `GET /api/vendor/profile/me` (`requireAuth`, `requireVendor` -> returns vendor profile & shop).
- `PUT /api/vendor/profile/me` (Update business info & bank details).

### 2. Vendor Shop & Storefront (`/api/vendor/shop` & `/api/marketplace`)
- `GET /api/marketplace/shops` (Public list of verified active vendor shops).
- `GET /api/marketplace/shops/:slug` (Public shop details + approved vendor products).
- `POST /api/vendor/shop` (`requireVendor` -> Create or customize vendor shop).
- `PUT /api/vendor/shop` (`requireVendor` -> Update logo, banner, policies, bio).

### 3. Vendor Product Lifecycle (`/api/vendor/products` & `/api/marketplace/products`)
- `GET /api/marketplace/products` (Public: Returns approved products with filters: category, vendor, search, price range).
- `GET /api/vendor/products` (`requireVendor` -> List all own products: DRAFT, PENDING, APPROVED, REJECTED).
- `POST /api/vendor/products` (`requireVendor` -> Create product, sets `approvalStatus: 'PENDING'`).
- `PUT /api/vendor/products/:id` (`requireVendor` -> Update product; prevents updating other vendors' products).
- `DELETE /api/vendor/products/:id` (`requireVendor` -> Archive/delete own product).

### 4. Multi-Vendor Orders & Splitting (`/api/vendor/orders`)
- Hook into existing `POST /api/payments/verify` or order placement in `orderRoutes.ts`:
  - When customer checks out items belonging to vendor(s), atomically generate `VendorSubOrder` records linked to the parent `Order`.
- `GET /api/vendor/orders` (`requireVendor` -> Fetch vendor's suborders with status filters).
- `GET /api/vendor/orders/:subOrderId` (`requireVendor` -> Get specific suborder detail).
- `PUT /api/vendor/orders/:subOrderId/status` (`requireVendor` -> Update status: PROCESSING, READY_TO_SHIP, SHIPPED with tracking info).

### 5. Vendor-to-Vendor Business Network (`/api/network`)
- `GET /api/network/directory` (`requireVendor` -> Search and filter verified vendors by type, category, city).
- `POST /api/network/connect/:vendorId` (`requireVendor` -> Send connection request).
- `PUT /api/network/connect/:connectionId` (`requireVendor` -> Accept or reject request).
- `GET /api/network/connections` (`requireVendor` -> List accepted connections & pending incoming/outgoing requests).
- `GET /api/network/conversations` (`requireVendor` -> List active vendor conversations).
- `GET /api/network/conversations/:conversationId/messages` (`requireVendor` -> Fetch message thread; authoritatively validates participant identity).
- `POST /api/network/conversations/:conversationId/messages` (`requireVendor` -> Send message).
- `GET /api/network/collaborations` (`requireVendor` -> View open collaboration requests).
- `POST /api/network/collaborations` (`requireVendor` -> Post new collaboration opportunity).

### 6. Admin Marketplace Control (`/api/admin/marketplace`)
- Protected by `requireAuth` + `requireAdmin`.
- `GET /api/admin/marketplace/vendors` (Review pending/approved/rejected vendor applications).
- `PUT /api/admin/marketplace/vendors/:id/status` (Approve/Reject/Suspend vendor).
- `GET /api/admin/marketplace/products/pending` (Review pending vendor product listings).
- `PUT /api/admin/marketplace/products/:id/approval` (Approve or reject vendor product).
- `GET /api/admin/marketplace/orders` (View all vendor suborders and fulfillment statuses).
- `GET /api/admin/marketplace/payouts` (Ledger of vendor balances and settlement requests).
- `POST /api/admin/marketplace/payouts/:id/settle` (Mark settlement paid with reference number).
- `GET /api/admin/marketplace/analytics` (GMV, platform commission, vendor count, pending orders).

---

## 4. FRONTEND PAGES & USER EXPERIENCE

Integrate into `client/src/App.tsx` and `client/src/components/Navbar.tsx`:

### 1. Navigation Updates
- Add `MARKETPLACE` to `NAV_ROUTES` in `client/src/components/Navbar.tsx` (`to: '/marketplace'`).
- If logged in as vendor, provide quick-access pill to "Vendor Dashboard" (`/vendor/dashboard`).

### 2. Public Marketplace Pages
- **`/marketplace` (Marketplace Landing)**:
  - Hero banner: *"Discover. Connect. Grow with KALA."*
  - Curated Categories (Apparel, Custom Clothing, Sportswear, Printing Services, Fabric Supplies).
  - Featured Verified Vendors grid with shop logos, badges, and "Visit Shop" links.
  - Trending Marketplace Products grid.
  - Callout: *"Become a KALA Vendor — Open Your Storefront"*.
- **`/marketplace/vendors` (Vendor Directory)**:
  - Grid of all verified vendor shops with search, location filter, and category filter.
- **`/shop/:slug` (Public Vendor Storefront)**:
  - Luxury shop cover banner, logo, business bio, verified badge, location, and policies.
  - Catalog of approved products from this vendor with filtering and sorting.
  - "Contact Vendor" / "Inquire" button.

### 3. Vendor Portal Pages (Protected by `VendorRoute`)
- **`/vendor/register`**:
  - Multi-step onboarding form (Personal Info -> Business Details -> Categories & Documents).
  - Clean status indicator for PENDING review.
- **`/vendor/dashboard`**:
  - Luxury sidebar navigation (`Overview`, `Products`, `Orders`, `Network & Messages`, `Earnings & Payouts`, `Store Settings`).
  - Key metrics cards: Gross Sales, Net Earnings, Active Products, Pending Orders.
- **`/vendor/products` & `/vendor/products/new`**:
  - Table of products with live status badges (`PENDING`, `APPROVED`, `REJECTED`, `OUT_OF_STOCK`).
  - Product creation form (Image upload, Title, Description, Category, Price, Stock, Variants).
- **`/vendor/orders` & `/vendor/orders/:id`**:
  - Order fulfillment workflow (Update status, enter tracking carrier & number).
- **`/vendor/network`**:
  - B2B Directory to find manufacturers, fabric mills, screen printers, embroidery specialists.
  - Connection management tab (Pending / Connected).
  - Real-time/polling 1-to-1 secure chat window.
  - Collaboration board tab (post/browse sourcing requests).
- **`/vendor/earnings`**:
  - Settlement ledger: Suborder transactions, 10% platform commission deduction, net payout balance, and settlement history.

### 4. Admin Marketplace Management (`/admin/marketplace`)
- Integrated seamlessly into existing `client/src/components/admin/AdminLayout.tsx` with sidebar links:
  - **Vendor Applications**: View submitted business docs, approve/reject with single click.
  - **Product Approvals**: Approve or reject vendor-submitted listings before they appear publicly.
  - **Suborders Oversight**: Monitor shipping progress and disputes.
  - **Payouts & Settlements**: Approve vendor payout requests and record payment reference IDs.

---

## 5. SECURITY & DATA INTEGRITY SPECIFICATIONS

1. **Authorization Verification**:
   - `requireAuth` extracts verified identity from JWT.
   - `requireVendor` ensures `user.role === 'vendor'` and vendor profile is in `APPROVED` status.
   - Restrict vendor queries: `VendorSubOrder.find({ vendorId: req.user.userId })`. Never accept `vendorId` from client body.
2. **Prevent IDOR**:
   - Only participants in `VendorConversation` can view or post messages.
   - Only the owning vendor can edit their products or change their suborder shipping statuses.
3. **Atomic Stock & Multi-Vendor Cart Verification**:
   - When an order is placed, product prices must be pulled authoritatively from MongoDB, not trusted from client cart.
   - Prevent stock depletion below 0 using atomic `$inc: { stock: -qty }` with query `{ stock: { $gte: qty } }`.

---

## 6. STEP-BY-STEP EXECUTION PHASES

Execute the project in systematic, non-breaking phases:

- **PHASE 1 — BACKEND FOUNDATION**:
  - Create models: `VendorProfile.ts`, `VendorShop.ts`, `VendorSubOrder.ts`, `VendorConnection.ts`, `VendorConversation.ts`, `VendorMessage.ts`, `CollaborationRequest.ts`, `VendorPayout.ts`.
  - Update `User.ts` (role: vendor) and `Product.ts` (vendor links & approvalStatus).
  - Update `authMiddleware.ts` to export `requireVendor`.
- **PHASE 2 — BACKEND CONTROLLERS & ROUTES**:
  - Implement vendor auth, shop management, vendor product CRUD, vendor order splitting, network connections, messaging, and admin moderation routes.
  - Mount all routes cleanly in `backend/src/server.ts`.
  - Run `npm --prefix backend run build` to verify zero TypeScript errors.
- **PHASE 3 — FRONTEND CLIENT SERVICES & TYPES**:
  - Create `client/src/types/marketplace.ts`.
  - Create `client/src/services/marketplaceApi.ts`, `vendorApi.ts`, `vendorNetworkApi.ts`.
- **PHASE 4 — FRONTEND PAGES & COMPONENTS**:
  - Create CSS styles in `client/src/styles/` matching KALA luxury tokens.
  - Build public marketplace landing (`Marketplace.tsx`), shop storefront (`VendorShopPage.tsx`), vendor registration (`VendorRegister.tsx`), vendor dashboard suite (`VendorDashboard.tsx`, `VendorProducts.tsx`, `VendorOrders.tsx`, `VendorNetwork.tsx`, `VendorEarnings.tsx`), and admin marketplace view (`AdminMarketplace.tsx`).
- **PHASE 5 — ROUTING & NAVIGATION INTEGRATION**:
  - Mount new routes in `client/src/App.tsx`.
  - Add `MARKETPLACE` to `Navbar.tsx` and marketplace links to `AdminLayout.tsx`.
- **PHASE 6 — VERIFICATION & BUILD VALIDATION**:
  - Run `npm --prefix client run build` and `npm --prefix backend run build`.
  - Ensure zero compiler errors and full backward compatibility with existing KALA shop and admin portals.

---

## 7. EXECUTION COMMAND
Begin immediate execution starting with Phase 1. Follow every rule, preserve all existing features, and build a high-performance, aesthetically stunning, fully functional Multi-Vendor Marketplace for KALA.
