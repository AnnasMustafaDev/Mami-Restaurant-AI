# Frontend Design & UX Improvements

> Improvement roadmap for MaMi's Food & Wine frontend (React 19 + TypeScript + Tailwind CSS)

---

## High Priority

### 1. Fix the False "Confirmation Email" Promise
**Current state:** `Reserve.tsx:341` displays *"A confirmation email will be sent to {email}"* — but no email service is wired up. The Resend API key exists in the backend config but is unused.
**Why it matters:** This is a broken promise visible to every customer who makes a reservation.
**Action:**
- Either wire up the Resend email integration (backend + frontend) or remove the text
- Replace with: *"Save your booking reference for your records"* with a copy-to-clipboard button
- Add a "Add to Calendar" button (generates .ics file) as an alternative

### 2. Embed a Real Google Map on the Contact Page
**Current state:** `Contact.tsx:187-195` shows a placeholder div with *"Interactive map coming soon"*.
**Why it matters:** A real map gives immediate credibility and helps customers find the restaurant.
**Action:**
- Embed Google Maps iframe for "Oderberger Straße 13, 10435 Berlin"
- Or use a lightweight alternative like Leaflet/OpenStreetMap (no API key needed)
- Add a "Get Directions" link that opens Google Maps navigation

### 3. Wire Up the Contact Form to Actually Send Messages
**Current state:** `Contact.tsx:9-12` — the form `handleSubmit` just sets `submitted = true` without making any API call. No message is actually sent anywhere.
**Why it matters:** Customers think they've contacted the restaurant, but nobody receives their message.
**Action:**
- Create a backend endpoint `POST /api/contact` that sends the message via Resend email to the restaurant's inbox
- Or at minimum, store contact form submissions in the database for admin review
- Add proper form validation with Zod (already installed as a dependency)

### 4. Add a 404 Not Found Page
**Current state:** No catch-all route exists — navigating to an invalid URL shows a blank page.
**Why it matters:** Professional apps handle errors gracefully; a missing 404 page looks unfinished.
**Action:**
- Add a `NotFound.tsx` page with restaurant branding, a friendly message, and navigation links
- Add a `<Route path="*" element={<NotFound />} />` catch-all in `App.tsx`

### 5. Add Client-Side Form Validation with Zod
**Current state:** Zod 4.3.6 is installed but never used. Forms rely on basic HTML5 `required` attributes only. No inline error messages.
**Why it matters:** Poor validation leads to failed submissions, bad data, and frustrated customers.
**Action:**
- Create Zod schemas for the reservation form (validate date is not in the past, name is not empty, email format, phone format)
- Create Zod schema for the contact form
- Show inline error messages below each field with smooth animation
- Validate on blur and on submit

### 6. Consistent Loading States Across All Pages
**Current state:** Only `MenuPage.tsx` has shimmer/skeleton loading. Other pages show nothing while data loads.
**Why it matters:** Inconsistent loading UX makes the app feel half-finished.
**Action:**
- Add skeleton placeholders to `Home.tsx` (testimonials, gallery), `About.tsx` (team section)
- Add a loading spinner to `Reserve.tsx` during availability check
- Create a reusable `<Skeleton />` component to standardize loading patterns

---

## Medium Priority

### 7. Build the Admin Menu Management UI
**Current state:** The backend has full CRUD endpoints for menu items (`POST /api/admin/menu`, `PUT /api/admin/menu/{id}`, `DELETE /api/admin/menu/{id}`) — but there is ZERO frontend for these. The admin can only manage reservations and view chats.
**Why it matters:** The restaurant manager cannot add, edit, or remove dishes without a developer. This is the #1 admin feature gap.
**Action:**
- Create `AdminMenu.tsx` page with a table listing all menu items
- Add create/edit modal with fields: name, description, category, price, dietary tags, image URL, availability toggle, special toggle
- Add delete with confirmation dialog
- Add category filter tabs matching the public menu page
- Add a "Mark as Special" quick toggle

### 8. Admin Dashboard Overview with Stats
**Current state:** `AdminDashboard.tsx` jumps straight into a reservation table with no summary.
**Why it matters:** Managers want a quick at-a-glance overview, not raw data.
**Action:**
- Add stat cards at the top: Today's Reservations, Total Guests Tonight, Active Chat Sessions, Pending Reservations
- Add a simple bar chart showing reservations per day (last 7 days)
- Color-code the stat cards using the existing theme (wine, gold, olive)

### 10. Dark Mode Support
**Current state:** Single light theme with warm cream/wine colors. No dark mode toggle.
**Why it matters:** Dark mode is expected in modern apps, especially for admin panels used at night.
**Action:**
- Add dark mode CSS variables in `index.css` alongside existing theme
- Add a toggle button in the Header (sun/moon icon)
- Store preference in localStorage
- Use Tailwind's `dark:` classes for all components
- Admin panel especially benefits (used in dimly-lit restaurant environments)

### 11. Menu Page Enhancements
**Current state:** Menu shows items in a grid with category tabs. No search, no dietary filter, no price range, no wine pairing suggestions.
**Why it matters:** Customers with dietary restrictions or budget concerns can't easily find what they want.
**Action:**
- Add a search bar to filter menu items by name/description
- Add dietary tag filter chips (Vegan, Vegetarian, Gluten-Free)
- Show price range per category
- Add expandable item cards that show description and wine pairing suggestions
- Add a "View Wine Pairings" button per dish (backend endpoint already exists: `GET /api/menu/{id}/pairings`)

### 12. Reservation Flow UX Improvements
**Current state:** Date input allows selecting closed days (Monday/Sunday). Time slots are hardcoded and don't reflect actual restaurant hours. No visual feedback on party size.
**Why it matters:** Customers waste time selecting invalid dates/times; the restaurant gets bad bookings.
**Action:**
- Disable Monday and Sunday in the date picker (restaurant is closed)
- Disable past dates (partially done with `min` attribute, but not closed days)
- Use `react-day-picker` (already installed!) instead of native HTML date input for better UX
- Show restaurant hours context: "Di-Do: 18:00-00:00 | Fr-Sa: 18:00-01:00"
- Add a party size visual (table/chair illustration)
- Sync time slots with the backend `booking_settings` config instead of hardcoding

### 13. Mobile UX Polish
**Current state:** Responsive layout works but lacks mobile-specific optimizations.
**Why it matters:** Most restaurant customers browse on mobile phones.
**Action:**
- Add swipe gestures for menu category navigation
- Make the chat widget a bottom sheet on mobile instead of a floating panel
- Increase touch targets to minimum 48x48px on all interactive elements
- Add pull-to-refresh on admin pages
- Optimize the reservation step indicator for narrow screens (currently hidden labels on mobile)

### 14. Accessibility Audit & Fixes
**Current state:** Basic semantic HTML and some ARIA labels exist, but no comprehensive accessibility review.
**Why it matters:** Legal compliance (WCAG 2.1) and inclusivity for all customers.
**Action:**
- Add proper `aria-label` and `role` attributes to all interactive elements
- Ensure keyboard navigation works for the reservation wizard steps
- Add focus trap to the chat widget and admin modals
- Test with screen reader (VoiceOver/NVDA)
- Verify color contrast ratios meet WCAG AA standards
- Add skip-to-content link

---

## Low Priority

### 15. Replace Placeholder Images with Real Restaurant Photos
**Current state:** Every page hero and gallery uses Unsplash stock photos (e.g. `unsplash.com/photo-1559339352-11d035aa65de` on Reserve page, `unsplash.com/photo-1555396273-367ea4eb4db5` on Contact page).
**Why it matters:** Stock photos immediately signal "template" to the client. Real photos of MaMi's interior, dishes, and team are the single biggest credibility boost.
**Action:**
- Add an image upload guide for the restaurant manager (recommended sizes, aspect ratios)
- Replace all 10+ Unsplash URLs in `Home.tsx`, `Reserve.tsx`, `Contact.tsx`, `About.tsx`
- Add `loading="lazy"` and `srcSet` for responsive image delivery
- Consider Cloudinary or similar CDN for automatic optimization

### 16. PWA Support
- Add a service worker for offline menu viewing
- Add a web app manifest for "Add to Home Screen"
- Cache menu data and restaurant info for offline access

### 17. Internationalization (i18n)
- Add a language toggle (German/English) in the header
- Move all hardcoded German strings (category labels: "Nebenbei", "Kalt", "Warm", "Süß") to translation files
- Auto-detect browser language preference

### 18. SEO & Social Sharing
- Add meta tags (title, description, OG image) per page
- Add structured data (JSON-LD) for Restaurant, Menu, and LocalBusiness schemas
- Add a sitemap.xml and robots.txt
- Optimize page titles and headings for search engines

### 19. Performance Optimization
- Add `loading="lazy"` to all images
- Implement route-based code splitting with `React.lazy()`
- Run Lighthouse audit and fix performance issues
- Optimize bundle size (tree-shake unused Lucide icons)
- Add resource hints (`<link rel="preconnect">` for Google Fonts, API domain)

### 20. Print-Friendly Styles
- Add print CSS for reservation confirmations (booking reference, date, time, guest count)
- Add print CSS for the menu page (clean layout without navigation/chat widget)
