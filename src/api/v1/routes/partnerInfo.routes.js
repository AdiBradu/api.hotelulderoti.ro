const express = require('express');
const router = express.Router();
const partnerInfoController = require('../controllers/partnerInfo.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { updatePartnerSchema } = require('../middleware/validators/userValidator.middleware');

router.get('/', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.getAllPartners)); 
router.get('/id/:id', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.getPartnerById));
router.get('/name/:name', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.getPartnerByName));
router.get('/search/:search', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.searchPartners));
router.get('/filtersValues', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.getPartnerFiltersValues));
router.get('/me', auth(Role.Partner), awaitHandlerFactory(partnerInfoController.getOwnDetails));

router.patch('/id/:id', auth(Role.Admin, Role.SalesAgent), updatePartnerSchema, awaitHandlerFactory(partnerInfoController.updatePartner));
router.patch('/selfUpdate', auth(Role.Admin, Role.SalesAgent, Role.Partner), updatePartnerSchema, awaitHandlerFactory(partnerInfoController.selfUpdate));

router.delete('/id/:id', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(partnerInfoController.deletePartnerInfo));


module.exports = router;