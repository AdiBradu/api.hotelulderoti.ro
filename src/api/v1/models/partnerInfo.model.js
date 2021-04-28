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

  delete = async (id) => {
    const sql = `DELETE FROM ${this.tableName} WHERE pi_id = ?`;
    const result = await this._query(sql, [id]);
    const affectedRows = result ? result.affectedRows : 0;

    return affectedRows;
  }

}

module.exports = DBPartnerInfoModel;