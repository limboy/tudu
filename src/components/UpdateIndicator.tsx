import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function UpdateIndicator() {
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    window.tudu.update.onUpdateReady((info) => {
      setUpdateVersion(info.version)
    })

    if (import.meta.env.DEV) {
      ; (window as any).__triggerUpdatePreview = (version = '0.1.7') => {
        setUpdateVersion(version)
      }
    }
  }, [])

  if (!updateVersion) return null

  const handleApply = () => {
    setApplying(true)
    window.tudu.update.apply()
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className='text-amber-600'>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs shrink-0 rounded-full border-amber-600 transition-all hover:scale-105 active:scale-95"
            disabled={applying}
            onClick={handleApply}
          >
            <span>{applying ? 'Restarting' : 'Update'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to restart and update.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
