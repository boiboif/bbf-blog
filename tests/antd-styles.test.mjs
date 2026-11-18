import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import postcssConfig from '../postcss.config.js'

const require = createRequire(import.meta.url)

test('the global stylesheet preserves the Ant Design grid and Tailwind utility precedence', async () => {
    const from = fileURLToPath(new URL('../styles/globals.css', import.meta.url))
    const css = await readFile(from, 'utf8')
    const plugins = Object.entries(postcssConfig.plugins).map(([name, options]) => require(name)(options))
    const { root } = await postcss(plugins).process(css, { from })
    const layers = root.nodes.filter(node => node.type === 'atrule' && node.name === 'layer')
    const layerOrder = [...new Set(layers.flatMap(layer => layer.params.split(',').map(name => name.trim())))]
    const expectedOrder = ['theme', 'base', 'antd', 'components', 'utilities']
    assert.deepEqual(layerOrder.filter(name => expectedOrder.includes(name)), expectedOrder)

    const antd = layers.find(layer => layer.params === 'antd' && layer.nodes)
    const utilities = layers.find(layer => layer.params === 'utilities' && layer.nodes)
    assert.ok(antd)
    assert.ok(utilities)

    const declarations = new Map()
    antd.walkRules(/^\.ant-(row|col)$/, rule => {
        rule.walkDecls(declaration => {
            declarations.set(`${rule.selector}:${declaration.prop}`, declaration.value)
        })
    })
    utilities.walkRules(/^\.(font-lycoReco|text-primary)$/, rule => {
        rule.walkDecls(declaration => {
            declarations.set(`${rule.selector}:${declaration.prop}`, declaration.value)
        })
    })

    assert.equal(declarations.get('.ant-row:display'), 'flex')
    assert.equal(declarations.get('.ant-col:position'), 'relative')
    assert.equal(declarations.get('.font-lycoReco:font-family'), 'var(--font-lycoReco)')
    assert.equal(declarations.get('.text-primary:color'), 'var(--color-primary)')
})
