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
const DBSalesAgentFleetAssignmentModel = require('../models/salesAgentFleetAssignment.model');
const SalesAgentFleetAssignmentModel = new DBSalesAgentFleetAssignmentModel(query);
const DBTireModel = require('../models/tire.model');
const TireModel = new DBTireModel(query);

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
    const vehicle = await VehicleModel.findByRegNumber({reg_number: req.query.searchString});
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

  getVehiclesWithTires = async (req, res, next) => {
    let searchParams = [];
    let customSearchString=``;
    if(!req.query.vId) {
      throw new HttpException(401, 'Acces interzis');
    } else {
      let hasAccess = await VehicleModel.checkVehicleWriteAccess(req.query.vId, req.session.userId, req.session.userRole);
      if(!hasAccess) {
        throw new HttpException(401, 'Acces interzis');  
      }
      let vehicleWithTires = await VehicleModel.getVehicleWithTires(req.query.vId);
      res.send(vehicleWithTires); 
    }
  }

  

  getVehicleTireAttributes = async (req, res, next) => {
    
    let heightsList = await TireHeightModel.find();
    let widthsList = await TireWidthModel.find();
    let speedIndexesList = await TireSpeedIndexModel.find();
    let rimsList = await TireRimModel.find();
    let positionsList = await TirePositionModel.find();
    let loadIndexesList = await TireLoadIndexModel.find();
    let brandsList = await TireBrandModel.find();

    const tireAttributes = {heightsList, widthsList, speedIndexesList, rimsList, positionsList, loadIndexesList, brandsList};
    res.send(tireAttributes);     
  }
  
  updateVehicle = async (req, res, next) => {
    let hasAccess = await VehicleModel.checkVehicleWriteAccess(req.params.id, req.session.userId, req.session.userRole);  
    if(!hasAccess) {
      throw new HttpException(401, 'Acces interzis');  
    }

    const result = await VehicleModel.updateWithTires(req.body, req.params.id);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    const { affectedRows, changedRows, info } = result;

    const message = !affectedRows ? 'Vehicle not found' : 
      affectedRows && changedRows ? 'Vehicle successfully updated' : 'Update failed';

    res.send({message, info});
  }

  createVehicle = async (req, res, next) => {
    /* this.checkValidation(req); */
    if(req.session.userRole === 3) {
      const fleetUserAccessCheck = await FleetInfoModel.find({fi_id: parseInt(req.body.fleetId), user_id: req.session.userId})
      if(!fleetUserAccessCheck || fleetUserAccessCheck.length < 1) {
        throw new HttpException(401, 'Acces interzis');  
      }
    }

    if(req.session.userRole === 2) {
      const agentAccessCheck = await SalesAgentFleetAssignmentModel.find({fleet_id: parseInt(req.body.fleetId), sales_agent_id: req.session.userId, active: 1})
      if(!agentAccessCheck || agentAccessCheck.length < 1) {
        throw new HttpException(401, 'Acces interzis');  
      }
    }
    
    const checkVehicleDuplicate = await VehicleModel.find({reg_number: req.body.regNumber, in_use: 1});
    if(checkVehicleDuplicate && checkVehicleDuplicate.length > 0) {
      throw new HttpException(402, 'Vehicul duplicat');  
    }

    const vehicleData = {
      fleet_id : req.body.fleetId,
      vehicle_tire_count: req.body.vehicle_tire_count,
      reg_number: req.body.regNumber,
      vehicle_brand: req.body.vechicleBrand,
      vehicle_model: req.body.vechicleModel,
      vehicle_type: req.body.vehicleType,
      vehicle_milage: req.body.vechicleMilage,
      in_use: 1,      
      created: Date.now(),
      updated: Date.now()
    }
    const newVehicleId = await VehicleModel.create(vehicleData);

    if(!newVehicleId) {
      throw new HttpException(500, 'Something went wrong');
    }

    let vehicleTires = []
    for(let i=0; i<req.body.vehicle_tire_count; i++) {
      let tireToIns = {
        vehicle_id: newVehicleId,
        fleet_id:  parseInt(req.body.fleetId),
        tire_position: parseInt(i+1),
        tire_width: parseInt(req.body.vehicleTires.widths[i]),
        tire_height: parseInt(req.body.vehicleTires.heights[i]),
        tire_diameter: parseInt(req.body.vehicleTires.diameters[i]),
        tire_speed_index: parseInt(req.body.vehicleTires.speedIndexes[i]),
        tire_load_index: parseInt(req.body.vehicleTires.loadIndexes[i]),
        tire_brand: parseInt(req.body.vehicleTires.brands[i]),
        tire_model: req.body.vehicleTires.models[i],
        tire_season: req.body.vehicleTires.seasons[i],
        tire_dot: req.body.vehicleTires.dots[i],
        tire_rim: parseInt(req.body.vehicleTires.rims[i]),
        tire_tread_wear: parseFloat(req.body.vehicleTires.treadUsages[i]),
        created: Date.now(),
        updated: Date.now()
      }    
      let newTireResult = await TireModel.create(tireToIns);
      if(!newTireResult) {
        throw new HttpException(500, 'Something went wrong');
      }
    }

    
    res.status(201).send('Vehicul adaugat cu succes!');
  }


  createVehiclesBulk = async (req, res, next) => {
    
    if(req.session.userRole === 3) {
      const fleetUserAccessCheck = await FleetInfoModel.find({fi_id: parseInt(req.body.vehiclesList[0].fleetId), user_id: req.session.userId})
      if(!fleetUserAccessCheck || fleetUserAccessCheck.length < 1) {
        throw new HttpException(401, 'Acces interzis');  
      }
    }

    if(req.session.userRole === 2) {      
      const agentAccessCheck = await SalesAgentFleetAssignmentModel.find({fleet_id: parseInt(req.body.vehiclesList[0].fleetId), sales_agent_id: req.session.userId, active: 1})
      if(!agentAccessCheck || agentAccessCheck.length < 1) {
        throw new HttpException(401, 'Acces interzis');  
      }      
    }
    
    for (const [index, el] of req.body.vehiclesList.entries()) {  
      let duplicateErr = false;
      try {
        let checkVehicleDuplicate = await VehicleModel.find({reg_number: el.regNumber, in_use: 1});
        if(checkVehicleDuplicate && checkVehicleDuplicate.length > 0) {
          duplicateErr = true;
        } 
      } catch (error) {
        duplicateErr = true;
      }
      if(!duplicateErr) {
        let vehicleData = {
          fleet_id : el.fleetId,
          vehicle_tire_count: el.vehicle_tire_count,
          reg_number: el.regNumber,
          vehicle_brand: el.vechicleBrand,
          vehicle_model: el.vechicleModel,
          vehicle_type: el.vehicleType,
          vehicle_milage: el.vechicleMilage,
          in_use: 1,      
          created: Date.now(),
          updated: Date.now()
        }
        let newVehicleId = await VehicleModel.create(vehicleData);

        if(!newVehicleId) {
          throw new HttpException(500, 'Something went wrong');
        }

        let vehicleTires = []
        for(let i=0; i<el.vehicle_tire_count; i++) {
          let tireToIns = {
            vehicle_id: newVehicleId,
            fleet_id:  parseInt(el.fleetId),
            tire_position: parseInt(i+1),
            tire_width: parseInt(el.vehicleTires.widths[i]),
            tire_height: parseInt(el.vehicleTires.heights[i]),
            tire_diameter: parseInt(el.vehicleTires.diameters[i]),
            tire_speed_index: parseInt(el.vehicleTires.speedIndexes[i]),
            tire_load_index: parseInt(el.vehicleTires.loadIndexes[i]),
            tire_brand: parseInt(el.vehicleTires.brands[i]),
            tire_model: el.vehicleTires.models[i],
            tire_season: el.vehicleTires.seasons[i],
            tire_dot: el.vehicleTires.dots[i],
            tire_rim: parseInt(el.vehicleTires.rims[i]),
            tire_tread_wear: parseFloat(el.vehicleTires.treadUsages[i]),
            created: Date.now(),
            updated: Date.now()
          }    
          let newTireResult = await TireModel.create(tireToIns);
          if(!newTireResult) {
            throw new HttpException(500, 'Something went wrong');
          }
        }
      }

    }
    
    res.status(201).send('Vehicule adaugate cu succes!');
  }

  deleteVehicle = async (req, res, next) => {
    let result;
    if(req.session.userRole === 1) {
      result = await VehicleModel.delete(req.params.id);
    } else if(req.session.userRole === 2) {
      result = await VehicleModel.agentDelete(req.params.id, req.session.userId);
    } else if(req.session.userRole === 3) {
      result = await VehicleModel.fleetUserDelete(req.params.id, req.session.userId);
    }
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