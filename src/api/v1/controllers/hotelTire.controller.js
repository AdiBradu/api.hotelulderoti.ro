const query = require('../db/db-connection');
const DBHotelTireModel = require('../models/hotelTire.model');
const HotelTireModel = new DBHotelTireModel(query);
const DBVehicleModel = require('../models/vehicle.model');
const VehicleModel = new DBVehicleModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const dotenv = require('dotenv');
dotenv.config();


class HotelTireController {

  getAllTires = async (req, res, next) => {
    let tiresList = await HotelTireModel.find();
      if(!tiresList.length) {
        throw new HttpException(404, 'Nici o anvelopa gasita');
      }
    res.send(tiresList);
  }

  getAllHotelVehicles = async (req, res, next) => {
    let vehiclesList = await HotelTireModel.getAllHotelVehicles();
    if(!vehiclesList.length) {
      throw new HttpException(404, 'Nici un vehicul gasit');
    }
    res.send(vehiclesList);
  }

  getFleetHotelVehicles = async (req, res, next) => { 
    let fleetVehicleList = await HotelTireModel.getFleetHotelVehicles(req.query.fleet_id);
    if(!fleetVehicleList.length) {
      throw new HttpException(404, 'Nici un vehicul gasit');
    }
    res.send(fleetVehicleList);
  }

  getPartnerHotelVehicles = async (req, res, next) => { 
    let partnerVehicleList = await HotelTireModel.getPartnerHotelVehicles(req.session.userId);
    if(!partnerVehicleList.length) {
      throw new HttpException(404, 'Nici un vehicul gasit');
    }
    res.send(partnerVehicleList);  
  }

  getTireById = async (req, res, next) => {
    const tire = await HotelTireModel.find({ht_id: req.params.id});

    if(!tire || !tire.length) {
      throw new HttpException(401, 'Acces interzis');
    }
    res.send(tire);
  }

  getVehicleTires = async (req, res, next) => {
    if(!req.query.v_id) {
      throw new HttpException(401, 'Acces interzis');    
    }
    const vehicleTires = await HotelTireModel.getVehicleTires(req.query.v_id);
    if(!vehicleTires) {
      throw new HttpException(404, 'Nici o anvelopa gasita');  
    }
    res.send(vehicleTires);
  }

  getHotelByVehicle = async (req, res, next) => { 
    if(!req.query.v_id) {
      throw new HttpException(401, 'Acces interzis');    
    }
    const vehicleHotel = await HotelTireModel.getHotelByVehicle(req.query.v_id);
    if(!vehicleHotel) {
      throw new HttpException(404, 'Hotelul nu a fost gasit');  
    }
    res.send(vehicleHotel);  
  }

  getVehiclesTiresInfo = async (req, res, next) => {
    if(!req.query.vId) {
      throw new HttpException(401, 'Acces interzis');    
    }
    const vehicleTires = await HotelTireModel.find({vehicle_id: req.query.vId});
    if(!vehicleTires) {
      throw new HttpException(404, 'Nici o anvelopa gasita');  
    }
    res.send(vehicleTires);
  }

  getFleetTires = async (req, res, next) => {
    if(!req.query.fleet_id) {
      throw new HttpException(404, 'Nici o anvelopa gasita');
    }
    let fleetTiresList;
    if(req.session.userRole < 3) {
      fleetTiresList = await HotelTireModel.getFleetTiresByFleetId(req.query.fleet_id, req.session.userId, req.session.userRole);
    } else if(req.session.userRole === 3) {
      fleetTiresList = await HotelTireModel.getOwnFleetTires(req.query.fleet_id, req.session.userId);
    }
    res.send(fleetTiresList); 
  }


  getHotelsList = async (req, res, next) => {
    let hList = [];
    const hotelsList = await HotelTireModel.getTHList();    
    if(hotelsList && hotelsList.length > 0) {
      for (const [index, el] of hotelsList.entries()) {  
        let hId = '0_' + el.hl_id;
        let hName = 'Dinamic 92 - ' + el.hotel_city;
        let hEntry = {hId: hId, hName: hName};
        hList.push(hEntry);
      }
    }
    const pHotelsList = await HotelTireModel.getPartnerHotelsList();
    if(pHotelsList && pHotelsList.length > 0) {
      for (const [i, e] of pHotelsList.entries()) {  
        let hId = '1_' + e.pi_id;
        let hName = e.partner_name + ' - ' + e.partner_city;
        let hEntry = {hId: hId, hName: hName};
        hList.push(hEntry);
      }
    }
    res.send(hList);  
  }

  getInternalHotelsList = async (req, res, next) => {
    let hList = [];
    const hotelsList = await HotelTireModel.getTHList();    
    if(hotelsList && hotelsList.length > 0) {
      for (const [index, el] of hotelsList.entries()) {  
        let hId = '0_' + el.hl_id;
        let hName = 'Dinamic 92 - ' + el.hotel_city;
        let hEntry = {hId: hId, hName: hName};
        hList.push(hEntry);
      }
    }   
    res.send(hList);  
  }

  getVehiclesWithTires = async (req, res, next) => {    
    if(!req.query.vId) {
      throw new HttpException(401, 'Acces interzis');
    } else {      
      let vehicleWithTires = await HotelTireModel.getVehicleWithTires(req.query.vId);
      res.send(vehicleWithTires); 
    }
  }

  
  getHotelListByRegion = async (req, res, next) => {    
    if(!req.query.hRegion) {
      throw new HttpException(500, 'Something went wrong');
    }    
    let hList = await HotelTireModel.getHotelListByRegion(req.query.hRegion);   
    res.send(hList);
  }

  updateVehicleHotelStorage = async (req, res, next) => {    

    const result = await HotelTireModel.updateVehicleTires(req.body, req.params.id);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }
    
    res.send('Vehicle successfully updated' );
  }


  createVehicleHotelStorage = async (req, res, next) => {

    const vehicleData = await VehicleModel.find({reg_number: req.body.regNumber, in_use: 1});
    if(!vehicleData || !vehicleData.length) {
      throw new HttpException(404, 'Vehiculul nu a fost gasit');  
    }
    let newVehicleId = vehicleData[0].v_id;
    const checkVehicleDuplicate = await HotelTireModel.find({vehicle_id: newVehicleId});
    if(checkVehicleDuplicate && checkVehicleDuplicate.length > 0) {
      throw new HttpException(402, 'Vehicul duplicat');  
    }

    let vehicleTires = []
    for(let i=0; i<req.body.vehicle_tire_count; i++) {
      let tireHotelInfo = req.body.vehicleTires.hotelId[i].split('_');  
      let hotelType = parseInt(tireHotelInfo[0]);
      let hotelLocationId =  parseInt(tireHotelInfo[1]);
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
        hotel_type: hotelType,
        hotel_id: hotelLocationId,
        created: Date.now(),
        updated: Date.now()
      }    
      let newTireResult = await HotelTireModel.create(tireToIns);
      if(!newTireResult) {
        throw new HttpException(500, 'Something went wrong');
      }
    }

    
    res.status(201).send('Vehicul adaugat cu succes!');
  }
  
  createVehiclesHotelStorageBulk = async (req, res, next) => {
    for (const [index, el] of req.body.vehiclesList.entries()) {  
      let duplicateErr = false;
      let vehicleData = await VehicleModel.find({reg_number: el.regNumber, in_use: 1});
      if(vehicleData && vehicleData.length > 0) {      
        let newVehicleId = vehicleData[0].v_id;    
        try {
          let checkVehicleDuplicate = await HotelTireModel.find({vehicle_id: newVehicleId});
          if(checkVehicleDuplicate && checkVehicleDuplicate.length > 0) {
            duplicateErr = true;
          } 
        } catch (error) {
          duplicateErr = true;
        }
        if(!duplicateErr) {          
          let vehicleTires = []
          for(let i=0; i<el.vehicle_tire_count; i++) {
            let tireHotelInfo = el.vehicleTires.hotelId[i].split('_');  
            let hotelType = parseInt(tireHotelInfo[0]);
            let hotelLocationId =  parseInt(tireHotelInfo[1]);
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
              hotel_type: hotelType,
              hotel_id: hotelLocationId,
              created: Date.now(),
              updated: Date.now()
            }    
            let newTireResult = await HotelTireModel.create(tireToIns);
            if(!newTireResult) {
              throw new HttpException(500, 'Something went wrong');
            }
          }
        }
      }
    }
  
    res.status(201).send('Vehicule adaugate cu succes!');
  }

  deleteTire = async (req, res, next) => {
    const result = await HotelTireModel.delete(req.params.id);
    if(!result) {
      throw new HttpException(404, 'Anvelopa nu a fost gasita');
    }
    res.send('Anvelopa deleted');
  }
  
  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }

}


module.exports = new HotelTireController;