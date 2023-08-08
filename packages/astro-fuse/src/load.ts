import Fuse from 'fuse.js';
import { Searchable } from './types';

export { Searchable }

export function loadFuse(
  keys: Fuse.FuseOptionKey<Searchable>[],
  options?: Fuse.IFuseOptions<Searchable>
) {
  return Promise.all([
    import('fuse.js'),
    fetch('/fuse.json').then(res => res.json())
  ]).then(([Fuse, { list, index }]) => new Fuse.default(list, { ...options, keys }, Fuse.default.parseIndex(index))
  );
}
