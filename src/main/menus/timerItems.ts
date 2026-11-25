import type { MenuItemConstructorOptions } from 'electron';
import type { PhaseName } from '../../shared/types';
import type { Timer } from '../timer/Timer';
import type { TaskRepository } from '../repositories/TaskRepository';
import { phases } from '../timer/phases';

const PHASE_ORDER: PhaseName[] = ['focus', 'shortBreak', 'longBreak'];

/**
 * The timer's menu items, shared by the menu bar and the tray menu.
 * Composite pattern: "Fase" and "Tarefa em foco" are submenus, which are
 * just more lists of items; Electron builds the whole tree the same way.
 */
export function timerItems(
  timer: Timer,
  tasks: TaskRepository,
  { accelerators }: { accelerators: boolean },
): MenuItemConstructorOptions[] {
  const snapshot = timer.snapshot();
  const running = snapshot.status === 'running';
  const key = (combo: string) => (accelerators ? combo : undefined);
  const openTasks = tasks.list().filter((task) => !task.done);

  return [
    {
      label: running
        ? 'Pausar'
        : snapshot.status === 'paused'
          ? 'Continuar'
          : 'Iniciar',
      accelerator: key('CmdOrCtrl+Enter'),
      click: () => timer.toggle(),
    },
    {
      label: 'Pular fase',
      accelerator: key('CmdOrCtrl+Right'),
      click: () => timer.skip(),
    },
    {
      label: 'Reiniciar ciclo',
      accelerator: key('CmdOrCtrl+Shift+R'),
      click: () => timer.reset(),
    },
    { type: 'separator' },
    {
      label: 'Fase',
      submenu: PHASE_ORDER.map((name, index) => ({
        label: phases[name].label,
        type: 'radio' as const,
        checked: snapshot.phase === name,
        // Changing phase mid-countdown would lose time, so only when stopped.
        enabled: !running,
        accelerator: key(`CmdOrCtrl+${index + 1}`),
        click: () => timer.selectPhase(name),
      })),
    },
    {
      label: 'Tarefa em foco',
      submenu: [
        {
          label: 'Nenhuma',
          type: 'radio' as const,
          checked: snapshot.activeTaskId === null,
          click: () => timer.setActiveTask(null),
        },
        ...(openTasks.length ? [{ type: 'separator' as const }] : []),
        ...openTasks.map((task) => ({
          label: task.pomodoros
            ? `${task.title} (${task.pomodoros})`
            : task.title,
          type: 'radio' as const,
          checked: snapshot.activeTaskId === task.id,
          click: () => timer.setActiveTask(task.id),
        })),
      ],
    },
    { type: 'separator' },
    {
      label: 'Modo demonstração (20 s / 5 s / 10 s)',
      type: 'checkbox',
      checked: snapshot.demoMode,
      click: (item) => timer.setDemoMode(item.checked),
    },
  ];
}

/**
 * A short key that changes only when the menus need rebuilding: status,
 * phase, active task or demo mode. The countdown itself is not in it.
 */
export function menuStateKey(timer: Timer) {
  const s = timer.snapshot();
  return `${s.status}|${s.phase}|${s.activeTaskId}|${s.demoMode}`;
}
