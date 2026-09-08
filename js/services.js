/**
 * =========================================================
 * King Barbershop — Services Catalog (js/services.js)
 * Displays Luxury Services Cards (Matching Image 1 in asets)
 * =========================================================
 */

(function () {
  'use strict';

  const ServicesManager = {
    services: [],

    async init() {
      window.addEventListener('languageChanged', () => {
        this.renderServices();
      });
    },

    async loadServices() {
      try {
        this.services = await window.DB.getServices();
        return this.services;
      } catch (err) {
        console.error('Failed to load services:', err);
        return [];
      }
    },

    async renderServices() {
      const container = document.getElementById('services-list');
      if (!container) return;

      container.innerHTML = `<div class="empty-state"><div class="empty-icon">${window.Icons ? window.Icons.hourglass(32) : ''}</div><p>...</p></div>`;

      await this.loadServices();

      if (!this.services || this.services.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">${window.Icons ? window.Icons.scissors(36) : ''}</div>
            <p>${window.I18n.t('noAdminBookings')}</p>
          </div>
        `;
        return;
      }

      const durationSuffix = window.I18n.t('durationMinutes');
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';

      container.innerHTML = this.services.map((srv) => {
        const imageSrc = srv.image || 'assets/services-mockup.jpg';
        return `
          <div class="service-card" data-service-id="${srv.id}" onclick="window.ServicesManager.onSelectService(${srv.id})">
            <img src="${imageSrc}" alt="${srv.name}" class="service-thumb" onerror="this.src='assets/services-mockup.jpg'">
            <div class="service-info">
              <h3 class="service-title">${this.escapeHtml(srv.name)}</h3>
              <p class="service-desc">${this.escapeHtml(srv.desc || '')}</p>
              <div class="service-meta">
                <span class="service-price">$${srv.price}</span>
                <span class="service-duration">
                  ${window.Icons ? window.Icons.clock(13) : ''}
                  ${srv.duration} ${durationSuffix}
                </span>
              </div>
            </div>
            <div class="service-chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        `;
      }).join('');
    },

    onSelectService(serviceId) {
      if (window.BookingManager) {
        window.BookingManager.openBooking(serviceId);
      } else {
        window.location.hash = `#book?id=${serviceId}`;
      }
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

  window.ServicesManager = ServicesManager;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ServicesManager.init());
  } else {
    ServicesManager.init();
  }
})();
