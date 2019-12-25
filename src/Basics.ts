import * as _ from 'lodash';
export class Basics {
  public static getDiff(old: any, newobj: any): object {
    var res: any = _.reduce(old, (result: {[key:string]: object}, value:any, key:string) => {
      if (typeof value === 'function') return result;
      if (_.isEqual(value, newobj[key])) return result;
      //If not equal then continue
      if (value === null) {
        result[key] = { old: value, new: newobj[key] };
        return result;
      }
      if (Array.isArray(value)) {
        var removed = _.difference(value, newobj[key]);
        var added = _.difference(newobj[key], value);
        result[key] = { removed: removed, added: added };
        return result;
      }
      if (typeof value === 'object') {
        result[key] =Basics.getDiff(value, newobj[key]);
        return result;
      }
      result[key] = { old: value, new: newobj[key] };
      return result;
    }, {});
    return res;
  }
}