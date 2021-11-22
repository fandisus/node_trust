//NOTE: This class is working for simple query and connections. No longer "TOO MANY CONNECTIONS".
//But if want to execute variables query such as set timezone, group concat max length,
//Is not yet possible. Because once the connection is ended, the variables are reset.
import { Connection } from "mysql";
import iDBAdapter from "./iDBAdapter";

var mysql = require('mysql');
class MySQLDB implements iDBAdapter {
  public dbEngine: string = 'mysql';
  constructor() {
    // this.connection = mysql.createConnection({host:'localhost'});
  }
  public initialized:boolean = false;
  private connection:Connection|undefined = undefined;
  private connOptions:any = {};
  public closeConnection() {
    // this.connection.end();
  }
  public setConnection(host:string, user:string, password:string, database:string, port:number=3306, options:any={}) {
    options.host = host;
    options.user = user;
    options.password = password;
    options.database = database;
    options.port = port;
    options.timezone = options.timezone || 'local';
    this.connOptions = options;
    let conn = mysql.createConnection(options);
    conn.on('error', err=>{ 
      console.log('MySQL Connection error event fired');
      console.log(err);
      conn.end();
    });
    conn.end();
  }
  private getConnection() {
    if (!this.connOptions.host) throw new Error('MySQL not connected');
    return mysql.createConnection(this.connOptions);
  }
  public nq(s:string) { return mysql.escape(s); }
  public nqq(s:string) { return `'${mysql.escape(s)}'`; }
  public async exec(sql:string, params:any[]=[]):Promise<number> {
    return new Promise((resolve, reject) => {
      let conn = this.getConnection();
      conn.query(sql, params, (err, res, fields) => {
        if (err) { conn.end(); reject(err); return; }
        resolve(res.affectedRows);
        conn.end();
      });
    });
  }
  public async insert(sql:string, params:any[]=[]):Promise<number> {
    return new Promise((resolve, reject) => {
      let conn = this.getConnection();
      conn.query(sql, params, (err, res, fields) => {
        if (err) { conn.end(); reject (err); return; }
        resolve(res.insertId);
        conn.end();
      });
    });
  }
  //See: https://www.w3schools.com/nodejs/nodejs_mysql_insert.asp  Insert Multiple Records
  public async multiInsert(sql:string, params:any[][]):Promise<number> {
    return new Promise((resolve, reject) => {
      let conn = this.getConnection();
      conn.query(sql, [params], (err, res, fields) => {
        if (err) { conn.end(); reject(err); return; }
        resolve(res.affectedRows);
        conn.end();
      });
    });
  }
  public async getOneVal(sql:string, params:any[]=[]):Promise<any> {
    return new Promise((resolve, reject) => {
      let conn = this.getConnection();
      conn.query(sql, params, (err, res, fields) => {
        if (err) { conn.end(); reject(err); return; }
        if (res.rowCount === 0) resolve(undefined);
        // resolve(res[0][fields[0].name]);
        else resolve(res[0][ Object.keys(res[0])[0] ]);
        conn.end();
      });
    });
  }
  public async rowExists(sql:string, params:any[]=[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let conn = this.getConnection();
      conn.query(sql, params, (err, res, fields) => {
        if (err) { conn.end(); reject(err); return; }
        if (res.length === 0) resolve(false); else resolve(true);
        conn.end();
      });
    });
  }
  public async get(sql:string, params:any[]=[]):Promise<any[]> {
    return new Promise((resolve, reject) => {
      let conn = this.getConnection();
      conn.query(sql, params, (err, res, fields) => {
        if (err) { conn.end(); reject(err); return; }
        resolve(res);
        conn.end();
      });
    });
  }
  public async getWithExecs(sqls:string[], params:any[][]):Promise<any[]> {
    return new Promise((reso, reje) => {
      let conn = this.getConnection();
      let lastIndex:number = sqls.length - 1;
      for (let i=0; i < lastIndex; i++) {
        conn.query(sqls[i], params[i], (err, res, fields) => { if (err) { conn.end(); reje(err); return; } });
      }
      conn.query(sqls[lastIndex], params[lastIndex], (err, res, fields) => {
        if (err) { conn.end(); reje(err); return; }
        reso(res);
        conn.end();
      });
    });
  }
  public async getOneRow(sql:string, params:any[]=[]):Promise<any> {
    return new Promise((resolve, reject) => {
      let conn = this.getConnection();
      conn.query(sql, params, (err,res,fields) => {
        if (err) { conn.end(); reject(err); return; }
        if(res.length > 0) resolve(res[0]); else resolve(undefined);
        conn.end();
      });
    });
  }
  public async transExec(sqls:string[],params:any[][]):Promise<any> {
    throw new Error("Not supported yet");
    
    // var that = this;
    // return new Promise((resolve, reject) => {
    //   that.connection.beginTransaction(async function(err) {
    //     if (err) { reject(err); return; }
    //     var hasError:boolean = false;
    //     await that.exec(sqls[0],params[0]).catch((err)=>{ hasError = true; reject(err); });
    //     if (hasError) return;
    //     for (let i:number=1; i<sqls.length; i++) {
    //       await that.exec(sqls[i],params[i]).catch((err)=>{
    //         that.connection.rollback(()=>{ hasError=true; reject(err);});
    //       });
    //       if (hasError) return;
    //     };
    //     await new Promise((reso,reje)=> {
    //       that.connection.commit((err)=>{
    //         if (err) { that.connection.rollback(()=>{ reje(err); }) }
    //         else { resolve(true); reso(true); }
    //       });
    //     }).catch(reject); //This reject is untested.
    //   });

    // });
  }
  
}
export default MySQLDB;