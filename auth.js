/* ============================================================
   CLOUD'S VISTA — AUTH ENGINE (auth.js)
   Session, nav injection, fully functional account modal
============================================================ */

// ── SESSION HELPERS ───────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem('cv_user') || 'null'); } catch { return null; }
}
function saveUser(user) { localStorage.setItem('cv_user', JSON.stringify(user)); }
function logoutUser() {
  localStorage.removeItem('cv_user');
  sessionStorage.removeItem('cv_cart');
  showToast('<i class="fa-solid fa-circle-check"></i>&nbsp; Signed out successfully.');
  setTimeout(() => window.location.href = 'index.html', 800);
}

// ── REGISTERED USERS (localStorage DB) ────────────────────
function getUsers() { try { return JSON.parse(localStorage.getItem('cv_users') || '[]'); } catch { return []; } }
function saveUsers(u) { localStorage.setItem('cv_users', JSON.stringify(u)); }
function findUser(email) { return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()); }
function registerUser(name, email, phone, password) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return false;
  users.push({ name, email, phone, password: btoa(password), joined: new Date().toISOString() });
  saveUsers(users); return true;
}
function authenticateUser(email, password) {
  const user = findUser(email);
  if (!user || user.password !== btoa(password)) return null;
  return user;
}
function updateUserRecord(email, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return false;
  Object.assign(users[idx], updates);
  saveUsers(users);
  const session = getUser();
  if (session) saveUser({ ...session, ...updates });
  return true;
}

// ── ORDER HISTORY ─────────────────────────────────────────
function getOrders() { try { return JSON.parse(localStorage.getItem('cv_order_history') || '[]'); } catch { return []; } }
function getReservations() { try { return JSON.parse(localStorage.getItem('cv_reservations') || '[]'); } catch { return []; } }

// ── FORMAT DATE HELPER ────────────────────────────────────
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch { return iso; }
}

// ── NAV INJECTION ──────────────────────────────────────────
function injectNavAuth() {
  const hamburger = document.getElementById('hamburger');
  if (!hamburger) return;
  const user = getUser();
  const wrapper = document.createElement('div');
  wrapper.id = 'nav-auth-wrapper';
  wrapper.style.cssText = 'display:flex; align-items:center;';

  if (user) {
    wrapper.innerHTML = `
      <div class="nav-account-wrap" id="nav-account-wrap">
        <button class="nav-account-btn" aria-label="Account menu" aria-haspopup="true">
          <i class="fa-solid fa-circle-user"></i>
          <span>${user.name.split(' ')[0]}</span>
          <i class="fa-solid fa-chevron-down" style="font-size:0.6rem;"></i>
        </button>
        <div class="nav-account-dropdown" role="menu">
          <a href="#" onclick="openAccountModal('profile'); return false;" role="menuitem">
            <i class="fa-solid fa-user"></i> My Profile
          </a>
          <a href="#" onclick="openAccountModal('orders'); return false;" role="menuitem">
            <i class="fa-solid fa-receipt"></i> My Orders
          </a>
          <a href="#" onclick="openAccountModal('reservations'); return false;" role="menuitem">
            <i class="fa-regular fa-calendar"></i> My Reservations
          </a>
          <a href="#" onclick="openAccountModal('password'); return false;" role="menuitem">
            <i class="fa-solid fa-key"></i> Change Password
          </a>
          <hr class="dropdown-divider" />
          <button onclick="logoutUser()" role="menuitem">
            <i class="fa-solid fa-right-from-bracket"></i> Sign Out
          </button>
        </div>
      </div>`;
  } else {
    wrapper.innerHTML = `<a href="auth.html" class="nav-auth" aria-label="Login">
        <i class="fa-solid fa-circle-user"></i> Login
      </a>`;
  }
  hamburger.parentNode.insertBefore(wrapper, hamburger);

  // Mobile menu auth info
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    const el = document.createElement('div');
    el.style.cssText = 'margin-top:8px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08);';
    el.innerHTML = user
      ? `<span style="font-size:1rem; color:var(--gold); display:block; margin-bottom:8px;">
           <i class="fa-solid fa-circle-user"></i> Hi, ${user.name.split(' ')[0]}
         </span>
         <a href="#" onclick="openAccountModal('profile'); return false;" style="font-size:0.9rem; color:var(--cream-dim); display:block; margin-bottom:6px;">
           <i class="fa-solid fa-user"></i> My Account
         </a>
         <a href="#" onclick="logoutUser()" style="font-size:0.9rem; color:var(--cream-dim); display:block;">
           <i class="fa-solid fa-right-from-bracket"></i> Sign Out
         </a>`
      : `<a href="auth.html" style="color:var(--gold); font-size:1.1rem;">
           <i class="fa-solid fa-circle-user"></i> Login / Sign Up
         </a>`;
    mobileMenu.appendChild(el);
  }
}

// ── ACCOUNT MODAL ──────────────────────────────────────────
function openAccountModal(tab) {
  tab = tab || 'profile';
  document.getElementById('account-modal-overlay')?.remove();

  const user = getUser();
  if (!user) { window.location.href = 'auth.html'; return; }

  const orders       = getOrders();
  const reservations = getReservations();

  // Build orders HTML
  const ordersHTML = orders.length === 0
    ? `<div style="text-align:center; padding:32px 0; color:var(--cream-dim);">
         <i class="fa-solid fa-receipt" style="font-size:2.5rem; opacity:0.3; display:block; margin-bottom:12px;"></i>
         <p style="font-size:0.9rem;">No orders yet.</p>
         <a href="menu.html" style="color:var(--gold); font-size:0.85rem; margin-top:8px; display:inline-block;">
           <i class="fa-solid fa-utensils"></i> Browse the Menu
         </a>
       </div>`
    : orders.map(o => `
        <div style="padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <span style="font-size:0.78rem; font-weight:700; color:var(--gold); letter-spacing:0.08em;">${o.id}</span>
            <span style="font-size:0.72rem; padding:2px 10px; border-radius:20px; font-weight:600;
              background:${o.status==='Paid' ? 'rgba(110,231,183,0.12)' : 'rgba(251,191,36,0.12)'};
              color:${o.status==='Paid' ? '#6EE7B7' : '#FBBF24'};
              border:1px solid ${o.status==='Paid' ? 'rgba(110,231,183,0.25)' : 'rgba(251,191,36,0.25)'};">
              ${o.status}
            </span>
          </div>
          <div style="font-size:0.82rem; color:var(--cream-dim); margin-bottom:4px;">${fmtDate(o.date)}</div>
          <div style="font-size:0.82rem; color:var(--cream-dim);">
            ${o.items.map(i => `${i.qty}× ${i.name}`).join(' · ')}
          </div>
          <div style="font-size:0.95rem; font-weight:700; color:var(--cream); margin-top:4px;">
            ₦${o.total.toLocaleString()}
            <span style="font-size:0.72rem; color:var(--cream-dim); font-weight:400; margin-left:6px;">via ${o.method}</span>
          </div>
        </div>`).join('');

  // Build reservations HTML
  const resvHTML = reservations.length === 0
    ? `<div style="text-align:center; padding:32px 0; color:var(--cream-dim);">
         <i class="fa-regular fa-calendar" style="font-size:2.5rem; opacity:0.3; display:block; margin-bottom:12px;"></i>
         <p style="font-size:0.9rem;">No reservations found.</p>
         <a href="reservation.html" style="color:var(--gold); font-size:0.85rem; margin-top:8px; display:inline-block;">
           <i class="fa-regular fa-calendar-plus"></i> Book a Table
         </a>
       </div>`
    : reservations.map(r => `
        <div style="padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <span style="font-size:0.88rem; font-weight:600; color:var(--cream);">${r.date}</span>
            <span style="font-size:0.72rem; padding:2px 10px; border-radius:20px; font-weight:600;
              background:rgba(200,151,58,0.12); color:var(--gold); border:1px solid rgba(200,151,58,0.25);">
              Confirmed
            </span>
          </div>
          <div style="font-size:0.82rem; color:var(--cream-dim);">
            <i class="fa-regular fa-clock" style="color:var(--gold); width:14px;"></i> ${r.time} &nbsp;·&nbsp;
            <i class="fa-solid fa-users" style="color:var(--gold); width:14px;"></i> ${r.guests} guest${r.guests > 1 ? 's' : ''}
            ${r.occasion ? `&nbsp;·&nbsp; <i class="fa-solid fa-champagne-glasses" style="color:var(--gold);"></i> ${r.occasion}` : ''}
          </div>
          ${r.requests ? `<div style="font-size:0.78rem; color:var(--cream-dim); margin-top:4px; font-style:italic;">"${r.requests}"</div>` : ''}
        </div>`).join('');

  const html = `
  <div class="item-modal-overlay" id="account-modal-overlay" style="z-index:1500; align-items:flex-start; padding-top:80px;"
       onclick="if(event.target===this)closeAccountModal()">
    <div class="item-modal" style="max-width:540px; max-height:82vh; display:flex; flex-direction:column;">

      <!-- Header -->
      <div style="padding:28px 28px 0; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,var(--gold),var(--navy)); display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-size:1.3rem; font-weight:700; color:var(--charcoal); flex-shrink:0;">
            ${user.name[0].toUpperCase()}
          </div>
          <div>
            <div style="font-family:var(--font-display); font-size:1.2rem; font-weight:600; color:var(--cream);">${user.name}</div>
            <div style="font-size:0.78rem; color:var(--cream-dim);">${user.email}</div>
          </div>
        </div>
        <button onclick="closeAccountModal()" style="width:34px; height:34px; border-radius:50%; background:var(--glass); border:1px solid var(--glass-border); color:var(--cream-dim); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:var(--transition); flex-shrink:0;" onmouseover="this.style.color='#FC6450'" onmouseout="this.style.color='var(--cream-dim)'">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Tabs -->
      <div style="display:flex; border-bottom:1px solid var(--glass-border); margin:16px 28px 0; flex-shrink:0; gap:0; overflow-x:auto;">
        ${[
          ['profile',      'fa-user',         'Profile'],
          ['orders',       'fa-receipt',      'Orders'],
          ['reservations', 'fa-calendar',     'Bookings'],
          ['password',     'fa-key',          'Password'],
        ].map(([id, icon, label]) => `
          <button onclick="switchAccountTab('${id}')" id="acct-tab-${id}"
            style="padding:10px 14px; background:none; border:none; border-bottom:2px solid ${id===tab ? 'var(--gold)' : 'transparent'};
                   color:${id===tab ? 'var(--gold)' : 'var(--cream-dim)'}; font-family:var(--font-body); font-size:0.75rem;
                   font-weight:700; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; white-space:nowrap;
                   margin-bottom:-1px; transition:all 0.2s; display:flex; align-items:center; gap:6px;"
            onmouseover="if(this.style.borderBottomColor !== 'var(--gold)'){this.style.color='var(--cream)';}"
            onmouseout="if(this.style.borderBottomColor !== 'rgb(200,151,58)'){this.style.color='var(--cream-dim)';}">
            <i class="fa-${icon.includes('calendar') ? 'regular' : 'solid'} fa-${icon}"></i> ${label}
          </button>`).join('')}
      </div>

      <!-- Tab content (scrollable) -->
      <div style="flex:1; overflow-y:auto; padding:20px 28px 28px;">

        <!-- PROFILE TAB -->
        <div id="acct-panel-profile" style="display:${tab==='profile'?'block':'none'}">
          <div id="profile-msg" style="display:none; margin-bottom:14px;"></div>
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="display:block; font-size:0.72rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--cream-dim); margin-bottom:7px;">Full Name</label>
              <div style="position:relative;">
                <i class="fa-solid fa-user" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--cream-dim); font-size:0.9rem;"></i>
                <input id="edit-name" type="text" value="${user.name}"
                  style="width:100%; background:rgba(15,26,36,0.7); border:1px solid var(--glass-border); border-radius:var(--radius-sm); padding:12px 14px 12px 38px; color:var(--cream); font-family:var(--font-body); font-size:0.9rem; outline:none;"
                  onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--glass-border)'" />
              </div>
            </div>
            <div>
              <label style="display:block; font-size:0.72rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--cream-dim); margin-bottom:7px;">Email Address</label>
              <div style="position:relative;">
                <i class="fa-solid fa-envelope" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--cream-dim); font-size:0.9rem;"></i>
                <input id="edit-email" type="email" value="${user.email}"
                  style="width:100%; background:rgba(15,26,36,0.7); border:1px solid var(--glass-border); border-radius:var(--radius-sm); padding:12px 14px 12px 38px; color:var(--cream); font-family:var(--font-body); font-size:0.9rem; outline:none;"
                  onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--glass-border)'" />
              </div>
            </div>
            <div>
              <label style="display:block; font-size:0.72rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--cream-dim); margin-bottom:7px;">Phone Number</label>
              <div style="position:relative;">
                <i class="fa-solid fa-phone" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--cream-dim); font-size:0.9rem;"></i>
                <input id="edit-phone" type="tel" value="${user.phone || ''}" placeholder="08XX XXX XXXX"
                  style="width:100%; background:rgba(15,26,36,0.7); border:1px solid var(--glass-border); border-radius:var(--radius-sm); padding:12px 14px 12px 38px; color:var(--cream); font-family:var(--font-body); font-size:0.9rem; outline:none;"
                  onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--glass-border)'" />
              </div>
            </div>
          </div>
          <div style="display:flex; gap:10px; margin-top:20px;">
            <button onclick="saveProfile()" class="btn btn-gold" style="flex:1; justify-content:center; font-size:0.82rem;">
              <i class="fa-solid fa-floppy-disk"></i> Save Changes
            </button>
            <a href="menu.html" class="btn btn-ghost" style="flex:1; justify-content:center; font-size:0.82rem; text-decoration:none;">
              <i class="fa-solid fa-utensils"></i> Order Food
            </a>
          </div>
          <button onclick="logoutUser()" style="width:100%; margin-top:12px; padding:11px; border-radius:50px; background:rgba(252,100,80,0.08); border:1px solid rgba(252,100,80,0.2); color:#FC6450; font-family:var(--font-body); font-size:0.82rem; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:var(--transition);"
            onmouseover="this.style.background='rgba(252,100,80,0.16)'" onmouseout="this.style.background='rgba(252,100,80,0.08)'">
            <i class="fa-solid fa-right-from-bracket"></i> Sign Out
          </button>
        </div>

        <!-- ORDERS TAB -->
        <div id="acct-panel-orders" style="display:${tab==='orders'?'block':'none'}">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
            <h4 style="font-family:var(--font-display); font-size:1.1rem; color:var(--cream);">
              Order History <span style="font-family:var(--font-body); font-size:0.8rem; color:var(--cream-dim); font-weight:400;">(${orders.length} order${orders.length !== 1 ? 's' : ''})</span>
            </h4>
            <a href="menu.html" class="btn btn-gold" style="font-size:0.72rem; padding:8px 16px;">
              <i class="fa-solid fa-cart-plus"></i> Order Again
            </a>
          </div>
          ${ordersHTML}
        </div>

        <!-- RESERVATIONS TAB -->
        <div id="acct-panel-reservations" style="display:${tab==='reservations'?'block':'none'}">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
            <h4 style="font-family:var(--font-display); font-size:1.1rem; color:var(--cream);">
              Reservations <span style="font-family:var(--font-body); font-size:0.8rem; color:var(--cream-dim); font-weight:400;">(${reservations.length})</span>
            </h4>
            <a href="reservation.html" class="btn btn-gold" style="font-size:0.72rem; padding:8px 16px;">
              <i class="fa-regular fa-calendar-plus"></i> Book a Table
            </a>
          </div>
          ${resvHTML}
        </div>

        <!-- PASSWORD TAB -->
        <div id="acct-panel-password" style="display:${tab==='password'?'block':'none'}">
          <h4 style="font-family:var(--font-display); font-size:1.1rem; color:var(--cream); margin-bottom:16px;">Change Password</h4>
          <div id="pass-change-msg" style="display:none; margin-bottom:14px;"></div>
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="display:block; font-size:0.72rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--cream-dim); margin-bottom:7px;">Current Password</label>
              <div style="position:relative;">
                <i class="fa-solid fa-lock" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--cream-dim); font-size:0.9rem;"></i>
                <input id="chg-current" type="password" placeholder="Your current password"
                  style="width:100%; background:rgba(15,26,36,0.7); border:1px solid var(--glass-border); border-radius:var(--radius-sm); padding:12px 14px 12px 38px; color:var(--cream); font-family:var(--font-body); font-size:0.9rem; outline:none;"
                  onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--glass-border)'" />
              </div>
            </div>
            <div>
              <label style="display:block; font-size:0.72rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--cream-dim); margin-bottom:7px;">New Password</label>
              <div style="position:relative;">
                <i class="fa-solid fa-lock" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--cream-dim); font-size:0.9rem;"></i>
                <input id="chg-new" type="password" placeholder="Min. 8 characters"
                  style="width:100%; background:rgba(15,26,36,0.7); border:1px solid var(--glass-border); border-radius:var(--radius-sm); padding:12px 14px 12px 38px; color:var(--cream); font-family:var(--font-body); font-size:0.9rem; outline:none;"
                  onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--glass-border)'" />
              </div>
            </div>
            <div>
              <label style="display:block; font-size:0.72rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--cream-dim); margin-bottom:7px;">Confirm New Password</label>
              <div style="position:relative;">
                <i class="fa-solid fa-lock" style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--cream-dim); font-size:0.9rem;"></i>
                <input id="chg-confirm" type="password" placeholder="Repeat new password"
                  style="width:100%; background:rgba(15,26,36,0.7); border:1px solid var(--glass-border); border-radius:var(--radius-sm); padding:12px 14px 12px 38px; color:var(--cream); font-family:var(--font-body); font-size:0.9rem; outline:none;"
                  onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--glass-border)'" />
              </div>
            </div>
          </div>
          <button onclick="changePassword()" class="btn btn-gold" style="width:100%; justify-content:center; margin-top:20px; font-size:0.85rem;">
            <i class="fa-solid fa-key"></i> Update Password
          </button>
        </div>

      </div><!-- /scrollable content -->
    </div><!-- /item-modal -->
  </div><!-- /overlay -->`;

  document.body.insertAdjacentHTML('beforeend', html);
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('account-modal-overlay')?.classList.add('open'), 10);
}

function closeAccountModal() {
  const el = document.getElementById('account-modal-overlay');
  if (!el) return;
  el.classList.remove('open');
  setTimeout(() => { el.remove(); document.body.style.overflow = ''; }, 300);
}

function switchAccountTab(tab) {
  ['profile','orders','reservations','password'].forEach(id => {
    const panel = document.getElementById('acct-panel-' + id);
    const btn   = document.getElementById('acct-tab-' + id);
    if (!panel || !btn) return;
    const active = id === tab;
    panel.style.display = active ? 'block' : 'none';
    btn.style.borderBottomColor = active ? 'var(--gold)' : 'transparent';
    btn.style.color = active ? 'var(--gold)' : 'var(--cream-dim)';
  });
}

// ── SAVE PROFILE ───────────────────────────────────────────
function saveProfile() {
  const user  = getUser();
  const name  = document.getElementById('edit-name')?.value.trim();
  const email = document.getElementById('edit-email')?.value.trim();
  const phone = document.getElementById('edit-phone')?.value.trim();
  const msgEl = document.getElementById('profile-msg');
  if (!name || !email) {
    showProfileMsg('error', 'Name and email are required.'); return;
  }
  if (!email.includes('@')) {
    showProfileMsg('error', 'Please enter a valid email address.'); return;
  }
  updateUserRecord(user.email, { name, email, phone });
  showProfileMsg('success', '<i class="fa-solid fa-circle-check"></i> Profile updated successfully!');
  // Refresh dropdown name
  const nameEl = document.querySelector('.nav-account-btn span');
  if (nameEl) nameEl.textContent = name.split(' ')[0];
}

function showProfileMsg(type, html) {
  const el = document.getElementById('profile-msg');
  if (!el) return;
  const isSuccess = type === 'success';
  el.style.cssText = `display:block; padding:10px 14px; border-radius:8px; font-size:0.83rem; margin-bottom:14px;
    background:${isSuccess ? 'rgba(110,231,183,0.08)' : 'rgba(252,100,80,0.08)'};
    border:1px solid ${isSuccess ? 'rgba(110,231,183,0.25)' : 'rgba(252,100,80,0.25)'};
    color:${isSuccess ? '#6EE7B7' : '#FC6450'};`;
  el.innerHTML = html;
}

// ── CHANGE PASSWORD ────────────────────────────────────────
function changePassword() {
  const user    = getUser();
  const current = document.getElementById('chg-current')?.value;
  const newPass = document.getElementById('chg-new')?.value;
  const confirm = document.getElementById('chg-confirm')?.value;
  const msg = id => document.getElementById('pass-change-msg');

  function showMsg(type, text) {
    const el = document.getElementById('pass-change-msg');
    if (!el) return;
    const ok = type === 'success';
    el.style.cssText = `display:block; padding:10px 14px; border-radius:8px; font-size:0.83rem; margin-bottom:14px;
      background:${ok ? 'rgba(110,231,183,0.08)' : 'rgba(252,100,80,0.08)'};
      border:1px solid ${ok ? 'rgba(110,231,183,0.25)' : 'rgba(252,100,80,0.25)'};
      color:${ok ? '#6EE7B7' : '#FC6450'};`;
    el.innerHTML = text;
  }

  // Verify current password
  const dbUser = findUser(user.email);
  if (!dbUser || dbUser.password !== btoa(current)) {
    showMsg('error', 'Current password is incorrect.'); return;
  }
  if (!newPass || newPass.length < 8) {
    showMsg('error', 'New password must be at least 8 characters.'); return;
  }
  if (newPass !== confirm) {
    showMsg('error', 'Passwords do not match.'); return;
  }
  updateUserRecord(user.email, { password: btoa(newPass) });
  showMsg('success', '<i class="fa-solid fa-circle-check"></i> Password changed successfully!');
  document.getElementById('chg-current').value = '';
  document.getElementById('chg-new').value = '';
  document.getElementById('chg-confirm').value = '';
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectNavAuth();
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAccountModal(); });
});
