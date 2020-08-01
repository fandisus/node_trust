import * as _ from 'lodash';

abstract class Model {
  public abstract tableName(): string;
  public abstract PK(): string[];
  public abstract hasSerial(): boolean;
  public jsonColumns(): Array<string> { return [] }; // Not needed for PostgreSQL

  public _old: any;
  public static multiInsertBatchCount: number = 10000;

  public jsonParseForMySQL() {
    for (let c of this.jsonColumns()) this[c] = JSON.parse(this[c]);
  }
  public cloneFrom(obj: any) {
    let props = Object.keys(obj);
    for (var p of props) {
      if (!this.hasOwnProperty(p)) continue;
      if (p in obj) this[p] = obj[p]; //p in obj  is equal with  obj.hasOwnProperty(p)
    }
  }

  public fillOldVals() { this._old = _.cloneDeep(this); }
}
export { Model }