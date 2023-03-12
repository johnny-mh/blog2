import type { AstroConfig, AstroIntegration } from 'astro'
import Fuse from 'fuse.js'
import { debounce, map } from 'lodash-es'
import { createHmac } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Plugin } from 'vite'
import { getSearchable, getFileInfo, Searchable } from './util'

export { Searchable } from './util'

declare global {
  function loadFuse(): Promise<Fuse<Searchable>>
}

export default function astroFuse(
  fuseIndexOptions: Fuse.IFuseOptions<Searchable>
): AstroIntegration {
  return {
    name: 'astro-fuse',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig, injectScript }) => {
        injectScript(
          'page',
          `window.loadFuse = () => 
  Promise.all([
    import('fuse.js'),
    fetch('/fuse.json').then(res => res.json())
  ]).then(([Fuse, { list, index }]) =>
    new Fuse.default(list, {keys: [${map(
      fuseIndexOptions.keys,
      (key) => `'${key}'`
    )}]}, Fuse.default.parseIndex(index))
  )`
        )

        updateConfig({
          vite: {
            plugins: [fuse(config, fuseIndexOptions)],
          },
        })
      },
    },
  }
}

function fuse(
  config: AstroConfig,
  fuseIndexOptions: Fuse.IFuseOptions<Searchable>
): Plugin {
  const outputPath = join(config.outDir.pathname, 'fuse.json')
  const result = new Map<string, [hash: string, searchable: Searchable]>()
  const buffer = new Map<string, [hash: string, searchable: Searchable]>()

  const writeFuseIndex = debounce(() => {
    let diff = false

    buffer.forEach(([hash, searchable], fileId) => {
      const doc = result.get(fileId)

      if (!doc || doc[0] !== hash) {
        diff = true

        result.set(fileId, [hash, searchable])
      }
    })

    if (diff) {
      const list = map(Array.from(result.values()), 1)
      const index = Fuse.createIndex(fuseIndexOptions.keys ?? [], list)

      writeFile(outputPath, JSON.stringify({ list, index: index.toJSON() }))
    }
  }, 1000)

  return {
    name: 'astro-fuse',
    async transform(_, id) {
      if (!id.match(/mdx?/)) {
        return
      }

      const { fileId, fileUrl } = getFileInfo(id, config)
      const code = await readFile(fileId, 'utf-8')
      const hash = createHmac('sha256', code).digest('hex').substring(0, 8)
      const content = getSearchable(code)
      buffer.set(fileId, [hash, { ...content, fileUrl }])

      writeFuseIndex()
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.endsWith('/fuse.json')) {
          const file = await readFile(outputPath)

          return res.setHeader('Content-Type', 'application/json').end(file)
        }

        return next()
      })
    },
  }
}