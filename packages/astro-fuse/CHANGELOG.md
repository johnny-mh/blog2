# astro-fuse

## 2.0.1

### Patch Changes

- 27d6f71: Bump `fuse.js` dependency to `^7.4.2` to stay in sync with the latest release. `peerDependencies` still allows `^7.0.0` for backward compatibility.

## 2.0.0

### Major Changes

- ba09e56: Require Astro 5 or later, and remove the `basedOn: 'source'` mode.

  Astro 5 changed two things this integration relied on:

  - The `astro:build:done` hook no longer exposes `routes` (it crashed with `Cannot read properties of undefined (reading 'reduce')`). Route data is now read from the `astro:routes:resolved` hook.
  - The Content Layer reads collection files directly from disk, so Vite's `transform` hook no longer fires for content files. The `basedOn: 'source'` mode depended on that hook and could not produce an index on Astro 5+.

  Changes:

  - **Breaking:** `peerDependencies` is now `astro >= 5.0.0`. Astro 4 users should stay on the `1.x` line.
  - **Breaking:** removed `basedOn: 'source'`. Output mode is now the only mode; the `basedOn` option, `SourceBaseAstroFuseOptions`, and `SourceBaseSearchable` were removed. Passing `basedOn: 'source'` throws with a migration message.
  - **Breaking:** `OutputBaseAstroFuseOptions` is no longer exported. It is now identical to `AstroFuseOptions` — import that instead.
  - Verified against Astro 5, 6, and 7 (Vite 8 / rolldown-vite) via a new fixture-based integration test suite.

## 1.0.4

### Patch Changes

- Correct frontmatter parsing on source mode

## 1.0.3

### Patch Changes

- support astro v5

## 1.0.1

### Patch Changes

- Fixed an issue where a build error occurred when there were no arguments to the 'fuse()' function.

## 1.0.0

### Major Changes

- 672ab45: - Migrate core packages (astro@4.12.2, fuse.js@7.0.0)

  - Add `filename` option to `fuse()`
  - Regardless of the `basedOn` mode, the `filter` option can now be used
  - Export `loadFuse()` function from `'astro-fuse/client'`

  **BREAKING CHANGES**

  - The `injectScript` option removed from `fuse()`. No more adding `loadFuse()` function to global context. Please use `loadFuse()` from `'astro-fuse/client'`

    ```ts
    loadFuse()
      .then(fuse => fuse.search('...')) // deprecated

    import('astro-fuse/client')
      .then(mod => mod.loadFuse())
      .then(fuse => fuse.search(...))
    ```

  - The default value of the `basedOn` option has been changed from `'source'` to `'output'`.

## 0.0.7

### Patch Changes

- b1011d2: fix: enhance output log @bennycode
- b1011d2: fix: wrong argument type of integration function

## 0.0.6

### Patch Changes

- export `Searchable` type and adding example

## 0.0.5

### Patch Changes

- Added `basedOn: output` mode to support rendered HTML based search features.

## 0.0.4

### Patch Changes

- 9fd111b: fix instance loading timing issue.

## 0.0.3

### Patch Changes

- a707841: update astro to v2.1

## 0.0.2

### Patch Changes

- 0df9d2f: update package information
