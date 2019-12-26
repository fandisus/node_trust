# MySQLDB

This module provide a class which wraps `mysql` methods into simpler APIs.
##### Dependencies
- mysql

#### How to import
```javascript
    const MySQLDB = require('@icfm/trust').MySQLDB;
    let db = new MySQLDB;
    //To connect to more database, just create another db object.
    //In later examples, this db variable will be used
```

#### Setting connection parameters
Connection parameters MUST be set before trying to query the database.
```javascript
//host, username, password, databaseName, port, timezone, moreOptions
db.setConnection('localhost','username','password','dbname',3306, 'local', {});
```
The `port`, `timezone` and `moreOptions` are optional. The `moreOptions` are actually connection options for `mysql` which options can be read [here](https://www.npmjs.com/package/mysql#connection-options "here"). There's also explanation about timezone in the link.

## Methods
#### setConnection
```javascript
db.setConnection(host, username, password, dbname [, port=3306] [, timezone='local'][, options={}])
```
Sets connection parameters of the db object.

#### exec (async)
```javascript
db.exec(DMLQuery[, params])
```
Return value: (int) number of rows affected.

Tells the database to execute `DMLQuery`. `Params` are the parameters required by the query.

Example:
```javascript
await db.exec('INSERT INTO access_log (id, time, action) VALUES (DEFAULT, ?, ?)',['2019-12-26','/login']);
```

#### insert (async)
```javascript
db.insert(InsertQuery [, params])
```
Return value: (int) the new value of the AUTO_INCREMENT column.

Tells the database to execute an insert query. `Params` are the parameters required by the query. The table is supposed to have AUTO_INCREMENT column. Otherwise, use `exec` instead.

Example:
```javascript
let sql = 'INSERT INTO access_log (id, time, action) VALUES (DEFAULT, ?, ?)';
let newid = await db.insert(sql,['2019-12-26','/user/123']);
```

#### multiInsert (async)
```javascript
db.multiInsert(InsertQuery, arrayOfRows)
```
Return value: (int) count of rows inserted (untested).

Send nested array as rows to insert to database. **If some insert fails in the middle of operation, the multiInsert stops and the inserted rows remain in database (untested)**.

Example:
```javascript
let values = [];
for (var i=1; i<=100; i++) values.push(['2019-01-01', `Multi insert ${i}`]); 
let rowCount = await db.multiInsert('INSERT INTO access_log (time, action) VALUES ?',values);
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
db.getOneVal(query [, params])
```
Return value: (any) the result of the query (might be returned as string)

Gets a single value from database. If no row / value, returns undefined.

Example:
```javascript
let email = 'somebody@somehost.com';
let phone = await db.getOneVal('SELECT phone FROM users WHERE email=?',[email]);
```

#### getOneRow (async)
```javascript
db.getOneRow(query [, params])
```
Return value: (object) the result of the query. If no rows, returns undefined.

Gets a single row from database.

Example:
```javascript
let email = 'somebody@somehost.com';
let row = await db.getOneRow('SELECT * FROM users WHERE email=?',[email]);
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
let rows = await db.get('SELECT id, name, brand FROM products');
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
db.rowExists(query [, params])
```
Return value: (boolean)

Checks if certain row exists.

Example:
```javascript
let username = 'fandi';
if (await db.rowExists('SELECT * FROM users WHERE username=?', [username]))
	throw new Error('Username already taken');
```

#### transExec (async)
```javascript
db.transExec(queries, values)
```
Return value: (int) Count of rows affected (supposedly).

Execute multiple queries at once. Values is jagged array representing data of each query.

Example:
```javascript
var sqls = [
  'INSERT INTO sales VALUES (?,?,?)',
  'INSERT INTO sales_item VALUES (?, ?, ?, ?, ?)',
  'INSERT INTO sales_item VALUES (?, ?, ?, ?, ?)',
  'INSERT INTO sales_item VALUES (?, ?, ?, ?, ?)',
  'INSERT INTO sales_item VALUES (?, ?, ?, ?, ?)',
];
var vals = [
  [4, '2019-06-07',870000],
  [4, 1, 'ABC Syrup', 4, 20000],
  [4, 2, 'Indomie', 20, 3000],
  [4, 3, 'Bir Bintang', 5, 22000],
  [4, 4, 'Kit kat', 10, 50000],
];
await db.transExec(sqls, vals);
```
