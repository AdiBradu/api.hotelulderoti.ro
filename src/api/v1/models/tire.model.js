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

  getOwnFleetTires = async(fleetId, uId, currentPage, pageLimit, vehicleTypeFilter, tiresWidthFilter, tiresHeightFilter, tiresDiameterFilter, tiresBrandFilter, tiresDotFilter, tiresSeasonFilter, tiresTreadUsageFilter, tiresTreadUsageMmFilter) => {
    let uSql = `SELECT fi_id FROM fleet_info WHERE user_id = ? `;
    let uResult = await this._query(uSql, [uId]); 
    let page = parseInt(currentPage);
    let limit = parseInt(pageLimit);
    let limitOffset = page * limit;   
    let queryParams = [fleetId];
    if(uResult && uResult.length) {
      let fleetTiresSql = `SELECT tires.t_id, tire_widths.width, tire_heights.height, tire_rims.rim AS diameter, tire_speed_indexes.speed_index, 
                          tire_load_indexes.load_index, tires.tire_season, tire_brands.brand, vehicles.vehicle_type, 
                          case 
                            when (12 - tires.tire_tread_wear) > 5 then "buna"
                            when (12 - tires.tire_tread_wear) <= 3 then "excesiva"
                            when (12 - tires.tire_tread_wear) > 3 AND (12 - tires.tire_tread_wear) < 5 then "medie"
                          end as tread_wear, tires.tire_tread_wear, tires.tire_dot      
                          FROM tires
                          LEFT JOIN tire_widths ON tires.tire_width = tire_widths.tw_id
                          LEFT JOIN tire_heights ON tires.tire_height = tire_heights.th_id 
                          LEFT JOIN tire_rims ON tires.tire_diameter = tire_rims.tr_id 
                          LEFT JOIN tire_speed_indexes ON tires.tire_speed_index = tire_speed_indexes.tsi_id 
                          LEFT JOIN tire_load_indexes ON tires.tire_load_index = tire_load_indexes.tli_id 
                          LEFT JOIN tire_brands ON tires.tire_brand = tire_brands.tb_id 
                          LEFT JOIN vehicles ON tires.vehicle_id = vehicles.v_id 

                          WHERE tires.fleet_id = ? `;
      if(vehicleTypeFilter) {
        fleetTiresSql += ` AND vehicles.vehicle_type = ? `; 
        queryParams.push(vehicleTypeFilter); 
      }                    
      if(tiresWidthFilter) {
        fleetTiresSql += ` AND tire_widths.width = ? `; 
        queryParams.push(tiresWidthFilter); 
      }
      if(tiresHeightFilter) {
        fleetTiresSql += ` AND tire_heights.height = ? `; 
        queryParams.push(tiresHeightFilter); 
      }      
      if(tiresDiameterFilter) {
        fleetTiresSql += ` AND tire_rims.rim = ? `; 
        queryParams.push(tiresDiameterFilter); 
      }
      if(tiresBrandFilter) {
        fleetTiresSql += ` AND tire_brands.brand = ? `; 
        queryParams.push(tiresBrandFilter); 
      }
      if(tiresDotFilter) {
        fleetTiresSql += ` AND tires.tire_dot = ? `; 
        queryParams.push(tiresDotFilter); 
      }
      if(tiresSeasonFilter) {
        fleetTiresSql += ` AND tires.tire_season = ? `; 
        queryParams.push(tiresSeasonFilter); 
      }
      if(tiresTreadUsageFilter) {
        if(tiresTreadUsageFilter === 'buna'){
          fleetTiresSql += ` AND (12 - tires.tire_tread_wear) > 5 `;
        } 
        if(tiresTreadUsageFilter === 'excesiva'){
          fleetTiresSql += ` AND (12 - tires.tire_tread_wear) <= 3 `;
        }
        if(tiresTreadUsageFilter === 'medie'){
          fleetTiresSql += ` AND (12 - tires.tire_tread_wear) > 3 AND (12 - tires.tire_tread_wear) < 5 `;
        }
      }
      if(tiresTreadUsageMmFilter) {
        fleetTiresSql += ` AND tires.tire_tread_wear = ? `; 
        queryParams.push(tiresTreadUsageMmFilter); 
      }                    
      fleetTiresSql += ` LIMIT ${limitOffset} , ${limit} `;                    
      let result = await this._query(fleetTiresSql, queryParams); 
      return result;
    } else {
      return null;
    }  
    
  }

  countFleetTiresByFleetId = async (fleetId, vehicleTypeFilter, tiresWidthFilter, tiresHeightFilter, tiresDiameterFilter, tiresBrandFilter, tiresDotFilter, tiresSeasonFilter, tiresTreadUsageFilter, tiresTreadUsageMmFilter) => {
    let queryParams = [fleetId];
    let sql = `SELECT COUNT(tires.t_id) AS tiresCount 
                    FROM tires 
                    LEFT JOIN tire_widths ON tires.tire_width = tire_widths.tw_id
                    LEFT JOIN tire_heights ON tires.tire_height = tire_heights.th_id 
                    LEFT JOIN tire_rims ON tires.tire_diameter = tire_rims.tr_id 
                    LEFT JOIN tire_speed_indexes ON tires.tire_speed_index = tire_speed_indexes.tsi_id 
                    LEFT JOIN tire_load_indexes ON tires.tire_load_index = tire_load_indexes.tli_id 
                    LEFT JOIN tire_brands ON tires.tire_brand = tire_brands.tb_id 
                    LEFT JOIN vehicles ON tires.vehicle_id = vehicles.v_id 
                    WHERE tires.fleet_id = ? `;
    if(vehicleTypeFilter) {
      sql += ` AND vehicles.vehicle_type = ? `; 
      queryParams.push(vehicleTypeFilter); 
    }                    
    if(tiresWidthFilter) {
      sql += ` AND tire_widths.width = ? `; 
      queryParams.push(tiresWidthFilter); 
    }
    if(tiresHeightFilter) {
      sql += ` AND tire_heights.height = ? `; 
      queryParams.push(tiresHeightFilter); 
    }      
    if(tiresDiameterFilter) {
      sql += ` AND tire_rims.rim = ? `; 
      queryParams.push(tiresDiameterFilter); 
    }
    if(tiresBrandFilter) {
      sql += ` AND tire_brands.brand = ? `; 
      queryParams.push(tiresBrandFilter); 
    }
    if(tiresDotFilter) {
      sql += ` AND tires.tire_dot = ? `; 
      queryParams.push(tiresDotFilter); 
    }
    if(tiresSeasonFilter) {
      sql += ` AND tires.tire_season = ? `; 
      queryParams.push(tiresSeasonFilter); 
    }
    if(tiresTreadUsageFilter) {
      if(tiresTreadUsageFilter === 'buna'){
        sql += ` AND (12 - tires.tire_tread_wear) > 5 `;
      } 
      if(tiresTreadUsageFilter === 'excesiva'){
        sql += ` AND (12 - tires.tire_tread_wear) <= 3 `;
      }
      if(tiresTreadUsageFilter === 'medie'){
        sql += ` AND (12 - tires.tire_tread_wear) > 3 AND (12 - tires.tire_tread_wear) < 5 `;
      }
    }
    if(tiresTreadUsageMmFilter) {
      sql += ` AND tires.tire_tread_wear = ? `; 
      queryParams.push(tiresTreadUsageMmFilter); 
    }
    let resCount = await this._query(sql, queryParams);                     
    return parseInt(resCount[0]?.tiresCount);
  }

  getFleetTiresFilters = async fleetId => {
    let sqlFilters = `SELECT DISTINCT tire_widths.width, tire_heights.height, tire_rims.rim AS diameter, tire_speed_indexes.speed_index, 
                      tire_load_indexes.load_index, tires.tire_season, tire_brands.brand, vehicles.vehicle_type, 
                      case 
                        when (12 - tires.tire_tread_wear) > 5 then "buna"
                        when (12 - tires.tire_tread_wear) <= 3 then "excesiva"
                        when (12 - tires.tire_tread_wear) > 3 AND (12 - tires.tire_tread_wear) < 5 then "medie"
                      end as tread_wear, tires.tire_tread_wear, tires.tire_dot      
                      FROM tires 
                      LEFT JOIN tire_widths ON tires.tire_width = tire_widths.tw_id
                      LEFT JOIN tire_heights ON tires.tire_height = tire_heights.th_id 
                      LEFT JOIN tire_rims ON tires.tire_diameter = tire_rims.tr_id 
                      LEFT JOIN tire_speed_indexes ON tires.tire_speed_index = tire_speed_indexes.tsi_id 
                      LEFT JOIN tire_load_indexes ON tires.tire_load_index = tire_load_indexes.tli_id 
                      LEFT JOIN tire_brands ON tires.tire_brand = tire_brands.tb_id 
                      LEFT JOIN vehicles ON tires.vehicle_id = vehicles.v_id 

                      WHERE tires.fleet_id = ? `;
    return await this._query(sqlFilters, [fleetId]); 
  }

  getFleetTiresByFleetId = async (fleetId, uId, uRole, currentPage, pageLimit, vehicleTypeFilter, tiresWidthFilter, tiresHeightFilter, tiresDiameterFilter, tiresBrandFilter, tiresDotFilter, tiresSeasonFilter, tiresTreadUsageFilter, tiresTreadUsageMmFilter) => {    
    let hasAccess = false;
    let page = parseInt(currentPage);
    let limit = parseInt(pageLimit);
    let limitOffset = page * limit;   
    let queryParams = [fleetId];

    if(uRole === 1) {
      hasAccess = true;
    } else if(uRole === 2) {
      let uSql = `SELECT safa_id FROM sales_agent_fleet_assignment WHERE fleet_id = ? AND sales_agent_id = ? AND active = 1`;
      let uResult = await this._query(uSql, [fleetId, uId]); 
      if(uResult && uResult.length) {
        hasAccess = true;
      }
    }
    if(hasAccess) {
      let fleetTiresSql = `SELECT tires.t_id, tire_widths.width, tire_heights.height, tire_rims.rim AS diameter, tire_speed_indexes.speed_index, 
                          tire_load_indexes.load_index, tires.tire_season, tire_brands.brand, vehicles.vehicle_type, 
                          case 
                            when (12 - tires.tire_tread_wear) > 5 then "buna"
                            when (12 - tires.tire_tread_wear) <= 3 then "excesiva"
                            when (12 - tires.tire_tread_wear) > 3 AND (12 - tires.tire_tread_wear) < 5 then "medie"
                          end as tread_wear, tires.tire_tread_wear, tires.tire_dot      
                          FROM tires
                          LEFT JOIN tire_widths ON tires.tire_width = tire_widths.tw_id
                          LEFT JOIN tire_heights ON tires.tire_height = tire_heights.th_id 
                          LEFT JOIN tire_rims ON tires.tire_diameter = tire_rims.tr_id 
                          LEFT JOIN tire_speed_indexes ON tires.tire_speed_index = tire_speed_indexes.tsi_id 
                          LEFT JOIN tire_load_indexes ON tires.tire_load_index = tire_load_indexes.tli_id 
                          LEFT JOIN tire_brands ON tires.tire_brand = tire_brands.tb_id 
                          LEFT JOIN vehicles ON tires.vehicle_id = vehicles.v_id 

                          WHERE tires.fleet_id = ?  `;
          if(vehicleTypeFilter) {
            fleetTiresSql += ` AND vehicles.vehicle_type = ? `; 
            queryParams.push(vehicleTypeFilter); 
          }                    
          if(tiresWidthFilter) {
            fleetTiresSql += ` AND tire_widths.width = ? `; 
            queryParams.push(tiresWidthFilter); 
          }
          if(tiresHeightFilter) {
            fleetTiresSql += ` AND tire_heights.height = ? `; 
            queryParams.push(tiresHeightFilter); 
          }      
          if(tiresDiameterFilter) {
            fleetTiresSql += ` AND tire_rims.rim = ? `; 
            queryParams.push(tiresDiameterFilter); 
          }
          if(tiresBrandFilter) {
            fleetTiresSql += ` AND tire_brands.brand = ? `; 
            queryParams.push(tiresBrandFilter); 
          }
          if(tiresDotFilter) {
            fleetTiresSql += ` AND tires.tire_dot = ? `; 
            queryParams.push(tiresDotFilter); 
          }
          if(tiresSeasonFilter) {
            fleetTiresSql += ` AND tires.tire_season = ? `; 
            queryParams.push(tiresSeasonFilter); 
          }
          if(tiresTreadUsageFilter) {
            if(tiresTreadUsageFilter === 'buna'){
              fleetTiresSql += ` AND (12 - tires.tire_tread_wear) > 5 `;
            } 
            if(tiresTreadUsageFilter === 'excesiva'){
              fleetTiresSql += ` AND (12 - tires.tire_tread_wear) <= 3 `;
            }
            if(tiresTreadUsageFilter === 'medie'){
              fleetTiresSql += ` AND (12 - tires.tire_tread_wear) > 3 AND (12 - tires.tire_tread_wear) < 5 `;
            }
          }
          if(tiresTreadUsageMmFilter) {
            fleetTiresSql += ` AND tires.tire_tread_wear = ? `; 
            queryParams.push(tiresTreadUsageMmFilter); 
          }                    
      fleetTiresSql += ` LIMIT ${limitOffset} , ${limit} `;
      let result = await this._query(fleetTiresSql, queryParams); 
      return result;
    } else {
      return null;
    }
  }


  getVehicleTires = async vehicleId => {    
    
    let vehicleTiresSql = `SELECT tires.t_id, tire_widths.width, tire_heights.height, tire_rims.rim AS diameter, tire_speed_indexes.speed_index, 
                        tire_load_indexes.load_index, tires.tire_season, tire_brands.brand, tires.tire_model, vehicles.vehicle_type, tires.tire_tread_wear, tires.tire_dot 
                        FROM tires
                        LEFT JOIN tire_widths ON tires.tire_width = tire_widths.tw_id
                        LEFT JOIN tire_heights ON tires.tire_height = tire_heights.th_id 
                        LEFT JOIN tire_rims ON tires.tire_diameter = tire_rims.tr_id 
                        LEFT JOIN tire_speed_indexes ON tires.tire_speed_index = tire_speed_indexes.tsi_id 
                        LEFT JOIN tire_load_indexes ON tires.tire_load_index = tire_load_indexes.tli_id 
                        LEFT JOIN tire_brands ON tires.tire_brand = tire_brands.tb_id 
                        LEFT JOIN vehicles ON tires.vehicle_id = vehicles.v_id 

                        WHERE tires.vehicle_id = ?`;
    let result = await this._query(vehicleTiresSql, [vehicleId]); 
    return result;
    
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