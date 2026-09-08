/**
 * =========================================================
 * King Barbershop — IndexedDB Persistent Storage (js/db.js)
 * 100% Client-side Browser Database, Zero-Server Required
 * =========================================================
 */

(function () {
  'use strict';

  const DB_NAME = 'KingBarbershopDB';
  const DB_VERSION = 1;

  const STANDARD_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'
  ];

  const INITIAL_SERVICES = [
    {
      name: 'قصة شعر ملكية | Wonderful haircut',
      desc: 'قصة شعر احترافية مصممة خصيصاً لتناسب أسلوبك وشخصيتك بأعلى درجات العناية.',
      price: 20,
      duration: 30,
      image: 'assets/services-mockup.jpg'
    },
    {
      name: 'تحديد ورسم اللحية | Beard design',
      desc: 'تشذيب وتحديد احترافي للحية للحصول على مظهر حاد، جذاب ومتقن.',
      price: 15,
      duration: 20,
      image: 'assets/services-mockup.jpg'
    },
    {
      name: 'تنظيف وعناية بالبشرة | Facial treatment',
      desc: 'جلسة عناية وانتعاش للبشرة مع ماسك تنظيف وترطيب عميق لتجديد الحيوية.',
      price: 25,
      duration: 30,
      image: 'assets/services-mockup.jpg'
    },
    {
      name: 'حلاقة وتحديد فني | Hair tattoo',
      desc: 'رسومات وخطوط فنية دقيقة بالماكينة والموس تعبر عن أسلوبك الفريد.',
      price: 20,
      duration: 15,
      image: 'assets/services-mockup.jpg'
    },
    {
      name: 'حلاقة بالفوطة الساخنة | Hot towel shave',
      desc: 'حلاقة تقليدية فاخرة بالموس مع الفوطة الساخنة لنعومة فائقة واسترخاء تام.',
      price: 18,
      duration: 25,
      image: 'assets/services-mockup.jpg'
    }
  ];

  let dbInstance = null;

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (dbInstance) {
        return resolve(dbInstance);
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Users Store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          userStore.createIndex('username', 'username', { unique: true });
        }

        // 2. Services Store
        if (!db.objectStoreNames.contains('services')) {
          db.createObjectStore('services', { keyPath: 'id', autoIncrement: true });
        }

        // 3. Schedules Store (Barber time overrides per date)
        if (!db.objectStoreNames.contains('schedules')) {
          const schedStore = db.createObjectStore('schedules', { keyPath: 'id', autoIncrement: true });
          schedStore.createIndex('date', 'date', { unique: false });
          schedStore.createIndex('slotKey', 'slotKey', { unique: true }); // `${date}_${timeSlot}`
        }

        // 4. Bookings Store
        if (!db.objectStoreNames.contains('bookings')) {
          const bookStore = db.createObjectStore('bookings', { keyPath: 'id', autoIncrement: true });
          bookStore.createIndex('userId', 'userId', { unique: false });
          bookStore.createIndex('date', 'date', { unique: false });
          bookStore.createIndex('status', 'status', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        dbInstance = event.target.result;
        try {
          await seedInitialData(dbInstance);
          resolve(dbInstance);
        } catch (err) {
          console.error('Error seeding DB data:', err);
          resolve(dbInstance);
        }
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Seed Admin user and sample services if empty
  async function seedInitialData(db) {
    // 1. Check & seed Admin
    const usersCount = await getCount(db, 'users');
    if (usersCount === 0) {
      await performTransaction(db, 'users', 'readwrite', (store) => {
        store.add({
          username: 'admin',
          password: '123456',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
      });
      console.log('Seeded default admin user: admin / 123456');
    }

    // 2. Check & seed Services
    const servicesCount = await getCount(db, 'services');
    if (servicesCount === 0) {
      await performTransaction(db, 'services', 'readwrite', (store) => {
        INITIAL_SERVICES.forEach((srv) => store.add(srv));
      });
      console.log('Seeded initial barber services.');
    }
  }

  // Generic Helpers
  function performTransaction(db, storeName, mode, callback) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let result;

      try {
        result = callback(store);
      } catch (err) {
        return reject(err);
      }

      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
    });
  }

  function getCount(db, storeName) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Public API Object
  const DB = {
    get STANDARD_SLOTS() {
      return [...STANDARD_SLOTS];
    },

    async init() {
      return await openDatabase();
    },

    // ================= USERS =================
    async getUserByUsername(username) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        const index = store.index('username');
        const req = index.get(username);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    },

    async createUser(user) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('users', 'readwrite');
        const store = tx.objectStore('users');
        const req = store.add({
          ...user,
          createdAt: user.createdAt || new Date().toISOString()
        });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },

    // ================= SERVICES =================
    async getServices() {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('services', 'readonly');
        const store = tx.objectStore('services');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },

    async getServiceById(id) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('services', 'readonly');
        const store = tx.objectStore('services');
        const req = store.get(Number(id));
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    },

    async saveService(service) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('services', 'readwrite');
        const store = tx.objectStore('services');
        let req;
        if (service.id) {
          service.id = Number(service.id);
          req = store.put(service);
        } else {
          req = store.add(service);
        }
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },

    async deleteService(id) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('services', 'readwrite');
        const store = tx.objectStore('services');
        const req = store.delete(Number(id));
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    },

    // ================= SCHEDULES & SLOTS =================
    async getScheduleOverrides(date) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('schedules', 'readonly');
        const store = tx.objectStore('schedules');
        const index = store.index('date');
        const req = index.getAll(date);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },

    async setScheduleAvailability(date, timeSlot, isAvailable) {
      const db = await openDatabase();
      const slotKey = `${date}_${timeSlot}`;
      return new Promise((resolve, reject) => {
        const tx = db.transaction('schedules', 'readwrite');
        const store = tx.objectStore('schedules');
        const index = store.index('slotKey');
        const findReq = index.get(slotKey);

        findReq.onsuccess = () => {
          const existing = findReq.result;
          let saveReq;
          if (existing) {
            existing.isAvailable = isAvailable;
            saveReq = store.put(existing);
          } else {
            saveReq = store.add({
              date,
              timeSlot,
              slotKey,
              isAvailable
            });
          }
          saveReq.onsuccess = () => resolve(true);
          saveReq.onerror = () => reject(saveReq.error);
        };
        findReq.onerror = () => reject(findReq.error);
      });
    },

    parseSlotToMinutes(slotStr) {
      if (!slotStr) return 0;
      const parts = slotStr.trim().split(' ');
      const time = parts[0];
      const modifier = parts[1];
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    },

    getSalonClosingMinutes() {
      const lastSlot = STANDARD_SLOTS[STANDARD_SLOTS.length - 1];
      return this.parseSlotToMinutes(lastSlot) + 30; // 07:00 PM (1140 min)
    },

    // ================= BOOKINGS =================
    async getBookings() {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('bookings', 'readonly');
        const store = tx.objectStore('bookings');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },

    async getBookingsByDate(date) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('bookings', 'readonly');
        const store = tx.objectStore('bookings');
        const index = store.index('date');
        const req = index.getAll(date);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },

    async getBookingsByUser(userId) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('bookings', 'readonly');
        const store = tx.objectStore('bookings');
        const index = store.index('userId');
        const req = index.getAll(userId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    },

    async createBooking(booking) {
      const db = await openDatabase();

      const duration = Number(booking.duration) || 30;
      const slotStart = this.parseSlotToMinutes(booking.timeSlot);
      const slotEnd = slotStart + duration;
      const closingTime = this.getSalonClosingMinutes();

      // Disallow booking if duration extends past the salon closing time
      if (slotEnd > closingTime) {
        throw new Error('SERVICE_EXCEEDS_CLOSING_TIME');
      }

      // Overlap and double booking check
      const dayBookings = await this.getBookingsByDate(booking.date);
      const activeBookings = dayBookings.filter(b => b.status !== 'cancelled');
      const hasOverlap = activeBookings.some((b) => {
        const bStart = this.parseSlotToMinutes(b.timeSlot);
        const bDuration = Number(b.duration) || 30;
        const bEnd = bStart + bDuration;
        return Math.max(slotStart, bStart) < Math.min(slotEnd, bEnd);
      });

      if (hasOverlap) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      return new Promise((resolve, reject) => {
        const tx = db.transaction('bookings', 'readwrite');
        const store = tx.objectStore('bookings');
        const req = store.add({
          ...booking,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },

    async updateBookingStatus(id, status) {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('bookings', 'readwrite');
        const store = tx.objectStore('bookings');
        const getReq = store.get(Number(id));

        getReq.onsuccess = () => {
          const booking = getReq.result;
          if (!booking) return reject(new Error('BOOKING_NOT_FOUND'));
          booking.status = status;
          const putReq = store.put(booking);
          putReq.onsuccess = () => resolve(booking);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    }
  };

  window.DB = DB;
})();
