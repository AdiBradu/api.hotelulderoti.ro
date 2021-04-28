const query = require('../db/db-connection');
const DBPartnerInfoModel = require('../models/partnerinfo.model');
const PartnerInfoModel = new DBPartnerInfoModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const dotenv = require('dotenv');
dotenv.config();


class PartnerInfoController {

  getAllPartners = async (req, res, next) => {
    let fleetList = await PartnerInfoModel.find();
    if(!userList.length) {
      throw new HttpException(404, 'Nici un partener gasit');
    }

    res.send(fleetList);
  }

  getPartnerById = async (req, res, next) => {
    const fleet = await PartnerInfoModel.findOne({pi_id: req.params.id});
    if(!fleet) {
      throw new HttpException(404, 'Partener nu a fost gasit');
    }

    res.send(fleet);
  }

  getPartnerByName = async (req, res, next) => {
    const partner = await PartnerInfoModel.findOne({partner_name: req.params.partner_name});
    if(!partner) {
      throw new HttpException(404, 'Partener nu a fost gasit');
    }

    res.send(partner);
  }

  searchPartners = async (req, res, next) => {

    let searchParams = [`%${req.params.searchPhrase}%`, `%${req.params.searchPhrase}%`];

    let partnerList = await PartnerInfoModel.search(`partner_name LIKE ? OR partner_region LIKE ? `, searchParams);

    res.send(partnerList);  
  }

  deletePartnerInfo = async (req, res, next) => {
    const result = await PartnerInfoModel.delete(req.params.id);
    if(!result) {
      throw new HttpException(404, 'Partener nu a fost gasit');
    }
    res.send('Partener deleted');
  }
  
  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }

}


module.exports = new PartnerInfoController;