import { fromMarkdown } from 'mdast-util-from-markdown'
import { load } from 'js-yaml'
import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxjs } from 'micromark-extension-mdxjs'
import { frontmatter } from 'micromark-extension-frontmatter'
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx'
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter'
import { AstroConfig } from 'astro'
import { Searchable } from './types'

interface FileInfo {
  fileId: string
  fileUrl: string
}

function appendForwardSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`
}

export function getFileInfo(id: string, config: AstroConfig): FileInfo {
  const sitePathname = appendForwardSlash(
    config.site ? new URL(config.base, config.site).pathname : config.base
  )

  // Try to grab the file's actual URL
  let url: URL | undefined
  try {
    url = new URL(`file://${id}`)
  } catch { }

  const fileId = id.split('?')[0]
  let fileUrl: string
  const isPage = fileId.includes('/pages/')
  if (isPage) {
    fileUrl = fileId
      .replace(/^.*?\/pages\//, sitePathname)
      .replace(/(\/index)?\.mdx$/, '')
  } else if (url && url.pathname.startsWith(config.root.pathname)) {
    fileUrl = url.pathname.slice(config.root.pathname.length)
  } else {
    fileUrl = fileId
  }

  if (fileUrl && config.trailingSlash === 'always') {
    fileUrl = appendForwardSlash(fileUrl)
  }
  return { fileId, fileUrl }
}

export function getSearchable(source: string): Omit<Searchable, 'fileUrl'> {
  const tree = fromMarkdown(source, 'utf-8', {
    extensions: [mdxjs(), frontmatter(['yaml'])],
    mdastExtensions: [
      mdxFromMarkdown() as any,
      frontmatterFromMarkdown(['yaml']),
    ],
  })

  const yaml = tree.children.splice(
    tree.children.findIndex((value) => value.type === 'yaml'),
    1
  )

  return {
    frontmatter: load((yaml as any)?.[0]?.value ?? '') as Record<string, any>,
    content: toMarkdown(tree, { extensions: [mdxToMarkdown()] }),
  }
}
