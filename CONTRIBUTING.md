# Contributing to Hyperion

Thank you for contributing! This guide will help you set up the project, understand its structure, and submit changes.

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** (not pnpm or yarn — this project uses `package-lock.json`)
- **yt-dlp** installed on your system
- **ffmpeg** (optional, but required for certain format merges)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/kernastra/hyperion.git
cd hyperion
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will create `hyperion.config.json` on first run with default settings. You can also copy `.env.example` to `.env.local` if you need to override `YTDLP_PATH` or other environment variables. See the [README](README.md#configuration) for configuration details.

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `npm run dev` | Start dev server with Turbopack |
| `build` | `npm run build` | Build for production |
| `start` | `npm run start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |
| `test` | `npm run test` | Run test suite once (Vitest) |
| `test:watch` | `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── download/route.ts       # SSE streaming for downloads
│   │   ├── video-info/route.ts     # Video metadata from yt-dlp
│   │   ├── history/route.ts        # Download history CRUD
│   │   ├── settings/route.ts       # Config read/write
│   │   └── system-status/route.ts  # Health checks
│   ├── dashboard/page.tsx          # Stats and charts
│   ├── queue/page.tsx              # Active downloads
│   ├── history/page.tsx            # Download log
│   ├── settings/page.tsx           # Configuration UI
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Downloads page (main)
├── components/             # React components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── main-layout.tsx     # 3-column layout shell
│   ├── sidebar-navigation.tsx
│   ├── simple-download-form.tsx        # CANONICAL: URL input + preview
│   ├── downloads-sidebar.tsx           # CANONICAL: active downloads panel
│   ├── client-providers.tsx
│   ├── add-download-modal.tsx
│   └── theme-toggle.tsx
├── contexts/               # React Context providers
│   └── DownloadContext.tsx
├── hooks/                  # Custom hooks
│   └── useDownloadManager.ts
└── lib/                    # Server utilities and helpers
    ├── config.ts           # Config file handling
    ├── url-security.ts     # SSRF/private IP validation
    ├── fs-security.ts      # Path confinement checks
    ├── download-history.ts # History in-memory store
    └── utils.ts            # Shared utilities
```

## Component Conventions

**This project was recently consolidated from many duplicate component variants to canonical versions.** Please follow this rule strictly:

### Canonical Components

Use these components directly; do not create alternate variants:
- **`src/components/simple-download-form.tsx`** — URL input form with video info preview. Use this for all download-form UIs.
- **`src/components/downloads-sidebar.tsx`** — Active downloads panel showing progress. Use this for all download tracking UIs.

### No Duplicate Variants

**Do NOT create** components with suffixes like:
- `-new`, `-enhanced`, `-basic`, `-simple`
- `-v2`, `-alt`, `-old`
- Any other variant naming

If you need to modify behavior, extend the canonical component directly or add props/configuration. Pull requests introducing duplicate components will be rejected.

If the canonical component doesn't fit your needs, discuss in an issue first — we'll either extend it or document why a new component is justified.

## Security-Sensitive Code

Several files enforce safeguards against SSRF and path traversal attacks. **Do not weaken these.**

### URL Security (`src/lib/url-security.ts`)

Validates that URLs are HTTP(S) and point to public IPs (blocks localhost, private ranges, link-local, ULA):

- Rejects `http://127.0.0.1/`, `http://localhost/`, `http://192.168.x.x/`, IPv6 loopback/ULA
- Accepts public hostnames and public IP addresses
- Uses DNS resolution for hostname validation

**Tests:** `src/lib/url-security.test.ts` — runs test suite before merging:
```bash
npm run test
```

Any change to input validation in `/api/video-info` or `/api/download` routes must preserve these checks and pass tests.

### Filesystem Security (`src/lib/fs-security.ts`)

Ensures downloaded files stay within the configured download directory (no `../` escapes):

- Validates that resolved paths are children of `downloadPath`
- Prevents symlink-based escapes
- Rejects absolute paths in filenames

**Tests:** `src/lib/fs-security.test.ts`

If you modify how files are saved or renamed, ensure the security layer still applies. Add tests if you change the logic.

## Testing

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch
```

### Test Structure

Tests are colocated with source files:
- `*.test.ts` for utility/logic tests
- `*.test.tsx` for component tests

Examples:
- `src/lib/url-security.test.ts` — unit tests for URL validation
- `src/components/simple-download-form.test.tsx` — component rendering tests

### Test Tools

- **Vitest** — test runner (configured in `package.json` scripts)
- **React Testing Library** — component testing
- **jsdom** — DOM environment

### Test Expectations

- **New features** should include tests
- **Bug fixes** should include a test that reproduces the bug, then confirms the fix
- **Security changes** (especially in `url-security.ts` and `fs-security.ts`) must pass existing tests and add new ones for edge cases

Example test:
```typescript
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('renders a button', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## Pull Requests

1. **Branch off `main`:**
```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

2. **Make your changes** — keep commits focused and logical.

3. **Run checks locally** before pushing:
```bash
npm run lint
npm run build
npm run test
```

All three must pass. The CI pipeline will run them again.

4. **Write a clear PR description** — explain what changed and why. If it fixes an issue, link it (`Fixes #123`).

5. **Keep changes surgical:**
   - Only modify files needed for the feature or fix
   - Don't reformat unrelated code
   - Match the existing code style
   - Don't refactor things that aren't broken

6. **Submit the PR** — the GitHub Actions workflow will verify lint, build, and tests pass. Respond to feedback promptly.

## Questions?

If you're unsure about anything:
- Check the [README](README.md) for project overview and configuration
- Look at existing code in the same area for patterns
- Open an issue or discussion before starting large changes
- Ask in the PR if something seems unclear during review

Thanks for contributing to Hyperion!
