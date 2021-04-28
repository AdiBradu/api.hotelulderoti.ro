const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBServiceOrderModel {
  tableName = 'service_orders';
  
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

  create = async ({partner_id, vehicle_id, fleet_id, vehicle_mileage, order_total_partner, order_total_fleet, created = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (partner_id, vehicle_id, fleet_id, vehicle_mileage, order_total_partner, order_total_fleet, created) VALUES (?,?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [partner_id, vehicle_id, fleet_id, vehicle_mileage, order_total_partner, order_total_fleet, created]);
    const lastOrderInsId = result ? result.insertId : 0;

    return lastOrderInsId;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE so_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE so_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBServiceOrderModel;