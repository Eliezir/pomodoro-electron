import { useEffect, useRef, useState } from 'react';
import type { IpcLogEntry } from '../../shared/types';
import { useDarkMode } from '../hooks/usePomodoro';
import { cn } from '@/lib/utils';

const MAX_ENTRIES = 500;

const KIND_LABEL: Record<IpcLogEntry['kind'], string> = {
  invoke: 'pedido',
  reply: 'resposta',
  event: 'evento',
  error: 'erro',
};

function time(at: number) {
  const d = new Date(at);
  return `${d.toLocaleTimeString('pt-BR', { hour12: false })}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

/**
 * The "Monitor de IPC" window: every message between the renderer and the
 * main process, live. → is renderer to main, ← is main to renderer.
 */
export function IpcMonitor() {
  useDarkMode();
  const [entries, setEntries] = useState<IpcLogEntry[]>([]);
  const [hideTicks, setHideTicks] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    document.title = 'Monitor de IPC';
    return window.pomodoro.ipcMonitor.onEntry((entry) =>
      setEntries((current) => [...current.slice(-(MAX_ENTRIES - 1)), entry]),
    );
  }, []);

  const visible = hideTicks
    ? entries.filter((e) => e.channel !== 'timer:tick')
    : entries;

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [visible.length]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h1 className="font-display text-xl leading-none whitespace-nowrap">
          Monitor de IPC<span style={{ color: 'var(--celebrate)' }}>.</span>
        </h1>
        <span
          className="tabular rounded-full bg-[var(--raised)] px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-muted-foreground"
          title="Mensagens na lista"
        >
          {visible.length}
        </span>
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-muted-foreground">
          <input
            type="checkbox"
            checked={hideTicks}
            onChange={(e) => setHideTicks(e.target.checked)}
            className="accent-[var(--primary)]"
          />
          Ocultar ticks
        </label>
        <button
          type="button"
          onClick={() => setEntries([])}
          className="rounded-full bg-[var(--raised)] px-3 py-1 text-xs font-semibold whitespace-nowrap hover:bg-[var(--card)]"
        >
          Limpar
        </button>
      </header>

      <div className="flex gap-4 px-4 py-1.5 text-[11px] text-muted-foreground">
        <span>
          <b className="text-[var(--primary)]">→</b> tela para o main
        </span>
        <span>
          <b style={{ color: 'var(--celebrate)' }}>←</b> main para a tela
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          Use o app: cada clique e cada segundo do timer aparecem aqui.
        </p>
      ) : (
        <ol
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 font-mono text-[12px]"
        >
          {visible.map((e) => {
            const toMain = e.direction === 'to-main';
            return (
              <li
                key={e.id}
                className={cn(
                  'grid grid-cols-[86px_14px_1fr] items-baseline gap-2 rounded-md px-2 py-1',
                  e.kind === 'error' &&
                    'bg-[color-mix(in_srgb,var(--danger)_14%,transparent)]',
                )}
              >
                <time className="tabular text-[11px] text-muted-foreground">
                  {time(e.at)}
                </time>
                <b
                  aria-label={
                    toMain ? 'da tela para o main' : 'do main para a tela'
                  }
                  style={{
                    color: toMain ? 'var(--primary)' : 'var(--celebrate)',
                  }}
                >
                  {toMain ? '→' : '←'}
                </b>
                <span className="min-w-0">
                  <span className="block truncate">
                    <span className="font-semibold">{e.channel}</span>
                    <span className="text-muted-foreground">
                      {' '}
                      · {KIND_LABEL[e.kind]}
                    </span>
                    {e.summary !== '—' && (
                      <span className="text-[var(--text-2)]"> {e.summary}</span>
                    )}
                  </span>
                  <span
                    className="mt-0.5 inline-block rounded bg-[var(--raised)] px-1.5 text-[11px] text-muted-foreground"
                    title="API do Electron que levou a mensagem"
                  >
                    {e.api}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
