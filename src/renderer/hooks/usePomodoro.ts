import { useCallback, useEffect, useState } from 'react';
import type { Task, TimerSnapshot, TodayStats } from '../../shared/types';

const api = () => window.pomodoro;

/** The timer as the main process reports it, updated on every tick. */
export function useTimer() {
  const [snapshot, setSnapshot] = useState<TimerSnapshot | null>(null);

  useEffect(() => {
    let alive = true;
    api()
      .timer.getSnapshot()
      .then((s) => alive && setSnapshot(s));
    const unsubscribe = api().timer.onTick(setSnapshot);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  return snapshot;
}

/** Tasks and today's numbers, reloaded whenever the main process says data changed. */
export function useTasksAndStats() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [today, setToday] = useState<TodayStats>({ pomodoros: 0, focusMs: 0 });

  const reload = useCallback(async () => {
    const [nextTasks, nextToday] = await Promise.all([
      api().tasks.list(),
      api().stats.today(),
    ]);
    setTasks(nextTasks);
    setToday(nextToday);
  }, []);

  useEffect(() => {
    reload();
    return api().onDataChanged(reload);
  }, [reload]);

  return { tasks, today };
}

/** Follows the system light or dark setting, which Electron passes to the page. */
export function useDarkMode() {
  const query = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return dark;
}
