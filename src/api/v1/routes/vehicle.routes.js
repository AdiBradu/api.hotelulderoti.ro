const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/getVehicleTireAttributes', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.Partner), awaitHandlerFactory(vehicleController.getVehicleTireAttributes));
router.get('/getVehiclesWithTires', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(vehicleController.getVehiclesWithTires));
router.get('/getVehicleByRegNumber', auth(Role.Partner), awaitHandlerFactory(vehicleController.getVehicleByRegNumber));


router.post('/', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(vehicleController.createVehicle));
router.post('/bulk', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(vehicleController.createVehiclesBulk));


router.patch('/id/:id', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(vehicleController.updateVehicle));

router.delete('/id/:id', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(vehicleController.deleteVehicle));

module.exports = router;