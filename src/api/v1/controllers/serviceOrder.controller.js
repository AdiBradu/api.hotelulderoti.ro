const query = require('../db/db-connection');
const DBServiceOrderModel = require('../models/serviceOrder.model');
const ServiceOrderModel = new DBServiceOrderModel(query);
const DBServiceOrderDetailModel = require('../models/serviceOrderDetail.model');
const ServiceOrderDetailModel = new DBServiceOrderDetailModel(query);
const DBServiceListModel = require('../models/serviceList.model');
const ServiceListModel = new DBServiceListModel(query);
const DBTireModel = require('../models/tire.model');
const TireModel = new DBTireModel(query);
const DBPartnerInfoModel = require('../models/partnerInfo.model');
const PartnerInfoModel = new DBPartnerInfoModel(query);
const DBFleetInfoModel = require('../models/fleetInfo.model');
const FleetInfoModel = new DBFleetInfoModel(query);
const DBVehicleModel = require('../models/vehicle.model');
const VehicleModel = new DBVehicleModel(query);
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

  getAvailableServices = async (req, res, next) => {
    if(!req.query.v_id) {
      throw new HttpException(404, 'No available services found');  
    }
    let vehicleTire = await TireModel.findOne({vehicle_id: req.query.v_id});
    if(!vehicleTire) {
      throw new HttpException(404, 'No available services found');    
    }    
    let availableServicesList = await ServiceListModel.getVehicleAvailableServices(req.query.vehicle_type,vehicleTire.tire_diameter, req.session.userId, req.query.v_id);
    if(!availableServicesList.length) {
      throw new HttpException(404, 'No available services found');
    }
    res.send(availableServicesList);
  }

  getFleetServiceOrders = async (req, res, next) => {
    const resFleet = await FleetInfoModel.findOne({user_id: req.session.userId});
    if(!resFleet) {
      throw new HttpException(401, 'Acces interzis');    
    }
    let orderList = await ServiceOrderModel.getFleetOrdersByUserId(resFleet.fi_id);
    if(!orderList.length) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(orderList);  
  }

  getFleetOrderDetails = async (req, res, next) => {
    const resFleet = await FleetInfoModel.findOne({user_id: req.session.userId});
    if(!resFleet) {
      throw new HttpException(401, 'Acces interzis');    
    }
    let orderDetails = await ServiceOrderModel.getFleetOrderDetails(resFleet.fi_id, req.query.order_id);
    if(!orderDetails) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(orderDetails);  
  }
  getServiceOrdersByPartnerId = async (req, res, next) => {    
    let orderList = await ServiceOrderModel.getPartnerOrdersByUserId(req.query.partnerId);
    if(!orderList.length) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(orderList);  
  }

  getServiceOrdersByFleetId = async (req, res, next) => {    
    let orderList = await ServiceOrderModel.getFleetOrdersByUserId(req.query.fleetId);
    if(!orderList.length) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(orderList);  
  }

  getPartnerServiceOrders = async (req, res, next) => {
    const resPartner = await PartnerInfoModel.findOne({user_id: req.session.userId});
    if(!resPartner) {
      throw new HttpException(401, 'Acces interzis');    
    }
    let orderList = await ServiceOrderModel.getPartnerOrdersByUserId(resPartner.pi_id);
    if(!orderList.length) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(orderList);  
  }

  getPartnerOrderDetails = async (req, res, next) => {
    const resPartner = await PartnerInfoModel.findOne({user_id: req.session.userId});
    if(!resPartner) {
      throw new HttpException(401, 'Acces interzis');    
    }
    let orderDetails = await ServiceOrderModel.getPartnerOrderDetails(resPartner.pi_id, req.query.order_id);
    if(!orderDetails) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(orderDetails);  
  }

  getOrderDetails = async (req, res, next) => {
    let orderDetails; 
    if(req.session.userRole === 1) {
      orderDetails = await ServiceOrderModel.getOrderDetails(req.query.order_id);
    } else {
      orderDetails = await ServiceOrderModel.getAgentOrderDetails(req.session.userId, req.query.order_id);
    }
    if(!orderDetails) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(orderDetails);  
  }

  getServiceOrders = async (req, res, next) => {
    let orderList;
    if(req.session.userRole === 1) {
      orderList = await ServiceOrderModel.getAllOrders();
    } else {
      orderList = await ServiceOrderModel.getAgentOrders(req.session.userId);
    }

    if(!orderList.length) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(orderList);  
  }

  getVehicleOrders = async (req, res, next) => {
    let vehicleOrders; 
    if(req.session.userRole === 1) {
      vehicleOrders = await ServiceOrderModel.getVehicleOrders(req.query.v_id);
    } else if(req.session.userRole === 2)  {
      vehicleOrders = await ServiceOrderModel.getAgentVehicleOrders(req.session.userId, req.query.v_id);
    } else if(req.session.userRole === 3)  {
      vehicleOrders = await ServiceOrderModel.getFleetVehicleOrders(req.session.userId, req.query.v_id);
    }
    if(!vehicleOrders) {
      throw new HttpException(404, 'No orders found');
    }
    res.send(vehicleOrders);  
  }

  createOrder = async (req, res, next) => {
    
    if(!req.body.vehicle_data || !req.body.services || !req.body.tires_data || !req.body.milage_upd) {
      throw new HttpException(500, 'Eroare');  
    }

    const resPartner = await PartnerInfoModel.findOne({user_id: req.session.userId});
    if(!resPartner) {
      throw new HttpException(401, 'Acces interzis');    
    }

    const resFleet = await FleetInfoModel.findOne({fi_id: req.body.vehicle_data.fleet_id})    
    if(!resFleet) {
      throw new HttpException(401, 'Acces interzis');    
    }
    
    let servicesListPriceTotal = 0;
    let additionalServicesTotal = 0;
    let listServicesListPrices = []; 
    for (const [i, el] of req.body.services.entries()) {
      if(el.s_id !== 'km_upd' && el.s_id !== 'tire_upd'){
        if(!isNaN(el.s_id)) {
          let serviceDetails = await ServiceListModel.findOne({sl_id: el.s_id});
          if(!serviceDetails || serviceDetails.length < 1) {
            throw new HttpException(500, 'Eroare'); break;      
          }
          servicesListPriceTotal += parseFloat(serviceDetails['service_cost']);     
          listServicesListPrices.push({s_id: el.s_id, s_list_cost: serviceDetails['service_cost']});   
        } else {
          let addSItem = req.body.additional_services.filter(item => item.service_name === el.s_id);          
          additionalServicesTotal += parseFloat(addSItem[0]['service_price']);
        }
      }
    }

    let serviceOrderPartnerCost = parseFloat(servicesListPriceTotal) + parseFloat(servicesListPriceTotal) * parseFloat(resPartner.partner_percent)/100 + parseFloat(additionalServicesTotal);
    let serviceOrderFleetCost = parseFloat(servicesListPriceTotal) + parseFloat(servicesListPriceTotal) * parseFloat(resFleet.fleet_percent)/100 + parseFloat(additionalServicesTotal) + parseFloat(additionalServicesTotal) * parseFloat(resFleet.fleet_percent)/100;
    
    const resultOrderInsId = await ServiceOrderModel.create({partner_id: resPartner.pi_id, vehicle_id: req.body.vehicle_data.v_id, fleet_id: req.body.vehicle_data.fleet_id, vehicle_mileage: req.body.milage_upd, order_total_partner: parseFloat(serviceOrderPartnerCost).toFixed(2), order_total_fleet: parseFloat(serviceOrderFleetCost).toFixed(2), created: Date.now()});

    if(!resultOrderInsId) {
      throw new HttpException(500, 'Eroare');
    }
    let selfHotelServicesArr = [22,23,24,25,26,27];
    let enterpriseHotelServicesArr = [31,32,33,34,35,36];
    for (const [i, el] of req.body.services.entries()) { 
      if(!isNaN(el.s_id)) {
        let servicePriceDets = listServicesListPrices.filter(item => item.s_id === el.s_id);
        let serviceCostPartner = parseFloat(servicePriceDets[0]['s_list_cost']) + parseFloat(servicePriceDets[0]['s_list_cost']) * parseFloat(resPartner.partner_percent)/100;
        let serviceCostFleet =  parseFloat(servicePriceDets[0]['s_list_cost']) + parseFloat(servicePriceDets[0]['s_list_cost']) * parseFloat(resFleet.fleet_percent)/100;
        let resServiceOrderDetail = await ServiceOrderDetailModel.create({service_order_id: resultOrderInsId, service_name: el.service_name, service_cost_partner: parseFloat(serviceCostPartner).toFixed(2), service_cost_fleet: parseFloat(serviceCostFleet).toFixed(2), created: Date.now()});
        if(!resServiceOrderDetail) {
          throw new HttpException(500, 'Eroare');break;
        }         
        if(selfHotelServicesArr.indexOf(parseInt(el.s_id)) !== -1) {
          let resHotelAction = await ServiceOrderDetailModel.handleHotelService(req.body.vehicle_data.v_id, resPartner.pi_id, 1);
        }
        if(enterpriseHotelServicesArr.indexOf(parseInt(el.s_id)) !== -1) {
          let resHotelAction = await ServiceOrderDetailModel.handleHotelService(req.body.vehicle_data.v_id, resPartner.pi_id, 0);
        }
      }  
    }

    if(req.body.additional_services && req.body.additional_services.length > 0) {
      for (const [i, el] of req.body.additional_services.entries()) { 
        let serviceCostPartner = parseFloat(el.service_price);
        let serviceCostFleet =  parseFloat(el.service_price) + parseFloat(el.service_price) * parseFloat(resFleet.fleet_percent)/100;
        let resServiceOrderDetail = await ServiceOrderDetailModel.create({service_order_id: resultOrderInsId, service_name: el.service_name, service_cost_partner: parseFloat(serviceCostPartner).toFixed(2), service_cost_fleet: parseFloat(serviceCostFleet).toFixed(2), created: Date.now()});
        if(!resServiceOrderDetail) {
          throw new HttpException(500, 'Eroare');break;
        }  
       
      }
    }

    for (const [i, el] of req.body.tires_data.entries()) { 
      let tireParams = {
        vehicle_id: parseInt(el.vehicle_id),
        fleet_id: parseInt(el.fleet_id),
        tire_position: parseInt(el.tire_position),
        tire_width: parseInt(el.tire_width),
        tire_height: parseInt(el.tire_height),
        tire_height: parseInt(el.tire_height),
        tire_diameter: parseInt(el.tire_diameter),
        tire_speed_index: parseInt(el.tire_speed_index),
        tire_load_index: parseInt(el.tire_load_index),
        tire_brand: parseInt(el.tire_brand),
        tire_model: el.tire_model,
        tire_season: el.tire_season,
        tire_dot: el.tire_dot,
        tire_rim: parseInt(el.tire_rim),
        tire_tread_wear: parseFloat(el.tire_tread_wear),
        updated: Date.now()
      }
      let tireId = parseInt(el.t_id);
      let tireUpd = await TireModel.update(tireParams,tireId);    
      if(!tireUpd) {
        throw new HttpException(500, 'Eroare');  
      }
    }

    let vehicleMilageUpd = await VehicleModel.update({vehicle_milage: req.body.milage_upd, updated: Date.now()}, req.body.vehicle_data.v_id);
    if(!vehicleMilageUpd) {
      throw new HttpException(500, 'Eroare');  
    }
    
    res.status(201).send('Comanda creata cu succes!');
  }



  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }

}


module.exports = new ServiceOrderController;