const query = require('../db/db-connection');
const DBServiceOrderModel = require('../models/serviceOrder.model');
const ServiceOrderModel = new DBServiceOrderModel(query);
const DBServiceOrderDetailModel = require('../models/serviceOrderDetail.model');
const ServiceOrderDetailModel = new DBServiceOrderDetailModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const dotenv = require('dotenv');
dotenv.config();


class ServiceOrderController {

  getAllOrders = async (req, res, next) => {
    let orderList = await ServiceOrderModel.find();
    if(!orderList.length) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(orderList);
  }


  createOrder = async (req, res, next) => {
    this.checkValidation(req);
    
    const result = await ServiceOrderModel.create(req.body);

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    res.status(201).send('Order creat cu succes!');
  }



  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }

}


module.exports = new ServiceOrderController;