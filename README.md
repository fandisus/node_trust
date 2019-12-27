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
- [Files (static class)](https://github.com/fandisus/node_trust/blob/master/src/Files.md "Files (class)") Wrapper for fs-extra and path module.
- [Basics (static class)](https://github.com/fandisus/node_trust/blob/master/src/Basics.md "Basics (class)") Right now only have static function getDiff to get difference between two objects
- [Crypter (object)](https://github.com/fandisus/node_trust/blob/master/src/Crypter.md "Crypter (object)") Wrapper for NodeJS crypto module

Other docs are still on the way. Please be patient.