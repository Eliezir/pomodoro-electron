import type { PomodoroApi } from '../shared/types';

declare global {
  interface Window {
    /** Exposed by src/preload/preload.ts through contextBridge. */
    pomodoro: PomodoroApi;
  }
}
