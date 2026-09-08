/**
 * =========================================================
 * King Barbershop — Bilingual i18n System (js/i18n.js)
 * Supports Instant Arabic (RTL) & English (LTR) Toggle
 * =========================================================
 */

(function () {
  'use strict';

  const translations = {
    ar: {
      brandTitle: 'صالون الملك',
      brandSubtitle: 'KING BARBERSHOP',
      heroLogoTitle: 'KING',
      heroLogoSub: 'B A R B E R S H O P',
      
      // Auth
      signInTab: 'تسجيل الدخول',
      signUpTab: 'إنشاء حساب جديد',
      usernamePlaceholder: 'اسم المستخدم',
      passwordPlaceholder: 'كلمة المرور',
      signInBtn: 'تسجيل الدخول',
      signUpBtn: 'إنشاء حساب جديد',
      logout: 'تسجيل الخروج',
      authSuccessLogin: 'تم تسجيل الدخول بنجاح!',
      authSuccessSignup: 'تم إنشاء الحساب بنجاح، مرحباً بك!',
      authErrorInvalid: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
      authErrorExists: 'اسم المستخدم مستخدم مسبقاً، اختر اسماً آخر.',
      authErrorShort: 'اسم المستخدم وكلمة المرور يجب ألا تقلا عن 3 أحرف.',

      // Services View
      servicesTitle: 'الخدمات المتاحة',
      servicesSubtitle: 'اختر الخدمة المناسبة لحجز موعدك الملكي',
      bookNow: 'حجز الموعد',
      durationMinutes: 'دقيقة',
      pricePrefix: '$',

      // Booking View
      bookServiceTitle: 'حجز موعد',
      selectDate: 'اختر التاريخ',
      selectTime: 'اختر الوقت المتاح',
      reserveNow: 'تأكيد الحجز',
      bookingSuccess: 'تم حجز موعدك بنجاح! ننتظر زيارتك.',
      bookingErrorNoSlot: 'يرجى تحديد وقت الموعد أولاً.',
      bookingSlotUnavailable: 'هذا الموعد تم حجزه مؤخراً، يرجى اختيار موعد آخر.',
      slotExceedsClosing: 'غير متاح - مدة الخدمة تتجاوز وقت نهاية العمل',
      slotUnavailable: 'الموعد محجوز أو غير متاح',
      dayNames: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],

      // My Bookings View
      myBookingsTitle: 'حجوزاتي',
      noBookingsYet: 'لا توجد حجوزات سابقة لديك حتى الآن.',
      bookingDate: 'التاريخ',
      bookingTime: 'الوقت',
      cancelBooking: 'إلغاء الموعد',
      bookingCancelledSuccess: 'تم إلغاء الحجز بنجاح.',
      statusConfirmed: 'مؤكد',
      statusCompleted: 'مكتمل',
      statusCancelled: 'ملغي',

      // Navigation
      navServices: 'الخدمات',
      navMyBookings: 'حجوزاتي',

      // Admin Dashboard
      barberDashboard: 'لوحة تحكم الحلاق',
      welcomeAdmin: 'أهلاً بك، الحلاق الملك',
      statTotalBookings: 'إجمالي الحجوزات',
      statTodayBookings: 'حجوزات اليوم',
      statServices: 'الخدمات النشطة',
      tabAdminBookings: 'الحجوزات',
      tabAdminServices: 'الخدمات',
      tabAdminSchedule: 'المواعيد المتاحة',
      allBookings: 'قائمة الحجوزات',
      showAll: 'عرض الكل',
      noAdminBookings: 'لا توجد أي حجوزات مسجلة حالياً.',
      clientName: 'الزبون',
      actionComplete: 'تم الإنجاز',
      actionCancel: 'إلغاء',
      bookingMarkedCompleted: 'تم تعيين الحجز كمكتمل.',

      // Admin Services
      manageServices: 'إدارة الخدمات',
      addService: 'إضافة خدمة',
      addServiceModalTitle: 'إضافة خدمة جديدة',
      editServiceModalTitle: 'تعديل الخدمة',
      serviceNameLabel: 'اسم الخدمة',
      serviceNamePlaceholder: 'مثال: قصة شعر ملكية',
      serviceDescLabel: 'وصف الخدمة',
      serviceDescPlaceholder: 'وصف موجز للخدمة...',
      servicePriceLabel: 'السعر ($)',
      serviceDurationLabel: 'المدة (دقيقة)',
      serviceImageLabel: 'رابط أو مسار الصورة',
      save: 'حفظ',
      cancel: 'إلغاء',
      deleteConfirm: 'هل أنت متأكد من حذف هذه الخدمة؟',
      serviceSavedSuccess: 'تم حفظ الخدمة بنجاح.',
      serviceDeletedSuccess: 'تم حذف الخدمة بنجاح.',

      // Admin Schedule
      manageSchedule: 'تعديل المواعيد المتاحة',
      scheduleHint: 'انقر على الموعد للتبديل بين متاح / غير متاح لهذا اليوم',
      available: 'متاح للزبائن',
      unavailable: 'معطل / غير متاح',
      slotToggledSuccess: 'تم تحديث حالة الموعد.'
    },

    en: {
      brandTitle: 'King Barbershop',
      brandSubtitle: 'ESTD 2012',
      heroLogoTitle: 'KING',
      heroLogoSub: 'B A R B E R S H O P',
      
      // Auth
      signInTab: 'Sign In',
      signUpTab: 'Sign Up',
      usernamePlaceholder: 'Username',
      passwordPlaceholder: 'Password',
      signInBtn: 'Sign In',
      signUpBtn: 'Create Account',
      logout: 'Logout',
      authSuccessLogin: 'Logged in successfully!',
      authSuccessSignup: 'Account created successfully, welcome!',
      authErrorInvalid: 'Invalid username or password.',
      authErrorExists: 'Username already taken, please choose another.',
      authErrorShort: 'Username and password must be at least 3 characters.',

      // Services View
      servicesTitle: 'Available Services',
      servicesSubtitle: 'Choose your royal treatment to book an appointment',
      bookNow: 'Book Now',
      durationMinutes: 'min',
      pricePrefix: '$',

      // Booking View
      bookServiceTitle: 'Book Service',
      selectDate: 'Select Date',
      selectTime: 'Select Available Time',
      reserveNow: 'Reserve Now',
      bookingSuccess: 'Your appointment is booked successfully!',
      bookingErrorNoSlot: 'Please select an appointment time slot first.',
      bookingSlotUnavailable: 'This time slot was just reserved, please pick another.',
      slotExceedsClosing: 'Unavailable - service duration exceeds closing time',
      slotUnavailable: 'Slot is booked or unavailable',
      dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

      // My Bookings View
      myBookingsTitle: 'My Bookings',
      noBookingsYet: 'You have no appointments booked yet.',
      bookingDate: 'Date',
      bookingTime: 'Time',
      cancelBooking: 'Cancel Booking',
      bookingCancelledSuccess: 'Booking cancelled successfully.',
      statusConfirmed: 'Confirmed',
      statusCompleted: 'Completed',
      statusCancelled: 'Cancelled',

      // Navigation
      navServices: 'Services',
      navMyBookings: 'My Bookings',

      // Admin Dashboard
      barberDashboard: 'Barber Dashboard',
      welcomeAdmin: 'Welcome, Master Barber',
      statTotalBookings: 'Total Bookings',
      statTodayBookings: "Today's Bookings",
      statServices: 'Active Services',
      tabAdminBookings: 'Bookings',
      tabAdminServices: 'Services',
      tabAdminSchedule: 'Available Slots',
      allBookings: 'All Bookings',
      showAll: 'All',
      noAdminBookings: 'No client appointments found.',
      clientName: 'Client',
      actionComplete: 'Complete',
      actionCancel: 'Cancel',
      bookingMarkedCompleted: 'Appointment marked as completed.',

      // Admin Services
      manageServices: 'Manage Services',
      addService: 'Add Service',
      addServiceModalTitle: 'Add New Service',
      editServiceModalTitle: 'Edit Service',
      serviceNameLabel: 'Service Name',
      serviceNamePlaceholder: 'e.g. Wonderful Haircut',
      serviceDescLabel: 'Service Description',
      serviceDescPlaceholder: 'Brief description of the service...',
      servicePriceLabel: 'Price ($)',
      serviceDurationLabel: 'Duration (min)',
      serviceImageLabel: 'Image Path or URL',
      save: 'Save',
      cancel: 'Cancel',
      deleteConfirm: 'Are you sure you want to delete this service?',
      serviceSavedSuccess: 'Service saved successfully.',
      serviceDeletedSuccess: 'Service deleted successfully.',

      // Admin Schedule
      manageSchedule: 'Manage Availability',
      scheduleHint: 'Click any time slot to toggle between Available and Blocked for this date',
      available: 'Available',
      unavailable: 'Blocked',
      slotToggledSuccess: 'Slot availability updated.'
    }
  };

  let currentLang = localStorage.getItem('king_barbershop_lang') || 'ar';

  const I18n = {
    get currentLang() {
      return currentLang;
    },

    t(key) {
      if (translations[currentLang] && translations[currentLang][key]) {
        return translations[currentLang][key];
      }
      if (translations.ar[key]) return translations.ar[key];
      return key;
    },

    setLanguage(lang) {
      if (lang !== 'ar' && lang !== 'en') return;
      currentLang = lang;
      localStorage.setItem('king_barbershop_lang', lang);

      const html = document.documentElement;
      html.setAttribute('lang', lang);
      html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

      // Update lang toggle button text (showing target language)
      const langText = document.getElementById('lang-text');
      if (langText) {
        langText.textContent = lang === 'ar' ? 'EN' : 'عربي';
      }

      // Update all elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const k = el.getAttribute('data-i18n');
        el.textContent = this.t(k);
      });

      // Update placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const k = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', this.t(k));
      });

      // Update titles
      document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const k = el.getAttribute('data-i18n-title');
        el.setAttribute('title', this.t(k));
      });

      // Emit event for dynamic components to re-render
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    toggleLanguage() {
      const nextLang = currentLang === 'ar' ? 'en' : 'ar';
      this.setLanguage(nextLang);
    },

    init() {
      // Bind toggle button click
      const toggleBtn = document.getElementById('lang-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggleLanguage());
      }
      this.setLanguage(currentLang);
    }
  };

  window.I18n = I18n;

  // Auto-init once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
  } else {
    I18n.init();
  }
})();
