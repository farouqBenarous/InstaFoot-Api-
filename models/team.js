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
        image_team : Joi.string() ,
        score : Joi.string() ,
    }) .unknown() ;
    return Joi.validate(team, schema);
}

function Validatemessage_Team(messages) {
    const schema = Joi.object ( {
        email_user: Joi.string().min(5).max(255).required().email(),
        vu  : Joi.string().min(1).max(2),
        id_user: Joi.string().min(1).max(255).required(),
        text: Joi.string().min(1).max(255).required(),
        timestamp : Joi.string().required()
    }) .unknown() ;
    return Joi.validate(messages, schema);
}

function exist_or_not_team ( list , value) {
    let newlist =  covert_to_array(list) ;
    let exist  = newlist.find( obj => obj.email == value)
    if(exist) {return true}
    else {return  false}
}

function covert_to_array ( object) {
    var array =[] ;
    for (let i=0 ; i<object.length  ; i++)  {
        array.push(object[i])
    }
    return array
}


module.exports.Team = Team ;
module.exports.exist_or_not_team = exist_or_not_team
module.exports.Validateteam = Validateteam
module.exports.Validatemessage_Team = Validatemessage_Team