# Admin System Changelog

> **Track all changes related to authentication, admin dashboard, and dynamic content management.**

---

## Overview

This document tracks the implementation of the admin system for the Personal Portfolio. All changes related to authentication, backend API routes, frontend admin pages, and dynamic content fetching are logged here.

---

## Progress Tracker

| Feature | Status | Date | Notes |
|---------|--------|------|-------|
| Authentication Setup | ✅ Complete | 2026-01-20 | Login revamped, admin indicator added |
| Login Page UI Revamp | ✅ Complete | 2026-01-20 | Glassmorphism design, animations |
| Backend API Routes | ✅ Complete | 2026-01-20 | 7 content types implemented |
| Dynamic Home Page | ✅ Complete | 2026-01-20 | All sections fetch from APIs |
| Admin Dashboard | ✅ Complete | 2026-01-21 | Stats cards and quick actions |
| Skills Management | ✅ Complete | 2026-01-21 | Full CRUD with ordering, icons, atomic swaps |
| Projects Management | ✅ Complete | 2026-01-22 | Full CRUD, order column, swap-order, form reset, loading UX |
| Experience Management | ✅ Complete | 2026-01-22 | Full CRUD, ordering, swap-order, admin page |
| Education Management | ✅ Complete | 2026-01-22 | Full CRUD, ordering, swap-order, admin page |
| Hobbies Management | ✅ Complete | 2026-01-22 | Full CRUD, ordering, swap-order, admin page |
| Testimonials Management | ✅ Complete | 2026-01-21 | Approval workflow working |
| Messages Management | ✅ Complete | 2026-01-21 | Inbox with read/unread status |


---

## Detailed Changes

### Phase 1: Authentication ✅ (2026-01-20)

**Login Page Revamp:**
- Modern glassmorphism design with gradient background
- Animated background elements (blurred orbs)
- Password visibility toggle
- Improved error handling with styled messages
- Loading spinner during authentication

**Admin Indicator:**
- Navbar now uses `authClient.useSession()` hook
- Shows gradient "Admin" badge when authenticated
- Dashboard link and Logout button for admins
- Loading state placeholder during session check

### Phase 2: Backend API Routes ✅ (2026-01-20)

**Created CRUD endpoints for all content types:**

| Endpoint | Methods | Auth |
|----------|---------|------|
| `/api/skills` | GET, POST | GET public |
| `/api/skills/[id]` | GET, PUT, DELETE | PUT/DELETE admin |
| `/api/projects` | GET, POST | GET public |
| `/api/projects/[id]` | GET, PUT, DELETE | PUT/DELETE admin |
| `/api/experiences` | GET, POST | GET public |
| `/api/experiences/[id]` | GET, PUT, DELETE | PUT/DELETE admin |
| `/api/education` | GET, POST | GET public |
| `/api/education/[id]` | GET, PUT, DELETE | PUT/DELETE admin |
| `/api/hobbies` | GET, POST | GET public |
| `/api/hobbies/[id]` | GET, PUT, DELETE | PUT/DELETE admin |
| `/api/testimonials` | GET, POST | GET approved only, POST public |
| `/api/testimonials/all` | GET | Admin only |
| `/api/testimonials/[id]` | GET, PUT, DELETE | PUT/DELETE admin |
| `/api/messages` | GET, POST | GET admin, POST public |
| `/api/messages/[id]` | GET, PUT, DELETE | All admin only |

### Phase 4: Dynamic Content ✅ (2026-01-20)

**Home Page (`page.tsx`):**
- Fetches projects, skills, experiences, education, hobbies from APIs
- Server-side rendering with 60-second revalidation
- Graceful fallbacks for empty data

**Testimonials Page:**
- Fetches approved testimonials from `/api/testimonials`
- Working submission form that POSTs to API
- Success confirmation after submission

**Contact Page:**
- Form submits to `/api/messages`
- Loading states and error handling
- Success confirmation with option to send another

### Phase 3: Admin Dashboard 🔄 (2026-01-20)

**Dashboard Overview:**
- Stats cards showing count of skills, projects, testimonials, messages
- Quick action links to common tasks
- Content management grid for all sections

**Skills Management:**
- Full CRUD operations with inline form
- Table view with edit/delete actions
- Removed proficiency field from schema and APIs
- Order customization support

**Projects Management:**
- Full CRUD with technologies array handling
- Featured project toggle
- Image, live, and GitHub URL fields
- Order customization support

**Testimonials Approval:**
- Pending/approved sections
- Approve/reject/delete actions
- Visual distinction for pending testimonials

**Messages Inbox:**
- List/detail view with unread indicators
- Mark as read/unread functionality
- Delete messages
- Quick reply via mailto links

### Database Seeding ✅ (2026-01-21)

**Smart Seed Strategy:**
- Created [seed.ts](file:///c:/Coding/Personal-Portfolio/backend/seed.ts) with initial data
- Automatic seeding on container startup via [startup.sh](file:///c:/Coding/Personal-Portfolio/backend/scripts/startup.sh)
- Checks for existing data before inserting (idempotent)
- All seeded data remains **fully editable** via admin dashboard

**Initial Data:**
- 6 Skills (React, TypeScript, Next.js, Node.js, PostgreSQL, Docker)
- 2 Projects (Portfolio, E-Commerce examples)
- 1 Education entry
- 2 Work Experiences
- 3 Hobbies

**Works In:**
- ✅ Local development (`docker-compose up`)
- ✅ Production deployments
- ✅ Data persists across restarts
- ✅ Admin edits are preserved

### JWT Token Authentication Fix ✅ (2026-01-21)

**Problem Identified:**
- Admin pages were failing to add, update, or delete content
- Code was trying to access `session?.session.token` which doesn't exist in Better Auth's session structure
- Missing JWT client plugin configuration

**Solution Implemented:**
- Added `jwtClient` plugin to Better Auth client configuration
- Created `getAuthToken()` helper function in `auth-client.ts` that uses `authClient.token()` to retrieve JWT tokens
- Created `authenticatedFetch()` function in `api.ts` that automatically includes JWT token in Authorization header
- Updated all admin pages to use the new authentication pattern:
  - Skills Management (`/admin/skills`)
  - Projects Management (`/admin/projects`)
  - Testimonials Management (`/admin/testimonials`)
  - Messages Management (`/admin/messages`)
  - Dashboard (`/admin/dashboard`)

**Improvements:**
- Centralized token retrieval logic
- Better error handling with specific error messages from API
- Loading states during form submissions
- Improved form reset behavior
- Consistent authentication pattern across all admin pages

**Files Modified:**
- `frontend/app/src/lib/auth-client.ts` - Added jwtClient plugin and getAuthToken helper
- `frontend/app/src/lib/api.ts` - Added authenticatedFetch function with improved error handling
- `frontend/app/src/app/admin/skills/page.tsx` - Fixed token usage, added loading states
- `frontend/app/src/app/admin/projects/page.tsx` - Updated to use authenticatedFetch
- `frontend/app/src/app/admin/testimonials/page.tsx` - Updated to use authenticatedFetch
- `frontend/app/src/app/admin/messages/page.tsx` - Updated to use authenticatedFetch
- `frontend/app/src/app/admin/dashboard/page.tsx` - Updated to use authenticatedFetch

**Status:**
- ✅ All CRUD operations now working correctly
- ✅ Skills can be added, edited, and deleted
- ✅ Projects can be added, edited, and deleted
- ✅ Testimonials can be approved/rejected and deleted
- ✅ Messages can be marked as read/unread and deleted

### Skills Management Full Implementation ✅ (2026-01-21)

**Complete Skills Page Features:**

**1. Order Management System:**
- **Auto-ordering**: New skills automatically assigned `max(order) + 1` on creation
- **Visual Order Display**: Order column shown first in table with numeric values
- **Up/Down Arrow Controls**: Quick reordering buttons for adjacent skills
- **Position Dropdown**: When editing, dropdown shows all existing positions with skill names
- **Atomic Swapping**: Order changes use atomic transactions to prevent race conditions
- **Dedicated Swap Endpoint**: New `/api/skills/swap-order` endpoint for atomic order swaps

**2. Skill Icons:**
- **Icon URL Field**: Admin can add icon URLs for each skill
- **Icon Display**: Icons displayed in both admin table and public home page
- **Auto-Icon Feature**: "Add Icons" button populates default icons for common technologies
- **Case-Insensitive Matching**: Icon lookup works regardless of skill name casing
- **Default Icon Library**: Pre-configured icons for 30+ common technologies (React, TypeScript, Python, etc.)

**3. UI/UX Improvements:**
- **Loading States**: `submitting` and `reordering` states prevent duplicate actions
- **Error Handling**: Specific error messages from API displayed to user
- **Form Reset**: Proper form state management on cancel/submit
- **Visual Feedback**: Icons displayed next to skill names in table
- **Position Dropdown**: Shows current skill position and available swap targets
- **Empty Position Handling**: Dropdown only shows existing positions (no invalid "New" options)

**4. Backend Enhancements:**
- **Atomic Transactions**: Order swaps use `db.transaction()` for data consistency
- **Auto-Assign Order**: POST endpoint automatically calculates next order number
- **Swap Logic**: PUT endpoint handles order swapping with `shouldSwap` flag
- **Case-Insensitive Icons**: Icon matching normalized for better UX
- **Error Handling**: Proper 404 responses for missing skills

**Files Modified:**
- `frontend/app/src/app/admin/skills/page.tsx` - Complete rewrite with ordering, icons, atomic swaps
- `backend/src/app/api/skills/route.ts` - Auto-order assignment on creation
- `backend/src/app/api/skills/[id]/route.ts` - Atomic swap logic with transactions
- `backend/src/app/api/skills/swap-order/route.ts` - New atomic swap endpoint
- `backend/src/app/api/skills/add-icons/route.ts` - Icon population with case-insensitive matching
- `frontend/app/src/app/page.tsx` - Icon display on home page
- `backend/seed.ts` - Icon URLs in seed data

**Status:**
- ✅ Full CRUD operations with order management
- ✅ Skill icons with auto-population feature
- ✅ Atomic order swapping prevents race conditions
- ✅ Intuitive UI with visual feedback
- ✅ Robust error handling

### Home Page Dynamic Updates ✅ (2026-01-21)

**Problem:**
- Home page was using `{ next: { revalidate: 60 } }` causing 60-second cache
- Admin changes not immediately visible on public site
- Server-side error when using client-side event handlers

**Solution:**
- Changed fetch strategy to `{ cache: 'no-store' }` for immediate updates
- Added `export const dynamic = 'force-dynamic'` to force dynamic rendering
- Replaced `Promise.all` with `Promise.allSettled` for robust error handling
- Added `.catch(() => [])` for JSON parsing errors
- Removed client-side `onError` handler from Server Component `<img>` tags

**Improvements:**
- Admin changes reflect immediately on home page
- Page doesn't crash if one API fails
- Graceful degradation for missing data
- Skill icons display correctly on public page

**Files Modified:**
- `frontend/app/src/app/page.tsx` - Dynamic rendering, robust fetching, icon display
- `frontend/app/src/app/testimonials/page.tsx` - Dynamic rendering

**Status:**
- ✅ Real-time content updates
- ✅ Robust error handling
- ✅ Skill icons visible on home page

---

### Skills Ordering System Refinement ✅ (2026-01-21)

**Position Dropdown Fix:**
- **Problem**: Dropdown showed invalid "Position X (New)" option when editing, causing "Failed to update skill" errors
- **Solution**: Removed `maxOrder + 1` from dropdown options when editing
- **Result**: Dropdown now only shows existing positions that can be swapped with
- **Logic**: When editing, only display positions that have existing skills (no empty/new positions)

**Files Modified:**
- `frontend/app/src/app/admin/skills/page.tsx` - Removed invalid "New" position option from edit dropdown

**Status:**
- ✅ Edit dropdown only shows valid swap positions
- ✅ No more "Failed to update skill" errors from invalid positions

---

### Projects Section Fixes ✅ (2026-01-22)

**Backend:**
- **POST** – Auto-assign `order` as `max(order) + 1` when missing or 0 (aligned with skills).
- **PUT** – Explicit allowlist for `title`, `description`, `technologies`, `imageUrl`, `liveUrl`, `githubUrl`, `featured`, `order`. No longer spread request body; preserve `titleFr` / `descriptionFr` when not sent.
- **swap-order** – New `POST /api/projects/swap-order` endpoint. Body: `{ projectId1, projectId2 }`. Atomic transaction to swap project orders (admin only).

**Admin Projects Page:**
- **Add Project** – Reset form and `editingProject`; set `order` to `max + 1`; clear error. Dedicated `handleAddProject` handler.
- **Submitting state** – Loading spinner and "Saving..." on submit; disable submit/cancel while saving; show API errors in red banner.
- **Table** – Sort by `order`; add **Order** column with up/down reorder buttons. `handleReorder` calls swap-order and refetches.

**Home Page:**
- **Project images** – Switched from Next.js `Image` to plain `<img>` with `project.imageUrl` (full URLs). Avoids `remotePatterns` restrictions; matches skills icon approach. "No Image" placeholder when empty.
- **Links** – Live Demo and GitHub continue to use `liveUrl` / `githubUrl`; backend PUT allowlist persists them.

**Files Modified:**
- `backend/src/app/api/projects/route.ts` – Auto-order on create
- `backend/src/app/api/projects/[id]/route.ts` – PUT allowlist
- `backend/src/app/api/projects/swap-order/route.ts` – New swap-order endpoint
- `frontend/app/src/app/admin/projects/page.tsx` – Form reset, submitting, order column, reorder UI
- `frontend/app/src/app/page.tsx` – Project images use `<img>`

**Status:**
- ✅ Projects add, edit, delete, and reorder working
- ✅ Home page project images and links update correctly

---

### Experience & Education Section ✅ (2026-01-22)

**Backend:**

- **Experiences API**
  - **POST** – Require `company`, `position`, `description`, `location`, `startDate`. Auto-assign `order` as `max(order) + 1` when missing or 0. Insert only allowlisted fields.
  - **PUT** – Allowlist: `company`, `position`, `positionFr`, `description`, `descriptionFr`, `startDate`, `endDate`, `current`, `location`, `order`. Parse dates; no body spread. Add `shouldSwap` logic: when `order` + `shouldSwap` are set, run transaction to swap order with experience at target position.
  - **swap-order** – New `POST /api/experiences/swap-order`. Body: `{ experienceId1, experienceId2 }`. Atomic transaction to swap orders (admin only).
  - **GET** – `Cache-Control: no-store` for consistency with projects.

- **Education API**
  - **POST** – Require `institution`, `degree`, `field`, `startDate`. Auto-assign `order` as `max(order) + 1` when missing or 0.
  - **PUT** – Allowlist: `institution`, `degree`, `degreeFr`, `field`, `fieldFr`, `startDate`, `endDate`, `current`, `description`, `descriptionFr`, `order`. Parse dates; `shouldSwap` + transaction-based order swap (same pattern as experiences).
  - **swap-order** – New `POST /api/education/swap-order`. Body: `{ educationId1, educationId2 }`. Atomic swap (admin only).
  - **GET** – `Cache-Control: no-store`.

**Frontend:**

- **Admin Experience Page** (`/admin/experience`) – New page. Auth via `authClient.useSession`; redirect if unauthenticated. CRUD with `authenticatedFetch` / `fetchApi`. Form: company, position, description, location, start date, end date (optional), “Current role” checkbox. Table with Order column, up/down reorder buttons, Position dropdown when editing. Loading states, error banner, form reset on cancel/submit. Matches projects page layout and styling.

- **Admin Education Page** (`/admin/education`) – New page. Same structure as Experience. Form: institution, degree, field, start date, end date (optional), “Currently studying” checkbox, description (optional). Order column, reorder UI, position dropdown when editing.

**Dashboard:**

- Stats now include **Experience** and **Education** counts (from `GET /api/experiences` and `GET /api/education`). New stat cards with links to `/admin/experience` and `/admin/education`.
- Quick Actions: added “Add Experience” and “Add Education” links. Content Management grid already linked to both; no change needed.

**Home Page:**

- No code changes. Home already fetches experiences and education, renders Work Experience and Education sections, and uses `force-dynamic` + `no-store`. Admin changes reflect on next load. Navbar `/#experience` and `/#education` match section IDs.

**Files Modified/Created:**

- `backend/src/app/api/experiences/route.ts` – GET Cache-Control, POST auto-order + startDate validation
- `backend/src/app/api/experiences/[id]/route.ts` – PUT allowlist, `shouldSwap`, transactions
- `backend/src/app/api/experiences/swap-order/route.ts` – **New** swap-order endpoint
- `backend/src/app/api/education/route.ts` – GET Cache-Control, POST auto-order + startDate validation
- `backend/src/app/api/education/[id]/route.ts` – PUT allowlist, `shouldSwap`, transactions
- `backend/src/app/api/education/swap-order/route.ts` – **New** swap-order endpoint
- `frontend/app/src/app/admin/experience/page.tsx` – **New** Experience management page
- `frontend/app/src/app/admin/education/page.tsx` – **New** Education management page
- `frontend/app/src/app/admin/dashboard/page.tsx` – Experience & Education stats, quick actions

**Status:**

- ✅ Experience and Education add, edit, delete, and reorder working
- ✅ Dashboard stats and links updated
- ✅ Home page continues to display both sections; updates reflect immediately

---

### Hobbies Section ✅ (2026-01-22)

**Backend:**

- **Hobbies API**
  - **GET** – `Cache-Control: no-store` on response. Keep `orderBy(schema.hobbies.order)`.
  - **POST** – Require `name`. Auto-assign `order` as `max(order) + 1` when missing or 0. Insert only allowlisted fields: `name`, `nameFr`, `description`, `descriptionFr`, `iconUrl`, `order`.
  - **PUT** – Allowlist: `name`, `nameFr`, `description`, `descriptionFr`, `iconUrl`, `order`. Add `shouldSwap` handling: when `order` + `shouldSwap` are set, run transaction to swap order with hobby at target position. Do not mutate body.
  - **swap-order** – New `POST /api/hobbies/swap-order`. Body: `{ hobbyId1, hobbyId2 }`. Admin-only. Atomic swap via `db.transaction`.

**Frontend:**

- **Admin Hobbies Page** (`/admin/hobbies`) – New page. Auth via `authClient.useSession`; redirect if unauthenticated. CRUD with `authenticatedFetch` / `fetchApi`. Form: Name (required), Description (optional), Icon URL via ImageUpload (optional). Table: Order column, up/down reorder, Position dropdown when editing. Icon thumbnail, Name, Description (truncated), Edit/Delete. Loading states, error banner, form reset. Matches education page layout and styling.

**Dashboard:**

- **Stats:** Added `hobbies`; fetch `GET /api/hobbies`, set `stats.hobbies = hobbies.length`.
- **Cards:** New "Hobbies" stat card (count + link to `/admin/hobbies`). Loading skeleton extended to 7 placeholders.
- **Quick Actions:** Added "Add Hobby" link to `/admin/hobbies`. Content Management already links to Hobbies; no change.

**Home Page:**

- **Hobbies section:** When `hobby.iconUrl` is present, render `<img>` for icon (plain `img`, `object-contain`). When missing, keep fallback (first letter of `name` in circle). Grid and card structure unchanged.

**Files Modified/Created:**

- `backend/src/app/api/hobbies/route.ts` – GET Cache-Control, POST auto-order
- `backend/src/app/api/hobbies/[id]/route.ts` – PUT allowlist, `shouldSwap`, transactions
- `backend/src/app/api/hobbies/swap-order/route.ts` – **New** swap-order endpoint
- `frontend/app/src/app/admin/hobbies/page.tsx` – **New** Hobbies management page
- `frontend/app/src/app/admin/dashboard/page.tsx` – Hobbies stat, card, "Add Hobby" quick action
- `frontend/app/src/app/page.tsx` – Hobby icon display when `iconUrl` present

**Status:**

- ✅ Hobbies add, edit, delete, and reorder working
- ✅ Dashboard stats and quick action updated
- ✅ Home page shows hobby icons when `iconUrl` set; fallback to initial otherwise

---

### Contact Section Complete Implementation ✅ (2026-01-23)

**Backend Enhancements:**

- **Rate Limiting** – New `backend/src/lib/rate-limit.ts` utility with IP-based tracking:
  - 5 messages per 15 minutes per IP
  - 20 messages per hour per IP
  - Automatic cleanup of expired entries
  - Rate limit headers in responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`)

- **Input Sanitization** – New `backend/src/lib/sanitize.ts` utility:
  - HTML tag removal and XSS prevention
  - Email normalization (lowercase, trim)
  - Strict email validation (RFC 5322 compliant)
  - Spam pattern detection (common keywords, excessive URLs)
  - Text sanitization with special character escaping

- **POST /api/messages** – Enhanced validation and security:
  - Field length validation (name: 2-100, email: max 255, subject: 3-200, message: 10-5000)
  - Name format validation (letters, spaces, hyphens, apostrophes, periods only)
  - Request body size limit (10KB max)
  - Server-side validation with detailed error messages
  - Spam detection before database insertion
  - Rate limiting applied before processing
  - Comprehensive error handling (JSON parse errors, validation errors, rate limit errors)

- **GET /api/messages** – Improved error handling:
  - Cache-Control headers (`no-store`) for admin data
  - Better error messages

- **GET/PUT/DELETE /api/messages/[id]** – Enhanced validation:
  - UUID format validation
  - Better error handling for invalid IDs
  - Request body validation for PUT endpoint
  - Cache-Control headers for admin data
  - Improved error messages

**Frontend Contact Form** (`frontend/app/src/app/contact/page.tsx`):

- **Client-Side Validation:**
  - Real-time validation as user types
  - Field-level error messages with ARIA attributes
  - Character counters for all fields
  - Form validation before submission
  - Validation rules match backend (name: 2-100, email: max 255, subject: 3-200, message: 10-5000)

- **UI/UX Improvements:**
  - Field-level error display (red borders, error messages below fields)
  - Character counters showing current/max length
  - Loading spinner during submission
  - Disabled submit button when form invalid or submitting
  - Better success state with clear call-to-action
  - Improved error banner with better styling
  - Dark mode support for all error states
  - Accessibility improvements (ARIA labels, proper focus management)

- **Error Handling:**
  - Server validation errors displayed at field level
  - Rate limit errors with retry time information
  - Generic error fallback with user-friendly messages
  - Field errors cleared on successful submission

**Admin Messages Page** (`frontend/app/src/app/admin/messages/page.tsx`):

- **Error Handling:**
  - Replaced `alert()` calls with proper error banners
  - Retry button for failed API calls
  - Dismissible action error messages
  - Better error messages from API

- **Loading States:**
  - Loading skeleton with animated placeholders
  - Loading indicators for individual actions (mark as read, delete)
  - Disabled buttons during actions

- **UI Improvements:**
  - Better empty state with icon and helpful message
  - Relative time formatting ("2 hours ago", "3 days ago")
  - Improved message list item styling
  - Better selected message detail view
  - Loading states for individual message actions
  - Improved date display (both relative and absolute)

**Type Safety:**

- Added `ValidationError` interface for field-level errors
- Added `ApiError` interface for API error responses
- Added `RateLimitError` interface for rate limit errors
- Updated `ContactMessage` type to match schema exactly

**Files Modified/Created:**

- `backend/src/lib/rate-limit.ts` – **New** rate limiting utility
- `backend/src/lib/sanitize.ts` – **New** input sanitization utility
- `backend/src/app/api/messages/route.ts` – Enhanced validation, rate limiting, sanitization
- `backend/src/app/api/messages/[id]/route.ts` – Better error handling, UUID validation
- `backend/src/types/index.ts` – Added validation and rate limit error types
- `frontend/app/src/app/contact/page.tsx` – Complete rewrite with validation and UX improvements
- `frontend/app/src/app/admin/messages/page.tsx` – Improved error handling and loading states

**Status:**

- ✅ Contact form with comprehensive validation and rate limiting
- ✅ Admin messages page with better error handling and UX
- ✅ Input sanitization and spam detection
- ✅ Rate limiting prevents abuse
- ✅ Field-level validation errors
- ✅ Character counters and real-time feedback
- ✅ Improved loading states and error messages

---

### Testimonials Section Complete Implementation ✅ (2026-01-23)

**Backend Enhancements:**

- **Rate Limiting** – Applied to POST `/api/testimonials` endpoint:
  - 5 testimonials per 15 minutes per IP
  - 20 testimonials per hour per IP
  - Automatic cleanup of expired entries
  - Rate limit headers in responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`)

- **Input Sanitization** – Extended `backend/src/lib/sanitize.ts`:
  - Added `sanitizeTestimonialForm()` function for testimonial data
  - Added `isValidUrl()` function for image URL validation
  - HTML tag removal and XSS prevention
  - Text sanitization with special character escaping

- **POST /api/testimonials** – Enhanced validation and security:
  - Field length validation (name: 2-100, position: max 100, company: max 100, content: 10-2000, imageUrl: max 500)
  - Name format validation (letters, spaces, hyphens, apostrophes, periods only)
  - Image URL format validation (HTTP/HTTPS URLs only)
  - Request body size limit (10KB max)
  - Server-side validation with detailed error messages
  - Spam detection before database insertion
  - Rate limiting applied before processing
  - Comprehensive error handling (JSON parse errors, validation errors, rate limit errors)
  - Field-level validation errors returned to client

- **PUT /api/testimonials/[id]** – Security fix and validation:
  - Fixed security vulnerability: replaced `{ ...body }` spread with allowlist
  - Allowlist: `name`, `position`, `company`, `content`, `contentFr`, `imageUrl`, `approved`
  - Field-level validation for each allowed field
  - Preserves existing values for fields not in request
  - Better error handling with specific error messages

- **GET /api/testimonials** – Cache-Control headers:
  - Added `Cache-Control: no-store` for dynamic content

- **GET /api/testimonials/all** – Cache-Control headers:
  - Added `Cache-Control: no-store, no-cache, must-revalidate` for admin data

- **GET/PUT/DELETE /api/testimonials/[id]** – Enhanced validation:
  - UUID format validation
  - Better error handling for invalid IDs
  - Request body validation for PUT endpoint
  - Cache-Control headers for admin data
  - Improved error messages

**Frontend Testimonials Page** (`frontend/app/src/app/testimonials/TestimonialsClient.tsx`):

- **Client-Side Validation:**
  - Real-time validation as user types
  - Field-level error messages with ARIA attributes
  - Character counters for all fields
  - Form validation before submission
  - Validation rules match backend (name: 2-100, position: max 100, company: max 100, content: 10-2000, imageUrl: max 500)

- **UI/UX Improvements:**
  - Field-level error display (red borders, error messages below fields)
  - Character counters showing current/max length
  - Loading spinner during submission
  - Disabled submit button when form invalid or submitting
  - Better success state with clear call-to-action
  - Improved error banner with better styling
  - Dark mode support for all error states
  - Accessibility improvements (ARIA labels, proper focus management)
  - Added imageUrl field with URL validation

- **Error Handling:**
  - Server validation errors displayed at field level
  - Rate limit errors with retry time information
  - Generic error fallback with user-friendly messages
  - Field errors cleared on successful submission

**Home Page Testimonials Section** (`frontend/app/src/app/page.tsx`):

- **Testimonials Display:**
  - Added testimonials fetch to `getHomeData()` function
  - New "Testimonials" section after Hobbies section
  - Displays up to 6 approved testimonials in a responsive grid (2 columns on desktop, 1 on mobile)
  - Shows testimonial content, name, position/company
  - Uses same card design as testimonials page
  - Displays user avatars (imageUrl or initials fallback)
  - Quote icon styling for visual appeal

- **Navigation:**
  - "View All Testimonials" button linking to `/testimonials`
  - "Leave a Testimonial" button linking to `/testimonials#submit` (scrolls to form)
  - Graceful empty state with call-to-action

**Admin Testimonials Page** (`frontend/app/src/app/admin/testimonials/page.tsx`):

- **Error Handling:**
  - Replaced `alert()` calls with proper error banners
  - Retry button for failed API calls
  - Dismissible action error messages
  - Better error messages from API

- **Loading States:**
  - Loading skeleton with animated placeholders
  - Loading indicators for individual actions (approve, reject, delete)
  - Disabled buttons during actions
  - Per-testimonial loading state tracking

- **UI Improvements:**
  - Better empty state with icon and helpful message
  - Relative time formatting ("2 hours ago", "3 days ago")
  - Improved testimonial list item styling
  - Better spacing and typography
  - Consistent button styles with other admin pages
  - Improved pending testimonials section with better visual distinction
  - Loading states for individual testimonial actions

**Type Safety:**
- Ensured `Testimonial` interface matches schema exactly between frontend and backend
- Validation error types already present from contact form implementation

**Files Modified/Created:**
- `backend/src/lib/sanitize.ts` – Extended with testimonial sanitization and URL validation
- `backend/src/app/api/testimonials/route.ts` – Enhanced validation, rate limiting, sanitization
- `backend/src/app/api/testimonials/[id]/route.ts` – Security fix (allowlist), better error handling
- `backend/src/app/api/testimonials/all/route.ts` – Cache-Control headers
- `frontend/app/src/app/testimonials/TestimonialsClient.tsx` – Complete rewrite with validation and UX improvements
- `frontend/app/src/app/testimonials/page.tsx` – Added id="submit" to form section for anchor linking
- `frontend/app/src/app/admin/testimonials/page.tsx` – Improved error handling and loading states
- `frontend/app/src/app/page.tsx` – Added testimonials section with navigation buttons

**Status:**
- ✅ Testimonials form with comprehensive validation and rate limiting
- ✅ Admin testimonials page with better error handling and UX
- ✅ Input sanitization and spam detection
- ✅ Rate limiting prevents abuse
- ✅ Field-level validation errors
- ✅ Character counters and real-time feedback
- ✅ Improved loading states and error messages
- ✅ Home page testimonials section with navigation
- ✅ Security fix: PUT endpoint uses allowlist instead of body spread

---

### Homepage UI Revamp ✅ (2026-01-23)

**Design System Foundation:**

- **Dark Theme** – Complete color palette redesign with cyan/blue accents
  - New CSS variables in `globals.css` for dark background (#0a0a12), off-white foreground
  - Primary accent: Cyan (#06b6d4), secondary: Blue (#3b82f6), tertiary: Purple (#8b5cf6)
  - Custom scrollbar styling matching theme
  
- **Utility Classes** – Glassmorphism, gradient text, glow effects
  - `.glass` – Backdrop blur with translucent background
  - `.gradient-text`, `.gradient-text-cyan` – Gradient text effects
  - `.glow`, `.glow-sm`, `.glow-lg` – Cyan glow box shadows
  - `.card-hover`, `.hover-glow` – Interactive hover states

- **Tailwind Extensions** – Extended animations and colors in `tailwind.config.js`
  - New keyframes: fade-in, float, pulse-glow, gradient-x, shimmer, marquee
  - Inter font family as default
  - Backdrop blur utilities

**New Animation Components:**

- **BlurFade** (`blur-fade.tsx`) – Scroll-triggered fade animation
  - Uses Framer Motion `useInView` hook
  - Supports 4 directions: up, down, left, right
  - Configurable duration, delay, blur amount
  
- **AnimatedBackground** (`animated-background.tsx`) – Floating gradient orbs
  - Three variants: hero, default, subtle
  - Grid pattern overlay
  - Smooth CSS animations
  
- **TextAnimate** (`text-animate.tsx`) – Text reveal animations
  - Per-character, per-word, or full text animation
  - Multiple presets: fadeIn, blurIn, slideUp, slideDown, scaleUp
  - Typewriter component with blinking cursor

**Navbar Revamp:**

- **Glassmorphism Effect** – Transparent on top, blur on scroll
- **Mobile Menu** – Slide-in panel with AnimatePresence
- **Smooth Scroll** – Anchor links scroll smoothly on same page
- **Animated Logo** – Scale animation on hover
- **Hover Effects** – Underline animation on nav links

**Homepage Sections:**

- **Hero Section:**
  - Full viewport height with AnimatedBackground (hero variant)
  - "Available for opportunities" status badge with ping animation
  - TextAnimate for name reveal
  - Gradient CTAs with shadow effects
  - Animated scroll indicator (bouncing arrow)

- **Projects Section:**
  - Cards with hover scale and glow effects
  - Image zoom on hover with gradient overlay
  - Tech stack badges with cyan styling
  - BlurFade stagger animation

- **Skills Section:**
  - Flex badge layout with scale on hover
  - Icon display with fallback initials
  - Glow effect on hover

- **Experience Section:**
  - Timeline design with animated connector line
  - Gradient timeline dots with spring animation
  - Cards fade in from alternating directions

- **Education Section:**
  - Cards with date badges
  - Hover state with subtle horizontal movement

- **Hobbies Section:**
  - Grid of interactive cards
  - Scale and Y-axis movement on hover
  - Icon animation

- **Testimonials Section:**
  - Horizontal scrolling on mobile
  - Quote icon with purple accent
  - Avatar with gradient background
  - "Leave a Testimonial" CTA

**Footer Revamp:**

- **Gradient Top Border** – Cyan gradient line
- **Three Column Layout** – Brand, Quick Links, Social
- **Social Icons** – GitHub, LinkedIn, Twitter, Email
  - Animated hover with scale and color change
  - Proper external links with rel attributes
- **Copyright** – Heart icon with "Built with Next.js"

**Files Modified/Created:**

- `frontend/app/src/app/globals.css` – Complete dark theme redesign
- `frontend/app/tailwind.config.js` – Extended animations and colors
- `frontend/app/src/app/layout.tsx` – Dark class, SEO metadata
- `frontend/app/src/components/Navbar.tsx` – Glassmorphism navbar
- `frontend/app/src/app/page.tsx` – Full homepage revamp (client component)
- `frontend/app/src/components/Footer.tsx` – Footer redesign
- `frontend/app/src/components/ui/blur-fade.tsx` – **New** animation component
- `frontend/app/src/components/ui/animated-background.tsx` – **New** background component
- `frontend/app/src/components/ui/text-animate.tsx` – **New** text animation component

**Status:**

- ✅ Dark theme with cyan/blue accents
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ All sections have scroll animations
- ✅ Interactive hover effects throughout
- ✅ Mobile hamburger menu
- ✅ Smooth scrolling
- ✅ Build passes with no errors

---

### Homepage Premium V2 Revamp ✅ (2026-01-23)

**Complete visual overhaul with premium effects and smooth scrolling:**

- **Lamp Hero Effect** – Cyan conic gradient that expands on scroll
- **Lenis Smooth Scroll** – Buttery smooth scrolling throughout the page
- **Shooting Stars** – Animated stars traversing the background
- **Skills Marquee** – Dual-row infinite scrolling skill badges
- **Testimonials Carousel** – Horizontal marquee with fade edges
- **BlurFade Animations** – All sections reveal on scroll

**New UI Components Created:**
- `lamp.tsx` – Conic gradient lamp container
- `shooting-stars.tsx` – Animated shooting star particles
- `stars-background.tsx` – Twinkling star pattern
- `background-paths.tsx` – Animated SVG path background
- `marquee.tsx` – Infinite scroll component
- `blur-fade.tsx` – Scroll-triggered blur fade animation
- `button.tsx` – Shadcn button with variants

**Dependencies Added:**
- `three` & `@types/three` – For future shader effects
- `lenis` – Smooth scroll library

**Design Theme:**
- Dark slate background (#0f172a / slate-950)
- Cyan/Blue accent colors
- Glassmorphism cards
- Gradient text effects

---

## Next Steps

1. **Resume management** – Resume API and admin page
2. **Resume API** - File upload handling
3. **Contact Info API** - Site-wide contact settings
4. **Error Handling Improvements** - Toast notifications for success/error states
5. **Form Validation** - Client-side validation for all admin forms (Contact and Testimonials forms now complete)
6. **Skill Categories** - Enhanced category management and filtering
7. **Bulk Operations** - Select multiple skills for batch actions
8. **Language Toggle** - Bilingual support (EN/FR)