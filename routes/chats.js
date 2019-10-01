const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validatelogin , validatesignup , covert_to_array , exist_or_not ,validateChangeUser ,delete_obj } = require('../models/user');
const { Conversation, Validateconversation } = require('../models/conversation');
const {Message, Validatemessage } = require('../models/message');
const Team = require('../models/team')
const express = require('express');
const router = express.Router();
const Fawn = require('fawn')
var mongoose = require('mongoose');
mongoose.connect(config.get('DbString'))
var tmp_collect = 'tmp_collect_for_chats_app'
Fawn.init(mongoose , tmp_collect);


//start a coversation  or send message in case if it exist  { id_user , email , vu , timestamp , text }
router.post( '/' , auth , async (req , res) => {
    const { error } = Validatemessage(req.body);
    if (error) {return res.status(400).send(error.details[0].message)}



});
// get all my conversations
router.get('/' , auth , async (req, res) => {});

// delete a message
router.delete('/' , auth , async (req, res) => {});

// delete a coversation
router.delete('/' , auth , async (req, res) => {});


