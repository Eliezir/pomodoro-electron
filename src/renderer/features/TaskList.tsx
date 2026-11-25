import { useState, type KeyboardEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { Task } from '../../shared/types';
import { Checkbox } from '@/components/motion/checkbox';
import { Input } from '@/components/motion/input';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/format';

function TaskRow({ task, active }: { task: Task; active: boolean }) {
  const { tasks, timer } = window.pomodoro;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  const save = async () => {
    const title = draft.trim();
    setEditing(false);
    if (title && title !== task.title) await tasks.rename(task.id, title);
    else setDraft(task.title);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') save();
    if (event.key === 'Escape') {
      setDraft(task.title);
      setEditing(false);
    }
  };

  return (
    <li
      className={cn(
        'relative flex items-center gap-3 rounded-xl px-2 py-2',
        active && 'bg-[var(--raised)]',
      )}
    >
      <Checkbox
        checked={task.done}
        onCheckedChange={(done) => tasks.setDone(task.id, done)}
        aria-label={`Concluir ${task.title}`}
        labels={{ checked: 'Concluída' }}
      />

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            maxLength={120}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={save}
            onKeyDown={onKeyDown}
            aria-label="Novo nome da tarefa"
            className="w-full rounded-md bg-transparent text-[15px] font-semibold outline-none"
          />
        ) : (
          <button
            type="button"
            disabled={task.done}
            onClick={() => timer.setActiveTask(active ? null : task.id)}
            onDoubleClick={() => setEditing(true)}
            title="Clique para focar nesta tarefa. Clique duas vezes para renomear."
            className="block w-full text-left"
          >
            <span
              className={cn(
                'block truncate text-[15px] font-semibold',
                task.done && 'text-muted-foreground line-through',
              )}
            >
              {task.title}
            </span>
            <span className="tabular block text-[13px] text-muted-foreground">
              {plural(task.pomodoros, 'pomodoro', 'pomodoros')}
            </span>
          </button>
        )}
      </div>

      {active && (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold"
          style={{
            background: 'var(--celebrate)',
            color: 'var(--on-celebrate)',
          }}
        >
          Em foco
        </span>
      )}
      <button
        type="button"
        onClick={() => tasks.remove(task.id)}
        aria-label={`Apagar ${task.title}`}
        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-[var(--raised)] hover:text-foreground"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </li>
  );
}

export function TaskList({
  tasks,
  activeTaskId,
}: {
  tasks: Task[];
  activeTaskId: string | null;
}) {
  const [title, setTitle] = useState('');

  const add = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await window.pomodoro.tasks.create(trimmed);
    setTitle('');
  };

  // Open tasks first, finished ones at the end.
  const sorted = [...tasks].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <section
      className="paper flex min-h-0 flex-1 flex-col px-5 pt-4 pb-4"
      aria-labelledby="tasks-title"
    >
      <div className="flex items-baseline justify-between">
        <h2 id="tasks-title" className="font-display text-xl">
          Tarefas
        </h2>
        <p className="tabular text-[13px] text-muted-foreground">
          {plural(
            tasks.filter((task) => !task.done).length,
            'aberta',
            'abertas',
          )}
        </p>
      </div>

      <form
        className="mt-3"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <Input
          value={title}
          onChange={setTitle}
          placeholder="Nova tarefa e Enter"
          aria-label="Nova tarefa"
          maxLength={120}
        />
      </form>

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Adicione uma tarefa e clique nela para focar. Cada foco concluído
          conta para ela.
        </p>
      ) : (
        <ul className="mt-2 -mx-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {sorted.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              active={task.id === activeTaskId}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
