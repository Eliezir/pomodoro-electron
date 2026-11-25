import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { Channels, type Session, type Task } from '../shared/types';
import { Timer, type PhaseEndEvent } from './timer/Timer';
import { JsonStore } from './storage/JsonStore';
import { TaskRepository } from './repositories/TaskRepository';
import { SessionRepository } from './repositories/SessionRepository';
import { registerTimerHandlers } from './ipc/timerHandlers';
import { registerTaskHandlers } from './ipc/taskHandlers';
import { broadcast } from './ipc/broadcast';
import { createTray } from './menus/tray';
import { installAppMenu } from './menus/appMenu';
import { createPhaseEndNotifier } from './notifications';
import { createMainWindow } from './window';
import appIcon from '../../assets/app-icon.png?inline';

// Tests can keep their data apart from the real app's.
if (process.env.POMODORO_DATA_DIR)
  app.setPath('userData', process.env.POMODORO_DATA_DIR);

// Windows installer (Squirrel) runs the app once to create shortcuts; quit right away.
if (started) app.quit();

// Singleton: only one copy of the app may run. A second launch hands over
// to the first one (see 'second-instance' below) and quits.
const isFirstInstance = app.requestSingleInstanceLock();
if (!isFirstInstance) app.quit();

let mainWindow: BrowserWindow | null = null;

function showWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function bootstrap() {
  // Our own name, credits and icon in "Sobre" and in the Dock.
  app.setAboutPanelOptions({
    applicationName: 'Pomodoro',
    applicationVersion: app.getVersion(),
    copyright: 'Prova de conceito do seminário de Electron · IFAL Maceió',
    credits: 'Visual Meadow. Feito com Electron, React, Tailwind e beUI.',
  });
  if (process.platform === 'darwin')
    app.dock?.setIcon(nativeImage.createFromDataURL(appIcon));

  // Data lives in the per-user app folder, e.g. ~/Library/Application Support/Pomodoro.
  const dataDir = app.getPath('userData');
  const tasks = new TaskRepository(
    new JsonStore<Task[]>(path.join(dataDir, 'tasks.json'), () => []),
  );
  const sessions = new SessionRepository(
    new JsonStore<Session[]>(path.join(dataDir, 'sessions.json'), () => []),
  );

  const timer = new Timer();
  if (process.env.POMODORO_DEMO === '1') timer.setDemoMode(true);

  // Observer: everyone who cares about the timer subscribes here.
  timer.on('tick', (snapshot) => broadcast(Channels.timerTick, snapshot));
  timer.on('phaseEnd', createPhaseEndNotifier(tasks, showWindow));
  timer.on('phaseEnd', (event: PhaseEndEvent) => {
    if (event.phase !== 'focus') return;
    sessions.add({
      taskId: event.taskId,
      startedAt: event.startedAt.toISOString(),
      endedAt: event.endedAt.toISOString(),
      durationMs: event.durationMs,
    });
    if (event.taskId) tasks.addPomodoro(event.taskId);
    broadcast(Channels.dataChanged);
  });

  registerTimerHandlers(timer, tasks);
  registerTaskHandlers(tasks, sessions, timer);
  installAppMenu(timer, tasks, showWindow);
  createTray(timer, tasks, showWindow);
  mainWindow = createMainWindow();
}

if (isFirstInstance) {
  app.on('second-instance', showWindow);

  app.whenReady().then(() => {
    bootstrap();
    // macOS: clicking the Dock icon with no window open brings one back.
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) showWindow();
    });
  });

  // The timer keeps running in the tray, so closing the window does not quit
  // on macOS. Elsewhere, closing the last window quits, as users expect.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
