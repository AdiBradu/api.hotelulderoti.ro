const { body } = require('express-validator');

exports.createVehicleSchema = [
  body('fleet_id')
    .exists()
    .withMessage('Eroare'),
  body('reg_number')
    .exists()
    .withMessage('Nr inmatriculare este obligatoriu')
    .not().isEmpty().trim().escape(),
  body('vehicle_brand')
    .exists()
    .withMessage('Marca este obligatorie')
    .not().isEmpty().trim().escape(),
  body('vehicle_model')
    .exists()
    .withMessage('Modelul este obligatoriu')
    .not().isEmpty().trim().escape(),
  body('vehicle_milage')
    .exists()
    .withMessage('Nr. de KM este obligatoriu')
    .not().isEmpty().trim().escape(),
  body('vehicle_type')
    .exists()
    .withMessage('Eroare')
];