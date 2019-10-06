const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const {User, validatelogin , validatesignup} = require('../models/user');


// name , admin , players , number_players , match_played , image_team , score
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
    },
    match_played : [Object],
    image_team : String,
    score : String ,
    chat  : [Object]
});

const Team = mongoose.model('teams', TeamSchema);
//  name , admin , players , number_players , match_played , image_team , score
function Validateteam(team) {
    const schema = Joi.object ( {
        name: Joi.string().min(5).max(255).required(),
        admin  : Joi.string().min(4).max(50).required(),
        players: Joi.required(),
        number_players: Joi.string().min(1).max(20).required(),
        match_played : Joi.string() ,
        image_team : Joi.string() ,
        score : Joi.string() ,
    }) .unknown() ;
    return Joi.validate(team, schema);
}


function exist_or_not_team ( list , value) {
    let newlist =  covert_to_array(list) ;
    let exist  = newlist.find( obj => obj.eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee == value)
    if(exist) {return true}
    else {return  false}
}

module.exports.Team = Team ;
module.exports.exist_or_not_team = exist_or_not_team
module.exports.Validateteam = Validateteam