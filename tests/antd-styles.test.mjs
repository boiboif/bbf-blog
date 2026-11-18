import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import postcss from 'postcss'
import antdStyles from '../styles/antd-postcss.cjs'

test('the static Ant Design stylesheet includes the grid used by form items', async () => {
    const css = await readFile(new URL('../styles/globals.css', import.meta.url), 'utf8')
    const { root } = await postcss([antdStyles()]).process(css, { from: undefined })
    const declarations = new Map()
    root.walkRules(/^\.ant-(row|col)$/, rule => {
        rule.walkDecls(declaration => {
            declarations.set(`${rule.selector}:${declaration.prop}`, declaration.value)
        })
    })

    assert.equal(declarations.get('.ant-row:display'), 'flex')
    assert.equal(declarations.get('.ant-col:position'), 'relative')
})
