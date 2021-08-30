const express = require('express');
const router = express.Router();
const serviceOrderController = require('../controllers/serviceOrder.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

router.get('/getServicesList', auth(Role.Admin), awaitHandlerFactory(serviceOrderController.getServicesList));
router.get('/getAvailableServices', auth(Role.Admin, Role.SalesAgent, Role.Partner), awaitHandlerFactory(serviceOrderController.getAvailableServices));
router.get('/getServiceOrdersByPartnerId', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(serviceOrderController.getServiceOrdersByPartnerId));
router.get('/getServiceOrdersByFleetId', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(serviceOrderController.getServiceOrdersByFleetId));
router.get('/getPartnerServiceOrders', auth(Role.Partner), awaitHandlerFactory(serviceOrderController.getPartnerServiceOrders));
router.get('/getPartnerOrderDetails', auth(Role.Partner), awaitHandlerFactory(serviceOrderController.getPartnerOrderDetails));
router.get('/getServiceOrders', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(serviceOrderController.getServiceOrders));
router.get('/servicesToExcel', auth(Role.Admin, Role.SalesAgent, Role.Partner, Role.FleetUser), awaitHandlerFactory(serviceOrderController.servicesToExcel));
router.get('/getOrderDetails', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(serviceOrderController.getOrderDetails));
router.get('/getFleetServiceOrders', auth(Role.FleetUser), awaitHandlerFactory(serviceOrderController.getFleetServiceOrders));
router.get('/getFleetOrderDetails', auth(Role.FleetUser), awaitHandlerFactory(serviceOrderController.getFleetOrderDetails));
router.get('/getVehicleOrders', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(serviceOrderController.getVehicleOrders))
router.get('/id/:id', auth(Role.Admin), awaitHandlerFactory(serviceOrderController.getServiceById));

router.post('/', auth(Role.Admin, Role.SalesAgent, Role.Partner), awaitHandlerFactory(serviceOrderController.createOrder));
router.post('/createService', auth(Role.Admin), awaitHandlerFactory(serviceOrderController.createService));

router.patch('/id/:id', auth(Role.Admin), awaitHandlerFactory(serviceOrderController.updateService));

module.exports = router;