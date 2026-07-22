import { describe, expect, it, vi } from 'vitest';
import dns from 'dns';
import { assertSafeHttpUrl } from './url-security';

// assertSafeHttpUrl resolves DNS for non-literal hostnames. Mock it so the
// public-hostname case (www.youtube.com) is deterministic and offline.
vi.mock('dns', () => ({
  default: {
    promises: {
      lookup: vi.fn(async () => [{ address: '203.0.113.10', family: 4 }]),
    },
  },
}));

describe('assertSafeHttpUrl', () => {
  const rejected = [
    'http://[::1]/',
    'http://[::]/',
    'http://[::ffff:127.0.0.1]/',
    'http://[::ffff:7f00:1]/',
    'http://[fc00::1]/',
    'http://[fe80::1]/',
    'http://127.0.0.1/',
    'http://localhost/',
    'http://169.254.169.254/',
    'http://10.0.0.5/',
    'http://192.168.1.1/',
    'ftp://example.com/',
  ];

  it.each(rejected)('rejects %s', async (url) => {
    await expect(assertSafeHttpUrl(url)).rejects.toThrow();
  });

  it('accepts a public hostname (DNS resolution mocked to a public IP)', async () => {
    await expect(assertSafeHttpUrl('https://www.youtube.com/watch?v=x')).resolves.toBeUndefined();
    expect(vi.mocked(dns.promises.lookup)).toHaveBeenCalled();
  });

  it('accepts a public IPv6 literal', async () => {
    await expect(assertSafeHttpUrl('http://[2606:4700:4700::1111]/')).resolves.toBeUndefined();
  });
});
