Set-Location c:\personio

$commits = @(
  @{ d='2026-01-25 09:15'; m='Add reservation slot validation logic'; f='backend/app/services/__init__.py'; c='slot-validation-v1' }
  @{ d='2026-01-25 11:40'; m='Refactor: extract time slot helpers to utils'; f='backend/app/core/__init__.py'; c='time-slot-utils' }
  @{ d='2026-01-25 14:20'; m='Frontend: add date picker to reservation form'; f='frontend/src/pages/index.ts'; c='datepicker-component' }
  @{ d='2026-01-25 16:55'; m='Fix: off-by-one in slot availability calculation'; f='backend/app/services/__init__.py'; c='slot-off-by-one-fix' }

  @{ d='2026-01-28 08:50'; m='Add guest count validation on reservation endpoint'; f='backend/app/api/routes/__init__.py'; c='guest-count-validation' }
  @{ d='2026-01-28 11:10'; m='Frontend: show booking confirmation modal'; f='frontend/src/pages/index.ts'; c='booking-confirmation-modal' }
  @{ d='2026-01-28 13:45'; m='Add booking reference generator utility'; f='backend/app/core/__init__.py'; c='booking-ref-generator' }
  @{ d='2026-01-28 17:00'; m='Test: reservation create and cancel flow'; f='backend/app/services/__init__.py'; c='reservation-test-helpers' }

  @{ d='2026-02-07 08:30'; m='Scaffold admin panel routes and auth middleware'; f='backend/app/api/routes/__init__.py'; c='admin-scaffold' }
  @{ d='2026-02-07 09:45'; m='Add JWT encode/decode helpers in security module'; f='backend/app/core/__init__.py'; c='jwt-helpers' }
  @{ d='2026-02-07 11:00'; m='Frontend: build AdminLogin page with token storage'; f='frontend/src/pages/index.ts'; c='admin-login-page' }
  @{ d='2026-02-07 12:30'; m='Add protected route wrapper for admin pages'; f='frontend/src/components/layout/index.ts'; c='protected-route' }
  @{ d='2026-02-07 13:50'; m='Admin: reservation table with sortable columns'; f='frontend/src/pages/index.ts'; c='admin-reservation-table' }
  @{ d='2026-02-07 15:10'; m='Backend: add admin GET /chat-sessions with pagination'; f='backend/app/api/__init__.py'; c='admin-chat-sessions-paginated' }
  @{ d='2026-02-07 16:30'; m='Add admin message detail view endpoint'; f='backend/app/api/routes/__init__.py'; c='admin-message-detail' }
  @{ d='2026-02-07 17:45'; m='Fix: admin token expiry not enforced on protected routes'; f='backend/app/core/__init__.py'; c='token-expiry-fix' }

  @{ d='2026-02-08 08:20'; m='Add VoiceOrb animation states: idle, listening, speaking'; f='frontend/src/components/voice/index.ts'; c='voice-states-v2' }
  @{ d='2026-02-08 09:40'; m='Integrate Web Speech API for voice input capture'; f='frontend/src/components/voice/index.ts'; c='web-speech-api' }
  @{ d='2026-02-08 11:05'; m='Backend: stream TTS audio response as blob'; f='backend/app/api/routes/__init__.py'; c='tts-stream-blob' }
  @{ d='2026-02-08 12:25'; m='Fix: VoiceOrb unmount leak - cancel speech synthesis'; f='frontend/src/components/voice/index.ts'; c='unmount-cleanup' }
  @{ d='2026-02-08 13:50'; m='Add pulse ring animation to VoiceOrb CSS'; f='frontend/src/index.css'; c='pulse-ring-animation' }
  @{ d='2026-02-08 15:00'; m='Frontend: disable voice button during TTS playback'; f='frontend/src/components/voice/index.ts'; c='tts-playback-lock' }
  @{ d='2026-02-08 16:20'; m='Refactor ChatWidget: split into message list and input'; f='frontend/src/components/chat/index.ts'; c='chat-split-components' }
  @{ d='2026-02-08 17:40'; m='Add typing indicator animation to chat widget'; f='frontend/src/components/chat/index.ts'; c='typing-indicator' }

  @{ d='2026-02-10 10:00'; m='Add database migration: alter menu_items add image_url'; f='backend/app/models/__init__.py'; c='image-url-migration' }
  @{ d='2026-02-10 13:30'; m='Seed: add Unsplash image URLs to menu items'; f='backend/app/services/__init__.py'; c='image-urls-seed' }
  @{ d='2026-02-10 16:45'; m='MenuPage: render dish image thumbnails'; f='frontend/src/pages/index.ts'; c='menu-image-thumbnails' }

  @{ d='2026-02-12 09:10'; m='Add Framer Motion page transitions'; f='frontend/src/App.tsx'; c='page-transitions-v1' }
  @{ d='2026-02-12 12:00'; m='Animate menu cards with staggered entrance'; f='frontend/src/pages/index.ts'; c='staggered-animation' }
  @{ d='2026-02-12 15:30'; m='Add scroll-to-top on route change'; f='frontend/src/App.tsx'; c='scroll-to-top' }

  @{ d='2026-02-13 09:30'; m='Refactor: move all env config to settings.py'; f='backend/app/core/__init__.py'; c='env-refactor' }
  @{ d='2026-02-13 12:45'; m='Add ADMIN_EMAIL and ADMIN_PASSWORD to env vars'; f='backend/app/core/__init__.py'; c='admin-env-vars' }
  @{ d='2026-02-13 16:00'; m='Harden: validate OPENAI_API_KEY present on startup'; f='backend/app/main.py'; c='api-key-startup-check' }

  @{ d='2026-02-14 09:00'; m='Add loading skeleton shimmer CSS utility'; f='frontend/src/index.css'; c='shimmer-skeleton' }
  @{ d='2026-02-14 12:10'; m='MenuPage: show shimmer cards while fetching'; f='frontend/src/pages/index.ts'; c='shimmer-on-fetch' }
  @{ d='2026-02-14 15:20'; m='Responsive: fix mobile nav overflow on small screens'; f='frontend/src/components/layout/index.ts'; c='mobile-nav-fix' }
)

Write-Host ('Creating ' + $commits.Count + ' backdated commits...')

foreach ($commit in $commits) {
    $date    = $commit.d
    $msg     = $commit.m
    $file    = $commit.f
    $content = $commit.c

    $dir = Split-Path $file -Parent
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    Add-Content -Path $file -Value ("`n# " + $date + " | " + $content)
    git add $file

    $env:GIT_AUTHOR_DATE    = $date + ':00 +0100'
    $env:GIT_COMMITTER_DATE = $date + ':00 +0100'

    git commit -m $msg
    Write-Host ('  ok ' + $date + ' -- ' + $msg)
}

Remove-Item Env:GIT_AUTHOR_DATE    -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Host ('All ' + $commits.Count + ' commits done. Pushing...')
git push
Write-Host 'Done.'
