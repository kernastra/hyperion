![Hyperion](img.png)

# Hyperion

A full-featured web dashboard for [yt-dlp](https://github.com/yt-dlp/yt-dlp), built with Next.js 15 and TypeScript. Download videos and audio from YouTube and 1000+ other platforms through a clean, responsive UI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

## Features

- **Dashboard** — Live stats, download activity chart, format distribution, and recent history
- **Downloads** — URL input with video info preview, format/quality selection, audio-only mode
- **Queue** — Real-time progress tracking for active downloads with speed, ETA, and cancel controls
- **History** — Searchable and filterable log of all completed and failed downloads
- **Settings** — Configurable yt-dlp path, download directory, format defaults, proxy, and cookies
- **Dark Mode** — Full dark/light theme with system preference detection and manual toggle
- **Responsive** — Desktop sidebar layout, mobile bottom tab bar

## Prerequisites

- **Node.js** v18 or later
- **yt-dlp** installed and accessible on your system
- **ffmpeg** (optional — required for merging separate video+audio streams)

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

## Installation

```bash
git clone https://github.com/kernastra/hyperion.git
cd hyperion
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For a production build:

```bash
npm run build
npm start
```

## Configuration

All settings are persisted to `hyperion.config.json` in the project root. You can edit this file directly or use the **Settings** page in the UI.

| Setting | Default | Description |
|---|---|---|
| `ytDlpPath` | `yt-dlp` | Full path to the yt-dlp binary (e.g. `/home/user/.local/bin/yt-dlp`) |
| `downloadPath` | `./downloads` | Directory where downloaded files are saved |
| `defaultQuality` | `best` | Default quality selection (`best`, `1080p`, `720p`, etc.) |
| `defaultFormat` | `mp4` | Preferred container format (`mp4`, `webm`, `mkv`) |
| `cookiesPath` | _(empty)_ | Path to a Netscape-format cookies file for authentication |
| `proxy` | _(empty)_ | HTTP/HTTPS proxy URL |

> `hyperion.config.json` is listed in `.gitignore` and will not be committed. It is created automatically on first run.

### Finding your yt-dlp path

```bash
which yt-dlp
# Example output: /home/user/.local/bin/yt-dlp
```

Set this path in **Settings > General > yt-dlp path** or directly in `hyperion.config.json`.

## Cookie Authentication

To download age-restricted or login-required content (e.g. YouTube sign-in required, Instagram), export your browser cookies to a Netscape-format `cookies.txt` file and set the path in **Settings > Network > Cookies file**.

### Exporting cookies from your browser

Use a browser extension such as [Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) (Chrome) or [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/) (Firefox). Export cookies for the site you want to download from and save the file to your machine.

The app creates a temporary copy of the cookies file before each download so yt-dlp cannot overwrite it.

## Cloud and Datacenter IPs

YouTube and some other platforms block downloads originating from datacenter IP ranges (GitHub Codespaces, AWS, Azure, GCP, etc.). If you see errors like `Sign in to confirm you're not a bot`, configure a residential proxy in **Settings > Network > Proxy** or run the app on a local machine.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
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
|---|---|---|
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
│   │   ├── simple-download-form-basic.tsx # URL input form with video info preview
│   │   └── downloads-sidebar-enhanced.tsx # Active downloads panel (right sidebar)
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

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3, custom color palette |
| Components | shadcn/ui, Radix UI primitives, Lucide icons |
| Theming | next-themes (dark/light mode, system preference) |
| Download engine | yt-dlp spawned via Node.js `child_process` |
| Progress streaming | Server-Sent Events (SSE) |
| State management | React Context + localStorage |

## Troubleshooting

**yt-dlp not found**
Set the full binary path in **Settings > General** (e.g. `/home/user/.local/bin/yt-dlp`). Verify with `which yt-dlp`.

**"Sign in to confirm you're not a bot" / bot detection errors**
Your IP may be blocked. Export cookies from a logged-in browser session and configure the path in **Settings > Network > Cookies file**. If running on a cloud server, use a residential proxy.

**"Requested format is not available"**
Try selecting a different quality preset, or set quality to **Best** to let yt-dlp choose automatically.

**ffmpeg missing — merge errors**
Some formats (MP4 with separate video and audio streams, certain 1080p+ resolutions) require ffmpeg to merge the streams. Install ffmpeg and restart the dev server.

**Downloads not saving**
Confirm the configured download path exists and is writable by the process running the app:
```bash
ls -la ./downloads
# or your configured path
```

**Port already in use**
If you see `EADDRINUSE`, another process is using port 3000. Kill it:
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

## License

MIT
