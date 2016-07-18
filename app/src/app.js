import { ipcRenderer } from 'electron';
import IpcClient from 'electron-ipc-tunnel/client';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import KeychainItemSelector from './components/KeychainItemSelector';
import Unlock from './components/Unlock';

const styles = {
  root: {
    width: '100%',
    height: '100%'
  },
  unlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }
};

const ipc = new IpcClient();

class Root extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { keychainUnlocked: props.isUnlocked };
  }

  componentDidMount() {
    ipc.send('request-active-url');
    ipcRenderer.on('set-active-url', this._handleSetActiveURL);
    document.body.addEventListener('keydown', this._handleKeyDown);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('set-active-url', this._handleSetActiveURL);
    document.body.removeEventListener('keydown', this._handleKeyDown);
  }

  render() {
    return (
      <div style={styles.root}>
        <KeychainItemSelector activeURL={this.state.activeURL}/>
        <ReactCSSTransitionGroup
          transitionName="unlock"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}
        >
          { 
            !this.state.keychainUnlocked &&
            <Unlock
              style={styles.unlock}
              onSubmit={this._handleUnlock}
              key='unlock'
              ref={(node) => this._unlock = node}
            />
          }
        </ReactCSSTransitionGroup>
      </div>
    );
  }

  _handleUnlock = (password) => {
    ipc.send('keychain-unlock', password).then((unlockSuccess) => {
      this.setState({ keychainUnlocked: unlockSuccess });
      if (!unlockSuccess) {
        this._unlock.warnUnlockFailed();
      }
    });
  }

  _handleSetActiveURL = (_, { activeURL }) => {
    this.setState({ activeURL });
    ipc.send('ready-to-show');
  }
  
  _handleKeyDown = (e) => {
    // Esc
    if (e.keyCode === 27) {
      ipc.send('hide');
    }
  }
}

const render = () => ipc.send('keychain-is-unlocked').then((isUnlocked) => {
  ReactDOM.render(
    <Root isUnlocked={isUnlocked}/>,
    document.getElementById('react-root')
  );
});

window.onload = () => render();
ipcRenderer.on('reset', () => {
  ReactDOM.unmountComponentAtNode(document.getElementById('react-root'));
  render();
});