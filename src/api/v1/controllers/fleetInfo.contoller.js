const query = require('../db/db-connection');
const DBFleetInfoModel = require('../models/fleetInfo.model');
const FleetInfoModel = new DBFleetInfoModel(query);
const DBVehicleModel = require('../models/vehicle.model');
const VehicleModel = new DBVehicleModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
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
      
    } 

    if(!fleet || !fleet.length) {
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
      let fleetVehicleList = await VehicleModel.find({fleet_id: req.query.fleet_id});
      res.send(fleetVehicleList); 
    }
  }


  getFleetFiltersValues = async (req, res, next) => {
    let fleetsRegions = await FleetInfoModel.getDistinctFleetsRegions();
    
    let fleetsFiltersValues = [{fleetsRegions: fleetsRegions}];
    res.send(fleetsFiltersValues);      
  }

  deleteFleetInfo = async (req, res, next) => {
    const result = await FleetInfoModel.delete(req.params.id);
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

}


module.exports = new FleetInfoController;