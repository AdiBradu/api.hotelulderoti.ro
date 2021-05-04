const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBPartnerInfoModel {
  tableName = 'partner_info';
  
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

  search = async (customWhereQueryString, searchParams) => {
    let sql = `SELECT partner_info.partner_name, partner_info.partner_region
      FROM ${this.tableName}`;

    sql += ` WHERE ${customWhereQueryString}`;

    return await this._query(sql, searchParams);
  }

  findOne = async (params) => {
    const { columnSet, values } = multipleColumnSet(params);
    const sql = `SELECT * FROM ${this.tableName}
                 WHERE ${columnSet}`;
    
    const result = await this._query(sql, [...values]);
    
    return result[0];
  }

  getWithUserData = async id => {
    const sql = `SELECT users.email, users.first_name, users.last_name, users.phone, partner_info.partner_name, partner_info.partner_gov_id, partner_info.partner_j, partner_info.partner_address, partner_info.partner_region, partner_info.partner_city 
                FROM partner_info LEFT JOIN users ON partner_info.user_id = users.u_id
                WHERE partner_info.pi_id = ?`;
    const result = await this._query(sql, [id]);
    return result[0];
  }

  getDistinctPartnerRegions = async () => {
    let sql = `SELECT DISTINCT(partner_region) FROM ${this.tableName}`;
    return await this._query(sql);
  }

  getAgentPartners = async (agentId) => {
    let sql = `SELECT ${this.tableName}.pi_id, ${this.tableName}.partner_name, ${this.tableName}.partner_region  
      FROM ${this.tableName}
      LEFT JOIN sales_agent_partner_assignment ON ${this.tableName}.pi_id = sales_agent_partner_assignment.partner_id
      WHERE sales_agent_partner_assignment.sales_agent_id = ? AND sales_agent_partner_assignment.active = 1
      `;
   
    return await this._query(sql, [agentId]);
    
  }


  checkPartnerWriteAccess = async (id, userId, userRole) => {
    let hasAccess = false;
    let accessSql;
    let accessRes;
    if(userRole === 1) {
      hasAccess = true;
    } else if(userRole === 2) {
      accessSql = `SELECT sapa_id 
                      FROM sales_agent_partner_assignment 
                      WHERE sales_agent_partner_assignment.sales_agent_id = ? AND sales_agent_partner_assignment.active = 1 AND sales_agent_partner_assignment.partner_id = ? `;
      accessRes = await this._query(accessSql, [userId,id]);
      if(accessRes &&  accessRes.length) {
        hasAccess = true;  
      }
    } else if(userRole === 4) {
      accessSql = `SELECT pi_id 
                      FROM partner_info 
                      WHERE user_id = ? AND pi_id = ? `;
      accessRes = await this._query(accessSql, [userId,id]);     
      if(accessRes && accessRes.length) {
        hasAccess = true;  
      }
    }
    return hasAccess;
  }

  create = async ({user_id, partner_name, partner_gov_id, partner_j, partner_address, partner_region, partner_city, created = Date.now(), updated = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (user_id, partner_name, partner_gov_id, partner_j, partner_address, partner_region, partner_city, created, updated) VALUES (?,?,?,?,?,?,?,?,?)`;
   
    const result = await this._query(sql, [user_id, partner_name, partner_gov_id, partner_j, partner_address, partner_region, partner_city, created, updated]);
    const lastPartnerInsId = result ? result.insertId : 0;

    return lastPartnerInsId;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE pi_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  updatePartner = async (params, id) => {

    let uVals = [params.email,params.first_name,params.last_name,params.phone];
    
    let sql = `UPDATE partner_info, users `;
    sql += ` SET users.email = ? , users.first_name = ? , users.last_name = ? , users.phone = ? `;
    if(params.password) {
      sql += ` , users.password = ? `;  
      uVals = [...vals, params.password];
    }

    let pVals = [params.partner_name,params.partner_gov_id,params.partner_j,params.partner_address,params.partner_region,params.partner_city];
    sql += ` , partner_info.partner_name = ? , partner_info.partner_gov_id = ? , partner_info.partner_j = ? , partner_info.partner_address = ? , partner_info.partner_region = ? , partner_info.partner_city = ? 
              WHERE partner_info.user_id = users.u_id AND partner_info.pi_id = ? `;
    let updVals = [...uVals, ...pVals];
    
    const result = await this._query(sql, [...updVals, id]);
  
    return result;
  }


  delete = async (id) => {
    //service orders and details related to the partner delete
    const sqlOrders = `DELETE service_orders, service_orders_details FROM service_orders
    INNER JOIN
    service_orders_details ON service_orders_details.service_order_id = service_orders.so_id 
    WHERE service_orders.partner_id  = ?`;
    const resOrders = await this._query(sqlOrders, [id]);

    //partner and related user info delete
    const sql = `DELETE partner_info, users FROM partner_info
    INNER JOIN
    users ON users.u_id = partner_info.user_id 
    WHERE partner_info.pi_id  = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

  agentDelete = async (id, userId) => {    
    const accessSql = `SELECT sapa_id 
                      FROM sales_agent_partner_assignment 
                      WHERE sales_agent_partner_assignment.sales_agent_id = ? AND sales_agent_partner_assignment.active = 1 AND sales_agent_partner_assignment.partner_id = ? `;
    const accessRes = await this._query(accessSql, [userId,id]);                   
    if(accessRes && accessRes.length > 0) {
      //service orders and details related to the partner delete
      const sqlOrders = `DELETE service_orders, service_orders_details FROM service_orders
                  INNER JOIN
                  service_orders_details ON service_orders_details.service_order_id = service_orders.so_id 
                  WHERE service_orders.partner_id  = ?`;
      const resOrders = await this._query(sqlOrders, [id]);
      
      //partner and related user info delete
      const sql = `DELETE partner_info, users FROM partner_info
                  INNER JOIN
                  users ON users.u_id = partner_info.user_id 
                  WHERE partner_info.pi_id  = ?`;
      const result = await this._query(sql, [id]);
      let affectedRows = result ? result.affectedRows : 0;

      return affectedRows;
    } else {
      return 0;
    }
  }



}

module.exports = DBPartnerInfoModel;