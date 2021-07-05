const express = require('express');
const router = express.Router();
const hotelRequestController = require('../controllers/hotelRequest.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelRequestController.getAllRequests)); 
router.get('/getPartnerRequests', auth(Role.Partner), awaitHandlerFactory(hotelRequestController.getPartnerRequests)); 
router.get('/getRequestInfo', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelRequestController.getRequestInfo)); 

router.post('/', auth(Role.Partner), awaitHandlerFactory(hotelRequestController.createHotelCheckoutRequest));


router.patch('/id/:id', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelRequestController.updateHotelRequest));


module.exports = router;