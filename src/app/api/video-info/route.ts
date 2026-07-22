import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { getConfig } from '@/lib/config';
import { assertSafeHttpUrl } from '@/lib/url-security';
import { resolveWithinRoot, createSecureCookiesCopy } from '@/lib/fs-security';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      await assertSafeHttpUrl(url);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid URL' },
        { status: 400 }
      );
    }

    return new Promise((resolve) => {
      const config = getConfig();
      const args: string[] = [
        '--dump-json',
        '--no-warnings',
        '--ignore-errors',
        '--js-runtimes', `node:${process.execPath}`,
      ];

      let tempCookies: { path: string; cleanup: () => void } | null = null;
      if (config.cookiesPath) {
        const cookiesRoot = path.resolve(config.downloadPath);
        const resolvedCookies = resolveWithinRoot(cookiesRoot, config.cookiesPath);
        if (!resolvedCookies) {
          resolve(NextResponse.json(
            { error: 'Configured cookies path is outside the allowed downloads directory' },
            { status: 400 }
          ));
          return;
        }
        // Copy to a private temp file so yt-dlp can't overwrite the original
        tempCookies = createSecureCookiesCopy(resolvedCookies);
        args.push('--cookies', tempCookies.path);
      }

      // '--' sentinel prevents the user-supplied url from being parsed as
      // an option (e.g. a url starting with `--exec=`).
      args.push('--', url);

      const ytdlp = spawn(config.ytDlpPath, args);
      let jsonOutput = '';
      let errorOutput = '';

      ytdlp.stdout.on('data', (data) => {
        jsonOutput += data.toString();
      });

      ytdlp.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ytdlp.on('close', (code) => {
        if (jsonOutput.trim()) {
          try {
            const videoInfo = JSON.parse(jsonOutput.trim());

            // Extract relevant information
            const extractedInfo = {
              title: videoInfo.title || 'Unknown',
              description: videoInfo.description || '',
              duration: videoInfo.duration || 0,
              uploader: videoInfo.uploader || 'Unknown',
              upload_date: videoInfo.upload_date || '',
              view_count: videoInfo.view_count || 0,
              like_count: videoInfo.like_count || 0,
              thumbnail: videoInfo.thumbnail || '',
              formats: videoInfo.formats?.map((format: {
                format_id: string;
                ext: string;
                quality: number | null;
                filesize: number | null;
                tbr: number | null;
                width: number | null;
                height: number | null;
                fps: number | null;
                vcodec: string | null;
                acodec: string | null;
                format_note: string | null;
              }) => ({
                format_id: format.format_id,
                ext: format.ext,
                quality: format.quality,
                filesize: format.filesize,
                height: format.height,
                width: format.width,
                fps: format.fps,
                vcodec: format.vcodec,
                acodec: format.acodec,
                format_note: format.format_note,
              })) || [],
              webpage_url: videoInfo.webpage_url || url,
            };

            resolve(NextResponse.json(extractedInfo));
          } catch (parseError) {
            console.error('Failed to parse JSON:', parseError);
            resolve(NextResponse.json(
              { error: 'Failed to parse video information' },
              { status: 500 }
            ));
          }
        } else {
          console.error('yt-dlp error:', errorOutput);
          resolve(NextResponse.json(
            { error: errorOutput || 'Failed to fetch video information' },
            { status: 500 }
          ));
        }
      });

      ytdlp.on('error', (error) => {
        tempCookies?.cleanup();
        console.error('yt-dlp process error:', error);
        resolve(NextResponse.json(
          { error: 'Failed to execute yt-dlp' },
          { status: 500 }
        ));
      });

      ytdlp.on('close', () => {
        tempCookies?.cleanup();
      });
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
    message: 'Hyperion Video Info API',
    endpoints: {
      POST: 'Get video information from URL',
    },
  });
}
