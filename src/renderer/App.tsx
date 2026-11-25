import { PaintFilters } from '@/components/meadow/PaintFilters';
import { TimerHero } from './features/TimerHero';
import { TimerControls } from './features/TimerControls';
import { TaskList } from './features/TaskList';
import { useDarkMode, useTasksAndStats, useTimer } from './hooks/usePomodoro';

export function App() {
  const dark = useDarkMode();
  const snapshot = useTimer();
  const { tasks, today } = useTasksAndStats();

  if (!snapshot) return <PaintFilters />;
  const activeTask = tasks.find((task) => task.id === snapshot.activeTaskId);

  return (
    <div className="flex h-full flex-col">
      <PaintFilters />
      <TimerHero
        snapshot={snapshot}
        activeTask={activeTask}
        today={today}
        dark={dark}
      />
      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <TimerControls snapshot={snapshot} />
        <TaskList tasks={tasks} activeTaskId={snapshot.activeTaskId} />
      </main>
    </div>
  );
}
