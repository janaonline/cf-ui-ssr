# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development servers
npm start            # Default dev server on port 4100
npm run local        # Local config (port 4100)
npm run dev          # Development config (port 4100)
npm run stag         # Staging config (port 4100)

# Builds
npm run build        # Production build + post-build (version.json generation)
npm run build:dev    # Development build + post-build
npm run build:stag   # Staging build + post-build
npm run build:sm     # Production build with source maps

# SSR server
npm run ssr          # Run SSR server: node dist/cf-ui-ssr/server/server.mjs

# Tests
npm test             # Unit tests via Karma/Jasmine
```

## Architecture

**Angular 20** app with Server-Side Rendering (`@angular/ssr` + Express v5). Standalone components only — no NgModules. Uses **zoneless change detection** (`provideZonelessChangeDetection`).

### SSR Render Modes (`src/app.routes.server.ts`)
- `RenderMode.Server` — `/auth/login`, `/home`, `/municipal-data/**`
- `RenderMode.Client` — `/ulb/:ulbId/:indicatorName` (requires client-side auth)
- `RenderMode.Prerender` — fallback catch-all routes

Express server (`src/server.ts`) serves static assets from `/browser` with 1-year cache and `/version.json` with no-cache for build hash detection.

### Directory Structure

| Path | Purpose |
|------|---------|
| `src/app/core/services/` | Singleton HTTP services (auth, ULB, geographical, SEO, loaders) |
| `src/app/core/security/` | HTTP interceptor — injects auth tokens, handles 401 refresh |
| `src/app/core/guards/` | `authGuard` (require auth), `guestOnlyGuard` (require unauth) |
| `src/app/core/models/` | TypeScript interfaces (user, ULB, state, API responses) |
| `src/app/pages/` | Feature pages (auth/login, dashboard, home, india-map) |
| `src/app/shared/` | Reusable components (header, footer, charts, maps, dialogs) |
| `src/environments/` | Per-environment configs (local, development, staging, production) |
| `public/` | Static assets (served by Express) |

### Authentication (`src/app/core/services/auth.service.ts`)

JWT-based auth via `@auth0/angular-jwt`. **Access token is stored in memory only** (not localStorage) for security. A `session_hint` cookie is used to detect existing sessions on reload.

- `initializeSession()` — called at app bootstrap; restores auth state
- `waitForSessionRestore()` — guards call this before checking auth status
- Token refresh happens automatically on 401 via the HTTP interceptor
- API endpoints (v2): `/auth/login`, `/auth/refresh`, `/auth/logout`

### HTTP Interceptor (`src/app/core/security/custom-http.interceptor.ts`)

All HTTP requests are enriched with:
- `Authorization: Bearer {token}` + `x-access-token` header
- `withCredentials: true` for CORS

Error handling:
- **401** → silent token refresh + single retry (tracked via `AUTH_RETRY_CONTEXT`)
- **440/441** → clear auth state and redirect to `/auth/login`
- **0** (network error) → custom error message

### State Management

Mixed pattern — newer code uses **Angular Signals**, older code uses **RxJS BehaviorSubject**:

```typescript
// Signals (prefer this in new code)
private statesSignal = signal<IState[]>([]);
readonly states = this.statesSignal.asReadonly();
readonly filteredUlbs = computed(() => { ... });

// RxJS (existing pattern)
private searchItem = new BehaviorSubject<any>([]);
castSearchItem = this.searchItem.asObservable();
```

`TransferState` is used to pass data from server render to client, avoiding duplicate HTTP requests.

### Routing (`src/app/app.routes.ts`)

All routes use lazy loading:
```typescript
loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
```

### Environment Configs

Build configurations in `angular.json` swap `src/environments/environment.ts` for the target environment file. Key fields: `api.url` (v1), `api.urlV2` (v2), `isProduction`, `googleTagID`, `STORAGE_BASEURL`.

### Post-Build (`post-build.js`)

Runs after every build. Generates `dist/.../browser/version.json` containing an MD5 hash of built JS files. The `VersionCheckService` polls this endpoint hourly to prompt users to refresh when a new build is deployed.

### Deployment (`ecosystem.config.js`)

PM2 manages four named instances: `cf-ui-ssr` (prod, port 4000), `stag-cf-ui-ssr` (staging), `dev-cf-ui-ssr` (dev, port 4200), `seo-cf-ui-ssr` (port 4100).

### SSR Guard

Before accessing any browser API (localStorage, window, document), check:
```typescript
if (isPlatformBrowser(this.platformId)) { ... }
```
