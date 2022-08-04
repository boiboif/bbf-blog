/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        fontFamily: {
            sans: defaultTheme.fontFamily.sans,
            serif: defaultTheme.fontFamily.serif,
            mono: defaultTheme.fontFamily.mono,
            lycoReco:
                "YakuHanMP_Noto, 'Noto Serif JP', '游明朝', 'YuMincho', 'ヒラギノ明朝 ProN W3', 'Hiragino Mincho ProN', 'HG明朝E', 'ＭＳ 明朝', 'ＭＳ Ｐ明朝', 'Noto Serif JP', serif",
        },
        extend: {
            colors: {
                primary: '#f0555a',
            },
        },
    },
    plugins: [],
}
