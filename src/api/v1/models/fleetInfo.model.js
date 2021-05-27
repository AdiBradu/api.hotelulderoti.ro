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

    const keys = Object.keys(params);
    const values = Object.values(params);
    const columnSet = keys.map(key => `${key} = ?`).join(' AND '); 
    
    sql += ` WHERE ${columnSet}`;

    return await this._query(sql, [...values]);
  }


  getWithUserDataByUId = async id => {
    const sql = `SELECT users.email, users.first_name, users.last_name, users.phone, fleet_info.fleet_name, fleet_info.fleet_gov_id, fleet_info.fleet_j, fleet_info.fleet_address, fleet_info.fleet_region, fleet_info.fleet_city 
                FROM fleet_info LEFT JOIN users ON fleet_info.user_id = users.u_id
                WHERE fleet_info.user_id = ?`;
    const result = await this._query(sql, [id]);
    return result[0];
  }

  getWithUserDataByFleetId = async id => {
    const sql = `SELECT users.email, users.first_name, users.last_name, users.phone, fleet_info.fleet_name, fleet_info.fleet_gov_id, fleet_info.fleet_j, fleet_info.fleet_address, fleet_info.fleet_region, fleet_info.fleet_city, fleet_info.fleet_percent  
                FROM fleet_info LEFT JOIN users ON fleet_info.user_id = users.u_id
                WHERE fleet_info.fi_id = ?`;
    const result = await this._query(sql, [id]);
    return result[0];
  }

  agentGetWithUserDataByFleetId = async (userId, id) => {
    const sql = `SELECT users.email, users.first_name, users.last_name, users.phone, fleet_info.fleet_name, fleet_info.fleet_gov_id, fleet_info.fleet_j, fleet_info.fleet_address, fleet_info.fleet_region, fleet_info.fleet_city, fleet_info.fleet_percent  
                FROM fleet_info 
                LEFT JOIN users ON fleet_info.user_id = users.u_id 
                LEFT JOIN sales_agent_fleet_assignment ON fleet_info.fi_id = sales_agent_fleet_assignment.fleet_id
                WHERE (sales_agent_fleet_assignment.sales_agent_id = ? AND sales_agent_fleet_assignment.active = 1) AND fleet_info.fi_id = ?`;
    const result = await this._query(sql, [userId, id]);
    return result[0];
  }
 
  search = async (customWhereQueryString, searchParams) => {
    let sql = `SELECT fleet_info.fi_id, fleet_info.fleet_name, fleet_info.fleet_region, 
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id) AS vehiclesCount, 
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id) AS tiresCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (12 - tire_tread_wear) <= 3) AS excessiveUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND ((12 - tire_tread_wear) > 3 AND (12 - tire_tread_wear) < 5)) AS mediumUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (12 - tire_tread_wear) > 5) AS noUsageTires,
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "TURISM") as fleetTurismCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "TURISM")) as fleetTurismTireCount,
      (SELECT COUNT(DISTINCT tire_width, tire_height, tire_diameter) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "TURISM")) as fleetTurismSizesCount,      
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "SUV") as fleetSuvCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "SUV")) as fleetSuvTireCount,
      (SELECT COUNT(DISTINCT tire_width, tire_height, tire_diameter) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "SUV")) as fleetSuvSizesCount,
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "CARGO") as fleetCargoCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "CARGO")) as fleetCargoTireCount,
      (SELECT COUNT(DISTINCT tire_width, tire_height, tire_diameter) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "CARGO")) as fleetCargoSizesCount

      FROM ${this.tableName}`;

    sql += ` WHERE ${customWhereQueryString}`;
   
    return await this._query(sql, searchParams);
  }


  agentSearch = async (customWhereQueryString, searchParams) => {
    let sql = `SELECT fleet_info.fi_id, fleet_info.fleet_name, fleet_info.fleet_region, 
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id) AS vehiclesCount, 
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id) AS tiresCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (12 - tire_tread_wear) <= 3) AS excessiveUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND ((12 - tire_tread_wear) > 3 AND (12 - tire_tread_wear) < 5)) AS mediumUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (12 - tire_tread_wear) > 5) AS noUsageTires,
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "TURISM") as fleetTurismCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "TURISM")) as fleetTurismTireCount,
      (SELECT COUNT(DISTINCT tire_width, tire_height, tire_diameter) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "TURISM")) as fleetTurismSizesCount,      
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "SUV") as fleetSuvCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "SUV")) as fleetSuvTireCount,
      (SELECT COUNT(DISTINCT tire_width, tire_height, tire_diameter) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "SUV")) as fleetSuvSizesCount,
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "CARGO") as fleetCargoCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "CARGO")) as fleetCargoTireCount,
      (SELECT COUNT(DISTINCT tire_width, tire_height, tire_diameter) FROM tires WHERE fleet_id = fleet_info.fi_id AND vehicle_id IN (SELECT v_id FROM vehicles WHERE fleet_id = fleet_info.fi_id AND vehicle_type = "CARGO")) as fleetCargoSizesCount

      FROM ${this.tableName}
      LEFT JOIN sales_agent_fleet_assignment ON ${this.tableName}.fi_id = sales_agent_fleet_assignment.fleet_id
      WHERE (sales_agent_fleet_assignment.sales_agent_id = ? AND sales_agent_fleet_assignment.active = 1)  ${customWhereQueryString}`;
   
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


  getAllFleets = async () => {
    let sql = `SELECT fleet_info.fi_id, fleet_info.fleet_name, fleet_info.fleet_region, 
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id) AS vehiclesCount, 
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id) AS tiresCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (12 - tire_tread_wear) <= 3) AS excessiveUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND ((12 - tire_tread_wear) > 3 AND (12 - tire_tread_wear) < 5)) AS mediumUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (12 - tire_tread_wear) > 5) AS noUsageTires

      FROM ${this.tableName}`;
   
    return await this._query(sql);
    
  }


  getAgentFleets = async (agentId) => {
    let sql = `SELECT ${this.tableName}.fi_id, ${this.tableName}.fleet_name, ${this.tableName}.fleet_region, 
      (SELECT COUNT(v_id) FROM vehicles WHERE fleet_id = fleet_info.fi_id) AS vehiclesCount, 
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id) AS tiresCount,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (12 - tire_tread_wear) <= 3) AS excessiveUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND ((12 - tire_tread_wear) > 3 AND (12 - tire_tread_wear) < 5)) AS mediumUsageTires,
      (SELECT COUNT(t_id) FROM tires WHERE fleet_id = fleet_info.fi_id AND (12 - tire_tread_wear) > 5) AS noUsageTires

      FROM ${this.tableName}
      LEFT JOIN sales_agent_fleet_assignment ON ${this.tableName}.fi_id = sales_agent_fleet_assignment.fleet_id
      WHERE sales_agent_fleet_assignment.sales_agent_id = ? AND sales_agent_fleet_assignment.active = 1
      `;
   
    return await this._query(sql, [agentId]);
    
  }

  getDistinctFleetsRegions = async () => {
    let sql = `SELECT DISTINCT(fleet_region) FROM ${this.tableName} ORDER BY fleet_region ASC`;
    return await this._query(sql);
  }


  checkFleetWriteAccess = async (id, userId, userRole) => {
    let hasAccess = false;
    let accessSql;
    let accessRes;
    if(userRole === 1) {
      hasAccess = true;
    } else if(userRole === 2) {      
      accessSql = `SELECT safa_id 
                      FROM sales_agent_fleet_assignment 
                      WHERE sales_agent_fleet_assignment.sales_agent_id = ? AND sales_agent_fleet_assignment.active = 1 AND sales_agent_fleet_assignment.fleet_id = ? `;
      accessRes = await this._query(accessSql, [userId,id]);
      if(accessRes &&  accessRes.length) {
        hasAccess = true;  
      }
    } else if(userRole === 3) {
      accessSql = `SELECT fi_id 
                      FROM fleet_info 
                      WHERE user_id = ? AND fi_id = ? `;
      accessRes = await this._query(accessSql, [userId,id]);     
      if(accessRes && accessRes.length) {
        hasAccess = true;  
      }
    }
    return hasAccess;
  }

  findOne = async (params) => {
    const { columnSet, values } = multipleColumnSet(params);
    const sql = `SELECT * FROM ${this.tableName}
                 WHERE ${columnSet}`;
    
    const result = await this._query(sql, [...values]);
    
    return result[0];
  }

  create = async ({user_id, fleet_name, fleet_gov_id, fleet_j, fleet_address, fleet_region, fleet_city, fleet_percent=20, created = Date.now(), updated = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (user_id, fleet_name, fleet_gov_id, fleet_j, fleet_address, fleet_region, fleet_city, fleet_percent, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [user_id, fleet_name, fleet_gov_id, fleet_j, fleet_address, fleet_region, fleet_city, fleet_percent, created, updated]);
    const lastFleetInsId = result ? result.insertId : 0;

    return lastFleetInsId;
  }


  updateFleetByUId = async (params, id) => {

    let uVals = [params.email,params.first_name,params.last_name,params.phone];
    
    let sql = `UPDATE fleet_info, users `;
    sql += ` SET users.email = ? , users.first_name = ? , users.last_name = ? , users.phone = ? `;
    if(params.password) {
      sql += ` , users.password = ? `;  
      uVals = [...uVals, params.password];
    }

    let fVals = [params.fleet_name,params.fleet_gov_id,params.fleet_j,params.fleet_address,params.fleet_region,params.fleet_city];
    sql += ` , fleet_info.fleet_name = ? , fleet_info.fleet_gov_id = ? , fleet_info.fleet_j = ? , fleet_info.fleet_address = ? , fleet_info.fleet_region = ? , fleet_info.fleet_city = ? 
              WHERE fleet_info.user_id = users.u_id AND fleet_info.user_id = ? `;
    let updVals = [...uVals, ...fVals];
    
    const result = await this._query(sql, [...updVals, id]);
  
    return result;
  }


  updateFleet = async (params, id) => {

    let uVals = [params.email,params.first_name,params.last_name,params.phone];
    
    let sql = `UPDATE fleet_info, users `;
    sql += ` SET users.email = ? , users.first_name = ? , users.last_name = ? , users.phone = ? `;
    if(params.password) {
      sql += ` , users.password = ? `;  
      uVals = [...uVals, params.password];
    }
   
    let fVals = [params.fleet_name,params.fleet_gov_id,params.fleet_j,params.fleet_address,params.fleet_region,params.fleet_city,parseFloat(params.fleet_percent.replace(",", ".")).toFixed(2)];
    sql += ` , fleet_info.fleet_name = ? , fleet_info.fleet_gov_id = ? , fleet_info.fleet_j = ? , fleet_info.fleet_address = ? , fleet_info.fleet_region = ? , fleet_info.fleet_city = ? , fleet_info.fleet_percent = ?  
              WHERE fleet_info.user_id = users.u_id AND fleet_info.fi_id = ? `;
    let updVals = [...uVals, ...fVals];
    
    const result = await this._query(sql, [...updVals, id]);
  
    return result;
  }


  agentUpdateFleet = async (params, id) => {

    let uVals = [params.email,params.first_name,params.last_name,params.phone];
    
    let sql = `UPDATE fleet_info, users `;
    sql += ` SET users.email = ? , users.first_name = ? , users.last_name = ? , users.phone = ? `;
    if(params.password) {
      sql += ` , users.password = ? `;  
      uVals = [...uVals, params.password];
    }
   
    let fVals = [params.fleet_name,params.fleet_gov_id,params.fleet_j,params.fleet_address,params.fleet_region,params.fleet_city];
    sql += ` , fleet_info.fleet_name = ? , fleet_info.fleet_gov_id = ? , fleet_info.fleet_j = ? , fleet_info.fleet_address = ? , fleet_info.fleet_region = ? , fleet_info.fleet_city = ?   
              WHERE fleet_info.user_id = users.u_id AND fleet_info.fi_id = ? `;
    let updVals = [...uVals, ...fVals];
    
    const result = await this._query(sql, [...updVals, id]);
  
    return result;
  }



  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE fi_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  delete = async (id) => {

    //vehicles
    const sqlVehicles = `DELETE FROM vehicles WHERE fleet_id  = ?`;
    const resVehicles = await this._query(sqlVehicles, [id]);

    //tires
    const sqlTires = `DELETE FROM tires WHERE fleet_id  = ?`;
    const resTires = await this._query(sqlTires, [id]);

    //service orders and details related to the fleet delete
    const sqlOrders = `DELETE service_orders, service_orders_details FROM service_orders
    INNER JOIN
    service_orders_details ON service_orders_details.service_order_id = service_orders.so_id 
    WHERE service_orders.fleet_id  = ?`;
    const resOrders = await this._query(sqlOrders, [id]);

    //fleet and related user info delete
    const sql = `DELETE fleet_info, users FROM fleet_info
    INNER JOIN
    users ON users.u_id = fleet_info.user_id 
    WHERE fleet_info.fi_id  = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

  agentDelete = async (id, userId) => {    
    const accessSql = `SELECT safa_id 
                      FROM sales_agent_fleet_assignment 
                      WHERE sales_agent_fleet_assignment.sales_agent_id = ? AND sales_agent_fleet_assignment.active = 1 AND sales_agent_fleet_assignment.fleet_id = ? `;
    const accessRes = await this._query(accessSql, [userId,id]);                   
    if(accessRes && accessRes.length > 0) {
      //vehicles
      const sqlVehicles = `DELETE FROM vehicles WHERE fleet_id  = ?`;
      const resVehicles = await this._query(sqlVehicles, [id]);

      //tires
      const sqlTires = `DELETE FROM tires WHERE fleet_id  = ?`;
      const resTires = await this._query(sqlTires, [id]);

      //service orders and details related to the fleet delete
      const sqlOrders = `DELETE service_orders, service_orders_details FROM service_orders
      INNER JOIN
      service_orders_details ON service_orders_details.service_order_id = service_orders.so_id 
      WHERE service_orders.fleet_id  = ?`;
      const resOrders = await this._query(sqlOrders, [id]);

      //fleet and related user info delete
      const sql = `DELETE fleet_info, users FROM fleet_info
      INNER JOIN
      users ON users.u_id = fleet_info.user_id 
      WHERE fleet_info.fi_id  = ?`;
      const result = await this._query(sql, [id]);
      const affectedRows = result ? result.affectedRows : 0;

      return affectedRows;
    } else {
      return 0;
    }
  }

}

module.exports = DBFleetInfoModel;