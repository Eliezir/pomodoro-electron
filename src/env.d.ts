/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
declare module '*.css';
declare module '*.png?inline' {
  const dataUrl: string;
  export default dataUrl;
}
