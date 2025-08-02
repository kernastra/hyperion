# Copilot Instructions for Hyperion

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is Hyperion, a modern Next.js frontend web application for yt-dlp (YouTube downloader). The application provides a clean, user-friendly interface for downloading videos from YouTube and other supported platforms.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend Integration**: API routes interfacing with yt-dlp CLI

## Key Features
- URL input for video downloads
- Format and quality selection
- Download progress tracking
- Batch downloads support
- Playlist downloads
- Modern responsive UI
- Real-time status updates

## Code Style Guidelines
- Use TypeScript strict mode
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement proper error handling
- Use React hooks and modern patterns
- Follow component composition principles

## API Integration
- Create API routes in `/src/app/api/` directory
- Interface with yt-dlp CLI using Node.js child processes
- Implement proper error handling and validation
- Use streaming for real-time progress updates

## UI/UX Guidelines
- Clean, modern interface design
- Responsive design for all devices
- Intuitive user experience
- Clear feedback for user actions
- Loading states and progress indicators
- Error states with helpful messages
