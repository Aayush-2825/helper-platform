# Frontend Architecture Deep Dive

This document provides a senior-level architectural analysis of the frontend application serving Customers, Helpers, and Admins via `apps/web`.

---

## 1. High-Level Strategy

### 1. Routing System
- **Framework**: Next.js 16 App Router (`src/app`).
- **Structure**: Utilizes Route Groups (e.g., `(auth)`, `(customer)`, `(helper)`, `(admin)`) to isolate shared layouts and middleware guardrails without adding URL segment bloat.
- **Navigation**: Client-side soft navigation via `<Link>` with automatic prefetching of Server Components.

### 2. Component Architecture
- **Layer 1: Primitives**: Radix UI (headless, accessible primitives).
- **Layer 2: Platform UI (`packages/ui`)**: Shared `shadcn/ui` components formatted via TailwindCSS (`button.tsx`, `card.tsx`, etc.). Exported globally.
- **Layer 3: Feature Modules (`apps/web/src/features`)**: Domain-bounded components (e.g., `BookingMap`, `CheckoutWizard`) that compose UI primitives with business logic.
- **Layer 4: Page Assemblies (`apps/web/src/app`)**: Route-level orchestrators assembling Feature Modules inside Server Components.

### 3. UI Design System
- **Base**: `shadcn/ui` atop TailwindCSS.
- **Theming**: CSS Variables configured in `tailwind.config.ts` mapping to semantic colors (e.g., `--primary`, `--muted`).
- **Icons**: Lucide React.
- **Responsiveness**: Mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`).

### 4. Reusable Components
- Housed primarily in `packages/ui` to guarantee 100% parity not only internally in the web app, but any future frontend packages.
- Follows a strict composition pattern: UI components *never* fetch their own data or manage domain-specific state.

### 5. State Management
- **Server State**: Managed natively by Next.js React Server Components (RSC) and standard `fetch()` or ORM hydration.
- **Client State**: 
  - *Local Form/UI State*: `useState` / `useReducer` inside `"use client"` blocks.
  - *Global Real-Time State*: React Context API wrapping the WebSocket client, hydrating optimistic booking updates directly into the component tree.
- **URL State**: Extensive use of `searchParams` to manage list views, tab selections, and filters (allowing shareable URLs and reducing React state bloat).

### 6. Data Fetching Patterns
- **Primary Read (Server)**: Async Server Components querying `packages/db` utilizing Drizzle directly. No intermediate `fetch()` required.
- **Primary Write (Server)**: Next.js Server Actions executing mutations and calling `revalidatePath()` or `revalidateTag()`.
- **Client Polling**: WebSocket events pushing data downstream over long-lived TCP layers bypassing HTTP polling structurally.

### 7. SSR / CSR / ISR Usage
- **SSR (Server-Side Rendering)**: Default for dynamic routes (dashboards, active booking views) ensuring zero layout shift and fast Initial Paint.
- **CSR (Client-Side Rendering)**: Isolated strictly to leaf nodes requiring browser APIs (maps, web socket listeners, local storage, rich form inputs) via `"use client"`.
- **ISR (Incremental Static Regeneration)**: Applied to public, slow-moving data (Marketing pages, public helper profiles, service category selections).

### 8. Hydration Strategy
- Next.js pushes RSC payloads (HTML stream). Interactive `"use client"` islands hydrate progressively. 
- Heavy interactive blocks (like map visualizations) defer hydration until heavily needed.

### 9. Performance Optimization
- **Image Optimization**: `next/image` forcing WebP formats, specific sizing, and deferred lazy loading.
- **Payload Stripping**: Passing strictly typed subsets of DB models to Client Components to avoid leaking heavy DB relationships or sensitive fields over the wire payload.

### 10. Lazy Loading Strategy
- Utilizing `next/dynamic` inside React 19 boundaries to enforce code splitting on massive modules:
  - Examples: `MapLibre` chart rendering, Heavy Razorpay JS SDK loads only on checkout clicks, Lottie animations.

### 11. Accessibility (a11y) Implementation
- Hard-coded WAI-ARIA standards inherited automatically via Radix UI primitives.
- Keyboard navigation (tabs, escape closes) natively supported in all modals and dropdowns.
- `aria-invalid` bindings bound automatically by form handlers.

### 12. SEO Implementation
- Controlled via Next.js `metadata` & `generateMetadata()` APIs on page elements.
- OpenGraph tags auto-generated for shareable URL instances.
- Public URLs generate canonical tags natively.

### 13. Responsive Design Strategy
- `mobile-first` Tailwind strategy.
- Flexbox and Grid gap layouts preferred over strict width percentages.
- Slide-up Drawer/BottomSheet usage on mobile vs. Dialog/Modals on Desktop (utilizing `vaul`).

### 14. Error Boundaries
- Strict `error.tsx` layouts bounding feature routes. Prevents a single crashed component from taking down the core App Shell framework.
- `global-error.tsx` catching fatal Next.js boot parameters framework level.

### 15. Form Handling
- `react-hook-form` acting as the standard controlled logic handler preventing massive re-render trees during typing.

### 16. Validation System
- **Single Source of Truth**: End-to-end `zod` schemas imported straight from `packages/validators`.
- Resolves inputs using `zodResolver` intercepting `react-hook-form` submits prior to Server Action execution.

---

## Technical Debt & Optimization Assessment

### Render Bottlenecks
- **Real-Time Context Drilling**: The global WebSocket Context provider updates blindly. Passing real-time JSON updates into a massive global context mapping can trigger a re-render cascade across the entire layout if components rely on `useContext()` without rigorous `useMemo()` isolation.

### Unnecessary Re-renders
- **Excessive Form State**: Modifying deep arrays inside complex onboarding or dispute views using `react-hook-form` without `useWatch` causes the entire parent form component to paint every keystroke. 
- **Map Visualizations**: Map boundaries reacting instantly to WebSocket helper location pings without debouncing or requestAnimationFrame layouts causes extreme GPU jitter.

### Large Bundle Issues
- **MapLibre & Razorpay SDKs**: Client bundle weight faces bloat. The UI requires these external SDKs, but if statically imported into the top layout, they delay total Time-To-Interactive (TTI).

### Code Splitting Opportunities
- **Admin Analytical Tools**: Chart.js / Recharts libraries should be actively extracted via `next/dynamic` loaded strictly via boundary intersections rather than main bundle imports.
- **Modals**: Heavy interaction forms inside Modals (like Dispute submission or Rating modules) should be dynamically imported relying on `<Suspense>`.

### UI Inconsistencies
- Given the monorepo split separating `ui` from `web`, domain specific UI overrides natively applied inside `web/src/components` via Tailwind classes cause drift from `packages/ui` defaults. 
- *Recommendation*: Strict linting forbidding generic complex tailwind UI application outside of the inner UI library bounds.
- Booking-specific status presentation should stay in the booking component layer, while generic badge primitives remain shared; avoid re-export alias files in `web/src/components` because they hide ownership and encourage drift.

### Security / Technical Debt
- **Context Bleed**: Over-fetching DB records in Server Components and dumping the entire payload (`<ClientComponent user={user} />`) leaks password hashes or inner flags into browser inspect bundles.
- **Recommendation**: Create specific standard DTOs (Data Transfer Objects) using Zod `.pick()` before handing data across the `"use client"` network boundary.