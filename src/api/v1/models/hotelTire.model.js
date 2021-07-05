const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBHotelTireModel {
  tableName = 'hotel_tires';
  
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
  

  getOwnFleetTires = async(fleetId, uId) => {
    let uSql = `SELECT fi_id FROM fleet_info WHERE user_id = ? `;
    let uResult = await this._query(uSql, [uId]); 
    
    if(uResult && uResult.length) {
      let fleetTiresSql = `SELECT hotel_tires.ht_id, tire_widths.width, tire_heights.height, tire_rims.rim AS diameter, tire_speed_indexes.speed_index, 
                          tire_load_indexes.load_index, hotel_tires.tire_season, tire_brands.brand, vehicles.vehicle_type, 
                          case 
                            when (12 - hotel_tires.tire_tread_wear) > 5 then "buna"
                            when (12 - hotel_tires.tire_tread_wear) <= 3 then "excesiva"
                            when (12 - hotel_tires.tire_tread_wear) > 3 AND (12 - hotel_tires.tire_tread_wear) < 5 then "medie"
                          end as tread_wear, hotel_tires.tire_tread_wear, hotel_tires.tire_dot      
                          FROM hotel_tires
                          LEFT JOIN tire_widths ON hotel_tires.tire_width = tire_widths.tw_id
                          LEFT JOIN tire_heights ON hotel_tires.tire_height = tire_heights.th_id 
                          LEFT JOIN tire_rims ON hotel_tires.tire_diameter = tire_rims.tr_id 
                          LEFT JOIN tire_speed_indexes ON hotel_tires.tire_speed_index = tire_speed_indexes.tsi_id 
                          LEFT JOIN tire_load_indexes ON hotel_tires.tire_load_index = tire_load_indexes.tli_id 
                          LEFT JOIN tire_brands ON hotel_tires.tire_brand = tire_brands.tb_id 
                          LEFT JOIN vehicles ON hotel_tires.vehicle_id = vehicles.v_id 

                          WHERE hotel_tires.fleet_id = ?`;
      let result = await this._query(fleetTiresSql, [uResult[0].fi_id]); 
      return result;
    } else {
      return null;
    }  
    
  }

  getFleetTiresByFleetId = async (fleetId, uId, uRole) => {    
    let hasAccess = false;
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
      let fleetTiresSql = `SELECT hotel_tires.ht_id, tire_widths.width, tire_heights.height, tire_rims.rim AS diameter, tire_speed_indexes.speed_index, 
                          tire_load_indexes.load_index, hotel_tires.tire_season, tire_brands.brand, vehicles.vehicle_type, 
                          case 
                            when (12 - hotel_tires.tire_tread_wear) > 5 then "buna"
                            when (12 - hotel_tires.tire_tread_wear) <= 3 then "excesiva"
                            when (12 - hotel_tires.tire_tread_wear) > 3 AND (12 - hotel_tires.tire_tread_wear) < 5 then "medie"
                          end as tread_wear, hotel_tires.tire_tread_wear, hotel_tires.tire_dot      
                          FROM hotel_tires
                          LEFT JOIN tire_widths ON hotel_tires.tire_width = tire_widths.tw_id
                          LEFT JOIN tire_heights ON hotel_tires.tire_height = tire_heights.th_id 
                          LEFT JOIN tire_rims ON hotel_tires.tire_diameter = tire_rims.tr_id 
                          LEFT JOIN tire_speed_indexes ON hotel_tires.tire_speed_index = tire_speed_indexes.tsi_id 
                          LEFT JOIN tire_load_indexes ON hotel_tires.tire_load_index = tire_load_indexes.tli_id 
                          LEFT JOIN tire_brands ON hotel_tires.tire_brand = tire_brands.tb_id 
                          LEFT JOIN vehicles ON hotel_tires.vehicle_id = vehicles.v_id 

                          WHERE hotel_tires.fleet_id = ?`;
      let result = await this._query(fleetTiresSql, [fleetId]); 
      return result;
    } else {
      return null;
    }
  }

  getAllHotelVehicles = async () => {
    let sql = `SELECT v_id, reg_number, vehicle_milage, vehicle_type
              FROM vehicles 
              WHERE v_id IN (SELECT DISTINCT(vehicle_id) FROM hotel_tires WHERE 1)
              `;
    return await this._query(sql);  
  }

  getFleetHotelVehicles = async fId => {
    let sql = `SELECT v_id, reg_number, vehicle_milage, vehicle_type
              FROM vehicles 
              WHERE v_id IN (SELECT DISTINCT(vehicle_id) FROM hotel_tires WHERE fleet_id = ?)
              `;
    return await this._query(sql, [fId]);    
  }

  getPartnerHotelVehicles = async pId => {
    let pInfoSql = `SELECT pi_id FROM partner_info WHERE user_id = ?`;
    let pInfo = await this._query(pInfoSql, [pId]);    

    let sql = `SELECT v_id, reg_number, vehicle_milage, vehicle_type
              FROM vehicles 
              WHERE v_id IN (SELECT DISTINCT(vehicle_id) FROM hotel_tires WHERE hotel_type = 1 AND hotel_id = ?)
              `;
    return await this._query(sql, [pInfo[0].pi_id]);    
  }

  getVehicleTires = async vehicleId => {    
    
    let vehicleTiresSql = `SELECT hotel_tires.ht_id, tire_widths.width, tire_heights.height, tire_rims.rim AS diameter, tire_speed_indexes.speed_index, 
                        tire_load_indexes.load_index, hotel_tires.tire_season, tire_brands.brand, hotel_tires.tire_model, vehicles.vehicle_type, hotel_tires.tire_tread_wear, hotel_tires.tire_dot 
                        FROM hotel_tires
                        LEFT JOIN tire_widths ON hotel_tires.tire_width = tire_widths.tw_id
                        LEFT JOIN tire_heights ON hotel_tires.tire_height = tire_heights.th_id 
                        LEFT JOIN tire_rims ON hotel_tires.tire_diameter = tire_rims.tr_id 
                        LEFT JOIN tire_speed_indexes ON hotel_tires.tire_speed_index = tire_speed_indexes.tsi_id 
                        LEFT JOIN tire_load_indexes ON hotel_tires.tire_load_index = tire_load_indexes.tli_id 
                        LEFT JOIN tire_brands ON hotel_tires.tire_brand = tire_brands.tb_id 
                        LEFT JOIN vehicles ON hotel_tires.vehicle_id = vehicles.v_id 

                        WHERE hotel_tires.vehicle_id = ?`;
    let result = await this._query(vehicleTiresSql, [vehicleId]); 
    return result;
    
  }

  getHotelByVehicle = async vId => {
    let hotel = null;
    let hInfo = `SELECT hotel_type, hotel_id FROM hotel_tires WHERE vehicle_id = ? LIMIT 1`;
    let resHInfo = await this._query(hInfo, [vId]); 
    if(!resHInfo || resHInfo.length < 1) {
      return hotel;
    }
    if(resHInfo[0].hotel_type === 0) {
      let hList = `SELECT hotel_city FROM hotels_list WHERE hl_id = ?`;
      let resHList = await this._query(hList, [resHInfo[0].hotel_id]);
      hotel = 'Dinamic 92 - '+ resHList[0].hotel_city;

    } else if(resHInfo[0].hotel_type === 1) {
      let hPartnerList = `SELECT partner_name, partner_city FROM partner_info WHERE pi_id = ?`;
      let resHPartnerList = await this._query(hPartnerList, [resHInfo[0].hotel_id]);
      hotel = resHPartnerList[0].partner_name + ' - ' + resHPartnerList[0].partner_city;  
    }
    return hotel;
  }

  getHotelListByRegion = async hRegion => {
    let hCounter = 0;
    let hLocations = [];
    let internalHSql = `SELECT hotel_city FROM hotels_list WHERE hotel_region = ? `;
    let resIHSql = await this._query(internalHSql, [hRegion]);
    if(resIHSql.length > 0) {
      hCounter = hCounter + resIHSql.length;
      resIHSql.forEach(e => {
        let hName = 'Dinamic 92' + ' - ' + e.hotel_city;
        hLocations.push({nume: hName});
      });
    }
  
    let partnerHotelsSql = `SELECT partner_name, partner_city FROM partner_info WHERE partner_region = ? `;
    let resPHSql = await this._query(partnerHotelsSql, [hRegion]);
    if(resPHSql.length > 0) {
      hCounter = hCounter + resPHSql.length;
      resPHSql.forEach(e => {
        let hPName = e.partner_name + ' - ' + e.partner_city;
        hLocations.push({nume: hPName});
      });
    }
    let zzz = {hCounter, hLocations};
    return zzz;
  }

  getTHList = async () => {
    let hList = [];
    let internalHotelsListSql = `SELECT hl_id, hotel_city FROM hotels_list WHERE 1`;
    let result = await this._query(internalHotelsListSql); 
    return result;
  }

  getPartnerHotelsList = async () => {
    let partnersHotelsListSql = `SELECT pi_id, partner_name, partner_city FROM partner_info WHERE hotel_enabled = 1`;
    let res = await this._query(partnersHotelsListSql); 
    return res;   
  }

  getVehicleWithTires = async id => {

    const sql = `SELECT vehicle_tire_count 
                 FROM vehicles 
                 WHERE v_id = ? `;  
    const result = await this._query(sql, [id]);
    if(!result || result.length < 1) {
      return {}
    }
    
    const sqlVTires = `SELECT * 
                      FROM hotel_tires
                      WHERE vehicle_id =  ? 
                      ORDER BY tire_position ASC
                      `;
    const resVTires = await this._query(sqlVTires, [id]);
    if(!resVTires || resVTires.length < 1) {
      return {}
    }

    let vWithTires = {
      vehicleId: id,     
      vehicle_tire_count: result[0].vehicle_tire_count,      
      vehicleTires: {
        tireIds: [resVTires[0].ht_id,resVTires[1].ht_id,resVTires[2].ht_id,resVTires[3].ht_id,resVTires[4] ? resVTires[4].ht_id : 0,resVTires[5] ? resVTires[5].ht_id : 0],
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
        treadUsages: [resVTires[0].tire_tread_wear.toFixed(1),resVTires[1].tire_tread_wear.toFixed(1),resVTires[2].tire_tread_wear.toFixed(1),resVTires[3].tire_tread_wear.toFixed(1),resVTires[4]?.tire_tread_wear ? resVTires[4].tire_tread_wear.toFixed(1) : "0.0",resVTires[5]?.tire_tread_wear ? resVTires[5].tire_tread_wear.toFixed(1) : "0.0"],
        hotelId: [resVTires[0].hotel_type + '_' + resVTires[0].hotel_id, resVTires[1].hotel_type + '_' + resVTires[1].hotel_id, resVTires[2].hotel_type + '_' + resVTires[2].hotel_id, resVTires[3].hotel_type + '_' + resVTires[3].hotel_id, resVTires[4] ? resVTires[4].hotel_type + '_' + resVTires[4].hotel_id : "0_1", resVTires[5] ? resVTires[5].hotel_type + '_' + resVTires[5].hotel_id : "0_1"] 
      }
    }

    return vWithTires;

  }

  create = async ({vehicle_id, fleet_id, tire_position, tire_width, tire_height, tire_diameter, tire_speed_index, tire_load_index, tire_brand, tire_model, tire_season, tire_dot, tire_rim, tire_tread_wear, hotel_type = 0, hotel_id, created = Date.now(), updated = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (vehicle_id, fleet_id, tire_position, tire_width, tire_height, tire_diameter, tire_speed_index, tire_load_index, tire_brand, tire_model, tire_season, tire_dot, tire_rim, tire_tread_wear, hotel_type, hotel_id, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [vehicle_id, fleet_id, tire_position, tire_width, tire_height, tire_diameter, tire_speed_index, tire_load_index, tire_brand, tire_model, tire_season, tire_dot, tire_rim, tire_tread_wear, hotel_type, hotel_id, created, updated]);
    const lastTireInsId = result ? result.insertId : 0;

    return lastTireInsId;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE ht_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  updateVehicleTires = async (params, id) => {   
    for(let i=0; i<params.vehicle_tire_count; i++) {      
      let tireHotelInfo = params.vehicleTires.hotelId[i].split('_');  
      let hotelType = parseInt(tireHotelInfo[0]);
      let hotelLocationId =  parseInt(tireHotelInfo[1]);
      let tireUpdVals = [parseInt(params.vehicleTires.widths[i]),parseInt(params.vehicleTires.heights[i]),parseInt(params.vehicleTires.diameters[i]), parseInt(params.vehicleTires.speedIndexes[i]),parseInt(params.vehicleTires.loadIndexes[i]),parseInt(params.vehicleTires.brands[i]), params.vehicleTires.models[i],params.vehicleTires.seasons[i],params.vehicleTires.dots[i], parseInt(params.vehicleTires.rims[i]),parseFloat(params.vehicleTires.treadUsages[i]),parseInt(hotelType),parseInt(hotelLocationId),Date.now()]
      let sqlTireUpd = `UPDATE hotel_tires SET tire_width = ? , tire_height = ? , tire_diameter = ? , tire_speed_index = ? , tire_load_index = ? , tire_brand = ? , tire_model = ? , tire_season = ? , tire_dot = ? , tire_rim = ? , tire_tread_wear = ? , hotel_type = ? , hotel_id = ? , updated = ? WHERE vehicle_id = ? AND ht_id = ?`;
      let resUpd = await this._query(sqlTireUpd, [...tireUpdVals, id, params.vehicleTires.tireIds[i]]);    
    }
    return true;
  }

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE ht_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBHotelTireModel;