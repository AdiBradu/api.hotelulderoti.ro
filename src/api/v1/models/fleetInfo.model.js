const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBFleetInfoModel {
  tableName = 'fleet_info';
  
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


  search = async (customWhereQueryString, searchParams) => {
    let sql = `SELECT fleet_info.fi_id, fleet_info.fleet_name, fleet_info.fleet_region, 
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id) AS vehiclesCount, 
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id) AS tiresCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND tire_tread_wear < 3) AS excessiveUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (tire_tread_wear > 3 AND tire_tread_wear < 5)) AS mediumUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND tire_tread_wear > 5) AS noUsageTires

      FROM ${this.tableName}`;

    sql += ` WHERE ${customWhereQueryString}`;
    sql += ` LIMIT 1`;
   
    return await this._query(sql, searchParams);
  }

  filterFleets = async (customWhereQueryString, searchParams) => {
    let sql = `SELECT fleet_info.fleet_name, fleet_info.fleet_region, 
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id) AS vehiclesCount, 
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id) AS tiresCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND tire_tread_wear < 3) AS excessiveUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (tire_tread_wear > 3 AND tire_tread_wear < 5)) AS mediumUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND tire_tread_wear > 5) AS noUsageTires

      FROM ${this.tableName}`;

    sql += ` WHERE ${customWhereQueryString}`;
   
    return await this._query(sql, searchParams);
    
  }




  findOne = async (params) => {
    const { columnSet, values } = multipleColumnSet(params);
    const sql = `SELECT * FROM ${this.tableName}
                 WHERE ${columnSet}`;
    
    const result = await this._query(sql, [...values]);
    
    return result[0];
  }

  create = async ({user_id, fleet_name, fleet_gov_id, fleet_j, fleet_address, fleet_region, fleet_city, created = Date.now(), updated = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (user_id, fleet_name, fleet_gov_id, fleet_j, fleet_address, fleet_region, fleet_city, created, updated) VALUES (?,?,?,?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [user_id, fleet_name, fleet_gov_id, fleet_j, fleet_address, fleet_region, fleet_city, created, updated]);
    const lastFleetInsId = result ? result.insertId : 0;

    return lastFleetInsId;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE fi_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE fi_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBFleetInfoModel;