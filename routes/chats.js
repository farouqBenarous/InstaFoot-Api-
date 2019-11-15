const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validatelogin , validatesignup , covert_to_array , exist_or_not ,validateChangeUser ,delete_obj } = require('../models/user');
const { Conversation, Validateconversation } = require('../models/conversation');
const {Message, Validatemessage ,exist_or_not_message } = require('../models/message');
const express = require('express');
const router = express.Router();
const Fawn = require('fawn')
var mongoose = require('mongoose');
mongoose.connect(config.get('DbString'))
var tmp_collect_chat = 'tmp_collect_for_chats_app'
Fawn.init(mongoose , tmp_collect_chat);


//start a coversation  or send message in case if it exist  { id_user , email , vu , timestamp , text }
router.post( '/' , auth ,async (req , res) => {

    if ( !("email_user" in req.body) || Object.keys(req.body.email_user).length == 0) {
        return res.status(400).send(" You Should provide email to do this operation ")
    }
     const { error } = Validatemessage(req.body);
    if (error) {return res.status(400).send(error.details[0].message)}


    const current_user = await  User.findOne({_id : req.user._id }, ['email','chat']) ;
    const user_to_send_to = await  User.findOne({email : req.body.email_user }, ['email','chat'] ) ;

    let exist1 = exist_or_not_message(current_user.chat , user_to_send_to.email  )
    let exist2= exist_or_not_message(user_to_send_to.chat , current_user.email )

    let message = req.body;


    if (exist1 && exist2) {

          let chat_user1 =  await User.findOne({email : current_user.email} ).select( {chat : { $elemMatch : { email_user_2 : user_to_send_to.email}}})
          let messages1 = chat_user1.chat[0].messages
          messages1.push(message)

        let chat_user2 =  await User.findOne({email : user_to_send_to.email}).select( {chat : { $elemMatch : { email_user_2 : current_user.email}}})
        let messages2 = chat_user2.chat[0].messages
        messages2.push(message)

      var task = Fawn.Task();
      task.update('users', {email : current_user.email} , {$pull : {chat : {email_user_2 : user_to_send_to.email}}})
          .update('users', {email : current_user.email} , {$push : {chat : {email_user_1 : current_user.email ,id_user_1 :  current_user._id
                      , email_user_2 : user_to_send_to.email ,id_user_2 : user_to_send_to._id ,  messages :messages1  , timestamp : message.timestamp}  } } )

          .update('users', {email : user_to_send_to.email} , {$pull : {chat : {email_user_2 : current_user.email}}})
          .update('users', {email : user_to_send_to.email} , {$push : {chat : {email_user_1 : user_to_send_to.email ,id_user_1 :user_to_send_to._id
                      , email_user_2 : current_user.email ,id_user_2 : current_user._id ,messages :messages2  , timestamp :message.timestamp }  } } )
          .run()
          .then( function (results)  {return res.status(200).send("message sent" ) })
          .catch( function (err)  {return res.status(500).send(err)});

    }

    else {
        // Conversation (_id_conv , _id_User1 , _id_User2 , email_user1 , email_user2 , [messages] , time=lastmessageTime  )
        let conv1 = Conversation ({email_user_1 : current_user.email , id_user_1 :current_user._id  , email_user_2:user_to_send_to.email  ,
            id_user_2: user_to_send_to._id  , messages : [message]  , timestamp : message.timestamp} )

        let conv2 = Conversation ({email_user_1 : user_to_send_to.email , id_user_1 :user_to_send_to._id  , email_user_2:current_user.email  ,
            id_user_2: current_user._id  , messages : [message]  , timestamp : message.timestamp} )

        var task = Fawn.Task();
        task.update("users",{email : current_user.email},{ $push: { chat:  conv1  } })
            .update("users",{email: user_to_send_to.email},{ $push: { chat:  conv2 } })
            .run()
            .then( function (results)  {return res.status(200).send("message sent" ) })
            .catch( function (err)  {return res.status(500).send(err)});
    }  });


// get all my conversations
router.get('/' , auth , async (req, res) => {
    const current_user = await  User.findOne({_id : req.user._id }, ['email','chat']) ;

    if (current_user.chat.length < 1 || current_user.chat == undefined) {
        return res.status(404).send('no conversation founded')
    }
    res.send(current_user.chat)
});

// get  a messages of a user
router.get('/messages' , auth , async (req, res) => {
    if ( !("email" in req.body) || Object.keys(req.body.email).length == 0) {
        return res.status(400).send(" You Should provide email to do this operation ")
    }

    let current_user = await User.findOne( {_id : req.user._id} , ['chat'] )

    if (current_user.chat.length <1 || current_user.chat == undefined) {return res.status(404).send('no Chats')}
    let  chat =  covert_to_array(current_user.chat) ;
    let exist  = chat.find( obj => obj.email_user_2 == req.body.email)

    if (!exist) { return res.status(404).send('no messages with this user')}

    res.send(exist)

});

// delete a coversation
router.delete('/' , auth , async (req, res) => {});

module.exports = router

