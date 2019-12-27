import { Model } from "./Model";
import PostgreDB from "./PostgreDB";
import { Basics } from './Basics';
import * as _ from "lodash";

class DataCommunicator<T extends Model> {
  protected tableName: string; //Ndak perlu underscore, karena ini DataCommunicator
  protected PK: string[];
  protected hasSerial: boolean;
  public dbProps:string[];
  public static pg: PostgreDB = new PostgreDB;
  protected classOfModel: { new(): T };

  public static multiInsertBatchCount: number = 10000;
  public constructor(c: { new(): T }) {
    this.classOfModel = c;
    var obj:T = new this.classOfModel();
    this.tableName = obj.tableName();
    this.PK = obj.PK();
    this.hasSerial = obj.hasSerial();

    let allProps = Object.keys(obj);
    this.dbProps = allProps.filter(p=>{ if (!p.startsWith('_')) return p; });
  }

  public async checkPKForInsert(model: T): Promise<void> {
    if (this.PK.length === 0) return;
    var sql: string = `SELECT * FROM ${this.tableName}`;
    this.resetFieldIndex();
    var conds: string[] = this.PK.map(pk => { return `${pk}=${this.nextFieldParam()}`; });
    sql += ` WHERE ${conds.join(' AND ')}`;
    var PKVals: any[] = this.PK.map(pk => { return model[pk]; });
    var ada: boolean = await DataCommunicator.pg.rowExists(sql, PKVals);
    if (!ada) return;
    throw new Error(`Duplicate PK for table ${this.tableName}`); //Testing pake jurus throw. Kalo ndak biso, dikonversi jadi resolve reject.
  }

  public async insert(model: T): Promise<void> {
    await this.checkPKForInsert(model);
    if (this.hasSerial && model[this.PK[0]] !== 0) {
      throw new Error(this.classOfModel.name + ' data seems not new');
    }
    let props = Array.from(this.dbProps);
    var columnsList = props.join(',');

    this.resetFieldIndex();
    if (this.hasSerial) props.splice(props.indexOf(this.PK[0]),1); //Remove serial column
    var paramsHolder: string = props.map(p => { return this.nextFieldParam(); }).join(','); //$1, $2, $3 so on
    if (this.hasSerial) paramsHolder = 'DEFAULT,' + paramsHolder;

    var sql: string = `INSERT INTO ${this.tableName} (${columnsList}) VALUES (${paramsHolder})`;
    if (this.hasSerial) sql += ` RETURNING ${this.PK[0]}`;
    var params: any[] = props.map(p => { return model[p]; }); //SERIAL prop has been removed above.

    if (this.hasSerial)
      model[this.PK[0]] = await DataCommunicator.pg.insert(sql, params);
    else
      await DataCommunicator.pg.exec(sql, params);
  }

  public async checkPKForUpdate(model: T): Promise<void> {
    if (this.PK.length === 0) throw new Error('Can not update data without PK');
    var sql: string = `SELECT * FROM ${this.tableName}`;
    this.resetFieldIndex();
    var filters:string[] = [];
    var params: any[] = [];
    for (var pk in this.PK) {
      filters.push(`${pk}<>${this.nextFieldParam()}`);
      filters.push(`${pk}=${this.nextFieldParam()}`);
      params.push(model._old[pk]);
      params.push(model[pk]);
    }
    sql += ` WHERE ${filters.join(' AND ')}`;
    var ada: boolean = await DataCommunicator.pg.rowExists(sql, params);
    if (!ada) return;
    throw new Error(`Duplicate PK for table ${this.tableName}`);
  }

  public hasChanges(model: T): boolean {
    var diff = this.getChanges(model);
    if (Object.keys(diff).length === 0) return false;
    return true;
  }
  public getChanges(model: T): object {
    return Basics.getDiff(model._old, model);
  }
  public async update(model: T, targets: string[] = [], ignores: string[] = []): Promise<void> {
    if (!this.hasSerial) this.checkPKForUpdate(model);
    if (model._old === undefined) throw new Error('DataCommunicator unable to check for old values. Please use find to get data before update');
    var diff: object = Basics.getDiff(model._old, model);
    for (var i in diff) { if (i.startsWith('_')) delete diff[i]; }
    if (Object.keys(diff).length === 0) throw new Error(`${this.tableName} data unchanged`);

    var updates: object = {};
    if (targets.length === 0) {
      for (var i in diff) if (!ignores.includes(i)) updates[i] = model[i];
    } else {
      for (var i in diff) if (!ignores.includes(i) && targets.includes(i)) updates[i] = model[i];
    }

    var sql: string = `UPDATE ${this.tableName} SET `;
    this.resetFieldIndex();
    var cols: string[] = [];
    var params: any[] = [];
    for (var i in updates) {
      cols.push(`${i}=${this.nextFieldParam()}`)
      params.push(updates[i]);
    };

    var pkfilters: string[] = [];
    for (var p of this.PK) {
      pkfilters.push(`${p}=${this.nextFieldParam()}`);
      params.push(model[p]);
    }
    sql += cols.join(', ') + ' WHERE ' + pkfilters.join(' AND ');
    await DataCommunicator.pg.exec(sql, params);
  }
  public async delete(model: T): Promise<void> {
    if (this.PK.length === 0) throw new Error ('Can not delete data without PK');
    var sql: string = `DELETE FROM ${this.tableName} WHERE `;
    var pkFilters: string[] = [];
    var params: any[] = [];
    this.resetFieldIndex();
    for (var p of this.PK) {
      pkFilters.push(`${p}=${this.nextFieldParam()}`);
      params.push(model[p]);
    }
    sql += pkFilters.join(' AND ');
    await DataCommunicator.pg.exec(sql, params);
  }

  public async find(PKs: any[], cols: string = '*'): Promise<T | undefined> {
    var sql: string = `SELECT ${cols} FROM ${this.tableName}`;
    this.resetFieldIndex();
    var conds: string[] = this.PK.map(s => { return `${s}=${this.nextFieldParam()}`; });
    sql += ` WHERE ${conds.join(' AND ')}`;
    var dbres: any = await DataCommunicator.pg.getOneRow(sql, PKs);
    if (dbres === undefined) return undefined;
    var res: T = new this.classOfModel();

    res.cloneFrom(dbres);
    res.fillOldVals();
    return res;
  }
  public async all(cols: string = '*'): Promise<T[]> {
    var dbres: any = await DataCommunicator.pg.get(`SELECT ${cols} FROM ${this.tableName}`);
    var res: T[] = dbres.map(row => {
      var obj: T = new this.classOfModel();
      obj.cloneFrom(row);
      return obj;
    });
    return res;
  }
  public async allPlus(moreQuery:string, cols: string = '*', bindings:any[] = []): Promise<T[]> {
    var dbres: any = await DataCommunicator.pg.get(`SELECT ${cols} FROM ${this.tableName} ${moreQuery}`, bindings);
    var res: T[] = dbres.map(row => {
      var obj: T = new this.classOfModel();
      obj.cloneFrom(row);
      return obj;
    });
    return res;
  }
  public async dbCount(): Promise<number> {
    var dbres: number = +await DataCommunicator.pg.getOneVal(`SELECT COUNT(*) FROM ${this.tableName}`);
    return dbres;
  }
  public async dbCountPlus(strWhere: string, bindings: any[] = []) {
    var dbres: number = +await DataCommunicator.pg.getOneVal(`SELECT COUNT(*) FROM ${this.tableName} ${strWhere}`, bindings);
    return dbres;
  }

  private _fieldIndex: number = 0;
  private resetFieldIndex() { this._fieldIndex = 0; }
  private nextFieldParam(): string {
    this._fieldIndex++;
    return `$${this._fieldIndex}`;
  }
}

export { DataCommunicator };