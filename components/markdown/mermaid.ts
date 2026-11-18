import mermaid from '@bytemd/plugin-mermaid'
import locale from '@bytemd/plugin-mermaid/locales/zh_Hans.json'
import type { BytemdPlugin } from 'bytemd'

export function themedMermaid(): BytemdPlugin {
    return {
        ...mermaid({ locale }),
        viewerEffect(context) {
            // ByteMD replaces each source block with an SVG. Keep the source so only
            // diagrams need to be redrawn when the reader changes their appearance.
            const diagrams = Array.from(context.markdownBody.querySelectorAll('pre > code.language-mermaid'), code => {
                const source = code.parentElement!
                const host = document.createElement('div')
                source.replaceWith(host)
                return { source, host }
            })
            if (!diagrams.length) return

            const preference = window.matchMedia('(prefers-color-scheme: dark)')
            const render = () => {
                for (const { source, host } of diagrams) host.replaceChildren(source.cloneNode(true))
                mermaid({ theme: preference.matches ? 'dark' : 'default', startOnLoad: false }).viewerEffect?.(context)
            }
            render()
            preference.addEventListener('change', render)
            return () => {
                preference.removeEventListener('change', render)
                for (const { source, host } of diagrams) host.replaceWith(source)
            }
        },
    }
}
