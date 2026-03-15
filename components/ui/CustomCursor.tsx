'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    if (!dot) return

    let x = 0
    let y = 0

    const moveCursor = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      dot.style.transform = `translate(${x}px, ${y}px)`
    }

    const expandCursor = () => dot.classList.add('expanded')
    const shrinkCursor = () => dot.classList.remove('expanded')

    document.addEventListener('mousemove', moveCursor)

    const interactives = document.querySelectorAll('a, button, input, textarea, select, [data-cursor="pointer"]')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', expandCursor)
      el.addEventListener('mouseleave', shrinkCursor)
    })

    // Observer for dynamically added elements
    const observer = new MutationObserver(() => {
      const newInteractives = document.querySelectorAll('a, button, input, textarea, select, [data-cursor="pointer"]')
      newInteractives.forEach(el => {
        el.removeEventListener('mouseenter', expandCursor)
        el.removeEventListener('mouseleave', shrinkCursor)
        el.addEventListener('mouseenter', expandCursor)
        el.addEventListener('mouseleave', shrinkCursor)
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', moveCursor)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={dotRef}
      className="cursor-dot"
      style={{
        position: 'fixed',
        top: '-4px',
        left: '-4px',
        width: '8px',
        height: '8px',
        backgroundColor: '#C8F03A',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'width 0.15s ease, height 0.15s ease, top 0.15s ease, left 0.15s ease',
        willChange: 'transform',
      }}
    />
  )
}
