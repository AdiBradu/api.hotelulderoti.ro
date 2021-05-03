const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/getVehicleTireAttributes', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(vehicleController.getVehicleTireAttributes));

router.post('/', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(vehicleController.createVehicle));

module.exports = router;