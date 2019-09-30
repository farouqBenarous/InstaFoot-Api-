const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validatelogin , validatesignup , covert_to_array , exist_or_not ,validateChangeUser ,delete_obj } = require('../models/user');
const Team = require('../models/team')
const express = require('express');
const router = express.Router();
const Fawn = require('fawn')
var mongoose = require('mongoose');
mongoose.connect(config.get('DbString'))
Fawn.init(mongoose);


//start a coversation  or send message in case if it exist  {}
router.post( '/' , auth , async (req , res) => {});
// get all my conversations
router.get('/' , auth , async (req, res) => {});

// delete a message
router.delete('/' , auth , async (req, res) => {});

// delete a coversation
router.delete('/' , auth , async (req, res) => {});


