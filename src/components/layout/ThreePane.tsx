import type { ReactNode } from 'react'

export function ThreePane({
  left,
  center,
  right,
}: {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background text-foreground">
      <aside className="w-[220px] shrink-0 border-r bg-secondary/40 backdrop-blur-sm">
        {left}
      </aside>
      <main className="flex-1 min-w-0 flex flex-col">{center}</main>
      <aside className="w-[320px] shrink-0 border-l bg-secondary/40 backdrop-blur-sm">
        {right}
      </aside>
    </div>
  )
}
