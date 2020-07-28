# node_trust
Commonly used NodeJS basic functionalities. **Warning** : this library tends to favor PostgreSQL. Especially the `DataCommunicator` and `Model` class.

### Dependencies
fs-extra, lodash, mysql, pg, pg-format

### Installation
`npm i @icfm/trust`

### Documentation
Below are some documentations which are ready.
- [PostgreDB (class)](https://github.com/fandisus/node_trust/blob/master/src/PostgreDB.md "PostgreDB (class)") Wrapper for pg module. A simplified API for postgreSQL database operations.
- [MySQLDB (class)](https://github.com/fandisus/node_trust/blob/master/src/MySQLDB.md "MySQLDB (class)") Wrapper for mysql module. A simplified API for MySQL database operations.
- [TableComposer (class)](https://github.com/fandisus/node_trust/blob/master/src/TableComposer.md "TableComposer (class)") DDL SQL Builder. No Dependencies. Support PostgreSQL and MySQL syntaxes.
- [Model (abstract class)](https://github.com/fandisus/node_trust/blob/master/src/Model.md "Model (abstract class)") Model for simple ORM.
- [DataCommunicator (generic class)](https://github.com/fandisus/node_trust/blob/master/src/DataCommunicator.md "DataCommunicator (generic class)") Simple class for transfering Model to and from database. 
- [Files (static class)](https://github.com/fandisus/node_trust/blob/master/src/Files.md "Files (class)") Wrapper for fs-extra and path module.
- [Basics (static class)](https://github.com/fandisus/node_trust/blob/master/src/Basics.md "Basics (class)") Right now only have static function getDiff to get difference between two objects
- [Crypter (object)](https://github.com/fandisus/node_trust/blob/master/src/Crypter.md "Crypter (object)") Wrapper for NodeJS crypto module.
- [JSONResponse (object)](https://github.com/fandisus/node_trust/blob/master/src/JSONResponse.md "JSONResponse (object)") Just a simple JSON Object generator, designed to be used as JSON response of POST request.

Other docs are still on the way. Please be patient.