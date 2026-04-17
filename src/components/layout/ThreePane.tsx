import { useCallback, useEffect, useRef, type ReactNode } from 'react'

const LEFT_MIN = 160
const LEFT_MAX = 480
const RIGHT_MIN = 240
const RIGHT_MAX = 560

export function ThreePane({
  left,
  center,
  right,
  leftOpen,
  rightOpen,
  leftWidth,
  rightWidth,
  onLeftWidthChange,
  onRightWidthChange,
}: {
  left: ReactNode
  center: ReactNode
  right: ReactNode
  leftOpen: boolean
  rightOpen: boolean
  leftWidth: number
  rightWidth: number
  onLeftWidthChange: (w: number) => void
  onRightWidthChange: (w: number) => void
}) {
  return (
    <div className="flex-1 min-h-0 flex overflow-hidden bg-background text-foreground">
      {leftOpen && (
        <>
          <aside
            className="shrink-0 border-r bg-secondary/40 backdrop-blur-sm overflow-hidden"
            style={{ width: leftWidth }}
          >
            {left}
          </aside>
          <Resizer
            onResize={(dx) =>
              onLeftWidthChange(clamp(leftWidth + dx, LEFT_MIN, LEFT_MAX))
            }
          />
        </>
      )}
      <main className="flex-1 min-w-0 flex flex-col">{center}</main>
      {rightOpen && (
        <>
          <Resizer
            onResize={(dx) =>
              onRightWidthChange(clamp(rightWidth - dx, RIGHT_MIN, RIGHT_MAX))
            }
          />
          <aside
            className="shrink-0 border-l bg-secondary/40 backdrop-blur-sm overflow-hidden"
            style={{ width: rightWidth }}
          >
            {right}
          </aside>
        </>
      )}
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function Resizer({ onResize }: { onResize: (dx: number) => void }) {
  const lastX = useRef<number | null>(null)

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (lastX.current == null) return
      const dx = e.clientX - lastX.current
      lastX.current = e.clientX
      if (dx !== 0) onResize(dx)
    },
    [onResize],
  )

  const onUp = useCallback(() => {
    lastX.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }, [onMove])

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [onMove, onUp])

  const onDown = (e: React.MouseEvent) => {
    e.preventDefault()
    lastX.current = e.clientX
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onMouseDown={onDown}
      className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-border/80 active:bg-border transition-colors -mr-1 z-10"
    />
  )
}
