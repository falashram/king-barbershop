# King Barbershop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, zero-server, client-side Barbershop booking web application (صالون حلاقة الملك) with dark luxury mobile-responsive aesthetics, IndexedDB persistence, role-based access for customer and barber admin (admin/123456), and bilingual (Arabic/English) support.

**Architecture:** Single Page Application (SPA) built using modern semantic HTML5, modular CSS with dark luxury theme variables, and vanilla JavaScript modules. All persistent state (users, services, schedules, bookings) is managed locally in the browser via `IndexedDB`.

**Tech Stack:** HTML5, CSS3 (Flexbox/Grid, Custom Properties, RTL/LTR), Vanilla JavaScript (ES6+), IndexedDB API.

**Spec:** [King Barbershop Design Spec](file:///c:/Users/Fawzi/Downloads/project/docs/superpowers/specs/2026-09-08-king-barbershop-design.md)

## Global Constraints

- Zero external backend server: 100% client-side running directly in the browser via `index.html`.
- Persistent storage must use browser `IndexedDB` under the database name `KingBarbershopDB`.
- Default admin credentials must be `admin` / `123456` with direct routing to the Barber Dashboard.
- Bilingual support: Arabic (RTL) and English (LTR) with instant language toggle and persistent preference.
- Visual theme: Deep dark charcoal background (`#0E0E10`), warm copper/gold accents (`#D37B34`, `#E58C42`), card-based layout matching the design images in `asets/`.
- No placeholders, no `TODO`, every task must produce working, tested code.

---

### Task 1: HTML Base Shell & App Layout Structure

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: Design mockup layout from `asets/`
- Produces: Base DOM structure with views: `#view-login`, `#view-services`, `#view-book`, `#view-my-bookings`, `#view-admin`, modals, and notification toast.

- [ ] **Step 1: Write `index.html` structure**
Create semantic HTML5 markup containing:
- Head with viewport meta, fonts, links to `css/theme.css`, `css/main.css`, `css/components.css`.
- Header bar with logo "صالون حلاقة الملك / King Barbershop", language switcher button, and user profile avatar / logout.
- Main app viewport container (max-width 480px on desktop for mobile app feel, full-width on phones).
- Views container with sections:
  - `view-login`: Welcome screen with background image from `asets/`, signin/signup tabs, inputs for username & password, submit button.
  - `view-services`: Services list header, cards container, bottom navigation bar.
  - `view-book`: Selected service summary, horizontal date picker, time slot grid, and reserve button.
  - `view-my-bookings`: Customer bookings history list with status badges and cancel actions.
  - `view-admin`: Barber dashboard with tab buttons (Bookings, Services, Schedule), stats counters, and tab panels.
- Modal dialog container for adding/editing services and booking confirmation.
- Toast container for status alerts.
- Script tags loading `js/i18n.js`, `js/db.js`, `js/auth.js`, `js/services.js`, `js/booking.js`, `js/admin.js`, `js/app.js`.

- [ ] **Step 2: Verify HTML validity and file links**
Verify that all IDs, class names, and view containers are present and properly closed.

- [ ] **Step 3: Commit**
`git add index.html && git commit -m "feat: create base HTML shell and application view containers"`

---

### Task 2: CSS Styling System & Luxury Dark Theme

**Files:**
- Create: `css/theme.css`
- Create: `css/main.css`
- Create: `css/components.css`

**Interfaces:**
- Consumes: HTML structure from Task 1, color palette from spec (`#0E0E10`, `#18181B`, `#D37B34`, `#E58C42`)
- Produces: CSS variables, dark luxury typography, responsive layout, RTL/LTR styling rules, buttons, inputs, cards, grids, and animations.

- [ ] **Step 1: Create `css/theme.css`**
Define CSS custom properties:
- Colors: `--bg-primary: #0e0e10;`, `--bg-card: #18181b;`, `--bg-card-hover: #222227;`, `--accent: #d37b34;`, `--accent-hover: #e58c42;`, `--text-main: #f4f4f5;`, `--text-muted: #a1a1aa;`, `--border: #27272a;`, `--danger: #ef4444;`, `--success: #22c55e;`.
- Font families (Serif for luxury titles, Sans-serif for body).
- RTL-specific overrides (`[dir="rtl"]` font styles and margin/padding directions).

- [ ] **Step 2: Create `css/main.css`**
Write core layout styles:
- Reset and base body styling (dark background, smooth font rendering).
- App container: centered mobile container (`max-width: 480px; min-height: 100vh; margin: 0 auto; box-shadow: 0 0 40px rgba(0,0,0,0.8);`).
- Header navigation bar and bottom navigation bar.
- View transitions and visibility rules (`.view { display: none; } .view.active { display: block; animation: fadeIn 0.3s ease; }`).

- [ ] **Step 3: Create `css/components.css`**
Write component-specific styles:
- Luxury buttons with copper gradient, hover glow, and press animations.
- Dark input fields with subtle borders and copper focus ring.
- Service card component matching Image 1: service thumbnail, title, description, price badge, clock icon with duration, chevron.
- Booking calendar pills (horizontal scroll, active copper pill with date and month) and time slot grid buttons (Image 2).
- Admin dashboard components: tabs, summary stats cards, data tables, switch toggles, modal dialogs, and toast notifications.

- [ ] **Step 4: Verify styles rendering**
Open in browser or test harness to ensure dark theme, typography, and card alignments render properly.

- [ ] **Step 5: Commit**
`git add css/ && git commit -m "feat: implement luxury dark theme and UI components CSS"`

---

### Task 3: Bilingual Localization System (i18n)

**Files:**
- Create: `js/i18n.js`

**Interfaces:**
- Consumes: Translation keys defined across all views.
- Produces: `window.I18n = { currentLang, t(key), setLanguage(lang), init() }` and event `langChanged`.

- [ ] **Step 1: Implement `js/i18n.js`**
Write complete dictionary for Arabic (`ar`) and English (`en`):
- Brand: Salon name, tagline.
- Auth: Sign In, Sign Up, Username, Password, Login Button, Create Account Button, Invalid credentials message, Account created successfully message.
- Services: Services title, duration, price, book now button.
- Booking: Book Service, select date, select time, reserve button, booking success message, slot unavailable message.
- My Bookings: My bookings title, date, time, status (confirmed, completed, cancelled), cancel booking button.
- Admin: Control panel, bookings tab, services tab, schedule tab, total bookings, today bookings, add service, edit service, delete service, save, cancel.
- Implementation of `setLanguage(lang)`:
  - Updates `document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')`.
  - Updates `document.documentElement.setAttribute('lang', lang)`.
  - Saves choice to `localStorage.getItem('king_lang')`.
  - Traverses elements with `data-i18n="key"` and updates `textContent` or `placeholder`.
  - Dispatches `CustomEvent('languageChanged', { detail: { lang } })`.

- [ ] **Step 2: Verify localization functionality**
Test switching between `ar` and `en` to confirm proper text replacement and RTL/LTR switching.

- [ ] **Step 3: Commit**
`git add js/i18n.js && git commit -m "feat: implement bilingual i18n localization engine"`

---

### Task 4: IndexedDB Storage Engine & Initial Seeding

**Files:**
- Create: `js/db.js`

**Interfaces:**
- Consumes: IndexedDB browser API.
- Produces: `window.DB` module providing async CRUD functions:
  - `DB.init()`: opens `KingBarbershopDB` v1, creates stores `users`, `services`, `schedules`, `bookings`. Seeds default admin and default services.
  - `DB.getUsers()`, `DB.getUserByUsername(username)`, `DB.createUser(user)`.
  - `DB.getServices()`, `DB.getServiceById(id)`, `DB.saveService(service)`, `DB.deleteService(id)`.
  - `DB.getSchedules(date)`, `DB.setScheduleAvailability(date, timeSlot, isAvailable)`.
  - `DB.getBookings()`, `DB.getBookingsByUser(userId)`, `DB.createBooking(booking)`, `DB.updateBookingStatus(id, status)`.

- [ ] **Step 1: Implement `js/db.js` database lifecycle**
- Initialize `indexedDB.open('KingBarbershopDB', 1)`.
- In `onupgradeneeded`:
  - Create store `users` with `id` keyPath, unique index on `username`.
  - Create store `services` with `id` keyPath.
  - Create store `schedules` with `id` keyPath, index on `date`.
  - Create store `bookings` with `id` keyPath, index on `userId`, `date`.
- Implement default data seeding:
  - Admin: `username: 'admin', password: '123456', role: 'admin'`.
  - 5 initial services with real image references and AR/EN names matching image 1.
  - Standard time slots array.

- [ ] **Step 2: Implement Promise-based CRUD helpers in `DB`**
Wrap all IndexedDB requests in standard ES6 Promises with error handling.

- [ ] **Step 3: Verify DB initialization and query operations**
Verify DB opens, seed records exist, and basic write/read succeeds.

- [ ] **Step 4: Commit**
`git add js/db.js && git commit -m "feat: implement IndexedDB persistence layer and seed data"`

---

### Task 5: Authentication & Session Management

**Files:**
- Create: `js/auth.js`

**Interfaces:**
- Consumes: `DB` module from `js/db.js`, `I18n` from `js/i18n.js`.
- Produces: `window.Auth = { currentUser, login(username, password), signup(username, password), logout(), checkSession() }`.

- [ ] **Step 1: Implement `js/auth.js`**
- Maintain session in `sessionStorage` key `king_current_user`.
- `login(username, password)`:
  - Validates input.
  - Queries `DB.getUserByUsername(username)`.
  - If matches, saves user session.
  - If `user.role === 'admin'` -> routes to `#admin`.
  - If `user.role === 'customer'` -> routes to `#services`.
- `signup(username, password)`:
  - Validates input (length >= 3).
  - Checks if username already exists.
  - Creates customer account via `DB.createUser({ username, password, role: 'customer', createdAt: new Date().toISOString() })`.
- `logout()`:
  - Clears `sessionStorage`.
  - Routes to `#login`.
- Event listeners for login and signup form submissions with validation feedback.

- [ ] **Step 2: Verify Auth flows**
Test signing in as `admin/123456`, signing up as new customer `fawzi/123456`, invalid password handling, and logout.

- [ ] **Step 3: Commit**
`git add js/auth.js && git commit -m "feat: implement authentication and session handling"`

---

### Task 6: Customer Services Catalog & Booking Engine

**Files:**
- Create: `js/services.js`
- Create: `js/booking.js`

**Interfaces:**
- Consumes: `DB`, `Auth`, `I18n`.
- Produces:
  - `window.ServicesManager.renderServices()`: displays service cards.
  - `window.BookingManager.initBooking(serviceId)`: sets up booking screen with date picker and available time slots.
  - `window.BookingManager.reserve(slot)`: commits booking to IndexedDB.
  - `window.BookingManager.renderMyBookings()`: displays user's booked appointments.

- [ ] **Step 1: Implement `js/services.js`**
- Query all active services from `DB.getServices()`.
- Render cards inside `#services-list`:
  - Image, title (`titleAr` / `titleEn`), description, price, duration.
  - "Book / حجز" button with click handler that navigates to `#book` passing the service ID.

- [ ] **Step 2: Implement `js/booking.js` - Date & Time Picker**
- Generate the next 14 calendar dates horizontally (Image 2 style).
- On date select:
  - Load barber slot overrides from `DB.getSchedules(selectedDate)`.
  - Load existing bookings for that date from `DB.getBookings()`.
  - Render time slots grid:
    - If slot is disabled by barber or already booked -> mark slot disabled/booked.
    - If available -> allow customer to click and highlight.
- "Reserve / تأكيد الحجز" button:
  - Validates selected service, date, and time.
  - Creates booking record via `DB.createBooking(...)`.
  - Shows success notification and redirects to `#my-bookings`.

- [ ] **Step 3: Implement `js/booking.js` - "My Bookings" view**
- Fetch bookings for logged-in user: `DB.getBookingsByUser(currentUser.id)`.
- Render booking cards with status badge, date, time, and service info.
- Include "Cancel / إلغاء الحجز" button if booking is upcoming/confirmed.

- [ ] **Step 4: Verify booking lifecycle**
Test booking a service, verifying slot becomes unavailable for that same date/time, and verifying appointment displays in My Bookings.

- [ ] **Step 5: Commit**
`git add js/services.js js/booking.js && git commit -m "feat: implement services catalog and appointment booking engine"`

---

### Task 7: Barber Admin Control Panel

**Files:**
- Create: `js/admin.js`

**Interfaces:**
- Consumes: `DB`, `Auth`, `I18n`.
- Produces: `window.AdminManager = { renderDashboard(), renderBookings(), renderServicesCRUD(), renderScheduleManager() }`.

- [ ] **Step 1: Implement Admin Dashboard Overview & Stats**
- Verify logged-in user is `admin`. If not, redirect to `#login`.
- Compute and render statistics:
  - Total bookings count.
  - Today's upcoming appointments count.
  - Active services count.
  - Total revenue estimate.

- [ ] **Step 2: Implement Bookings Management Tab**
- Display all client bookings in chronological order with date filter.
- Columns/Cards: Client Name, Service, Date, Time, Price, Status.
- Actions:
  - "Mark Completed / تم الإنجاز" (updates status to `'completed'`).
  - "Cancel / إلغاء" (updates status to `'cancelled'`).

- [ ] **Step 3: Implement Services CRUD Tab**
- List all services with "Edit / تعديل" and "Delete / حذف" buttons.
- "Add New Service / إضافة خدمة جديدة" button triggering modal form:
  - Title (Arabic & English), Description (Arabic & English), Price ($), Duration (minutes), Image URL.
- On save -> call `DB.saveService(serviceData)`.

- [ ] **Step 4: Implement Schedule & Working Hours Tab**
- Select date (today or upcoming).
- Display standard time slots with interactive toggle switches (متاح / غير متاح - Available / Disabled).
- On toggle -> call `DB.setScheduleAvailability(date, slot, isAvailable)`.

- [ ] **Step 5: Verify Barber Admin capabilities**
Test logging in as admin, viewing incoming bookings, toggling slot availability, and adding/editing a service.

- [ ] **Step 6: Commit**
`git add js/admin.js && git commit -m "feat: implement barber admin dashboard for bookings, services, and schedules"`

---

### Task 8: App Integration, Hash Router & Automated Test Suite

**Files:**
- Create: `js/app.js`
- Create: `tests/test-runner.html`

**Interfaces:**
- Consumes: All modules (`I18n`, `DB`, `Auth`, `ServicesManager`, `BookingManager`, `AdminManager`).
- Produces: Complete working application and automated test verification suite.

- [ ] **Step 1: Implement `js/app.js` Single Page Router**
- Hash-based router:
  - `#login` -> displays login screen.
  - `#services` -> guards customer auth, renders services catalog.
  - `#book` -> guards customer auth, renders booking flow.
  - `#my-bookings` -> guards customer auth, renders user bookings.
  - `#admin` -> guards admin auth, renders barber admin panel.
- Default route fallback: if logged in as admin `#admin`, if logged in as customer `#services`, else `#login`.
- Global Toast notification system (`window.showToast(message, type)`).
- Wire all header language switcher, logout button, and navigation tabs.

- [ ] **Step 2: Create automated test runner `tests/test-runner.html`**
Create browser-based test suite verifying:
- IndexedDB initialization and seed accounts.
- Customer signup and login validation.
- Admin login (`admin/123456`) validation.
- Service creation and retrieval.
- Booking creation and conflict prevention (preventing double bookings).
- Schedule slot disabling by admin.
- Language switcher functionality.

- [ ] **Step 3: Run automated test suite and manual verification**
Verify all tests pass with 100% green status.

- [ ] **Step 4: Commit**
`git add js/app.js tests/test-runner.html && git commit -m "feat: implement app router and automated test suite"`
