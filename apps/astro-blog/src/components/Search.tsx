import Styles from './Search.module.scss'

import { Searchable, loadFuse } from 'astro-fuse/dist/load'
import { useStore } from '@nanostores/preact'
import Fuse from 'fuse.js'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { appAtom } from '#/stores/app'
import { shuffle } from '#/util/common'
import { JSXInternal } from 'preact/src/jsx'

interface SearchedItem {
  title: string
  slug: string
}

export function Search(props: { tags: Set<string> }) {
  const tags = useMemo(
    () => shuffle(Array.from(props.tags.values())).slice(0, 5),
    [props.tags]
  )

  const app = useStore(appAtom)
  const fuse = useRef<Fuse<Searchable> | null>(null)
  const inpRef = useRef<HTMLInputElement>(null)
  const [reveal, setReveal] = useState('')
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    if (!query || !fuse.current) {
      return []
    }

    const list = fuse.current.search(query)

    return list.reduce<SearchedItem[]>(
      (
        arr,
        {
          item: {
            frontmatter: { title },
            fileUrl,
          },
        }
      ) => {
        const url = decodeURIComponent(fileUrl)
        const [, slug] = /\d{4}-\d{2}-\d{2}-(.*)\.mdx?/.exec(url) ?? []

        if (slug) {
          arr.push({ title, slug })
        }

        return arr
      },
      []
    )
  }, [query])

  const close = () => {
    setReveal('')
    inpRef.current?.blur()
    setTimeout(() => appAtom.set({ showSearch: false }), 1000)
  }

  const onInput: JSXInternal.GenericEventHandler<HTMLInputElement> = (e) =>
    setQuery((e.target as HTMLInputElement).value)

  const onTagClick = (name: string) => {
    if (inpRef.current) {
      inpRef.current.value = name
      inpRef.current.select()
    }

    setQuery(name)
  }

  useEffect(() => {
    loadFuse(['content', 'frontmatter.title', 'frontmatter.tags']).then((inst) => (fuse.current = inst))
  }, [])

  useEffect(() => {
    if (app.showSearch) {
      setReveal('reveal')
      inpRef.current?.focus()
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('keyup', onKeyUp)

    return () => {
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [app.showSearch])

  return (
    <div className={`${Styles.wrapper} ${reveal}`}>
      <div className={Styles.content}>
        <div className={Styles.header}>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              className={Styles.inp}
              type="text"
              placeholder="Type to Search"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              ref={inpRef}
              onInput={onInput}
            />
          </form>

          <button className={Styles.closeBtn} type="button" onClick={close}>
            <svg width="37" height="37" x="0" y="0" viewBox="0 0 512 512">
              <path d="m25 512a25 25 0 0 1 -17.68-42.68l462-462a25 25 0 0 1 35.36 35.36l-462 462a24.93 24.93 0 0 1 -17.68 7.32z" />
              <path d="m487 512a24.93 24.93 0 0 1 -17.68-7.32l-462-462a25 25 0 0 1 35.36-35.36l462 462a25 25 0 0 1 -17.68 42.68z" />
            </svg>
          </button>
        </div>
        <div className={Styles.tags}>
          {tags.map((name) => (
            <button key={name} onClick={() => onTagClick(name)}>
              {name}
            </button>
          ))}
        </div>

        <div className={Styles.list}>
          <ul className={Styles.searchResult}>
            {list.map((item) => (
              <li key={item.slug}>
                <a href={`/post/${item.slug.toLowerCase()}`}>{item.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
