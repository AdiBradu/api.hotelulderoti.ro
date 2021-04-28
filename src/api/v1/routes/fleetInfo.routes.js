const express = require('express');
const router = express.Router();
const fleetInfoController = require('../controllers/fleetInfo.contoller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.getAllFleets)); 
router.get('/id/:id', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.getFleetById));
router.get('/name/:name', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.getFleetByName));
router.get('/search', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.searchFleets));
router.get('/filter', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.filterFleets));
router.get('/filterVehicles', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.filterFleetVehicles));

router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(fleetInfoController.deleteFleetInfo));


module.exports = router;