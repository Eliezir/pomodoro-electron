import { handle } from './ipcLog';
import { Channels } from '../../shared/types';
import type { TaskRepository } from '../repositories/TaskRepository';
import type { SessionRepository } from '../repositories/SessionRepository';
import type { Timer } from '../timer/Timer';
import { broadcast } from './broadcast';

const MAX_TITLE_LENGTH = 120;

function parseTitle(value: unknown): string {
  const title = typeof value === 'string' ? value.trim() : '';
  if (!title || title.length > MAX_TITLE_LENGTH)
    throw new Error('Invalid title');
  return title;
}

function parseId(value: unknown): string {
  if (typeof value !== 'string' || !value) throw new Error('Invalid id');
  return value;
}

/** The CRUD commands for tasks, plus today's stats. */
export function registerTaskHandlers(
  tasks: TaskRepository,
  sessions: SessionRepository,
  timer: Timer,
) {
  const changed = () => broadcast(Channels.dataChanged);

  handle(Channels.tasksList, () => tasks.list());

  handle(Channels.tasksCreate, (_event, title: unknown) => {
    const task = tasks.create(parseTitle(title));
    changed();
    return task;
  });

  handle(Channels.tasksRename, (_event, id: unknown, title: unknown) => {
    const task = tasks.update(parseId(id), { title: parseTitle(title) });
    changed();
    return task;
  });

  handle(Channels.tasksSetDone, (_event, id: unknown, done: unknown) => {
    const task = tasks.update(parseId(id), { done: done === true });
    if (task.done && timer.snapshot().activeTaskId === task.id)
      timer.setActiveTask(null);
    changed();
    return task;
  });

  handle(Channels.tasksRemove, (_event, id: unknown) => {
    const taskId = parseId(id);
    tasks.remove(taskId);
    if (timer.snapshot().activeTaskId === taskId) timer.setActiveTask(null);
    changed();
  });

  handle(Channels.statsToday, () => sessions.statsFor(new Date()));
}
