import { useEffect, useRef, useState } from 'react';
import type { Task, TimerSnapshot, TodayStats } from '../../shared/types';
import { DigitSwap } from '@/components/motion/digit-swap';
import { Scene } from '@/components/meadow/Scene';
import { Grass } from '@/components/meadow/Grass';
import { Dino, type DinoMood } from '@/components/meadow/Dino';
import { PHASE_LABEL, formatClock, formatDuration } from '@/lib/format';

const isMac = window.pomodoro.platform === 'darwin';

const CELEBRATE_MS = 3000;

function moodFor(snapshot: TimerSnapshot, celebrating: boolean): DinoMood {
  if (celebrating) return 'celebrate';
  if (snapshot.status === 'paused') return 'nudge';
  if (snapshot.status === 'running')
    return snapshot.phase === 'focus' ? 'curious' : 'sleepy';
  return 'idle';
}

const MOOD_LABEL: Record<DinoMood, string> = {
  idle: 'Dino esperando',
  curious: 'Dino concentrado',
  sleepy: 'Dino descansando',
  nudge: 'Dino chamando você de volta',
  celebrate: 'Dino comemorando',
};

export function TimerHero({
  snapshot,
  activeTask,
  today,
  dark,
}: {
  snapshot: TimerSnapshot;
  activeTask?: Task;
  today: TodayStats;
  dark: boolean;
}) {
  // Celebrate for a moment each time a focus phase is completed.
  const [celebrating, setCelebrating] = useState(false);
  const lastCompleted = useRef(snapshot.completedFocus);
  useEffect(() => {
    if (snapshot.completedFocus > lastCompleted.current) {
      setCelebrating(true);
      const id = setTimeout(() => setCelebrating(false), CELEBRATE_MS);
      lastCompleted.current = snapshot.completedFocus;
      return () => clearTimeout(id);
    }
    lastCompleted.current = snapshot.completedFocus;
  }, [snapshot.completedFocus]);

  const progress = 1 - snapshot.remainingMs / snapshot.durationMs;
  const round = (snapshot.completedFocus % 4) + 1;
  const mood = moodFor(snapshot, celebrating);

  return (
    <header className="app-drag relative h-[312px] shrink-0 overflow-hidden">
      <Scene progress={progress} />
      <Grass
        dark={dark}
        className="absolute inset-x-0 bottom-0 h-[78px] w-full"
      />

      {/* Our own title bar. The whole sky drags the window; on macOS the
          traffic lights sit at the left, elsewhere the system buttons at the right. */}
      <div
        className={`relative z-10 flex h-12 items-center gap-2 ${isMac ? 'pr-3 pl-[84px]' : 'pr-[150px] pl-5'}`}
      >
        <span
          className="font-display text-[17px] leading-none"
          style={{ color: 'var(--clock)', textShadow: 'var(--clock-shadow)' }}
        >
          Pomodoro<span style={{ color: 'var(--celebrate)' }}>.</span>
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span
            className="tabular rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm"
            style={{
              background:
                'color-mix(in srgb, var(--background) 55%, transparent)',
              color: 'var(--foreground)',
            }}
          >
            Hoje {today.pomodoros} · {formatDuration(today.focusMs)}
          </span>
          {snapshot.demoMode && (
            <span
              className="rounded-full px-2.5 py-1 text-xs font-bold"
              style={{
                background: 'var(--celebrate)',
                color: 'var(--on-celebrate)',
              }}
              title="Tempos curtos para a apresentação: 20 s, 5 s e 10 s"
            >
              Demo
            </span>
          )}
        </span>
      </div>

      <div className="relative z-10 px-7 pt-4">
        <p
          className="font-display text-[22px] leading-none"
          style={{ color: 'var(--clock)', textShadow: 'var(--clock-shadow)' }}
        >
          {PHASE_LABEL[snapshot.phase]}
          <span style={{ color: 'var(--celebrate)' }}>.</span>
        </p>
        <h1
          className="font-display tabular mt-2 text-[76px] leading-none"
          style={{ color: 'var(--clock)', textShadow: 'var(--clock-shadow)' }}
          aria-label={`Faltam ${formatClock(snapshot.remainingMs)}`}
        >
          <DigitSwap
            value={formatClock(snapshot.remainingMs)}
            direction="down"
          />
        </h1>
        <p
          className="mt-2 text-sm font-semibold"
          style={{ color: 'var(--clock)', textShadow: 'var(--clock-shadow)' }}
        >
          {snapshot.phase === 'focus'
            ? `Rodada ${round} de 4`
            : 'Respire, alongue, beba água'}
          {snapshot.phase === 'focus' &&
            (activeTask ? ` · ${activeTask.title}` : ' · sem tarefa')}
        </p>
      </div>

      <Dino
        mood={mood}
        label={MOOD_LABEL[mood]}
        className="absolute right-5 bottom-0 z-10 size-[124px]"
      />
    </header>
  );
}
