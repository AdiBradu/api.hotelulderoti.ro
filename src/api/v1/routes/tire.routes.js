const express = require('express');
const router = express.Router();
const tireController = require('../controllers/tire.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/', auth(Role.Admin), awaitHandlerFactory(tireController.getAllTires)); 
router.get('/id/:id', auth(Role.Admin), awaitHandlerFactory(tireController.getTireById));
router.get('/getFleetTires', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(tireController.getFleetTires));
router.get('/getFleetTiresFilters', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(tireController.getFleetTiresFilters));
router.get('/tiresToExcel', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(tireController.tiresToExcel));
router.get('/getVehicleTires', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.Partner), awaitHandlerFactory(tireController.getVehicleTires));
router.get('/getVehiclesTiresInfo', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.Partner), awaitHandlerFactory(tireController.getVehiclesTiresInfo));


router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(tireController.deleteTire));


module.exports = router;