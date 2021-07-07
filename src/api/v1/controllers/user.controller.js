const query = require('../db/db-connection');
const DBUserModel = require('../models/user.model');
const UserModel = new DBUserModel(query);
const DBFleetInfoModel = require('../models/fleetInfo.model');
const FleetInfoModel = new DBFleetInfoModel(query);
const DBPartnerInfoModel = require('../models/partnerInfo.model');
const PartnerInfoModel = new DBPartnerInfoModel(query);
const DBSalesAgentFleetAssignmentModel = require('../models/salesAgentFleetAssignment.model');
const SalesAgentFleetAssignmentModel = new DBSalesAgentFleetAssignmentModel(query);
const DBSalesAgentPartnerAssignmentModel = require('../models/salesAgentPartnerAssignment.model');
const SalesAgentPartnerAssignmentModel = new DBSalesAgentPartnerAssignmentModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();


class UserController {

  getAllUsers = async (req, res, next) => {
    let userList = await UserModel.find();
    if(!userList.length) {
      throw new HttpException(404, 'No users found');
    }

    userList = userList.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.send(userList);
  }
  
  getAllAgents = async (req, res, next) => {
    let userList = await UserModel.find({user_type: 2});
    if(!userList.length) {
      throw new HttpException(404, 'No users found');
    }

    userList = userList.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.send(userList);
  }

  getAllManagers = async (req, res, next) => {
    let userList = await UserModel.find({user_type: 5});
    if(!userList.length) {
      throw new HttpException(404, 'No users found');
    }

    userList = userList.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.send(userList);
  }

  getUserById = async (req, res, next) => {
    const user = await UserModel.findOne({u_id: req.params.id});
    if(!user) {
      throw new HttpException(404, 'User not found');
    }

    const {password, ...userWithoutPassword} = user;

    res.send(userWithoutPassword);
  }

  getUserByUserName = async (req, res, next) => {
    const user = await UserModel.findOne({username: req.params.username});
    if(!user) {
      throw new HttpException(404, 'User not found');
    }

    const { password, ...userWithoutPassword } = user;

    res.send(userWithoutPassword);
  }

  getCurrentUser = async (req, res, next) => {
    const currentU =(req.session.currentUser ? req.session.currentUser : null);

    res.set('Cache-Control', 'no-store')
    .set('Pragma', 'no-cache')
    .set('Expires', 0)
    .set('Surrogate-Control', 'no-store')
    .send(currentU);
  }

  createUser = async (req, res, next) => {
    this.checkValidation(req);

    await this.hashPassword(req);
    
    if(req.session && req.session.userId) {
      req.body.created_by = req.session.userId;  
    }
    const result = await UserModel.create(req.body);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    res.status(201).send('User was created!');
  }

  createAdmin = async (req, res, next) => {
    this.checkValidation(req);

    await this.hashPassword(req);
    
    if(req.session && req.session.userId) {
      req.body.user_type = 1;
      req.body.created_by = req.session.userId;
    }
    const result = await UserModel.create(req.body);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    res.status(201).send('User was created!');
  }

  createSalesAgent = async (req, res, next) => {
    this.checkValidation(req);

    await this.hashPassword(req);
    
    if(req.session && req.session.userId) {
      req.body.user_type = 2;
      req.body.created_by = req.session.userId;
    }
    const result = await UserModel.create(req.body);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    res.status(201).send('User was created!');
  }

  createHotelManager = async (req, res, next) => {
    this.checkValidation(req);

    await this.hashPassword(req);
    
    if(req.session && req.session.userId) {
      req.body.user_type = 5;
      req.body.created_by = req.session.userId;
    }
    const result = await UserModel.create(req.body);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    res.status(201).send('User was created!');
  }

  createFleetUser = async (req, res, next) => {
    this.checkValidation(req);

    await this.hashPassword(req);
    
    const userData = {
      user_type : 3,
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password: req.body.password,
      phone: req.body.phone,
      created_by: req.session.userId,
      created: Date.now(),
      updated: Date.now()
    }
    const result = await UserModel.create(userData);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    const fleetInfo = {
      user_id: result,
      fleet_name: req.body.fleet_name,
      fleet_gov_id: req.body.fleet_gov_id,
      fleet_j: req.body.fleet_j,
      fleet_address: req.body.fleet_address,
      fleet_region: req.body.fleet_region,
      fleet_city: req.body.fleet_city,
      fleet_percent: parseFloat(req.body.fleet_percent),
      created: Date.now(),
      updated: Date.now()
    }

    const fleetInfoResult = await FleetInfoModel.create(fleetInfo);

    if(!fleetInfoResult) {
      throw new HttpException(500, 'Something went wrong');
    }

    if(req.session.userRole === Role.SalesAgent) {
      const fleetAssignment = {
        fleet_id: fleetInfoResult, 
        sales_agent_id: req.session.userId,
        active: 1,
        created: Date.now(),
        updated: Date.now()
      }

      const fleetAssignmentResult = await SalesAgentFleetAssignmentModel.create(fleetAssignment);

      if(!fleetAssignmentResult) {
        throw new HttpException(500, 'Something went wrong');
      }

    }
    
    res.status(201).send('Flota adaugata cu succes!');
  }

  createPartner = async (req, res, next) => {
    this.checkValidation(req);

    await this.hashPassword(req);
    
    const userData = {
      user_type : 4,
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone: req.body.phone,
      password: req.body.password,
      created_by: req.session.userId,
      created: Date.now(),
      updated: Date.now()
    }
    const result = await UserModel.create(userData);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    const partnerInfo = {
      user_id: result,
      partner_name: req.body.partner_name,
      partner_gov_id: req.body.partner_gov_id,
      partner_j: req.body.partner_j,
      partner_address: req.body.partner_address,
      partner_region: req.body.partner_region,
      partner_city: req.body.partner_city,
      partner_percent: parseFloat(req.body.partner_percent),
      hotel_enabled: parseInt(req.body.hotel_enabled),
      created: Date.now(),
      updated: Date.now()
    }

    const partnerInfoResult = await PartnerInfoModel.create(partnerInfo);

    if(!partnerInfoResult) {
      throw new HttpException(500, 'Something went wrong');
    } else {
      if(req.session.userRole === Role.SalesAgent) {
        const partnerAssignment = {
          partner_id: partnerInfoResult, 
          sales_agent_id: req.session.userId,
          active: 1,
          created: Date.now(),
          updated: Date.now()
        }
        
        const partnerAssignmentResult = await SalesAgentPartnerAssignmentModel.create(partnerAssignment);

        if(!partnerAssignmentResult) {        
          throw new HttpException(500, 'Something went wrong');
        }

      }
    }
    
    res.status(201).send('Partener adaugat cu succes!');
  }

  createPartnersBulk = async (req, res, next) => {
    
    for (const [index, el] of req.body.partnersList.entries()) { 
      let duplicateErr = false;
      try {
        let checkUserDuplicate = await UserModel.find({email: el.email});
        if(checkUserDuplicate && checkUserDuplicate.length > 0) {
          duplicateErr = true;
        } 
      } catch (error) {
        duplicateErr = true;
      }
      if(!duplicateErr) {
        el.password = await bcrypt.hash(el.password, 10);
        
        let userData = {
          user_type : 4,
          email: el.email,
          first_name: el.first_name,
          last_name: el.last_name,
          phone: el.phone,
          password: el.password,
          created_by: req.session.userId,
          created: Date.now(),
          updated: Date.now()
        }
        let result = await UserModel.create(userData);

        if(!result) {
          throw new HttpException(500, 'Something went wrong');
        }

        let partnerInfo = {
          user_id: result,
          partner_name: el.partner_name,
          partner_gov_id: el.partner_gov_id,
          partner_j: el.partner_j,
          partner_address: el.partner_address,
          partner_region: el.partner_region,
          partner_city: el.partner_city,
          partner_percent: parseFloat(el.partner_percent),
          hotel_enabled: parseInt(el.hotel_enabled),
          created: Date.now(),
          updated: Date.now()
        }

        let partnerInfoResult = await PartnerInfoModel.create(partnerInfo);

        if(!partnerInfoResult) {
          throw new HttpException(500, 'Something went wrong');
        } else {
          if(req.session.userRole === Role.SalesAgent) {
            let partnerAssignment = {
              partner_id: partnerInfoResult, 
              sales_agent_id: req.session.userId,
              active: 1,
              created: Date.now(),
              updated: Date.now()
            }
            
            let partnerAssignmentResult = await SalesAgentPartnerAssignmentModel.create(partnerAssignment);

            if(!partnerAssignmentResult) {        
              throw new HttpException(500, 'Something went wrong');
            }

          }
        }
      }
    }
    
    res.status(201).send('Parteneri adaugati cu succes!');
  }

  updateUser = async (req, res, next) => {
    this.checkValidation(req);

    await this.hashPassword(req);

    const { confirm_password, ...restOfUpdates } = req.body;

    const updConds = req.session.userRole === 2 ? {u_id: req.params.id, created_by: req.session.userId} : {u_id: req.params.id};

    const result = await UserModel.update(restOfUpdates, updConds);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    const { affectedRows, changedRows, info } = result;

    const message = !affectedRows ? 'User not found' : 
      affectedRows && changedRows ? 'User successfully updated' : 'Update failed';

    res.send({message, info});  
  }

  selfUpdate  = async (req, res, next) => {
    this.checkValidation(req);

    await this.hashPassword(req);

    const{ confirm_password, ...restOfUpdates } = req.body;
  
    const result = await UserModel.update(restOfUpdates, {u_id: req.session.userId});

    if(!result) {
      throw new HttpException(500, 'Server error');
    }

    const { affectedRows, changedRows, info } = result;

    const message = !affectedRows ? 'Utilizatorul nu a fost gasit' : 
      affectedRows && changedRows ? 'Utilizator actualizat' : 'Actualizare esuata';
   
    const user = await UserModel.findOne({ u_id: req.session.userId});
    
    const { password, ...usr } = user;

    req.session.currentUser = user;
    
    res.send({message, info, usr});
  }


  deleteUser = async (req, res, next) => {
    
    const delConds = req.session.userRole === 2 ? {u_id: req.params.id, created_by: req.session.userId} : {u_id: req.params.id};

    const result = await UserModel.delete(delConds);
    
    if(!result) {
      throw new HttpException(404, 'User not found');
    }
    res.send('User has been deleted');
  }

  userLogin = async (req, res, next) => {
    this.checkValidation(req);

    const {username, password: pass} = req.body;

    const user = await UserModel.findOne({ email: username});

    if(!user) {
      throw new HttpException(402, 'Date de logare invalide');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if(!isMatch) {
      throw new HttpException(402, 'Date de logare invalide');
    }

    const { password, ...userWithoutPassword } = user;
    
    req.session.currentUser = userWithoutPassword;
    req.session.userId = user.u_id;
    req.session.userRole = user.user_type;

    res.send(userWithoutPassword);
  }


  logoutUser = async (req, res, next) => {
    await req.session.destroy();
    res.clearCookie('th_session', {
      path: '/'
    }).send('Logged out!');
  }

  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }

  hashPassword = async (req) => {
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
  }

}


module.exports = new UserController;