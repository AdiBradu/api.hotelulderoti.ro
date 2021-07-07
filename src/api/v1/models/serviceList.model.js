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

    let sql = `SELECT services_list.sl_id, services_list.service_name
               FROM services_list 
               LEFT JOIN services_tire_diameter_assignment ON services_list.sl_id = services_tire_diameter_assignment.service_id
               WHERE services_list.service_vehicle_type = ?  AND  services_tire_diameter_assignment.tire_diameter = ? `;
    let result = await this._query(sql, [vType, tireDiameter]); 
    let newServicesList=[];
    if(result && result.length > 0) {
      /* let sqlHVeh = `SELECT hotel_type, hotel_id FROM hotel_tires WHERE vehicle_id = ?`;
      let resHVeh = await this._query(sqlHVeh, [vId]);
      let disableSelfHotelServices = false;
      if(!resHVeh || resHVeh.length < 1) {
        disableSelfHotelServices = true;
      } else {
        if(resHVeh[0]['hotel_type'] !== 1 || (resHVeh[0]['hotel_type'] === 1 && resHVeh[0]['hotel_type'] !== resPartnerInfo[0]['pi_id'])) {
          disableSelfHotelServices = true;  
        }
      } */
      if(resPartnerInfo[0]['hotel_enabled'] === 0 /* || disableSelfHotelServices */) {        
        let selfHotelServicesArr = [22,23,24,25,26,27];
        newServicesList = result.filter(item => selfHotelServicesArr.indexOf(parseInt(item.sl_id)) === -1);
      } else {
        newServicesList = result;
      }    
    }
    return newServicesList;
  }


 

}

module.exports = DBServiceListModel;