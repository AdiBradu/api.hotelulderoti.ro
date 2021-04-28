const query = require('../db/db-connection');
const DBFleetInfoModel = require('../models/fleetInfo.model');
const FleetInfoModel = new DBFleetInfoModel(query);
const DBVehicleModel = require('../models/vehicle.model');
const VehicleModel = new DBVehicleModel(query);
const DBTireWidthModel = require('../models/tireWidth.model');
const TireWidthModel = new DBTireWidthModel(query);
const DBTireSpeedIndexModel = require('../models/tireSpeedIndex.model');
const TireSpeedIndexModel = new DBTireSpeedIndexModel(query);
const DBTireRimModel = require('../models/tireRim.model');
const TireRimModel = new DBTireRimModel(query);
const DBTirePositionModel = require('../models/tirePosition.model');
const TirePositionModel = new DBTirePositionModel(query);
const DBTireLoadIndexModel = require('../models/tireLoadIndex.model');
const TireLoadIndexModel = new DBTireLoadIndexModel(query);
const DBTireHeightModel = require('../models/tireHeight.model');
const TireHeightModel = new DBTireHeightModel(query);
const DBTireBrandModel = require('../models/tireBrand.model');
const TireBrandModel = new DBTireBrandModel(query);


const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const dotenv = require('dotenv');
dotenv.config();


class VehicleController {

  getAllVehicles = async (req, res, next) => {
    let vehicleList = await VehicleModel.find();
    if(!vehicleList.length) {
      throw new HttpException(404, 'Nici un vehicul gasit');
    }

    res.send(vehicleList);
  }

  getVehicleById = async (req, res, next) => {
    const vehicle = await VehicleModel.findOne({v_id: req.params.id});
    if(!vehicle) {
      throw new HttpException(404, 'Vehiculul nu a fost gasit');
    }

    res.send(vehicle);
  }

  getVehicleByRegNumber = async (req, res, next) => {
    const vehicle = await VehicleModel.findOne({reg_number: req.params.reg_number});
    if(!vehicle) {
      throw new HttpException(404, 'Vechiculul nu a fost gasit');
    }

    res.send(vehicle);
  }

  searchVehicles = async (req, res, next) => {

    let searchParams = [`${String(req.query.search)}%`];

    let vehiclesList = await VehicleModel.search(`reg_number LIKE ? `, searchParams);
  
    res.send(vehiclesList);    
  }


  getVehicleTireAttributes = async (req, res, next) => {
    let widthsList = await TireWidthModel.find();
    let speedIndexesList = await TireSpeedIndexModel.find();
    let rimsList = await TireRimModel.find();
    let positionsList = await TirePositionModel.find();
    let loadIndexesList = await TireLoadIndexModel.find();

    const tireAttributes = {widthsList, speedIndexesList, rimsList, positionsList, loadIndexesList};
    res.send(tireAttributes);     
  }

  deleteVehicle = async (req, res, next) => {
    const result = await VehicleModel.delete(req.params.id);
    if(!result) {
      throw new HttpException(404, 'Vehiculul nu a fost gasit');
    }
    res.send('Vehicul deleted');
  }
  
  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }

}


module.exports = new VehicleController;