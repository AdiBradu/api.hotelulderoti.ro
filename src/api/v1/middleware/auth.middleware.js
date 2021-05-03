const query = require('../db/db-connection');
const HttpException = require('../utils/HttpException.utils');
const DBUserModel = require('../models/user.model');
const UserModel = new DBUserModel(query);

const auth = (...roles) => {
  return async function (req, res, next) {
    try {
    
      if(!req.session || !req.session.userId || !req.session.userRole) {
        throw new HttpException(401, 'Access interzis.');
      }
  
      const user = await UserModel.findOne({ u_id: req.session.userId });
    
      if(!user) {
        throw new HttpException(401, 'Access interzis.');
      }

      if(roles.length && !roles.includes(user.user_type)) {
        throw new HttpException(401, 'Access interzis');
      }

      req.currentUser = user;
      
      next();
    } catch(e) {
      e.status = 401;
      next(e);
    }
  }
}

module.exports = auth;