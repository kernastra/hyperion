import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Resolves `target` against `root` and verifies the result stays within `root`.
 * Returns the resolved absolute path, or null if it escapes the root.
 */
export function resolveWithinRoot(root: string, target: string): string | null {
  const resolvedRoot = path.resolve(root);
  const resolved = path.isAbsolute(target)
    ? path.resolve(target)
    : path.resolve(resolvedRoot, target);
  if (resolved === resolvedRoot || resolved.startsWith(resolvedRoot + path.sep)) {
    return resolved;
  }
  return null;
}

/**
 * Copies a cookies file into a private (0700 dir / 0600 file) temp location so
 * yt-dlp doesn't need access to the original, and other local users can't read it.
 * Call the returned `cleanup()` once the copy is no longer needed.
 */
export function createSecureCookiesCopy(sourcePath: string): { path: string; cleanup: () => void } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hyperion-cookies-'));
  fs.chmodSync(dir, 0o700);
  const dest = path.join(dir, 'cookies.txt');
  fs.copyFileSync(sourcePath, dest);
  fs.chmodSync(dest, 0o600);
  return {
    path: dest,
    cleanup: () => {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        // best-effort cleanup
      }
    },
  };
}
