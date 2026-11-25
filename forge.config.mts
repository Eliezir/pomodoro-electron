import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'Pomodoro',
    // Forge picks icon.icns on macOS and icon.ico on Windows.
    icon: 'assets/icon/icon',
    appBundleId: 'br.edu.ifal.seminario.pomodoro',
  },
  rebuildConfig: {},
  makers: [
    // Windows: a Setup.exe installer.
    new MakerSquirrel({
      setupIcon: 'assets/icon/icon.ico',
      setupExe: 'Pomodoro-Setup.exe',
    }),
    // macOS: a disk image to drag into Applications, plus a zip.
    new MakerDMG({
      name: 'Pomodoro',
      icon: 'assets/icon/icon.icns',
      format: 'ULFO',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main/main.ts',
          config: 'vite.main.config.mts',
          target: 'main',
        },
        {
          entry: 'src/preload/preload.ts',
          config: 'vite.preload.config.mts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    // Packaging edits Info.plist after Electron's ad-hoc signature, which leaves the
    // signature invalid. macOS drops notifications from apps with an invalid signature,
    // so the unsigned builds are re-signed ad hoc here (a real Developer ID would replace this).
    postPackage: async (_config, { platform, outputPaths }) => {
      if (platform !== 'darwin' || process.platform !== 'darwin') return;
      for (const dir of outputPaths) {
        const appPath = path.join(dir, 'Pomodoro.app');
        execFileSync(
          'codesign',
          ['--force', '--deep', '--sign', '-', appPath],
          { stdio: 'inherit' },
        );
        execFileSync('codesign', ['--verify', '--deep', '--strict', appPath], {
          stdio: 'inherit',
        });
      }
    },
  },
};

export default config;
