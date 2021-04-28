const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const Role = require('../utils/userRoles.utils');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const { validateLogin } = require('../middleware/validators/userValidator.middleware');

router.get('/logout', awaitHandlerFactory(userController.logoutUser));
router.post('/login', validateLogin, awaitHandlerFactory(userController.userLogin));
router.get('/me', awaitHandlerFactory(userController.getCurrentUser));

module.exports = router;