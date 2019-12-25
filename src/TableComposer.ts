class TableComposer {
  public tableName: string;
  protected lastCol: string = '';
  protected columns: string[] = [];
  protected constraints: string[] = [];
  protected indexes: string[] = [];
  protected comments: string[] = [];
  static driver: string = 'pgsql';
  protected returner(colName: string): TableComposer {
    this.lastCol = colName;
    return this;
  }
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  public increments(colName: string): TableComposer {
    if (TableComposer.driver === 'pgsql') this.columns.push(`${colName} SERIAL`);
    else if (TableComposer.driver === 'mysql') this.columns.push(`${colName} INT AUTO_INCREMENT`);
    return this.returner(colName);
  }
  public bigIncrements(colName: string): TableComposer {
    if (TableComposer.driver === 'pgsql') this.columns.push(`${colName} BIGSERIAL`);
    else if (TableComposer.driver === 'mysql') this.columns.push(`${colName} BIGINT AUTO_INCREMENT`);
    return this.returner(colName);
  }
  public string(colName: string, length: number = 50): TableComposer {
    if (TableComposer.driver === 'pgsql') this.columns.push(`${colName} CHARACTER VARYING(${length})`);
    else if (TableComposer.driver === 'mysql') this.columns.push(`${colName} VARCHAR(${length})`);
    return this.returner(colName);
  }
  public text(colName: string): TableComposer {
    this.columns.push(`${colName} TEXT`);
    return this.returner(colName);
  }
  public integer(colName: string): TableComposer {
    if (TableComposer.driver === 'pgsql') this.columns.push(`${colName} INTEGER`);
    else if (TableComposer.driver === 'mysql') this.columns.push(`${colName} INT`);
    return this.returner(colName);
  }
  public bigInteger(colName: string): TableComposer {
    this.columns.push(`${colName} BIGINT`);
    return this.returner(colName);
  }
  public double(colName:string): TableComposer {
    if (TableComposer.driver === 'pgsql') this.columns.push(`${colName} DOUBLE PRECISION`);
    else if(TableComposer.driver === 'mysql') this.columns.push(`${colName} DOUBLE`);
    return this.returner(colName);
  }
  public numeric(colName:string, precision:number=19, scale:number=2): TableComposer {
    this.columns.push(`${colName} NUMERIC (${precision},${scale})`);
    return this.returner(colName);
  }
  public bool(colName:string): TableComposer {
    this.columns.push(`${colName} BOOL`);
    return this.returner(colName);
  }
  public timestamp(colName:string): TableComposer {
    if (TableComposer.driver === 'pgsql') this.columns.push(`${colName} TIMESTAMP`);
    else if (TableComposer.driver === 'mysql') this.columns.push(`${colName} DATETIME`);
    return this.returner(colName);
  }
  public date(colName:string): TableComposer {
    this.columns.push(`${colName} DATE`);
    return this.returner(colName);
  }
  public time(colName:string): TableComposer {
    this.columns.push(`${colName} TIME`);
    return this.returner(colName);
  }
  public jsonb(colName:string): TableComposer {
    if (TableComposer.driver === 'pgsql') this.columns.push(`${colName} JSONB`);
    else if (TableComposer.driver === 'mysql') this.columns.push(`${colName} JSON`);
    return this.returner(colName);
  }


  public notNull(): TableComposer {
    this.columns[this.columns.length -1] += ' NOT NULL';
    return this;
  }
  public unique(): TableComposer {
    var col = this.lastCol;
    this.constraints.push(`CONSTRAINT uq_${this.tableName}_${col} UNIQUE (${col})`);
    return this;
  }
  public multiUnique(...cols:string[]): TableComposer {
    var strName = `uq_${this.tableName}_${cols.join('_')}`;
    var strCols = cols.join(', ');
    this.constraints.push(`CONSTRAINT ${strName} UNIQUE (${strCols})`);
    return this;
  }
  public index(): TableComposer {
    var col = this.lastCol;
    if (TableComposer.driver === 'pgsql') this.indexes.push(`CREATE INDEX idx_${col}_${this.tableName} ON ${this.tableName} USING BTREE (${col});`);
    else if (TableComposer.driver === 'mysql') this.indexes.push(`CREATE INDEX idx_${col}_${this.tableName} ON ${this.tableName} (${col});`);
    return this;
  }
  public ginPropIndex(...props:string[]):TableComposer { //PostgreSQL only
    var col = this.lastCol;
    for (var p of props) {
      this.indexes.push(`CREATE INDEX idx_${p}_${col}_${this.tableName} ON ${this.tableName} USING GIN ((${col}->'${p}'));`);
    }
    return this;
  }
  public ginIndex():TableComposer { //PostgreSQL only
    var col = this.lastCol;
    this.indexes.push(`CREATE INDEX idx_${col}_${this.tableName} ON ${this.tableName} USING GIN (${col});`);
    return this;
  }
  public mysqlJsonIndex(props:any[]):TableComposer {
    var col = this.lastCol;
    ////props format: [{name:'name',type:'INT/VARCHAR(45)',path:'$.location.name'}]
    for (let p of props) {
      this.columns.push(`${col}_${p.name} ${p.type} AS ${col}->>"${p.path}"`);
      this.indexes.push(`CREATE INDEX idx_${col}_${p.name}_${this.tableName} ON ${this.tableName} (${col}_${p.name})`);
    }
    return this;
  }
  public primary(cols?:string[]):TableComposer {
    if (cols === undefined) cols = [this.lastCol];
    var strCols = cols.join(",");
    this.constraints.push(`CONSTRAINT pk_${this.tableName} PRIMARY KEY (${strCols})`);
    return this;
  }
  public foreign(ref:string, refCol:string, onUpdate:string='', onDelete:string=''):TableComposer {
    var col = this.lastCol;
    onUpdate = (onUpdate === '') ? ' ON UPDATE CASCADE' : ` ON UPDATE ${onUpdate}`;
    onDelete = (onDelete === '') ? ' ON DELETE CASCADE' : ` ON DELETE ${onDelete}`;
    this.constraints.push(`CONSTRAINT fk_${col}_${this.tableName} FOREIGN KEY (${col}) REFERENCES ${ref} (${refCol})${onUpdate}${onDelete}`);
    return this;
  }
  public multiForeign(cols:string[],ref:string,refCols:string[],onUpdate:string='',onDelete:string=''): TableComposer {
    var strCols = cols.join(",");
    var strRefCols = refCols.join(',');
    onUpdate = (onUpdate === '') ? ' ON UPDATE CASCADE' : ` ON UPDATE ${onUpdate}`;
    onDelete = (onDelete === '') ? ' ON DELETE CASCADE' : ` ON DELETE ${onDelete}`;
    this.constraints.push(`CONSTRAINT fk_${ref}_${this.tableName} FOREIGN KEY (${strCols}) REFERENCES ${ref} (${strRefCols})${onUpdate}${onDelete}`);
    return this;
  }
  public comment(arg1:string, arg2?:string):TableComposer {
    var theComment = (arg2 === undefined) ? arg1 : arg2;
    var col = (arg2 === undefined) ? this.lastCol : arg1;
    theComment = theComment.replace("'","''");
    this.comments.push(`COMMENT ON COLUMN ${this.tableName}.${col} IS '${theComment}'`);
    return this;
  }



  public parse(): string[] {
    var insides = this.columns.concat(this.constraints);
    var strInsides = insides.join(",\n");
    var comment = `-- Tabel ${this.tableName} --`;
    var dropper = `DROP TABLE IF EXISTS ${this.tableName} CASCADE;`;
    var creator = `CREATE TABLE ${this.tableName} (\n${strInsides}\n);`;
    return [comment, dropper, creator].concat(this.indexes, this.comments);
  }
}

export default TableComposer;