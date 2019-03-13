'use strict';

const express = require('express');


const createAccount = require('../controllers/account/create-account');
const createActivation = require('../controllers/account/activate-account');
const createValidation = require('../controllers/account/validate-account');


const accountRouter = express.Router();


//curl http://localhost:8000/api/account -d '{"email":"angers@asd.es","pasword":"Asdasd32asda"}' -H 'content-type: application/json' -v
accountRouter.post('/account', createAccount);


// Hacemos el get para la verificación del usuario
accountRouter.get('/account/activation/:verificationCode', createActivation);


// Hacemos el get para el login del usuario 
/** TODO cambiarlo por un post */
accountRouter.post('/account/validate', createValidation);

module.exports = accountRouter; 
