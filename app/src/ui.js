import { app, BrowserWindow } from 'electron';
import Keychain, { SL5 } from '../lib/keychain';
import registerIpc from "electron-ipc-tunnel/server";
import URL from 'url';

import filler from './filler';

function extractDomain(url) {
  try {
    return URL.parse(url).hostname;
  } catch (e) {
    return '';
  }
}

class UI {
  constructor() {
    registerIpc('keychain-is-unlocked', (_, password) => this._keychain.isUnlocked(SL5));
    registerIpc('keychain-unlock', (_, password) => this._keychain.unlock(SL5, password));
    registerIpc('keychain-list', () => this._keychain.list());
    registerIpc('ready-to-show', () => this._window.show());
    registerIpc('hide', () => this._window.hide());
    registerIpc('request-active-url', () => this._server.requestActiveURL(this._connId));
    registerIpc('item-selected', (_, item) => this._handleItemSelected(item));
  }

  start() {
    this._keychain = new Keychain(
      process.env['ONEPASSD_KEYCHAIN'] ||
      `${process.env.HOME}/Dropbox/1Password.agilekeychain`
    );
  }

  setServer(server) {
    this._server = server;
  }

  showPopup(connId) {
    this._connId = connId;

    if (!this._window) {
      this._window = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false,
        show: false,
        transparent: true,
        skipTaskbar: true,
        alwaysOnTop: true,
        type: 'splash'
      });
      this._window.on('closed', () => this._window = null);
      this._window.loadURL(`file://${__dirname}/app.html`);
    } else {
      this._window.webContents.send('reset');
    }
  }

  setActiveURL(connId, activeURL, pageDetails) {
    if (this._connId !== connId) return;
    this._window.webContents.send('set-active-url', { activeURL });
  }

  handleCollectDocumentResults(connId, results) {
    if (this._connId !== connId) return;
    const { itemUUID } = results.payload.context;

    this._keychain.readItem(itemUUID).then((item) => {
      const decryptedItem = {
        ...item,
        encrypted: undefined,
        decrypt: undefined,
        decrypted: item.decrypt()
      };
      const fillScript = filler(decryptedItem, results.payload);

      this._server.executeFillScript(this._connId, {
        ...fillScript,
        nakedDomains: [extractDomain(results.payload.url)],
        options: { animated: true},
        savedUrl: item.location,
        url: item.location,
        documentUUID: results.payload.documentUUID,
        properties: {},
        fillContextIdentifier: JSON.stringify(results.payload.context),
        metadata: {
          action: 'fillLogin',
          strategy: 'BestPassword',
          score: 1.0,
          version: 19
        }
      });
    });
  }

  _handleItemSelected(item) {
    this._window.hide();
    this._server.requestCollectDocuments(this._connId, item.uuid);
  }
}

export default UI;
