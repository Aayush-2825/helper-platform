# Professional UI Upgrade Prompt for Helper Platform

## Overview
Transform the helper-platform UI from functional MVP to professional product by implementing modern design patterns, enhanced components, and premium UI blocks from shadcn/studio. This upgrade covers both **public-facing pages** (landing, auth, bookings) and **internal platform features** (admin dashboards, helper portals, customer dashboards).

## Current State
- **Tech**: Next.js 16 + React 19 + Shadcn/ui (base-nova) + TailwindCSS 4
- **MCP Servers**: @shadcn, @ss-components, @ss-blocks, @ss-themes available
- **Skills Available**: 
  - `shadcn` - Comprehensive shadcn/ui component management and best practices
  - `animate` - Advanced animation techniques and patterns from Impeccable
  - `12-principles-of-animation` - Professional animation principles and implementation
- **Design System**: Flat minimal design (Indigo #1E1B4B, Orange #F97316)
- **Status**: Functional but needs professional polish, animations, and modern UX patterns

## Critical UI Gaps to Address

### 🔴 Priority 1: High-Impact Changes

#### 1. **Professional Error Pages**
**Current State**: Outdated sci-fi theming ("Protocol Error", "Abandon Ship")
**Target**: Modern, helpful error pages with next steps

**Changes Required**:
- Replace apps/web/src/app/error.tsx with professional error boundary
- Replace apps/web/src/app/not-found.tsx with custom 404 page
- Create apps/web/src/app/error-boundary.tsx component
- Add illustration/graphics for 404, 500, maintenance states
- Include helpful CTAs: "Go Home", "Contact Support", "Report Issue"
- **Use shadcn/studio**: error-page block, 404-page block, illustration components
- **Skills**: Use `shadcn` for component patterns, `animate` for smooth transitions

**Implementation Approach**:
```
1. Search @ss-blocks for error-related blocks: 'error page', '404 page', 'error states'
2. Get examples and adapt to brand colors (Indigo + Orange)
3. Use shadcn skill to ensure proper component structure
4. Apply 12-principles-of-animation for smooth entrance/exit animations
5. Add helpful error messaging and recovery actions
6. Implement consistent error state across all pages
```

#### 2. **Modern Landing Page Hero**
**Current State**: Basic layout, missing visual impact
**Target**: Professional hero with animations, clear value prop

**Changes Required**:
- Redesign hero section (apps/web/src/app/(marketing)/page.tsx)
- Add gradient background with subtle animations
- Improve headline hierarchy and copywriting
- Add CTA buttons with hover effects and micro-interactions
- Implement parallax or reveal animations
- Add hero graphics/illustrations
- **Use shadcn/studio**: hero block, feature showcase blocks, CTA blocks
- **Skills**: Use `animate` for parallax effects, `12-principles-of-animation` for polish

**Implementation Approach**:
```
1. Search @ss-blocks for hero blocks: 'hero section', 'landing hero', 'feature hero'
2. Get 2-3 professional hero examples matching your color scheme
3. Adapt to include your specific value props (booking, helper platform)
4. Add micro-interactions: button hover, scroll reveal, gradient animation
5. Use 12-principles-of-animation (anticipation, staging, easing)
6. Ensure responsive on mobile (bottom-nav is visible)
7. Apply animate skill for smooth transitions
```

#### 3. **Loading State Overhaul - Skeleton Screens**
**Current State**: Generic spinners throughout app
**Target**: Skeleton screens matching content shapes

**Changes Required**:
- Create reusable skeleton component system
- Implement for all async data loads:
  - Booking list page (apps/web/src/features/booking/pages/bookings.tsx)
  - Helper profiles (apps/web/src/features/helper/)
  - Admin data tables (apps/web/src/app/(portal)/admin/)
  - Dashboard cards (apps/web/src/app/(portal)/customer/page.tsx)
- Replace all spinner-based loading states
- Add loading animation (pulse or wave effect)
- **Skills**: Use `shadcn` for component variants, `animate` for smooth shimmer effects

**Implementation Approach**:
```
1. Create apps/web/src/components/loading/
   - CardSkeleton.tsx (for booking/profile cards)
   - TableSkeleton.tsx (for admin tables)
   - FormSkeleton.tsx (for forms)
   - ListSkeleton.tsx (for job lists)

2. Update all pages with loading states:
   - Use Suspense + fallback with skeleton components
   - Match skeleton layout to actual content

3. Use @repo/ui for base Skeleton component
4. Add CSS animation in globals.css (pulse or shimmer effect)
5. Apply 12-principles to make animations feel natural
```

#### 4. **Confirmation Dialogs & Modals**
**Current State**: Minimal use of dialogs for destructive actions
**Target**: Professional confirmation flows for all data modifications

**Changes Required**:
- Create reusable ConfirmationDialog component
- Add confirmation for:
  - Cancel booking (apps/web/src/features/booking/)
  - Helper rejection (apps/web/src/app/(portal)/admin/)
  - Payment disputes (apps/web/src/app/(portal)/admin/)
  - Account deletion (apps/web/src/app/(portal)/account/settings.tsx)
  - Role-based admin actions
- Implement modal with description, warning colors for destructive actions
- **Use shadcn/studio**: dialog block, confirmation block
- **Skills**: Use `animate` for modal entrance animations

**Implementation Approach**:
```
1. Create apps/web/src/components/dialogs/confirmation-dialog.tsx
   - Props: title, description, onConfirm, onCancel, isDestructive
   - Show warning state with red colors if destructive

2. Wrap all destructive actions with ConfirmationDialog
3. Search @ss-blocks for 'confirmation dialog', 'alert dialog' examples
4. Adapt styling to match app colors
5. Use animate skill for smooth modal transitions
```

#### 5. **Empty States**
**Current State**: Missing from multiple features
**Target**: Custom illustrations and helpful messaging for empty states

**Changes Required**:
- Add empty state component for:
  - No bookings (apps/web/src/features/booking/)
  - No jobs (apps/web/src/features/helper/)
  - No reviews (apps/web/src/features/booking/)
  - No notifications (all dashboards)
  - No data (admin tables)
- Include illustration, message, and CTA
- **Use shadcn/studio**: empty-state block, illustration components
- **Skills**: Use `shadcn` for proper UI patterns, `animate` for fade-in effects

**Implementation Approach**:
```
1. Create apps/web/src/components/empty-state.tsx
   Props: title, description, illustration, cta (optional), icon

2. Add to all pages with potential empty data
3. Search @ss-blocks for 'empty state', 'no results', 'empty page'
4. Get illustrations and adapt to your brand
5. Apply smooth fade-in animations
```

### 🟡 Priority 2: Medium-Impact Improvements

#### 6. **Internal Dashboard UI Enhancements**

**Admin Portal Improvements**:
- Professional admin dashboard with KPI cards
- Helper verification workflow UI enhancement
- Booking management interface refinement
- Payment tracking dashboard
- User management interface
- Dispute resolution workflow UI

**Helper Portal Improvements**:
- Earnings dashboard with visualizations
- Availability scheduling interface
- Job history and ratings display
- Profile management interface
- Video KYC scheduling workflow

**Customer Portal Improvements**:
- Active bookings timeline view
- Helper matching animation
- Payment history interface
- Reviews and ratings interface
- Booking search and filter improvements

**Changes Required** (Priority 2a):
- Enhance all dashboard cards with modern styling
- Add professional table components with sorting/filtering
- Improve form layouts in admin section
- Add data visualization (charts, metrics)
- **Use shadcn/studio**: dashboard blocks, data table blocks, form blocks
- **Skills**: Use `shadcn` for component consistency, `animate` for micro-interactions

#### 7. **Data Visualization Dashboard**
**Current State**: Admin dashboard is card-based, no charts
**Target**: Professional metrics dashboard with charts

**Changes Required**:
- Add chart components to apps/web/src/app/(portal)/admin/
- Implement charts:
  - Bookings over time (line chart)
  - Revenue breakdown (pie/donut chart)
  - Helper ratings distribution (bar chart)
  - KPI metrics (number cards with trend indicators)
- Use Recharts or similar library
- Add filters: date range, helper type, location
- **Use shadcn/studio**: dashboard block, chart blocks

**Implementation Approach**:
```
1. Install chart library (check package.json for existing)
2. Create apps/web/src/components/charts/
   - BookingsChart.tsx
   - RevenueChart.tsx
   - RatingsChart.tsx
3. Update admin dashboard with chart section
4. Search @ss-blocks for 'dashboard', 'chart', 'metrics' blocks
5. Apply animate skill for chart animations
```

#### 8. **Form Enhancements**
**Current State**: Basic error display with toasts
**Target**: Inline validation with progress indicators

**Changes Required**:
- Update auth forms (apps/web/src/features/auth/)
- Add inline field-level error display with color coding
- Implement form progress indicator for multi-step forms
- Add password strength indicator for signup
- Better form spacing and visual hierarchy
- **Use shadcn/studio**: form block, input variant blocks, progress blocks
- **Skills**: Use `shadcn` for form patterns, `animate` for validation feedback

**Implementation Approach**:
```
1. Create apps/web/src/components/form/form-progress.tsx
   - Show current step / total steps
   - Progress bar with step indicators

2. Create apps/web/src/components/form/form-field.tsx
   - Inline validation with color coding (red for errors, green for success)
   - Icon indicators

3. Add PasswordStrength indicator for signup form
4. Search @ss-blocks for 'form', 'input', 'form validation' blocks
```

#### 9. **Navigation Improvements**
**Current State**: Breadcrumbs exist but unused, role-switching incomplete
**Target**: Complete navigation system with role switching

**Changes Required**:
- Implement breadcrumb navigation in all portal pages
- Add role-switching dropdown in header (for admins/testers)
- Enhance sidebar navigation with icons and active states
- Add scroll-to-top button on long pages
- Sticky table headers for data tables
- **Use shadcn/studio**: breadcrumb block, navigation blocks
- **Skills**: Use `shadcn` for navigation patterns, `animate` for smooth transitions

**Implementation Approach**:
```
1. Create apps/web/src/components/breadcrumbs/page-breadcrumbs.tsx
   - Auto-generate from route structure

2. Update apps/web/src/components/shared/navbar.tsx:
   - Add role-switching dropdown
   - Link to account/settings

3. Implement sticky headers in table components
4. Add scroll-to-top button with smooth scroll
5. Search @ss-blocks for 'breadcrumb', 'navigation', 'header' blocks
```

#### 10. **Micro-Interactions & Animations**
**Current State**: Only fadeUp animation in globals.css
**Target**: Professional micro-interactions throughout

**Changes Required**:
- Button hover: scale up slightly + shadow
- Input focus: border color change + glow effect
- Card hover: lift (translate -y) + shadow increase
- Success state: checkmark animation + color transition
- Error state: shake animation + color pulse
- Page transitions: fade + slide
- Loading indicators: enhanced spinner with rotations
- **Use shadcn/studio**: animation blocks, transition blocks
- **Skills**: Use `animate` for all animations, `12-principles-of-animation` for polish

**Implementation Approach**:
```
1. Update apps/web/src/app/globals.css with keyframes:
   @keyframes slideUp { /* from bottom */ }
   @keyframes scaleIn { /* grow from center */ }
   @keyframes shake { /* error feedback */ }
   @keyframes pulse { /* highlight attention */ }

2. Apply to components:
   - Buttons: hover:scale-105 hover:shadow-lg
   - Inputs: focus:ring-2 focus:ring-primary
   - Cards: hover:-translate-y-1 hover:shadow-xl
   - Success feedback: animate-pulse

3. Add page transition animations
4. Use animate skill for smooth easing functions
5. Apply 12-principles (easing, staging, overlapping action)
6. Search @ss-blocks for 'animation', 'transition', 'micro-interaction'
```

#### 11. **Typography & Color Refinements**
**Current State**: Basic typography, flat color scheme
**Target**: Professional hierarchy and subtle gradients

**Changes Required**:
- Refine heading sizes (h1-h6)
- Improve line heights and letter spacing
- Add subtle gradients to key UI elements
- Enhance color contrast ratios
- Add gradient text effect to hero
- Better color usage for status indicators
- **Use shadcn/studio**: theme blocks, typography blocks
- **Skills**: Use `shadcn` for component typography, `animate` for gradient transitions

**Implementation Approach**:
```
1. Update tailwind.config in apps/web/:
   - Refine fontSize scale
   - Add line-height customizations
   - Add gradient utilities

2. Create text utilities:
   - gradient-text class
   - Better status color indicators

3. Update globals.css with improved CSS variables
4. Test contrast ratios (WCAG AA minimum)
```

#### 12. **Status Badges & Indicators** (New)
**Current State**: Basic text-based status display
**Target**: Professional status indicators with animations

**Changes Required**:
- Create reusable StatusBadge component
- Implement for all statuses:
  - Booking states (pending, confirmed, completed, cancelled)
  - Helper verification states (pending, approved, rejected)
  - Payment states (pending, processing, paid)
- Add animated status indicators (pulsing, transitioning)
- Color-coded by status type
- **Skills**: Use `animate` for status animations, `12-principles` for polish

**Implementation Approach**:
```
1. Create apps/web/src/components/status-badge.tsx
   - Props: status, label, icon, animated
   - Multiple status types with color mapping
   - Smooth color transitions

2. Create apps/web/src/components/status-indicator.tsx
   - Animated dots for live statuses
   - Pulsing effect for pending states
   - Smooth transitions between states

3. Apply to all status displays in admin/helper/customer portals
4. Use animate skill for smooth transitions
5. Apply 12-principles (easing, color harmony)
```

#### 13. **Real-time Updates UI** (New - WebSocket)
**Current State**: Basic WebSocket updates without visual feedback
**Target**: Smooth real-time updates with animations

**Changes Required**:
- Add visual feedback for real-time updates
- Animate incoming notifications
- Update counters with smooth transitions
- Add toast notifications for critical updates
- Smooth list updates when helpers/bookings change
- **Skills**: Use `animate` for update animations, `12-principles` for smoothness

**Implementation Approach**:
```
1. Create apps/web/src/components/real-time/
   - NotificationToast.tsx
   - AnimatedCounter.tsx
   - LiveStatusBadge.tsx

2. Add smooth transitions when data updates:
   - Fade in/out for list items
   - Slide animations for new items
   - Color pulses for status changes

3. Update realtime event handlers to trigger animations
4. Apply easing functions from animate skill
```

### 🟢 Priority 3: Nice-to-Have Enhancements

#### 14. **Accessibility Improvements**
- Enhance keyboard navigation
- Add proper ARIA labels
- Improve focus indicators
- Better color contrast
- Screen reader friendly animations

#### 15. **Dark Mode Support**
- Implement theme switcher
- Add dark mode variants
- Test readability in both modes
- Smooth theme transitions

#### 16. **Responsive Design Polish**
- Mobile-first refinements
- Touch-friendly interactive elements
- Tablet optimizations
- Landscape mode handling

## Implementation Workflow

### Phase 1: Setup (Day 1)
```bash
# Ensure skills are available
npx skills add https://github.com/shadcn-ui/ui --skill shadcn
npx skills add https://github.com/pbakaus/impeccable --skill animate
npx skills add https://github.com/raphaelsalaja/skill --skill 12-principles-of-animation

# 1. Activate shadcn/studio MCP tools if not already active
# 2. Review and document all registries available
# 3. Create session plan documenting approach
```

### Phase 2: High-Priority Components (Days 2-3)
```
1. Error Pages (/cui workflow) - Use shadcn skill
2. Landing Hero (/cui workflow) - Use animate + 12-principles skills
3. Skeleton Screens (custom components) - Use shadcn skill
4. Confirmation Dialogs (/cui workflow) - Use animate skill
5. Empty States (/cui workflow) - Use shadcn skill
```

### Phase 3: Internal Dashboard Improvements (Days 4-5)
```
1. Admin Dashboard UI Enhancement - Use shadcn + animate skills
2. Helper Portal Refinement - Use shadcn + animate skills
3. Customer Portal Polish - Use animate + 12-principles skills
4. Status Badges & Indicators - Use animate skill
5. Real-time Updates Animation - Use animate + 12-principles skills
```

### Phase 4: Medium-Priority Enhancements (Days 6-7)
```
1. Data Visualization - Use shadcn skill
2. Form Enhancements - Use shadcn + animate skills
3. Navigation Improvements - Use animate skill
4. Typography & Colors - Use shadcn skill
```

### Phase 5: Testing & Refinement (Day 8)
```
1. Cross-browser testing
2. Mobile responsiveness check
3. Accessibility audit (WCAG)
4. Performance validation
5. User testing feedback
```

## Skills & Tools Reference

### Skill: shadcn
**Usage**: Component structure, patterns, and best practices
- Use for component architecture decisions
- Reference component composition patterns
- Ensure consistency across component library
- Leverage shadcn/ui best practices for accessibility

### Skill: animate
**Usage**: Animation implementation and smoothness
- Use for all micro-interactions
- Reference easing functions and timing
- Implement smooth transitions
- Add visual feedback animations

### Skill: 12-principles-of-animation
**Usage**: Professional animation polish
- Apply anticipation before actions
- Use staging for clarity
- Implement proper easing (ease-in-out, cubic-bezier)
- Overlapping actions for naturalism
- Follow through for momentum
- Arc for organic motion

## MCP Server Usage Strategy

### Registry: @ss-blocks (Primary)
- Search for pre-built UI blocks matching each need
- Install complete blocks vs building from scratch
- Customize colors, text, and layout

### Registry: @ss-components (Secondary)
- Use for individual component variants
- Mix with @shadcn base components
- Combine for custom layouts

### Registry: @ss-themes (Optional)
- Review professional theme options
- Extract design patterns
- Apply color refinements to current theme

### Registry: @shadcn (Foundation)
- Leverage existing base components
- Create custom components not available in studios blocks
- Base layer for all component buildouts

## Design System Requirements

### Colors (Maintain consistency)
- Primary: #1E1B4B (Indigo) - Actions, links, active states
- Accent: #F97316 (Orange) - CTAs, highlights, hover states
- Success: #10B981 (Green) - Confirmations, completions
- Destructive: #EF4444 (Red) - Errors, warnings, deletions
- Neutral: #6B7280 (Gray) - Text, borders, backgrounds

### Spacing Scale
- Use Tailwind's default 4px base unit
- Maintain consistency with sm:, md:, lg: breakpoints
- Mobile-first approach with responsive utilities

### Typography
- Font stack: System fonts + fallbacks (check tailwind config)
- Hierarchy: h1 (2.25rem), h2 (1.875rem), h3 (1.5rem), body (1rem)
- Line heights: Headings (1.2), Body (1.6)

### Animations
- Duration: 150-300ms for micro-interactions
- Easing: ease-in-out for smooth feel
- 3D transforms: Use sparingly for depth
- Apply 12-principles for professional feel

## Accessibility Requirements

- [ ] WCAG 2.1 AA compliance minimum
- [ ] Color contrast ratios: 4.5:1 for text, 3:1 for UI
- [ ] All interactive elements keyboard accessible
- [ ] Form fields properly labeled with `<label>`
- [ ] ARIA attributes where necessary (aria-label, aria-describedby)
- [ ] Loading states announced with aria-busy
- [ ] Error messages linked to form fields with aria-invalid
- [ ] Focus indicators visible on all interactive elements
- [ ] Animations respect prefers-reduced-motion

## Performance Considerations

- Lazy load images in landing and dashboard
- Code-split feature modules
- Use Suspense boundaries for async data
- Optimize bundle size with tree-shaking
- Monitor Core Web Vitals (LCP, FID, CLS)
- Use CSS animations over JS animations where possible

## Testing Checklist

- [ ] Visual regression testing (Percy, Chromatic)
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Accessibility audit (axe DevTools, WAVE)
- [ ] Performance profiling (Lighthouse, DevTools)
- [ ] User interaction testing (form submission, navigation)
- [ ] Real-time feature testing (WebSocket updates)
- [ ] Dark mode verification
- [ ] Animation performance (60 FPS)

## Success Metrics

- ✅ Landing page conversion rate improvement
- ✅ Reduced form abandonment rate
- ✅ Improved accessibility scores (100/100 Lighthouse)
- ✅ Faster perceived load times (skeleton screens)
- ✅ Better mobile experience (responsive, touch-friendly)
- ✅ Professional visual polish (on-brand, modern)
- ✅ Improved user satisfaction (post-launch survey)
- ✅ Zero accessibility violations (WCAG AA)
- ✅ Smooth animations (60 FPS performance)
- ✅ Admin dashboard productivity increase
- ✅ Reduced support tickets for UI confusion

## Tools & Resources

- **Shadcn/studio MCP**: For premium blocks and components
- **TailwindCSS**: Utility-first styling
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Lucide**: Icon library
- **Recharts** or **Chart.js**: Data visualization
- **Accessibility**: WAVE, axe DevTools, WCAG guidelines
- **Performance**: Lighthouse, WebPageTest
- **Animation Tools**: Framer Motion, Animate.css
- **Skills**: shadcn, animate, 12-principles-of-animation

## Internal Platform Features to Enhance

### Admin Portal
- Verification workflow dashboard
- Helper management interface
- Booking management system
- Payment tracking and payouts
- Dispute resolution center
- Analytics and reporting
- User management interface

### Helper Portal
- Earnings dashboard
- Availability scheduling
- Job history and ratings
- Profile management
- Video KYC workflow
- Payout requests
- Performance metrics

### Customer Portal
- Active bookings view
- Booking history
- Payment methods
- Reviews and ratings
- Help and support
- Account settings

## Notes

- Follow shadcn/studio MCP workflow step-by-step without deviations
- Use `/cui` workflow for create-UI tasks (new components)
- Use `/rui` workflow for refine-UI tasks (updating existing)
- Use `/ftc` workflow if converting Figma designs
- Test each component after implementation
- Maintain design system consistency throughout
- Document custom components created outside MCP blocks
- Apply skills systematically: shadcn for structure, animate for motion, 12-principles for polish
- Update this prompt as priorities shift or new needs emerge
- All animations should follow 12-principles of animation for professional feel

## Critical UI Gaps to Address

### 🔴 Priority 1: High-Impact Changes

#### 1. **Professional Error Pages**
**Current State**: Outdated sci-fi theming ("Protocol Error", "Abandon Ship")
**Target**: Modern, helpful error pages with next steps

**Changes Required**:
- Replace apps/web/src/app/error.tsx with professional error boundary
- Replace apps/web/src/app/not-found.tsx with custom 404 page
- Create apps/web/src/app/error-boundary.tsx component
- Add illustration/graphics for 404, 500, maintenance states
- Include helpful CTAs: "Go Home", "Contact Support", "Report Issue"
- **Use shadcn/studio**: error-page block, 404-page block, illustration components

**Implementation Approach**:
```
1. Search @ss-blocks for error-related blocks: 'error page', '404 page', 'error states'
2. Get examples and adapt to brand colors (Indigo + Orange)
3. Add helpful error messaging and recovery actions
4. Implement consistent error state across all pages
```

#### 2. **Modern Landing Page Hero**
**Current State**: Basic layout, missing visual impact
**Target**: Professional hero with animations, clear value prop

**Changes Required**:
- Redesign hero section (apps/web/src/features/landing/components/hero.tsx)
- Add gradient background with subtle animations
- Improve headline hierarchy and copywriting
- Add CTA buttons with hover effects
- Implement parallax or reveal animations
- Add hero graphics/illustrations
- **Use shadcn/studio**: hero block, feature showcase blocks, CTA blocks

**Implementation Approach**:
```
1. Search @ss-blocks for hero blocks: 'hero section', 'landing hero', 'feature hero'
2. Get 2-3 professional hero examples matching your color scheme
3. Adapt to include your specific value props (booking, helper platform)
4. Add micro-interactions: button hover, scroll reveal, gradient animation
5. Ensure responsive on mobile (bottom-nav is visible)
```

#### 3. **Loading State Overhaul - Skeleton Screens**
**Current State**: Generic spinners throughout app
**Target**: Skeleton screens matching content shapes

**Changes Required**:
- Create reusable skeleton component in @repo/ui
- Implement for all async data loads:
  - Booking list page (apps/web/src/features/booking/pages/bookings.tsx)
  - Helper profiles (apps/web/src/features/helper/pages/helpers.tsx)
  - Admin data tables (apps/web/src/features/admin/)
  - Dashboard cards (apps/web/src/app/\(portal\)/customer/page.tsx)
- Replace all spinner-based loading states
- Add loading animation (pulse or wave effect)

**Implementation Approach**:
```
1. Create apps/web/src/components/loading/
   - CardSkeleton.tsx (for booking/profile cards)
   - TableSkeleton.tsx (for admin tables)
   - FormSkeleton.tsx (for forms)
   - ListSkeleton.tsx (for job lists)

2. Update all pages with loading states:
   - Use Suspense + fallback with skeleton components
   - Import from newly created skeleton components
   - Match skeleton layout to actual content

3. Use @repo/ui for base Skeleton component
4. Add CSS animation in globals.css (pulse or shimmer effect)
```

#### 4. **Confirmation Dialogs & Modals**
**Current State**: Minimal use of dialogs for destructive actions
**Target**: Professional confirmation flows for all data modifications

**Changes Required**:
- Create reusable ConfirmationDialog component
- Add confirmation for:
  - Cancel booking (apps/web/src/features/booking/components/booking-actions.tsx)
  - Helper rejection (apps/web/src/features/admin/pages/helpers.tsx)
  - Payment disputes (apps/web/src/features/admin/pages/disputes.tsx)
  - Account deletion (apps/web/src/app/\(portal\)/account/settings.tsx)
  - Role-based admin actions
- Implement modal with description, warning colors for destructive actions
- **Use shadcn/studio**: dialog block, confirmation block

**Implementation Approach**:
```
1. Create apps/web/src/components/dialogs/confirmation-dialog.tsx
   - Props: title, description, onConfirm, onCancel, isDestructive
   - Show warning state with red colors if destructive
   - Use Alert component for warnings

2. Wrap all destructive actions with ConfirmationDialog
3. Search @ss-blocks for 'confirmation dialog', 'alert dialog' examples
4. Adapt styling to match app colors
```

#### 5. **Empty States**
**Current State**: Missing from multiple features
**Target**: Custom illustrations and helpful messaging for empty states

**Changes Required**:
- Add empty state component for:
  - No bookings (apps/web/src/features/booking/pages/bookings.tsx)
  - No jobs (apps/web/src/features/helper/pages/incoming-jobs.tsx)
  - No reviews (apps/web/src/features/booking/pages/reviews.tsx)
  - No notifications (all dashboards)
  - No data (admin tables)
- Include illustration, message, and CTA
- **Use shadcn/studio**: empty-state block, illustration components

**Implementation Approach**:
```
1. Create apps/web/src/components/empty-state.tsx
   Props: title, description, illustration, cta (optional), icon

2. Add to all pages with potential empty data:
   - Booking list pages
   - Helper job panels
   - Admin data tables
   - Notification centers

3. Search @ss-blocks for 'empty state', 'no results', 'empty page'
4. Get illustrations and adapt to your brand
```

### 🟡 Priority 2: Medium-Impact Improvements

#### 6. **Data Visualization Dashboard**
**Current State**: Admin dashboard is card-based, no charts
**Target**: Professional metrics dashboard with charts

**Changes Required**:
- Add chart components to apps/web/src/features/admin/pages/dashboard.tsx
- Implement charts:
  - Bookings over time (line chart)
  - Revenue breakdown (pie/donut chart)
  - Helper ratings distribution (bar chart)
  - KPI metrics (number cards with trend indicators)
- Use Recharts or similar library
- Add filters: date range, helper type, location
- **Use shadcn/studio**: dashboard block, chart blocks

**Implementation Approach**:
```
1. Install chart library (check package.json for existing)
2. Create apps/web/src/components/charts/
   - BookingsChart.tsx
   - RevenueChart.tsx
   - RatingsChart.tsx
3. Update admin dashboard with chart section
4. Search @ss-blocks for 'dashboard', 'chart', 'metrics' blocks
5. Get professional dashboard layout examples
```

#### 7. **Form Enhancements**
**Current State**: Basic error display with toasts
**Target**: Inline validation with progress indicators

**Changes Required**:
- Update auth forms (apps/web/src/features/auth/pages/signin.tsx, signup.tsx)
- Add inline field-level error display with color coding
- Implement form progress indicator for multi-step forms
- Add password strength indicator for signup
- Better form spacing and visual hierarchy
- **Use shadcn/studio**: form block, input variant blocks, progress blocks

**Implementation Approach**:
```
1. Create apps/web/src/components/form/form-progress.tsx
   - Show current step / total steps
   - Progress bar with step indicators

2. Update FieldError component in @repo/ui:
   - Add color coding (red for errors, green for success)
   - Add icon indicators

3. Add PasswordStrength indicator for signup form
4. Search @ss-blocks for 'form', 'input', 'form validation' blocks
```

#### 8. **Navigation Improvements**
**Current State**: Breadcrumbs exist but unused, role-switching incomplete
**Target**: Complete navigation system with role switching

**Changes Required**:
- Implement breadcrumb navigation in all portal pages
- Add role-switching dropdown in header (for admins/testers)
- Enhance sidebar navigation with icons and active states
- Add scroll-to-top button on long pages
- Sticky table headers for data tables
- **Use shadcn/studio**: breadcrumb block, navigation blocks

**Implementation Approach**:
```
1. Create apps/web/src/components/breadcrumbs/page-breadcrumbs.tsx
   - Auto-generate from route structure
   - Display in page header above title

2. Update apps/web/src/components/shared/navbar.tsx:
   - Add role-switching dropdown
   - Link to account/settings

3. Implement sticky headers in table components
4. Search @ss-blocks for 'breadcrumb', 'navigation', 'header' blocks
```

#### 9. **Micro-Interactions & Animations**
**Current State**: Only fadeUp animation in globals.css
**Target**: Professional micro-interactions throughout

**Changes Required**:
- Button hover: scale up slightly + shadow
- Input focus: border color change + glow effect
- Card hover: lift (translate -y) + shadow increase
- Success state: checkmark animation + color transition
- Error state: shake animation + color pulse
- Page transitions: fade + slide
- Loading indicators: enhanced spinner with rotations
- **Use shadcn/studio**: animation blocks, transition blocks

**Implementation Approach**:
```
1. Update apps/web/src/app/globals.css with keyframes:
   @keyframes slideUp { /* from bottom */ }
   @keyframes scaleIn { /* grow from center */ }
   @keyframes shake { /* error feedback */ }
   @keyframes pulse { /* highlight attention */ }

2. Apply to components:
   - Buttons: hover:scale-105 hover:shadow-lg
   - Inputs: focus:ring-2 focus:ring-primary
   - Cards: hover:-translate-y-1 hover:shadow-xl
   - Success feedback: animate-pulse

3. Add page transition animations
4. Search @ss-blocks for 'animation', 'transition', 'micro-interaction'
```

#### 10. **Typography & Color Refinements**
**Current State**: Basic typography, flat color scheme
**Target**: Professional hierarchy and subtle gradients

**Changes Required**:
- Refine heading sizes (h1-h6)
- Improve line heights and letter spacing
- Add subtle gradients to key UI elements
- Enhance color contrast ratios
- Add gradient text effect to hero
- Better color usage for status indicators
- **Use shadcn/studio**: theme blocks, typography blocks

**Implementation Approach**:
```
1. Update tailwind.config in apps/web/:
   - Refine fontSize scale
   - Add line-height customizations
   - Add gradient utilities

2. Create text utilities:
   - gradient-text class
   - Better status color indicators

3. Update globals.css with improved CSS variables
4. Test contrast ratios (WCAG AA minimum)
```

## Implementation Workflow

### Phase 1: Setup (Day 1)
```bash
# 1. Activate shadcn/studio MCP tools if not already active
# 2. Review and document all registries available

# 3. Create session plan documenting approach
```

### Phase 2: High-Priority Components (Days 2-3)
```
1. Error Pages (/cui workflow)
2. Landing Hero (/cui workflow)
3. Skeleton Screens (custom components)
4. Confirmation Dialogs (/cui workflow)
5. Empty States (/cui workflow)
```

### Phase 3: Medium-Priority Enhancements (Days 4-5)
```
1. Data Visualization
2. Form Enhancements
3. Navigation Improvements
4. Micro-Interactions
5. Typography & Colors
```

### Phase 4: Testing & Refinement (Day 6)
```
1. Cross-browser testing
2. Mobile responsiveness check
3. Accessibility audit (WCAG)
4. Performance validation
5. User testing feedback
```

## MCP Server Usage Strategy

### Registry: @ss-blocks (Primary)
- Search for pre-built UI blocks matching each need
- Install complete blocks vs building from scratch
- Customize colors, text, and layout

### Registry: @ss-components (Secondary)
- Use for individual component variants
- Mix with @shadcn base components
- Combine for custom layouts

### Registry: @ss-themes (Optional)
- Review professional theme options
- Extract design patterns
- Apply color refinements to current theme

### Registry: @shadcn (Foundation)
- Leverage existing base components
- Create custom components not available in studios blocks
- Base layer for all component buildouts

## Design System Requirements

### Colors (Maintain consistency)
- Primary: #1E1B4B (Indigo) - Actions, links, active states
- Accent: #F97316 (Orange) - CTAs, highlights, hover states
- Success: #10B981 (Green) - Confirmations, completions
- Destructive: #EF4444 (Red) - Errors, warnings, deletions
- Neutral: #6B7280 (Gray) - Text, borders, backgrounds

### Spacing Scale
- Use Tailwind's default 4px base unit
- Maintain consistency with sm:, md:, lg: breakpoints
- Mobile-first approach with responsive utilities

### Typography
- Font stack: System fonts + fallbacks (check tailwind config)
- Hierarchy: h1 (2.25rem), h2 (1.875rem), h3 (1.5rem), body (1rem)
- Line heights: Headings (1.2), Body (1.6)

### Animations
- Duration: 150-300ms for micro-interactions
- Easing: ease-in-out for smooth feel
- 3D transforms: Use sparingly for depth

## Accessibility Requirements

- [ ] WCAG 2.1 AA compliance minimum
- [ ] Color contrast ratios: 4.5:1 for text, 3:1 for UI
- [ ] All interactive elements keyboard accessible
- [ ] Form fields properly labeled with `<label>`
- [ ] ARIA attributes where necessary (aria-label, aria-describedby)
- [ ] Loading states announced with aria-busy
- [ ] Error messages linked to form fields with aria-invalid
- [ ] Focus indicators visible on all interactive elements

## Performance Considerations

- Lazy load images in landing and dashboard
- Code-split feature modules
- Use Suspense boundaries for async data
- Optimize bundle size with tree-shaking
- Monitor Core Web Vitals (LCP, FID, CLS)

## Testing Checklist

- [ ] Visual regression testing (Percy, Chromatic)
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Accessibility audit (axe DevTools, WAVE)
- [ ] Performance profiling (Lighthouse, DevTools)
- [ ] User interaction testing (form submission, navigation)
- [ ] Real-time feature testing (WebSocket updates)
- [ ] Dark mode verification

## Success Metrics

- ✅ Landing page conversion rate improvement
- ✅ Reduced form abandonment rate
- ✅ Improved accessibility scores (100/100 Lighthouse)
- ✅ Faster perceived load times (skeleton screens)
- ✅ Better mobile experience (responsive, touch-friendly)
- ✅ Professional visual polish (on-brand, modern)
- ✅ Improved user satisfaction (post-launch survey)
- ✅ Zero accessibility violations (WCAG AA)

## Tools & Resources

- **Shadcn/studio MCP**: For premium blocks and components
- **TailwindCSS**: Utility-first styling
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Lucide**: Icon library
- **Recharts** or **Chart.js**: Data visualization
- **Accessibility**: WAVE, axe DevTools, WCAG guidelines
- **Performance**: Lighthouse, WebPageTest

## Notes

- Follow shadcn/studio MCP workflow step-by-step without deviations
- Use `/cui` workflow for create-UI tasks (new components)
- Use `/rui` workflow for refine-UI tasks (updating existing)
- Use `/ftc` workflow if converting Figma designs
- Test each component after implementation
- Maintain design system consistency throughout
- Document custom components created outside MCP blocks
- Update this prompt as priorities shift or new needs emerge
