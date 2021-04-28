const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBTireModel {
  tableName = 'tires';
  
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

  create = async ({vehicle_id, fleet_id, tire_position, tire_width, tire_height, tire_diameter, tire_speed_index, tire_load_index, tire_brand, tire_model, tire_season, tire_dot, tire_rim, tire_tread_wear, created = Date.now(), updated = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (vehicle_id, fleet_id, tire_position, tire_width, tire_height, tire_diameter, tire_speed_index, tire_load_index, tire_brand, tire_model, tire_season, tire_dot, tire_rim, tire_tread_wear, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [vehicle_id, fleet_id, tire_position, tire_width, tire_height, tire_diameter, tire_speed_index, tire_load_index, tire_brand, tire_model, tire_season, tire_dot, tire_rim, tire_tread_wear, created, updated]);
    const lastTireInsId = result ? result.insertId : 0;

    return lastTireInsId;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE t_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE t_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBTireModel;