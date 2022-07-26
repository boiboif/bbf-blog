/**
 * Based on https://gist.github.com/claus/992a5596d6532ac91b24abe24e10ae81
 * - see https://github.com/vercel/next.js/issues/3303#issuecomment-628400930
 * - see https://github.com/vercel/next.js/issues/12530#issuecomment-628864374
 */
import { useEffect } from 'react'
import Router, { NextRouter } from 'next/router'

function saveScrollPos(asPath: string, scrollDom: HTMLElement | null) {
    sessionStorage.setItem(`scrollPos:${asPath}`, JSON.stringify({ x: scrollDom?.scrollLeft, y: scrollDom?.scrollTop }))
}

function restoreScrollPos(asPath: string, scrollDom: HTMLElement | null) {
    const json = sessionStorage.getItem(`scrollPos:${asPath}`)
    const scrollPos = json ? JSON.parse(json) : undefined
    if (scrollPos) {
        scrollDom?.scrollTo(scrollPos.x, scrollPos.y)
    }
}

export function useScrollRestoration(router: NextRouter, scrollDomId: string) {
    useEffect(() => {
        if (!('scrollRestoration' in window.history)) return

        const scrollDom = document.getElementById(scrollDomId)

        let shouldScrollRestore = false
        window.history.scrollRestoration = 'manual'
        restoreScrollPos(router.asPath, scrollDom)

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            saveScrollPos(router.asPath, scrollDom)
            delete event['returnValue']
        }

        const onRouteChangeStart = () => {
            saveScrollPos(router.asPath, scrollDom)
        }

        const onRouteChangeComplete = (url: string) => {
            if (shouldScrollRestore) {
                shouldScrollRestore = false
                /**
                 * Calling with relative url, not expected asPath, so this
                 * will break if there is a basePath or locale path prefix.
                 */
                restoreScrollPos(url, scrollDom)
            }
        }

        window.addEventListener('beforeunload', onBeforeUnload)
        Router.events.on('routeChangeStart', onRouteChangeStart)
        Router.events.on('routeChangeComplete', onRouteChangeComplete)
        Router.beforePopState(() => {
            shouldScrollRestore = true
            return true
        })

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload)
            Router.events.off('routeChangeStart', onRouteChangeStart)
            Router.events.off('routeChangeComplete', onRouteChangeComplete)
            Router.beforePopState(() => true)
        }
    }, [router, scrollDomId])
}
