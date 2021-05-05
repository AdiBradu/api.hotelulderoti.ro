const query = require('../db/db-connection');
const DBTireModel = require('../models/tire.model');
const TireModel = new DBTireModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const dotenv = require('dotenv');
dotenv.config();


class TireController {

  getAllTires = async (req, res, next) => {
    let tiresList = await TireModel.find();
      if(!fleetList.length) {
        throw new HttpException(404, 'Nici o flota gasita');
      }
    res.send(fleetList);
  }

  getTireById = async (req, res, next) => {
    const tire = await TireModel.find({t_id: req.params.id});

    if(!tire || !tire.length) {
      throw new HttpException(401, 'Acces interzis');
    }
    res.send(tire);
  }

  getFleetTires = async (req, res, next) => {
    if(!req.query.fleet_id) {
      throw new HttpException(404, 'Nici o anvelopa gasita');
    }
    let fleetTiresList;
    if(req.session.userRole < 3) {
      fleetTiresList = await TireModel.getFleetTiresByFleetId(req.query.fleet_id, req.session.userId, req.session.userRole);
    } else if(req.session.userRole === 3) {
      fleetTiresList = await TireModel.getOwnFleetTires(req.query.fleet_id, req.session.userId);
    }
    res.send(fleetTiresList); 
  }

  deleteTire = async (req, res, next) => {
    const result = await TireModel.delete(req.params.id);
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


module.exports = new TireController;