import { BrowserWindow } from 'electron';

/** Sends a message from the main process to every open window. */
export function broadcast(channel: string, ...args: unknown[]) {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) window.webContents.send(channel, ...args);
  }
}
