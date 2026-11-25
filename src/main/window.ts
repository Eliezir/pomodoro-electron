import { BrowserWindow, nativeImage } from 'electron';
import path from 'node:path';
import appIcon from '../../assets/app-icon.png?inline';

export function createMainWindow() {
  const window = new BrowserWindow({
    width: 440,
    height: 820,
    minWidth: 380,
    minHeight: 600,
    show: false,
    title: 'Pomodoro',
    backgroundColor: '#121e18',
    // Our own top bar: the painted sky runs under the window controls.
    // macOS keeps the traffic lights (inset); Windows and Linux draw the
    // minimize, maximize and close buttons as an overlay on our page.
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    ...(process.platform === 'darwin'
      ? { trafficLightPosition: { x: 18, y: 18 } }
      : {
          titleBarOverlay: {
            color: '#1f3a44',
            symbolColor: '#fbf6e6',
            height: 48,
          },
        }),
    icon: nativeImage.createFromDataURL(appIcon),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      // The page runs isolated from Node and from the preload's own scope.
      // These are Electron's defaults; they are spelled out because they matter.
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  // POMODORO_SHOW_INACTIVE lets automated tests open the window without taking focus.
  window.once('ready-to-show', () =>
    process.env.POMODORO_SHOW_INACTIVE === '1'
      ? window.showInactive()
      : window.show(),
  );

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  return window;
}
