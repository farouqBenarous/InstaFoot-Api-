const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const {User, validatelogin , validatesignup} = require('../models/user');


//                Team (Id-Team , Name ,  Admin(user ) , [Players] , Number of players  )
const TeamSchema = new mongoose.Schema ( {
    name : {
        type : String ,
        unique : true ,
        required : true ,
        minlength : 5 ,
        maxlength : 20
    },
    admin : {
      type : Object,
      required: true
    } ,
    players : [Object] ,
    number_players :  {
        type : Number
    }

});

const Team = mongoose.model('teams', TeamSchema);


module.exports.Team = Team ;