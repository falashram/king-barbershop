/**
 * =========================================================
 * King Barbershop — Booking Engine & Customer Bookings (js/booking.js)
 * Implements Date/Time Picker & Reservations (Matching Image 2 in asets)
 * =========================================================
 */

(function () {
  'use strict';

  let currentService = null;
  let selectedDateStr = null; // YYYY-MM-DD
  let selectedTimeSlot = null; // e.g. "12:00 PM"

  const BookingManager = {
    init() {
      this.bindEvents();
    },

    async openBooking(serviceId) {
      // Require auth
      if (!window.Auth.isAuthenticated) {
        window.showToast(window.I18n.t('authErrorInvalid'), 'error');
        window.location.hash = '#login';
        return;
      }

      currentService = await window.DB.getServiceById(serviceId);
      if (!currentService) {
        window.showToast('Service not found', 'error');
        window.location.hash = '#services';
        return;
      }

      selectedTimeSlot = null;
      this.renderServiceSummary();
      this.renderDateSlider();

      // Switch to booking view
      window.location.hash = `#book?id=${serviceId}`;
    },

    renderServiceSummary() {
      const summaryEl = document.getElementById('book-service-summary');
      if (!summaryEl || !currentService) return;

      const durationSuffix = window.I18n.t('durationMinutes');
      const imageSrc = currentService.image || 'assets/services-mockup.jpg';

      summaryEl.innerHTML = `
        <img src="${imageSrc}" alt="${currentService.name}" class="summary-thumb" onerror="this.src='assets/services-mockup.jpg'">
        <div class="summary-info">
          <h3>${this.escapeHtml(currentService.name)}</h3>
          <p class="summary-meta">
            $${currentService.price} &nbsp;|&nbsp; 
            ${window.Icons ? window.Icons.clock(13) : ''} 
            ${currentService.duration} ${durationSuffix}
          </p>
        </div>
      `;
    },

    renderDateSlider() {
      const container = document.getElementById('dates-container');
      if (!container) return;

      container.innerHTML = '';
      const daysCount = 14;
      const today = new Date();

      const dayNames = window.I18n.t('dayNames');
      const monthNames = window.I18n.t('monthNames');

      for (let i = 0; i < daysCount; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const dayName = dayNames[d.getDay()];
        const monthName = monthNames[d.getMonth()];

        const isSelected = i === 0; // default select first day
        if (isSelected) {
          selectedDateStr = dateStr;
        }

        const pill = document.createElement('div');
        pill.className = `date-pill ${isSelected ? 'active' : ''}`;
        pill.dataset.date = dateStr;
        pill.innerHTML = `
          <span class="pill-day-name">${dayName}</span>
          <span class="pill-day-num">${d.getDate()}</span>
          <span class="pill-month">${monthName}</span>
        `;

        pill.addEventListener('click', () => {
          container.querySelectorAll('.date-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          selectedDateStr = dateStr;
          selectedTimeSlot = null;
          this.updateReserveButtonState();
          this.loadTimeSlots(selectedDateStr);
        });

        container.appendChild(pill);
      }

      // Load slots for initially selected date
      if (selectedDateStr) {
        this.loadTimeSlots(selectedDateStr);
      }
    },

    async loadTimeSlots(dateStr) {
      const container = document.getElementById('time-slots-container');
      const indicator = document.getElementById('selected-date-indicator');
      if (!container) return;

      if (indicator) {
        indicator.textContent = dateStr;
      }

      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 10px;">...</div>';

      try {
        const standardSlots = window.DB.STANDARD_SLOTS;
        // 1. Fetch overrides from barber
        const overrides = await window.DB.getScheduleOverrides(dateStr);
        const disabledSlots = new Set(
          overrides.filter(o => o.isAvailable === false).map(o => o.timeSlot)
        );

        // 2. Fetch existing bookings
        const dayBookings = await window.DB.getBookingsByDate(dateStr);
        const bookedSlots = new Set(
          dayBookings.filter(b => b.status !== 'cancelled').map(b => b.timeSlot)
        );

        const duration = currentService ? Number(currentService.duration) : 30;
        const closingTime = window.DB.getSalonClosingMinutes();

        container.innerHTML = standardSlots.map(slot => {
          const slotStart = window.DB.parseSlotToMinutes(slot);
          const slotEnd = slotStart + duration;

          // 1. Service duration extends past salon closing time
          const exceedsClosing = slotEnd > closingTime;

          // 2. Direct slot booked or barber disabled
          const isDirectlyBooked = bookedSlots.has(slot);
          const isBarberDisabled = disabledSlots.has(slot);

          // 3. Multi-slot overlap check (if duration > 30 min)
          let overlapsOtherBookings = isDirectlyBooked;
          if (!overlapsOtherBookings && duration > 30) {
            for (let t = slotStart; t < slotEnd; t += 30) {
              const checkSlot = standardSlots.find(s => window.DB.parseSlotToMinutes(s) === t);
              if (checkSlot && (bookedSlots.has(checkSlot) || disabledSlots.has(checkSlot))) {
                overlapsOtherBookings = true;
                break;
              }
            }
          }

          const isUnavailable = exceedsClosing || isBarberDisabled || overlapsOtherBookings;
          const isSelected = selectedTimeSlot === slot;

          let reasonTooltip = '';
          if (exceedsClosing) {
            reasonTooltip = window.I18n.t('slotExceedsClosing');
          } else if (isUnavailable) {
            reasonTooltip = window.I18n.t('slotUnavailable');
          }

          return `
            <button 
              type="button" 
              class="time-slot-btn ${isUnavailable ? 'disabled booked' : ''} ${isSelected ? 'active' : ''}" 
              data-slot="${slot}"
              title="${reasonTooltip}"
              ${isUnavailable ? 'disabled' : ''}
            >
              ${slot}
            </button>
          `;
        }).join('');

        // Bind click on slots
        container.querySelectorAll('.time-slot-btn:not(:disabled)').forEach(btn => {
          btn.addEventListener('click', () => {
            container.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTimeSlot = btn.dataset.slot;
            this.updateReserveButtonState();
          });
        });

      } catch (err) {
        console.error('Failed to load slots:', err);
        container.innerHTML = '<div style="color: var(--status-cancelled);">Error loading slots</div>';
      }
    },

    updateReserveButtonState() {
      const reserveBtn = document.getElementById('btn-reserve');
      if (!reserveBtn) return;
      reserveBtn.disabled = !(currentService && selectedDateStr && selectedTimeSlot);
    },

    async confirmReservation() {
      if (!currentService || !selectedDateStr || !selectedTimeSlot) {
        window.showToast(window.I18n.t('bookingErrorNoSlot'), 'error');
        return;
      }

      const currentUser = window.Auth.currentUser;
      if (!currentUser) {
        window.location.hash = '#login';
        return;
      }

      const reserveBtn = document.getElementById('btn-reserve');
      if (reserveBtn) reserveBtn.disabled = true;

      try {
        await window.DB.createBooking({
          userId: currentUser.id,
          customerName: currentUser.username,
          serviceId: currentService.id,
          serviceName: currentService.name,
          price: currentService.price,
          duration: currentService.duration,
          date: selectedDateStr,
          timeSlot: selectedTimeSlot
        });

        window.showToast(window.I18n.t('bookingSuccess'), 'success');
        window.location.hash = '#my-bookings';

      } catch (err) {
        console.error('Booking failed:', err);
        if (err.message === 'SLOT_ALREADY_BOOKED') {
          window.showToast(window.I18n.t('bookingSlotUnavailable'), 'error');
          this.loadTimeSlots(selectedDateStr);
        } else {
          window.showToast('Reservation error: ' + err.message, 'error');
        }
      } finally {
        if (reserveBtn) reserveBtn.disabled = false;
      }
    },

    // ================= MY BOOKINGS =================
    async renderMyBookings() {
      const container = document.getElementById('my-bookings-list');
      if (!container) return;

      const user = window.Auth.currentUser;
      if (!user) {
        window.location.hash = '#login';
        return;
      }

      container.innerHTML = `<div class="empty-state"><div class="empty-icon">${window.Icons ? window.Icons.hourglass(32) : ''}</div><p>...</p></div>`;

      try {
        const bookings = await window.DB.getBookingsByUser(user.id);

        if (!bookings || bookings.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon">${window.Icons ? window.Icons.calendar(36) : ''}</div>
              <p>${window.I18n.t('noBookingsYet')}</p>
            </div>
          `;
          return;
        }

        // Sort reverse chronological
        bookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        container.innerHTML = bookings.map(b => {
          let badgeClass = 'badge-confirmed';
          let statusText = window.I18n.t('statusConfirmed');

          if (b.status === 'completed') {
            badgeClass = 'badge-completed';
            statusText = window.I18n.t('statusCompleted');
          } else if (b.status === 'cancelled') {
            badgeClass = 'badge-cancelled';
            statusText = window.I18n.t('statusCancelled');
          }

          const canCancel = b.status === 'confirmed';

          return `
            <div class="booking-item-card">
              <div class="booking-card-header">
                <h4 class="booking-service-title">${this.escapeHtml(b.serviceName)}</h4>
                <span class="badge-status ${badgeClass}">${statusText}</span>
              </div>
              <div class="booking-card-body">
                <span>${window.Icons ? window.Icons.calendar(14) : ''} ${b.date}</span>
                <span>${window.Icons ? window.Icons.clock(14) : ''} ${b.timeSlot}</span>
              </div>
              <div class="booking-card-footer">
                <span class="booking-price">$${b.price}</span>
                ${canCancel ? `
                  <button type="button" class="btn-cancel-booking" onclick="window.BookingManager.cancelBooking(${b.id})">
                    ${window.I18n.t('cancelBooking')}
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('');

      } catch (err) {
        console.error('Error rendering my bookings:', err);
      }
    },

    async cancelBooking(bookingId) {
      if (!confirm('Are you sure you want to cancel this booking? / هل تريد إلغاء هذا الحجز؟')) {
        return;
      }

      try {
        await window.DB.updateBookingStatus(bookingId, 'cancelled');
        window.showToast(window.I18n.t('bookingCancelledSuccess'), 'success');
        this.renderMyBookings();
      } catch (err) {
        console.error('Cancel booking error:', err);
      }
    },

    bindEvents() {
      const reserveBtn = document.getElementById('btn-reserve');
      if (reserveBtn) {
        reserveBtn.addEventListener('click', () => this.confirmReservation());
      }

      const backBtn = document.getElementById('btn-back-services');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.location.hash = '#services';
        });
      }

      const backFromBookingsBtn = document.getElementById('btn-back-from-bookings');
      if (backFromBookingsBtn) {
        backFromBookingsBtn.addEventListener('click', () => {
          window.location.hash = '#services';
        });
      }

      window.addEventListener('languageChanged', () => {
        if (currentService) {
          this.renderServiceSummary();
          this.renderDateSlider();
        }
        if (window.location.hash === '#my-bookings') {
          this.renderMyBookings();
        }
      });
    },

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  window.BookingManager = BookingManager;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BookingManager.init());
  } else {
    BookingManager.init();
  }
})();
