const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBHotelRequestModel {
  tableName = 'hotel_requests';
  
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

  create = async ({partner_id, vehicle_id, request_type, request_status, created = Date.now(), updated = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (partner_id, vehicle_id, request_type, request_status, created, updated) VALUES (?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [partner_id, vehicle_id, request_type, request_status, created, updated]);
    const lastReqInsId = result ? result.insertId : 0;

    return lastReqInsId;
  }

  getAllRequests = async () => {    
    let reqsSql = `SELECT hotel_requests.hr_id, vehicles.reg_number, 
                  case 
                    when hotel_requests.request_type = 0 then "Retragere"
                    when hotel_requests.request_type = 1 then "Depozitare"
                  end as request_type , 
                  case 
                    when hotel_requests.request_status = 0 then "In asteptare"
                    when hotel_requests.request_status = 1 then "Aprobata"
                    when hotel_requests.request_status = 2 then "Procesata"
                  end as request_status,
                  hotel_requests.created 
                  FROM  hotel_requests 
                  LEFT JOIN vehicles ON hotel_requests.vehicle_id = vehicles.v_id 
                  WHERE 1 
                  ORDER BY hotel_requests.request_status ASC, hotel_requests.created DESC
                  `;  
    let res = await this._query(reqsSql);  
    
    return res;
  }

  getPartnerRequests = async uId => {
    let pInfoSql = `SELECT pi_id FROM partner_info WHERE user_id = ?`;
    let pInfo = await this._query(pInfoSql, [uId]);  
    if(!pInfo || pInfo.length < 1) {
      return null;
    } 
    let reqsSql = `SELECT hotel_requests.hr_id, vehicles.reg_number, 
                  case 
                    when hotel_requests.request_type = 0 then "Retragere"
                    when hotel_requests.request_type = 1 then "Depozitare"
                  end as request_type , 
                  case 
                    when hotel_requests.request_status = 0 then "In asteptare"
                    when hotel_requests.request_status = 1 then "Aprobata"
                    when hotel_requests.request_status = 2 then "Procesata"
                  end as request_status,
                  hotel_requests.created 
                  FROM  hotel_requests 
                  LEFT JOIN vehicles ON hotel_requests.vehicle_id = vehicles.v_id 
                  WHERE hotel_requests.partner_id = ?
                  ORDER BY hotel_requests.request_status ASC, hotel_requests.created DESC
                  `;  
    let res = await this._query(reqsSql, [pInfo[0].pi_id]);      
    return res;
  }

  getRequestInfo = async rId => {

    const reqSql = `SELECT partner_info.partner_name, hotel_requests.vehicle_id, vehicles.reg_number, vehicles.vehicle_tire_count, vehicles.vehicle_type,  
                      case 
                      when hotel_requests.request_type = 0 then "Retragere"
                      when hotel_requests.request_type = 1 then "Depozitare"
                    end as req_text_type , 
                    case 
                      when hotel_requests.request_status = 0 then "In asteptare"
                      when hotel_requests.request_status = 1 then "Aprobata"
                      when hotel_requests.request_status = 2 then "Procesata"
                    end as req_text_status,    
                    hotel_requests.request_type,
                    hotel_requests.request_status
                    FROM hotel_requests 
                    LEFT JOIN partner_info ON hotel_requests.partner_id = partner_info.pi_id 
                    LEFT JOIN vehicles ON hotel_requests.vehicle_id = vehicles.v_id 
                    WHERE hotel_requests.hr_id = ? 
                    `;
    const resReq = await this._query(reqSql, [rId]);        
    if(!resReq || resReq.length < 1) {
      return {}
    }      
      
    let vehicleTiresSql = `SELECT hotel_requests_tires.hrt_id, tire_widths.width, tire_heights.height, tire_rims.rim AS diameter, tire_speed_indexes.speed_index, 
                        tire_load_indexes.load_index, hotel_requests_tires.tire_season, tire_brands.brand, hotel_requests_tires.tire_model, vehicles.vehicle_type, hotel_requests_tires.tire_tread_wear, hotel_requests_tires.tire_dot 
                        FROM hotel_requests_tires
                        LEFT JOIN tire_widths ON hotel_requests_tires.tire_width = tire_widths.tw_id
                        LEFT JOIN tire_heights ON hotel_requests_tires.tire_height = tire_heights.th_id 
                        LEFT JOIN tire_rims ON hotel_requests_tires.tire_diameter = tire_rims.tr_id 
                        LEFT JOIN tire_speed_indexes ON hotel_requests_tires.tire_speed_index = tire_speed_indexes.tsi_id 
                        LEFT JOIN tire_load_indexes ON hotel_requests_tires.tire_load_index = tire_load_indexes.tli_id 
                        LEFT JOIN tire_brands ON hotel_requests_tires.tire_brand = tire_brands.tb_id 
                        LEFT JOIN vehicles ON hotel_requests_tires.vehicle_id = vehicles.v_id 

                        WHERE hotel_requests_tires.vehicle_id = ?`;
    let resVTires = await this._query(vehicleTiresSql, [resReq[0].vehicle_id]); 
    if(!resVTires || resVTires.length < 1) {
      return {}
    }

    let rNfo = {
      vehicleId: resReq[0].vehicle_id,     
      vehicle_tire_count: resReq[0].vehicle_tire_count,      
      partner_name: resReq[0].partner_name,   
      reg_number: resReq[0].reg_number,   
      vehicle_type: resReq[0].vehicle_type,   
      req_text_type: resReq[0].req_text_type,   
      req_text_status: resReq[0].req_text_status,   
      request_status: resReq[0].request_status, 
      request_type: resReq[0].request_type, 
      vehicleTires: resVTires
    }

    return rNfo;
  }

  createHotelCheckoutRequest = async (vehicle_id, regNumber, uId) => {
    let pInfoSql = `SELECT pi_id FROM partner_info WHERE user_id = ?`;
    let pInfo = await this._query(pInfoSql, [uId]);  
    if(!pInfo || pInfo.length < 1) {
      return 0;
    }  
    
    
    let vehicleStoredTiresSql = `SELECT * FROM hotel_tires WHERE vehicle_id = ? AND hotel_type = 0`;
    let storedTires = await this._query(vehicleStoredTiresSql, [vehicle_id]);   
    if(!storedTires || storedTires.length < 1) {
      return 0;
    }

    const sqlReq = `INSERT INTO ${this.tableName}
    (partner_id, vehicle_id, request_type, request_status, created, updated) VALUES (?,?,?,?,?,?)`;
    const result = await this._query(sqlReq, [pInfo[0].pi_id, vehicle_id, 0, 0, Date.now(), Date.now()]);    
    const lastReqInsId = result ? result.insertId : 0;

    if(lastReqInsId > 0) {
      for (const [index, el] of storedTires.entries()) {  
        let sqlReqTire = `INSERT INTO hotel_requests_tires
        (request_id, vehicle_id, fleet_id, tire_position, tire_width, tire_height, tire_diameter, tire_speed_index, tire_load_index, tire_brand, tire_model, tire_season, tire_dot, tire_rim, tire_tread_wear, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        let resTire = await this._query(sqlReqTire, [lastReqInsId, el.vehicle_id, el.fleet_id, el.tire_position, el.tire_width, el.tire_height, el.tire_diameter, el.tire_speed_index, el.tire_load_index, el.tire_brand, el.tire_model, el.tire_season, el.tire_dot, el.tire_rim, el.tire_tread_wear, Date.now(), Date.now()]);  
      }
    }
    return lastReqInsId;
  }

  updateHotelRequest = async (params, id) => {
    let newStatus = parseInt(params.req_status) < 2 ? parseInt(params.req_status) + 1 : 2;
    if(params.req_type === 0) {      
      if(newStatus === 2) {
        let reqNfoSql = `SELECT partner_id, vehicle_id FROM hotel_requests WHERE hr_id = ? `;
        let resReqNfo = await this._query(reqNfoSql, [id]);
        if(!resReqNfo || resReqNfo.length < 1) {
          return false;
        }
        let hotelUpdSql = `UPDATE hotel_tires SET hotel_type = 1 , hotel_id = ? WHERE vehicle_id = ? `;
        let resHUpd = await this._query(hotelUpdSql, [resReqNfo[0].partner_id, resReqNfo[0].vehicle_id]);
      }      
    } else if(params.req_type === 1) {
      if(newStatus === 2) {
        let newHData =  params.selected_hotel.split('_');  
        let newHId = newHData[1];
        let reqNfoSql = `SELECT vehicle_id FROM hotel_requests WHERE hr_id = ? `;
        let resReqNfo = await this._query(reqNfoSql, [id]);
        if(!resReqNfo || resReqNfo.length < 1) {
          return false;
        }

        let hotelUpdSql = `UPDATE hotel_tires SET hotel_type = 0 , hotel_id = ? WHERE vehicle_id = ? `;
        let resHUpd = await this._query(hotelUpdSql, [newHId, resReqNfo[0].vehicle_id]);
      }   
    }

    let reqUpdSql = `UPDATE hotel_requests SET request_status = ? WHERE hr_id = ?`;
    let resReqUpd = await this._query(reqUpdSql, [newStatus, id]); 
    return resReqUpd;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE hr_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE hr_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBHotelRequestModel;