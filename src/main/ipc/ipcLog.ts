import { EventEmitter } from 'node:events';
import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import type { IpcLogEntry } from '../../shared/types';

/**
 * A record of every IPC message, for the "Monitor de IPC" window.
 * It is an EventEmitter too: the monitor window subscribes to 'entry'.
 */
export const ipcLog = new EventEmitter<{ entry: [entry: IpcLogEntry] }>();

let nextId = 1;

export function logIpc(entry: Omit<IpcLogEntry, 'id' | 'at'>) {
  // Nobody listening (monitor closed): skip the work.
  if (ipcLog.listenerCount('entry') === 0) return;
  ipcLog.emit('entry', { id: nextId++, at: Date.now(), ...entry });
}

function clock(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** A short, readable description of an IPC payload. */
export function summarize(value: unknown): string {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'string')
    return `"${value.length > 40 ? `${value.slice(0, 40)}…` : value}"`;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.every((v) => typeof v !== 'object' || v === null))
      return value.map(summarize).join(', ');
    return `${value.length} ${value.length === 1 ? 'item' : 'itens'}`;
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if ('phase' in o && 'remainingMs' in o)
      return `${o.phase} ${clock(Number(o.remainingMs))} ${o.status}`;
    if ('title' in o) return `"${o.title}"${o.done ? ' (concluída)' : ''}`;
    if ('pomodoros' in o && 'focusMs' in o)
      return `${o.pomodoros} ${o.pomodoros === 1 ? 'pomodoro' : 'pomodoros'} hoje`;
    return `{ ${Object.keys(o).slice(0, 3).join(', ')} }`;
  }
  return String(value);
}

/**
 * `ipcMain.handle` plus logging: records the request (→) and the reply (←).
 * Every command handler is registered through this.
 */
export function handle(
  channel: string,
  listener: (event: IpcMainInvokeEvent, ...args: any[]) => unknown,
) {
  ipcMain.handle(channel, async (event, ...args) => {
    logIpc({
      direction: 'to-main',
      kind: 'invoke',
      channel,
      // One argument is shown as itself, several as a list, none as "—".
      summary: summarize(args.length > 1 ? args : args[0]),
    });
    try {
      const result = await listener(event, ...args);
      logIpc({
        direction: 'to-renderer',
        kind: 'reply',
        channel,
        summary: summarize(result),
      });
      return result;
    } catch (error) {
      logIpc({
        direction: 'to-renderer',
        kind: 'error',
        channel,
        summary: (error as Error).message,
      });
      throw error;
    }
  });
}
