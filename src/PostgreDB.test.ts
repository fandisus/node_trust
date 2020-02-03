import dotenv from 'dotenv';
dotenv.config();
import { default as PostgreDB } from './PostgreDB';
describe("PostgreDB Operations", ()=> {
  test("Should be able to create PostgreDB Object", ()=>{
    expect(()=>{let db = new PostgreDB;}).not.toThrowError();
  });
  // test("Should be able to connect to database", async()=>{
  //   let db=new PostgreDB;
  //   db.setConnection(host, user, password,schema, port);
  //   await expect(db.exec("CREATE DATABASE IF NOT EXISTS dobleh;")).resolves.toBe(1);
  //   db.closeConnection();
  // });
  test("Should be able to create table", async()=>{
    let db=new PostgreDB;
    await expect(db.exec(
      "CREATE TABLE IF NOT EXISTS penduduk (id SERIAL PRIMARY KEY, nama VARCHAR(50));"
    )).resolves.toBeDefined();
    db.closeConnection();
  });
  test("Should be able to insert and get autoinc", async()=>{
    let db=new PostgreDB;
    let angka:number = await db.insert("INSERT INTO penduduk VALUES (DEFAULT, $1) RETURNING id",['Fandi']);
    console.log("PK: ", angka);
    db.closeConnection();
    expect(angka).toBeTruthy();
  });
  test("Should be able to multiInsert", async()=>{
    let db=new PostgreDB;
    let data=[   ['Fandi'],['Susanto']   ];
    let res:number = await db.multiInsert("INSERT INTO penduduk (nama) VALUES %L", data);
    db.closeConnection();
    expect(res).toBeDefined();
  });
  test("Should be able to get one val", async()=>{
    let db=new PostgreDB;
    let nama:string = await db.getOneVal('SELECT nama FROM penduduk WHERE id=$1', [1]);
    db.closeConnection();
    expect(nama).toBe('Fandi');
  });
  test("Should be able to check row exists", async() =>{
    let db=new PostgreDB;
    let ada:boolean = await db.rowExists("SELECT id FROM penduduk WHERE nama=$1",['Susanto']);
    db.closeConnection();
    expect(ada).toBe(true);
  });
  test("Should be able to get one row", async()=>{
    let db=new PostgreDB;
    let baris:any = await db.getOneRow("SELECT * FROM penduduk WHERE nama=$1",['Fandi']);
    db.closeConnection();
    expect(baris.nama).toBe('Fandi');
  });
  test("Should be able to get many rows", async()=> {
    let db=new PostgreDB;
    let datas:any[] = await db.get("SELECT * FROM penduduk WHERE nama=$1",['Fandi']);
    db.closeConnection();
    expect(datas.length).toBeGreaterThan(2);
  });
  //Note: Transaction is untested
});