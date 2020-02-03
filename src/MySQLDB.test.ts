import dotenv from 'dotenv';
dotenv.config();
import { default as MySQLDB } from './MySQLDB';
let host:string = <string>process.env.MYHOST;
let user:string = <string>process.env.MYUSER;
let password:string = <string>process.env.MYPASSWORD;
let schema:string = <string>process.env.MYSCHEMA;
let port:number = parseInt(<string>process.env.MYPORT);

describe("MySQLDB Operations", ()=> {
  test("Should be able to create MySQLDB Object", ()=>{
    expect(()=>{let db = new MySQLDB;}).not.toThrowError();
  });
  test("Should be able to connect to database", async()=>{
    let db=new MySQLDB;
    db.setConnection(host, user, password,schema, port);
    await expect(db.exec("CREATE DATABASE IF NOT EXISTS dobleh;")).resolves.toBe(1);
    db.closeConnection();
  });
  test("Should be able to create table", async()=>{
    let db=new MySQLDB;
    db.setConnection(host, user, password,schema, port);
    await expect(db.exec(
      "CREATE TABLE IF NOT EXISTS penduduk (id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(50));"
    )).resolves.toBeDefined();
    db.closeConnection();
  });
  test("Should be able to insert and get autoinc", async()=>{
    let db=new MySQLDB;
    db.setConnection(host, user, password,schema, port);
    let angka:number = await db.insert("INSERT INTO penduduk VALUES (NULL, ?)",['Fandi']);
    db.closeConnection();
    expect(angka).toBeTruthy();
  });
  test("Should be able to multiInsert", async()=>{
    let db=new MySQLDB;
    db.setConnection(host, user, password,schema, port);
    let data=[   [null, 'Fandi'],[null, 'Susanto']   ];
    let res:number = await db.multiInsert("INSERT INTO penduduk VALUES ?", data);
    db.closeConnection();
    expect(res).toBeDefined();
  });
  test("Should be able to get one val", async()=>{
    let db=new MySQLDB;
    db.setConnection(host, user, password,schema, port);
    let nama:string = await db.getOneVal('SELECT nama FROM penduduk WHERE id=?', [1]);
    db.closeConnection();
    expect(nama).toBe('Fandi');
  });
  test("Should be able to check row exists", async() =>{
    let db=new MySQLDB;
    db.setConnection(host, user, password,schema, port);
    let ada:boolean = await db.rowExists("SELECT id FROM penduduk WHERE nama=?",['Susanto']);
    db.closeConnection();
    expect(ada).toBe(true);
  });
  test("Should be able to get one row", async()=>{
    let db=new MySQLDB;
    db.setConnection(host, user, password,schema, port);
    let baris:any = await db.getOneRow("SELECT * FROM penduduk WHERE nama=?",['Fandi']);
    db.closeConnection();
    expect(baris.nama).toBe('Fandi');
  });
  test("Should be able to get many rows", async()=> {
    let db=new MySQLDB;
    db.setConnection(host, user, password,schema, port);
    let datas:any[] = await db.get("SELECT * FROM penduduk WHERE nama=?",['Fandi']);
    db.closeConnection();
    expect(datas.length).toBeGreaterThan(2);
  });
  //Note: Transaction is untested
});