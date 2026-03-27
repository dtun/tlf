# The Logical Foundation

**Our Mission: Distribute Prosperity with Universal Basic Income**

A mobile-first single-page application for onboarding donors, pledgers, and community members to The Logical Foundation's UBI programs in Arizona.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Database | Supabase (managed PostgreSQL with RLS) |
| Auth | Supabase Auth (email/password, OTP, password reset) |
| Hosting | Vercel (SPA + serverless functions) |
| CI | GitHub Actions (typecheck + Vitest + npm audit + CodeQL) |

---

## Local Development

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase`)

### Setup

```bash
git clone https://github.com/dtun/tlf.git
cd tlf
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### Local Supabase (optional)

```bash
supabase start       # Runs local Postgres + Auth via Docker
supabase db push     # Apply migrations
```

### Run

```bash
npm run dev          # http://localhost:5173
```

---

## Testing

```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run typecheck    # Type check only
```

---

## Security

This project addresses the following security concerns by design:

| Area | Approach |
|---|---|
| **Input sanitization** | Evidence sanitized + XML-wrapped before OpenAI calls. Email HTML sanitized with `sanitize-html`. |
| **Rate limiting** | Vercel Edge Middleware with per-endpoint IP-based limits. |
| **Auth** | Supabase Auth with 8-char minimum password. Session invalidated on password change. |
| **Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy via `vercel.json`. |
| **CSRF** | Bearer token auth (not cookie-based). Origin validation on admin routes. |
| **Data exposure** | Column-filtered admin queries. Admin audit log tracks all admin actions. |
| **Email** | SMTP fails hard without credentials. HTML bodies sanitized before inclusion in templates. |
| **Privacy** | PII stripped from localStorage persistence. Only step position and non-sensitive state stored. |
| **CI** | `npm audit`, CodeQL analysis, type checking, and test suite on every push/PR. |

---

## Deployment

Deploys to **Vercel** on push to `main`.

### Environment Variables (Vercel Dashboard)

| Variable | Type | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Build | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Build | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime | Service role key (admin APIs) |
| `SMTP_HOST` | Runtime | SMTP host |
| `SMTP_PORT` | Runtime | SMTP port |
| `SMTP_USER` | Runtime | SMTP username |
| `SMTP_PASS` | Runtime | SMTP password (required) |
| `OPENAI_API_KEY` | Runtime | OpenAI key (AI search/mission review) |
| `ALLOWED_ORIGINS` | Runtime | Comma-separated allowed origins for CORS |

---

## Project Structure

```
tlf/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # useAppState (no PII in localStorage)
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client
│   │   └── api.ts          # Typed API (Supabase + serverless)
│   ├── steps/              # Onboarding step components
│   └── types.ts            # Shared TypeScript types
├── api/                    # Vercel serverless functions
│   ├── _lib/               # Shared helpers (auth, email, sanitize)
│   ├── admin/              # Admin endpoints (audit-logged)
│   ├── missions/           # Mission submission (AI pre-screening)
│   └── contact/            # Public contact form
├── supabase/
│   └── migrations/         # SQL schema + RLS + functions
├── middleware.ts            # Rate limiting
├── .github/workflows/      # CI pipeline
└── vercel.json             # Deployment + security headers
```

---

## License

(c) The Logical Foundation. All rights reserved.
