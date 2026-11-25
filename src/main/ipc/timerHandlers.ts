import { ipcMain } from 'electron';
import { Channels, type PhaseName } from '../../shared/types';
import type { Timer } from '../timer/Timer';
import type { TaskRepository } from '../repositories/TaskRepository';

const PHASES: readonly PhaseName[] = ['focus', 'shortBreak', 'longBreak'];

/**
 * Command pattern: each IPC channel is a named command the renderer can
 * send ('timer:start', 'timer:skip'…), and each handler carries it out.
 * The renderer never calls the Timer directly.
 */
export function registerTimerHandlers(timer: Timer, tasks: TaskRepository) {
  ipcMain.handle(Channels.timerGetSnapshot, () => timer.snapshot());
  ipcMain.handle(Channels.timerStart, () => timer.start());
  ipcMain.handle(Channels.timerPause, () => timer.pause());
  ipcMain.handle(Channels.timerSkip, () => timer.skip());
  ipcMain.handle(Channels.timerReset, () => timer.reset());

  ipcMain.handle(Channels.timerSelectPhase, (_event, phase: unknown) => {
    // Anything that comes from the renderer is checked before use.
    if (!PHASES.includes(phase as PhaseName)) throw new Error('Invalid phase');
    timer.selectPhase(phase as PhaseName);
  });

  ipcMain.handle(Channels.timerSetActiveTask, (_event, taskId: unknown) => {
    if (
      taskId !== null &&
      (typeof taskId !== 'string' || !tasks.findById(taskId))
    ) {
      throw new Error('Invalid task');
    }
    timer.setActiveTask(taskId);
  });
}
