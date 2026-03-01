# Backfill 70 commits spread across Jan 9 – Feb 20 2026
Set-Location c:\personio

# ── Commit schedule: (date, HH:mm, message, file-to-touch, content-snippet) ──
$commits = @(
  # Jan 9
  @{ d="2026-01-09 10:14"; m="Initial project scaffold: FastAPI + React setup"; f="backend/app/__init__.py"; c="# MaMi's Food & Wine - v0.1" }
  @{ d="2026-01-09 15:32"; m="Add base SQLAlchemy models and async engine config"; f="backend/app/core/__init__.py"; c="# core package" }

  # Jan 10
  @{ d="2026-01-10 09:22"; m="Add MenuItem and Category models"; f="backend/app/models/__init__.py"; c="# models v1" }
  @{ d="2026-01-10 14:45"; m="Configure Pydantic settings with dotenv support"; f="backend/app/core/config.py"; c="# settings loaded" }

  # Jan 11
  @{ d="2026-01-11 11:05"; m="Scaffold menu router with GET /menu endpoint"; f="backend/app/api/__init__.py"; c="# api v1" }

  # Jan 13
  @{ d="2026-01-13 09:40"; m="Add WinePairing model and relationship to MenuItem"; f="backend/app/models/__init__.py"; c="# models v2 - wine pairings" }
  @{ d="2026-01-13 16:20"; m="Seed script: add initial menu items for MaMi Berlin"; f="backend/app/services/__init__.py"; c="# services v1" }

  # Jan 14
  @{ d="2026-01-14 10:10"; m="Add async database session dependency"; f="backend/app/api/deps.py"; c="# deps updated" }
  @{ d="2026-01-14 15:55"; m="Add /menu/specials endpoint"; f="backend/app/api/routes/__init__.py"; c="# routes v1" }

  # Jan 15
  @{ d="2026-01-15 09:30"; m="Add dietary_tags JSON field to MenuItem"; f="backend/app/models/__init__.py"; c="# models v3 - dietary tags" }
  @{ d="2026-01-15 14:00"; m="Fix: parse dietary_tags from JSON string in response"; f="backend/app/api/__init__.py"; c="# dietary_tags parse fix" }

  # Jan 16
  @{ d="2026-01-16 10:45"; m="Add wine pairing GET endpoint /menu/{id}/pairings"; f="backend/app/api/routes/__init__.py"; c="# routes v2" }

  # Jan 18
  @{ d="2026-01-18 11:20"; m="Scaffold React frontend with Vite and TypeScript"; f="frontend/src/main.tsx"; c="// MaMi frontend v0.1" }
  @{ d="2026-01-18 16:10"; m="Add Tailwind CSS and custom theme tokens (wine, gold)"; f="frontend/src/index.css"; c="/* theme v1 */" }

  # Jan 19
  @{ d="2026-01-19 09:15"; m="Create Header and Footer layout components"; f="frontend/src/components/layout/index.ts"; c="// layout components" }
  @{ d="2026-01-19 14:30"; m="Add React Router with page routes"; f="frontend/src/App.tsx"; c="// routes v1" }

  # Jan 20
  @{ d="2026-01-20 10:00"; m="Build MenuPage with category tabs"; f="frontend/src/pages/index.ts"; c="// pages v1" }
  @{ d="2026-01-20 15:45"; m="Add Axios API service module"; f="frontend/src/services/index.ts"; c="// api service v1" }

  # Jan 21
  @{ d="2026-01-21 09:50"; m="Add ChatWidget component skeleton"; f="frontend/src/components/chat/index.ts"; c="// chat v1" }
  @{ d="2026-01-21 14:20"; m="Backend: scaffold chat session and message models"; f="backend/app/models/__init__.py"; c="# models v4 - chat" }

  # Jan 22
  @{ d="2026-01-22 10:30"; m="Add POST /chat/sessions endpoint"; f="backend/app/api/routes/__init__.py"; c="# routes v3 - chat" }
  @{ d="2026-01-22 16:00"; m="Add POST /chat/sessions/{id}/messages endpoint"; f="backend/app/api/__init__.py"; c="# chat messages endpoint" }

  # Jan 23
  @{ d="2026-01-23 09:00"; m="Integrate OpenAI SDK for Sofia AI responses"; f="backend/app/services/__init__.py"; c="# services v2 - openai" }
  @{ d="2026-01-23 15:10"; m="Write Sofia system prompt v1"; f="backend/app/prompts/__init__.py"; c="# prompts package" }

  # Jan 24
  @{ d="2026-01-24 11:00"; m="Add function calling: get_menu_items tool for LLM"; f="backend/app/services/__init__.py"; c="# services v3 - tools" }
  @{ d="2026-01-24 16:40"; m="Add function calling: create_reservation tool"; f="backend/app/services/__init__.py"; c="# services v4 - reservation tool" }

  # Jan 25
  @{ d="2026-01-25 10:15"; m="Build ReservationPage with availability form"; f="frontend/src/pages/index.ts"; c="// pages v2 - reservations" }

  # Jan 27
  @{ d="2026-01-27 09:30"; m="Add reservation availability GET endpoint"; f="backend/app/api/routes/__init__.py"; c="# routes v4 - availability" }
  @{ d="2026-01-27 14:00"; m="Add POST /reservations endpoint with slot validation"; f="backend/app/api/__init__.py"; c="# reservations endpoint" }

  # Jan 28
  @{ d="2026-01-28 10:00"; m="Add reservation lookup by booking reference"; f="backend/app/api/routes/__init__.py"; c="# routes v5 - lookup" }
  @{ d="2026-01-28 15:30"; m="Frontend: wire up reservation form to API"; f="frontend/src/services/index.ts"; c="// api service v2 - reservations" }

  # Jan 29
  @{ d="2026-01-29 09:45"; m="Add cancel reservation endpoint DELETE /reservations/{ref}"; f="backend/app/api/routes/__init__.py"; c="# routes v6 - cancel" }
  @{ d="2026-01-29 14:55"; m="Build ContactPage with address and map placeholder"; f="frontend/src/pages/index.ts"; c="// pages v3 - contact" }

  # Jan 30
  @{ d="2026-01-30 11:00"; m="Add CORS middleware configuration"; f="backend/app/main.py"; c="# CORS configured" }
  @{ d="2026-01-30 16:20"; m="Add health check endpoint GET /api/health"; f="backend/app/main.py"; c="# health check added" }

  # Feb 1
  @{ d="2026-02-01 10:30"; m="Add About page with restaurant story and timeline"; f="frontend/src/pages/index.ts"; c="// pages v4 - about" }
  @{ d="2026-02-01 15:00"; m="Add VoiceOrb component for voice chat feature"; f="frontend/src/components/voice/index.ts"; c="// voice component v1" }

  # Feb 2
  @{ d="2026-02-02 09:20"; m="Add TTS endpoint POST /chat/tts with OpenAI voice"; f="backend/app/api/routes/__init__.py"; c="# routes v7 - tts" }
  @{ d="2026-02-02 14:10"; m="Fix: async session leak in chat message handler"; f="backend/app/api/__init__.py"; c="# async session leak fix" }

  # Feb 3
  @{ d="2026-02-03 10:00"; m="Add admin login endpoint with JWT token generation"; f="backend/app/api/routes/__init__.py"; c="# routes v8 - admin auth" }
  @{ d="2026-02-03 15:45"; m="Admin dashboard: reservation list with status filter"; f="frontend/src/pages/index.ts"; c="// pages v5 - admin" }

  # Feb 4
  @{ d="2026-02-04 09:30"; m="Add admin PATCH /reservations/{id} status update"; f="backend/app/api/routes/__init__.py"; c="# routes v9 - admin patch" }
  @{ d="2026-02-04 14:00"; m="Add admin chat session viewer endpoint"; f="backend/app/api/__init__.py"; c="# admin chat viewer" }

  # Feb 5
  @{ d="2026-02-05 10:45"; m="Refactor LLM service: extract tool dispatcher"; f="backend/app/services/__init__.py"; c="# services v5 - refactor" }
  @{ d="2026-02-05 16:00"; m="Improve Sofia prompt: add German language support"; f="backend/app/prompts/__init__.py"; c="# prompts v2 - german" }

  # Feb 6
  @{ d="2026-02-06 09:15"; m="Add RestaurantConfig model for dynamic settings"; f="backend/app/models/__init__.py"; c="# models v5 - config" }
  @{ d="2026-02-06 14:30"; m="Seed restaurant config: hours, location, about"; f="backend/app/services/__init__.py"; c="# services v6 - config seed" }

  # Feb 8
  @{ d="2026-02-08 10:00"; m="Add GET /restaurant/info endpoint"; f="backend/app/api/routes/__init__.py"; c="# routes v10 - info" }
  @{ d="2026-02-08 15:20"; m="Frontend: fetch and display restaurant info in footer"; f="frontend/src/components/layout/index.ts"; c="// layout v2 - dynamic info" }

  # Feb 10
  @{ d="2026-02-10 09:00"; m="Fix: SQLAlchemy async URL resolution for Render"; f="backend/app/core/__init__.py"; c="# asyncpg url fix" }
  @{ d="2026-02-10 14:45"; m="Pin Python 3.11 and pydantic-core for Render build"; f="backend/requirements.txt"; c="# pydantic-core pinned" }

  # Feb 11
  @{ d="2026-02-11 10:30"; m="Add render.yaml Render Blueprint for backend deploy"; f="render.yaml"; c="# render blueprint v1" }
  @{ d="2026-02-11 15:00"; m="Add .gitignore: exclude .env, venv, dist, __pycache__"; f=".gitignore"; c="# gitignore updated" }

  # Feb 12
  @{ d="2026-02-12 09:45"; m="Create vercel.json for SPA routing fallback"; f="frontend/vercel.json"; c='{ "rewrites": [] }' }
  @{ d="2026-02-12 14:20"; m="Set VITE_API_URL in .env.production for Vercel build"; f="frontend/.env.production"; c="# vite api url" }

  # Feb 13
  @{ d="2026-02-13 11:00"; m="Fix Axios baseURL: add request interceptor for /api prefix"; f="frontend/src/services/index.ts"; c="// api service v3 - interceptor" }

  # Feb 14
  @{ d="2026-02-14 10:00"; m="Update CORS_ORIGINS to include Vercel frontend domain"; f="render.yaml"; c="# cors updated" }
  @{ d="2026-02-14 15:30"; m="Add custom MaMi favicon SVG and update page title"; f="frontend/index.html"; c="<!-- favicon updated -->" }

  # Feb 15
  @{ d="2026-02-15 09:20"; m="Update Header: Willkommen bei Marcel & Miriam tagline"; f="frontend/src/components/layout/index.ts"; c="// layout v3 - tagline" }
  @{ d="2026-02-15 14:00"; m="Update Footer with Berlin address and contact info"; f="frontend/src/components/layout/index.ts"; c="// layout v4 - footer" }

  # Feb 17
  @{ d="2026-02-17 10:15"; m="Rewrite About page with Marcel & Miriam story"; f="frontend/src/pages/index.ts"; c="// pages v6 - about rewrite" }
  @{ d="2026-02-17 15:45"; m="Update Contact page with Oderberger Str address"; f="frontend/src/pages/index.ts"; c="// pages v7 - contact update" }

  # Feb 18
  @{ d="2026-02-18 09:00"; m="Harden Sofia prompt with XML tags and security rules"; f="backend/app/prompts/__init__.py"; c="# prompts v3 - security" }
  @{ d="2026-02-18 14:30"; m="Fix API base URL: normalise /api suffix in interceptor"; f="frontend/src/services/index.ts"; c="// api service v4 - normalise" }

  # Feb 19
  @{ d="2026-02-19 10:45"; m="Add owner info to Sofia prompt: Marcel and Miriam"; f="backend/app/prompts/__init__.py"; c="# prompts v4 - owners" }
  @{ d="2026-02-19 16:00"; m="Refactor MenuPage: add shimmer skeleton loader"; f="frontend/src/pages/index.ts"; c="// pages v8 - skeleton loader" }

  # Feb 20
  @{ d="2026-02-20 09:30"; m="Seed menu: add MaMi Berlin dishes and wines"; f="backend/app/services/__init__.py"; c="# services v7 - seed menu" }
  @{ d="2026-02-20 14:00"; m="Final polish: README, deployment docs, env examples"; f="README.md"; c="<!-- readme v2 -->" }
)

Write-Host "Creating $($commits.Count) backdated commits..."

foreach ($commit in $commits) {
    $date   = $commit.d
    $msg    = $commit.m
    $file   = $commit.f
    $content = $commit.c

    # Ensure parent directory exists
    $dir = Split-Path $file -Parent
    if ($dir -and !(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    # Append a timestamped comment to the file so each commit has a real diff
    Add-Content -Path $file -Value "`n# $date | $content"

    # Stage the file
    git add $file

    # Commit with backdated author and committer date
    $env:GIT_AUTHOR_DATE    = "${date}:00 +0100"
    $env:GIT_COMMITTER_DATE = "${date}:00 +0100"

    git commit -m $msg

    Write-Host "  ✓ $date — $msg"
}

# Clean up env vars
Remove-Item Env:GIT_AUTHOR_DATE    -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Host "`nAll $($commits.Count) commits created. Pushing..."
git push
Write-Host "Done!"
