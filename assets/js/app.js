(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const demo = window.GYMFLOW_DEMO || { users: [], accesses: [], themes: ['iron'] };

  const getBasePath = () => body.dataset.page === 'admin-dashboard' ? '../' : '';

  function applyTheme(themeName, persist = true) {
    const safeTheme = demo.themes.includes(themeName) ? themeName : 'iron';
    root.dataset.theme = safeTheme;
    if (persist) localStorage.setItem('gymflow-theme', safeTheme);
    document.querySelectorAll('[data-theme]').forEach(button => {
      const selected = button.dataset.theme === safeTheme;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function initTheme() {
    const stored = localStorage.getItem('gymflow-theme');
    applyTheme(stored || 'iron', false);
    document.querySelectorAll('[data-theme]').forEach(button => {
      button.addEventListener('click', () => applyTheme(button.dataset.theme));
    });
    document.querySelectorAll('[data-theme-cycle]').forEach(button => {
      button.addEventListener('click', () => {
        const current = root.dataset.theme || 'iron';
        const index = demo.themes.indexOf(current);
        applyTheme(demo.themes[(index + 1) % demo.themes.length]);
        toast(`Tema ${root.dataset.theme} aplicado`);
      });
    });
  }

  function initPublicMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  function initReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    elements.forEach(el => observer.observe(el));
  }

  function toast(message, tone = 'info') {
    let container = document.querySelector('[data-toast-container]');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.dataset.toastContainer = '';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    const item = document.createElement('div');
    item.className = `toast toast-${tone}`;
    item.innerHTML = `<span>${tone === 'success' ? '✓' : 'i'}</span><p>${message}</p>`;
    container.appendChild(item);
    requestAnimationFrame(() => item.classList.add('show'));
    setTimeout(() => {
      item.classList.remove('show');
      setTimeout(() => item.remove(), 220);
    }, 2600);
  }

  function initDemoOnlyActions() {
    document.querySelectorAll('[data-demo-only]').forEach(element => {
      element.addEventListener('click', event => {
        event.preventDefault();
        toast('Esta función se conectará en una fase posterior del desarrollo.');
      });
    });
  }

  function renderDemoUsers() {
    const container = document.querySelector('[data-demo-users]');
    if (!container) return;
    container.innerHTML = demo.users.map((user, index) => `
      <button class="demo-user" type="button" data-demo-user="${index}">
        <span>${user.initials}</span>
        <div><strong>${user.role}</strong><small>${user.email}</small></div>
        <b>→</b>
      </button>
    `).join('');
    container.querySelectorAll('[data-demo-user]').forEach(button => {
      button.addEventListener('click', () => {
        const user = demo.users[Number(button.dataset.demoUser)];
        loginAs(user);
      });
    });
  }

  function loginAs(user) {
    if (!user) return;
    localStorage.setItem('gymflow-demo-session', JSON.stringify({
      userId: user.id,
      name: user.name,
      role: user.role,
      tenantId: 'tenant_demo_iron_factory',
      branchId: 'branch_demo_principal',
      demo: true,
      createdAt: new Date().toISOString()
    }));
    toast(`Ingresando como ${user.role}`, 'success');
    setTimeout(() => { window.location.href = user.destination; }, 420);
  }

  function initLogin() {
    const form = document.querySelector('[data-login-form]');
    if (!form) return;
    renderDemoUsers();
    const togglePassword = document.querySelector('[data-toggle-password]');
    if (togglePassword) {
      togglePassword.addEventListener('click', () => {
        const input = form.querySelector('input[name="password"]');
        input.type = input.type === 'password' ? 'text' : 'password';
        togglePassword.setAttribute('aria-label', input.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
      });
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const email = new FormData(form).get('email');
      const user = demo.users.find(item => item.email === email) || demo.users[0];
      loginAs(user);
    });
  }

  function renderAccesses() {
    const list = document.querySelector('[data-access-list]');
    if (!list) return;
    list.innerHTML = demo.accesses.map(access => `
      <div class="access-row">
        <span class="member-avatar">${access.initials}</span>
        <div class="access-person"><strong>${access.name}</strong><small>${access.plan}</small></div>
        <time>${access.time}</time>
        <span class="access-pill ${access.status}">${access.status === 'allowed' ? '✓ Permitido' : access.status === 'warning' ? '! Alerta' : '× Denegado'}</span>
      </div>
    `).join('');
  }

  function hydrateDemoSession() {
    let session = null;
    try { session = JSON.parse(localStorage.getItem('gymflow-demo-session') || 'null'); } catch (_) { session = null; }
    if (!session) return;
    document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = session.name; });
    document.querySelectorAll('[data-user-role]').forEach(el => { el.textContent = session.role; });
  }

  function initSidebar() {
    const sidebar = document.querySelector('[data-sidebar]');
    const overlay = document.querySelector('[data-sidebar-overlay]');
    const open = document.querySelector('[data-sidebar-open]');
    const close = document.querySelector('[data-sidebar-close]');
    if (!sidebar) return;
    const setOpen = isOpen => {
      sidebar.classList.toggle('open', isOpen);
      overlay?.classList.toggle('open', isOpen);
      body.classList.toggle('sidebar-open', isOpen);
    };
    open?.addEventListener('click', () => setOpen(true));
    close?.addEventListener('click', () => setOpen(false));
    overlay?.addEventListener('click', () => setOpen(false));
  }

  function initGlobalSearchShortcut() {
    const input = document.querySelector('.global-search input');
    if (!input) return;
    document.addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        input.focus();
      }
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        toast('La búsqueda global se conectará al API en una fase posterior.');
      }
    });
  }

  initTheme();
  initPublicMenu();
  initReveal();
  initLogin();
  initDemoOnlyActions();
  renderAccesses();
  hydrateDemoSession();
  initSidebar();
  initGlobalSearchShortcut();
})();
