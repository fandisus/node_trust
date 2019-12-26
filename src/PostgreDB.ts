import pg from 'pg';
import format from 'pg-format';

class PostgreDB {
  constructor (){
    this.pool = new pg.Pool();
  }
  public pool:any;
  public setConnection(host:string, user:string, password:string, database:string, port:number=5432, options:any={}) {
    options.host = host;
    options.user = user;
    options.password = password;
    options.database = database;
    options.port = port;
    // options.max = 10; // max number of clients in the pool
    // options.idleTimeoutMillis = 30000; // how long a client is allowed to remain idle before being closed
    this.pool = new pg.Pool(options);
    // this.connection.on('error', err=>{ console.log('MySQL Connection error event fired');});
  }
  public async exec(sql:string, params:any[]):Promise<number> {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params, (err, res) => {
        if (err) { reject(err); return; }
        resolve(res.rowCount);
      });
    });
  }
  public async insert(sql:string, params:any[]):Promise<number> { //SQL must have RETURNING id, and id column must DEFAULT
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params, (err, res) => {
        if (err) { reject (err); return; }
        resolve(res.rows[0].id);
      });
    });
  }
  //See: https://www.wlaurance.com/2018/09/node-postgres-insert-multiple-rows/
  //Should put %L in SQL Values. And the params as usual.
  public async multiInsert(sql:string, params:any[][]):Promise<number> {
    return new Promise((resolve, reject) => {
      let sql2 = format(sql, params);
      this.pool.query(sql2, [], (err, res) => {
        if (err) { reject(err); return; }
        resolve(res.rowCount);
      });
    });
  }
  public async getOneVal(sql:string, params:any[]=[]):Promise<any> {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params, (err, res) => {
        if (err) { reject(err); return; }
        if (res.rowCount === 0) resolve(undefined);
        else resolve(res.rows[0][res.fields[0].name]);
      });
    });
  }
  public async rowExists(sql:string, params:any[]):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params, (err, res) => {
        if (err) { reject(err); return; }
        if (res.rows.length === 0) resolve(false); else resolve(true);
      });
    });
  }
  public async get(sql:string, params:any[]=[]):Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params, (err, res) => {
        if (err) { reject(err); return; }
        // console.log(res); //Ada rowCount, fields, _parsers, RowCtor, rowAsArray. Mungkin perlu dipelajari suatu saat nanti.
        resolve(res.rows);
      });
    });
  }
  public async getOneRow(sql:string, params:any[]=[]):Promise<any> {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params, (err,res) => {
        if (err) { reject(err); return; }
        if(res.rowCount > 0) resolve(res.rows[0]); else resolve(undefined);
      });
    });
  }
  public async transExec(sqls:string[],params:any[][]):Promise<any> {
    var that = this;
    return new Promise(async (resolve, reject) => {
      const client= await that.pool.connect();
      try {
        await client.query('BEGIN');
        for (let i:number=0; i<sqls.length; i++) await client.query(sqls[i], params[i]);
        await client.query('COMMIT');
        resolve();
      } catch (e) {
        await client.query('ROLLBACK');
        reject (e);
      } finally {
        client.release();
      }
    });
  }
}
export default PostgreDB;