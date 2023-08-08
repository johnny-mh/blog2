import type { AstroConfig, AstroIntegration } from 'astro'
import Fuse from 'fuse.js'
import { createHmac } from 'node:crypto'
import { debounce, map } from 'lodash-es'
import { existsSync, mkdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { Plugin } from 'vite'
import { getSearchable, getFileInfo } from './util'
import { Searchable } from './types'

const PLUGIN_NAME = 'astro-fuse'

export default function astroFuse(keys: Fuse.FuseOptionKey<Searchable>[], options?: Fuse.FuseIndexOptions<Searchable>): AstroIntegration {
  let outDir = ''

  return {
    name: PLUGIN_NAME,
    hooks: {
      'astro:config:setup': async ({ config, updateConfig }) => {
        outDir = config.outDir.pathname

        updateConfig({
          vite: {
            plugins: [fuse(config, keys, options)],
          },
        })
      },

      'astro:build:done': () => {
        if (existsSync(join(outDir, 'fuse.json'))) {
          console.log(
            `%s${PLUGIN_NAME}:%s \`fuse.json\` is created.`,
            '\x1b[32m',
            '\x1b[0m'
          )
        }
      },
    },
  }
}

function fuse(
  config: AstroConfig,
  keys: Fuse.FuseOptionKey<Searchable>[],
  options?: Fuse.FuseIndexOptions<Searchable>
): Plugin {
  const outDir = config.outDir.pathname
  const outputPath = join(outDir, 'fuse.json')

  if (!existsSync(outDir)) {
    mkdirSync(dirname(outputPath))
  }

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
      const index = Fuse.createIndex(keys, list, options)

      writeFile(outputPath, JSON.stringify({ list, index: index.toJSON() }))
    }
  }, process.env.NODE_ENV === 'production' ? 0 : 500)


  return {
    name: PLUGIN_NAME,
    async transform(_, id) {
      if (!id.match(/\.mdx?/)) {
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
