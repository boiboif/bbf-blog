const { extractStyle } = require('@ant-design/static-style-extract')
const { ConfigProvider } = require('antd')
const { createElement } = require('react')
const theme = require('./antd-theme.json')

// Compile the shared theme into Next's stylesheet so the first paint also works without JavaScript.
module.exports = () => ({
    postcssPlugin: 'blog-antd-styles',
    // Expand the marker before Tailwind processes cascade layers.
    Once(root, { postcss }) {
        root.walkAtRules('antd-styles', rule => {
            const css = extractStyle({
                includes: [
                    // Form renders no grid until it contains a Form.Item, so extract Row and Col explicitly.
                    'App', 'Button', 'Col', 'Dropdown', 'Empty', 'FloatButton', 'Form', 'Input', 'Layout',
                    'Menu', 'Modal', 'Pagination', 'Popconfirm', 'Popover', 'Row', 'Select', 'Space', 'Spin',
                    'Table', 'Tooltip', 'message',
                ],
                customTheme: children => createElement(ConfigProvider, { theme }, children),
            })
            rule.replaceWith(postcss.parse(css).nodes)
        })
    },
})
module.exports.postcss = true
