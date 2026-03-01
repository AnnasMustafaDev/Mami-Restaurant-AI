# Backend Technical Improvements

> Improvement roadmap for MaMi's Food & Wine backend (FastAPI + SQLAlchemy 2.0 + PostgreSQL)

---

## High Priority

### 1. Security Hardening
**Current state:** Default admin credentials are `admin@mamis.com` / `admin123` (hardcoded in `config.py:ADMIN_PASSWORD`). The `SECRET_KEY` is a static default value. No password complexity enforcement.
**Why it matters:** Anyone who reads the source code or guesses common passwords has full admin access.
**Action:**
- Remove hardcoded default admin password; require setup via environment variable or first-run setup wizard
- Generate a random `SECRET_KEY` if none is provided, with a startup warning
- Add password complexity validation (minimum 8 chars, mixed case, number)
- Add account lockout after 5 failed login attempts (with cooldown)
- Add rate limiting on `POST /api/admin/login` (max 10 attempts per minute per IP)
- Enforce HTTPS-only cookies for JWT tokens

### 2. Structured Logging
**Current state:** No logging framework is integrated. Errors go to stdout only. No request tracing.
**Why it matters:** Production debugging without logs is blind guessing. Can't track errors, performance, or suspicious activity.
**Action:**
- Integrate Python `logging` module with JSON formatter (or `structlog`)
- Log all API requests with: method, path, status code, response time, user agent
- Log all errors with stack traces and request context
- Log admin actions (login, status changes, menu edits) for audit trail
- Add request ID middleware for tracing requests across services
- Configure log levels per environment (DEBUG for dev, INFO for prod)

### 3. Rate Limiting on Public Endpoints
**Current state:** No rate limiting anywhere. The chat endpoint calls OpenAI GPT-4o on every message — an attacker could rack up massive API costs.
**Why it matters:** Prevents abuse, protects OpenAI API budget, and ensures fair usage.
**Action:**
- Add `slowapi` or custom rate limiting middleware
- Chat messages: 20 requests per minute per session
- Reservation creation: 5 per minute per IP
- Contact form: 3 per minute per IP
- TTS endpoint: 10 per minute per session
- Return `429 Too Many Requests` with `Retry-After` header

### 4. Pagination on All List Endpoints
**Current state:** `GET /api/admin/reservations` and `GET /api/admin/chat-sessions` return ALL records with no limit. `GET /api/menu` also returns the full menu.
**Why it matters:** As data grows, these endpoints will become slow and memory-intensive. After months of operation, there could be thousands of reservations.
**Action:**
- Add `page` and `page_size` query parameters (default: page=1, page_size=20)
- Return paginated response: `{ items: [...], total: 150, page: 1, page_size: 20, pages: 8 }`
- Add `sort_by` and `sort_order` parameters for flexibility
- Apply to: reservations list, chat sessions list, menu items list

### 5. Wire Up Email Notifications via Resend
**Current state:** `RESEND_API_KEY` is configured in `config.py` but never used. The frontend promises confirmation emails that never arrive.
**Why it matters:** Customers expect booking confirmations. Restaurant staff need alerts for new reservations.
**Action:**
- Create an `email_service.py` with Resend SDK integration
- Send reservation confirmation email to guest (with booking ref, date, time, restaurant address)
- Send new reservation alert to restaurant admin email
- Send cancellation notification to guest
- Add email templates with restaurant branding (wine/gold/cream colors)
- Make email sending async (don't block the API response)

### 6. Proper Alembic Database Migrations
**Current state:** Alembic is configured with a `versions/` directory but no migration files exist. Tables are created via `init_db()` at startup with `create_all()`.
**Why it matters:** `create_all()` can't modify existing tables. Any schema change in production requires manual SQL or data loss.
**Action:**
- Generate initial migration from current models: `alembic revision --autogenerate -m "initial"`
- Replace `create_all()` in lifespan with `alembic upgrade head`
- Document migration workflow for developers
- Add migration for any new models/columns going forward

---

## Medium Priority

### 7. Redis Caching Layer
**Current state:** Menu items and restaurant config are fetched from the database on every request. These rarely change.
**Why it matters:** Reduces database load and speeds up response times, especially for the public menu page which every customer visits.
**Action:**
- Add Redis connection (or in-memory fallback for dev)
- Cache `GET /api/menu` responses (TTL: 5 minutes)
- Cache `GET /api/restaurant/info` (TTL: 1 hour)
- Cache `GET /api/menu/specials` (TTL: 5 minutes)
- Invalidate menu cache on any admin menu CRUD operation
- Add cache headers for CDN/browser caching

### 8. Search & Advanced Filtering
**Current state:** Menu can only be filtered by category. Reservations can only be filtered by status and exact date. No text search.
**Why it matters:** Admin staff need to quickly find specific reservations or menu items.
**Action:**
- Add `search` query parameter to `GET /api/menu` — search by name, description
- Add `guest_name` and `guest_email` search to `GET /api/admin/reservations`
- Add date range filtering (`date_from`, `date_to`) for reservations
- Add `ILIKE` queries with proper SQL indexing

### 9. Image Upload Endpoint
**Current state:** Menu items store `image_url` as a plain string. The admin must manually find and paste image URLs. No upload functionality.
**Why it matters:** The restaurant manager should be able to upload food photos directly, not deal with URL management.
**Action:**
- Add `POST /api/admin/upload` endpoint accepting multipart/form-data
- Store images in S3 or Cloudinary (both offer generous free tiers)
- Return the CDN URL to be saved on the menu item
- Add image size validation (max 5MB) and format validation (JPEG, PNG, WebP)
- Auto-generate thumbnail sizes for menu grid vs. detail view

### 10. Contact Form Backend Endpoint
**Current state:** The frontend contact form (`Contact.tsx`) doesn't call any API — it just shows "Message Sent!" without actually sending anything.
**Why it matters:** Customer messages are silently dropped. The restaurant misses inquiries.
**Action:**
- Create `POST /api/contact` endpoint
- Validate name, email, message fields
- Send the message to the restaurant's admin email via Resend
- Optionally store in a `contact_messages` table for admin review
- Add rate limiting (3 per minute per IP)

### 11. Webhook Support for Reservation Events
**Current state:** No event system. External services can't be notified of new reservations or cancellations.
**Why it matters:** Enables integration with POS systems, Google Calendar, Slack notifications, etc.
**Action:**
- Create a `webhooks` table (URL, events, secret, active)
- Add admin UI for registering webhook URLs
- Fire webhook on: `reservation.created`, `reservation.cancelled`, `reservation.status_changed`
- Sign payloads with HMAC for security
- Add retry logic with exponential backoff

### 12. Audit Trail / Activity Logs
**Current state:** No record of who did what. If an admin changes a reservation status, there's no history.
**Why it matters:** Accountability, dispute resolution, and operational transparency.
**Action:**
- Create an `audit_log` model: `id`, `admin_email`, `action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `timestamp`
- Log all admin mutations: reservation status changes, menu CRUD, login events
- Add `GET /api/admin/audit-log` endpoint with date filtering
- Display in admin dashboard as a recent activity feed

### 13. Background Job Processing
**Current state:** Email sending (when implemented) and analytics would block API responses if done synchronously.
**Why it matters:** API responses stay fast; heavy work happens asynchronously.
**Action:**
- Add ARQ (async Redis queue) or Celery for background tasks
- Move email sending to background jobs
- Add scheduled tasks: daily reservation summary email, weekly analytics report
- Add job status monitoring in admin dashboard

---

## Low Priority

### 14. API Versioning
- Add `/api/v1/` prefix for all current routes
- Maintain backwards compatibility when breaking changes are needed
- Document versioning policy

### 15. OpenAPI Documentation Enhancement
- Add detailed descriptions, examples, and response samples to all endpoints
- Group endpoints with meaningful tags
- Add authentication examples in Swagger UI
- Generate a static API reference page

### 16. OpenAI Cost Controls
- Add token counting middleware (track tokens per session, per day)
- Set daily/monthly budget limits with automatic cutoff
- Log OpenAI API calls with cost estimates
- Add admin dashboard widget showing current month's AI costs
- Implement conversation length limits (e.g., max 50 messages per session)

### 17. LiveKit Voice Agent Integration
- Complete the LiveKit voice agent setup (credentials already configured)
- Enable real-time voice conversations with Sofia
- Add voice session management alongside text sessions

### 18. Database Performance Optimization
- Add database indexes on frequently queried columns (`reservation.date`, `reservation.status`, `menu_item.category`)
- Configure connection pooling parameters for production load
- Add query performance monitoring (SQLAlchemy events or `pg_stat_statements`)
- Add database backup automation

### 19. Health Check Expansion
- Check database connectivity in health endpoint
- Check OpenAI API reachability
- Report memory usage and uptime
- Add `/api/health/ready` (for Kubernetes readiness probes)
- Add `/api/health/live` (for liveness probes)
