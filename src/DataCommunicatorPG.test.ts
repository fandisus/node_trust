import dotenv from 'dotenv';
dotenv.config();
import PostgreDB from './PostgreDB';
import { DataCommunicator } from './DataCommunicator';
import { Model } from './Model';
//Must test after postgreDB test success

//Consider database 'dobleh' already exists
let db = new PostgreDB;
db.exec(`CREATE TABLE IF NOT EXISTS book (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50),
  author VARCHAR(50),
  publish_year INT,
  other_info JSONB
)`);
db.closeConnection();

class Book extends Model {
  public tableName(): string { return "book"; }
  public PK(): string[] { return ['id']; }
  public hasSerial(): boolean { return true; }
  constructor(obj:any={}) {
    super();
    this.cloneFrom(obj);
  }

  public id:number=0;
  public title:string='';
  public author:string='';
  public publish_year:number=0;
  public other_info:any = {};
}

let dcBook = new DataCommunicator(Book);

describe("DataCommunicator Test", ()=> {
  test("Should be able to insert, and id not zero", async ()=>{
    DataCommunicator.db = new PostgreDB;
    let b = new Book({title:'icodeformoney', author:'Fandi', publish_year:2010, other_info:{pages:65, color:'yellow'}});
    await dcBook.insert(b)
    if (b.id === 0) throw new Error('Id not updated after insert');
    expect(b.title).toBe('icodeformoney');
    DataCommunicator.db.closeConnection();
  });
  test("Should be able to find by PK", async()=>{
    DataCommunicator.db = new PostgreDB;
    let b: Book | undefined = await dcBook.find([1]);
    expect(b?.author).toBe('Fandi');
    DataCommunicator.db.closeConnection();
  });
  test("Should be able to findWhere", async() =>{
    DataCommunicator.db = new PostgreDB;
    let book:Book|undefined = await dcBook.findWhere('WHERE publish_year=$1',undefined,[2010]);
    expect(book?.title).toBe('icodeformoney');
    DataCommunicator.db.closeConnection();
  });
  test("Should be able to get allPlus", async() =>{
    DataCommunicator.db = new PostgreDB;
    let books:Book[] = await dcBook.allPlus('WHERE publish_year=$1','*',[2010]);
    expect(books.length).toBeGreaterThan(0);
    DataCommunicator.db.closeConnection();
  });
  test("Should be able to update and get dbCountPlus", async()=>{
    DataCommunicator.db = new PostgreDB;
    let books:Book[] = await dcBook.allPlus('WHERE publish_year=$1','*',[2010]);
    for(let b of books) {
      b.fillOldVals();
      b.publish_year = 2019;
      await dcBook.update(b);
    }
    let count:number = await dcBook.dbCountPlus('WHERE publish_year=$1',[2019]);
    expect(count).toBeGreaterThan(0);
    DataCommunicator.db.closeConnection();
  });
  test("Should be able to update JSON column", async()=>{
    DataCommunicator.db = new PostgreDB;
    let book:Book|undefined = await dcBook.findWhere('WHERE publish_year=$1',undefined,[2019]);
    if (book ===  undefined) throw new Error('Data not found');
    let num = Math.round(Math.random()*100000);
    console.log(`book.other_info.num = ${num}`);
    book.other_info.number = num;
    await dcBook.update(book);

    let book2:Book|undefined = await dcBook.findWhere(`WHERE other_info->>'number' = $1`, undefined, [num]);
    expect(book2?.title).toBe('icodeformoney');
    DataCommunicator.db.closeConnection();
  });
  test("Should be able to delete rows", async()=>{
    DataCommunicator.db = new PostgreDB;
    let books:Book[] = await dcBook.allPlus('WHERE publish_year=$1 AND id<>1','*',[2019]);
    if (books.length === 0) throw new Error('No data to delete')
    for(let b of books) {
      dcBook.delete(b);
    }
    let count:number = await dcBook.dbCountPlus('WHERE publish_year=$1',[2019]);
    expect(count).toBe(1);
    DataCommunicator.db.closeConnection();
  });
  test("Should be able to multi insert", async() => {
    DataCommunicator.db = new PostgreDB;
    let books = [
      new Book({id:2, title:'Lord of The Rings 1', author:'Peter Jackson', publish_year:2001, other_info:{a:1, b:2, c:3}}),
      new Book({id:3, title:'Lord of The Rings 2', author:'Peter Jackson', publish_year:2002, other_info:{a:4, b:5, c:6}}),
      new Book({id:4, title:'Lord of The Rings 3', author:'Peter Jackson', publish_year:2003, other_info:{a:7, b:8, c:9}}),
    ];
    await dcBook.multiInsert(books);
    let count = await dcBook.dbCountPlus('WHERE title LIKE $1',['Lord of The Rings%']);
    for (let b of books) await dcBook.delete(b);
    expect(count).toBe(3);
    DataCommunicator.db.closeConnection();
  });

});