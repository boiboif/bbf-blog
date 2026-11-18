const { extractStyle } = require('@ant-design/static-style-extract')
const { ConfigProvider } = require('antd')
const { createElement } = require('react')
const theme = require('./antd-theme.json')

// Compile the shared theme into Next's stylesheet so the first paint also works without JavaScript.
module.exports = () => ({
    postcssPlugin: 'blog-antd-styles',
    AtRule: {
        'antd-styles'(rule, { postcss }) {
            const css = extractStyle({
                includes: [
                    'App', 'Button', 'Dropdown', 'Empty', 'FloatButton', 'Form', 'Input', 'Layout',
                    'Menu', 'Modal', 'Pagination', 'Popconfirm', 'Popover', 'Select', 'Space', 'Spin',
                    'Table', 'Tooltip', 'message',
                ],
                customTheme: children => createElement(ConfigProvider, { theme }, children),
            })
            rule.replaceWith(postcss.parse(css).nodes)
        },
    },
})
module.exports.postcss = true
