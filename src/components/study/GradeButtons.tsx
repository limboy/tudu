import { cn } from '@/lib/utils'
import type { Rating } from '@/types'

const GRADES: Array<{
  rating: Rating
  label: string
  key: string
  color: string
}> = [
  {
    rating: 1,
    label: 'Again',
    key: '1',
    color: 'text-red-500 border-red-500/20 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/40',
  },
  {
    rating: 2,
    label: 'Hard',
    key: '2',
    color: 'text-orange-500 border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/40',
  },
  {
    rating: 3,
    label: 'Good',
    key: '3',
    color: 'text-green-500 border-green-500/20 bg-green-500/10 hover:bg-green-500/20 hover:border-green-500/40',
  },
  {
    rating: 4,
    label: 'Easy',
    key: '4',
    color: 'text-blue-500 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/40',
  },
]

export function GradeButtons({ onGrade }: { onGrade: (r: Rating) => void }) {
  return (
    <div className="grid grid-cols-4 gap-4 w-full max-w-3xl">
      {GRADES.map((g) => (
        <button
          key={g.rating}
          onClick={() => onGrade(g.rating)}
          className={cn(
            'flex flex-col items-center justify-center h-20 rounded-2xl border-2 transition-all cursor-pointer active:scale-95',
            g.color,
          )}
        >
          <span className="text-[11px] font-medium opacity-60 mb-0.5">
            {g.key}
          </span>
          <span className="text-base font-bold">{g.label}</span>
        </button>
      ))}
    </div>
  )
}

