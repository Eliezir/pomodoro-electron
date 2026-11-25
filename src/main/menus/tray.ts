import { Menu, Tray, nativeImage } from 'electron';
import type { TimerSnapshot } from '../../shared/types';
import type { Timer } from '../timer/Timer';
import type { TaskRepository } from '../repositories/TaskRepository';
import { phases } from '../timer/phases';
import { formatClock } from '../format';
import { menuStateKey, timerItems } from './timerItems';
import trayIcon1x from '../../../assets/trayTemplate.png?inline';
import trayIcon2x from '../../../assets/trayTemplate@2x.png?inline';
import appIcon from '../../../assets/icon/icon.png?inline';

function createTrayImage() {
  if (process.platform !== 'darwin') {
    return nativeImage
      .createFromDataURL(appIcon)
      .resize({ width: 16, height: 16 });
  }
  // A "template" image is drawn in black and macOS recolors it for light and dark menu bars.
  const image = nativeImage.createEmpty();
  image.addRepresentation({ scaleFactor: 1, dataURL: trayIcon1x });
  image.addRepresentation({ scaleFactor: 2, dataURL: trayIcon2x });
  image.setTemplateImage(true);
  return image;
}

/**
 * The tray icon (menu bar on macOS, notification area on Windows).
 * It observes the timer: the countdown is shown next to the icon, and the
 * menu (the same timer items as the menu bar) is rebuilt when state changes.
 */
export function createTray(
  timer: Timer,
  tasks: TaskRepository,
  showWindow: () => void,
) {
  const tray = new Tray(createTrayImage());
  let lastKey = '';

  const rebuildMenu = () => {
    lastKey = menuStateKey(timer);
    const s = timer.snapshot();
    const menu = Menu.buildFromTemplate([
      {
        label: `${phases[s.phase].label} · ${formatClock(s.remainingMs)}`,
        enabled: false,
      },
      { type: 'separator' },
      ...timerItems(timer, tasks, { accelerators: false }),
      { type: 'separator' },
      { label: 'Mostrar janela', click: showWindow },
      { role: 'quit', label: 'Sair' },
    ]);
    tray.setContextMenu(menu);
  };

  const update = (snapshot: TimerSnapshot) => {
    const clock = formatClock(snapshot.remainingMs);
    // macOS shows text next to the icon; other systems only show a tooltip.
    if (process.platform === 'darwin')
      tray.setTitle(snapshot.status === 'idle' ? '' : ` ${clock}`, {
        fontType: 'monospacedDigit',
      });
    tray.setToolTip(`Pomodoro · ${phases[snapshot.phase].label} · ${clock}`);
    if (menuStateKey(timer) !== lastKey) rebuildMenu();
  };

  // The first menu line shows the time; refresh it when the menu opens.
  tray.on('mouse-enter', rebuildMenu);
  timer.on('tick', update);
  tasks.on('change', rebuildMenu);
  update(timer.snapshot());
  rebuildMenu();
  return tray;
}
