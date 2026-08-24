(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const demo = window.GYMFLOW_DEMO || { users: [], accesses: [], themes: ['iron'] };
  const api = window.GymFlowApi || null;
  const config = window.GYMFLOW_CONFIG || {};

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
    item.innerHTML = `<span>${tone === 'success' ? '✓' : tone === 'danger' ? '!' : 'i'}</span><p></p>`;
    item.querySelector('p').textContent = message;
    container.appendChild(item);
    requestAnimationFrame(() => item.classList.add('show'));
    setTimeout(() => {
      item.classList.remove('show');
      setTimeout(() => item.remove(), 220);
    }, 3000);
  }

  function initDemoOnlyActions() {
    document.querySelectorAll('[data-demo-only]').forEach(element => {
      element.addEventListener('click', event => {
        event.preventDefault();
        toast('Este módulo se implementará en una fase posterior del desarrollo.');
      });
    });
  }

  function renderDemoUsers() {
    const container = document.querySelector('[data-demo-users]');
    if (!container) return;
    container.innerHTML = demo.users.map((user, index) => `
      <button class="demo-user" type="button" data-demo-user="${index}">
        <span>${escapeHtml(user.initials)}</span>
        <div><strong>${escapeHtml(user.role)}</strong><small>${escapeHtml(user.email)}</small></div>
        <b>→</b>
      </button>
    `).join('');
    container.querySelectorAll('[data-demo-user]').forEach(button => {
      button.addEventListener('click', () => loginAs(demo.users[Number(button.dataset.demoUser)]));
    });
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
  }

  function destinationForSession(session, fallbackUser) {
    const roles = session?.roleIds || [];
    if (roles.includes('role_platform_super_admin') || fallbackUser?.role === 'Super Admin SaaS') return 'super-admin/dashboard.html';
    return fallbackUser?.destination || 'admin/dashboard.html';
  }

  async function loginAs(user) {
    if (!user) return;
    const useBackendDemo = api?.isEnabled?.() && config.ENABLE_BACKEND_DEMO_LOGIN === true;

    if (useBackendDemo) {
      try {
        toast('Validando perfil demo en el backend...');
        const session = await api.demoLogin(user.email);
        toast(`Sesión backend iniciada: ${session.user?.displayName || user.role}`, 'success');
        setTimeout(() => { window.location.href = destinationForSession({ roleIds: session.roleIds || session.permissions }, user); }, 220);
        return;
      } catch (error) {
        toast(`${error.message}${error.correlationId ? ` · ${error.correlationId}` : ''}`, 'danger');
        return;
      }
    }

    localStorage.setItem('gymflow-demo-session', JSON.stringify({
      userId: user.id,
      name: user.name,
      role: user.role,
      tenantId: user.role === 'Super Admin SaaS' ? null : 'tenant_demo_iron_factory',
      branchId: user.role === 'Super Admin SaaS' ? null : 'branch_demo_principal',
      demo: true,
      createdAt: new Date().toISOString()
    }));
    toast(`Ingresando como ${user.role} en modo estático`, 'success');
    setTimeout(() => { window.location.href = user.destination; }, 320);
  }

  function initLogin() {
    const form = document.querySelector('[data-login-form]');
    if (!form) return;
    renderDemoUsers();
    const authMode = document.querySelector('[data-auth-mode]');
    if (authMode && api?.isEnabled?.() && config.ENABLE_BACKEND_DEMO_LOGIN === true) {
      authMode.innerHTML = '<strong>Backend demo activo</strong><span>El acceso crea una sesión opaca en Apps Script. Sigue siendo un entorno de demostración, no autenticación de producción.</span>';
    }
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
        <span class="member-avatar">${escapeHtml(access.initials)}</span>
        <div class="access-person"><strong>${escapeHtml(access.name)}</strong><small>${escapeHtml(access.plan)}</small></div>
        <time>${escapeHtml(access.time)}</time>
        <span class="access-pill ${escapeHtml(access.status)}">${access.status === 'allowed' ? '✓ Permitido' : access.status === 'warning' ? '! Alerta' : '× Denegado'}</span>
      </div>
    `).join('');
  }

  function initials(name) {
    return String(name || 'GF').trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase();
  }

  function applySessionToUi(session) {
    const user = session?.user || {};
    const name = user.displayName || session?.name || 'Usuario';
    const role = session?.role || friendlyRole(session?.roleIds?.[0]);
    document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = name; });
    document.querySelectorAll('[data-greeting-name]').forEach(el => { el.textContent = String(name).split(/\s+/)[0] || 'Admin'; });
    document.querySelectorAll('[data-user-role]').forEach(el => { el.textContent = role; });
    document.querySelectorAll('[data-user-initials]').forEach(el => { el.textContent = initials(name); });
    document.querySelectorAll('[data-tenant-name]').forEach(el => { if (session?.tenant?.name) el.textContent = session.tenant.name; });
    document.querySelectorAll('[data-branch-name]').forEach(el => { if (session?.branch?.name) el.textContent = session.branch.name; });
    if (session?.tenant?.themeKey && demo.themes.includes(session.tenant.themeKey)) applyTheme(session.tenant.themeKey, false);
  }

  function friendlyRole(roleId) {
    const map = {
      role_platform_super_admin: 'Super Admin SaaS',
      role_gym_owner: 'Propietario / Administrador',
      role_branch_manager: 'Gerente de sede',
      role_reception_cashier: 'Recepción / Caja'
    };
    return map[roleId] || 'Usuario';
  }

  async function hydrateSession() {
    if (api?.isEnabled?.()) {
      const stored = api.getSession();
      if (stored?.token) {
        try {
          const response = await api.request('auth.me');
          const full = { ...stored, ...response.data };
          api.setSession({ ...stored, user: full.user, tenant: full.tenant, branch: full.branch, permissions: full.permissions, roleIds: full.roleIds, expiresAt: full.expiresAt });
          applySessionToUi(full);
          return full;
        } catch (error) {
          toast(error.message || 'No fue posible recuperar la sesión.', 'danger');
        }
      }
    }

    let local = null;
    try { local = JSON.parse(localStorage.getItem('gymflow-demo-session') || 'null'); } catch (_) { local = null; }
    if (local) applySessionToUi(local);
    return local;
  }

  function formatMoney(money) {
    if (!money) return 'S/ 0';
    const amount = Number(money.cents || 0) / 100;
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: money.currency || 'PEN', maximumFractionDigits: 0 }).format(amount);
  }

  async function hydrateDashboardFromApi() {
    if (body.dataset.page !== 'admin-dashboard' || !api?.isEnabled?.() || !api.getSession()?.token) return;
    try {
      const response = await api.request('dashboard.summary');
      const data = response.data || {};
      const values = {
        activeMembers: data.activeMembers,
        monthRevenue: formatMoney(data.monthRevenue),
        checkinsToday: data.checkinsToday,
        expiring7d: data.expiring7d
      };
      Object.entries(values).forEach(([key, value]) => {
        document.querySelectorAll(`[data-kpi="${key}"]`).forEach(el => { if (value !== undefined) el.textContent = value; });
      });
      toast('Dashboard sincronizado con Apps Script.', 'success');
    } catch (error) {
      toast(`Dashboard en fallback local: ${error.message}`, 'danger');
    }
  }

  async function hydratePlatformTenants() {
    const target = document.querySelector('[data-platform-tenants]');
    if (!target) return;
    if (!api?.isEnabled?.() || !api.getSession()?.token) return;
    try {
      const response = await api.request('platform.tenants.list');
      const rows = response.data || [];
      target.innerHTML = rows.map(tenant => `
        <div class="platform-row">
          <span class="tenant-logo">${escapeHtml(initials(tenant.name))}</span>
          <div><strong>${escapeHtml(tenant.name)}</strong><small>${escapeHtml(tenant.slug)}</small></div>
          <span class="status-chip status-active">${escapeHtml(tenant.status)}</span>
          <span>${escapeHtml(tenant.themeKey)}</span>
        </div>
      `).join('');
      document.querySelector('[data-tenant-count]')?.replaceChildren(document.createTextNode(String(rows.length)));
    } catch (error) {
      toast(error.message || 'No fue posible listar gimnasios.', 'danger');
    }
  }

  function initLogout() {
    document.querySelectorAll('[data-logout]').forEach(button => {
      button.addEventListener('click', async () => {
        try { if (api?.isEnabled?.()) await api.logout(); } catch (_) {}
        localStorage.removeItem('gymflow-demo-session');
        const prefix = body.dataset.page === 'admin-dashboard' || body.dataset.page === 'super-admin-dashboard' ? '../' : '';
        window.location.href = `${prefix}login.html`;
      });
    });
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
        toast('La búsqueda global se implementará con los módulos de socios y pagos.');
      }
    });
  }

  async function boot() {
    initTheme();
    initPublicMenu();
    initReveal();
    initLogin();
    initDemoOnlyActions();
    renderAccesses();
    initSidebar();
    initGlobalSearchShortcut();
    initLogout();
    await hydrateSession();
    await Promise.all([hydrateDashboardFromApi(), hydratePlatformTenants()]);
  }

  boot();
})();
