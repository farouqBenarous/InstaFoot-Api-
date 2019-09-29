const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

// Id-User , Email , Username, FullName , Phone_Number , Facebook , Instagrame  , UserPicture ,  Password , Teams[] , FriendList[]
// email , username ,  fullname , phonenumber ,  facebook , userpicture , friendlist , teams , password
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    username : {
     type : String,
     required : true ,
     minlength: 5,
     maxlength: 50,
     unique : true

    } ,
    fullname: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50 ,
    unique: true
  },
    phonenumber : {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 14 ,
        unique : true
},
    facebook : { type :  Object},
    userpicture : {type : String } ,
    friendlist : [Object],
    requestlist : [Object],
    request_sent_list : [Object],
    teams : [Object] ,
    password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
    isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('Users', userSchema);

function validateUserSignup(user) {
  const schema = Joi.object ( {
      email: Joi.string().min(5).max(255).required().email(),
      username : Joi.string().min(5).max(50).required(),
      fullname: Joi.string().min(5).max(50).required(),
      phonenumber : Joi.string().min(8).max(14).required(),
      password: Joi.string().min(5).max(255).required()

  }) .unknown() ;

  return Joi.validate(user, schema);
}


function validateUserLogin(user) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(user, schema);
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
    let exist  = newlist.find( obj => obj.email === value)
    if(exist) {return true}
    else {return  false}
}
exports.User = User; 
exports.validatesignup = validateUserSignup;
exports.validatelogin = validateUserLogin;
exports.covert_to_array = covert_to_array
exports.exist_or_not = exist_or_not