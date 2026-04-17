import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function UpdateBanner() {
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    window.tudu.update.onUpdateReady((info) => {
      setUpdateVersion(info.version)
    })
  }, [])

  if (!updateVersion) return null

  const handleApply = () => {
    setApplying(true)
    window.tudu.update.apply()
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border-b border-primary/20">
      <Download className="w-4 h-4 text-primary" />
      <span className="text-sm">
        Version {updateVersion} is ready to install
      </span>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto h-7 text-xs"
        disabled={applying}
        onClick={handleApply}
      >
        {applying ? 'Restarting...' : 'Restart to update'}
      </Button>
    </div>
  )
}
