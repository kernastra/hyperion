import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { getConfig, saveConfig, HyperionConfig } from '@/lib/config';
import { resolveWithinRoot } from '@/lib/fs-security';

// ytDlpPath / ffmpegPath must come only from env/pinned config, never from a
// runtime settings write (that would let a client point the server at an
// arbitrary executable).
const WRITABLE_KEYS: (keyof HyperionConfig)[] = [
  'downloadPath',
  'maxConcurrentDownloads',
  'defaultVideoQuality',
  'defaultVideoFormat',
  'defaultAudioFormat',
  'defaultAudioQuality',
  'speedLimit',
  'retryCount',
  'autoStart',
  'downloadSubtitles',
  'embedSubtitles',
  'downloadThumbnails',
  'notifyOnComplete',
  'notifyOnFail',
  'useProxy',
  'proxyUrl',
  'cookiesPath',
];

export async function GET() {
  try {
    const config = getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    const rawUpdates = body as Record<string, unknown>;

    // ytDlpPath/ffmpegPath and any other unknown key are silently dropped
    // below since they're not in WRITABLE_KEYS - the settings page round-trips
    // the full config (including those two read-only fields) on every save,
    // so rejecting the whole request would break normal settings saves.
    const updates: Partial<HyperionConfig> = {};
    for (const key of WRITABLE_KEYS) {
      if (key in rawUpdates) {
        (updates as Record<string, unknown>)[key] = rawUpdates[key];
      }
    }

    if (typeof updates.cookiesPath === 'string' && updates.cookiesPath !== '') {
      const current = getConfig();
      const cookiesRoot = path.resolve(current.downloadPath);
      if (!resolveWithinRoot(cookiesRoot, updates.cookiesPath)) {
        return NextResponse.json(
          { error: 'cookiesPath must be within the downloads directory' },
          { status: 400 }
        );
      }
    }

    saveConfig(updates);
    const updated = getConfig();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
