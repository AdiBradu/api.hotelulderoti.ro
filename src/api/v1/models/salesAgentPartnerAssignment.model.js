const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');

class DBSalesAgentPartnerAssignmentModel {
  tableName = 'sales_agent_partner_assignment';
  
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

  create = async ({partner_id, sales_agent_id, active=1, created = Date.now(), updated = Date.now()}) => {
    const sql = `INSERT INTO ${this.tableName}
    (partner_id, sales_agent_id, active, created, updated) VALUES (?,?,?,?,?)`;
   
    const result = await this._query(sql, [partner_id, sales_agent_id, active, created, updated]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

  update = async (params, id) => {
    const { columnSet, values } = multipleColumnSet(params);

    const sql = `UPDATE ${this.tableName} SET ${columnSet} WHERE sapa_id = ?`;
    const result = await this._query(sql, [...values, id]);

    return result;
  }

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE sapa_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBSalesAgentPartnerAssignmentModel;