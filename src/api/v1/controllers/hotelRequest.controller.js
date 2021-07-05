const query = require('../db/db-connection');
const DBHotelRequestModel = require('../models/hotelRequest.model');
const HotelRequestModel = new DBHotelRequestModel(query);
const DBVehicleModel = require('../models/vehicle.model');
const VehicleModel = new DBVehicleModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const dotenv = require('dotenv');
dotenv.config();

class HotelRequestController {
  getAllRequests = async (req, res, next) => {
    let allReqs = await HotelRequestModel.getAllRequests();
    res.send(allReqs); 
  }

  getPartnerRequests = async (req, res, next) => {
    let partnerReqs = await HotelRequestModel.getPartnerRequests(req.session.userId);
    res.send(partnerReqs); 
  }

  getRequestInfo =  async (req, res, next) => {
    let reqInfo = await HotelRequestModel.getRequestInfo(req.query.rId);
    res.send(reqInfo); 
  }

  createHotelCheckoutRequest = async (req, res, next) => {    
   
    const vehicleData = await VehicleModel.find({reg_number: req.body.reg_number, in_use: 1});
    if(!vehicleData || !vehicleData.length) {
      throw new HttpException(404, 'Vehiculul nu a fost gasit');  
    }
    let vehicleId = vehicleData[0].v_id;      
   
    let newReqResult = await HotelRequestModel.createHotelCheckoutRequest(vehicleId, req.body.reg_number, req.session.userId);
    if(!newReqResult) {
      throw new HttpException(500, 'Something went wrong');
    }
    res.status(201).send('Cerere adaugata cu succes!');
  }

  updateHotelRequest = async (req, res, next) => {   
    const result = await HotelRequestModel.updateHotelRequest(req.body, req.params.id);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }
    
    res.send('Cerere actualizata cu succes' );
  }
  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }
  
}
module.exports = new HotelRequestController;