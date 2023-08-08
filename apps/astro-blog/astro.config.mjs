import { defineConfig } from 'astro/config'
import image from '@astrojs/image'
import mdx from '@astrojs/mdx'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import fuse from 'astro-fuse'
import partytown from '@astrojs/partytown'

import { remarkReadingTime } from './remarks/readingTime.mjs'
import { remarkCreatedAt } from './remarks/createdAt.mjs'
import { rehypePrettyCode } from './remarks/rehypePrettyCode.mjs'

// https://astro.build/config
export default defineConfig({
  site: 'https://johnny-mh.github.io',
  integrations: [
    image({ serviceEntryPoint: '@astrojs/image/sharp' }),
    mdx(),
    preact(),
    sitemap(),
    robotsTxt({
      host: 'johnny-mh.github.io',
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/about',
            '/about/',
            '/archives',
            '/archives/',
            '/post/category/',
            '/post/tag/',
          ],
        },
      ],
    }),
    fuse(['content', 'frontmatter.title', 'frontmatter.tags']),
    partytown({ config: { forward: ['dataLayer.push'] } }),
  ],
  markdown: {
    syntaxHighlight: false,
    extendDefaultPlugins: true,
    remarkPlugins: [remarkReadingTime, remarkCreatedAt],
    rehypePlugins: [rehypePrettyCode],
  },
})
