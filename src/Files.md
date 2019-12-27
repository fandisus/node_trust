# Files
Wrapper for `fse` and `path`. Might get more complex later

### Dependencies
fs-extra, path (nodejs default library)

### Documentation
The codes and result below should be self explanatory. Except two things:
1. `fileExists` treats files and directories the same.
2. `getFileList` gets all files recursively. Be careful when doing this especially to node_modules folder.

```javascript
const Files = require('@icfm/trust').Files;

console.log('__dirname: ', __dirname);
console.log('isDirectory: ', Files.isDirectory(__dirname));
console.log('isFile: ', Files.isFile(__dirname));
console.log('fileExists: ', Files.fileExists(__dirname));
console.log('basename: ', Files.basename(__dirname));
console.log('dirname: ', Files.dirname(__dirname));
console.log('unusedFilename: ', Files.unusedFilename(__dirname));
console.log('getFileList: ', Files.getFileList(__dirname));
```
Result:
```
__dirname:  D:\nodeproject\anu
isDirectory:  true
isFile:  false
fileExists:  true
basename:  anu
dirname:  D:\nodeproject
unusedFilename:  D:\nodeproject/anu (1)
getFileList:  [
  '.env',
  'node_modules/@icfm/trust',
  'node_modules/dotenv/CHANGELOG.md',
  'node_modules/dotenv/config.js',
  'node_modules/dotenv/lib/cli-options.js',
  'node_modules/dotenv/lib/env-options.js',
  'node_modules/dotenv/lib/main.js',
  'node_modules/dotenv/LICENSE',
  'node_modules/dotenv/package.json',
  'node_modules/dotenv/README.md',
  'node_modules/dotenv/types/index.d.ts',
  'node_modules/dotenv/types/test.ts',
  'node_modules/dotenv/types/tsconfig.json',
  'node_modules/dotenv/types/tslint.json',
  'package-lock.json',
  'package.json',
  'test.js'
]
```