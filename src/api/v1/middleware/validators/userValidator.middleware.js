const { body } = require('express-validator');
const Role = require('../../utils/userRoles.utils');

exports.createUserSchema = [
  body('email')
    .exists()
    .withMessage('Email este obligatoriu')
    .isEmail()
    .withMessage('Introduceti un email valid')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Prenumele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Prenumele trebuie sa contina minim 3 caractere'),
  body('last_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Numele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Numele trebuie sa contina minim 3 caractere'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Telefon introdus in format invalid'),      
  body('password')
    .exists()
    .withMessage('Parola este obligatorie')
    .notEmpty()
    .isLength({min: 6})
    .withMessage('Parola trebuie sa contina cel putin 6 caractere')
    .isLength({max: 20})
    .withMessage('Parola poate contine maxim 20 de caractere'),
  body('confirm_password')
    .exists()
    .custom((value, {req}) => value === req.body.password)
    .withMessage('Parola si campul pentru confirmarea parolei trebuie sa fie identice')    
];


exports.updateUserSchema = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Introduceti un email valid')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Prenumele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Prenumele trebuie sa contina minim 3 caractere'),
  body('last_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Numele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Numele trebuie sa contina minim 3 caractere'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Telefon introdus in format invalid'),      
  body('password')
    .optional()
    .notEmpty()
    .isLength({min: 6})
    .withMessage('Parola trebuie sa contina cel putin 6 caractere')
    .isLength({max: 20})
    .withMessage('Parola poate contine maxim 20 de caractere'),
  body('confirm_password')
    .optional()
    .custom((value, {req}) => value === req.body.password)
    .withMessage('Parola si campul pentru confirmarea parolei trebuie sa fie identice'),
  body()
    .custom(value => {
        return !!Object.keys(value).length;
    })
    .withMessage('Introduceti campurile pentru actualizare')
    .custom(value => {
        const updates = Object.keys(value);
        const allowUpdates = ['email', 'first_name', 'last_name', 'phone', 'password', 'confirm_password'];
        return updates.every(update => allowUpdates.includes(update));
    })
    .withMessage('Actualizari invalide!')  
];


exports.validateLogin = [
  body('username')
    .exists()
    .withMessage('Username este obligatoriu')
    .isEmail()
    .withMessage('Introduceti un email valid')
    .normalizeEmail(),
  body('password')
    .exists()
    .withMessage('Parola este obligatorie')
    .notEmpty()
    .withMessage('Parola este obligatorie')
];


exports.createFleetSchema = [
  body('email')
    .exists()
    .withMessage('Email este obligatoriu')
    .isEmail()
    .withMessage('Introduceti un email valid')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Prenumele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Prenumele trebuie sa contina minim 3 caractere'),
  body('last_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Numele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Numele trebuie sa contina minim 3 caractere'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Telefon introdus in format invalid'),      
  body('password')
    .exists()
    .withMessage('Parola este obligatorie')
    .notEmpty()
    .isLength({min: 6})
    .withMessage('Parola trebuie sa contina cel putin 6 caractere')
    .isLength({max: 20})
    .withMessage('Parola poate contine maxim 20 de caractere'),
  body('confirm_password')
    .exists()
    .custom((value, {req}) => value === req.body.password)
    .withMessage('Parola si campul pentru confirmarea parolei trebuie sa fie identice'),
  body('fleet_name')
    .exists()
    .withMessage('Denumirea companiei este obligatorie')
    .not().isEmpty().trim().escape()
    .withMessage('Denumirea companiei este obligatorie')
    .isLength({min: 3})
    .withMessage('Denumirea companiei trebuie sa contina minim 3 caractere')
    .isLength({max: 255})
    .withMessage('Denumirea companiei poate contine maxim 255 de caractere'),   
  body('fleet_gov_id')
    .exists()
    .withMessage('CUI-ul este obligatoriu')
    .not().isEmpty().trim().escape()
    .withMessage('CUI-ul este obligatoriu')
    .isLength({max: 255})
    .withMessage('CUI-ul poate contine maxim 255 de caractere'), 
  body('fleet_j')
    .exists()
    .withMessage('Identificator registrul comertului este obligatoriu')
    .not().isEmpty().trim().escape()
    .withMessage('Identificator registrul comertului este obligatoriu')
    .isLength({max: 255})
    .withMessage('Identificator registrul comertului poate contine maxim 255 de caractere'), 
  body('fleet_address')
    .exists()
    .withMessage('Adresa este obligatorie')
    .not().isEmpty().trim().escape()
    .withMessage('Adresa este obligatorie')
    .isLength({max: 255})
    .withMessage('Adresa poate contine maxim 255 de caractere'), 
  body('fleet_region')
    .exists()
    .withMessage('Judetul este obligatoriu')
    .not().isEmpty().trim().escape()
    .withMessage('Judetul este obligatoriu')
    .isLength({max: 255})
    .withMessage('Judetul poate contine maxim 255 de caractere'),    
  body('fleet_city')
    .exists()
    .withMessage('Orasul este obligatoriu')
    .not().isEmpty().trim().escape()
    .withMessage('Orasul este obligatoriu')
    .isLength({max: 255})
    .withMessage('Orasul poate contine maxim 255 de caractere')
];


exports.updateFleetSchema = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Introduceti un email valid')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Prenumele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Prenumele trebuie sa contina minim 3 caractere'),
  body('last_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Numele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Numele trebuie sa contina minim 3 caractere'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Telefon introdus in format invalid'),      
  body('password')
    .optional()
    .notEmpty()
    .isLength({min: 6})
    .withMessage('Parola trebuie sa contina cel putin 6 caractere')
    .isLength({max: 20})
    .withMessage('Parola poate contine maxim 20 de caractere'),
  body('confirm_password')
    .optional()
    .custom((value, {req}) => value === req.body.password)
    .withMessage('Parola si campul pentru confirmarea parolei trebuie sa fie identice'),
  body('fleet_name')
    .optional()   
    .not().isEmpty().trim().escape()
    .withMessage('Denumirea companiei poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Denumirea companiei trebuie sa contina minim 3 caractere')
    .isLength({max: 255})
    .withMessage('Denumirea companiei poate contine maxim 255 de caractere'),   
  body('fleet_gov_id')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('CUI-ul poate contine doar litere si cifre')
    .isLength({max: 255})
    .withMessage('CUI-ul poate contine maxim 255 de caractere'), 
  body('fleet_j')
    .optional()
    .isLength({max: 255})
    .withMessage('Identificator registrul comertului poate contine maxim 255 de caractere'), 
  body('fleet_address')
    .optional()
    .isLength({max: 255})
    .withMessage('Adresa poate contine maxim 255 de caractere'), 
  body('fleet_region')
    .optional()
    .isLength({max: 255})
    .withMessage('Judetul poate contine maxim 255 de caractere'),    
  body('fleet_city')
    .optional()
    .isLength({max: 255})
    .withMessage('Orasul poate contine maxim 255 de caractere'),
  body()
    .custom(value => {
        return !!Object.keys(value).length;
    })
    .withMessage('Introduceti campurile pentru actualizare')
    .custom(value => {
        const updates = Object.keys(value);
        const allowUpdates = ['email', 'first_name', 'last_name', 'phone', 'password', 'confirm_password', 'fleet_name', 'fleet_gov_id', 'fleet_j', 'fleet_address', 'fleet_region', 'fleet_city'];
        return updates.every(update => allowUpdates.includes(update));
    })
    .withMessage('Actualizari invalide!') 
];


exports.createPartnerSchema = [
  body('email')
    .exists()
    .withMessage('Email este obligatoriu')
    .isEmail()
    .withMessage('Introduceti un email valid')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Prenumele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Prenumele trebuie sa contina minim 3 caractere'),
  body('last_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Numele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Numele trebuie sa contina minim 3 caractere'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Telefon introdus in format invalid'),      
  body('password')
    .exists()
    .withMessage('Parola este obligatorie')
    .notEmpty()
    .isLength({min: 6})
    .withMessage('Parola trebuie sa contina cel putin 6 caractere')
    .isLength({max: 20})
    .withMessage('Parola poate contine maxim 20 de caractere'),
  body('confirm_password')
    .exists()
    .custom((value, {req}) => value === req.body.password)
    .withMessage('Parola si campul pentru confirmarea parolei trebuie sa fie identice'),
  body('partner_name')
    .exists()
    .withMessage('Denumirea companiei este obligatorie')
    .not().isEmpty().trim().escape()
    .withMessage('Denumirea companiei poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Denumirea companiei trebuie sa contina minim 3 caractere')
    .isLength({max: 255})
    .withMessage('Denumirea companiei poate contine maxim 255 de caractere'),   
  body('partner_gov_id')
    .exists()
    .withMessage('CUI-ul este obligatoriu')
    .not().isEmpty().trim().escape()
    .withMessage('CUI-ul poate contine doar litere si cifre')
    .isLength({max: 255})
    .withMessage('CUI-ul poate contine maxim 255 de caractere'), 
  body('partner_j')
    .exists()
    .withMessage('Identificator registrul comertului este obligatoriu')
    .isLength({max: 255})
    .withMessage('Identificator registrul comertului poate contine maxim 255 de caractere'), 
  body('partner_address')
    .exists()
    .withMessage('Adresa este obligatorie')
    .isLength({max: 255})
    .withMessage('Adresa poate contine maxim 255 de caractere'), 
  body('partner_region')
    .exists()
    .withMessage('Judetul este obligatoriu')
    .isLength({max: 255})
    .withMessage('Judetul poate contine maxim 255 de caractere'),    
  body('partner_city')
    .exists()
    .withMessage('Orasul este obligatoriu')
    .isLength({max: 255})
    .withMessage('Orasul poate contine maxim 255 de caractere')
];


exports.updatePartnerSchema = [
  body('email')
    .optional()   
    .isEmail()
    .withMessage('Introduceti un email valid')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Prenumele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Prenumele trebuie sa contina minim 3 caractere'),
  body('last_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Numele poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Numele trebuie sa contina minim 3 caractere'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Telefon introdus in format invalid'),      
  body('password')
    .optional()   
    .notEmpty()
    .isLength({min: 6})
    .withMessage('Parola trebuie sa contina cel putin 6 caractere')
    .isLength({max: 20})
    .withMessage('Parola poate contine maxim 20 de caractere'),
  body('confirm_password')
    .optional()
    .custom((value, {req}) => value === req.body.password)
    .withMessage('Parola si campul pentru confirmarea parolei trebuie sa fie identice'),
  body('partner_name')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('Denumirea companiei poate contine doar litere si spatii')
    .isLength({min: 3})
    .withMessage('Denumirea companiei trebuie sa contina minim 3 caractere')
    .isLength({max: 255})
    .withMessage('Denumirea companiei poate contine maxim 255 de caractere'),   
  body('partner_gov_id')
    .optional()
    .not().isEmpty().trim().escape()
    .withMessage('CUI-ul poate contine doar litere si cifre')
    .isLength({max: 255})
    .withMessage('CUI-ul poate contine maxim 255 de caractere'), 
  body('partner_j')
    .optional()
    .isLength({max: 255})
    .withMessage('Identificator registrul comertului poate contine maxim 255 de caractere'), 
  body('partner_address')
    .optional()
    .isLength({max: 255})
    .withMessage('Adresa poate contine maxim 255 de caractere'), 
  body('partner_region')
    .optional()
    .isLength({max: 255})
    .withMessage('Judetul poate contine maxim 255 de caractere'),    
  body('partner_city')
    .optional()
    .isLength({max: 255})
    .withMessage('Orasul poate contine maxim 255 de caractere'),
  body()
    .custom(value => {
        return !!Object.keys(value).length;
    })
    .withMessage('Introduceti campurile pentru actualizare')
    .custom(value => {
        const updates = Object.keys(value);
        const allowUpdates = ['email', 'first_name', 'last_name', 'phone', 'password', 'confirm_password', 'partner_name', 'partner_gov_id', 'partner_j', 'partner_address', 'partner_region', 'partner_city'];
        return updates.every(update => allowUpdates.includes(update));
    })
    .withMessage('Actualizari invalide!') 
];
