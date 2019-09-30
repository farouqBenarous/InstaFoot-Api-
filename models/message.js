const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const  _ = require('lodash')

//, id_user , email , vu , timestamp
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

const message = mongoose.model('messages', userSchema);


function Validatemessage(messages) {
    const schema = Joi.object ( {
        email_user: Joi.string().min(5).max(255).required().email().required,
        vu  : Joi.boolean().max(2),
        id_user: Joi.string().min(1).max(255).required(),
        timestamp : Joi.date().required(),
        text: Joi.string().min(1).max(255).required()
    }) .unknown() ;
    return Joi.validate(messages, schema);
}


exports.message = message;
exports.Validatemessage = Validatemessage
