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
    let sql = `SELECT DISTINCT(fleet_region) FROM ${this.tableName}`;
    return await this._query(sql);
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