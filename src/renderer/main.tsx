import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/caprasimo';
import '@fontsource-variable/figtree';
import { App } from './App';
import { IpcMonitor } from './features/IpcMonitor';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* The same page serves the IPC monitor window, opened with #ipc-monitor. */}
    {window.location.hash === '#ipc-monitor' ? <IpcMonitor /> : <App />}
  </StrictMode>,
);
