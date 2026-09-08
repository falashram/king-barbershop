/**
 * =========================================================
 * King Barbershop — Application Bootstrap & Router (js/app.js)
 * Coordinates Views, Route Guards, Toasts, and State
 * =========================================================
 */

(function () {
  'use strict';

  // Global Toast Notification Helper
  window.showToast = function (message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  const App = {
    async init() {
      // 1. Initialize DB first
      try {
        await window.DB.init();
      } catch (err) {
        console.error('Database initialization failed:', err);
        window.showToast('Database init error: ' + err.message, 'error');
      }

      // 2. Setup navigation and routing
      this.bindNavigation();
      window.addEventListener('hashchange', () => this.handleRouting());

      // 3. Handle initial route
      this.handleRouting();
    },

    handleRouting() {
      let hash = window.location.hash || '#login';
      const [route, queryString] = hash.split('?');

      const isAuth = window.Auth.isAuthenticated;
      const isAdmin = window.Auth.isAdmin;

      // Route Guards
      if (!isAuth) {
        if (route !== '#login') {
          window.location.hash = '#login';
          return;
        }
      } else {
        // Authenticated user
        if (isAdmin) {
          if (route === '#login' || route === '#services' || route === '#my-bookings' || route === '#book') {
            window.location.hash = '#admin';
            return;
          }
        } else {
          // Customer user
          if (route === '#admin') {
            window.location.hash = '#services';
            return;
          }
          if (route === '#login') {
            window.location.hash = '#services';
            return;
          }
        }
      }

      // Activate View
      this.switchView(route, queryString);
    },

    switchView(route, queryString) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

      // Bottom nav tab states
      const navServices = document.getElementById('nav-btn-services');
      const navBookings = document.getElementById('nav-btn-bookings');
      if (navServices) navServices.classList.remove('active');
      if (navBookings) navBookings.classList.remove('active');

      if (route === '#login') {
        const view = document.getElementById('view-login');
        if (view) view.classList.add('active');

      } else if (route === '#services') {
        const view = document.getElementById('view-services');
        if (view) view.classList.add('active');
        if (navServices) navServices.classList.add('active');
        if (window.ServicesManager) {
          window.ServicesManager.renderServices();
        }

      } else if (route === '#book') {
        const view = document.getElementById('view-book');
        if (view) view.classList.add('active');
        if (queryString && queryString.includes('id=')) {
          const serviceId = queryString.split('id=')[1];
          // Ensure booking view is loaded if entered directly via hash
          if (window.BookingManager && !document.getElementById('book-service-summary').innerHTML.trim()) {
            window.BookingManager.openBooking(serviceId);
          }
        }

      } else if (route === '#my-bookings') {
        const view = document.getElementById('view-my-bookings');
        if (view) view.classList.add('active');
        if (navBookings) navBookings.classList.add('active');
        if (window.BookingManager) {
          window.BookingManager.renderMyBookings();
        }

      } else if (route === '#admin') {
        const view = document.getElementById('view-admin');
        if (view) view.classList.add('active');
        if (window.AdminManager) {
          window.AdminManager.renderDashboard();
        }
      }
    },

    bindNavigation() {
      const navServices = document.getElementById('nav-btn-services');
      const navBookings = document.getElementById('nav-btn-bookings');

      if (navServices) {
        navServices.addEventListener('click', () => {
          window.location.hash = '#services';
        });
      }

      if (navBookings) {
        navBookings.addEventListener('click', () => {
          window.location.hash = '#my-bookings';
        });
      }

      // Listen to auth state changes to re-evaluate route
      window.addEventListener('userAuthStateChanged', () => {
        this.handleRouting();
      });
    }
  };

  window.App = App;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();
