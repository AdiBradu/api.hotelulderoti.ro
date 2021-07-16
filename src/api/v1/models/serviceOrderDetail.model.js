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


  handleHotelService = async (vId, pId, hServiceType) => {
    let sqlVehicleTires = `SELECT * FROM tires WHERE vehicle_id = ? `;
    let resVTires = await this._query(sqlVehicleTires, [vId]);
    let newReqType;
    if(hServiceType === 1) { 
      newReqType = 2;
    } else if(hServiceType === 0) { 
      newReqType = 1;
    }

    const sqlReq = `INSERT INTO hotel_requests 
      (partner_id, vehicle_id, request_type, request_status, created, updated) VALUES (?,?,?,?,?,?)`;
    const result = await this._query(sqlReq, [pId, vId, newReqType, 0, Date.now(), Date.now()]);    
    const lastReqInsId = result ? result.insertId : 0;

    if(lastReqInsId > 0) {
      for (const [index, el] of resVTires.entries()) {  
        let sqlReqTire = `INSERT INTO hotel_requests_tires
        (request_id, vehicle_id, fleet_id, tire_position, tire_width, tire_height, tire_diameter, tire_speed_index, tire_load_index, tire_brand, tire_model, tire_season, tire_dot, tire_rim, tire_tread_wear, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        let resTire = await this._query(sqlReqTire, [lastReqInsId, el.vehicle_id, el.fleet_id, el.tire_position, el.tire_width, el.tire_height, el.tire_diameter, el.tire_speed_index, el.tire_load_index, el.tire_brand, el.tire_model, el.tire_season, el.tire_dot, el.tire_rim, el.tire_tread_wear, Date.now(), Date.now()]);  
      }
    }

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