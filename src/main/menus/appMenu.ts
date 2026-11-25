import { app, Menu, shell, type MenuItemConstructorOptions } from 'electron';
import type { Timer } from '../timer/Timer';
import type { TaskRepository } from '../repositories/TaskRepository';
import { menuStateKey, timerItems } from './timerItems';

const isMac = process.platform === 'darwin';

/**
 * The menu bar, in Portuguese. Items with a `role` get their behaviour from
 * the system (copy, hide, quit…); we only give them our labels.
 */
function buildTemplate(
  timer: Timer,
  tasks: TaskRepository,
  showWindow: () => void,
): MenuItemConstructorOptions[] {
  const name = app.name;

  const appMenu: MenuItemConstructorOptions = {
    label: name,
    submenu: [
      { role: 'about', label: `Sobre o ${name}` },
      { type: 'separator' },
      { label: 'Mostrar janela', click: showWindow },
      { type: 'separator' },
      { role: 'services', label: 'Serviços' },
      { type: 'separator' },
      { role: 'hide', label: `Ocultar ${name}` },
      { role: 'hideOthers', label: 'Ocultar outros' },
      { role: 'unhide', label: 'Mostrar todos' },
      { type: 'separator' },
      { role: 'quit', label: `Sair do ${name}` },
    ],
  };

  const fileMenu: MenuItemConstructorOptions = {
    label: 'Arquivo',
    submenu: [
      { label: 'Mostrar janela', click: showWindow },
      { type: 'separator' },
      { role: 'quit', label: 'Sair' },
    ],
  };

  return [
    isMac ? appMenu : fileMenu,
    {
      label: 'Timer',
      submenu: timerItems(timer, tasks, { accelerators: true }),
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar tudo' },
      ],
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'toggleDevTools', label: 'Ferramentas do desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Tamanho original' },
        { role: 'zoomIn', label: 'Aumentar' },
        { role: 'zoomOut', label: 'Diminuir' },
      ],
    },
    {
      label: 'Janela',
      role: 'window',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Fechar' },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const, label: 'Trazer tudo para a frente' },
            ]
          : []),
      ],
    },
    {
      label: 'Ajuda',
      role: 'help',
      submenu: [
        ...(!isMac
          ? [
              { role: 'about' as const, label: `Sobre o ${name}` },
              { type: 'separator' as const },
            ]
          : []),
        {
          label: 'Como funciona a técnica Pomodoro',
          click: () =>
            shell.openExternal(
              'https://pt.wikipedia.org/wiki/T%C3%A9cnica_pomodoro',
            ),
        },
        {
          label: 'Documentação do Electron',
          click: () =>
            shell.openExternal('https://www.electronjs.org/pt/docs/latest'),
        },
      ],
    },
  ];
}

/**
 * Installs the menu bar and rebuilds it when the timer's state or the task
 * list changes (Observer), so labels like "Iniciar"/"Pausar" and the
 * checked phase always match the app.
 */
export function installAppMenu(
  timer: Timer,
  tasks: TaskRepository,
  showWindow: () => void,
) {
  let lastKey = '';
  const rebuild = () => {
    lastKey = menuStateKey(timer);
    Menu.setApplicationMenu(
      Menu.buildFromTemplate(buildTemplate(timer, tasks, showWindow)),
    );
  };

  timer.on('tick', () => {
    if (menuStateKey(timer) !== lastKey) rebuild();
  });
  tasks.on('change', rebuild);
  rebuild();
}
