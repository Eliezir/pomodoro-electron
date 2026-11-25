// Types shared by the main process, the preload script and the renderer.

export type PhaseName = 'focus' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

/** What the renderer and the tray need to draw the timer. */
export interface TimerSnapshot {
  phase: PhaseName;
  status: TimerStatus;
  remainingMs: number;
  durationMs: number;
  /** Focus phases finished since the last reset. Every 4th one earns a long break. */
  completedFocus: number;
  activeTaskId: string | null;
  demoMode: boolean;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  /** Focus phases finished while this task was active. */
  pomodoros: number;
  createdAt: string;
}

/** One finished focus phase. */
export interface Session {
  id: string;
  taskId: string | null;
  startedAt: string;
  endedAt: string;
  durationMs: number;
}

export interface TodayStats {
  pomodoros: number;
  focusMs: number;
}

/** One IPC message, as shown in the "Monitor de IPC" window. */
export interface IpcLogEntry {
  id: number;
  /** Epoch milliseconds. */
  at: number;
  /** 'to-main': renderer → main. 'to-renderer': main → renderer. */
  direction: 'to-main' | 'to-renderer';
  /** invoke: a request; reply: its answer; event: a one-way message; error: a failed request. */
  kind: 'invoke' | 'reply' | 'event' | 'error';
  /** The Electron API pair that carried the message, e.g. 'invoke → handle'. */
  api: string;
  channel: string;
  summary: string;
}

/** The API the preload script exposes to the renderer as `window.pomodoro`. */
export interface PomodoroApi {
  /** 'darwin', 'win32' or 'linux', so the page can leave room for window controls. */
  platform: string;
  timer: {
    getSnapshot(): Promise<TimerSnapshot>;
    start(): Promise<void>;
    pause(): Promise<void>;
    skip(): Promise<void>;
    reset(): Promise<void>;
    selectPhase(phase: PhaseName): Promise<void>;
    setActiveTask(taskId: string | null): Promise<void>;
    /** Called on every second and on every change. Returns an unsubscribe function. */
    onTick(listener: (snapshot: TimerSnapshot) => void): () => void;
  };
  tasks: {
    list(): Promise<Task[]>;
    create(title: string): Promise<Task>;
    rename(id: string, title: string): Promise<Task>;
    setDone(id: string, done: boolean): Promise<Task>;
    remove(id: string): Promise<void>;
  };
  stats: {
    today(): Promise<TodayStats>;
  };
  /** Called when tasks or sessions change in the main process. */
  onDataChanged(listener: () => void): () => void;
  /** Used only by the "Monitor de IPC" window. */
  ipcMonitor: {
    onEntry(listener: (entry: IpcLogEntry) => void): () => void;
  };
}

/** IPC channel names, kept in one place so both sides agree. */
export const Channels = {
  timerGetSnapshot: 'timer:get-snapshot',
  timerStart: 'timer:start',
  timerPause: 'timer:pause',
  timerSkip: 'timer:skip',
  timerReset: 'timer:reset',
  timerSelectPhase: 'timer:select-phase',
  timerSetActiveTask: 'timer:set-active-task',
  timerTick: 'timer:tick',
  tasksList: 'tasks:list',
  tasksCreate: 'tasks:create',
  tasksRename: 'tasks:rename',
  tasksSetDone: 'tasks:set-done',
  tasksRemove: 'tasks:remove',
  statsToday: 'stats:today',
  dataChanged: 'data:changed',
  ipcLog: 'ipc:log',
} as const;
