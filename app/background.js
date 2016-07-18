import 'babel-polyfill';

import { app, Menu } from 'electron';
import { devMenuTemplate } from './helpers/dev_menu_template';
import createWindow from './helpers/window';
import fs from 'fs-jetpack';

import Server from './src/server';
import UI from './src/ui';

const env = fs
  .read(`${app.getAppPath()}/package.json`, 'json')
  .name
  .indexOf('-dev') > -1 ? 'devel' : 'prod';

function setApplicationMenu() {
  if (env !== 'prod') {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      devMenuTemplate,
      {
        label: "Edit",
        submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]
      }
    ]));
  }
}

const ui = new UI();
const server = new Server();
server.setUI(ui);
ui.setServer(server);

app.on('ready', function () {
  setApplicationMenu();

  ui.start();
  server.start();
});

process.on('uncaughtException', (error) => console.log(error));