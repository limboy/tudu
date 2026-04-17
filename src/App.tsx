import { useState } from 'react'
import { CheckCircle2, Circle, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Task = { id: number; text: string; done: boolean }

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Welcome to tudu', done: true },
    { id: 2, text: 'Build something great', done: false },
  ])

  const toggle = (id: number) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))

  const add = () =>
    setTasks((t) => [
      ...t,
      { id: Date.now(), text: `New task ${t.length + 1}`, done: false },
    ])

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">tudu</h1>
        </div>

        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent cursor-pointer"
              onClick={() => toggle(task.id)}
            >
              {task.done ? (
                <CheckCircle2 className="size-5 text-primary" />
              ) : (
                <Circle className="size-5 text-muted-foreground" />
              )}
              <span className={task.done ? 'line-through text-muted-foreground' : ''}>
                {task.text}
              </span>
            </li>
          ))}
        </ul>

        <Button onClick={add} className="w-full">
          <Plus className="size-4" />
          Add task
        </Button>
      </div>
    </div>
  )
}
