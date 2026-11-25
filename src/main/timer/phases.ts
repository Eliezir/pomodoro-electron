import type { PhaseName } from '../../shared/types';

/**
 * State pattern: each phase of the pomodoro cycle is an object that knows
 * its own duration and which phase comes after it. The Timer never asks
 * "if focus then… else if break then…"; it just asks the current phase.
 */
export interface Phase {
  readonly name: PhaseName;
  /** Label shown in the tray and notifications. */
  readonly label: string;
  durationMs(demoMode: boolean): number;
  /** `completedFocus` already counts the phase that just ended. */
  next(completedFocus: number): Phase;
}

const MINUTE = 60_000;
const SECOND = 1_000;
const FOCUS_ROUNDS_BEFORE_LONG_BREAK = 4;

class FocusPhase implements Phase {
  readonly name = 'focus';
  readonly label = 'Foco';
  durationMs(demoMode: boolean) {
    return demoMode ? 20 * SECOND : 25 * MINUTE;
  }
  next(completedFocus: number): Phase {
    return completedFocus % FOCUS_ROUNDS_BEFORE_LONG_BREAK === 0
      ? longBreak
      : shortBreak;
  }
}

class ShortBreakPhase implements Phase {
  readonly name = 'shortBreak';
  readonly label = 'Pausa';
  durationMs(demoMode: boolean) {
    return demoMode ? 5 * SECOND : 5 * MINUTE;
  }
  next(): Phase {
    return focus;
  }
}

class LongBreakPhase implements Phase {
  readonly name = 'longBreak';
  readonly label = 'Pausa longa';
  durationMs(demoMode: boolean) {
    return demoMode ? 10 * SECOND : 15 * MINUTE;
  }
  next(): Phase {
    return focus;
  }
}

const focus = new FocusPhase();
const shortBreak = new ShortBreakPhase();
const longBreak = new LongBreakPhase();

export const phases: Record<PhaseName, Phase> = {
  focus,
  shortBreak,
  longBreak,
};
