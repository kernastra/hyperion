import dns from 'dns';
import net from 'net';

const PRIVATE_IPV4_RANGES: Array<[string, number]> = [
  ['10.0.0.0', 8],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['0.0.0.0', 8],
];

function ipv4ToLong(ip: string): number {
  return (
    ip
      .split('.')
      .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
  );
}

function isPrivateIPv4(ip: string): boolean {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return false;
  const long = ipv4ToLong(ip);
  return PRIVATE_IPV4_RANGES.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (long & mask) === (ipv4ToLong(base) & mask);
  });
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true; // loopback / unspecified
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // fc00::/7
  if (normalized.startsWith('fe80:')) return true; // link-local

  // IPv4-mapped IPv6, dotted form: ::ffff:127.0.0.1
  if (normalized.startsWith('::ffff:') && normalized.includes('.')) {
    return isPrivateIPv4(normalized.slice('::ffff:'.length));
  }

  // IPv4-mapped IPv6, hex form: ::ffff:7f00:1 (the WHATWG URL parser
  // normalizes the dotted form above to this).
  const hexMapped = normalized.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hexMapped) {
    const high = parseInt(hexMapped[1], 16);
    const low = parseInt(hexMapped[2], 16);
    const mappedIPv4 = [(high >> 8) & 0xff, high & 0xff, (low >> 8) & 0xff, low & 0xff].join('.');
    return isPrivateIPv4(mappedIPv4);
  }

  return false;
}

function isPrivateOrLoopbackIP(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return false;
}

/**
 * Validates that `rawUrl` is a public http(s) URL, rejecting anything that
 * points (directly or via DNS) at loopback, link-local, or private addresses.
 * Throws with a user-safe message if the URL is disallowed.
 */
export async function assertSafeHttpUrl(rawUrl: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https URLs are allowed');
  }

  // URL.hostname wraps IPv6 literals in brackets (e.g. "[::1]"); strip them
  // before classification so the IPv6 checks below actually match.
  const hostname = parsed.hostname.replace(/^\[|\]$/g, '');
  if (hostname.toLowerCase() === 'localhost') {
    throw new Error('URL resolves to a disallowed host');
  }

  if (isPrivateOrLoopbackIP(hostname)) {
    throw new Error('URL resolves to a disallowed host');
  }

  // Resolve DNS and check every returned address as defense-in-depth against
  // a hostname that currently points at a public IP but resolves to a
  // private one. Note this is NOT a complete defense against DNS rebinding:
  // this lookup happens once, here; yt-dlp performs its own independent
  // resolution later and may land on a different address (TOCTOU), so a
  // malicious/rebinding resolver can still bypass this check end-to-end.
  if (net.isIP(hostname) === 0) {
    let addresses: string[];
    try {
      const results = await dns.promises.lookup(hostname, { all: true });
      addresses = results.map((r) => r.address);
    } catch {
      throw new Error('Unable to resolve URL host');
    }

    if (addresses.length === 0 || addresses.some((addr) => isPrivateOrLoopbackIP(addr))) {
      throw new Error('URL resolves to a disallowed host');
    }
  }
}
