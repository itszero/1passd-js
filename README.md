# 1passd

1Password daemon for Linux users.

![](https://raw.githubusercontent.com/itszero/1passd-js/master/1passd.gif)

This is a [1Password](https://1password.com/)-compatible daemon implemented in electron. Allowing Linux users to use unmodified 1Password browser extensions to fill login pages. You can also use this in other operating systems, but you are better off with the official app.

## Run

This program looks for your 1Password keychain at $HOME/Dropbox/1Password.agilekeychain, or you can specify  it in the environment varaible: `ONEPASSD_KEYCHAIN`. Then execute:

``
npm start
``

## Status

It is a fully functional prototype with a lot to be improved. These features are implemented:

- Unlocking keychain
- Search / Select an item by mouse
- 1Password WebSocket protocol
- A naive password filler

It does not do the following yet:

- Auto-relocking keychain
- not packaged as an app yet
- keyboard navigations
- item details viewing
- tray icon
- daemonlize

Item saving/editing will probably never make it on to my list. You should use Linux-native password managers if you're going to find one for day-to-day use.

## Disclaimer

This project is not affiliated nor endorsed by [AgileBits, Inc.](http://agilebits.com)

## Credits

- [electron-boilerplate](https://github.com/szwacz/electron-boilerplate)
- [1Password keychain design](https://support.1password.com/agile-keychain-design/)

## License

The MIT License (MIT)

Copyright (c) 2016 Zero Cho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
