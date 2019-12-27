# PostgreDB

This module provide a class which wraps pg and pg-format methods into simpler APIs.
##### Dependencies
- pg
- pg-format

#### How to import
```javascript
    const PostgreDB = require('@icfm/trust').PostgreDB;
    let pgdb = new PostgreDB;
    //To connect to more database, just create another pgdb object.
    //In later examples, this pgdb variable will be used
```

#### Setting connection parameters
There are two ways to set connection parameters. First is to set environment variables. Second way is to call setConnection method.
##### 1st way: Environment variables
Install dotenv so we can put environment variables in .env file `npm i dotenv`
Then create .env file in root folder:
```
PGUSER=username
PGHOST=localhost
PGPASSWORD=secret
PGDATABASE=something
PGPORT=5432
```
Then the pgdb object will always be ready to use.
##### 2nd way: setConnection method
This method need to be called every time after creating new PostgreDB object if the pg environment variables are not set. Or when wanting to create different database connection.
```javascript
//host, username, password, databaseName, port, moreOptions
pgdb.setConnection('localhost', 'user', 'pass', 'theDB', 5432, {max:10});
```
The `port` and `moreOptions` are optional. The `moreOptions` are actually options for `pg.pool` which options can be read [here](https://node-postgres.com/api/pool "here").

## Methods
#### setConnection
```javascript
pgdb.setConnection(host, username, password, dbname [, port=5432] [, options={}])
```
Sets connection parameters of the pgdb object.

#### exec (async)
```javascript
pgdb.exec(DMLQuery [, params])
```
Return value: (int) number of rows affected.

Tells the database to execute `DMLQuery`. `Params` are the parameters required by the query.

Example:
```javascript
await pgdb.exec('INSERT INTO access_log (id, time, action) VALUES (DEFAULT, $1, $2)',['2019-12-26','/login']);
```

#### insert (async)
```javascript
pgdb.insert(InsertQuery [, params])
```
Return value: (int) the value from RETURNING syntax.

Tells the database to execute an insert query. `Params` are the parameters required by the query. The `InsertQuery` must return an integer with `RETURNING someID` command. Otherwise, use `exec` instead.

Example:
```javascript
let sql = 'INSERT INTO access_log (id, time, action) VALUES (DEFAULT, $1, $2) RETURNING id';
let newid = await pgdb.insert(sql,['2019-12-26','/user/123']);
```

#### multiInsert (async)
```javascript
pgdb.multiInsert(InsertQuery, arrayOfRows)
```
Return value: (int) count of rows inserted (untested).

Send nested array as rows to insert to database. **If some insert fails in the middle of operation, the multiInsert stops and the inserted rows remain in database (untested)**.

Example:
```javascript
let values = [];
for (var i=1; i<=100; i++) values.push(['2019-01-01', `Multi insert ${i}`]); 
let rowCount = await pgdb.multiInsert('INSERT INTO access_log (time, action) VALUES %L',values);
```
Note: the values array is something like this:
```
[
  ['2019-01-01', 'Multi insert 1'],
  ['2019-01-01', 'Multi insert 2'],
  ['2019-01-01', 'Multi insert 3'],
  ['2019-01-01', 'Multi insert 4'],
  ['2019-01-01', 'Multi insert 5'],
  ...
  ['2019-01-01', 'Multi insert 100'],
]
```

#### getOneVal (async)
```javascript
pgdb.getOneVal(query [, params])
```
Return value: (any) the result of the query (might be returned as string)

Gets a single value from database. If no row / value, returns undefined.

Example:
```javascript
let email = 'somebody@somehost.com';
let phone = await pgdb.getOneVal('SELECT phone FROM users WHERE email=$1',[email]);
```

#### getOneRow (async)
```javascript
pgdb.getOneRow(query [, params])
```
Return value: (object) the result of the query. If no rows, returns undefined.

Gets a single row from database.

Example:
```javascript
let email = 'somebody@somehost.com';
let row = await pgdb.getOneRow('SELECT * FROM users WHERE email=$1',[email]);
console.log(row);
```
Result:
```
{
  id: 4,
  username: 'admin',
  password: '6955b2914394a4d173715e0c6fd3922cb2e4397463351d60c40eac27882fac0c',
  name: 'Administrator',
  email: '',
  phone: '',
  sysadmin: false,
}
```

#### get (async)
```javascript
pgdb.get(query [, params])
```
Return value: (Array\<object>) array of objects representing the rows returned. Returns empty array when there's no rows.

Gets rows from database.

Example:
```javascript
let rows = await pgdb.get('SELECT id, name, brand FROM products',[]);
console.log(rows);
```
Result:
```
[
  { id: 1, name: 'Crackers', brand: '' },
  { id: 6, name: 'Alfa One 600ml', brand: 'Alfa One' },
  { id: 3, name: 'Aqua 600ml', brand: 'Aqua' },
  { id: 7, name: 'Alfa One 250ml', brand: 'Alfa One' }
]
```

#### rowExists (async)
```javascript
pgdb.rowExists(query [, params])
```
Return value: (boolean)

Checks if certain row exists.

Example:
```javascript
let username = 'fandi';
if (await pgdb.rowExists('SELECT * FROM users WHERE username=$1', [username]))
	throw new Error('Username already taken');
```

#### transExec (async)
```javascript
pgdb.transExec(queries, values)
```
Return value: (int) Count of rows affected (supposedly).

Execute multiple queries at once. Values is jagged array representing data of each query.

Example:
```javascript
var sqls = [
  'INSERT INTO sales VALUES ($1,$2,$3)',
  'INSERT INTO sales_item VALUES ($1, $2, $3, $4, $5)',
  'INSERT INTO sales_item VALUES ($1, $2, $3, $4, $5)',
  'INSERT INTO sales_item VALUES ($1, $2, $3, $4, $5)',
  'INSERT INTO sales_item VALUES ($1, $2, $3, $4, $5)',
];
var vals = [
  [4, '2019-06-07',870000],
  [4, 1, 'ABC Syrup', 4, 20000],
  [4, 2, 'Indomie', 20, 3000],
  [4, 3, 'Bir Bintang', 5, 22000],
  [4, 4, 'Kit kat', 10, 50000],
];
await pgdb.transExec(sqls, vals);
```