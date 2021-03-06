﻿import { Model } from "./Model";
import { Basics } from './Basics';
import * as _ from "lodash";
import iDBAdapter from "./iDBAdapter";

class DataCommunicator<T extends Model> {
  protected tableName: string; //Ndak perlu underscore, karena ini DataCommunicator
  protected PK: string[];
  protected hasSerial: boolean;
  public dbProps:string[];
  public static db: iDBAdapter;
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
    var ada: boolean = await DataCommunicator.db.rowExists(sql, PKVals);
    if (!ada) return;
    throw new Error(`Duplicate PK for table ${this.tableName}`); //Testing pake jurus throw. Kalo ndak biso, dikonversi jadi resolve reject.
  }

  public async insert(model: T): Promise<void> {
    await this.checkPKForInsert(model);
    if (this.hasSerial && model[this.PK[0]] !== 0) {
      throw new Error(this.classOfModel.name + ' data seems not new');
    }
    //columnsList: cola, colb, colc, etc
    let props = Array.from(this.dbProps);
    var columnsList = props.join(',');

    //paramsHolder: $1, $2, $3 etc. OR ?, ?, ? etc.
    this.resetFieldIndex();
    if (this.hasSerial) props.splice(props.indexOf(this.PK[0]),1); //Remove serial column
    var paramsHolder: string = props.map(p => { return this.nextFieldParam(); }).join(','); //$1, $2, $3 so on
    if (this.hasSerial) paramsHolder = 'DEFAULT,' + paramsHolder;

    //The SQL Query is complete. Next is the bindings for the parameters
    var sql: string = `INSERT INTO ${this.tableName} (${columnsList}) VALUES (${paramsHolder})`;
    if (this.hasSerial && DataCommunicator.db.dbEngine === 'postgresql') sql += ` RETURNING ${this.PK[0]}`;
    
    //THe bindings
    var params: any[] = props.map(p => { //SERIAL prop has been removed above.
      if (model.jsonColumns().indexOf(p) !== -1) return JSON.stringify(model[p]);
      else return model[p];
    });

    if (this.hasSerial)
      model[this.PK[0]] = await DataCommunicator.db.insert(sql, params);
    else
      await DataCommunicator.db.exec(sql, params);
  }
  public async multiInsert(models: T[], batchSize:number=10000): Promise<void> {
    //This method does not check PK collisions, and does no auto id assignments.
    if (models.length === 0) throw new Error('No data to multi insert');
    let props = Array.from(this.dbProps);
    let columnsList = props.join(',');
    let sql:string = (DataCommunicator.db.dbEngine==='mysql') 
    ? `INSERT INTO ${this.tableName} (${columnsList}) VALUES ?`
    : `INSERT INTO ${this.tableName} (${columnsList}) VALUES %L`;
    let idx=0;
    while (idx < models.length) {
      let nextIdx = idx+batchSize;
      let batchRows:any[][] = models.slice(idx, nextIdx).map(m=>{
        let row:any[] = [];
        for(let p of props) {
          if (m.jsonColumns().indexOf(p) !== -1) row.push(JSON.stringify(m[p]));
          else row.push(m[p]);
        }
        return row;
      });
      await DataCommunicator.db.multiInsert(sql, batchRows);
      idx = nextIdx;
    }
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
    var ada: boolean = await DataCommunicator.db.rowExists(sql, params);
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
    if (model._old === undefined) throw new Error('DataCommunicator unable to check for old values. Please use find to or get oldVals');
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
      cols.push(`${i}=${this.nextFieldParam()}`);
      if (model.jsonColumns().indexOf(i) !== -1) params.push(JSON.stringify(updates[i]));
      else params.push(updates[i]);
    };

    var pkfilters: string[] = [];
    for (var p of this.PK) {
      pkfilters.push(`${p}=${this.nextFieldParam()}`);
      params.push(model._old[p]);
    }
    sql += cols.join(', ') + ' WHERE ' + pkfilters.join(' AND ');
    await DataCommunicator.db.exec(sql, params);
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
    await DataCommunicator.db.exec(sql, params);
  }
  public async deleteWhere(strWhere: string, bindings:any[]):Promise<void> {
    let sql:string = `DELETE FROM ${this.tableName} ${strWhere}`;
    await DataCommunicator.db.exec(sql, bindings);
  }

  public async find(PKs: any[], cols: string = '*'): Promise<T | undefined> {
    var sql: string = `SELECT ${cols} FROM ${this.tableName}`;
    this.resetFieldIndex();
    var conds: string[] = this.PK.map(s => { return `${s}=${this.nextFieldParam()}`; });
    sql += ` WHERE ${conds.join(' AND ')}`;
    var dbres: any = await DataCommunicator.db.getOneRow(sql, PKs);
    if (dbres === undefined) return undefined;
    var res: T = new this.classOfModel();

    res.cloneFrom(dbres);
    if (DataCommunicator.db.dbEngine === 'mysql') res.jsonParseForMySQL();
    res.fillOldVals();
    return res;
  }
  public async findWhere(strWhere:string, cols: string='*', bindings:any[]): Promise<T | undefined> {
    var sql: string = `SELECT ${cols} FROM ${this.tableName} ${strWhere}`;
    var dbres: any = await DataCommunicator.db.getOneRow(sql, bindings);
    if (dbres === undefined) return undefined;
    var res: T = new this.classOfModel();

    res.cloneFrom(dbres);
    if (DataCommunicator.db.dbEngine === 'mysql') res.jsonParseForMySQL();
    res.fillOldVals();
    return res;
  }

  public async all(cols: string = '*', withOldVals=false): Promise<T[]> {
    var dbres: any = await DataCommunicator.db.get(`SELECT ${cols} FROM ${this.tableName}`);
    var res: T[] = dbres.map(row => {
      var obj: T = new this.classOfModel();
      obj.cloneFrom(row);
      if (DataCommunicator.db.dbEngine === 'mysql') obj.jsonParseForMySQL();
      if (withOldVals) obj.fillOldVals();
      return obj;
    });
    return res;
  }
  public async allPlus(moreQuery:string, cols: string = '*', bindings:any[] = [], withOldVals=false): Promise<T[]> {
    var dbres: any = await DataCommunicator.db.get(`SELECT ${cols} FROM ${this.tableName} ${moreQuery}`, bindings);
    var res: T[] = dbres.map(row => {
      var obj: T = new this.classOfModel();
      obj.cloneFrom(row);
      if (DataCommunicator.db.dbEngine === 'mysql') obj.jsonParseForMySQL();
      if (withOldVals) obj.fillOldVals();
      return obj;
    });
    return res;
  }
  public async dbCount(): Promise<number> {
    var dbres: number = +await DataCommunicator.db.getOneVal(`SELECT COUNT(*) FROM ${this.tableName}`);
    return dbres;
  }
  public async dbCountPlus(strWhere: string, bindings: any[] = []) {
    var dbres: number = +await DataCommunicator.db.getOneVal(`SELECT COUNT(*) FROM ${this.tableName} ${strWhere}`, bindings);
    return dbres;
  }

  private _fieldIndex: number = 0;
  private resetFieldIndex() { this._fieldIndex = 0; }
  private nextFieldParam(): string {
    if (DataCommunicator.db.dbEngine === 'mysql') return '?';
    this._fieldIndex++;
    return `$${this._fieldIndex}`;
  }
}

export { DataCommunicator };