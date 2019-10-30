const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const  _ = require('lodash')


// game (game = ['casual','exhibition','competitive'] , time , location , duration , number_players , description , teams )
// casual so any one can join , exhibition it require a team to post it , competitive another tie
const gameSchema = new mongoose.Schema({
    posted_by : {type : String , required : true } ,
    game: { type : String  , enum : ['casual','exhibition','competitive'] , required : true },
    time : {type :Date , required : true } ,
    location : {type: String , required : true },
    duration : {type : String , required :  true , maxlength : 3} ,
    number_players : {type : String , required : true  , maxlength : 3 } ,
    description : {type : String  , maxlength : 255},
    // optional stuff depends on the game's type
    teams :  [Object] ,
    players : [Object],
    status : {type : String , enum : ['upcoming' , 'past' ,'cancelled']  }
});

const Game = mongoose.model('Games', gameSchema);


function validateGame(game) {
    const schema = Joi.object({
        game: Joi.string().required(),
        time: Joi.string().required(),
        location: Joi.string().required(),
        duration: Joi.string().min(1).max(3).required(),
        number_players: Joi.string().min(1).max(3).required() ,
        description: Joi.string().min(1).max(255).required() ,
    }) .unknown();

    return Joi.validate(game, schema);
}


function validateGame_Update(game) {
    const schema = Joi.object({
        time: Joi.string().required(),
        location: Joi.string().required(),
        duration: Joi.string().min(1).max(3).required(),
        number_players: Joi.string().min(1).max(3).required() ,
        description: Joi.string().min(1).max(255).required() ,
    }) .unknown();

    return Joi.validate(game, schema);
}

function covert_to_array ( object) {
    var array =[] ;
    for (let i=0 ; i<object.length  ; i++)  {
        array.push(object[i])
    }
    return array
}

function exist_or_not ( list , value) {
    let newlist =  covert_to_array(list) ;
    let exist  = newlist.find( obj => obj.email == value)
    if(exist) {return true}
    else {return  false}
}

function delete_obj (array , value) {
    let list = covert_to_array( array)

    let new_array  = _.remove(list, function(obj) {
        return obj.email != value;});


    return new_array
}

exports.Game = Game;
exports.validateGame = validateGame
exports.covert_to_array = covert_to_array
exports.exist_or_not = exist_or_not
exports.delete_obj = delete_obj
exports.validateGame_Update = validateGame_Update
