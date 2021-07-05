const query = require('../db/db-connection');
const DBFleetInfoModel = require('../models/fleetInfo.model');
const FleetInfoModel = new DBFleetInfoModel(query);
const DBVehicleModel = require('../models/vehicle.model');
const VehicleModel = new DBVehicleModel(query);
const DBUserModel = require('../models/user.model');
const UserModel = new DBUserModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();


class FleetInfoController {

  getAllFleets = async (req, res, next) => {

    if(req.session.userRole === 1) {      
      let fleetList = await FleetInfoModel.getAllFleets();
      if(!fleetList.length) {
        throw new HttpException(404, 'Nici o flota gasita');
      }
      res.send(fleetList);
    } else if(req.session.userRole === 2) {
      let fleetList = await FleetInfoModel.getAgentFleets(req.session.userId);
      if(!fleetList.length) {
        throw new HttpException(404, 'Nici o flota gasita');
      }
      res.send(fleetList);
    } else if(req.session.userRole === 5) {
      let fleetList = await FleetInfoModel.getAllHotelFleets(req.session.userId);
      if(!fleetList.length) {
        throw new HttpException(404, 'Nici o flota gasita');
      }
      res.send(fleetList);
    }
    
  }

  getFleetById = async (req, res, next) => {
    let fleet
    if(req.session.userRole === 1) {
      let searchParams = [req.params.id];
      fleet = await FleetInfoModel.search(`fi_id = ? `, searchParams);
    } else if(req.session.userRole === 2) {
      let searchParams = [req.session.userId, req.params.id];
      fleet = await FleetInfoModel.agentSearch(` AND fleet_info.fi_id = ? `, searchParams);      
    } else if(req.session.userRole === 5) {
      let searchParams = [req.params.id];
      fleet = await FleetInfoModel.hotelSearch(`fi_id = ? `, searchParams);
    }

    if(!fleet || !fleet.length) {
      throw new HttpException(401, 'Acces interzis');
    }
    res.send(fleet);
  }

  getWithUserDataByFleetId = async (req, res, next) => {
    let fleet
    if(req.session.userRole === 1) {     
      fleet = await FleetInfoModel.getWithUserDataByFleetId(req.params.id);
    } else if(req.session.userRole === 2) {      
      fleet = await FleetInfoModel.agentGetWithUserDataByFleetId(req.session.userId, req.params.id);
    } 

    if(!fleet) {
      throw new HttpException(401, 'Acces interzis');
    }
    res.send(fleet);
  }

  getFleetByUserId = async (req, res, next) => {
    let fleet
    if(req.session.userRole !== 3) {
      throw new HttpException(401, 'Acces interzis');
    }

    let searchParams = [req.session.userId];      
    fleet = await FleetInfoModel.search(`user_id = ?`, searchParams);

    if(!fleet || !fleet.length) {
      throw new HttpException(401, 'Acces interzis');
    }
    res.send(fleet);
  }


  getOwnDetails = async (req, res, next) => {
    const fleet = await FleetInfoModel.getWithUserDataByUId(req.session.userId);
    if(!fleet) {
      throw new HttpException(404, 'Flota nu a fost gasita');
    }

    res.send(fleet);
  }


  getFleetByName = async (req, res, next) => {
    const fleet = await FleetInfoModel.findOne({fleet_name: req.params.fleet_name});
    if(!fleet) {
      throw new HttpException(404, 'Flota nu a fost gasita');
    }

    res.send(fleet);
  }

  searchFleets = async (req, res, next) => {

    let searchParams = [`${String(req.query.search)}%`];

    let fleetList = await FleetInfoModel.search(`fleet_name LIKE ? `, searchParams);
    
    if(fleetList.length > 0){
      
      let fleetVehiclesList = await VehicleModel.find({fleet_id: fleetList[0].fi_id});

      fleetList = {...fleetList, fleetVehiclesList};
      
    }
  
    res.send(fleetList);    
  }


  filterFleets = async (req, res, next) => {
    let searchParams = [];
    let customSearchString=``;

    if(String(req.query.region) !== "") {
      searchParams = [...searchParams, String(req.query.region)];
      customSearchString += ` fleet_region = ? `;
    }
    
    if(searchParams.length < 1) {
      searchParams.push(1);  
      customSearchString += ' 1 = ?';
    }
    
    let fleetList = await FleetInfoModel.filterFleets(customSearchString, searchParams);
  
    res.send(fleetList);    
  }


  getFleetVehicles = async (req, res, next) => {
    let searchParams = [];
    let customSearchString=``;
    if(!req.query.fleet_id) {
      res.send([]);
    } else {
      if(req.session.userRole !== 5) {
        let fleetVehicleList = await VehicleModel.find({fleet_id: req.query.fleet_id});
        res.send(fleetVehicleList); 
      } else {
        let fleetVehicleList = await VehicleModel.findFleetHotelVehicles(req.query.fleet_id);
        res.send(fleetVehicleList);   
      }
    }
  }


  getFleetFiltersValues = async (req, res, next) => {
    let fleetsRegions = await FleetInfoModel.getDistinctFleetsRegions();
    
    let fleetsFiltersValues = [{fleetsRegions: fleetsRegions}];
    res.send(fleetsFiltersValues);      
  }

  updateFleet = async (req, res, next) => {
    this.checkValidation(req);

    let hasAccess = await FleetInfoModel.checkFleetWriteAccess(req.params.id, req.session.userId, req.session.userRole);  
    if(!hasAccess) {
      throw new HttpException(401, 'Acces interzis');  
    }
    
    await this.hashPassword(req);

    let { confirm_password, ...restOfUpdates } = req.body;

    let result ;
    if(req.session.userRole === 1) {
      result = await FleetInfoModel.updateFleet(restOfUpdates, req.params.id);
    } else {  
      result  = await FleetInfoModel.agentUpdateFleet(restOfUpdates, req.params.id);
    }

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    const { affectedRows, changedRows, info } = result;

    const message = !affectedRows ? 'Flota nu a fost gasita' : 
      affectedRows ? 'Flota actualizata' : 'Actualizare esuata';

    res.send({message, info});
  }

  selfUpdate = async (req, res, next) => { 
    this.checkValidation(req);
    
    await this.hashPassword(req);

    const{ confirm_password, ...restOfUpdates } = req.body;
  
    const result = await FleetInfoModel.updateFleetByUId(restOfUpdates, req.session.userId);

    if(!result) {
      throw new HttpException(500, 'Server error');
    }

    const { affectedRows, changedRows, info } = result;

    const message = !affectedRows ? 'Actualizare esuata' : 'Date actualizate';
   
    const user = await UserModel.findOne({ u_id: req.session.userId});
    
    const { password, ...usr } = user;

    req.session.currentUser = user;
    
    res.send({message, info, usr});
  }

  deleteFleetInfo = async (req, res, next) => {    
    let result;
    if(req.session.userRole === 1) {
      result = await FleetInfoModel.delete(req.params.id);
    } else if(req.session.userRole === 2) {
      result = await FleetInfoModel.agentDelete(req.params.id, req.session.userId);
    }

    if(!result) {
      throw new HttpException(404, 'Flota nu a fost gasita');
    }
    res.send('Flota deleted');
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


module.exports = new FleetInfoController;