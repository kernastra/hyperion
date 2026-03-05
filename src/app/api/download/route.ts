import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { getConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { url, format, quality, audioOnly, outputPath } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const args = [url];

        // Set output template with proper path handling
        let downloadPath;
        if (outputPath) {
          // If user provided a path, resolve it to absolute path
          downloadPath = path.resolve(outputPath);
          
          // Ensure the directory exists
          try {
            if (!fs.existsSync(downloadPath)) {
              fs.mkdirSync(downloadPath, { recursive: true });
            }
          } catch (error) {
            const errorData = {
              type: 'error',
              message: `Cannot create output directory: ${downloadPath}. ${error}`,
            };
            controller.enqueue(encoder.encode(JSON.stringify(errorData) + '\n'));
            controller.close();
            return;
          }
        } else {
          // Use default downloads directory
          downloadPath = path.resolve('./downloads');
          
          // Ensure default directory exists
          try {
            if (!fs.existsSync(downloadPath)) {
              fs.mkdirSync(downloadPath, { recursive: true });
            }
          } catch (error) {
            const errorData = {
              type: 'error',
              message: `Cannot create downloads directory: ${error}`,
            };
            controller.enqueue(encoder.encode(JSON.stringify(errorData) + '\n'));
            controller.close();
            return;
          }
        }

        args.push('-o', path.join(downloadPath, '%(title)s.%(ext)s'));

        // Handle audio-only downloads
        if (audioOnly) {
          args.push('-x'); // Extract audio
          if (format && format !== 'best') {
            args.push('--audio-format', format);
          }
        } else {
          // Video download with both video and audio
          let formatString = '';
          
          if (quality === 'best') {
            formatString = 'bestvideo+bestaudio/best';
          } else if (quality === 'worst') {
            formatString = 'worstvideo+worstaudio/worst';
          } else {
            formatString = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`;
          }
          
          // If format is itself a yt-dlp selector, use it directly instead of the quality-derived string
          if (format && ['bestvideo+bestaudio', 'bestvideo', 'bestaudio', 'best'].includes(format)) {
            args.push('-f', format + '/best');
          } else {
            args.push('-f', formatString);
          }

          // Set container format if specified and not a format selector
          if (format && !['best', 'worst', 'bestvideo+bestaudio', 'bestvideo', 'bestaudio'].includes(format)) {
            // Map audio formats to video containers
            if (['mp3', 'm4a', 'opus', 'flac'].includes(format)) {
              // User selected audio format but not audio-only, extract audio after download
              args.push('--extract-audio', '--audio-format', format);
            } else {
              // Video format specified
              args.push('--merge-output-format', format);
            }
          } else {
            // Default to mp4 for video downloads
            if (!audioOnly) {
              args.push('--merge-output-format', 'mp4');
            }
          }
        }

        const config = getConfig();

        // Add progress and other options
        args.push(
          '--newline',
          '--no-warnings',
          '--ignore-errors',
          '--prefer-ffmpeg',
          '--ffmpeg-location', config.ffmpegPath,
          '--js-runtimes', `node:${process.execPath}`,
        );

        let tempCookies: string | null = null;
        if (config.cookiesPath) {
          tempCookies = path.join(os.tmpdir(), `hyperion-cookies-${Date.now()}.txt`);
          fs.copyFileSync(config.cookiesPath, tempCookies);
          args.push('--cookies', tempCookies);
        }
        console.log('Executing yt-dlp with args:', args);

        const ytdlp = spawn(config.ytDlpPath, args);
        let filename = '';
        let completed = false;

        ytdlp.stdout.on('data', (data) => {
          const output = data.toString();
          console.log('yt-dlp stdout:', output);

          // Parse progress information
          const lines = output.split('\n').filter((line: string) => line.trim());
          
          for (const line of lines) {
            // Extract filename
            if (line.includes('Destination:')) {
              const match = line.match(/Destination:\s*(.+?)(?:\s|$)/);
              if (match) {
                filename = path.basename(match[1]);
              }
            }

            // Parse download progress
            if (line.includes('%') && line.includes('ETA') && !completed) {
              const progressMatch = line.match(/(\d+(?:\.\d+)?)%/);
              const speedMatch = line.match(/(\d+(?:\.\d+)?(?:KiB|MiB|GiB)\/s)/);
              const etaMatch = line.match(/ETA\s+(\d+:\d+)/);

              if (progressMatch) {
                const progress = parseFloat(progressMatch[1]);
                const progressData = {
                  type: 'progress',
                  progress: progress,
                  speed: speedMatch ? speedMatch[1] : null,
                  eta: etaMatch ? etaMatch[1] : null,
                  filename: filename || null,
                };

                controller.enqueue(encoder.encode(JSON.stringify(progressData) + '\n'));

                // Mark as completed when we hit 100%
                if (progress >= 100) {
                  completed = true;
                  const completeData = {
                    type: 'complete',
                    filename: filename || 'Download completed',
                  };
                  controller.enqueue(encoder.encode(JSON.stringify(completeData) + '\n'));
                }
              }
            }

            // Handle already downloaded files
            if (line.includes('has already been downloaded') && !completed) {
              completed = true;
              const completeData = {
                type: 'complete',
                filename: filename || 'File already downloaded',
              };
              controller.enqueue(encoder.encode(JSON.stringify(completeData) + '\n'));
            }
          }
        });

        ytdlp.stderr.on('data', (data) => {
          const error = data.toString();
          console.error('yt-dlp stderr:', error);
          
          const errorData = {
            type: 'error',
            message: error.trim(),
          };
          controller.enqueue(encoder.encode(JSON.stringify(errorData) + '\n'));
        });

        ytdlp.on('close', (code) => {
          console.log('yt-dlp process closed with code:', code);
          
          // Only send completion/error if we haven't already
          if (!completed) {
            if (code === 0) {
              const completeData = {
                type: 'complete',
                filename: filename || 'Download completed',
              };
              controller.enqueue(encoder.encode(JSON.stringify(completeData) + '\n'));
            } else {
              const errorData = {
                type: 'error',
                message: `Download failed with exit code ${code}`,
              };
              controller.enqueue(encoder.encode(JSON.stringify(errorData) + '\n'));
            }
          }
          
          if (tempCookies) try { fs.unlinkSync(tempCookies); } catch {}
          controller.close();
        });

        ytdlp.on('error', (error) => {
          if (tempCookies) try { fs.unlinkSync(tempCookies); } catch {}
          console.error('yt-dlp process error:', error);

          const errorData = {
            type: 'error',
            message: error.message,
          };
          controller.enqueue(encoder.encode(JSON.stringify(errorData) + '\n'));
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests to provide API information
export async function GET() {
  return NextResponse.json({
    message: 'Hyperion Download API',
    endpoints: {
      POST: 'Start a download with URL and options',
    },
  });
}
