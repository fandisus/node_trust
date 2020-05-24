import { Connection } from "mysql";
import iDBAdapter from "./iDBAdapter";

var mysql = require('mysql');
class MySQLDB implements iDBAdapter {
  public dbEngine: string = 'mysql';
  constructor() {
    this.connection = mysql.createConnection({host:'localhost'});
  }
  public initialized:boolean = false;
  private connection:Connection;
  public closeConnection() {
    this.connection.end();
  }
  public setConnection(host:string, user:string, password:string, database:string, port:number=3306, options:any={}) {
    options.host = host;
    options.user = user;
    options.password = password;
    options.database = database;
    options.port = port;
    options.timezone = options.timezone || 'local';
    this.connection = mysql.createConnection(options);
    this.connection.on('error', err=>{ 
      console.log('MySQL Connection error event fired');
      console.log(err);
      this.connection.end();
    });
  }
  public nq(s:string) { return this.connection.escape(s); }
  public nqq(s:string) { return `'${this.connection.escape(s)}'`; }
  public async exec(sql:string, params:any[]=[]):Promise<number> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, res, fields) => {
        if (err) { reject(err); return; }
        resolve(res.affectedRows);
      });
    });
  }
  public async insert(sql:string, params:any[]=[]):Promise<number> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, res, fields) => {
        if (err) { reject (err); return; }
        resolve(res.insertId);
      });
    });
  }
  //See: https://www.w3schools.com/nodejs/nodejs_mysql_insert.asp  Insert Multiple Records
  public async multiInsert(sql:string, params:any[][]):Promise<number> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, [params], (err, res, fields) => {
        if (err) { reject(err); return; }
        resolve(res.affectedRows);
      });
    });
  }
  public async getOneVal(sql:string, params:any[]=[]):Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, res, fields) => {
        if (err) { reject(err); return; }
        if (res.rowCount === 0) resolve(undefined);
        // resolve(res[0][fields[0].name]);
        resolve(res[0][ Object.keys(res[0])[0] ]);
      });
    });
  }
  public async rowExists(sql:string, params:any[]=[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, res, fields) => {
        if (err) { reject(err); return; }
        if (res.length === 0) resolve(false); else resolve(true);
      });
    });
  }
  public async get(sql:string, params:any[]=[]):Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, res, fields) => {
        if (err) { reject(err); return; }
        resolve(res);
      });
    });
  }
  public async getOneRow(sql:string, params:any[]=[]):Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err,res,fields) => {
        if (err) { reject(err); return; }
        if(res.length > 0) resolve(res[0]); else resolve(undefined);
      });
    });
  }
  public async transExec(sqls:string[],params:any[][]):Promise<any> {
    var that = this;
    return new Promise((resolve, reject) => {
      that.connection.beginTransaction(async function(err) {
        if (err) { reject(err); return; }
        var hasError:boolean = false;
        await that.exec(sqls[0],params[0]).catch((err)=>{ hasError = true; reject(err); });
        if (hasError) return;
        for (let i:number=1; i<sqls.length; i++) {
          await that.exec(sqls[i],params[i]).catch((err)=>{
            that.connection.rollback(()=>{ hasError=true; reject(err);});
          });
          if (hasError) return;
        };
        await new Promise((reso,reje)=> {
          that.connection.commit((err)=>{
            if (err) { that.connection.rollback(()=>{ reje(err); }) }
            else { resolve(); reso(); }
          });
        }).catch(reject); //This reject is untested.
      });

    });
  }
  
}
export default MySQLDB;