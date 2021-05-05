const express = require('express');
const router = express.Router();
const tireController = require('../controllers/tire.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/', auth(Role.Admin), awaitHandlerFactory(tireController.getAllTires)); 
router.get('/id/:id', auth(Role.Admin), awaitHandlerFactory(tireController.getTireById));
router.get('/getFleetTires', auth(Role.Admin, Role.SalesAgent, Role.FleetUser), awaitHandlerFactory(tireController.getFleetTires));

router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(tireController.deleteTire));


module.exports = router;