import fs from 'fs-jetpack';
import Keys from './keys';

class Keychain {
  constructor(path, options) {
    this.path = path;
    this.keys = Keys.fromFile(`${this.path}/data/default/encryptionKeys.js`);
    this._options = {
      relockTimeout: 60 * 5,
      ...options
    };
  }

  lock() {
    return this.keys.lock();
  }

  unlock(keyLevel, password) {
    return this.keys.unlock(keyLevel, password);
  }

  isUnlocked(keyLevel) {
    return this.keys.isUnlocked(keyLevel);
  }

  list() {
    return fs.readAsync(`${this.path}/data/default/contents.js`, 'json')
      .then((data) => data.map(([uuid, itemType, name, url, timestamp, folder, strength, trashed]) => ({
        uuid,
        itemType,
        name,
        url,
        timestamp,
        folder,
        strength,
        trashed: trashed === 'Y'
      })));
  }

  readItem(uuid) {
    return fs.readAsync(`${this.path}/data/default/${uuid}.1password`, 'json')
      .then((item) => ({
        ...item,
        decrypt: () => JSON.parse(this.keys.decrypt(item.securityLevel, item.encrypted))
      }));
  }
}

const SL3 = 'SL3';
const SL5 = 'SL5';

export {
  SL3,
  SL5
};
export default Keychain;