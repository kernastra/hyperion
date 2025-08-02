import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    return new Promise((resolve) => {
      const args = [
        url,
        '--dump-json',
        '--no-warnings',
        '--ignore-errors'
      ];

      const ytdlp = spawn('/home/sean/.local/bin/yt-dlp', args);
      let jsonOutput = '';
      let errorOutput = '';

      ytdlp.stdout.on('data', (data) => {
        jsonOutput += data.toString();
      });

      ytdlp.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ytdlp.on('close', (code) => {
        if (code === 0 && jsonOutput.trim()) {
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
        console.error('yt-dlp process error:', error);
        resolve(NextResponse.json(
          { error: 'Failed to execute yt-dlp' },
          { status: 500 }
        ));
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
