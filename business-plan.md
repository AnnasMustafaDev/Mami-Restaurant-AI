# Business Plan: Automated Marketing & Sales System for Restaurant Website Platform

---

## 1. The Product You're Selling

**MaMi's Food & Wine** is a turnkey, AI-powered restaurant website platform. For each restaurant client, you deliver:

- A beautiful public website (menu, reservations, about, contact)
- An AI chatbot (Sofia) that handles menu questions, wine pairings, and reservations
- An admin panel for the owner to manage everything themselves
- Voice mode for the chatbot
- Deployed and hosted (Vercel + Render)

**Target market:** Independent restaurant owners in Berlin (and eventually DACH region) who don't have a modern digital presence.

---

## 2. Revenue Model

| Tier | Price | What They Get |
|------|-------|---------------|
| **Starter** | EUR 499 setup + EUR 49/mo | Website + Menu + Reservations + Admin Panel |
| **Pro** | EUR 999 setup + EUR 99/mo | Everything above + AI Chatbot (Sofia) + Voice Mode |
| **Premium** | EUR 1,999 setup + EUR 149/mo | Everything above + Custom Branding + Priority Support + Email Marketing Integration |
| **White-Label** | EUR 4,999 setup + EUR 249/mo | Full customization, own domain, own branding, dedicated instance |

---

## 3. The Automation Pipeline

The full automation funnel from **finding leads** to **closing deals** to **onboarding clients** — and the specific tools/MCPs/APIs needed:

### Phase 1: Lead Generation (Finding Restaurant Owners)

| Automation | Tool / API | What It Does |
|------------|-----------|--------------|
| Scrape restaurant listings | **Google Maps API** / **Yelp Fusion API** / **TripAdvisor API** | Find restaurants in Berlin without modern websites |
| Enrich with contact info | **Apollo.io API** / **Hunter.io API** | Get owner emails, phone numbers, LinkedIn profiles |
| Check if they have a website | **BuiltWith API** / custom scraper | Identify restaurants with no website or outdated ones |
| Score leads | **Custom Python script** | Score by: no website (10pts), bad reviews about "hard to book" (5pts), high rating (3pts), etc. |
| Store leads | **Airtable API** / **HubSpot CRM (free)** / **Notion API** | Centralized lead database |

**MCP needed:** A `lead-generation` MCP server that wraps Google Maps API + Hunter.io + lead scoring logic.

### Phase 2: Automated Outreach (Email + LinkedIn)

| Automation | Tool / API | What It Does |
|------------|-----------|--------------|
| Cold email sequences | **Resend API** (already integrated!) / **Mailgun** / **SendGrid** | Automated multi-step email campaigns |
| Email templates | **OpenAI API** (already integrated!) | Generate personalized emails per restaurant using their menu, reviews, location |
| LinkedIn outreach | **Phantombuster** / **Dripify** | Automated connection requests + messages to restaurant owners |
| Follow-up scheduling | **n8n** (self-hosted) / **Make.com** / **Zapier** | If no reply in 3 days → send follow-up; if opened → send demo link |
| Track opens/clicks | **Resend webhooks** / **SendGrid Events API** | Know when a prospect opens your email or clicks the demo link |

**Email sequence example:**

```
Day 0:  "Hey [Name], I visited [Restaurant] — your food deserves a better website"
        → Include a FREE live demo link showing THEIR menu on your platform
Day 3:  "Did you see the demo? Here's what [Similar Restaurant] achieved..."
Day 7:  "Last chance — I'm offering 50% off setup this month"
Day 14: "No worries — here's a free guide on restaurant digital marketing"
```

**The killer move:** Use your existing project to auto-generate a **personalized demo** for each restaurant prospect. Scrape their menu from Google/Yelp, populate your template, deploy a temporary preview, and include the link in the email. This is your unfair advantage.

**MCP needed:** An `outreach` MCP server that wraps Resend + OpenAI (personalization) + CRM updates.

### Phase 3: Demo & Pitching (Automated)

| Automation | Tool / API | What It Does |
|------------|-----------|--------------|
| Auto-generate demo sites | **Your existing codebase** + **Vercel API** | Spin up a personalized preview per lead |
| Menu scraping | **Cheerio** / **Puppeteer** / **ScrapeGraph-AI** | Auto-import their current menu into your system |
| Booking page | **Calendly API** / **Cal.com API** | Let prospects book a call directly from the email |
| Video pitch | **Loom API** / **Synthesia** | Auto-generate a personalized video walkthrough |
| Chatbot demo | **Your Sofia chatbot** | Include a live chat on the demo so they can experience it |

**MCP needed:** A `demo-generator` MCP server that takes a restaurant name/address and auto-generates a preview site.

### Phase 4: Closing & Payment

| Automation | Tool / API | What It Does |
|------------|-----------|--------------|
| Proposals | **PandaDoc API** / **DocuSign API** | Auto-generate and send contracts |
| Payment | **Stripe API** | Setup fee + recurring monthly subscription |
| Invoicing | **Stripe Billing** / **Lexoffice API** (for German tax compliance) | Automated invoices with proper Umsatzsteuer |
| CRM update | **HubSpot API** / **Pipedrive API** | Move lead to "Customer" status |

**MCP needed:** A `sales-closing` MCP server wrapping Stripe + document generation.

### Phase 5: Automated Onboarding

| Automation | Tool / API | What It Does |
|------------|-----------|--------------|
| Client intake form | **Typeform API** / **Tally** | Collect: logo, colors, menu PDF, photos, hours, story |
| Menu import | **OpenAI Vision API** | Parse their menu PDF/photos into structured data |
| Site generation | **Your codebase** + **GitHub API** + **Vercel API** | Fork template → customize → deploy |
| DNS setup | **Cloudflare API** / **Vercel Domains API** | Connect their custom domain |
| Welcome email | **Resend API** | Send login credentials + admin panel tutorial |
| Training | **Loom** / pre-recorded videos | Auto-send video walkthrough of admin panel |

**MCP needed:** An `onboarding` MCP server that orchestrates the full setup pipeline.

---

## 4. Full MCP Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR MCP                       │
│            (n8n / Make.com / Custom Python)              │
├─────────────┬──────────────┬──────────────┬─────────────┤
│             │              │              │             │
▼             ▼              ▼              ▼             ▼
┌───────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐
│ Lead  │ │Outreach│ │  Demo    │ │ Sales  │ │Onboard- │
│ Gen   │ │ MCP    │ │Generator │ │Closing │ │  ing    │
│ MCP   │ │        │ │  MCP     │ │  MCP   │ │  MCP    │
└───┬───┘ └───┬────┘ └────┬─────┘ └───┬────┘ └────┬────┘
    │         │            │           │            │
    ▼         ▼            ▼           ▼            ▼
Google Maps  Resend     Vercel API   Stripe    GitHub API
Hunter.io    OpenAI     Puppeteer    PandaDoc  Cloudflare
Apollo.io    LinkedIn   Your App     Lexoffice OpenAI Vision
Airtable     Calendly   Sofia Bot              Resend
```

---

## 5. Specific APIs & Services You Need

### Must-Have (Start Here)

| Service | Cost | Purpose |
|---------|------|---------|
| **Resend** | Free tier (100 emails/day) | Already integrated — cold emails + transactional |
| **OpenAI API** | ~$20/mo | Already integrated — email personalization + menu parsing |
| **Stripe** | 2.9% + €0.25/txn | Payments and subscriptions |
| **Hunter.io** | Free (25 searches/mo), $49/mo (500) | Find restaurant owner emails |
| **Google Maps Places API** | $0.032/request | Find restaurants, get details |
| **n8n** (self-hosted) | Free | Workflow automation (orchestrator) |
| **Airtable** | Free tier | CRM / lead database |
| **Cal.com** | Free (self-hosted) | Booking calls with prospects |

### Nice-to-Have (Scale Phase)

| Service | Cost | Purpose |
|---------|------|---------|
| **Apollo.io** | $49/mo | Better lead enrichment |
| **Phantombuster** | $69/mo | LinkedIn automation |
| **HubSpot CRM** | Free → $50/mo | Professional CRM |
| **PandaDoc** | $35/mo | Contracts & e-signatures |
| **Synthesia** | $29/mo | AI video pitches |
| **Cloudflare** | Free | DNS + CDN for client sites |

---

## 6. The Automation Workflow (End-to-End)

```
WEEK 1: Lead Gen (runs daily, automated)
  ├─ Scrape 50 restaurants/day from Google Maps in Berlin
  ├─ Filter: no website OR website older than 3 years
  ├─ Enrich with owner email via Hunter.io
  └─ Store in Airtable with lead score

WEEK 2: Outreach (runs daily, automated)
  ├─ For each new lead:
  │   ├─ Scrape their menu from Google/Yelp
  │   ├─ Auto-generate a personalized demo site
  │   ├─ Generate personalized email via OpenAI
  │   └─ Send via Resend with demo link + Calendly link
  ├─ Day 3: Auto follow-up if no open
  ├─ Day 7: Second follow-up with social proof
  └─ Track: opens, clicks, replies

WEEK 3-4: Closing (semi-automated)
  ├─ Prospect books call → Calendly sends you notification
  ├─ After call: auto-send proposal via PandaDoc
  ├─ Prospect signs → Stripe payment link auto-sent
  └─ Payment received → Onboarding pipeline triggers

ONGOING: Onboarding (automated)
  ├─ Client fills intake form (Typeform)
  ├─ Menu PDF parsed by OpenAI Vision → imported to database
  ├─ Site generated from template → deployed to Vercel
  ├─ Custom domain connected via Cloudflare API
  ├─ Welcome email with admin credentials sent
  └─ 30-day check-in email scheduled
```

---

## 7. What to Build First (Priority Order)

1. **Lead scraper** — Python script using Google Maps API + Hunter.io → Airtable
2. **Demo generator** — Script that forks your repo, injects restaurant data, deploys a preview to Vercel
3. **Email campaign engine** — Resend + OpenAI for personalized cold emails with demo links
4. **Stripe integration** — Payment links + subscription management
5. **Onboarding pipeline** — n8n workflow that triggers on Stripe payment → generates site → deploys

---

## 8. Financial Projections

| Metric | Month 1-3 | Month 4-6 | Month 7-12 |
|--------|-----------|-----------|------------|
| Emails sent/mo | 500 | 2,000 | 5,000 |
| Response rate | 3% | 5% (better templates) | 7% |
| Demos booked | 15 | 100 | 350 |
| Conversion rate | 20% | 25% | 30% |
| New clients/mo | 3 | 25 | 105 |
| MRR (avg €99/mo) | €297 | €2,475 | €10,395 |
| Setup fees | €2,997 | €24,975 | €104,895 |
| Monthly costs | ~€200 | ~€500 | ~€1,500 |

---

## 9. Your Unfair Advantage

You already have 80% of the product built. Most competitors sell "we'll build you a website in 4 weeks." You can say:

> "Here's your restaurant's website — live, right now, with AI — I built it in 10 minutes. Want to keep it?"

That personalized demo generated automatically from their Google Maps listing is the most powerful sales tool possible. No other competitor can do this at scale.

---

## 10. Next Steps

- [ ] Set up Google Maps API key and build the lead scraper
- [ ] Create the demo generator script (fork → customize → deploy)
- [ ] Build the email campaign engine with Resend + OpenAI
- [ ] Set up Stripe for payment processing
- [ ] Build the n8n onboarding workflow
- [ ] Create landing page for the SaaS product itself
- [ ] Launch pilot with 10 restaurants in Berlin Prenzlauer Berg
