import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const spawnMock = vi.fn();
// `next/server` imports `child_process` via its default export under the
// hood, so the mock must provide both a default and a named `spawn`.
vi.mock('child_process', () => ({
  default: { spawn: spawnMock },
  spawn: spawnMock,
}));

// Imported after the mock so the route picks up the mocked `spawn`.
const { POST } = await import('./route');

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/download validation', () => {
  beforeEach(() => {
    spawnMock.mockClear();
  });

  it('returns 400 for a URL that resolves to a disallowed (loopback) host', async () => {
    const response = await POST(makeRequest({ url: 'http://127.0.0.1/' }));

    expect(response.status).toBe(400);
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid quality value, without spawning yt-dlp', async () => {
    const response = await POST(
      makeRequest({ url: 'http://203.0.113.10/video', quality: 'not-a-quality', audioOnly: false })
    );

    expect(response.status).toBe(400);
    expect(spawnMock).not.toHaveBeenCalled();
  });
});
