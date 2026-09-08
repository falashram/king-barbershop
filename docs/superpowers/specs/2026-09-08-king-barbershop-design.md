# King Barbershop (صالون حلاقة الملك) — Specification & Design Document

**Date:** 2026-09-08  
**Status:** Approved  
**Author:** Pair Programming (Antigravity & User)  

---

## 1. Overview & Objective

King Barbershop is a client-side, zero-server Single Page Web Application (SPA) designed for barber salon reservations and operations. It runs completely offline/locally in modern browsers using `IndexedDB` for persistent data storage.

The visual style is a luxury dark theme inspired by the high-end barbershop mockups provided in the `asets` folder: deep charcoal/black background, warm copper/gold accents (`#D37B34`, `#E58C42`), card-based responsive mobile layout, and bilingual capability (Arabic RTL & English LTR).

---

## 2. Core Personas & Roles

1. **Visitor / Customer:**
   - Can register a new account (`username`, `password`).
   - Can log in with registered credentials.
   - Can browse available grooming services with descriptions, prices, and durations.
   - Can select a date and available time slot to book an appointment.
   - Can view active and past bookings under "My Bookings" / "حجوزاتي".
   - Can toggle between Arabic and English at any time.

2. **Barber (Admin):**
   - Accesses dashboard from the same login screen using credentials: `admin` / `123456`.
   - Can view, add, edit, and remove salon services (title, description, price, duration, image).
   - Can manage working schedule and disable/enable specific dates and time slots.
   - Can view all incoming customer appointments, filter by date, and change booking status (Confirmed, Completed, Cancelled).
   - Can view quick statistics (total bookings, revenue, active services).

---

## 3. Visual Identity & UI Screens

### Theme & Colors:
- **Background Deep:** `#0E0E10` (Dark canvas)
- **Card / Surface:** `#18181B` / `#1F1F23` (Charcoal surface with subtle border `#2D2D32`)
- **Primary Accent:** `#D37B34` (Warm copper/amber)
- **Accent Gradient:** `linear-gradient(135deg, #D37B34, #B65E1E)`
- **Text Primary:** `#F4F4F5` (Crisp off-white)
- **Text Secondary:** `#A1A1AA` (Muted gray)
- **Typography:** Serif headings with modern sans-serif body, Arabic font support (Cairo / Tajawal / system Arabic).

### Screen 1: Welcome & Authentication (`#login`)
- Hero background image featuring barber salon aesthetic (from `asets/WhatsApp Image 2026-09-08 at 3.44.08 PM.jpeg`).
- Logo branding: "صالون حلاقة الملك / King Barbershop".
- Toggle between "Sign In" (تسجيل الدخول) and "Sign Up" (إنشاء حساب جديد).
- Form inputs: Username and Password.
- Single login flow: `admin` / `123456` automatically redirects to `#admin`; customers redirect to `#services`.
- Language switcher (العربية / English) pinned at top corner.

### Screen 2: Services Catalog (`#services`)
- Header with salon logo, title "الخدمات / Services", and user profile menu (with Logout).
- Service cards:
  - High quality thumbnail image.
  - Service title in active language.
  - Brief description.
  - Price (e.g. `$20`) and Duration (e.g. `⏱ 30 min`).
  - "Book / حجز" button navigating to `#book?serviceId=X`.
- Bottom Navigation Bar (Home/Services, My Bookings, Profile/Logout).

### Screen 3: Booking Screen (`#book`)
- Summary card of selected service (Title, Price, Duration).
- "Select Date / اختر التاريخ": Horizontal scrollable date pills showing Day Name, Day Number, Month (e.g., Mon 19 May, Tue 20 May...).
- "Select Time / اختر الوقت": Grid of time slots (e.g., 09:00 AM, 09:30 AM ... 06:30 PM).
  - Available slots clickable (active state highlighted with copper glow).
  - Reserved or barber-disabled slots marked disabled/grayed out.
- "Reserve / تأكيد الحجز" bottom action button.
- Instant validation and confirmation modal upon reservation.

### Screen 4: Customer "My Bookings" (`#my-bookings`)
- List of customer's active and previous appointments.
- Displays service name, date, time slot, status badge (مؤكد / Confirmed, مكتمل / Completed, ملغي / Cancelled).
- Option to cancel an upcoming reservation.

### Screen 5: Barber Admin Dashboard (`#admin`)
- Top Admin Header: "لوحة تحكم الحلاق / Barber Control Panel" + Quick stats + Logout.
- Tab 1: **Bookings Management (الحجوزات)**:
  - Table / Card list of all client bookings.
  - Client name, service, date & time.
  - Status actions: Mark as Completed (اكتمل), Cancel (إلغاء).
- Tab 2: **Services Management (إدارة الخدمات)**:
  - List of current services with "Edit" (تعديل) and "Delete" (حذف).
  - "Add New Service" modal/form (Title AR/EN, Desc AR/EN, Price, Duration, Image URL).
- Tab 3: **Schedule & Working Hours (المواعيد المتاحة)**:
  - View slots per day.
  - Toggle switch on time slots to block/unblock barber availability.

---

## 4. Architecture & Technology Stack

- **Platform:** 100% Client-side Web (No Node.js runtime, no backend server, zero external npm build dependencies).
- **Core Technologies:**
  - `HTML5`: Semantic structure, responsive viewport.
  - `CSS3`: Custom properties (CSS variables), Flexbox, CSS Grid, animations, RTL/LTR styling.
  - `Vanilla JavaScript (ES6+)`: Modular SPA router, async IndexedDB wrapper, reactive state management.
  - `IndexedDB API`: Browser database storage.

### Directory Layout:
```
project/
├── index.html                  # Main SPA entry point and screen containers
├── asets/                      # Existing project images and mockups
├── css/
│   ├── main.css                # Base layout, typography, animations, responsive container
│   ├── theme.css               # Luxury dark palette, variables, RTL overrides
│   └── components.css          # Cards, modals, buttons, forms, navbars, badges
├── js/
│   ├── db.js                   # IndexedDB wrapper (KingBarbershopDB setup & seeds)
│   ├── i18n.js                 # Bilingual strings (Arabic / English dictionary & switcher)
│   ├── auth.js                 # Authentication logic (session, login, signup, roles)
│   ├── services.js             # Services rendering, selection, admin CRUD
│   ├── booking.js              # Booking flow, date/time picker, customer bookings
│   ├── admin.js                # Barber dashboard, appointments review, slot toggling
│   └── app.js                  # App bootstrap, hash router, event bus
├── tests/
│   └── test-runner.html        # Client-side automated test suite for DB and logic
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

---

## 5. IndexedDB Database Schema (`KingBarbershopDB`, v1)

```javascript
// Object Stores:
1. 'users':
   keyPath: 'id', autoIncrement: true
   indexes: ['username' (unique)]
   fields: { id, username, password, role: 'admin'|'customer', createdAt }

2. 'services':
   keyPath: 'id', autoIncrement: true
   fields: { id, titleAr, titleEn, descAr, descEn, price, duration, image }

3. 'schedules':
   keyPath: 'id', autoIncrement: true
   indexes: ['date', 'date_timeSlot' (unique)]
   fields: { id, date, timeSlot, isAvailable }

4. 'bookings':
   keyPath: 'id', autoIncrement: true
   indexes: ['userId', 'date', 'status']
   fields: { id, userId, customerName, serviceId, serviceTitleAr, serviceTitleEn, price, duration, date, timeSlot, status: 'confirmed'|'completed'|'cancelled', createdAt }
```

### Initial Seed Data:
1. **Admin Account**: `username: "admin"`, `password: "123456"`, `role: "admin"`.
2. **Initial Services (from images)**:
   - Wonderful haircut / قصة شعر ملكية ($20, 30 min)
   - Beard design / تحديد ورسم اللحية ($15, 20 min)
   - Facial treatment / تنظيف وعناية بالبشرة ($25, 30 min)
   - Hair tattoo / حلاقة وتحديد فني ($20, 15 min)
   - Hot towel shave / حلاقة بالفوطة الساخنة ($18, 25 min)
3. **Standard Time Slots**:
   - `09:00 AM`, `09:30 AM`, `10:00 AM`, `10:30 AM`, `11:00 AM`, `11:30 AM`, `12:00 PM`, `12:30 PM`, `01:00 PM`, `01:30 PM`, `02:00 PM`, `02:30 PM`, `03:00 PM`, `03:30 PM`, `04:00 PM`, `04:30 PM`, `05:00 PM`, `05:30 PM`, `06:00 PM`, `06:30 PM`.

---

## 6. Verification & Testing Strategy

1. **Unit & Integration Testing:** Automated test runner file (`tests/test-runner.html`) verifying:
   - IndexedDB initialization, store creation, and initial seeding.
   - User registration, duplicate username prevention, login authentication.
   - Admin authentication (`admin/123456`) and role validation.
   - Services CRUD operations (Create, Read, Update, Delete).
   - Booking slot conflict prevention (cannot book already reserved slot).
   - Schedule availability toggling.
2. **Manual & Visual UX Verification:**
   - Verification across screen sizes (mobile emulator & desktop).
   - Testing Arabic RTL and English LTR translations.
   - Testing end-to-end customer booking journey and barber admin verification.
