import { BrowserWindow, screen } from 'electron';
import path from 'node:path';
import { Channels, type IpcLogEntry } from '../shared/types';
import { ipcLog } from './ipc/ipcLog';

let monitor: BrowserWindow | null = null;

export function isIpcMonitor(window: BrowserWindow) {
  return window === monitor;
}

/**
 * Opens the "Monitor de IPC": a second window (its own renderer process)
 * that lists every IPC message as it happens. It loads the same page with
 * the #ipc-monitor hash and receives entries on its own channel.
 */
export function openIpcMonitor(nextTo?: BrowserWindow | null) {
  if (monitor && !monitor.isDestroyed()) {
    monitor.show();
    return monitor;
  }

  const width = 420;
  const height = 520;
  let position: { x: number; y: number } | undefined;
  if (nextTo && !nextTo.isDestroyed()) {
    const b = nextTo.getBounds();
    const area = screen.getDisplayMatching(b).workArea;
    const x = b.x + b.width + 12;
    if (x + width <= area.x + area.width) position = { x, y: b.y };
  }

  const window = new BrowserWindow({
    width,
    height,
    ...position,
    minWidth: 320,
    minHeight: 300,
    show: false,
    title: 'Monitor de IPC',
    backgroundColor: '#121e18',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  monitor = window;

  // The monitor's own channel is sent directly, never logged, so it cannot loop.
  const forward = (entry: IpcLogEntry) => {
    if (!window.isDestroyed()) window.webContents.send(Channels.ipcLog, entry);
  };
  window.webContents.once('did-finish-load', () => ipcLog.on('entry', forward));
  window.on('closed', () => {
    ipcLog.off('entry', forward);
    monitor = null;
  });

  window.once('ready-to-show', () =>
    process.env.POMODORO_SHOW_INACTIVE === '1'
      ? window.showInactive()
      : window.show(),
  );

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#ipc-monitor`);
  } else {
    window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      {
        hash: 'ipc-monitor',
      },
    );
  }
  return window;
}
