# FileZilla Sitemanager CLI

Simply copy passwords and usernames from the FileZilla Servermanager to your clipboard (OS X).

Tested with FileZilla 3.

![fancy gif](https://cloud.githubusercontent.com/assets/4227520/13131059/4f983cb2-d5e9-11e5-8e60-1332dcf6df1d.gif)

## Install

```
$ npm install filezilla-sitemanager-cli -g
```

## 🔥 Warning 🔥

This tool makes it very easy to access your FTP passwords. However, FileZilla stores passwords unencrypted. If you leave your PC unattended, hax0rz have access to those passwords anyway.

## Usage

```
Usage: fsc <name> [options]

Options:
  -p, --pass     Copy password                         [boolean] [default: true]
  -u, --user     Copy username                                         [boolean]
  -e, --echo     Print result                                          [boolean]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
```

`name` is case insensitive and searches for site names *containing* `name`.
