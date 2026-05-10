import { app, dialog, MessageBoxOptions } from 'electron';
import { autoUpdater, type UpdateInfo } from 'electron-updater';
import App from '../app';

export default class UpdateEvents {
  static initAutoUpdateService() {
    if (App.isDevelopmentMode()) {
      console.log('Auto update skipped in development mode.');
      return;
    }

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowPrerelease = false;

    const checkForUpdates = () => {
      console.log('Initializing GitHub release auto update service...');
      UpdateEvents.checkForUpdates();
    };

    if (app.isReady()) {
      checkForUpdates();
    } else {
      app
        .whenReady()
        .then(checkForUpdates)
        .catch((error) => {
          console.error('Failed to initialize auto update service:', error);
        });
    }
  }

  static checkForUpdates() {
    if (App.isDevelopmentMode()) {
      return;
    }

    autoUpdater.checkForUpdates().catch((error) => {
      console.error('Failed to check for updates:', error);
    });
  }
}

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info: UpdateInfo) => {
  console.log(`Update available: ${info.version}`);
});

autoUpdater.on('update-not-available', (info: UpdateInfo) => {
  console.log(`Application is up to date: ${info.version}`);
});

autoUpdater.on('download-progress', (progress) => {
  console.log(
    `Update download progress: ${progress.percent.toFixed(1)}% ` +
      `(${progress.transferred}/${progress.total})`,
  );
});

autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
  const dialogOpts: MessageBoxOptions = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: `RapidCMI5 ${info.version} has been downloaded.`,
    detail: 'Restart the application to apply the update.',
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (error) => {
  console.error('There was a problem updating the application:', error);
});
