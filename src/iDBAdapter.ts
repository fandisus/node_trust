interface iDBAdapter{
  dbEngine:string;
  setConnection(host:string, user:string, password:string, database:string, port:number, options?:any):void;
  closeConnection():void;
  exec(sql:string, params?:any[]):Promise<number>;
  insert(sql:string, params?:any[]):Promise<number>;
  multiInsert(sql:string, params:any[][]):Promise<number>;
  getOneVal(sql:string, params?:any[]):Promise<any>;
  rowExists(sql:string, params?:any[]):Promise<boolean>
  get(sql:string, params?:any[]):Promise<any[]>;
  getOneRow(sql:string, params?:any[]):Promise<any>;
  transExec(sqls:string[],params:any[][]):Promise<any>
}