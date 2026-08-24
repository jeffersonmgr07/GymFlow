window.GYMFLOW_DEMO = {
  users: [
    { id: 'usr_platform_superadmin', initials: 'SA', name: 'Super Admin SaaS', role: 'Super Admin SaaS', email: 'superadmin@gymflow.demo', destination: 'super-admin/dashboard.html' },
    { id: 'usr_demo_admin', initials: 'JG', name: 'Diego Salazar', role: 'Administrador', email: 'admin@gymflow.demo', destination: 'admin/dashboard.html' },
    { id: 'usr_demo_manager', initials: 'CM', name: 'Carla Mendoza', role: 'Gerente de sede', email: 'gerente@gymflow.demo', destination: 'admin/dashboard.html' },
    { id: 'usr_demo_cashier', initials: 'LR', name: 'Luis Rojas', role: 'Recepción / Caja', email: 'caja@gymflow.demo', destination: 'admin/dashboard.html' }
  ],
  accesses: [
    { initials: 'AM', name: 'Andrea Mendoza', plan: 'Flex 14 · 9/14', time: '10:21', status: 'allowed' },
    { initials: 'CM', name: 'Carlos Medina', plan: 'Full · Ilimitado', time: '10:18', status: 'allowed' },
    { initials: 'SR', name: 'Sofía Ramírez', plan: 'Plus · Ilimitado', time: '10:12', status: 'allowed' },
    { initials: 'LP', name: 'Luis Pérez', plan: 'Vence hoy', time: '10:07', status: 'warning' },
    { initials: 'JA', name: 'Jorge Arias', plan: 'Membresía vencida', time: '09:58', status: 'denied' }
  ],
  themes: ['iron', 'cyber', 'red', 'ocean', 'stone']
};
