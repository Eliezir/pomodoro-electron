import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import {
  Channels,
  type PomodoroApi,
  type TimerSnapshot,
} from '../shared/types';

/** Subscribes to a main-process message and returns a function that unsubscribes. */
function subscribe<T extends unknown[]>(
  channel: string,
  listener: (...args: T) => void,
) {
  const handler = (_event: IpcRendererEvent, ...args: unknown[]) =>
    listener(...(args as T));
  ipcRenderer.on(channel, handler);
  return () => {
    ipcRenderer.removeListener(channel, handler);
  };
}

/**
 * Facade + protection Proxy: the page gets a small, named API
 * (`window.pomodoro.timer.start()`) instead of raw `ipcRenderer` or Node.
 * Even if the page were compromised, these functions are all it could call.
 */
const api: PomodoroApi = {
  platform: process.platform,
  timer: {
    getSnapshot: () => ipcRenderer.invoke(Channels.timerGetSnapshot),
    start: () => ipcRenderer.invoke(Channels.timerStart),
    pause: () => ipcRenderer.invoke(Channels.timerPause),
    skip: () => ipcRenderer.invoke(Channels.timerSkip),
    reset: () => ipcRenderer.invoke(Channels.timerReset),
    selectPhase: (phase) =>
      ipcRenderer.invoke(Channels.timerSelectPhase, phase),
    setActiveTask: (taskId) =>
      ipcRenderer.invoke(Channels.timerSetActiveTask, taskId),
    onTick: (listener) =>
      subscribe<[TimerSnapshot]>(Channels.timerTick, listener),
  },
  tasks: {
    list: () => ipcRenderer.invoke(Channels.tasksList),
    create: (title) => ipcRenderer.invoke(Channels.tasksCreate, title),
    rename: (id, title) => ipcRenderer.invoke(Channels.tasksRename, id, title),
    setDone: (id, done) => ipcRenderer.invoke(Channels.tasksSetDone, id, done),
    remove: (id) => ipcRenderer.invoke(Channels.tasksRemove, id),
  },
  stats: {
    today: () => ipcRenderer.invoke(Channels.statsToday),
  },
  onDataChanged: (listener) => subscribe(Channels.dataChanged, listener),
};

contextBridge.exposeInMainWorld('pomodoro', api);
