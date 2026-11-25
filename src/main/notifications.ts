import { Notification } from 'electron';
import type { PhaseEndEvent } from './timer/Timer';
import type { TaskRepository } from './repositories/TaskRepository';

const MESSAGES: Record<PhaseEndEvent['next'], { title: string; body: string }> =
  {
    shortBreak: { title: 'Foco concluído', body: 'Hora de uma pausa curta.' },
    longBreak: {
      title: 'Quatro focos seguidos',
      body: 'Você ganhou uma pausa longa.',
    },
    focus: { title: 'Pausa encerrada', body: 'Pronto para o próximo foco?' },
  };

/** Subscriber for the timer's `phaseEnd` event: shows a system notification. */
export function createPhaseEndNotifier(
  tasks: TaskRepository,
  showWindow: () => void,
) {
  return (event: PhaseEndEvent) => {
    if (!Notification.isSupported()) return;
    const message = MESSAGES[event.next];
    const task =
      event.phase === 'focus' && event.taskId
        ? tasks.findById(event.taskId)
        : undefined;

    const notification = new Notification({
      title: message.title,
      body: task ? `${message.body} (${task.title})` : message.body,
    });
    notification.on('click', showWindow);
    notification.show();
  };
}
