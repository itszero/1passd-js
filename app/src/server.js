import http from 'http';
import WebSocket from 'ws';
import UUID from 'uuid';

const WS_PORTS = [6263, 10196, 14826, 24866, 25012, 38156, 46365, 49806, 55735, 59488];
const nextUUID = () => UUID.v4().replace(/-/g, '').toUpperCase();

class Server {
  constructor() {
    this._portIndex = 0;
  }

  start() {
    this._startListen();
  }

  setUI(ui) {
    this._ui = ui;
  }

  requestActiveURL(uuid) {
    this.send(uuid, {
      action: 'getActiveURL',
      payload: {
        context: {
          mode: 2,
          uuid: nextUUID()
        }
      },
      version: '01'
    });
  }

  requestCollectDocuments(uuid, itemUUID) {
    this.send(uuid, {
      action: 'collectDocuments',
      payload: {
        context: {
          itemUUID,
          profileUUID: nextUUID(),
          uuid: nextUUID()
        }
      },
      version: '01'
    });
  }

  executeFillScript(uuid, payload) {
    this.send(uuid, {
      action: 'executeFillScript',
      payload: payload,
      version: '01'
    });
  }

  _startListen() {
    const port = WS_PORTS[this._portIndex];
    console.log('==> Trying to bind on port', port);
    this._server = new WebSocket.Server({ port });
    this._server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        this._portIndex = (this._portIndex + 1) % WS_PORTS.length;
        this._startListen();
      } else {
        throw e;
      }
    });
    this._connections = {};

    this._server.on('connection', (conn) => {
      const uuid = UUID.v4();
      this._connections[uuid] = conn;
      conn.uuid = uuid;
      conn.on('message', (data) => {
        this._dispatch(conn, JSON.parse(data));
      });
      conn.on('error', () => this._connections[uuid] = undefined);
      conn.on('close', () => this._connections[uuid] = undefined);
    });
  }

  _dispatch(conn, data) {
    console.log('<WS', JSON.stringify(data));
    switch(data.action) {
      case 'hello':
        return this._handleHello(conn);
      case 'showPopup':
        return this._handleShowPopup(conn);
      case 'activeURL':
        return this._handleActiveURL(conn, data);
      case 'collectDocumentResults':
        return this._handleCollectDocumentResults(conn, data);
    }
  }

  send(uuid, data) {
    console.log(`WS> ${JSON.stringify(data)}`);
    const conn = this._connections[uuid];
    conn && conn.send(JSON.stringify(data));
  }

  _handleHello(conn) {
    this.send(conn.uuid, {
      action: 'welcome',
      payload: {
        'capabilities': []
      },
      version: '01'
    });
  }

  _handleShowPopup(conn) {
    this._ui.showPopup(conn.uuid);
  }

  _handleActiveURL(conn, data) {
    const { url, pageDetails } = data.payload;
    this._ui.setActiveURL(conn.uuid, url, pageDetails);
  }

  _handleCollectDocumentResults(conn, data) {
    this._ui.handleCollectDocumentResults(conn.uuid, data);
  }
}

export default Server;