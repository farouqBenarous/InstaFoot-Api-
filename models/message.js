const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi')
const mongoose = require('mongoose');
const  _ = require('lodash')
const messageSchema = new mongoose.Schema({
    email_user: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    id_user : {
        type : String,
        required : true ,
        minlength: 5,
        maxlength: 100,

    } ,
    vu: {
        type: Boolean,
        maxlength: 2 ,
    },
    timestamp: { type: Date, default: Date.now },
    text : { type : String , minlength : 2 , maxlength : 255 ,  }

});

const Message = mongoose.model('messages', messageSchema);


function Validatemessage(messages) {
    const schema = Joi.object ( {
        email_user: Joi.string().min(5).max(255).required().email(),
        vu  : Joi.string().min(1).max(2),
        id_user: Joi.string().min(1).max(255).required(),
        text: Joi.string().min(1).max(255).required(),
        timestamp : Joi.string().required()
    }) .unknown() ;
    return Joi.validate(messages, schema);
}


function exist_or_not_message ( list , value) {
    let newlist =  covert_to_array(list) ;
    let exist  = newlist.find( obj => obj.email_user_2 == value)
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

exports.Message = Message;
exports.Validatemessage = Validatemessage
exports.exist_or_not_message = exist_or_not_message
