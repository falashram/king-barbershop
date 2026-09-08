/**
 * =========================================================
 * King Barbershop — Barber Admin Control Panel (js/admin.js)
 * Manages Appointments, Services CRUD, and Working Schedule
 * =========================================================
 */

(function () {
  'use strict';

  let currentAdminTab = 'bookings';
  let selectedScheduleDate = new Date().toISOString().split('T')[0];

  const AdminManager = {
    async init() {
      this.bindEvents();
    },

    async renderDashboard() {
      if (!window.Auth.isAdmin) {
        window.location.hash = '#login';
        return;
      }

      await this.updateStats();
      this.renderCurrentTab();
    },

    async updateStats() {
      try {
        const bookings = await window.DB.getBookings();
        const services = await window.DB.getServices();
        const todayStr = new Date().toISOString().split('T')[0];

        const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled');

        const statTotal = document.getElementById('stat-total-bookings');
        const statToday = document.getElementById('stat-today-bookings');
        const statServices = document.getElementById('stat-active-services');

        if (statTotal) statTotal.textContent = bookings.length;
        if (statToday) statToday.textContent = todayBookings.length;
        if (statServices) statServices.textContent = services.length;

      } catch (err) {
        console.error('Failed to update admin stats:', err);
      }
    },

    renderCurrentTab() {
      document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === currentAdminTab);
      });

      document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-admin-${currentAdminTab}`);
      });

      if (currentAdminTab === 'bookings') {
        this.renderBookingsTab();
      } else if (currentAdminTab === 'services') {
        this.renderServicesTab();
      } else if (currentAdminTab === 'schedule') {
        this.renderScheduleTab();
      }
    },

    // ================= TAB 1: BOOKINGS =================
    async renderBookingsTab() {
      const container = document.getElementById('admin-bookings-list');
      const dateFilterInput = document.getElementById('admin-booking-date-filter');
      if (!container) return;

      container.innerHTML = `<div class="empty-state"><div class="empty-icon">${window.Icons ? window.Icons.hourglass(32) : ''}</div><p>...</p></div>`;

      try {
        let bookings = await window.DB.getBookings();
        const filterDate = dateFilterInput ? dateFilterInput.value : '';

        if (filterDate) {
          bookings = bookings.filter(b => b.date === filterDate);
        }

        if (!bookings || bookings.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon">${window.Icons ? window.Icons.calendar(40) : ''}</div>
              <p>${window.I18n.t('noAdminBookings')}</p>
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

          const isActionable = b.status === 'confirmed';

          return `
            <div class="admin-booking-item">
              <div class="admin-booking-row">
                <span class="client-name">
                  ${window.Icons ? window.Icons.user(14) : ''}
                  ${this.escapeHtml(b.customerName || 'Customer')}
                </span>
                <span class="badge-status ${badgeClass}">${statusText}</span>
              </div>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--accent-light); display: flex; align-items: center; gap: 6px;">
                ${window.Icons ? window.Icons.scissors(13) : ''}
                <span>${this.escapeHtml(b.serviceName)} - $${b.price}</span>
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 14px;">
                <span style="display: flex; align-items: center; gap: 4px;">
                  ${window.Icons ? window.Icons.calendar(13) : ''} ${b.date}
                </span>
                <span style="display: flex; align-items: center; gap: 4px;">
                  ${window.Icons ? window.Icons.clock(13) : ''} ${b.timeSlot}
                </span>
              </div>
              ${isActionable ? `
                <div class="admin-booking-actions">
                  <button type="button" class="btn-complete" onclick="window.AdminManager.setBookingStatus(${b.id}, 'completed')">
                    ${window.Icons ? window.Icons.check(14) : ''}
                    <span>${window.I18n.t('actionComplete')}</span>
                  </button>
                  <button type="button" class="btn-cancel-booking" style="flex:1; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="window.AdminManager.setBookingStatus(${b.id}, 'cancelled')">
                    ${window.Icons ? window.Icons.cross(14) : ''}
                    <span>${window.I18n.t('actionCancel')}</span>
                  </button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');

      } catch (err) {
        console.error('Failed to render admin bookings:', err);
      }
    },

    async setBookingStatus(bookingId, status) {
      try {
        await window.DB.updateBookingStatus(bookingId, status);
        window.showToast(status === 'completed' ? window.I18n.t('bookingMarkedCompleted') : window.I18n.t('bookingCancelledSuccess'), 'success');
        this.renderBookingsTab();
        this.updateStats();
      } catch (err) {
        console.error('Update status error:', err);
      }
    },

    // ================= TAB 2: SERVICES CRUD =================
    async renderServicesTab() {
      const container = document.getElementById('admin-services-list');
      if (!container) return;

      container.innerHTML = `<div class="empty-state"><div class="empty-icon">${window.Icons ? window.Icons.hourglass(32) : ''}</div><p>...</p></div>`;

      try {
        const services = await window.DB.getServices();

        if (!services || services.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon">${window.Icons ? window.Icons.scissors(36) : ''}</div>
              <p>${window.I18n.t('noAdminBookings')}</p>
            </div>
          `;
          return;
        }

        container.innerHTML = services.map(srv => {
          const imageSrc = srv.image || 'assets/services-mockup.jpg';
          return `
            <div class="admin-service-item">
              <div class="admin-service-info">
                <img src="${imageSrc}" alt="${srv.name}" class="admin-service-thumb" onerror="this.src='assets/services-mockup.jpg'">
                <div class="admin-service-text">
                  <h4>${this.escapeHtml(srv.name)}</h4>
                  <div style="font-size: 0.75rem; color: var(--accent);">$${srv.price} &bull; ${srv.duration} min</div>
                </div>
              </div>
              <div class="admin-service-actions">
                <button type="button" class="btn-edit-service" title="Edit" onclick="window.AdminManager.openEditService(${srv.id})">
                  ${window.Icons ? window.Icons.edit(14) : ''}
                </button>
                <button type="button" class="btn-delete-service" title="Delete" onclick="window.AdminManager.deleteService(${srv.id})">
                  ${window.Icons ? window.Icons.trash(14) : ''}
                </button>
              </div>
            </div>
          `;
        }).join('');

      } catch (err) {
        console.error('Failed to render admin services:', err);
      }
    },

    openAddService() {
      const modal = document.getElementById('modal-service');
      const form = document.getElementById('form-service');
      const modalTitle = document.getElementById('modal-service-title');
      if (!modal || !form) return;

      form.reset();
      document.getElementById('service-edit-id').value = '';
      if (modalTitle) modalTitle.textContent = window.I18n.t('addServiceModalTitle');
      modal.classList.remove('hidden');
    },

    async openEditService(serviceId) {
      const modal = document.getElementById('modal-service');
      const form = document.getElementById('form-service');
      const modalTitle = document.getElementById('modal-service-title');
      if (!modal || !form) return;

      const service = await window.DB.getServiceById(serviceId);
      if (!service) return;

      document.getElementById('service-edit-id').value = service.id;
      document.getElementById('service-name').value = service.name || '';
      document.getElementById('service-desc').value = service.desc || '';
      document.getElementById('service-price').value = service.price || '';
      document.getElementById('service-duration').value = service.duration || '';
      document.getElementById('service-image').value = service.image || '';

      if (modalTitle) modalTitle.textContent = window.I18n.t('editServiceModalTitle');
      modal.classList.remove('hidden');
    },

    closeServiceModal() {
      const modal = document.getElementById('modal-service');
      if (modal) modal.classList.add('hidden');
    },

    async handleSaveService(e) {
      e.preventDefault();
      const id = document.getElementById('service-edit-id').value;
      const name = document.getElementById('service-name').value.trim();
      const desc = document.getElementById('service-desc').value.trim();
      const price = parseFloat(document.getElementById('service-price').value);
      const duration = parseInt(document.getElementById('service-duration').value, 10);
      const image = document.getElementById('service-image').value.trim() || 'assets/services-mockup.jpg';

      if (!name || isNaN(price) || isNaN(duration)) {
        window.showToast('Please fill all required fields', 'error');
        return;
      }

      const serviceData = {
        name,
        desc,
        price,
        duration,
        image
      };

      if (id) {
        serviceData.id = Number(id);
      }

      try {
        await window.DB.saveService(serviceData);
        window.showToast(window.I18n.t('serviceSavedSuccess'), 'success');
        this.closeServiceModal();
        this.renderServicesTab();
        this.updateStats();
      } catch (err) {
        console.error('Save service error:', err);
        window.showToast('Error saving service: ' + err.message, 'error');
      }
    },

    async deleteService(serviceId) {
      if (!confirm(window.I18n.t('deleteConfirm'))) return;

      try {
        await window.DB.deleteService(serviceId);
        window.showToast(window.I18n.t('serviceDeletedSuccess'), 'success');
        this.renderServicesTab();
        this.updateStats();
      } catch (err) {
        console.error('Delete service error:', err);
      }
    },

    // ================= TAB 3: SCHEDULE MANAGEMENT =================
    async renderScheduleTab() {
      const container = document.getElementById('admin-schedule-slots');
      const dateInput = document.getElementById('admin-schedule-date');
      if (!container) return;

      if (dateInput && !dateInput.value) {
        dateInput.value = selectedScheduleDate;
      }
      const targetDate = dateInput ? dateInput.value : selectedScheduleDate;

      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">...</div>';

      try {
        const standardSlots = window.DB.STANDARD_SLOTS;
        const overrides = await window.DB.getScheduleOverrides(targetDate);

        // Map overrides: isAvailable true/false
        const overridesMap = new Map();
        overrides.forEach(o => overridesMap.set(o.timeSlot, o.isAvailable));

        container.innerHTML = standardSlots.map(slot => {
          // Default is available (true) unless explicitly set to false
          const isAvailable = overridesMap.has(slot) ? overridesMap.get(slot) : true;
          const statusClass = isAvailable ? 'available' : 'disabled';
          const label = isAvailable ? window.I18n.t('available') : window.I18n.t('unavailable');

          return `
            <button 
              type="button" 
              class="schedule-toggle-btn ${statusClass}" 
              data-slot="${slot}"
              data-available="${isAvailable}"
              onclick="window.AdminManager.toggleSlotAvailability('${targetDate}', '${slot}', ${!isAvailable})"
            >
              <span>${slot}</span>
              <span class="slot-indicator"></span>
            </button>
          `;
        }).join('');

      } catch (err) {
        console.error('Failed to render admin schedule:', err);
      }
    },

    async toggleSlotAvailability(date, slot, newAvailableState) {
      try {
        await window.DB.setScheduleAvailability(date, slot, newAvailableState);
        window.showToast(window.I18n.t('slotToggledSuccess'), 'success');
        this.renderScheduleTab();
      } catch (err) {
        console.error('Toggle slot error:', err);
      }
    },

    bindEvents() {
      // Tab switching
      document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          currentAdminTab = tab.dataset.tab;
          this.renderCurrentTab();
        });
      });

      // Bookings date filter
      const dateFilterInput = document.getElementById('admin-booking-date-filter');
      const clearFilterBtn = document.getElementById('admin-booking-clear-filter');
      if (dateFilterInput) {
        dateFilterInput.addEventListener('change', () => this.renderBookingsTab());
      }
      if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
          if (dateFilterInput) dateFilterInput.value = '';
          this.renderBookingsTab();
        });
      }

      // Schedule date picker
      const scheduleDateInput = document.getElementById('admin-schedule-date');
      if (scheduleDateInput) {
        scheduleDateInput.addEventListener('change', (e) => {
          selectedScheduleDate = e.target.value;
          this.renderScheduleTab();
        });
      }

      // Add service modal buttons
      const openAddBtn = document.getElementById('btn-open-add-service');
      const closeAddBtn = document.getElementById('btn-close-service-modal');
      const cancelAddBtn = document.getElementById('btn-cancel-service');
      const serviceForm = document.getElementById('form-service');

      if (openAddBtn) openAddBtn.addEventListener('click', () => this.openAddService());
      if (closeAddBtn) closeAddBtn.addEventListener('click', () => this.closeServiceModal());
      if (cancelAddBtn) cancelAddBtn.addEventListener('click', () => this.closeServiceModal());
      if (serviceForm) serviceForm.addEventListener('submit', (e) => this.handleSaveService(e));

      window.addEventListener('languageChanged', () => {
        if (window.location.hash === '#admin') {
          this.renderDashboard();
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

  window.AdminManager = AdminManager;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminManager.init());
  } else {
    AdminManager.init();
  }
})();
