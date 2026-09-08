/**
 * =========================================================
 * King Barbershop — Authentication & Session (js/auth.js)
 * Manages Customer Registration, Login, and Admin Access
 * =========================================================
 */

(function () {
  'use strict';

  const SESSION_KEY = 'king_barbershop_session';

  let currentUser = null;
  let authMode = 'signin'; // 'signin' or 'signup'

  const Auth = {
    get currentUser() {
      return currentUser;
    },

    get isAuthenticated() {
      return currentUser !== null;
    },

    get isAdmin() {
      return currentUser && currentUser.role === 'admin';
    },

    async init() {
      this.bindEvents();
      this.restoreSession();
    },

    restoreSession() {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          currentUser = JSON.parse(stored);
          this.updateUserUI();
        }
      } catch (err) {
        console.error('Failed to parse session:', err);
        sessionStorage.removeItem(SESSION_KEY);
      }
    },

    saveSession(user) {
      currentUser = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      this.updateUserUI();
      window.dispatchEvent(new CustomEvent('userAuthStateChanged', { detail: { user: currentUser } }));
    },

    async login(username, password) {
      if (!username || !password) {
        throw new Error('MISSING_FIELDS');
      }

      const user = await window.DB.getUserByUsername(username.trim());
      if (!user || user.password !== password) {
        throw new Error('INVALID_CREDENTIALS');
      }

      this.saveSession(user);
      return user;
    },

    async signup(username, password) {
      const cleanUser = username.trim();
      if (!cleanUser || !password) {
        throw new Error('MISSING_FIELDS');
      }
      if (cleanUser.length < 3 || password.length < 3) {
        throw new Error('SHORT_CREDENTIALS');
      }

      const existing = await window.DB.getUserByUsername(cleanUser);
      if (existing) {
        throw new Error('USERNAME_EXISTS');
      }

      const newUserId = await window.DB.createUser({
        username: cleanUser,
        password: password,
        role: 'customer'
      });

      const user = { id: newUserId, username: cleanUser, role: 'customer' };
      this.saveSession(user);
      return user;
    },

    logout() {
      currentUser = null;
      sessionStorage.removeItem(SESSION_KEY);
      this.updateUserUI();
      window.dispatchEvent(new CustomEvent('userAuthStateChanged', { detail: { user: null } }));
      window.location.hash = '#login';
      if (window.showToast) {
        window.showToast(window.I18n.t('logout'), 'info');
      }
    },

    updateUserUI() {
      const userBadge = document.getElementById('user-profile-badge');
      const userNameEl = document.getElementById('user-display-name');
      const bottomNav = document.getElementById('bottom-nav');

      if (currentUser) {
        if (userBadge) userBadge.classList.remove('hidden');
        if (userNameEl) {
          userNameEl.textContent = currentUser.role === 'admin' 
            ? window.I18n.t('barberDashboard') 
            : currentUser.username;
        }

        // Show bottom navigation bar only for customers
        if (bottomNav) {
          if (currentUser.role === 'customer') {
            bottomNav.classList.remove('hidden');
          } else {
            bottomNav.classList.add('hidden');
          }
        }
      } else {
        if (userBadge) userBadge.classList.add('hidden');
        if (bottomNav) bottomNav.classList.add('hidden');
      }
    },

    bindEvents() {
      const tabSignIn = document.getElementById('tab-signin');
      const tabSignUp = document.getElementById('tab-signup');
      const authBtnText = document.getElementById('auth-btn-text');
      const authForm = document.getElementById('form-auth');
      const logoutBtn = document.getElementById('logout-btn');
      const navLogout = document.getElementById('nav-btn-logout');

      // Tabs switching
      if (tabSignIn && tabSignUp) {
        tabSignIn.addEventListener('click', () => {
          authMode = 'signin';
          tabSignIn.classList.add('active');
          tabSignUp.classList.remove('active');
          if (authBtnText) authBtnText.textContent = window.I18n.t('signInBtn');
        });

        tabSignUp.addEventListener('click', () => {
          authMode = 'signup';
          tabSignUp.classList.add('active');
          tabSignIn.classList.remove('active');
          if (authBtnText) authBtnText.textContent = window.I18n.t('signUpBtn');
        });
      }

      // Form submission
      if (authForm) {
        authForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = document.getElementById('auth-username').value;
          const password = document.getElementById('auth-password').value;

          try {
            if (authMode === 'signin') {
              const user = await this.login(username, password);
              window.showToast(window.I18n.t('authSuccessLogin'), 'success');
              if (user.role === 'admin') {
                window.location.hash = '#admin';
              } else {
                window.location.hash = '#services';
              }
            } else {
              const user = await this.signup(username, password);
              window.showToast(window.I18n.t('authSuccessSignup'), 'success');
              window.location.hash = '#services';
            }
            authForm.reset();
          } catch (err) {
            let msg = err.message;
            if (err.message === 'INVALID_CREDENTIALS') {
              msg = window.I18n.t('authErrorInvalid');
            } else if (err.message === 'USERNAME_EXISTS') {
              msg = window.I18n.t('authErrorExists');
            } else if (err.message === 'SHORT_CREDENTIALS' || err.message === 'MISSING_FIELDS') {
              msg = window.I18n.t('authErrorShort');
            }
            window.showToast(msg, 'error');
          }
        });
      }

      // Logout buttons
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
      }
      if (navLogout) {
        navLogout.addEventListener('click', () => this.logout());
      }

      // Re-render UI on language change
      window.addEventListener('languageChanged', () => {
        this.updateUserUI();
        if (authBtnText) {
          authBtnText.textContent = authMode === 'signin' 
            ? window.I18n.t('signInBtn') 
            : window.I18n.t('signUpBtn');
        }
      });
    }
  };

  window.Auth = Auth;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
  } else {
    Auth.init();
  }
})();
