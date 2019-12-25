# Crypter
**USE THIS MODULE AT YOUR OWN RISK**. This class wraps NodeJS `crypto` module, so the syntax become more concise. Usage of the `encrypt` method in this module shows `DeprecationWarning: crypto.createCipher is deprecated` in console.
##### Dependency
- crypto (included in NodeJS)

##### How to import
	import {Crypter} from '@icfm/trust';
or

	const Crypter = require('@icfm/trust').Crypter;
##Setting encryption algorithm
	Crypter.setAlgorithm('aes-256-ctr');

The algorithms available are the same with nodejs `crypto` module. But I couldn't find the complete list. Default algorithm set is `aes192`. Other available is `aes-256-ctr`. I couldn't find list of algorithm available. And some different algorithm need different way to implement.

##Encrypting

```javascript
Crypter.setKey('Some Secret Key');
let enc = Crypter.encrypt('Something');
console.log(enc);
```
Result:

	2e2daa10f803816a1e6a948285566cb2

Failure to set an encryption key will throw error: `Encryption key must be set`.

##Decrypting
```javascript
Crypter.setKey('Some Secret Key');
let enc = Crypter.encrypt('Something');
let dec = Crypter.decrypt(enc);
console.log(dec);
```
Result:

	Something

##Create SHA256 hash
	const Crypter = require('@icfm/trust').Crypter;
	let hash = Crypter.sha256('Some secret');
	console.log(hash);
Result:

	9885eb731e98c5ff8dc322ead74f4249d22ddb96e3b8349097f347e2897d59bf