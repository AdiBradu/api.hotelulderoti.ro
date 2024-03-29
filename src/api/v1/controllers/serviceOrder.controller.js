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
const excel = require("exceljs");
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

  getServicesList =  async (req, res, next) => {
    let servicesList = await ServiceListModel.getServicesList();
    if(!servicesList.length) {
      throw new HttpException(404, 'No available services found');
    }
    res.send(servicesList);
  }

  getFleetServiceOrders = async (req, res, next) => {
    const resFleet = await FleetInfoModel.findOne({user_id: req.session.userId});
    if(!resFleet) {
      throw new HttpException(401, 'Acces interzis');    
    }
   
    let ordersCount = await ServiceOrderModel.countFleetOrdersByUserId(resFleet.fi_id, req.query.searchString, req.query.timePeriodFilter);
    let orderList = await ServiceOrderModel.getFleetOrdersByUserId(resFleet.fi_id, req.query.page, req.query.limit, req.query.searchString, req.query.timePeriodFilter);
    
    if(!orderList.length) {
      throw new HttpException(404, 'No orders found');
    }
    res.send({ordersCount, orderList}); 
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
    let ordersCount = await ServiceOrderModel.countPartnerOrdersByUserId(resPartner.pi_id, req.query.searchString, req.query.timePeriodFilter);
    let orderList = await ServiceOrderModel.getPartnerOrdersByUserId(resPartner.pi_id, req.query.page, req.query.limit, req.query.searchString, req.query.timePeriodFilter);
    if(!orderList.length) {
      throw new HttpException(404, 'No orders found');
    }
    res.send({ordersCount, orderList});  
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
    let ordersCount;
    if(req.session.userRole === 1) {
      ordersCount = await ServiceOrderModel.countAllOrders(req.query.page, req.query.limit, req.query.searchString, req.query.timePeriodFilter);
      orderList = await ServiceOrderModel.getAllOrders(req.query.page, req.query.limit, req.query.searchString, req.query.timePeriodFilter);
    } else {
      ordersCount = await ServiceOrderModel.countAgentOrders(req.session.userId, req.query.page, req.query.limit, req.query.searchString, req.query.timePeriodFilter);
      orderList = await ServiceOrderModel.getAgentOrders(req.session.userId, req.query.page, req.query.limit, req.query.searchString, req.query.timePeriodFilter);
    }

    if(!orderList.length) {
      throw new HttpException(404, 'No orders found');
    }
    res.send({ordersCount, orderList});  
  }

  servicesToExcel = async (req, res, next) => {
    let orders = [];
    let queryCount = Math.ceil(parseInt(req.query.totalOrders) / 5000);   
    let resPartner;
    let resFleet;
    if(req.session.userRole === 3) { 
      resFleet = await FleetInfoModel.findOne({user_id: req.session.userId});
    }
    if(req.session.userRole === 4) { 
      resPartner = await PartnerInfoModel.findOne({user_id: req.session.userId});
    }
    for (let i = 0; i < queryCount; i++) {
      let orderList;
      if(req.session.userRole === 1) {             
        orderList = await ServiceOrderModel.getAllOrders(i, 5000, req.query.searchString, req.query.timePeriodFilter);
      } else if(req.session.userRole === 2) {              
        orderList = await ServiceOrderModel.getAgentOrders(req.session.userId, i, 5000, req.query.searchString, req.query.timePeriodFilter);
      } else if(req.session.userRole === 3) {
        orderList = await ServiceOrderModel.getFleetOrdersByUserId(resFleet.fi_id, i, 5000, req.query.searchString, req.query.timePeriodFilter);
      } else if(req.session.userRole === 4) {
        orderList = await ServiceOrderModel.getPartnerOrdersByUserId(resPartner.pi_id, i, 5000, req.query.searchString, req.query.timePeriodFilter);
      }
      
      if(orderList.length){
        orderList.forEach((f) => {       
          let t = new Date(f.created);
          let d = t.getDate();       
          let m = t.getMonth()+1; 
          let y = t.getFullYear();
          let formattedDate = d+'/'+m+'/'+y  
          if(req.session.userRole > 2) {    
            orders.push({
              data: formattedDate,
              nrinmatriculare: f.reg_number,
              km: f.vehicle_milage,
              costinterventie: parseFloat(f.order_total.toFixed(2))
            });
          } else {
            orders.push({
              data: formattedDate,
              nrinmatriculare: f.reg_number,
              km: f.vehicle_milage,
              partener: f.partner_name,
              costpartener: parseFloat(f.order_total.toFixed(2)),
              flota: f.fleet_name,
              costflota: parseFloat(f.order_total_fleet.toFixed(2)),
            });  
          }
        });
      }
    }    
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Istoric comenzi");
    if(req.session.userRole > 2) {   
      worksheet.columns = [
        { header: "Data", key: "data", width: 30 },
        { header: "Nr. Inmatriculare", key: "nrinmatriculare", width: 30 },
        { header: "KM", key: "km", width: 25 },
        { header: "Cost interventie", key: "costinterventie", width: 25 }
      ];
    } else {
      worksheet.columns = [
        { header: "Data", key: "data", width: 30 },
        { header: "Nr. Inmatriculare", key: "nrinmatriculare", width: 30 },
        { header: "KM", key: "km", width: 25 },
        { header: "Partener", key: "partener", width: 25 },
        { header: "Cost partener", key: "costpartener", width: 25 },
        { header: "Flota", key: "flota", width: 25 },
        { header: "Cost flota", key: "costflota", width: 25 }
      ];
    }
    worksheet.addRows(orders);
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {      
      cell.font = {
        bold: true,
      };
    })
    //Commit the changed row to the stream
    headerRow.commit();   
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "Export comenzi.xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  }

  getVehicleOrders = async (req, res, next) => {
    let vehicleOrders; 
    let vehicleOrdersCount;
    if(req.session.userRole === 1) {
      vehicleOrdersCount = await ServiceOrderModel.countVehicleOrders(req.query.v_id);
      vehicleOrders = await ServiceOrderModel.getVehicleOrders(req.query.v_id, req.query.page, req.query.limit);
    } else if(req.session.userRole === 2)  {      
      vehicleOrdersCount = await ServiceOrderModel.countAgentVehicleOrders(req.session.userId, req.query.v_id);
      vehicleOrders = await ServiceOrderModel.getAgentVehicleOrders(req.session.userId, req.query.v_id, req.query.page, req.query.limit);
    } else if(req.session.userRole === 3)  {
      vehicleOrdersCount = await ServiceOrderModel.countFleetVehicleOrders(req.session.userId, req.query.v_id);
      vehicleOrders = await ServiceOrderModel.getFleetVehicleOrders(req.session.userId, req.query.v_id, req.query.page, req.query.limit);
    }
    if(!vehicleOrders) {
      throw new HttpException(404, 'No orders found');
    }
    res.send({vehicleOrdersCount, vehicleOrders});  
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
    let ownHotelS = false;
    let enterpriseHotelS = false;
    for (const [i, el] of req.body.services.entries()) {
      if(el.s_id !== 'km_upd' && el.s_id !== 'tire_upd'){
        if(!isNaN(el.s_id)) {
          let serviceDetails = await ServiceListModel.findOne({sl_id: el.s_id});
          if(!serviceDetails || serviceDetails.length < 1) {
            throw new HttpException(500, 'Eroare'); break;      
          }
          if(serviceDetails['hotel_service'] === 1) {
            ownHotelS = true;  
          }
          if(serviceDetails['hotel_service'] === 2) {
            enterpriseHotelS = true;  
          }
          let currentServiceCost = serviceDetails['service_cost'];
          if(serviceDetails['cost_type'] === 1) {
            currentServiceCost = parseFloat(serviceDetails['service_cost'] * parseInt(req.body.vehicle_data.vehicle_tire_count));     
          } 
          servicesListPriceTotal += parseFloat(currentServiceCost);    
          listServicesListPrices.push({s_id: el.s_id, s_list_cost: currentServiceCost});   
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
    for (const [i, el] of req.body.services.entries()) { 
      if(!isNaN(el.s_id)) {
        let servicePriceDets = listServicesListPrices.filter(item => item.s_id === el.s_id);
        let serviceCostPartner = parseFloat(servicePriceDets[0]['s_list_cost']) + parseFloat(servicePriceDets[0]['s_list_cost']) * parseFloat(resPartner.partner_percent)/100;
        let serviceCostFleet =  parseFloat(servicePriceDets[0]['s_list_cost']) + parseFloat(servicePriceDets[0]['s_list_cost']) * parseFloat(resFleet.fleet_percent)/100;
        let resServiceOrderDetail = await ServiceOrderDetailModel.create({service_order_id: resultOrderInsId, service_name: el.service_name, service_cost_partner: parseFloat(serviceCostPartner).toFixed(2), service_cost_fleet: parseFloat(serviceCostFleet).toFixed(2), created: Date.now()});
        if(!resServiceOrderDetail) {
          throw new HttpException(500, 'Eroare');break;
        }         
        if(ownHotelS) {
          let resHotelAction = await ServiceOrderDetailModel.handleHotelService(req.body.vehicle_data.v_id, resPartner.pi_id, 1);
        }
        if(enterpriseHotelS) {
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

  getServiceById = async (req, res, next) => {
    let sInfo = await ServiceListModel.getServiceById(req.params.id);
    if(!sInfo) {
      throw new HttpException(404, 'No service found');
    }
    res.send(sInfo);    
  }

  createService = async (req, res, next) => { 
    if(!req.body.service_name || !req.body.service_vehicle_type || !req.body.service_cost) {
      throw new HttpException(500, 'Eroare');  
    }    
    let resNewService = await ServiceListModel.create({service_name: req.body.service_name, service_vehicle_type: req.body.service_vehicle_type, service_cost: parseFloat(req.body.service_cost).toFixed(2), hotel_service: parseInt(req.body.hotel_service), cost_type: parseInt(req.body.cost_type), min_diameter: parseInt(req.body.min_diameter), max_diameter: parseInt(req.body.max_diameter)});
    if(!resNewService) {
      throw new HttpException(500, 'Eroare');  
    }
    
    res.status(201).send('Serviciu creat cu succes!');
  }


  updateService = async (req, res, next) => {
    if(!req.body.service_name || !req.body.service_vehicle_type || !req.body.service_cost) {
      throw new HttpException(500, 'Eroare');  
    }   
    let resNewService = await ServiceListModel.update({sl_id: req.params.id, service_name: req.body.service_name, service_vehicle_type: req.body.service_vehicle_type, service_cost: parseFloat(req.body.service_cost).toFixed(2), hotel_service: parseInt(req.body.hotel_service), cost_type: parseInt(req.body.cost_type), min_diameter: parseInt(req.body.min_diameter), max_diameter: parseInt(req.body.max_diameter)});
    if(!resNewService) {
      throw new HttpException(500, 'Eroare');  
    }
    
    res.status(200).send('Serviciu actualizat cu succes!'); 
  }

  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }

}


module.exports = new ServiceOrderController;