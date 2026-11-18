import breaks from '@bytemd/plugin-breaks'
import frontmatter from '@bytemd/plugin-frontmatter'
import gemoji from '@bytemd/plugin-gemoji'
import gfm from '@bytemd/plugin-gfm'
import gfmLocale from '@bytemd/plugin-gfm/locales/zh_Hans.json'
import highlight from '@bytemd/plugin-highlight-ssr'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import { themedMermaid } from './mermaid'

export const markdownPlugins = [
    gfm({ locale: gfmLocale }),
    highlight(),
    frontmatter(),
    mediumZoom({ background: 'var(--markdown-zoom-background)' }),
    themedMermaid(),
    gemoji(),
    breaks(),
]
