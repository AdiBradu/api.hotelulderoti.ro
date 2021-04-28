const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBVehicleModel {
  tableName = 'vehicles';
  
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

  create = async ({fleet_id, vehicle_tire_count, reg_number, vehicle_brand, vehicle_model, vehicle_type, vehicle_milage, in_use=1, created = Date.now(), updated = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (fleet_id, vehicle_tire_count, reg_number, vehicle_brand, vehicle_model, vehicle_type, vehicle_milage, in_use, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [fleet_id, vehicle_tire_count, reg_number, vehicle_brand, vehicle_model, vehicle_type, vehicle_milage, in_use, created, updated]);
    const lastVehicleInsId = result ? result.insertId : 0;

    return lastVehicleInsId;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE v_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE v_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBVehicleModel;