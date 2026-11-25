import { randomUUID } from 'node:crypto';
import type { Session, TodayStats } from '../../shared/types';
import type { JsonStore } from '../storage/JsonStore';

/** Repository for finished focus phases. */
export class SessionRepository {
  constructor(private readonly store: JsonStore<Session[]>) {}

  add(session: Omit<Session, 'id'>): Session {
    const saved: Session = { id: randomUUID(), ...session };
    this.store.write([...this.store.read(), saved]);
    return saved;
  }

  statsFor(day: Date): TodayStats {
    const sameDay = this.store
      .read()
      .filter(
        (session) =>
          new Date(session.endedAt).toDateString() === day.toDateString(),
      );
    return {
      pomodoros: sameDay.length,
      focusMs: sameDay.reduce(
        (total, session) => total + session.durationMs,
        0,
      ),
    };
  }
}
