# DataCommunicator
Class for managing Business Models. **THIS CLASS HAS NOT BEEN TRIED WITH ANY PROJECT YET. USE AT YOUR OWN RISK.** This class was designed to be used with typescript.

### Dependency
- Internals: `Model`, `Basics`
- External: `lodash`

Designed to be used with the Model class.

### Usage
#### Importing
```javascript
import {DataCommunicator} from '@icfm/trust';
```

#### Creating new object
```
import {Model} from '@icfm/trust';
import {PostgreDB} from '@icfm/trust';
//OR import {MySQLDB} from '@icfm/trust';
class User extends Model {
	...
}
let dcUser = new DataCommunicator(User);
DataCommunicator.db = new PostgreDB;
//OR DataCommunicator.db = new MySQLDB;
```
The `DataCommunicator` constructor accepts a class in its argument. The class must inherit from `Model`.

#### Setting up database connection parameters
`DataCommunicator` got a `db` property which is either a `PostgreDB` object or `MySQLDB` object. To setup the connection parameters, use environment variables, or `DataCommunicator.db.setConnection` method. More detailed explanation about connection can be found in [PostgreDB](https://github.com/fandisus/node_trust/blob/master/src/PostgreDB.md "PostgreDB") or [MySQLDB](https://github.com/fandisus/node_trust/blob/master/src/MySQLDB.md "MySQLDB").

#### Inserting new object
```javascript
//Create a new DataCommunicator for class Salesman.
//Put the Salesman class into constructor
let dcSalesman = new DataCommunicator(Salesman);

//Create new salesman object
let name = faker.name.findName();
let oSalesman:Salesman = new Salesman({
  username : name,
  password : Salesman.hashPassword('12345'),
  biodata : { name: name, phone:faker.phone.phoneNumber()},
});
await dcSalesman.insert(oSalesman);
console.log('Inserted object: ', oSalesman);  //id should have been updated to new id
```
If the Model `hasSerial()` returns true, the id of the `oSalesman` object will be set to new id after insert.

#### Inserting multiple object at once
```javascript
let items = [
  new SalesDetail({sales_id:oSales.id, product:'item 1', price:100, qty:1, sub_total:100 }),
  new SalesDetail({sales_id:oSales.id, product:'item 2', price:50, qty:4, sub_total:200 }),
  new SalesDetail({sales_id:oSales.id, product:'item 3', price:150, qty:2, sub_total:300 }),
  new SalesDetail({sales_id:oSales.id, product:'item 4', price:40, qty:10, sub_total:400 }),
];
let dcSalesDetail = new DataCommunicator(SalesDetail);
await dcSalesDetail.multiInsert(items);
```
Note that this method does not check PK collisions, and does no auto id assignments.

#### Updating data
```javascript
//Find the data by id
let finder = await dcSalesman.find([oSalesman.id]);
if (finder === undefined) throw new Error("Salesman not found");
oSalesman = <Salesman> finder;

//Update the data
oSalesman.biodata.name = 'Fandi';
await dcSalesman.update(oSalesman);
```
Object returned from the `find` method shall have `_old` property which hold the data of the object when it just fetched from database. If modified, the `update` method will only update the updated field. If no properties changed, `update` will throw `TableName data unchanged` error.

#### Deleting data
```javascript
//Find the data by id
let finder = await dcSalesman.find([oSalesman.id]);
if (finder === undefined) throw new Error("Salesman not found");
oSalesman = <Salesman> finder;

//Delete the data
await dcSalesman.delete(oSalesman);
```

#### Getting count of data
```javascript
let allCount = await dcSalesman.dbCount();
//or just count those whose username starts with A
let count = await dcSalesman.dbCountPlus(`WHERE username LIKE 'A%'`);
```

#### Getting the rows
```javascript
let Salesmen = await dcSalesman.all();
//Or just salesmen whose username starts with A
let ASalesmen = await dcSalesman.allPlus(`WHERE username LIKE 'A%'`);
```

### Example
This One example is quite long. Bear with it. Thank you.

Let's try to create a new project. First create an empty folder `tryTrust`. And then run:
0. *If you havent installed typescript globally, run: `npm i typescript -g`
1. `npm init -y`
2. `npm i @icfm/trust dotenv faker`
3. `npm i @types/node -D`
4. `tsc --init`

Create an empty `test` database in your PostgreSQL database. And also create this .env file:
```
PGUSER=yourpgusername
PGHOST=localhost
PGPASSWORD=yourpgpassword
PGDATABASE=test
PGPORT=5432
```

Edit the `tsconfig.json`. Activate the `outdir` option to point to `./dist` folder: `"outDir": "./dist",`

And then create `dbtables` folder and fill with files below, so our folder structure look like this:
- [project folder]
  - src
    - dbtables
      - 0_salesman.ts
      - 1_sales.ts
      - 2_sales_detail.ts
    - models
  	  - Sales.ts
  	  - SalesDetail.ts
  	  - Salesman.ts
    - createTable.ts
    - multiTable.ts
    - singleTable.ts
  - .env
  - package.json
  - tsconfig.json

#### Table definitions (dbtables)
dbtables/0_salesman.ts
```javascript
import {TableComposer} from '@icfm/trust';
let tc = new TableComposer('salesman');
let queries = tc.increments('id').primary()
                .string('username').unique()
                .string('password', 100)
                .jsonb('biodata').ginPropIndex('name', 'phone')
                .parse();
export default queries;
```
dbtables/1_sales.ts
```javascript
import {TableComposer} from '@icfm/trust';
let tc = new TableComposer('sales');
let queries = tc.increments('id').primary()
                .integer('salesman_id').foreign('salesman', 'id').index()
                .date('date').index()
                .string('customer').index()
                .numeric('total')
                .parse();
export default queries;
```
dbtables/2_sales_detail.ts
```javascript
import {TableComposer} from '@icfm/trust';
let tc = new TableComposer('sales_detail');
let queries = tc.integer('sales_id').foreign('sales','id').index()
                .string('product').index()
                .numeric('price')
                .integer('qty')
                .numeric('sub_total')
                .parse();
export default queries;
```
#### Models
models/Salesman.ts
```javascript
import {Model, Crypter, PostgreDB} from '@icfm/trust';
const db = new PostgreDB;

class Salesman extends Model {
  tableName(): string { return 'salesman'; }
  PK(): string[] { return ['id']; }
  hasSerial(): boolean { return true; }

  constructor(obj:any={}) {
    super();
    this.cloneFrom(obj);
  }

  public id:number=0;
  public username:string='';
  public password:string='';
  public biodata:any={name:'', phone:''};

  public static hashPassword(str:string):string {
    return Crypter.sha256(str);
  }
  public static async findByUsername(username: string): Promise<Salesman | undefined> {
    let row =  await db.getOneRow('SELECT * FROM salesman WHERE username=$1',[username]);
    //MySQL: let row =  await db.getOneRow('SELECT * FROM salesman WHERE username=?',[username]);
    if (row === undefined) return undefined;
    let obj = new Salesman(row);
    obj.fillOldVals(); //Create _old in object, so it will be updateable using DataCommunicator
    return obj;
  }
}

export default Salesman;
```
models/Sales.ts
```javascript
import {Model} from '@icfm/trust';
class Sales extends Model {
  tableName(): string { return 'Sales'; }
  PK(): string[] { return ['id']; }
  hasSerial(): boolean { return true; }

  constructor(obj:any={}) {
    super();
    this.cloneFrom(obj);
  }

  public id:number = 0;
  public salesman_id:number=0;
  public date:Date = new Date();
  public customer:string = '';
  public total:number = 0;
}

export default Sales;
```
models/SalesDetail.ts
```javascript
import {Model} from '@icfm/trust';
class SalesDetail extends Model {
  tableName(): string { return 'sales_detail'}
  PK(): string[] { return []; }
  hasSerial(): boolean { return false; }

  constructor(obj:any={}) {
    super();
    this.cloneFrom(obj);
  }

  public sales_id:number=0;
  public product:string='';
  public price:number=0;
  public qty:number=0;
  public sub_total:number=0;
}
export default SalesDetail;
```
#### Execution script
createTable.ts
```javascript
require('dotenv').config();
import {Files, PostgreDB, TableComposer} from '@icfm/trust';
//MySQL: TableComposer.driver = 'mysql';
let db = new PostgreDB;

let createTables = async function() {
  let list = Files.getFileList(__dirname+'/dbtables');
  for (var f of list) {
    console.log('Creating table from: '+f);
    let queries = require(`${__dirname}/dbtables/${f}`).default;
    for (var q of queries) await db.exec(q);
  }
}
createTables();
```
singleTable.ts
```javascript
require('dotenv').config();
const faker = require('faker');
import {DataCommunicator} from '@icfm/trust';

import Salesman from './models/Salesman';

let tester = async function() {
  try {
    //Create a new DataCommunicator for class Salesman.
    //Put the Salesman class into constructor
    let dcSalesman = new DataCommunicator(Salesman);

    //Create new salesman object
    let name = faker.name.findName();
    let oSalesman:Salesman = new Salesman({
      username : name,
      password : Salesman.hashPassword('12345'),
      biodata : { name: name, phone:faker.phone.phoneNumber()},
    });

    //Insert the object into database.
    await dcSalesman.insert(oSalesman);
    console.log('Inserted object: ', oSalesman);  //id should have been updated to new id

    //Get all salesman from the database
    let salesmans = await dcSalesman.allPlus('LIMIT 10');
    console.log('After insert: ', salesmans);

    let rowCount = await dcSalesman.dbCount();
    console.log('Row count: ', rowCount);

    //Find the data by id
    let finder = await dcSalesman.find([oSalesman.id]);
    if (finder === undefined) throw new Error("Salesman not found");
    oSalesman = <Salesman> finder;

    //Update the data
    oSalesman.biodata.name = 'Fandi';
    await dcSalesman.update(oSalesman);
    //* Can only update data which was called using `find` method.
    
    //Get data after update
    let oSalesman2:Salesman|undefined =
        await dcSalesman.findWhere(`WHERE biodata->>"$.name"=?`,'*',['Fandi']);
    console.log('After update: ', oSalesman2);

    //Get data after update
    salesmans = await dcSalesman.allPlus(`WHERE biodata->>'name'=$1`,undefined,['Fandi']);
    //MySQL: salesmans = await dcSalesman.allPlus(`WHERE biodata->>"$.name"=?`,undefined,['Fandi']);
    console.log('Get using array: ', salesmans);

    //Delete the just created salesman
    await dcSalesman.delete(oSalesman);

    //Get data after delete.
    salesmans = await dcSalesman.allPlus('LIMIT 10');
    console.log('After delete: ', salesmans);
  } catch(e) {
    console.log(e);
  }
};
tester();
```
multiTable.ts
```javascript
require('dotenv').config();
import {DataCommunicator} from '@icfm/trust';

import Salesman from './models/Salesman';
import Sales from './models/Sales';
import SalesDetail from './models/SalesDetail';

let tester = async function() {
  try {
    let dcSalesman = new DataCommunicator(Salesman);
    //Create another salesman to test sales and sales_detail table
    let oSalesman2:Salesman;
    let finder = await Salesman.findByUsername('tester');
    console.log('finder :', finder);
    if (finder === undefined) {
      oSalesman2 = new Salesman({
        username:'tester',
        password:Salesman.hashPassword('tester'),
        biodata:{name:'admin', phone:'111-222-456'}
      });
      await dcSalesman.insert(oSalesman2);
      console.log('Salesman2', oSalesman2);
    } else oSalesman2 = <Salesman> finder;

    //Create and insert new Sales data
    let oSales = new Sales({
      salesman_id:oSalesman2.id,
      date:new Date(),
      customer: 'Fandi',
      total: '1000'
    });
    let dcSales = new DataCommunicator(Sales);
    await dcSales.insert(oSales);
    console.log('Inserted sales :', oSales);

    //Create and insert sales items
    let items = [
      new SalesDetail({sales_id:oSales.id, product:'item 1', price:100, qty:1, sub_total:100 }),
      new SalesDetail({sales_id:oSales.id, product:'item 2', price:50, qty:4, sub_total:200 }),
      new SalesDetail({sales_id:oSales.id, product:'item 3', price:150, qty:2, sub_total:300 }),
      new SalesDetail({sales_id:oSales.id, product:'item 4', price:40, qty:10, sub_total:400 }),
    ];
    let dcSalesDetail = new DataCommunicator(SalesDetail);
    await dcSalesDetail.multiInsert(items);

    //Show the data using raw query
    let data = await DataCommunicator.pg.get(`
    SELECT * FROM sales LEFT JOIN sales_detail ON sales.id=sales_detail.sales_id
    `);
    console.log('Content of sales and sales_detail:', data);

  } catch(e) {
    console.log(e);
  }
};
tester();
```
#### Running the script
After creating all files above, compile typescript with the `tsc` command. If successful, you will have `dist` folder created with resulting js files inside. If fail, check your `tsconfig.json` file, or whether typescript is installed globally.

Before running the script, make sure that the variables in `.env` file already setup correctly. Most importantly, do not misspell the database name.

Then respectively, run:
- node ./dist/createTable.js
- node ./dist/singleTable.js
- node ./dist/multiTable.js

If successful:
- `createTable.js` will create salesman, sales and sales_detail tables in database.
- `singleTable.js` will insert, update and delete data from the `salesman` table. While calling the data repeatedly in between.
- `multiTable.js` will simulate inserting to multiple tables at once.