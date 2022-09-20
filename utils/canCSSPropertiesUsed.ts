import React from 'react'
import { isBrowser } from './isBrowser'

export const canCSSPropertiesUsed = (p: keyof React.CSSProperties) => {
    if (isBrowser()) {
        return document.body.style[p] !== undefined
    }
}
