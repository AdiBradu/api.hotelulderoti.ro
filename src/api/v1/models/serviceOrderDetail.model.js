const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBServiceOrderDetailModel {
  tableName = 'service_orders_details';
  
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

  create = async ({service_order_id, service_name, service_cost_partner, service_cost_fleet, created = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (service_order_id, service_name, service_cost_partner, service_cost_fleet, created) VALUES (?,?,?,?,?)`;
   
    const result = await this._query(sql, [service_order_id, service_name, service_cost_partner, service_cost_fleet, created]);
    const lastOrderDetailInsId = result ? result.insertId : 0;

    return lastOrderDetailInsId;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE sod_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE sod_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBServiceOrderDetailModel;