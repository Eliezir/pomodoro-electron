import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { Task } from '../../shared/types';
import type { JsonStore } from '../storage/JsonStore';

/**
 * Repository pattern: the rest of the app asks for tasks by meaning
 * ("create", "rename", "add a pomodoro") and never touches the JSON file.
 * Switching to SQLite later would only change this class.
 *
 * It also emits 'change' after every write, so the menus can stay current.
 */
export class TaskRepository extends EventEmitter<{ change: [] }> {
  constructor(private readonly store: JsonStore<Task[]>) {
    super();
  }

  private save(tasks: Task[]) {
    this.store.write(tasks);
    this.emit('change');
  }

  list(): Task[] {
    return [...this.store.read()];
  }

  findById(id: string): Task | undefined {
    return this.store.read().find((task) => task.id === id);
  }

  create(title: string): Task {
    const task: Task = {
      id: randomUUID(),
      title,
      done: false,
      pomodoros: 0,
      createdAt: new Date().toISOString(),
    };
    this.save([...this.store.read(), task]);
    return task;
  }

  update(
    id: string,
    changes: Partial<Pick<Task, 'title' | 'done' | 'pomodoros'>>,
  ): Task {
    const current = this.findById(id);
    if (!current) throw new Error(`Task not found: ${id}`);
    const updated = { ...current, ...changes };
    this.save(
      this.store.read().map((task) => (task.id === id ? updated : task)),
    );
    return updated;
  }

  addPomodoro(id: string): Task | undefined {
    const task = this.findById(id);
    return task
      ? this.update(id, { pomodoros: task.pomodoros + 1 })
      : undefined;
  }

  remove(id: string) {
    this.save(this.store.read().filter((task) => task.id !== id));
  }
}
