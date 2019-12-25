import crypto from 'crypto'; //ini crypto dari nodejs. Dibungkus lagi di sini biar mudah pake.
class Crypter {
  public algorithm: string;
  public key: string;
	constructor() {
		this.algorithm = 'aes192';
		this.key = ''; //password
	};
	setAlgorithm(algo:string) {this.algorithm = algo;}
	setKey(key:string) {this.key = key;}

	//http://lollyrock.com/articles/nodejs-encryption/
	//Crypto can be used for in many ways. For this kind of rawtext, piping streams, but let's leave that for later.
	encrypt(text:string){
		if (this.key === '') throw new Error('Encryption key must be set');
    var cipher = crypto.createCipher(this.algorithm,this.key);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
	};
	decrypt(text:string){
		if (this.key === '') throw new Error('Encryption key must be set');
    var decipher = crypto.createDecipher(this.algorithm,this.key);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
	};
	sha256(text:string) {
		return crypto.createHash('sha256').update(text).digest('hex');
	}
};
export default new Crypter();
