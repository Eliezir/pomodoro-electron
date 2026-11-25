import { EventEmitter } from 'node:events';
import type { PhaseName, TimerSnapshot, TimerStatus } from '../../shared/types';
import { phases, type Phase } from './phases';

export interface PhaseEndEvent {
  phase: PhaseName;
  next: PhaseName;
  taskId: string | null;
  startedAt: Date;
  endedAt: Date;
  durationMs: number;
}

/** Events the timer publishes. Anyone can subscribe with `timer.on(...)`. */
interface TimerEvents {
  /** Every second while running, and on every state change. */
  tick: [snapshot: TimerSnapshot];
  /** A phase ran until zero (skipping does not count). */
  phaseEnd: [event: PhaseEndEvent];
}

const UPDATE_EVERY_MS = 250;

/**
 * The pomodoro timer. It lives in the main process, so it keeps counting
 * when the window is closed, and every window and the tray just observe it.
 *
 * Observer pattern: the timer extends EventEmitter, the same base class
 * Electron's own `app` and `BrowserWindow` use. It does not know who is
 * listening (the window, the tray, notifications, the session log).
 */
export class Timer extends EventEmitter<TimerEvents> {
  private phase: Phase = phases.focus;
  private status: TimerStatus = 'idle';
  private demoMode = false;
  private remainingMs = this.phase.durationMs(this.demoMode);
  private endsAt = 0;
  private startedAt: Date | null = null;
  private completedFocus = 0;
  private activeTaskId: string | null = null;
  private interval: NodeJS.Timeout | null = null;
  private lastEmittedSecond = -1;

  snapshot(): TimerSnapshot {
    return {
      phase: this.phase.name,
      status: this.status,
      remainingMs: this.remainingMs,
      durationMs: this.phase.durationMs(this.demoMode),
      completedFocus: this.completedFocus,
      activeTaskId: this.activeTaskId,
      demoMode: this.demoMode,
    };
  }

  start() {
    if (this.status === 'running') return;
    if (this.status === 'idle') this.startedAt = new Date();
    this.status = 'running';
    this.endsAt = Date.now() + this.remainingMs;
    this.interval = setInterval(() => this.update(), UPDATE_EVERY_MS);
    this.emitTick();
  }

  pause() {
    if (this.status !== 'running') return;
    this.stopInterval();
    this.remainingMs = Math.max(0, this.endsAt - Date.now());
    this.status = 'paused';
    this.emitTick();
  }

  toggle() {
    if (this.status === 'running') this.pause();
    else this.start();
  }

  /** Moves to the next phase without counting the current one. */
  skip() {
    this.enterPhase(this.phase.next(this.completedFocus));
  }

  /** Back to the first focus phase, with the round counter at zero. */
  reset() {
    this.completedFocus = 0;
    this.enterPhase(phases.focus);
  }

  /** Lets the user pick a phase by hand while the timer is not running. */
  selectPhase(name: PhaseName) {
    if (this.status === 'running' || name === this.phase.name) return;
    this.enterPhase(phases[name]);
  }

  setActiveTask(taskId: string | null) {
    this.activeTaskId = taskId;
    this.emitTick();
  }

  setDemoMode(on: boolean) {
    this.demoMode = on;
    // A new duration only makes sense for a phase that has not started.
    if (this.status === 'idle') this.remainingMs = this.phase.durationMs(on);
    this.emitTick();
  }

  isDemoMode() {
    return this.demoMode;
  }

  private update() {
    this.remainingMs = Math.max(0, this.endsAt - Date.now());
    if (this.remainingMs === 0) {
      this.finishPhase();
      return;
    }
    const second = Math.ceil(this.remainingMs / 1000);
    if (second !== this.lastEmittedSecond) this.emitTick();
  }

  private finishPhase() {
    const ended = this.phase;
    if (ended.name === 'focus') this.completedFocus += 1;
    const next = ended.next(this.completedFocus);
    const endedAt = new Date();
    const startedAt = this.startedAt ?? endedAt;

    this.emit('phaseEnd', {
      phase: ended.name,
      next: next.name,
      taskId: this.activeTaskId,
      startedAt,
      endedAt,
      durationMs: ended.durationMs(this.demoMode),
    });
    this.enterPhase(next);
  }

  /** The next phase waits for the user to press start. */
  private enterPhase(phase: Phase) {
    this.stopInterval();
    this.phase = phase;
    this.status = 'idle';
    this.startedAt = null;
    this.remainingMs = phase.durationMs(this.demoMode);
    this.emitTick();
  }

  private stopInterval() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  private emitTick() {
    this.lastEmittedSecond = Math.ceil(this.remainingMs / 1000);
    this.emit('tick', this.snapshot());
  }
}
