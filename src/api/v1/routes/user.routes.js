const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { createUserSchema, updateUserSchema, createFleetSchema, createPartnerSchema } = require('../middleware/validators/userValidator.middleware');

router.get('/', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(userController.getAllUsers)); 
router.get('/id/:id', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(userController.getUserById));
router.get('/username/:username', auth(Role.Admin, Role.SalesAgent), awaitHandlerFactory(userController.getUserByUserName));

router.post('/admin', auth(Role.Admin), createUserSchema, awaitHandlerFactory(userController.createAdmin));
router.post('/agent', auth(Role.Admin), createUserSchema, awaitHandlerFactory(userController.createSalesAgent));
router.post('/fleet', auth(Role.Admin, Role.SalesAgent), createFleetSchema, awaitHandlerFactory(userController.createFleetUser));
router.post('/partner', auth(Role.Admin, Role.SalesAgent), createPartnerSchema, awaitHandlerFactory(userController.createPartner));

router.patch('/id/:id', auth(Role.Admin, Role.SalesAgent), updateUserSchema, awaitHandlerFactory(userController.updateUser));

router.patch('/self_update', auth(), updateUserSchema, awaitHandlerFactory(userController.selfUpdate));


router.delete('/id/:id', auth(Role.Admin), awaitHandlerFactory(userController.deleteUser));


module.exports = router;