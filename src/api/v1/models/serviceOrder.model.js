const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBServiceOrderModel {
  tableName = 'service_orders';
  
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

  getAllOrders = async () => {
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE 1=1 
                 ORDER BY service_orders.created DESC `;  
    return await this._query(sql);                 
  }

  getAgentOrders = async uId => {
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.partner_id IN (SELECT partner_id FROM sales_agent_partner_assignment WHERE sales_agent_id = ? AND active = 1) OR service_orders.fleet_id IN (SELECT fleet_id FROM sales_agent_fleet_assignment WHERE sales_agent_id = ? AND active = 1)  
                 ORDER BY service_orders.created DESC `;  
    return await this._query(sql, [uId, uId]);                 
  }

  getFleetOrdersByUserId = async fId => {
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, service_orders.vehicle_mileage, service_orders.order_total_fleet AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.fleet_id = ? 
                 ORDER BY service_orders.created DESC `;  
    return await this._query(sql, [fId]);                 
  }

  getFleetOrderDetails = async (fId, oId) => {
    let orderDetails = {};
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, vehicles.vehicle_tire_count, vehicles.vehicle_type, service_orders.vehicle_mileage, service_orders.order_total_fleet AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.so_id = ? AND service_orders.fleet_id = ? `;
    const result = await this._query(sql, [oId, fId]);
    
    if(!result.length) {
      return [];
    } else {
      const sqlOrderDets = `SELECT sod_id, service_name, service_cost_fleet AS order_detail_cost, created 
                            FROM service_orders_details 
                            WHERE service_order_id = ? `;
      const resOrderDets = await this._query(sqlOrderDets, [oId]);
      if(!resOrderDets.length) {
        return [];
      } else {
        orderDetails = {
          vehicle_reg_number: result[0].reg_number,
          vehicle_tire_count: result[0].vehicle_tire_count,
          vehicle_type: result[0].vehicle_type,
          order_total: result[0].order_total,
          order_details: resOrderDets
        }        
        return orderDetails;
      }
    }
  }

  getPartnerOrdersByUserId = async pId => {
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.partner_id = ? 
                 ORDER BY service_orders.created DESC `;  
    return await this._query(sql, [pId]);                 
  }


  getPartnerOrderDetails = async (pId, oId) => {
    let orderDetails = {};
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, vehicles.vehicle_tire_count, vehicles.vehicle_type, service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.so_id = ? AND service_orders.partner_id = ? `;
    const result = await this._query(sql, [oId, pId]);
    
    if(!result.length) {
      return [];
    } else {
      const sqlOrderDets = `SELECT sod_id, service_name, service_cost_partner AS order_detail_cost, created 
                            FROM service_orders_details 
                            WHERE service_order_id = ? `;
      const resOrderDets = await this._query(sqlOrderDets, [oId]);
      if(!resOrderDets.length) {
        return [];
      } else {
        orderDetails = {
          vehicle_reg_number: result[0].reg_number,
          vehicle_tire_count: result[0].vehicle_tire_count,
          vehicle_type: result[0].vehicle_type,
          order_total: result[0].order_total,
          order_details: resOrderDets
        }        
        return orderDetails;
      }
    }
  }

  getAgentOrderDetails = async (uId,oId) => {
    let orderDetails = {};
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, vehicles.vehicle_tire_count, vehicles.vehicle_type, service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.so_id = ? AND service_orders.partner_id IN (SELECT partner_id FROM sales_agent_partner_assignment WHERE sales_agent_id = ? AND active = 1) OR service_orders.fleet_id IN (SELECT fleet_id FROM sales_agent_fleet_assignment WHERE sales_agent_id = ? AND active = 1)  `;
    const result = await this._query(sql, [oId, uId, uId]);
    
    if(!result.length) {
      return [];
    } else {
      const sqlOrderDets = `SELECT sod_id, service_name, service_cost_partner AS order_detail_cost, created 
                            FROM service_orders_details 
                            WHERE service_order_id = ? `;
      const resOrderDets = await this._query(sqlOrderDets, [oId]);
      if(!resOrderDets.length) {
        return [];
      } else {
        orderDetails = {
          vehicle_reg_number: result[0].reg_number,
          vehicle_tire_count: result[0].vehicle_tire_count,
          vehicle_type: result[0].vehicle_type,
          order_total: result[0].order_total,
          order_details: resOrderDets
        }        
        return orderDetails;
      }
    }  
  }

  getOrderDetails = async oId => {
    let orderDetails = {};
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, vehicles.vehicle_tire_count, vehicles.vehicle_type, service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.so_id = ? `;
    const result = await this._query(sql, [oId]);
    
    if(!result.length) {
      return [];
    } else {
      const sqlOrderDets = `SELECT sod_id, service_name, service_cost_partner AS order_detail_cost, created 
                            FROM service_orders_details 
                            WHERE service_order_id = ? `;
      const resOrderDets = await this._query(sqlOrderDets, [oId]);
      if(!resOrderDets.length) {
        return [];
      } else {
        orderDetails = {
          vehicle_reg_number: result[0].reg_number,
          vehicle_tire_count: result[0].vehicle_tire_count,
          vehicle_type: result[0].vehicle_type,
          order_total: result[0].order_total,
          order_details: resOrderDets
        }        
        return orderDetails;
      }
    }  
  }

  create = async ({partner_id, vehicle_id, fleet_id, vehicle_mileage, order_total_partner, order_total_fleet, created = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (partner_id, vehicle_id, fleet_id, vehicle_mileage, order_total_partner, order_total_fleet, created) VALUES (?,?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [partner_id, vehicle_id, fleet_id, vehicle_mileage, order_total_partner, order_total_fleet, created]);
    const lastOrderInsId = result ? result.insertId : 0;

    return lastOrderInsId;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE so_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE so_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBServiceOrderModel;