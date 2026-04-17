import { Button } from '@/components/ui/button'
import type { Rating } from '@/types'

const GRADES: Array<{
  rating: Rating
  label: string
  key: string
  variant: 'destructive' | 'secondary' | 'default' | 'outline'
}> = [
  { rating: 1, label: 'Again', key: '1', variant: 'destructive' },
  { rating: 2, label: 'Hard', key: '2', variant: 'secondary' },
  { rating: 3, label: 'Good', key: '3', variant: 'default' },
  { rating: 4, label: 'Easy', key: '4', variant: 'outline' },
]

export function GradeButtons({ onGrade }: { onGrade: (r: Rating) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-xl">
      {GRADES.map((g) => (
        <Button
          key={g.rating}
          variant={g.variant}
          size="lg"
          onClick={() => onGrade(g.rating)}
          className="flex-col h-16"
        >
          <span className="text-sm font-medium">{g.label}</span>
          <span className="text-[10px] opacity-70">{g.key}</span>
        </Button>
      ))}
    </div>
  )
}
