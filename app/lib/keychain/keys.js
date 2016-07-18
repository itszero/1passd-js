import fs from 'fs-jetpack';
import GibberishAES from '../gibberish-aes';
GibberishAES.size(128);

class Key {
  constructor(data) {
    this.data = data;
    this._decryptedKey = null;
  }

  lock() {
    this._decryptedKey = null;
  }

  unlock(password) {
    const { data, validation, iterations } = this.data;

    const decrypted = GibberishAES.decryptUsingPBKDF2(data, password, iterations);
    if (!decrypted) { return false; }
    const key = GibberishAES.s2a(decrypted);
    const verification = GibberishAES.decryptBase64UsingKey(validation, key);

    if (decrypted === verification) {
      this._decryptedKey = key;
      return true;
    } else {
      return false;
    }
  }

  decrypt(encrypted) {
    if (!this.isUnlocked()) {
      throw new Error('Requested key was locked');
    }

    return GibberishAES.decryptBase64UsingKey(encrypted, this._decryptedKey);
  }

  isUnlocked() {
    return !!this._decryptedKey;
  }
}

class Keys {
  static fromFile(path) {
    const { list } = fs.read(path, 'json');
    const keys = list.reduce((ret, item) => ({
      ...ret,
      [item.level]: new Key(item)
    }), {});

    return new Keys(keys);
  }

  constructor(keys) {
    this.keys = keys;
  }

  get(key) {
    return this.keys[key];
  }

  lock(keyLevel) {
    Object.values(this.keys).forEach((key) => key.lock());
  }

  unlock(keyLevel, password) {
    return this.keys[keyLevel].unlock(password);
  }

  isUnlocked(keyLevel) {
    return this.keys[keyLevel].isUnlocked();
  }

  decrypt(keyLevel, encrypted) {
    return this.keys[keyLevel].decrypt(encrypted);
  }
}

export {
  Key
};
export default Keys;