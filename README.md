# Hyperion — Self-hosted web dashboard for yt-dlp

<p align="center">
  <img src="docs/assets/hero.png" alt="Hyperion — Self-hosted web dashboard for yt-dlp" width="100%" />
</p>

[![CI](https://github.com/kernastra/hyperion/actions/workflows/ci.yml/badge.svg)](https://github.com/kernastra/hyperion/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

## Overview

Hyperion is a full-featured web dashboard for [yt-dlp](https://github.com/yt-dlp/yt-dlp), built with Next.js 15 and TypeScript. Download videos and audio from YouTube and 1000+ other platforms through a clean, responsive UI. Whether you're on desktop or mobile, Hyperion provides real-time progress tracking, format selection, and a complete download history in one place.

## Features

- **Dashboard** — Live stats, download activity chart, format distribution, and recent history
- **Downloads** — URL input with video info preview, format/quality selection, audio-only mode
- **Queue** — Real-time progress tracking for active downloads with speed, ETA, and cancel controls
- **History** — Searchable and filterable log of all completed and failed downloads
- **Settings** — Configurable yt-dlp path, download directory, format defaults, proxy, and cookies
- **Dark Mode** — Full dark/light theme with system preference detection and manual toggle
- **Responsive** — Desktop sidebar layout, mobile bottom tab bar

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 15 (App Router, Turbopack) + TypeScript 5 |
| **Styling** | Tailwind CSS 3 with custom color palette |
| **Components** | shadcn/ui, Radix UI primitives, Lucide icons |
| **Theming** | next-themes (dark/light mode, system preference) |
| **Download Engine** | yt-dlp spawned via Node.js `child_process` |
| **Progress Streaming** | Server-Sent Events (SSE) |
| **State Management** | React Context + localStorage |

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** (this project uses `package-lock.json`, not pnpm or yarn)
- **yt-dlp** installed and accessible on your system
- **ffmpeg** (optional — required for merging separate video+audio streams)

To install yt-dlp and ffmpeg:

```bash
# Install yt-dlp
pip install "yt-dlp[default]"

# Install ffmpeg (Ubuntu/Debian)
sudo apt install ffmpeg

# Install ffmpeg (macOS)
brew install ffmpeg

# Verify installations
yt-dlp --version
ffmpeg -version
```

### Installation

```bash
# Clone the repository
git clone https://github.com/kernastra/hyperion.git
cd hyperion

# Install dependencies
npm install

# Set up configuration (see Configuration section below)
```

### Configuration

All settings are persisted to `hyperion.config.json` in the project root. You can edit this file directly or use the **Settings** page in the UI.

| Setting | Default | Description |
|---------|---------|-------------|
| `ytDlpPath` | `yt-dlp` | Full path to the yt-dlp binary (e.g. `/home/user/.local/bin/yt-dlp`) |
| `downloadPath` | `./downloads` | Directory where downloaded files are saved |
| `defaultQuality` | `best` | Default quality selection (`best`, `1080p`, `720p`, etc.) |
| `defaultFormat` | `mp4` | Preferred container format (`mp4`, `webm`, `mkv`) |
| `cookiesPath` | _(empty)_ | Path to a Netscape-format cookies file for authentication |
| `proxy` | _(empty)_ | HTTP/HTTPS proxy URL |

**Setup steps:**

1. Clone and install (see Installation section above)
2. Start the dev server: `npm run dev`
3. Open http://localhost:3000 in your browser
4. The app creates `hyperion.config.json` on first run with default settings
5. Configure yt-dlp path and download directory in **Settings > General**

**Finding your yt-dlp path:**

```bash
which yt-dlp
# Example output: /home/user/.local/bin/yt-dlp
```

Set this path in **Settings > General > yt-dlp path** or directly in `hyperion.config.json`.

## Usage

### Running the app locally

```bash
# Start the development server with Turbopack
npm run dev

# Open http://localhost:3000 in your browser
```

### Production build

```bash
npm run build
npm start
```

### Basic workflow

1. Enter a YouTube or other supported platform URL
2. Preview the video title, duration, and available formats
3. Select quality and format preferences
4. Click **Download** to start
5. Monitor progress in the **Queue** tab in real-time
6. View completed/failed downloads in **History**

### Cookie authentication

To download age-restricted or login-required content (e.g. YouTube sign-in, Instagram):

1. Export your browser cookies to a Netscape-format `cookies.txt` file using an extension like [Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) (Chrome) or [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/) (Firefox)
2. Set the path in **Settings > Network > Cookies file**
3. The app creates a temporary copy of the cookies file before each download so yt-dlp cannot overwrite it

### Handling datacenter IPs

YouTube and some platforms block downloads from datacenter IP ranges (GitHub Codespaces, AWS, Azure, GCP, etc.). If you see errors like `Sign in to confirm you're not a bot`:

- Configure a residential proxy in **Settings > Network > Proxy**, or
- Run the app on a local machine with a residential IP

<!-- ===== Repo-Specific Sections ===== -->

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/download` | Start a download — returns an SSE stream with progress events |
| `POST` | `/api/video-info` | Fetch video metadata (title, duration, formats) via yt-dlp |
| `GET` | `/api/history` | List all download history records |
| `POST` | `/api/history` | Add a history record |
| `DELETE` | `/api/history` | Clear history — all records or a specific one by `id` |
| `GET` | `/api/settings` | Read the current configuration |
| `POST` | `/api/settings` | Update configuration |
| `GET` | `/api/system-status` | Check yt-dlp and ffmpeg availability |

### SSE download stream events

The `POST /api/download` endpoint streams [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) with the following event types:

| Event | Payload | Description |
|-------|---------|-------------|
| `progress` | `{ percent, speed, eta }` | Download progress update |
| `complete` | `{ filename, path }` | Download finished successfully |
| `error` | `{ message }` | Download failed |

## Project Structure

```
hyperion/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── download/route.ts         # SSE streaming download endpoint
│   │   │   ├── video-info/route.ts       # Video metadata via yt-dlp --dump-json
│   │   │   ├── history/route.ts          # Download history CRUD (GET/POST/DELETE)
│   │   │   ├── settings/route.ts         # Config read/write (hyperion.config.json)
│   │   │   └── system-status/route.ts    # yt-dlp and ffmpeg health check
│   │   ├── dashboard/page.tsx            # Dashboard with stats and charts
│   │   ├── queue/page.tsx                # Active download queue with progress
│   │   ├── history/page.tsx              # Download history with search/filter
│   │   ├── settings/page.tsx             # App settings UI
│   │   ├── layout.tsx                    # Root layout with providers
│   │   └── page.tsx                      # Downloads page (URL input + preview)
│   ├── components/
│   │   ├── ui/                           # shadcn/ui base components (button, card, etc.)
│   │   ├── main-layout.tsx               # 3-column shell (sidebar + main + right panel)
│   │   ├── sidebar-navigation.tsx        # Desktop sidebar + mobile bottom tab bar
│   │   ├── client-providers.tsx          # ThemeProvider + DownloadProvider wrapper
│   │   ├── add-download-modal.tsx        # Quick-add modal accessible from any page
│   │   ├── simple-download-form.tsx      # URL input form with video info preview
│   │   └── downloads-sidebar.tsx         # Active downloads panel (right sidebar)
│   ├── contexts/
│   │   └── DownloadContext.tsx           # Shared download state across all pages
│   ├── hooks/
│   │   └── useDownloadManager.ts         # Core download logic + localStorage persistence
│   └── lib/
│       ├── config.ts                     # Server-side config (reads hyperion.config.json)
│       ├── download-history.ts           # In-memory history singleton (server-side)
│       └── utils.ts                      # Shared utility functions (cn, etc.)
├── downloads/                            # Default download output directory
├── hyperion.config.json                  # Runtime config (auto-created, gitignored)
├── tailwind.config.js                    # Tailwind CSS configuration with custom palette
├── postcss.config.js                     # PostCSS configuration
└── next.config.ts                        # Next.js configuration
```

## Troubleshooting

**yt-dlp not found**

Set the full binary path in **Settings > General** (e.g. `/home/user/.local/bin/yt-dlp`). Verify with `which yt-dlp`.

**"Sign in to confirm you're not a bot" / bot detection errors**

Your IP may be blocked by YouTube or the platform. Export cookies from a logged-in browser session and configure the path in **Settings > Network > Cookies file**. If running on a cloud server, use a residential proxy.

**"Requested format is not available"**

Try selecting a different quality preset, or set quality to **Best** to let yt-dlp choose automatically.

**ffmpeg missing — merge errors**

Some formats (MP4 with separate video and audio streams, certain 1080p+ resolutions) require ffmpeg to merge the streams. Install ffmpeg and restart the dev server.

**Downloads not saving**

Confirm the configured download path exists and is writable by the process running the app:

```bash
ls -la ./downloads
# or your configured path
chmod 755 ./downloads
```

**Port already in use**

If you see `EADDRINUSE`, another process is using port 3000. Kill it:

```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting issues, submitting PRs, and our code of conduct.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
