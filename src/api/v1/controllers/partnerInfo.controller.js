const query = require('../db/db-connection');
const DBPartnerInfoModel = require('../models/partnerInfo.model');
const PartnerInfoModel = new DBPartnerInfoModel(query);
const DBUserModel = require('../models/user.model');
const UserModel = new DBUserModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();


class PartnerInfoController {

  getAllPartners = async (req, res, next) => {
    if(req.session.userRole === 1) {      
      let partnerList = await PartnerInfoModel.getAdminPartners();
      if(!partnerList.length) {
        throw new HttpException(404, 'Nici o flota gasita');
      }
      res.send(partnerList);
    } else if(req.session.userRole === 2) {
      let partnerList = await PartnerInfoModel.getAgentPartners(req.session.userId);
      if(!partnerList.length) {
        throw new HttpException(404, 'Nici o flota gasita');
      }
      res.send(partnerList);
    }    
  }

  getPartnerById = async (req, res, next) => {
    const partner = await PartnerInfoModel.getWithUserData(req.params.id);
    if(!partner) {
      throw new HttpException(404, 'Partener nu a fost gasit');
    }

    res.send(partner);
  }

  getPartnerFiltersValues = async (req, res, next) => {
    let partnersRegions = await PartnerInfoModel.getDistinctPartnerRegions();
    
    let partnersFiltersValues = [{partnersRegions: partnersRegions}];
    res.send(partnersFiltersValues);      
  }

  getPartnerByName = async (req, res, next) => {
    const partner = await PartnerInfoModel.findOne({partner_name: req.params.partner_name});
    if(!partner) {
      throw new HttpException(404, 'Partener nu a fost gasit');
    }

    res.send(partner);
  }


  getOwnDetails = async (req, res, next) => {
    const partner = await PartnerInfoModel.getWithUserDataByUId(req.session.userId);
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

  updatePartner = async (req, res, next) => {
    this.checkValidation(req);

    let hasAccess = await PartnerInfoModel.checkPartnerWriteAccess(req.params.id, req.session.userId, req.session.userRole);  
    if(!hasAccess) {
      throw new HttpException(401, 'Acces interzis');  
    }
    
    await this.hashPassword(req);

    let { confirm_password, ...restOfUpdates } = req.body;

    const result = await PartnerInfoModel.updatePartner(restOfUpdates, req.params.id);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    const { affectedRows, changedRows, info } = result;

    const message = !affectedRows ? 'Partnerul nu a fost gasit' : 
      affectedRows ? 'Partner actualizat' : 'Actualizare esuata';

    res.send({message, info});
  }


  selfUpdate = async (req, res, next) => { 
    this.checkValidation(req);
    
    await this.hashPassword(req);

    const{ confirm_password, ...restOfUpdates } = req.body;
  
    const result = await PartnerInfoModel.updatePartnerByUId(restOfUpdates, req.session.userId);

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


  deletePartnerInfo = async (req, res, next) => {
    
    let result;
    if(req.session.userRole === 1) {
      result = await PartnerInfoModel.delete(req.params.id);
    } else if(req.session.userRole === 2) {
      result = await PartnerInfoModel.agentDelete(req.params.id, req.session.userId);
    }

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

  hashPassword = async (req) => {
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
  }

}


module.exports = new PartnerInfoController;