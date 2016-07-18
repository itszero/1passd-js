import React from 'react';
import IpcClient from "electron-ipc-tunnel/client";
import KeychainItem from './KeychainItem';

const ipc = new IpcClient();

const style = {
  root: {
    background: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px'
  },
  search: {
    backgroundColor: '#000',
    color: '#FFF',
    border: '0',
    borderBottom: '1px solid #FFF',
    boxSizing: 'border-box',
    fontSize: '24px',
    padding: '20px 10px',
    flex: 0,
    width: '100%'
  },
  list: {
    background: '#FFFFFF',
    flex: 1,
    border: '1px solid #000',
    marginTop: '10px',
    width: '100%',
    overflow: 'scroll',
    overflowX: 'hidden',
    color: '#000000',
    boxSizing: 'border-box'
  },
  status: {
    textAlign: 'left',
    width: '100%',
    flex: 0,
    margin: '5px'
  }
};

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
}

class KeychainItemSelector extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      defaultKeyword: props.activeURL && extractDomain(props.activeURL),
      keywords: [],
      list: []
    };
  }

  componentDidMount() {
    ipc.send('keychain-list').then((list) => this.setState({ list }));
    this._search.focus();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      defaultKeyword: nextProps.activeURL && extractDomain(nextProps.activeURL)
    });
  }

  focus() {
    this._search.focus();
  }

  render() {
    return (
      <div style={style.root}>
        <input
          style={style.search}
          placeholder='Search'
          ref={(node) => this._search = node}
          onChange={this._handleChange}
        />
        <div style={style.list}>
          { this._filteredList().map((item) =>
            <KeychainItem
              key={item.uuid}
              item={item}
              onClick={() => this._handleClick(item)}
            />
          ) }
        </div>
        <p style={style.status}>
          {this._filteredList().length} items
          { this.state.keywords.length === 0 && ` (matching ${this.state.defaultKeyword})`}
        </p>
      </div>
    );
  }

  _handleChange = () => {
    this.setState({
      keywords: this._search &&
        this._search.value.trim().length > 0 &&
        this._search.value.trim().split(' ') || []
    });
  }

  _handleClick(item) {
    ipc.send('item-selected', item);
  }

  _filteredList() {
    const keywords = this.state.keywords.length > 0 ?
      this.state.keywords :
      (this.state.defaultKeyword && [this.state.defaultKeyword] || []);
    return this.state.list
      .filter((item) => item.itemType === 'webforms.WebForm')
      .filter((item) => !item.trashed)
      .filter((item) =>
        keywords.length > 0 ?
          keywords.reduce((match, keyword) => match && this._match(item, keyword), true) :
          true
      );
  }

  _match(item, keyword) {
    return (item.name.indexOf(keyword) > -1) || (item.url.indexOf(keyword) > -1);
  }
}

export default KeychainItemSelector;
