/* ============================================================
   CLOUD'S VISTA — MAIN JAVASCRIPT
   Handles: navbar, mobile menu, hours status, cookie banner,
            back-to-top, newsletter, toast, carousel,
            map section, local file:// protocol fallback
============================================================ */

// ── NAVBAR: scroll behaviour ──────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── MOBILE MENU ───────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ── ACTIVE NAV LINK ───────────────────────────────────────
(function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ── HOURS STATUS (navbar badge) ───────────────────────────
function updateHoursStatus() {
  const el = document.getElementById('hours-status');
  if (!el) return;
  const watHour = (new Date().getUTCHours() + 1) % 24;
  const isOpen  = watHour >= 11 && watHour < 24;
  el.className  = 'badge ' + (isOpen ? 'open' : 'closed');
  el.innerHTML  = `<span class="dot"></span> ${isOpen ? 'Open Now' : 'Closed'}`;
}
updateHoursStatus();
setInterval(updateHoursStatus, 60000);

// ── MAP SECTION HOURS STATUS ──────────────────────────────
function updateMapHoursStatus() {
  const el = document.getElementById('map-hours-status');
  if (!el) return;
  const watHour = (new Date().getUTCHours() + 1) % 24;
  const isOpen  = watHour >= 11 && watHour < 24;
  el.className  = 'hours-pill ' + (isOpen ? 'open' : 'closed');
  el.innerHTML  = `<span class="dot"></span>${isOpen ? 'Open Now' : 'Closed'}`;
}
updateMapHoursStatus();

// ── MAP: file:// PROTOCOL FALLBACK ────────────────────────
// When opening HTML files directly from your desktop (file://) Google Maps
// iframes are blocked by the browser's security policy. This is normal and
// expected — maps work perfectly once deployed to thecloudsvista.com (HTTPS).
// This function replaces the blocked iframe with a clean static fallback.
(function handleMapProtocol() {
  if (window.location.protocol !== 'file:') return; // only runs locally

  const mapWrappers = document.querySelectorAll('.find-us-map, .map-wrap');
  mapWrappers.forEach(wrap => {
    const iframe = wrap.querySelector('iframe');
    if (!iframe) return;

    // Replace with a styled static fallback card
    const fallback = document.createElement('div');
    fallback.style.cssText = `
      width:100%; height:100%; min-height:380px;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:16px; background:rgba(15,26,36,0.8); border:1px dashed rgba(200,151,58,0.3);
      text-align:center; padding:32px; box-sizing:border-box;
    `;
    fallback.innerHTML = `
      <div style="font-size:2.5rem; color:rgba(200,151,58,0.5);">
        <i class="fa-solid fa-map-location-dot"></i>
      </div>
      <div style="font-family:'Cormorant Garamond',serif; font-size:1.35rem; color:var(--cream); font-weight:600;">
        Cloud's Vista
      </div>
      <div style="font-size:0.85rem; color:var(--cream-dim); line-height:1.7; max-width:260px;">
        DD'S Centrium, DBS Road<br />Central Area, Asaba, Delta State<br />Nigeria
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; width:100%; max-width:240px; margin-top:4px;">
        <a href="https://maps.google.com/?q=DD%27S+Centrium+DBS+Road+Central+Area+Asaba+Delta+Nigeria"
           target="_blank" rel="noopener noreferrer"
           style="display:flex; align-items:center; justify-content:center; gap:8px;
                  padding:11px 18px; border-radius:50px;
                  background:linear-gradient(135deg,#C8973A,#E8B85A);
                  color:#0F1A24; font-size:0.78rem; font-weight:700;
                  letter-spacing:0.08em; text-transform:uppercase; text-decoration:none;">
          <i class="fa-solid fa-diamond-turn-right"></i> Open in Google Maps
        </a>
        <div style="font-size:0.7rem; color:rgba(212,201,176,0.4); margin-top:4px;">
          Map preview available when hosted online
        </div>
      </div>
    `;
    iframe.replaceWith(fallback);
  });
})();

// ── COOKIE BANNER ─────────────────────────────────────────
const cookieBanner = document.getElementById('cookie-banner');
if (cookieBanner && !localStorage.getItem('cv_cookie_consent')) {
  setTimeout(() => cookieBanner.classList.add('visible'), 1200);
}
function acceptCookies() {
  localStorage.setItem('cv_cookie_consent', 'accepted');
  if (cookieBanner) cookieBanner.classList.remove('visible');
}
function declineCookies() {
  localStorage.setItem('cv_cookie_consent', 'declined');
  if (cookieBanner) cookieBanner.classList.remove('visible');
}

// ── BACK TO TOP ───────────────────────────────────────────
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── NEWSLETTER ────────────────────────────────────────────
function handleNewsletter(e) {
  if (e) e.preventDefault();
  const form    = document.getElementById('newsletter-form');
  const input   = document.getElementById('newsletter-email');
  const success = document.getElementById('newsletter-success');
  if (!input || !input.value.includes('@')) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  if (form) form.style.display = 'none';
  if (success) success.style.display = 'block';
  showToast('You\'re on the list! Welcome to Cloud\'s Vista.');
}

// ── TOAST NOTIFICATION ────────────────────────────────────
// Uses innerHTML so Font Awesome icons in messages render correctly
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = message;                                        // ← innerHTML for icon support
  toast.style.borderLeftColor = type === 'error' ? '#FC6450' : 'var(--gold)';
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

// ── TESTIMONIAL CAROUSEL ──────────────────────────────────
(function initCarousel() {
  const track = document.getElementById('testimonial-track');
  const dots  = document.querySelectorAll('.carousel-dot');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.testimonial-card'));
  let current = 0;
  let perView = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;

  function goTo(index) {
    current = Math.max(0, Math.min(index, cards.length - perView));
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    track.style.transition = 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  window.carouselPrev = () => goTo(current - 1);
  window.carouselNext = () => goTo(current + 1);
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  let autoTimer = setInterval(() => {
    goTo(current + 1 >= cards.length - perView + 1 ? 0 : current + 1);
  }, 5000);

  // Passive listeners on the carousel track to avoid scroll-blocking warnings
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', () => {
    autoTimer = setInterval(() => {
      goTo(current + 1 >= cards.length - perView + 1 ? 0 : current + 1);
    }, 5000);
  });

  // Touch swipe support — passive so browser scrolls smoothly
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });

  window.addEventListener('resize', () => {
    perView = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    goTo(0);
  }, { passive: true });
})();

// ── SMOOTH SCROLL for anchor links ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── INTERSECTION OBSERVER: fade-in sections ──────────────
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => observer.observe(el));
}
