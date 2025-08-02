# Hyperion

A modern web interface for [yt-dlp](https://github.com/yt-dlp/yt-dlp), built with Next.js 15 and TypeScript.

## Features

- 🎬 **Video Downloads**: Download videos from YouTube and other supported platforms
- 🎵 **Audio Extraction**: Extract audio-only files in various formats
- 📊 **Real-time Progress**: Live download progress with speed and ETA information  
- 📝 **Download Queue**: Manage multiple downloads simultaneously
- 📁 **Download History**: Track completed and failed downloads
- 🎨 **Modern UI**: Clean, responsive interface built with shadcn/ui
- ⚡ **Fast**: Built with Next.js 15 and Turbopack for optimal performance

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or later)
2. **yt-dlp** installed and accessible in your PATH
   ```bash
   # Install yt-dlp
   pip install yt-dlp
   # Or using package manager
   sudo apt install yt-dlp  # Ubuntu/Debian
   brew install yt-dlp      # macOS
   ```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ytdlp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Download a Video

1. Go to the **Download** tab
2. Enter one or more video URLs
3. Select your preferred format and quality
4. Choose audio-only if you only want the audio
5. Optionally set a custom download path
6. Click **Start Download**

### Monitor Downloads

- Switch to the **Queue** tab to see active downloads
- View real-time progress, download speed, and estimated time
- Remove downloads from the queue if needed

### View History

- The **History** tab shows all completed and failed downloads
- Click **Open File** to access downloaded files
- Click **Original URL** to revisit the source
- Use **Clear History** to remove all history records

## API Endpoints

The application provides REST API endpoints:

- `POST /api/download` - Start a new download
- `POST /api/video-info` - Get video information
- `GET /api/history` - Get download history
- `POST /api/history` - Add to download history
- `DELETE /api/history` - Clear or remove history items

## Configuration

### Download Directory

By default, files are downloaded to the `./downloads` directory. You can:

1. Change the default in the download form
2. Set a custom path for each download
3. Modify the API route to use a different default location

### Supported Formats

The application supports all formats that yt-dlp supports, including:

- **Video**: MP4, WebM, MKV, FLV, AVI
- **Audio**: MP3, AAC, OPUS, M4A, FLAC, WAV
- **Quality**: Best, Worst, or specific resolutions (144p to 4K+)

## Technical Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, Node.js streams
- **Download Engine**: yt-dlp CLI integration

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── download/route.ts       # Download streaming API
│   │   ├── video-info/route.ts     # Video information API
│   │   └── history/route.ts        # History management API
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main page
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── download-form.tsx           # Download form component
│   ├── download-queue.tsx          # Download queue component
│   ├── download-history.tsx        # Download history component
│   └── video-downloader.tsx        # Main container component
└── lib/
    └── download-history.ts         # History management utility
```

### Adding New Features

1. **New Download Options**: Modify the `DownloadForm` component and API routes
2. **Additional File Formats**: Update the format options in the form component
3. **Enhanced Progress Tracking**: Extend the progress parsing in the download API
4. **File Management**: Add file operations to the history component

## Troubleshooting

### yt-dlp Not Found

If you get "yt-dlp not found" errors:

1. Make sure yt-dlp is installed: `which yt-dlp`
2. Add yt-dlp to your PATH
3. Restart the development server

### Download Fails

Common issues:

1. **Video not available**: Check if the URL is accessible
2. **Format not supported**: Try different quality/format settings
3. **Network issues**: Check your internet connection
4. **Permissions**: Ensure write access to the download directory

### Performance

For better performance:

1. Limit concurrent downloads
2. Use appropriate quality settings
3. Consider using a dedicated download directory
4. Monitor system resources during large downloads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The powerful download engine
- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
