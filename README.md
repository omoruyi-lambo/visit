# Cloud's Vista Website — Implementation Guide

## 📁 File Structure
```
cloudsvista/
├── index.html          ← Homepage
├── menu.html           ← Full menu with filters
├── gallery.html        ← Masonry gallery with lightbox
├── contact.html        ← Contact form + map
├── reservation.html    ← Table booking form
├── order.html          ← Online ordering (WhatsApp checkout)
├── css/
│   └── style.css       ← All styles (single file)
└── js/
    └── main.js         ← All shared JavaScript
```

## 🚀 Quick Deploy (Shared Hosting / cPanel)
1. Download/zip the entire `cloudsvista/` folder
2. Upload contents to your `public_html/` directory via cPanel File Manager or FTP
3. Visit `thecloudsvista.com` — it should work immediately

## 🚀 Deploy to Netlify (Free, Recommended)
1. Go to [netlify.com](https://netlify.com) → "Add new site" → "Deploy manually"
2. Drag and drop the `cloudsvista/` folder
3. Done! You'll get a live URL instantly
4. Connect your custom domain `thecloudsvista.com` in Site Settings → Domain Management

## 📸 Replace Placeholder Images
All images use Unsplash placeholders. To use real photos:
1. Open any `.html` file
2. Search for `images.unsplash.com`
3. Replace each URL with your own hosted image URL
4. For best performance: upload images to Cloudinary or your hosting and use those URLs

**Recommended image sizes:**
- Hero: 1600×900px
- Ambiance grid: 900×600px
- Dish cards: 600×400px
- Gallery: 600×800px (portrait) or 600×400px (landscape)

## 🗺️ Fix Google Maps Embed
In `contact.html`, replace the iframe `src` with a proper embed URL:
1. Go to [maps.google.com](https://maps.google.com)
2. Search: `DD'S Centrium, DBS Rd, Asaba, Delta, Nigeria`
3. Click Share → Embed a map → Copy the full `<iframe>` HTML
4. Replace the existing `<iframe>` in `contact.html`

## 📧 Connect the Contact Form
Currently the form simulates submission. To make it real, use **Formspree** (free):
1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form → get your endpoint URL
3. In `contact.html`, change the `<form>` tag to:
   ```html
   <form id="contact-form" action="https://formspree.io/f/YOUR_ID" method="POST">
   ```
4. Remove the `onsubmit="handleContactSubmit(event)"` attribute
5. Add a `<input type="hidden" name="_redirect" value="https://thecloudsvista.com/contact.html">` for redirect

## 📱 WhatsApp Integration
The WhatsApp number is pre-configured everywhere. If the number changes:
- Search `2348051498689` across all HTML files and replace
- The floating button and checkout both use this number

## ⏰ Hours Status
The live "Open Now / Closed" badge uses Nigeria's WAT timezone (UTC+1).
- Opening hour is set to 11 AM (`OPEN_HOUR = 11` in `main.js` line ~28)
- Closing hour is midnight (`CLOSE_HOUR = 24`)
- To change: edit these values in `js/main.js`

## 🍪 Cookie Banner
- Auto-shows after 1.2 seconds on first visit
- Stores consent in `localStorage` (never shows again after acceptance)
- To reset (for testing): Open browser DevTools → Application → Local Storage → delete `cv_cookie_consent`

## 📰 Newsletter
Currently shows a success message. To connect to a real email list:
- **Mailchimp**: Use their embedded form endpoint as an action URL
- **ConvertKit / Klaviyo**: Same approach — replace the button handler with a POST request
- In `main.js`, the `handleNewsletter()` function is where you'd add the API call

## 🔧 Customisation Quick Reference
| What to change | Where |
|---|---|
| Colors / fonts | `css/style.css` — `:root` variables at top |
| Restaurant name | All HTML files — search `Cloud's Vista` |
| Phone number | All HTML files — search `08051498689` |
| Opening hours | `js/main.js` — `OPEN_HOUR` / `CLOSE_HOUR` constants |
| Menu prices | `menu.html` and `order.html` |
| Testimonials | `index.html` — testimonials section |
| Hero image | `index.html` — `.hero-bg` background-image URL |

## 📋 Features Checklist
- ✅ WhatsApp floating button (pre-filled message)
- ✅ Cookie consent banner (with localStorage memory)
- ✅ Newsletter signup in footer (all pages)
- ✅ Live "Open Now / Closed" badge (WAT timezone)
- ✅ Dress code note ("Smart casual attire welcome") — footer + reservation page
- ✅ Mobile-responsive (hamburger menu, touch-friendly)
- ✅ All phone numbers clickable (tel:)
- ✅ All external links open in new tab (rel="noopener noreferrer")
- ✅ Testimonial carousel with auto-advance
- ✅ Gallery lightbox (click to enlarge)
- ✅ Menu filter by category
- ✅ Reservation form with confirmation
- ✅ Online ordering with WhatsApp checkout
- ✅ Back-to-top button
- ✅ SEO meta tags + LocalBusiness schema
- ✅ Accessible (ARIA labels, keyboard navigation, focus indicators)
- ✅ Smooth scroll animations

## 🌐 Browser Support
Tested compatible with: Chrome, Firefox, Safari, Edge (all modern versions)
Mobile: iOS Safari, Android Chrome
