const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBVehicleModel {
  tableName = 'vehicles';
  
  constructor(query) {
    this._query = query;
  }

  find = async (params = {}) => {
    let sql = `SELECT v_id, reg_number, vehicle_milage, vehicle_type FROM ${this.tableName} `;

    if(!Object.keys(params).length) {
      return await this._query(sql);
    }

    const keys = Object.keys(params);
    const values = Object.values(params);
    const columnSet = keys.map(key => `${key} = ?`).join(' AND '); 
    
    sql += ` WHERE ${columnSet}`;
    sql += ` ORDER BY created DESC `;  
    return await this._query(sql, [...values]);
  }

  findOne = async (params) => {
    const { columnSet, values } = multipleColumnSet(params);
    const sql = `SELECT * FROM ${this.tableName}
                 WHERE ${columnSet}`;
    
    const result = await this._query(sql, [...values]);
    
    return result[0];
  }
  
  checkVehicleWriteAccess = async (id, userId, userRole) => {
    let hasAccess = false;
    let accessSql;
    let accessRes;
    if(userRole == 1) {
      hasAccess = true;
    } else if(userRole == 2) {
      accessSql = `SELECT safa_id 
                      FROM sales_agent_fleet_assignment 
                      LEFT JOIN vehicles ON sales_agent_fleet_assignment.fleet_id = vehicles.fleet_id
                      WHERE sales_agent_fleet_assignment.sales_agent_id = ? AND sales_agent_fleet_assignment.active = 1 AND vehicles.v_id = ? `;
      accessRes = await this._query(accessSql, [userId,id]);
      if(accessRes &&  accessRes.length) {
        hasAccess = true;  
      }
    } else if(userRole == 3) {
      accessSql = `SELECT fi_id 
                      FROM fleet_info 
                      LEFT JOIN vehicles ON fleet_info.fi_id = vehicles.fleet_id
                      WHERE fleet_info.user_id = ? AND vehicles.v_id = ? `;
      accessRes = await this._query(accessSql, [userId,id]);     
      if(accessRes && accessRes.length) {
        hasAccess = true;  
      }
    }
    return hasAccess;
  }

  getVehicleWithTires = async id => {



    const sql = `SELECT vehicle_tire_count, reg_number, vehicle_brand, vehicle_model, vehicle_type, vehicle_milage 
                 FROM ${this.tableName} 
                 WHERE v_id = ? `;  
    const result = await this._query(sql, [id]);
    if(!result || result.length < 1) {
      return {}
    }
    
    const sqlVTires = `SELECT * 
                      FROM tires
                      WHERE vehicle_id =  ? 
                      ORDER BY tire_position ASC
                      `;
    const resVTires = await this._query(sqlVTires, [id]);
    if(!resVTires || resVTires.length < 1) {
      return {}
    }

    let vWithTires = {
      vehicleId: id,
      fleetId: result[0].fleet_id,
      regNumber : result[0].reg_number,
      old_vehicle_tire_count: result[0].vehicle_tire_count,
      vehicle_tire_count: result[0].vehicle_tire_count,
      vechicleBrand: result[0].vehicle_brand,
      vechicleModel: result[0].vehicle_model,
      vehicleType:  result[0].vehicle_type,
      vechicleMilage : result[0].vehicle_milage,
      vehicleTires: {
        tireIds: [resVTires[0].t_id,resVTires[1].t_id,resVTires[2].t_id,resVTires[3].t_id,resVTires[4] ? resVTires[4].t_id : 0,resVTires[5] ? resVTires[5].t_id : 0],
        widths: [resVTires[0].tire_width.toString(),resVTires[1].tire_width.toString(),resVTires[2].tire_width.toString(),resVTires[3].tire_width.toString(),resVTires[4]?.tire_width ? resVTires[4]?.tire_width.toString() : "1", resVTires[5]?.tire_width ? resVTires[5].tire_width.toString() : "1"], 
        heights: [resVTires[0].tire_height.toString(),resVTires[1].tire_height.toString(),resVTires[2].tire_height.toString(),resVTires[3].tire_height.toString(),resVTires[4]?.tire_height ? resVTires[4].tire_height.toString() : "1",resVTires[5]?.tire_height ? resVTires[5].tire_height.toString() : "1"], 
        diameters: [resVTires[0].tire_diameter.toString(),resVTires[1].tire_diameter.toString(),resVTires[2].tire_diameter.toString(),resVTires[3].tire_diameter.toString(),resVTires[4]?.tire_diameter ? resVTires[4].tire_diameter.toString() : "1",resVTires[5]?.tire_diameter ? resVTires[5].tire_diameter.toString() : "1"], 
        speedIndexes: [resVTires[0].tire_speed_index.toString(),resVTires[1].tire_speed_index.toString(),resVTires[2].tire_speed_index.toString(),resVTires[3].tire_speed_index.toString(),resVTires[4]?.tire_speed_index ? resVTires[4].tire_speed_index.toString() : "1",resVTires[5]?.tire_speed_index ? resVTires[5].tire_speed_index.toString() : "1"], 
        loadIndexes: [resVTires[0].tire_load_index.toString(),resVTires[1].tire_load_index.toString(),resVTires[2].tire_load_index.toString(),resVTires[3].tire_load_index.toString(),resVTires[4]?.tire_load_index ? resVTires[4].tire_load_index.toString() : "1",resVTires[5]?.tire_load_index ? resVTires[5].tire_load_index.toString() : "1"], 
        brands: [resVTires[0].tire_brand.toString(),resVTires[1].tire_brand.toString(),resVTires[2].tire_brand.toString(),resVTires[3].tire_brand.toString(),resVTires[4]?.tire_brand ? resVTires[4].tire_brand.toString() : "1",resVTires[5]?.tire_brand ? resVTires[5].tire_brand.toString() : "1"], 
        models: [resVTires[0].tire_model,resVTires[1].tire_model,resVTires[2].tire_model,resVTires[3].tire_model,resVTires[4]?.tire_model ? resVTires[4].tire_model : "",resVTires[5]?.tire_model ? resVTires[5].tire_model : ""], 
        seasons: [resVTires[0].tire_season,resVTires[1].tire_season,resVTires[2].tire_season,resVTires[3].tire_season,resVTires[4]?.tire_season ? resVTires[4].tire_season : "Iarna",resVTires[5]?.tire_season ? resVTires[5].tire_season : "Iarna"], 
        dots: [resVTires[0].tire_dot,resVTires[1].tire_dot,resVTires[2].tire_dot,resVTires[3].tire_dot,resVTires[4]?.tire_dot ? resVTires[4].tire_dot : "",resVTires[5]?.tire_dot ? resVTires[5].tire_dot : ""], 
        rims: [resVTires[0].tire_rim.toString(),resVTires[1].tire_rim.toString(),resVTires[2].tire_rim.toString(),resVTires[3].tire_rim.toString(),resVTires[4]?.tire_rim ? resVTires[4].tire_rim.toString() : "1",resVTires[5]?.tire_rim ? resVTires[5].tire_rim.toString() : "1"], 
        treadUsages: [resVTires[0].tire_tread_wear.toFixed(1),resVTires[1].tire_tread_wear.toFixed(1),resVTires[2].tire_tread_wear.toFixed(1),resVTires[3].tire_tread_wear.toFixed(1),resVTires[4]?.tire_tread_wear ? resVTires[4].tire_tread_wear.toFixed(1) : "0.0",resVTires[5]?.tire_tread_wear ? resVTires[5].tire_tread_wear.toFixed(1) : "0.0"] 
      }
    }

    return vWithTires;

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

  updateWithTires = async (params, id) => {

    let values = [params.vehicle_tire_count,params.regNumber,params.vechicleBrand,params.vechicleModel,params.vehicleType,params.vechicleMilage]

    const sql = `UPDATE ${this.tableName} SET vehicle_tire_count = ? , reg_number = ? , vehicle_brand = ? , vehicle_model = ? , vehicle_type = ? , vehicle_milage = ? WHERE v_id = ? `;
    const result = await this._query(sql, [...values, id]);
    
    //vehicle tires update
    for(let i=0; i<params.vehicle_tire_count; i++) {
      if(params.vehicleTires.tireIds[i] !== 0) {
        let tireUpdVals = [parseInt(params.vehicleTires.widths[i]),parseInt(params.vehicleTires.heights[i]),parseInt(params.vehicleTires.diameters[i]), parseInt(params.vehicleTires.speedIndexes[i]),parseInt(params.vehicleTires.loadIndexes[i]),parseInt(params.vehicleTires.brands[i]), params.vehicleTires.models[i],params.vehicleTires.seasons[i],params.vehicleTires.dots[i], parseInt(params.vehicleTires.rims[i]),parseFloat(params.vehicleTires.treadUsages[i]),Date.now()]
        let sqlTireUpd = `UPDATE tires SET tire_width = ? , tire_height = ? , tire_diameter = ? , tire_speed_index = ? , tire_load_index = ? , tire_brand = ? , tire_model = ? , tire_season = ? , tire_dot = ? , tire_rim = ? , tire_tread_wear = ? , updated = ? WHERE vehicle_id = ? AND t_id = ?`;
        let resUpd = await this._query(sqlTireUpd, [...tireUpdVals, id, params.vehicleTires.tireIds[i]]);
      } else {
        let sqlIns = `INSERT INTO tires
                    (vehicle_id, fleet_id, tire_position, tire_width, tire_height, tire_diameter, tire_speed_index, tire_load_index, tire_brand, tire_model, tire_season, tire_dot, tire_rim, tire_tread_wear, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
   
        let resTireIns = await this._query(sqlIns, [id, parseInt(params.fleetId), parseInt(i+1), parseInt(params.vehicleTires.widths[i]),parseInt(params.vehicleTires.heights[i]),parseInt(params.vehicleTires.diameters[i]), parseInt(params.vehicleTires.speedIndexes[i]),parseInt(params.vehicleTires.loadIndexes[i]),parseInt(params.vehicleTires.brands[i]), params.vehicleTires.models[i],params.vehicleTires.seasons[i],params.vehicleTires.dots[i], parseInt(params.vehicleTires.rims[i]),parseFloat(params.vehicleTires.treadUsages[i]), Date.now(), Date.now()]);
        let lastTireInsId = resTireIns ? resTireIns.insertId : 0;
      }
    }

    if(params.vehicle_tire_count < params.old_vehicle_tire_count) {
      let sqlDel = `DELETE FROM tires WHERE t_id IN ( ? , ?) `;
      let resultDel = await this._query(sqlDel, [params.vehicleTires.tireIds[4], params.vehicleTires.tireIds[5]]);
      let affectedRowsDel = resultDel ? resultDel.affectedRows : 0;  
    }
    

    return result;
  }

  agentDelete = async (id, userId) => {    
    const accessSql = `SELECT safa_id 
                      FROM sales_agent_fleet_assignment 
                      LEFT JOIN vehicles ON sales_agent_fleet_assignment.fleet_id = vehicles.fleet_id
                      WHERE sales_agent_fleet_assignment.sales_agent_id = ? AND sales_agent_fleet_assignment.active = 1 AND vehicles.v_id = ? `;
    const accessRes = await this._query(accessSql, [userId,id]);                   
    if(accessRes && accessRes.length > 0) {
      //service orders and details vehicle related delete
      const sqlOrders = `DELETE service_orders, service_orders_details FROM service_orders
                  INNER JOIN
                  service_orders_details ON service_orders_details.service_order_id = service_orders.so_id 
                  WHERE service_orders.vehicle_id  = ?`;
      const resOrders = await this._query(sqlOrders, [id]);
      
      //vehicle and related tires delete
      const sql = `DELETE vehicles, tires FROM vehicles
                  INNER JOIN
                  tires ON tires.vehicle_id = vehicles.v_id 
                  WHERE vehicles.v_id  = ?`;
      const result = await this._query(sql, [id]);
      let affectedRows = result ? result.affectedRows : 0;

      return affectedRows;
    } else {
      return 0;
    }
  }

  fleetUserDelete = async(id, userId) => {
    const accessSql = `SELECT fi_id 
                      FROM fleet_info 
                      LEFT JOIN vehicles ON fleet_info.fi_id = vehicles.fleet_id
                      WHERE fleet_info.user_id = ? AND vehicles.v_id = ? `;
    const accessRes = await this._query(accessSql, [userId,id]);                   
    if(accessRes && accessRes.length > 0) {
      //service orders and details vehicle related delete
      const sqlOrders = `DELETE service_orders, service_orders_details FROM service_orders
                  INNER JOIN
                  service_orders_details ON service_orders_details.service_order_id = service_orders.so_id 
                  WHERE service_orders.vehicle_id  = ?`;
      const resOrders = await this._query(sqlOrders, [id]);
      
      //vehicle and related tires delete
      const sql = `DELETE vehicles, tires FROM vehicles
                  INNER JOIN
                  tires ON tires.vehicle_id = vehicles.v_id 
                  WHERE vehicles.v_id  = ?`;
      const result = await this._query(sql, [id]);
      let affectedRows = result ? result.affectedRows : 0;

      return affectedRows;
    } else {
      return 0;
    }  
  }

  delete = async (id) => {
    const sqlOrders = `DELETE service_orders, service_orders_details FROM service_orders
                  INNER JOIN
                  service_orders_details ON service_orders_details.service_order_id = service_orders.so_id 
                  WHERE service_orders.vehicle_id  = ?`;
    const resOrders = await this._query(sqlOrders, [id]);
    const sql = `DELETE vehicles, tires FROM vehicles
      	         INNER JOIN
                 tires ON tires.vehicle_id = vehicles.v_id 
                 WHERE vehicles.v_id  = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBVehicleModel;