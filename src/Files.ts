import fse from 'fs-extra';
import pathlib from 'path';
class Files {
  //options: filesOnly, recursive, 
  public static getFileList(directory:string, options:any={}):string[] {
    try {
      var result:string[] = [];
      var files:string[] = fse.readdirSync(directory);
      for (var f of files) {
        var path = `${directory}/${f}`;
        if (this.isDirectory(`${path}`)) {
          var innerList:string[] = this.getFileList(path, options);
          innerList = innerList.map((s)=>{return `${f}/${s}`;});
          result = result.concat(innerList);
        } else {
          result.push(f);
        }
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
  public static isDirectory(path:string):boolean { return fse.lstatSync(path).isDirectory(); }
  public static isFile(path:string):boolean { return fse.lstatSync(path).isFile(); }
  public static fileExists(path:string):boolean { return fse.existsSync(path); }
  public static basename(path:string):string { return pathlib.basename(path); }
  public static dirname(path:string):string { return pathlib.dirname(path); }
  public static unusedFilename(path:string):string {
    if (!fse.existsSync(path)) return path;
    let extname = pathlib.extname(path);
    let basename = pathlib.basename(path, extname);
    let dirname = pathlib.dirname(path);
    let i:number = 1;
    while (true) {
      let result = `${dirname}/${basename} (${i})${extname}`;
      if (!fse.existsSync(result)) return result;
      i++;
    }
  }
}
export default Files;