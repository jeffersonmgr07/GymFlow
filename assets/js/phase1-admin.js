(() => {
  'use strict';
  const api = window.GymFlowApi;
  const toast = window.GymFlowToast || ((message) => console.log(message));
  const page = document.body.dataset.page || '';
  const state = { tenants: [], branches: [], users: [], roles: [], matrix: null, editing: null };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = value => { const div=document.createElement('div');div.textContent=String(value ?? '');return div.innerHTML; };
  const fmtDate = value => value ? new Intl.DateTimeFormat('es-PE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)) : '—';

  function apiReady() { return Boolean(api?.isEnabled?.() && api.getSession()?.token); }
  function setBusy(element, busy) { if (!element) return; element.disabled = busy; element.classList.toggle('is-busy', busy); }
  function openDialog(id) { const dialog=$(id); if(dialog && !dialog.open) dialog.showModal(); return dialog; }
  function closeDialog(dialog) { if(dialog?.open) dialog.close(); }
  function statusChip(status) { const value=String(status||''); const good=['ACTIVE','SUCCESS','APPLIED'].includes(value); const warn=['PENDING','WARNING','INACTIVE'].includes(value); return `<span class="status-chip ${good?'status-active':warn?'status-warning':'status-danger'}">${esc(value)}</span>`; }
  function roleName(roleId) { return state.roles.find(r=>r.roleId===roleId)?.name || roleId; }
  function branchName(branchId) { return state.branches.find(b=>b.branchId===branchId)?.name || 'Sin sede'; }

  function enforceApi() {
    const banner=$('[data-api-required]');
    if (apiReady()) { banner?.classList.add('hidden'); return true; }
    banner?.classList.remove('hidden');
    $$('[data-requires-api]').forEach(el=>{el.disabled=true;});
    return false;
  }

  async function loadTenants() {
    const response=await api.request('platform.tenants.list'); state.tenants=response.data||[]; return state.tenants;
  }
  async function loadBranches(includeInactive=true) {
    const response=await api.request('branches.list',{includeInactive}); state.branches=response.data||[]; return state.branches;
  }
  async function loadUsers(includeInactive=true) {
    const response=await api.request('users.list',{includeInactive}); state.users=response.data||[]; return state.users;
  }
  async function loadRoles() {
    const response=await api.request('roles.list'); state.roles=response.data||[]; return state.roles;
  }

  async function initTenantCrud() {
    if(!enforceApi())return;
    const tbody=$('[data-tenant-table]');
    const form=$('[data-tenant-form]');
    const dialog=$('#tenant-dialog');

    function render() {
      tbody.innerHTML=state.tenants.map(tenant=>`<tr>
        <td><div class="table-identity"><span>${esc(tenant.name.split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase())}</span><div><strong>${esc(tenant.name)}</strong><small>${esc(tenant.slug)}</small></div></div></td>
        <td>${statusChip(tenant.status)}</td><td>${esc(tenant.planKey||'INICIO')}</td><td>${esc(tenant.maxBranches||'—')}</td><td>${esc(tenant.themeKey||'iron')}</td>
        <td class="table-actions"><button class="mini-action" data-tenant-edit="${esc(tenant.tenantId)}">Editar</button><button class="mini-action ${tenant.status==='ACTIVE'?'danger':''}" data-tenant-status="${esc(tenant.tenantId)}" data-next="${tenant.status==='ACTIVE'?'SUSPENDED':'ACTIVE'}">${tenant.status==='ACTIVE'?'Suspender':'Reactivar'}</button></td>
      </tr>`).join('') || '<tr><td colspan="6"><div class="empty-inline">No hay gimnasios registrados.</div></td></tr>';
      $$('[data-tenant-edit]').forEach(btn=>btn.addEventListener('click',()=>editTenant(btn.dataset.tenantEdit)));
      $$('[data-tenant-status]').forEach(btn=>btn.addEventListener('click',()=>changeTenantStatus(btn)));
      $('[data-total-tenants]')?.replaceChildren(document.createTextNode(String(state.tenants.length)));
      $('[data-active-tenants]')?.replaceChildren(document.createTextNode(String(state.tenants.filter(t=>t.status==='ACTIVE').length)));
    }

    function editTenant(id) {
      const tenant=state.tenants.find(t=>t.tenantId===id);if(!tenant)return;state.editing=id;
      form.reset();
      Object.entries({name:tenant.name,slug:tenant.slug,themeKey:tenant.themeKey,currency:tenant.currency,locale:tenant.locale,timezone:tenant.timezone,planKey:tenant.planKey,maxBranches:tenant.maxBranches,maxActiveMembers:tenant.maxActiveMembers}).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=v??'';});
      $('[data-tenant-owner-fields]')?.classList.add('hidden');
      $('#tenant-dialog-title').textContent='Editar gimnasio';openDialog('#tenant-dialog');
    }

    async function changeTenantStatus(button) {
      const tenant=state.tenants.find(t=>t.tenantId===button.dataset.tenantStatus);if(!tenant)return;
      const next=button.dataset.next;let reason='';
      if(next==='SUSPENDED'){reason=window.prompt(`Motivo de suspensión de ${tenant.name}:`,'Suspensión administrativa')||'';if(!reason)return;}
      if(!window.confirm(`${next==='SUSPENDED'?'Suspender':'Reactivar'} ${tenant.name}?`))return;
      setBusy(button,true);try{await api.request('platform.tenants.status',{tenantId:tenant.tenantId,status:next,reason});await loadTenants();render();toast(`Gimnasio ${next==='ACTIVE'?'reactivado':'suspendido'}.`,'success');}catch(error){toast(error.message,'danger');}finally{setBusy(button,false);}
    }

    $('[data-new-tenant]')?.addEventListener('click',()=>{state.editing=null;form.reset();$('[data-tenant-owner-fields]')?.classList.remove('hidden');$('#tenant-dialog-title').textContent='Nuevo gimnasio';openDialog('#tenant-dialog');});
    $$('[data-dialog-close]',dialog).forEach(btn=>btn.addEventListener('click',()=>closeDialog(dialog)));
    form?.addEventListener('submit',async event=>{
      event.preventDefault();const submit=form.querySelector('button[type="submit"]');setBusy(submit,true);
      const data=Object.fromEntries(new FormData(form).entries());data.maxBranches=Number(data.maxBranches||1);data.maxActiveMembers=Number(data.maxActiveMembers||150);
      try{if(state.editing)await api.request('platform.tenants.update',{tenantId:state.editing,...data});else await api.request('platform.tenants.create',data);closeDialog(dialog);await loadTenants();render();toast(state.editing?'Gimnasio actualizado.':'Gimnasio creado con sede principal y propietario.','success');}
      catch(error){toast(error.message,'danger');}finally{setBusy(submit,false);}
    });
    await loadTenants();render();
  }

  async function initBranchCrud() {
    if(!enforceApi())return;
    const tbody=$('[data-branch-table]');const form=$('[data-branch-form]');const dialog=$('#branch-dialog');
    function render(){tbody.innerHTML=state.branches.map(branch=>`<tr><td><strong>${esc(branch.name)}</strong><small class="cell-sub">${esc(branch.code)}</small></td><td>${statusChip(branch.status)}</td><td>${esc(branch.addressText||'—')}</td><td>${esc(branch.timezone||'—')}</td><td class="table-actions"><button class="mini-action" data-branch-edit="${esc(branch.branchId)}">Editar</button><button class="mini-action ${branch.status==='ACTIVE'?'danger':''}" data-branch-status="${esc(branch.branchId)}" data-next="${branch.status==='ACTIVE'?'SUSPENDED':'ACTIVE'}">${branch.status==='ACTIVE'?'Suspender':'Reactivar'}</button></td></tr>`).join('');
      $$('[data-branch-edit]').forEach(btn=>btn.addEventListener('click',()=>{const b=state.branches.find(x=>x.branchId===btn.dataset.branchEdit);state.editing=b.branchId;form.reset();['name','code','timezone','phone','email'].forEach(k=>{if(form.elements[k])form.elements[k].value=b[k]||'';});form.elements.addressText.value=b.addressText||'';$('#branch-dialog-title').textContent='Editar sede';openDialog('#branch-dialog');}));
      $$('[data-branch-status]').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('¿Confirmar cambio de estado de la sede?'))return;setBusy(btn,true);try{await api.request('branches.status',{branchId:btn.dataset.branchStatus,status:btn.dataset.next});await loadBranches();render();toast('Estado de sede actualizado.','success');}catch(e){toast(e.message,'danger');}finally{setBusy(btn,false);}}));
      $('[data-total-branches]')?.replaceChildren(document.createTextNode(String(state.branches.length)));
      $('[data-active-branches]')?.replaceChildren(document.createTextNode(String(state.branches.filter(b=>b.status==='ACTIVE').length)));
    }
    $('[data-new-branch]')?.addEventListener('click',()=>{state.editing=null;form.reset();form.elements.timezone.value='America/Lima';$('#branch-dialog-title').textContent='Nueva sede';openDialog('#branch-dialog');});
    $$('[data-dialog-close]',dialog).forEach(btn=>btn.addEventListener('click',()=>closeDialog(dialog)));
    form?.addEventListener('submit',async event=>{event.preventDefault();const submit=form.querySelector('button[type="submit"]');setBusy(submit,true);const data=Object.fromEntries(new FormData(form).entries());try{if(state.editing)await api.request('branches.update',{branchId:state.editing,...data});else await api.request('branches.create',data);closeDialog(dialog);await loadBranches();render();toast(state.editing?'Sede actualizada.':'Sede creada.','success');}catch(e){toast(e.message,'danger');}finally{setBusy(submit,false);}});
    await loadBranches();render();
  }

  function roleCheckboxes(selected=[]) {
    return state.roles.map(role=>`<label class="role-check"><input type="checkbox" name="roleIds" value="${esc(role.roleId)}" ${selected.includes(role.roleId)?'checked':''}><span><strong>${esc(role.name)}</strong><small>${esc(role.description||'')}</small></span></label>`).join('');
  }

  async function initUserCrud() {
    if(!enforceApi())return;
    await Promise.all([loadBranches(),loadRoles(),loadUsers()]);
    const tbody=$('[data-user-table]');const form=$('[data-user-form]');const dialog=$('#user-dialog');
    function render(){tbody.innerHTML=state.users.map(user=>`<tr><td><div class="table-identity"><span>${esc((user.displayName||'U').split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase())}</span><div><strong>${esc(user.displayName)}</strong><small>${esc(user.email)}</small></div></div></td><td>${esc(branchName(user.branchId))}</td><td><div class="role-tags">${(user.roleIds||[]).map(r=>`<span>${esc(roleName(r))}</span>`).join('')}</div></td><td>${statusChip(user.status)}</td><td>${user.authBound?'<span class="status-chip status-active">Firebase vinculado</span>':'<span class="status-chip status-warning">Pendiente Firebase</span>'}</td><td class="table-actions"><button class="mini-action" data-user-edit="${esc(user.userId)}">Editar</button><button class="mini-action ${user.status==='ACTIVE'?'danger':''}" data-user-status="${esc(user.userId)}" data-next="${user.status==='ACTIVE'?'SUSPENDED':'ACTIVE'}">${user.status==='ACTIVE'?'Suspender':'Reactivar'}</button></td></tr>`).join('');
      $$('[data-user-edit]').forEach(btn=>btn.addEventListener('click',()=>editUser(btn.dataset.userEdit)));
      $$('[data-user-status]').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('¿Confirmar cambio de estado del usuario?'))return;setBusy(btn,true);try{await api.request('users.status',{userId:btn.dataset.userStatus,status:btn.dataset.next});await loadUsers();render();toast('Usuario actualizado.','success');}catch(e){toast(e.message,'danger');}finally{setBusy(btn,false);}}));
      $('[data-total-users]')?.replaceChildren(document.createTextNode(String(state.users.length)));
      $('[data-active-users]')?.replaceChildren(document.createTextNode(String(state.users.filter(u=>u.status==='ACTIVE').length)));
    }
    function fillSelectors(user){form.elements.branchId.innerHTML=state.branches.filter(b=>b.status==='ACTIVE').map(b=>`<option value="${esc(b.branchId)}" ${user?.branchId===b.branchId?'selected':''}>${esc(b.name)}</option>`).join('');$('[data-role-picker]',form).innerHTML=roleCheckboxes(user?.roleIds||[]);}
    function editUser(id){const user=state.users.find(u=>u.userId===id);state.editing=id;form.reset();form.elements.displayName.value=user.displayName||'';form.elements.publicName.value=user.publicName||'';form.elements.email.value=user.email||'';form.elements.avatarUrl.value=user.avatarUrl||'';fillSelectors(user);$('#user-dialog-title').textContent='Editar usuario';openDialog('#user-dialog');}
    $('[data-new-user]')?.addEventListener('click',()=>{state.editing=null;form.reset();fillSelectors(null);$('#user-dialog-title').textContent='Nuevo usuario';openDialog('#user-dialog');});
    $$('[data-dialog-close]',dialog).forEach(btn=>btn.addEventListener('click',()=>closeDialog(dialog)));
    form?.addEventListener('submit',async event=>{event.preventDefault();const submit=form.querySelector('button[type="submit"]');setBusy(submit,true);const fd=new FormData(form);const data=Object.fromEntries(fd.entries());data.roleIds=fd.getAll('roleIds');try{if(state.editing)await api.request('users.update',{userId:state.editing,...data});else await api.request('users.create',data);closeDialog(dialog);await loadUsers();render();toast(state.editing?'Usuario actualizado; sus sesiones previas fueron revocadas.':'Usuario creado y pendiente de vinculación Firebase.','success');}catch(e){toast(e.message,'danger');}finally{setBusy(submit,false);}});
    render();
  }

  async function initPermissionMatrix(platformMode) {
    if(!enforceApi())return;
    const target=$('[data-permission-matrix]');
    try{const response=await api.request('permissions.matrix');state.matrix=response.data;const matrix=state.matrix;const editable=platformMode&&matrix.editable;
      const head=`<tr><th>Permiso</th>${matrix.roles.map(r=>`<th title="${esc(r.description)}">${esc(r.name)}</th>`).join('')}</tr>`;
      const rows=matrix.permissions.map(permission=>`<tr><td><strong>${esc(permission.code)}</strong><small class="cell-sub">${esc(permission.description)}</small></td>${matrix.roles.map(role=>{const checked=(matrix.grants[role.roleId]||[]).includes(permission.permissionId);return `<td class="permission-cell"><input type="checkbox" data-matrix-role="${esc(role.roleId)}" data-matrix-code="${esc(permission.code)}" ${checked?'checked':''} ${editable?'':'disabled'}></td>`;}).join('')}</tr>`).join('');
      target.innerHTML=`<table class="data-table permission-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
      $('[data-matrix-mode]')?.replaceChildren(document.createTextNode(editable?'Editable por Super Admin SaaS':'Solo lectura para el tenant'));
      if(editable)$('[data-save-matrix]')?.classList.remove('hidden');else $('[data-save-matrix]')?.classList.add('hidden');
      $('[data-save-matrix]')?.addEventListener('click',async buttonEvent=>{const button=buttonEvent.currentTarget;setBusy(button,true);try{for(const role of matrix.roles){const codes=$$(`[data-matrix-role="${CSS.escape(role.roleId)}"]`).filter(i=>i.checked).map(i=>i.dataset.matrixCode);await api.request('platform.permissions.matrix.update',{roleId:role.roleId,permissionCodes:codes});}toast('Matriz guardada. Las sesiones de roles modificados fueron revocadas.','success');}catch(e){toast(e.message,'danger');}finally{setBusy(button,false);}});
    }catch(e){target.innerHTML=`<div class="empty-inline">${esc(e.message)}</div>`;toast(e.message,'danger');}
  }

  async function initSettings() {
    if(!enforceApi())return;
    const brandForm=$('[data-branding-form]');const locForm=$('[data-localization-form]');
    try{const response=await api.request('tenant.settings.get');const settings=response.data||{};const b=settings.branding||{};const l=settings.localization||{};
      ['brandName','slogan','logoUrl','logoDarkUrl','faviconUrl','themeKey'].forEach(k=>{if(brandForm.elements[k])brandForm.elements[k].value=b[k]||'';});
      ['currency','locale','timezone'].forEach(k=>{if(locForm.elements[k])locForm.elements[k].value=l[k]||'';});
      Object.entries(b.customColors||{}).forEach(([k,v])=>{const el=brandForm.elements[`color_${k}`];if(el)el.value=v;});renderBrandPreview(b);
    }catch(e){toast(e.message,'danger');}
    function renderBrandPreview(b){$('[data-brand-preview-name]').textContent=b.brandName||'GymFlow Gym';$('[data-brand-preview-slogan]').textContent=b.slogan||'Tu gimnasio, conectado.';const accent=b.customColors?.accent;if(accent)$('[data-brand-preview]').style.setProperty('--preview-accent',accent);}
    brandForm?.addEventListener('input',()=>{const fd=new FormData(brandForm);renderBrandPreview({brandName:fd.get('brandName'),slogan:fd.get('slogan'),customColors:{accent:fd.get('color_accent')}});});
    brandForm?.addEventListener('submit',async event=>{event.preventDefault();const submit=brandForm.querySelector('button[type="submit"]');setBusy(submit,true);const fd=new FormData(brandForm);const value={brandName:fd.get('brandName'),slogan:fd.get('slogan'),logoUrl:fd.get('logoUrl'),logoDarkUrl:fd.get('logoDarkUrl'),faviconUrl:fd.get('faviconUrl'),themeKey:fd.get('themeKey'),customColors:{accent:fd.get('color_accent'),primary:fd.get('color_primary'),background:fd.get('color_background'),surface:fd.get('color_surface')}};try{await api.request('tenant.settings.update',{key:'branding',value});toast('Marca blanca guardada.','success');}catch(e){toast(e.message,'danger');}finally{setBusy(submit,false);}});
    locForm?.addEventListener('submit',async event=>{event.preventDefault();const submit=locForm.querySelector('button[type="submit"]');setBusy(submit,true);const value=Object.fromEntries(new FormData(locForm).entries());try{await api.request('tenant.settings.update',{key:'localization',value});toast('Localización guardada.','success');}catch(e){toast(e.message,'danger');}finally{setBusy(submit,false);}});
  }

  async function initAudit() {
    if(!enforceApi())return;const tbody=$('[data-audit-table]');
    async function load(){try{const response=await api.request('audit.list',{limit:100});const rows=response.data||[];tbody.innerHTML=rows.map(row=>`<tr><td>${fmtDate(row.occurredAt)}</td><td><strong>${esc(row.action)}</strong><small class="cell-sub">${esc(row.module)}</small></td><td>${esc(row.entity||'—')}<small class="cell-sub">${esc(row.recordId||'')}</small></td><td>${esc(row.userId||'system')}</td><td>${statusChip(row.result||'SUCCESS')}</td><td><button class="mini-action" data-audit-detail="${esc(row.auditId)}">Detalle</button></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty-inline">Todavía no hay eventos de auditoría.</div></td></tr>';$$('[data-audit-detail]').forEach(btn=>btn.addEventListener('click',()=>{const row=rows.find(r=>r.auditId===btn.dataset.auditDetail);$('#audit-detail-json').textContent=JSON.stringify(row,null,2);openDialog('#audit-dialog');}));$('[data-audit-count]')?.replaceChildren(document.createTextNode(String(rows.length)));}catch(e){toast(e.message,'danger');}}
    $('[data-refresh-audit]')?.addEventListener('click',load);$$('[data-dialog-close]',$('#audit-dialog')).forEach(btn=>btn.addEventListener('click',()=>closeDialog($('#audit-dialog'))));await load();
  }

  async function boot() {
    try {
      if(page==='super-admin-tenants')await initTenantCrud();
      if(page==='admin-branches')await initBranchCrud();
      if(page==='admin-users')await initUserCrud();
      if(page==='admin-permissions')await initPermissionMatrix(false);
      if(page==='super-admin-permissions')await initPermissionMatrix(true);
      if(page==='admin-settings')await initSettings();
      if(page==='admin-audit'||page==='super-admin-audit')await initAudit();
    } catch (error) { toast(error.message||'No fue posible inicializar el módulo.','danger'); }
  }

  // app.js hidrata sesión primero; pequeño defer para que el token/UI esté listo.
  window.setTimeout(boot, 120);
})();
