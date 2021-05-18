const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBServiceListModel {
  tableName = 'services_list';
  
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

  getVehicleAvailableServices = async(vType, tireDiameter) => {
    let sql = `SELECT services_list.sl_id, services_list.service_name
               FROM services_list 
               LEFT JOIN services_tire_diameter_assignment ON services_list.sl_id = services_tire_diameter_assignment.service_id
               WHERE services_list.service_vehicle_type = ?  AND  services_tire_diameter_assignment.tire_diameter = ? `;
    let result = await this._query(sql, [vType, tireDiameter]); 
    return result;
  }


 

}

module.exports = DBServiceListModel;