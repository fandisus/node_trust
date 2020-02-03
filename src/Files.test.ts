import { default as Files } from './Files';
describe("Files functions", ()=> {
  test("Src folder should have Files.test.ts", () => {
    let files:string[] = Files.getFileList('./src');
    expect(files).toContain('Files.test.ts');
  });
  test("Src should be detected as folder", ()=>{
    expect(Files.isDirectory('./src')).toStrictEqual(true);
  });
  test("src/Files.test.ts should be a file", ()=>{
    expect(Files.isFile('./src/Files.test.ts')).toStrictEqual(true);
  });
  test("File package.json should be considered as exists", ()=>{
    expect(Files.fileExists('./package.json')).toStrictEqual(true);
  });
  test("File not.found should not exists", ()=>{
    expect(Files.fileExists('./not.found')).toStrictEqual(false);
  });
  test("Basename of this file should be Files.test.ts", ()=>{
    expect(Files.basename(__filename)).toStrictEqual("Files.test.ts");
  });
  test("Dirname of this file should be D:\\nodeproject\\node_trust\\src", () => {
    expect(Files.dirname(__filename)).toStrictEqual("D:\\nodeproject\\node_trust\\src");
  });
  test("unusedFilename of this file should be Files.test (1).ts",()=>{
    expect(Files.unusedFilename(__filename)).toStrictEqual('D:\\nodeproject\\node_trust\\src/Files.test (1).ts');
  });
});