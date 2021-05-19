const express = require('express');
const router = express.Router();
const serviceOrderController = require('../controllers/serviceOrder.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/getAvailableServices', auth(Role.Admin, Role.SalesAgent, Role.Partner), awaitHandlerFactory(serviceOrderController.getAvailableServices));
router.get('/getServiceOrdersByPartnerId', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(serviceOrderController.getServiceOrdersByPartnerId));
router.get('/getServiceOrdersByFleetId', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(serviceOrderController.getServiceOrdersByFleetId));
router.get('/getPartnerServiceOrders', auth(Role.Partner), awaitHandlerFactory(serviceOrderController.getPartnerServiceOrders));
router.get('/getPartnerOrderDetails', auth(Role.Partner), awaitHandlerFactory(serviceOrderController.getPartnerOrderDetails));
router.get('/getServiceOrders', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(serviceOrderController.getServiceOrders));
router.get('/getOrderDetails', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(serviceOrderController.getOrderDetails));
router.get('/getFleetServiceOrders', auth(Role.FleetUser), awaitHandlerFactory(serviceOrderController.getFleetServiceOrders));
router.get('/getFleetOrderDetails', auth(Role.FleetUser), awaitHandlerFactory(serviceOrderController.getFleetOrderDetails));

router.post('/', auth(Role.Admin, Role.SalesAgent, Role.Partner), awaitHandlerFactory(serviceOrderController.createOrder));


module.exports = router;