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

  getVehicleAvailableServices = async(vType, tireDiameter, uId, vId) => {
    let sqlPartnerInfo = `SELECT * FROM partner_info WHERE user_id = ? `;
    let resPartnerInfo = await this._query(sqlPartnerInfo, [uId]);

    let sql = `SELECT services_list.sl_id, services_list.service_name, services_list.hotel_service, services_list.cost_type  
               FROM services_list 
               LEFT JOIN services_tire_diameter_assignment ON services_list.sl_id = services_tire_diameter_assignment.service_id
               WHERE services_list.service_vehicle_type = ?  AND  services_tire_diameter_assignment.tire_diameter = ? `;
    let result = await this._query(sql, [vType, tireDiameter]); 
    let newServicesList=[];
    if(result && result.length > 0) {    
      if(resPartnerInfo[0]['hotel_enabled'] === 0) {        
        /* let selfHotelServicesArr = [22,23,24,25,26,27]; */
        /* newServicesList = result.filter(item => selfHotelServicesArr.indexOf(parseInt(item.sl_id)) === -1); */
        newServicesList = result.filter(item => item.hotel_service !== 1);
      } else {
        newServicesList = result;
      }    
    }
    return newServicesList;
  }

  getServiceById = async sId => {
    let sNfoSql = `SELECT services_list.service_name, services_list.service_vehicle_type, services_list.service_cost, services_list.hotel_service, services_list.cost_type, 
                  (SELECT MIN(tire_diameter) FROM services_tire_diameter_assignment WHERE service_id = services_list.sl_id) AS min_diameter, 
                  (SELECT MAX(tire_diameter) FROM services_tire_diameter_assignment WHERE service_id = services_list.sl_id) AS max_diameter 
                  FROM services_list 
                  WHERE services_list.sl_id = ? `;
    let resSNfo = await this._query(sNfoSql, [sId]);

    return resSNfo[0];               
  }

  getServicesList = async () => {
    let sListSql = `SELECT sl_id, service_name, service_vehicle_type, service_cost, 
                    case 
                    when hotel_service = 0 then "NU"
                    when hotel_service = 1 then "PROPRIU"
                    when hotel_service = 2 then "DINAMIC 92" 
                    end as hotel_service_text , hotel_service , 
                    case 
                    when cost_type = 0 then "FIX"
                    when cost_type = 1 then "UNITAR"                    
                    end as cost_type_text , cost_type  
                    FROM services_list `;
    return await this._query(sListSql);
  }

  create = async ({service_name, service_vehicle_type, service_cost, hotel_service, cost_type, min_diameter, max_diameter}) => {
    const sql = `INSERT INTO services_list 
    (service_name, service_vehicle_type, service_cost, hotel_service, cost_type) VALUES (?,?,?,?,?)`;
   
    const result = await this._query(sql, [service_name, service_vehicle_type, service_cost, hotel_service, cost_type]);
    const lastServiceInsId = result ? result.insertId : 0;
    if(lastServiceInsId) {
      for (let i = min_diameter; i <= max_diameter; i++) { 
        let sqlInsDiam = `INSERT INTO services_tire_diameter_assignment
        (service_id, tire_diameter) VALUES (?,?)`;
        let resDiam = await this._query(sqlInsDiam, [lastServiceInsId, i]);  
      }
    }
    return lastServiceInsId;
  }


  update = async ({sl_id, service_name, service_vehicle_type, service_cost, hotel_service, cost_type, min_diameter, max_diameter}) => { 
    const sql = `UPDATE services_list SET service_name = ? , service_vehicle_type = ? , service_cost = ? , hotel_service = ? , cost_type = ? 
                WHERE sl_id = ?`;
   
    const result = await this._query(sql, [service_name, service_vehicle_type, service_cost, hotel_service, cost_type, sl_id]);
    if(result) {
      let delOldDiamsSql = `DELETE FROM services_tire_diameter_assignment WHERE service_id = ?`;
      let resDelOldDiamsSql = await this._query(delOldDiamsSql, [sl_id]);
      
      for (let i = min_diameter; i <= max_diameter; i++) { 
        let sqlInsDiam = `INSERT INTO services_tire_diameter_assignment
        (service_id, tire_diameter) VALUES (?,?)`;
        let resDiam = await this._query(sqlInsDiam, [sl_id, i]);  
      }  
      return true;
    } else {
      return false;
    } 
  }

}

module.exports = DBServiceListModel;