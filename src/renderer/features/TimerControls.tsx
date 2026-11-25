import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import type { PhaseName, TimerSnapshot } from '../../shared/types';
import { Button } from '@/components/motion/button/base';
import { Tabs, TabsList, TabsTrigger } from '@/components/motion/tabs';
import { PHASE_LABEL } from '@/lib/format';

const PHASES: PhaseName[] = ['focus', 'shortBreak', 'longBreak'];

export function TimerControls({ snapshot }: { snapshot: TimerSnapshot }) {
  const { timer } = window.pomodoro;
  const running = snapshot.status === 'running';
  const primaryLabel = running
    ? 'Pausar'
    : snapshot.status === 'paused'
      ? 'Continuar'
      : 'Iniciar';
  const doneInRound = snapshot.completedFocus % 4;

  return (
    <section className="paper px-5 pt-4 pb-5" aria-label="Controles do timer">
      <Tabs
        value={snapshot.phase}
        onValueChange={(value) => timer.selectPhase(value as PhaseName)}
        variant="segment"
        icons="selected"
      >
        <TabsList className="w-full justify-between" aria-label="Fase">
          {PHASES.map((phase) => (
            <TabsTrigger
              key={phase}
              value={phase}
              disabled={running && phase !== snapshot.phase}
              className="flex-1"
            >
              {PHASE_LABEL[phase]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 flex items-center gap-2">
        <Button
          size="lg"
          onClick={() => (running ? timer.pause() : timer.start())}
          className="min-w-[140px] font-semibold"
        >
          {running ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
          {primaryLabel}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => timer.skip()}
          className="font-semibold"
        >
          <SkipForward className="size-4" aria-hidden />
          Pular
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={() => timer.reset()}
          className="font-semibold"
          aria-label="Reiniciar ciclo"
        >
          <RotateCcw className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[13px] text-muted-foreground">
        <span>Rodada</span>
        <span
          className="flex gap-1.5"
          role="img"
          aria-label={`${doneInRound} de 4 focos nesta rodada`}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="rough size-2.5 rounded-full"
              style={{
                background:
                  i < doneInRound
                    ? 'var(--study)'
                    : 'color-mix(in srgb, var(--foreground) 14%, transparent)',
              }}
            />
          ))}
        </span>
        <span className="ml-auto">a cada 4 focos, uma pausa longa</span>
      </div>
    </section>
  );
}
