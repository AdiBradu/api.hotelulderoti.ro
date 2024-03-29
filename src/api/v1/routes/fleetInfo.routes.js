const express = require('express');
const router = express.Router();
const fleetInfoController = require('../controllers/fleetInfo.contoller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { updateFleetSchema } = require('../middleware/validators/userValidator.middleware');

router.get('/', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(fleetInfoController.getAllFleets)); 
router.get('/id/:id', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.HotelManager), awaitHandlerFactory(fleetInfoController.getFleetById));
router.get('/getWithUserDataByFleetId/:id', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.getWithUserDataByFleetId));
router.get('/uid', auth(Role.FleetUser), awaitHandlerFactory(fleetInfoController.getFleetByUserId));
router.get('/name/:name', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.getFleetByName));
router.get('/search', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.searchFleets));
router.get('/filter', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.filterFleets));
router.get('/filtersValues', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.HotelManager), awaitHandlerFactory(fleetInfoController.getFleetFiltersValues));
router.get('/getFleetVehicles', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.HotelManager), awaitHandlerFactory(fleetInfoController.getFleetVehicles));
router.get('/me', auth(Role.FleetUser), awaitHandlerFactory(fleetInfoController.getOwnDetails));
router.get('/fleetsToExcel', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(fleetInfoController.fleetsToExcel)); 
router.get('/fleetVehiclesToExcel', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.HotelManager), awaitHandlerFactory(fleetInfoController.fleetVehiclesToExcel));

router.patch('/id/:id', auth(Role.Admin, Role.SalesAgent), updateFleetSchema, awaitHandlerFactory(fleetInfoController.updateFleet));
router.patch('/selfUpdate', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), updateFleetSchema, awaitHandlerFactory(fleetInfoController.selfUpdate));

router.delete('/id/:id', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(fleetInfoController.deleteFleetInfo));


module.exports = router;