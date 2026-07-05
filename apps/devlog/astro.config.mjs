import { unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import partytown from '@astrojs/partytown'
import sitemap from '@astrojs/sitemap'
import rehypeFigure from '@microflash/rehype-figure'
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
} from '@shikijs/transformers'
import fuse from 'astro-fuse'
import icon from 'astro-icon'
import tailwindcss from '@tailwindcss/vite'
import robotsTxt from 'astro-robots-txt'
import { defineConfig } from 'astro/config'
import glsl from 'vite-plugin-glsl'

import { remarkSummarize } from './remarks/summarize.mjs'

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    sitemap(),
    icon({
      svgoOptions: {
        plugins: [{ name: 'prefixIds', params: { prefix: 'uwu' } }],
      },
    }),
    partytown({ config: { forward: ['dataLayer.push'] } }),
    robotsTxt({
      host: 'johnny-mh.github.io',
      policy: [
        {
          allow: '/',
          disallow: ['/about', '/about/'],
          userAgent: '*',
        },
      ],
    }),
    fuse(['content', 'frontmatter.title', 'frontmatter.tags'], {
      extractContentFromHTML: '.prose',
      extractFrontmatterFromHTML: ($) => {
        const el = $('[data-frontmatter]')

        if (el.length) {
          return JSON.parse(el.first().val())
        }

        return { title: $('h1').first().text() }
      },
      filter: (path) => {
        const matches = /^\/blog\/([^/]+)\/?$/g.exec(path)

        if (!matches) {
          return false
        }

        const [, param] = matches

        return !/^\d+$/.test(param)
      },
    }),
  ],
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeFigure],
      remarkPlugins: [remarkSummarize],
    }),
    shikiConfig: {
      theme: 'catppuccin-mocha',
      transformers: [
        transformerMetaHighlight(),
        transformerMetaWordHighlight(),
      ],
    },
    syntaxHighlight: 'shiki',
  },
  redirects: { '/': '/blog', '/post/[slug]': '/blog/[slug]' },
  site: 'https://johnny-mh.github.io',
  vite: {
    plugins: [tailwindcss(), glsl()],
  },
})
