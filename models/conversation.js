const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const  _ = require('lodash')

//                Conversation (_id_conv , _id_User1 , _id_User2 , email_user1 , email_user2 , [messages] , time=lastmessageTime  )
const conversationSchema = new mongoose.Schema({
    email_user_1: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    id_user_1 : {
        type : String,
        required : true ,
        minlength: 5,
        maxlength: 100,
    } ,
    email_user_2: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    id_user_2 : {
        type : String,
        required : true ,
        minlength: 5,
        maxlength: 100,
    } ,
    messages : {
        type: [object],
    },
    timestamp: { type: Date, default: Date.now },

});

const conversation = mongoose.model('conversations', userSchema);


function Validateconversation(conversation) {
    const schema = Joi.object ( {
        email_user_1: Joi.string().min(5).max(255).required().email().required,
        id_user_1: Joi.string().min(1).max(255).required(),
        email_user_2: Joi.string().min(5).max(255).required().email().required,
        id_user_2: Joi.string().min(1).max(255).required(),
        timestamp : Joi.date().required(),
    }) .unknown() ;
    return Joi.validate(conversation, schema);
}


exports.conversation = conversation;
exports.Validateconversation = Validateconversation
