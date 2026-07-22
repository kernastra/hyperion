import { describe, expect, it } from 'vitest';
import path from 'path';
import { resolveWithinRoot } from './fs-security';

describe('resolveWithinRoot', () => {
  const root = path.join('/x', 'downloads');

  it('allows a relative path directly under root', () => {
    expect(resolveWithinRoot(root, 'movies')).toBe(path.join(root, 'movies'));
  });

  it('allows a nested relative path under root', () => {
    expect(resolveWithinRoot(root, 'movies/action/clip.mp4')).toBe(
      path.join(root, 'movies', 'action', 'clip.mp4')
    );
  });

  it('rejects a relative path-traversal escape', () => {
    expect(resolveWithinRoot(root, '../../../etc/passwd')).toBeNull();
  });

  it('rejects an absolute path outside root', () => {
    expect(resolveWithinRoot(root, '/etc/passwd')).toBeNull();
  });

  it('rejects a sibling directory that shares a path prefix with root', () => {
    // '/x/downloads-evil' starts with the string '/x/downloads' but is not
    // actually inside it — must be rejected despite the string prefix match.
    expect(resolveWithinRoot(root, '/x/downloads-evil')).toBeNull();
  });
});
