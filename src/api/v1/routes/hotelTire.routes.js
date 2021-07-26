const express = require('express');
const router = express.Router();
const hotelTireController = require('../controllers/hotelTire.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelTireController.getAllTires)); 
router.get('/id/:id', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelTireController.getTireById));
router.get('/getFleetTires', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.HotelManager), awaitHandlerFactory(hotelTireController.getFleetTires));
router.get('/getVehicleTires', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.HotelManager, Role.Partner), awaitHandlerFactory(hotelTireController.getVehicleTires));
router.get('/getVehiclesTiresInfo', auth(Role.Admin, Role.SalesAgent, Role.FleetUser, Role.Partner, Role.HotelManager), awaitHandlerFactory(hotelTireController.getVehiclesTiresInfo));
router.get('/getHotelsList', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelTireController.getHotelsList));
router.get('/getVehiclesWithTires', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelTireController.getVehiclesWithTires));
router.get('/getAllHotelVehicles', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelTireController.getAllHotelVehicles));
router.get('/getFleetHotelVehicles', auth(Role.FleetUser), awaitHandlerFactory(hotelTireController.getFleetHotelVehicles));
router.get('/getPartnerHotelVehicles', auth(Role.Partner), awaitHandlerFactory(hotelTireController.getPartnerHotelVehicles));
router.get('/getHotelByVehicle', auth(Role.Admin, Role.SalesAgent, Role.HotelManager, Role.FleetUser), awaitHandlerFactory(hotelTireController.getHotelByVehicle));
router.get('/getInternalHotelsList', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelTireController.getInternalHotelsList));
router.get('/getHotelListByRegion', auth(Role.Admin, Role.SalesAgent, Role.HotelManager, Role.FleetUser), awaitHandlerFactory(hotelTireController.getHotelListByRegion));



router.post('/', auth(Role.Admin, Role.SalesAgent, Role.HotelManager, Role.FleetUser), awaitHandlerFactory(hotelTireController.createVehicleHotelStorage));
router.post('/bulk', auth(Role.HotelManager), awaitHandlerFactory(hotelTireController.createVehiclesHotelStorageBulk));

router.patch('/id/:id', auth(Role.Admin, Role.SalesAgent, Role.HotelManager), awaitHandlerFactory(hotelTireController.updateVehicleHotelStorage));

router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(hotelTireController.deleteTire));


module.exports = router;