//Actual testing shows:
//[DEP0106] DeprecationWarning: crypto.createCipher is deprecated.
//Warning: Use Cipheriv for counter mode of aes-256-ctr
//* Which is not catched by jest.
import { default as Crypter } from './Crypter';
describe("Crypter encrypt and decrypt", ()=> {
  test("Should throw error if key not set", () => {
    Crypter.setKey('');
    expect(()=>Crypter.encrypt('Something')).toThrowError('Encryption key must be set');
  });
  test("It should return a string", () => {
    Crypter.setKey('Some Secret Key');
    let spy = jest.spyOn(global.console, "warn");
    expect(typeof Crypter.encrypt('Something')).toEqual('string');
    expect(spy).not.toHaveBeenCalled();
  });
  test("Decrypt should return original string", ()=>{
    Crypter.setKey('Some Secret Key');
    let spy = jest.spyOn(global.console, "warn");
    expect(Crypter.decrypt(Crypter.encrypt('Something'))).toEqual('Something');
    expect(spy).not.toHaveBeenCalled();
  });
  test('Generate SHA256 hash', ()=>{
    expect(Crypter.sha256('Some Password')).toHaveLength(64);
  })
});