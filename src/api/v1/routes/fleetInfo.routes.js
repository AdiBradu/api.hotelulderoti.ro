const express = require('express');
const router = express.Router();
const fleetInfoController = require('../controllers/fleetInfo.contoller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.getAllFleets)); 
router.get('/id/:id', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(fleetInfoController.getFleetById));
router.get('/uid', auth(Role.FleetUser), awaitHandlerFactory(fleetInfoController.getFleetByUserId));
router.get('/name/:name', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.getFleetByName));
router.get('/search', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.searchFleets));
router.get('/filter', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.filterFleets));
router.get('/filtersValues', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.getFleetFiltersValues));
router.get('/getFleetVehicles', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(fleetInfoController.getFleetVehicles));

router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(fleetInfoController.deleteFleetInfo));


module.exports = router;