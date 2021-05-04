const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBUserModel {
  tableName = 'users';
  
  constructor(query) {
    this._query = query;
  }

  find = async (params = {}) => {
    let sql = `SELECT * FROM ${this.tableName}`;

    if(!Object.keys(params).length) {
      return await this._query(sql);
    }

    const { columnSet, values } = multipleColumnSet(params);
    sql += ` WHERE ${columnSet}`;

    return await this._query(sql, [...values]);
  }

  findOne = async (params) => {
    const { columnSet, values } = multipleColumnSet(params);
    const sql = `SELECT * FROM ${this.tableName}
                 WHERE ${columnSet}`;
    
    const result = await this._query(sql, [...values]);
    
    return result[0];
  }

  create = async ({user_type = 0, email, first_name='', last_name='', phone='', password, created_by=0, created = Date.now(), updated = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (user_type, email, first_name, last_name, phone, password, created_by, created, updated) VALUES (?,?,?,?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [user_type, email, first_name, last_name, phone, password, created_by, created, updated]);
    const lastInsId = result ? result.insertId : 0;

    return lastInsId;
  }
  
  update = async (params, conds) => {
    const { columnSet, values } = multipleColumnSet(params);
    const condsColumnsAndValues = multipleColumnSet(conds);
    const columnSetWhere = condsColumnsAndValues.columnSet;
    const valuesWhere = condsColumnsAndValues.values;
    
    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE ${columnSetWhere} `;
    
    const result = await this._query(sql, [...values, ...valuesWhere]);
    
    return result;
  }

  delete = async (params) => {
    const { columnSet, values } = multipleColumnSet(params);
    const sql = `DELETE FROM ${this.tableName} WHERE ${columnSet}`;
    const result = await this._query(sql, [...values]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBUserModel;