/* ============================================================
   CLOUD'S VISTA — CART ENGINE (cart.js)
   Handles: cart state, drawer, add/remove/qty,
            payment modal, WhatsApp checkout
============================================================ */

// ── CART STATE (sessionStorage) ───────────────────────────
let cart = JSON.parse(sessionStorage.getItem('cv_cart') || '[]');

function saveCart() { sessionStorage.setItem('cv_cart', JSON.stringify(cart)); }
function getCartCount() { return cart.reduce((s, i) => s + i.qty, 0); }
function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

// ── ADD TO CART ───────────────────────────────────────────
function addToCart(id, name, price, img) {
  const ex = cart.find(i => i.id === id);
  ex ? ex.qty++ : cart.push({ id, name, price, img, qty: 1 });
  saveCart();
  updateCartUI();
  animateCartBadge();
  showToast(`<i class="fa-solid fa-circle-check"></i>&nbsp; <strong>${name}</strong> added to cart`);
}

// ── REMOVE / QTY ──────────────────────────────────────────
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateCartUI(); renderCartDrawer();
}
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  saveCart(); updateCartUI(); renderCartDrawer();
}

// ── UPDATE NAV BADGE ──────────────────────────────────────
function updateCartUI() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count > 99 ? '99+' : count;
    b.classList.toggle('has-items', count > 0);
  });
  // Sync add-to-cart button states across the page
  document.querySelectorAll('[data-item-id]').forEach(btn => {
    if (!btn.classList.contains('add-to-cart-btn') && !btn.classList.contains('dish-add-btn')) return;
    const inCart = cart.some(i => i.id === btn.dataset.itemId);
    if (inCart) {
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Added';
      btn.classList.add('added');
    } else {
      btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
      btn.classList.remove('added');
    }
  });
}

function animateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.style.transform = 'scale(1.5)';
    setTimeout(() => b.style.transform = 'scale(1)', 220);
  });
}

// ── RENDER CART DRAWER ────────────────────────────────────
function renderCartDrawer() {
  const listEl  = document.getElementById('cart-items-list');
  const footerEl = document.getElementById('cart-drawer-footer');
  if (!listEl) return;

  if (!cart.length) {
    listEl.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Your cart is empty.<br/><a href="menu.html">Browse our menu</a> and add something delicious!</p>
      </div>`;
    if (footerEl) footerEl.style.display = 'none';
    return;
  }
  if (footerEl) footerEl.style.display = '';

  listEl.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" loading="lazy" />
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-unit-price">₦${item.price.toLocaleString()} each</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)" aria-label="Increase"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
      <span class="cart-item-line-total">₦${(item.price * item.qty).toLocaleString()}</span>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>`).join('');

  const sub = getCartTotal();
  const el  = id => document.getElementById(id);
  if (el('cart-subtotal'))   el('cart-subtotal').textContent   = `₦${sub.toLocaleString()}`;
  if (el('cart-total'))      el('cart-total').textContent      = `₦${sub.toLocaleString()}`;
  if (el('cart-item-count')) el('cart-item-count').textContent = `${getCartCount()} item${getCartCount() !== 1 ? 's' : ''}`;
}

// ── OPEN / CLOSE DRAWER ───────────────────────────────────
function openCart() {
  renderCartDrawer();
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── PAYMENT MODAL ─────────────────────────────────────────
let selectedPayMethod = '';

function openPaymentModal() {
  if (!cart.length) { showToast('Your cart is empty!'); return; }
  closeCart();

  const total = getCartTotal();
  const lines = cart.map(i =>
    `<div class="payment-summary-line"><span>${i.name} ×${i.qty}</span><span>₦${(i.price*i.qty).toLocaleString()}</span></div>`
  ).join('');

  // Remove stale modal
  document.getElementById('payment-overlay')?.remove();

  const html = `
  <div class="payment-overlay" id="payment-overlay">
    <div class="payment-modal" role="dialog" aria-modal="true" aria-label="Payment">

      <div class="payment-modal-header">
        <div>
          <p style="font-size:0.72rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold); margin-bottom:4px;">Secure Checkout</p>
          <div class="payment-modal-title">Complete Your Order</div>
        </div>
        <button class="payment-modal-close" onclick="closePaymentModal()" aria-label="Close">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="payment-modal-body">

        <!-- Order summary -->
        <div class="payment-order-summary">
          <h4><i class="fa-solid fa-receipt"></i>&nbsp; Order Summary</h4>
          ${lines}
          <div class="payment-summary-total">
            <span>Total</span>
            <span>₦${total.toLocaleString()}</span>
          </div>
        </div>

        <!-- Auth check notice -->
        <div id="payment-auth-notice" style="display:none; padding:10px 14px; border-radius:8px; background:rgba(200,151,58,0.07); border:1px solid rgba(200,151,58,0.2); font-size:0.82rem; color:var(--cream-dim); margin-bottom:16px;">
          <i class="fa-solid fa-circle-info" style="color:var(--gold);"></i>
          &nbsp;You're ordering as a guest. <a href="auth.html" style="color:var(--gold);">Sign in</a> to save your order history.
        </div>

        <!-- Payment method selector -->
        <span class="payment-methods-label"><i class="fa-solid fa-lock"></i>&nbsp; Choose Payment Method</span>
        <div class="payment-methods-grid" style="grid-template-columns:repeat(3,1fr);">

          <div class="payment-method-card" data-method="paystack" onclick="selectPayMethod('paystack')">
            <span class="pm-icon"><i class="fa-solid fa-credit-card"></i></span>
            <span class="pm-name">Card Payment</span>
            <span class="pm-desc">Visa, Mastercard, Verve</span>
          </div>

          <div class="payment-method-card" data-method="transfer" onclick="selectPayMethod('transfer')">
            <span class="pm-icon"><i class="fa-solid fa-building-columns"></i></span>
            <span class="pm-name">Bank Transfer</span>
            <span class="pm-desc">Instant bank transfer</span>
          </div>

          <div class="payment-method-card" data-method="ussd" onclick="selectPayMethod('ussd')">
            <span class="pm-icon"><i class="fa-solid fa-mobile-screen-button"></i></span>
            <span class="pm-name">USSD</span>
            <span class="pm-desc">*737#, *919# & more</span>
          </div>

        </div>

        <!-- Card form (shown for paystack) -->
        <div class="payment-card-form" id="card-form">
          <div class="pf-group">
            <label>Card Number</label>
            <input type="text" id="card-number" placeholder="0000 0000 0000 0000" maxlength="19"
              oninput="formatCardNumber(this)" autocomplete="cc-number" />
          </div>
          <div class="pf-row">
            <div class="pf-group">
              <label>Expiry Date</label>
              <input type="text" id="card-expiry" placeholder="MM / YY" maxlength="7"
                oninput="formatExpiry(this)" autocomplete="cc-exp" />
            </div>
            <div class="pf-group">
              <label>CVV</label>
              <input type="text" id="card-cvv" placeholder="•••" maxlength="4"
                oninput="this.value=this.value.replace(/\\D/g,'')" autocomplete="cc-csc" />
            </div>
          </div>
          <div class="pf-group">
            <label>Cardholder Name</label>
            <input type="text" id="card-name" placeholder="Name on card" autocomplete="cc-name" />
          </div>
        </div>

        <!-- Bank transfer details (shown for transfer) -->
        <div class="transfer-details" id="transfer-details">
          <div class="transfer-row">
            <span class="transfer-label">Bank</span>
            <span class="transfer-value">GTBank (Guaranty Trust Bank)</span>
          </div>
          <div class="transfer-row">
            <span class="transfer-label">Account Name</span>
            <span class="transfer-value">Cloud's Vista Ltd</span>
          </div>
          <div class="transfer-row">
            <span class="transfer-label">Account Number</span>
            <span class="transfer-value">
              0123456789
              <button class="copy-btn" onclick="copyText('0123456789', this)"><i class="fa-regular fa-copy"></i> Copy</button>
            </span>
          </div>
          <div class="transfer-row">
            <span class="transfer-label">Amount</span>
            <span class="transfer-value" style="color:var(--gold); font-size:1rem;">₦${total.toLocaleString()}</span>
          </div>
          <p style="font-size:0.78rem; color:var(--cream-dim); margin-top:10px; line-height:1.6;">
            <i class="fa-solid fa-circle-info" style="color:var(--gold);"></i>
            After transferring, click <strong>Confirm & Send Order</strong> and we'll verify your payment via WhatsApp within 10 minutes.
          </p>
        </div>

        <!-- USSD info -->
        <div id="ussd-info" style="display:none; padding:14px 16px; background:rgba(15,26,36,0.6); border:1px solid var(--glass-border); border-radius:var(--radius-sm); margin-bottom:16px; font-size:0.85rem; color:var(--cream-dim); line-height:1.8;">
          <strong style="color:var(--cream); display:block; margin-bottom:8px;">Dial any of these USSD codes:</strong>
          <div>GTBank: <strong style="color:var(--gold);">*737*2*Amount*AccountNumber#</strong></div>
          <div>Access Bank: <strong style="color:var(--gold);">*901*Amount*AccountNumber#</strong></div>
          <div>Zenith Bank: <strong style="color:var(--gold);">*966*Amount*AccountNumber#</strong></div>
          <div style="margin-top:8px;">Account: <strong style="color:var(--gold);">0123456789</strong> (Cloud's Vista Ltd)</div>
        </div>

        <!-- Proceed button -->
        <button class="payment-proceed-btn" id="payment-proceed-btn" onclick="proceedToCheckout()" disabled>
          <i class="fa-solid fa-lock"></i> Select a Payment Method
        </button>

        <div class="payment-secure-note">
          <i class="fa-solid fa-shield-halved"></i>
          Secured &amp; encrypted · Powered by <strong>Cloud's Vista</strong>
        </div>

      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('payment-overlay')?.classList.add('open'), 10);

  // Show guest notice if not logged in
  if (typeof getUser === 'function' && !getUser()) {
    document.getElementById('payment-auth-notice').style.display = 'block';
  }
}

function closePaymentModal() {
  const el = document.getElementById('payment-overlay');
  if (!el) return;
  el.classList.remove('open');
  setTimeout(() => { el.remove(); document.body.style.overflow = ''; }, 320);
  selectedPayMethod = '';
}

function selectPayMethod(method) {
  selectedPayMethod = method;

  // Highlight selected card
  document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`[data-method="${method}"]`)?.classList.add('selected');

  // Show/hide sub-forms
  const cardForm       = document.getElementById('card-form');
  const transferDetails = document.getElementById('transfer-details');
  const ussdInfo       = document.getElementById('ussd-info');

  cardForm.classList.remove('visible');
  transferDetails.classList.remove('visible');
  if (ussdInfo) ussdInfo.style.display = 'none';

  if (method === 'paystack') cardForm.classList.add('visible');
  if (method === 'transfer') transferDetails.classList.add('visible');
  if (method === 'ussd')     ussdInfo.style.display = 'block';

  // Update proceed button
  const btn = document.getElementById('payment-proceed-btn');
  const labels = {
    paystack:  '<i class="fa-solid fa-credit-card"></i> Pay with Card',
    transfer:  '<i class="fa-solid fa-building-columns"></i> Confirm & Send Order',
    ussd:      '<i class="fa-solid fa-mobile-screen-button"></i> I\'ve Paid via USSD',
  };
  btn.innerHTML = labels[method] || 'Proceed';
  btn.disabled  = false;
}

// Card number formatter
function formatCardNumber(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0,2) + ' / ' + v.substring(2);
  input.value = v;
}

// Copy to clipboard
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    btn.style.color = '#6EE7B7';
    setTimeout(() => { btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy'; btn.style.color = ''; }, 2000);
  }).catch(() => {
    btn.textContent = text; // fallback select
  });
}

// ── PROCEED TO CHECKOUT ───────────────────────────────────
function proceedToCheckout() {
  if (!selectedPayMethod) return;
  const btn = document.getElementById('payment-proceed-btn');

  // For card payment — basic validation
  if (selectedPayMethod === 'paystack') {
    const num  = document.getElementById('card-number')?.value.replace(/\s/g,'') || '';
    const exp  = document.getElementById('card-expiry')?.value || '';
    const cvv  = document.getElementById('card-cvv')?.value || '';
    const name = document.getElementById('card-name')?.value.trim() || '';
    if (num.length < 16 || !exp.includes('/') || cvv.length < 3 || !name) {
      showToast('Please fill in all card details correctly.');
      return;
    }
    // Simulate payment processing
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing payment…';
    btn.disabled = true;
    setTimeout(() => { simulatePaymentSuccess(); }, 2000);
    return;
  }

  // All other methods → build WhatsApp order message
  sendWhatsAppOrder();
}

function simulatePaymentSuccess() {
  const overlay = document.getElementById('payment-overlay');
  const body    = overlay?.querySelector('.payment-modal-body');
  if (!body) return;
  const total   = getCartTotal();
  body.innerHTML = `
    <div style="text-align:center; padding:32px 0;">
      <div style="font-size:3.5rem; color:var(--gold); margin-bottom:16px; animation:pulse-dot 1s ease;">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h3 style="font-family:var(--font-display); font-size:1.8rem; color:var(--cream); margin-bottom:10px;">Payment Successful!</h3>
      <p style="color:var(--cream-dim); margin-bottom:6px;">₦${total.toLocaleString()} charged to your card.</p>
      <p style="color:var(--cream-dim); font-size:0.85rem; margin-bottom:28px;">Your order is being prepared. We'll confirm via WhatsApp.</p>
      <button onclick="sendWhatsAppOrder(true)" class="payment-proceed-btn" style="margin:0 auto; width:auto; padding:14px 32px;">
        <i class="fa-brands fa-whatsapp"></i> Send Order to WhatsApp
      </button>
    </div>`;
}

function sendWhatsAppOrder(isPaid) {
  const items = cart.map(i => `${i.qty}x ${i.name} — ₦${(i.price*i.qty).toLocaleString()}`).join('%0A');
  const total  = getCartTotal();
  const method = {
    paystack: 'Card (Paid online)',
    transfer: 'Bank Transfer',
    ussd:     'USSD',
  }[selectedPayMethod] || selectedPayMethod;

  const user = (typeof getUser === 'function') ? getUser() : null;
  const who  = user ? `Name: ${user.name}%0AEmail: ${user.email}%0A` : '';

  const msg = `Hello Cloud's Vista!%0A%0AI'd like to place an order:%0A%0A${items}%0A%0A*Total: ₦${total.toLocaleString()}*%0APayment: ${method}${isPaid ? ' ✅ Paid' : ''}%0A%0A${who}Please confirm and arrange delivery/pickup. Thank you!`;

  // Save order to history
  try {
    const orders = JSON.parse(localStorage.getItem('cv_order_history') || '[]');
    orders.unshift({
      id: 'ORD-' + Date.now(),
      date: new Date().toISOString(),
      items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      total: getCartTotal(),
      method: method,
      status: isPaid ? 'Paid' : 'Pending'
    });
    localStorage.setItem('cv_order_history', JSON.stringify(orders.slice(0, 20))); // keep last 20
  } catch(e) {}

  window.open(`https://wa.me/2348051498689?text=${msg}`, '_blank', 'noopener,noreferrer');

  // Clear cart after confirmed order
  cart = [];
  saveCart();
  updateCartUI();
  setTimeout(closePaymentModal, 600);
  showToast('<i class="fa-solid fa-circle-check"></i> Order sent! Check WhatsApp for confirmation.');
}

// ── ITEM DETAIL MODAL ─────────────────────────────────────
let modalQty = 1;

function openItemModal(id, name, price, img, desc, tags) {
  modalQty = 1;
  const overlay = document.getElementById('item-modal-overlay');
  if (!overlay) return;
  overlay.querySelector('.item-modal-img').src = img.replace('w=200','w=600');
  overlay.querySelector('.item-modal-img').alt = name;
  overlay.querySelector('.item-modal-name').textContent = name;
  overlay.querySelector('.item-modal-price').textContent = `₦${price.toLocaleString()}`;
  overlay.querySelector('.item-modal-desc').textContent = desc;
  overlay.querySelector('.item-modal-tags').innerHTML = tags;
  overlay.querySelector('.modal-qty-num').textContent = modalQty;
  overlay.querySelector('.modal-add-btn').onclick = () => {
    for (let k = 0; k < modalQty; k++) addToCart(id, name, price, img);
    closeItemModal(); openCart();
  };
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeItemModal() {
  document.getElementById('item-modal-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
function changeModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  const el = document.querySelector('.modal-qty-num');
  if (el) el.textContent = modalQty;
}

// ── INJECT DRAWER + MODAL HTML ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  document.body.insertAdjacentHTML('beforeend', `
    <!-- Cart overlay + drawer -->
    <div class="cart-overlay" id="cart-overlay" onclick="closeCart()"></div>
    <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div class="cart-drawer-header">
        <div class="cart-drawer-title">
          <i class="fa-solid fa-cart-shopping"></i> Your Order
          <span id="cart-item-count" style="font-size:0.75rem; font-weight:400; color:var(--cream-dim); margin-left:4px;"></span>
        </div>
        <button class="cart-close-btn" onclick="closeCart()" aria-label="Close cart">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="cart-items-list" id="cart-items-list"></div>
      <div class="cart-drawer-footer" id="cart-drawer-footer" style="display:none;">
        <div class="cart-subtotal-row">
          <span>Subtotal</span><span id="cart-subtotal">₦0</span>
        </div>
        <div class="cart-total-row">
          <span>Total</span><span id="cart-total">₦0</span>
        </div>
        <!-- Checkout now opens payment modal -->
        <button class="cart-checkout-btn" onclick="openPaymentModal()">
          <i class="fa-solid fa-lock"></i> Proceed to Payment
        </button>
        <button class="cart-continue-btn" onclick="closeCart()">
          <i class="fa-solid fa-arrow-left"></i> Continue Browsing
        </button>
      </div>
    </aside>

    <!-- Item detail modal -->
    <div class="item-modal-overlay" id="item-modal-overlay"
         onclick="if(event.target===this)closeItemModal()">
      <div class="item-modal">
        <div style="position:relative;">
          <img class="item-modal-img" src="" alt="" />
          <button class="modal-close-x" onclick="closeItemModal()" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="item-modal-body">
          <div class="item-modal-top">
            <h3 class="item-modal-name"></h3>
            <span class="item-modal-price"></span>
          </div>
          <p class="item-modal-desc"></p>
          <div class="item-modal-tags"></div>
          <div class="item-modal-footer">
            <div class="modal-qty-control">
              <button class="qty-btn" onclick="changeModalQty(-1)"><i class="fa-solid fa-minus"></i></button>
              <span class="modal-qty-num">1</span>
              <button class="qty-btn" onclick="changeModalQty(1)"><i class="fa-solid fa-plus"></i></button>
            </div>
            <button class="modal-add-btn">
              <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `);

  // Cart button in navbar
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    const btn = document.createElement('button');
    btn.className = 'cart-nav-btn';
    btn.id = 'cart-nav-btn';
    btn.setAttribute('aria-label', 'Open cart');
    btn.onclick = openCart;
    btn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i><span class="cart-badge"></span>';
    hamburger.parentNode.insertBefore(btn, hamburger);
  }

  updateCartUI();

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCart(); closeItemModal(); closePaymentModal(); }
  });
});
