# Model
Abstract class for creating Business Model Objects. Designed to be used with the DataCommunicator class.

For usage with DataCommunicator class, see [DataCommunicator documentation](https://github.com/fandisus/node_trust/blob/master/src/DataCommunicator.md "DataCommunicator documentation").

This class is not perfect yet. Perhaps one or two eternity later, might update so it can support relationship tables.

### Guidelines
When create new descendant class, must implement the following methods:
- `tableName()` the database table name
- `PK()` the primary keys of the table, in array format
- `hasSerial()` if primary key is SERIAL (or AUTO_INCREMENT when MySQL supported later)
if the class hasSerial() returns true, after insert using DataCommunicator, new id will be assigned to the object. If primary key is something other than SERIAL and BIGSERIAL, such as VARCHAR or DATE, just return false for this hasSerial() method.

After implementing, must create constructor:
```javascript
constructor(obj:any = {}) {
  super();
  this.cloneFrom(obj);
}
```
The constructor must support empty parameters.

Lastly, write properties of the class which must exactly the same the columns in database table. Each of the properties also must have default value.

When creating properties that are not columns of database, put underscore `_` as the first character of the database, so that those properties (supposedly) won't go to the insert or update syntax.

But feel free to add any methods, static methods, or static properties.

When want to update data, must get data using `DataCommunicator.find()` method. Otherwise, must call `fillOldVals()` method before update, so `DataCommunicator` can detect which property got changed.

### Example
Defining the class
```javascript
import {Model} from '@icfm/trust';
import {Crypter} from '@icfm/trust';
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
}

export default Salesman;
```
Creating new instance:
```javascript
import Salesman from './models/Salesman';

let oSalesman = new Salesman();
let name = 'Fandi';
oSalesman.username = name;
oSalesman.password = Salesman.hashPassword('12345');
oSalesman.biodata = { name: name, phone:'011-222-333'};
// ------- OR ------------
let otherSalesman = new Salesman({
  username:'Susanto',
  password:Salesman.hashPassword('7890'),
  biodata:{ name: 'Susanto', phone: '000-111-222'}
});
```
