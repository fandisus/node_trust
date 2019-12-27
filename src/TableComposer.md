# TableComposer
DDL SQL Builder. No Dependencies. Support PostgreSQL and MySQL syntaxes. Mostly tested for PostgreSQL syntaxes.

## Example
```javascript
const TableComposer = require('@icfm/trust').TableComposer;
let tc = new TableComposer('users');
let res = tc.increments('id').primary()
  .string('username').index()
  .string('password', 100)
  .string('name').index()
  .string('email').unique()
  .string('phone').unique()
  .jsonb('biodata') //profile_pic, address, IC_NO, driver_license ...
  .bool('sysadmin').index()
  .jsonb('login_info').ginPropIndex('otp','cookie','forgot') //otp_expiry, cookie_expiry, last_login, created_at
  .parse();
```
Result:
```
[
  '-- Tabel users --',
  'DROP TABLE IF EXISTS users CASCADE;',
  'CREATE TABLE users (\n' +
    'id SERIAL,\n' +
    'username CHARACTER VARYING(50),\n' +
    'password CHARACTER VARYING(100),\n' +
    'name CHARACTER VARYING(50),\n' +
    'email CHARACTER VARYING(50),\n' +
    'phone CHARACTER VARYING(50),\n' +
    'biodata JSONB,\n' +
    'sysadmin BOOL,\n' +
    'login_info JSONB,\n' +
    'CONSTRAINT pk_users PRIMARY KEY (id),\n' +
    'CONSTRAINT uq_users_email UNIQUE (email),\n' +
    'CONSTRAINT uq_users_phone UNIQUE (phone)\n' +
    ');',
  'CREATE INDEX idx_username_users ON users USING BTREE (username);',
  'CREATE INDEX idx_name_users ON users USING BTREE (name);',
  'CREATE INDEX idx_sysadmin_users ON users USING BTREE (sysadmin);',
  "CREATE INDEX idx_otp_login_info_users ON users USING GIN ((login_info->'otp'));",
  "CREATE INDEX idx_cookie_login_info_users ON users USING GIN ((login_info->'cookie'));",
  "CREATE INDEX idx_forgot_login_info_users ON users USING GIN ((login_info->'forgot'));"
]
```
**Note that:** The result of parse() is an array containing multiple SQL commands. Each array element is one query.

## Data Types
Function|PostgreSQL|MySQL
-|-|-
`increment(colName)`| SERIAL | INT AUTO_INCREMENT
`bigIncrement(colName)`| BIGSERIAL | BIGINT AUTO_INCREMENT
`string(colName [,size=50]`| CHARACTER VARYING(50) | VARCHAR(50)
`text(colName)`| TEXT | TEXT
`integer(colName)`| INTEGER | INT
`bigInteger(colName)`| BIGINT | BIGINT
`double(colName)`| DOUBLE PRECISION | DOUBLE
`numeric(colName [,precision=19] [,scale=2])`| NUMERIC(19,2) | NUMERIC(19,2)
`bool(colName)`| BOOL | BOOL
`timestamp(colName)`| TIMESTAMP | DATETIME
`date(colName)`| DATE | DATE
`time(colName)`| TIME | TIME
`jsonb(colname`| JSONB | JSON
Add `.notNull()` after column to restrict the column to not have NULL value.

## Constraints
These constraints if need to be defined, are to be called right after each column definition.
Function | Description 
-|-
`unique()`| Sets the column as unique
`multiUnique(...cols)` | Sets composite unique constraint to the column names in the parameters
`primary()`|Sets the column as primary
`primary(arrCols)`|Sets the column names in function parameter as composite primary key
`foreign(refTable, refCol [,onUpdate] [,onDelete]`|Sets the column as foreign key. Default relationship behavior are `ON UPDATE CASCADE` and `ON DELETE CASCADE`. Possible option for onUpdate and onDelete parameter are: `SET NULL`, `CASCADE`, `RESTRICT`
`multiForeign(arrCols, refTable, refArrCols [,onUpdate] [,onDelete])`|Same as above. For composite foreign key. arrCols is the referrer columns. While refArrCols is the columns referred.

## Indexes and Comments
Function|Description
-|-
`index()`|Sets the column as index
`comment(colName, comment)`|Creates SQL comment for the `colName` column.
`comment(comment)`|Creates SQL comment
`ginIndex()`|`PostgreSQL only`. Creates GIN index for JSONB column
`ginPropIndex(...props)`|`PostgreSQL only`. Creates GIN index for the properties of the JSONB column. **Note that this does not mean the column can only contain properties mentioned in the index**
`mysqlJsonIndex(arrProps)`|`MySQL only`. Creates alias columns and indexes for MySQL JSON column

## Finishing
EVERY methods in TableComposer objects returns itself (TableComposer). Except the method `parse()` which returns an array of query strings. Feel free to output, execute, pipe or do whatever you want with the queries.
