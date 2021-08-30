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

  countVehicleOrders = async vId => {
    let sql = `SELECT COUNT(service_orders.so_id) AS ordersCount FROM service_orders WHERE service_orders.vehicle_id = ? `;
    let res = await this._query(sql, [vId]);
    return parseInt(res[0]?.ordersCount);
  }

  getVehicleOrders = async (vId, currentPage, pageLimit) => {
    let page = parseInt(currentPage);
    let limit = parseInt(pageLimit);
    let limitOffset = page * limit;  

    let sql = `SELECT service_orders.so_id, service_orders.created , service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total, service_orders.order_total_fleet      
                 FROM  service_orders 
                 WHERE service_orders.vehicle_id = ?  
                 ORDER BY service_orders.created DESC `;  
    sql += ` LIMIT ${limitOffset} , ${limit} `;

    return await this._query(sql, [vId]);                 
  }

  countAgentVehicleOrders = async (uId, vId) => {
    let sql = `SELECT COUNT(service_orders.so_id) AS ordersCount FROM service_orders 
               WHERE service_orders.vehicle_id = ? AND service_orders.fleet_id IN (SELECT fleet_id FROM sales_agent_fleet_assignment WHERE sales_agent_id = ? AND active = 1)  `;
    let res = await this._query(sql, [vId, uId]);
    return parseInt(res[0]?.ordersCount);
  }

  getAgentVehicleOrders = async (uId, vId, currentPage, pageLimit) => {
    let page = parseInt(currentPage);
    let limit = parseInt(pageLimit);
    let limitOffset = page * limit;  

    let sql = `SELECT service_orders.so_id, service_orders.created , service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total, service_orders.order_total_fleet      
                 FROM  service_orders 
                 WHERE service_orders.vehicle_id = ? AND service_orders.fleet_id IN (SELECT fleet_id FROM sales_agent_fleet_assignment WHERE sales_agent_id = ? AND active = 1)  
                 ORDER BY service_orders.created DESC `;  
    sql += ` LIMIT ${limitOffset} , ${limit} `;
    return await this._query(sql, [vId, uId]);                 
  }

  countFleetVehicleOrders = async (uId, vId) => {
    let sql = `SELECT COUNT(service_orders.so_id) AS ordersCount FROM service_orders 
               WHERE service_orders.vehicle_id = ? AND  service_orders.fleet_id = (SELECT fi_id FROM fleet_info WHERE user_id = ? )  `;
    let res = await this._query(sql, [vId, uId]);
    return parseInt(res[0]?.ordersCount);
  }

  getFleetVehicleOrders = async (uId, vId, currentPage, pageLimit) => {
    let page = parseInt(currentPage);
    let limit = parseInt(pageLimit);
    let limitOffset = page * limit;  
    let sql = `SELECT service_orders.so_id, service_orders.created , service_orders.vehicle_mileage, service_orders.order_total_fleet AS order_total     
                 FROM  service_orders 
                 WHERE service_orders.vehicle_id = ? AND  service_orders.fleet_id = (SELECT fi_id FROM fleet_info WHERE user_id = ? )
                 ORDER BY service_orders.created DESC `; 
    sql += ` LIMIT ${limitOffset} , ${limit} `;
    return await this._query(sql, [vId, uId]);         
  }

  countAllOrders = async (searchString, timePeriodFilter) => {
    let queryParams = [];
    let sql = `SELECT COUNT(service_orders.so_id) AS ordersCount 
               FROM  service_orders 
               LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id              
               WHERE 1 
               `;
    if(searchString) {
      sql += ` AND vehicles.reg_number LIKE ? `;
      queryParams.push(`%`+searchString+`%`);
    }  
    if(timePeriodFilter) {
      if(timePeriodFilter === 'luna curenta') {
        let d = new Date();
        d.setMonth(d.getMonth());
        d.setDate(0);
        d.setHours(0, 0, 0, 0);
        let startT = d.getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'luna trecuta') {
        let now = new Date();
        let endT  = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
        let startT = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul curent') {
        let n = new Date();
        let startT = new Date(n.getFullYear(), 0, 1).getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul trecut') {
        let startT  = new Date(new Date().getFullYear() - 1, 0, 1).getTime();
        let endT = new Date(new Date().getFullYear() - 1, 11, 0).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      }
    }
    let res = await this._query(sql, queryParams);
    return parseInt(res[0]?.ordersCount);           
  }

  getAllOrders = async (currentPage, pageLimit, searchString, timePeriodFilter) => {
    let page = parseInt(currentPage);
    let limit = parseInt(pageLimit);
    let limitOffset = page * limit;   
    let queryParams = [];
    let sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, service_orders.vehicle_mileage, partner_info.partner_name, service_orders.order_total_partner AS order_total, fleet_info.fleet_name, service_orders.order_total_fleet      
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 LEFT JOIN partner_info ON service_orders.partner_id = partner_info.pi_id 
                 LEFT JOIN fleet_info ON service_orders.fleet_id = fleet_info.fi_id 
                 WHERE 1=1 
                 `;  
    if(searchString) {
      sql += ` AND vehicles.reg_number LIKE ? `;
      queryParams.push(`%`+searchString+`%`);
    }  
    if(timePeriodFilter) {
      if(timePeriodFilter === 'luna curenta') {
        let d = new Date();
        d.setMonth(d.getMonth());
        d.setDate(0);
        d.setHours(0, 0, 0, 0);
        let startT = d.getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'luna trecuta') {
        let now = new Date();
        let endT  = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
        let startT = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul curent') {
        let n = new Date();
        let startT = new Date(n.getFullYear(), 0, 1).getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul trecut') {
        let startT  = new Date(new Date().getFullYear() - 1, 0, 1).getTime();
        let endT = new Date(new Date().getFullYear() - 1, 11, 0).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      }
    }             
    sql +=` ORDER BY service_orders.created DESC  `;
    sql += ` LIMIT ${limitOffset} , ${limit} `;
    return await this._query(sql,queryParams);                 
  }

  countAgentOrders = async (uId, searchString, timePeriodFilter) => {
    let queryParams = [uId];
    let sql = `SELECT COUNT(service_orders.so_id) AS ordersCount 
               FROM  service_orders 
               LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id              
               WHERE service_orders.fleet_id IN (SELECT fleet_id FROM sales_agent_fleet_assignment WHERE sales_agent_id = ? AND active = 1)  
               `;
    if(searchString) {
      sql += ` AND vehicles.reg_number LIKE ? `;
      queryParams.push(`%`+searchString+`%`);
    }  
    if(timePeriodFilter) {
      if(timePeriodFilter === 'luna curenta') {
        let d = new Date();
        d.setMonth(d.getMonth());
        d.setDate(0);
        d.setHours(0, 0, 0, 0);
        let startT = d.getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'luna trecuta') {
        let now = new Date();
        let endT  = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
        let startT = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul curent') {
        let n = new Date();
        let startT = new Date(n.getFullYear(), 0, 1).getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul trecut') {
        let startT  = new Date(new Date().getFullYear() - 1, 0, 1).getTime();
        let endT = new Date(new Date().getFullYear() - 1, 11, 0).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      }
    }
    let res = await this._query(sql, queryParams);
    return parseInt(res[0]?.ordersCount);           
  }

  getAgentOrders = async (uId, currentPage, pageLimit, searchString, timePeriodFilter) => {
    let queryParams = [uId];
    let page = parseInt(currentPage);
    let limit = parseInt(pageLimit);
    let limitOffset = page * limit; 
    let sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, service_orders.vehicle_mileage, partner_info.partner_name, service_orders.order_total_partner AS order_total, fleet_info.fleet_name, service_orders.order_total_fleet    
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 LEFT JOIN partner_info ON service_orders.partner_id = partner_info.pi_id 
                 LEFT JOIN fleet_info ON service_orders.fleet_id = fleet_info.fi_id 
                 WHERE service_orders.fleet_id IN (SELECT fleet_id FROM sales_agent_fleet_assignment WHERE sales_agent_id = ? AND active = 1)  
                  `;  
    if(searchString) {
      sql += ` AND vehicles.reg_number LIKE ? `;
      queryParams.push(`%`+searchString+`%`);
    }  
    if(timePeriodFilter) {
      if(timePeriodFilter === 'luna curenta') {
        let d = new Date();
        d.setMonth(d.getMonth());
        d.setDate(0);
        d.setHours(0, 0, 0, 0);
        let startT = d.getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'luna trecuta') {
        let now = new Date();
        let endT  = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
        let startT = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul curent') {
        let n = new Date();
        let startT = new Date(n.getFullYear(), 0, 1).getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul trecut') {
        let startT  = new Date(new Date().getFullYear() - 1, 0, 1).getTime();
        let endT = new Date(new Date().getFullYear() - 1, 11, 0).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      }
    }                
    sql +=` ORDER BY service_orders.created DESC  `;
    sql += ` LIMIT ${limitOffset} , ${limit} `;
    return await this._query(sql,queryParams);              
  }

  countFleetOrdersByUserId = async (fId, searchString, timePeriodFilter) => {
    let queryParams = [fId];
    let sql = `SELECT COUNT(service_orders.so_id) AS ordersCount
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.fleet_id = ? `;  
    if(searchString) {
      sql += ` AND vehicles.reg_number LIKE ? `;
      queryParams.push(`%`+searchString+`%`);
    }  
    if(timePeriodFilter) {
      if(timePeriodFilter === 'luna curenta') {
        let d = new Date();
        d.setMonth(d.getMonth());
        d.setDate(0);
        d.setHours(0, 0, 0, 0);
        let startT = d.getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'luna trecuta') {
        let now = new Date();
        let endT  = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
        let startT = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul curent') {
        let n = new Date();
        let startT = new Date(n.getFullYear(), 0, 1).getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul trecut') {
        let startT  = new Date(new Date().getFullYear() - 1, 0, 1).getTime();
        let endT = new Date(new Date().getFullYear() - 1, 11, 0).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      }
    }
    let res = await this._query(sql, queryParams);
    return parseInt(res[0]?.ordersCount); 
  }

  getFleetOrdersByUserId = async (fId, currentPage, pageLimit, searchString, timePeriodFilter) => {
    let queryParams = [fId];
    let page = parseInt(currentPage);
    let limit = parseInt(pageLimit);
    let limitOffset = page * limit; 
    let sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, service_orders.vehicle_mileage, service_orders.order_total_fleet AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.fleet_id = ?  `;  
    if(searchString) {
      sql += ` AND vehicles.reg_number LIKE ? `;
      queryParams.push(`%`+searchString+`%`);
    }  
    if(timePeriodFilter) {
      if(timePeriodFilter === 'luna curenta') {
        let d = new Date();
        d.setMonth(d.getMonth());
        d.setDate(0);
        d.setHours(0, 0, 0, 0);
        let startT = d.getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'luna trecuta') {
        let now = new Date();
        let endT  = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
        let startT = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul curent') {
        let n = new Date();
        let startT = new Date(n.getFullYear(), 0, 1).getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul trecut') {
        let startT  = new Date(new Date().getFullYear() - 1, 0, 1).getTime();
        let endT = new Date(new Date().getFullYear() - 1, 11, 0).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      }
    }             
    sql +=` ORDER BY service_orders.created DESC  `;
    sql += ` LIMIT ${limitOffset} , ${limit} `;
    return await this._query(sql,queryParams);                   
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

  countPartnerOrdersByUserId = async (pId, searchString, timePeriodFilter) => {
    let queryParams = [pId];
    let sql = `SELECT COUNT(service_orders.so_id) AS ordersCount
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.partner_id = ? `;  
    if(searchString) {
      sql += ` AND vehicles.reg_number LIKE ? `;
      queryParams.push(`%`+searchString+`%`);
    }  
    if(timePeriodFilter) {
      if(timePeriodFilter === 'luna curenta') {
        let d = new Date();
        d.setMonth(d.getMonth());
        d.setDate(0);
        d.setHours(0, 0, 0, 0);
        let startT = d.getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'luna trecuta') {
        let now = new Date();
        let endT  = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
        let startT = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul curent') {
        let n = new Date();
        let startT = new Date(n.getFullYear(), 0, 1).getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul trecut') {
        let startT  = new Date(new Date().getFullYear() - 1, 0, 1).getTime();
        let endT = new Date(new Date().getFullYear() - 1, 11, 0).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      }
    }
    let res = await this._query(sql, queryParams);
    return parseInt(res[0]?.ordersCount); 
  }

  getPartnerOrdersByUserId = async (pId, currentPage, pageLimit, searchString, timePeriodFilter) => {
    let queryParams = [pId];
    let page = parseInt(currentPage);
    let limit = parseInt(pageLimit);
    let limitOffset = page * limit; 
    let sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total  
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 WHERE service_orders.partner_id = ?  `;
    if(searchString) {
      sql += ` AND vehicles.reg_number LIKE ? `;
      queryParams.push(`%`+searchString+`%`);
    }  
    if(timePeriodFilter) {
      if(timePeriodFilter === 'luna curenta') {
        let d = new Date();
        d.setMonth(d.getMonth());
        d.setDate(0);
        d.setHours(0, 0, 0, 0);
        let startT = d.getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'luna trecuta') {
        let now = new Date();
        let endT  = new Date(now.getFullYear(), now.getMonth(), 0).getTime();
        let startT = new Date(now.getFullYear(), now.getMonth()-1, 1).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul curent') {
        let n = new Date();
        let startT = new Date(n.getFullYear(), 0, 1).getTime();
        let endT = Date.now();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      } else if(timePeriodFilter === 'anul trecut') {
        let startT  = new Date(new Date().getFullYear() - 1, 0, 1).getTime();
        let endT = new Date(new Date().getFullYear() - 1, 11, 0).getTime();
        sql += ` AND ( service_orders.created >= ${startT} AND ${endT} >= service_orders.created )  `; 
      }
    }               
    sql +=` ORDER BY service_orders.created DESC  `;
    sql += ` LIMIT ${limitOffset} , ${limit} `;
    return await this._query(sql,queryParams);                      
  }

  getPartnerOrderDetails = async (pId, oId) => {
    let orderDetails = {};
    let sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, vehicles.vehicle_tire_count, vehicles.vehicle_type, service_orders.vehicle_mileage, service_orders.order_total_partner AS order_total  
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
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, vehicles.vehicle_tire_count, vehicles.vehicle_type, service_orders.vehicle_mileage, partner_info.partner_name, service_orders.order_total_partner AS order_total, fleet_info.fleet_name, service_orders.order_total_fleet      
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 LEFT JOIN partner_info ON service_orders.partner_id = partner_info.pi_id 
                 LEFT JOIN fleet_info ON service_orders.fleet_id = fleet_info.fi_id  
                 WHERE service_orders.so_id = ? AND service_orders.fleet_id IN (SELECT fleet_id FROM sales_agent_fleet_assignment WHERE sales_agent_id = ? AND active = 1)  `;
    const result = await this._query(sql, [oId, uId]);
    
    if(!result.length) {
      return [];
    } else {
      const sqlOrderDets = `SELECT sod_id, service_name, service_cost_partner AS order_detail_cost, service_cost_fleet AS order_detail_cost_fleet, created 
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
          order_total_fleet: result[0].order_total_fleet,
          order_details: resOrderDets,
          partner_name: result[0].partner_name,
          fleet_name: result[0].fleet_name
        }        
        return orderDetails;
      }
    }  
  }

  getOrderDetails = async oId => {
    let orderDetails = {};
    const sql = `SELECT service_orders.so_id, service_orders.created , vehicles.reg_number, vehicles.vehicle_tire_count, vehicles.vehicle_type, service_orders.vehicle_mileage, partner_info.partner_name, service_orders.order_total_partner AS order_total, fleet_info.fleet_name, service_orders.order_total_fleet      
                 FROM  service_orders 
                 LEFT JOIN vehicles ON service_orders.vehicle_id = vehicles.v_id 
                 LEFT JOIN partner_info ON service_orders.partner_id = partner_info.pi_id 
                 LEFT JOIN fleet_info ON service_orders.fleet_id = fleet_info.fi_id 
                 WHERE service_orders.so_id = ? `;
    const result = await this._query(sql, [oId]);
    
    if(!result.length) {
      return [];
    } else {
      const sqlOrderDets = `SELECT sod_id, service_name, service_cost_partner AS order_detail_cost, service_cost_fleet AS order_detail_cost_fleet, created 
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
          order_total_fleet: result[0].order_total_fleet,
          order_details: resOrderDets,
          partner_name: result[0].partner_name,
          fleet_name: result[0].fleet_name
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