import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { getConfig } from '@/lib/config';

const execFileAsync = promisify(execFile);

async function checkBinary(path: string, versionFlag: string): Promise<{ ok: boolean; version: string }> {
  try {
    const { stdout } = await execFileAsync(path, [versionFlag], { timeout: 5000 });
    const firstLine = stdout.split('\n')[0].trim();
    return { ok: true, version: firstLine };
  } catch {
    return { ok: false, version: 'Not found' };
  }
}

export async function GET() {
  const config = getConfig();

  const [ytdlp, ffmpeg] = await Promise.all([
    checkBinary(config.ytDlpPath, '--version'),
    checkBinary(config.ffmpegPath, '-version'),
  ]);

  return NextResponse.json({
    ytdlp,
    ffmpeg,
    downloadPath: config.downloadPath,
  });
}
