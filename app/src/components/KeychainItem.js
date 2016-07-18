import React from 'react';

const styles = {
  root: {
    padding: '5px',
    display: 'block',
    cursor: 'pointer'
  },
  domain: {
    color: '#AAA'
  }
};

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}

const KeychainItem = ({ item, onClick }) => (
  <a className='keychain-item' style={styles.root} onClick={onClick}>
    {item.name}{' '}<small style={styles.domain}>{extractDomain(item.url)}</small>
  </a>
);

export default KeychainItem;