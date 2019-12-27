import * as _ from 'lodash';

abstract class Model {
  public abstract tableName(): string;
  public abstract PK(): string[];
  public abstract hasSerial(): boolean;

  public _old: any;
  //protected static jsonColumns: Array<string>;
  public static multiInsertBatchCount: number = 10000;

  public cloneFrom(obj: any) {
    let props = Object.keys(obj);
    for (var p of props) {
      if (this[p] === undefined) continue;
      if (obj[p]) this[p] = obj[p];
    }
  }

  public fillOldVals() { this._old = _.cloneDeep(this); }
}
export { Model }