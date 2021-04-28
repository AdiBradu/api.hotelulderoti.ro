const { body } = require('express-validator');
const Role = require('../../utils/userRoles.utils');

exports.createServiceOrderSchema = [
  body('vehicle_id')
    .exists()
    .withMessage('Vehiculul este obligatoriu'),
  body('fleet_id')
    .exists()
    .withMessage('Flota este obligatorie'),
  body('vehicle_mileage')
    .exists()
    .withMessage('Nr. de KM este obligatoriu'),
  body('order_total_partner')
    .exists()
    .withMessage('Pret total este obligatoriu')
];


exports.createServiceOrderDetailSchema = [
  body('service_name')
    .exists()
    .withMessage('Nume serviciu este obligatoriu'),
  body('service_cost_partner')
    .exists()
    .withMessage('Cost serviciu este obligatoriu'),
  body('tire_position')
    .exists()
    .withMessage('Pozitie anvelopa este obligatorie')
];