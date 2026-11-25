import { BrowserWindow } from 'electron';
import { isIpcMonitor } from '../ipcMonitorWindow';
import { logIpc, summarize } from './ipcLog';

/** Sends a message from the main process to every app window (not the IPC monitor). */
export function broadcast(channel: string, ...args: unknown[]) {
  logIpc({
    direction: 'to-renderer',
    kind: 'event',
    api: 'webContents.send → ipcRenderer.on',
    channel,
    summary: summarize(args.length ? args[0] : undefined),
  });
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed() && !isIpcMonitor(window))
      window.webContents.send(channel, ...args);
  }
}
