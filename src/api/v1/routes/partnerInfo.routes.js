const express = require('express');
const router = express.Router();
const partnerInfoController = require('../controllers/partnerinfo.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');


router.get('/', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.getAllPartners)); 
router.get('/id/:id', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.getPartnerById));
router.get('/name/:name', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.getPartnerByName));
router.get('/search/:search', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.searchPartners));


router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(partnerInfoController.deletePartnerInfo));


module.exports = router;