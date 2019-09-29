const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validatelogin , validatesignup} = require('../models/user');
const Team = require('../models/team')
const express = require('express');
const router = express.Router();
const Fawn = require('fawn')
var mongoose = require('mongoose');
mongoose.connect(config.get('DbString'))
Fawn.init(mongoose);



// get my information (route protected by the auth )  the user have to send a token
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

// signup
router.post('/signup', async (req, res) => {

  const { error } = validatesignup(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let exist = await User.findOne({ email: req.body.email });
  if (exist) return res.status(400).send('User already registered.');

 // email , username ,  fullname , phonenumber ,  facebook , userpicture , friendlist , teams , password

let user  = new User ({email: req.body.email   , username: req.body.username  ,  fullname: req.body.fullname  ,
  phonenumber:req.body.phonenumber  ,  facebook: req.body.facebook  , userpicture : req.body.userpicture ,
  friendlist: req.body.friendlist  , teams: req.body.teams   , password : req.body.password   })

  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'fullname', 'email']));
});

// Login
router.post('/login', async (req, res) => {
  const { error } = validatelogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email .');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid  password.');

  const token = user.generateAuthToken();
  res.send(token);
});

// auth with facebook not yet
router.post('/auth/facebook' , async (req , res) => { res.status(200) } );

 // add new friend
router.post('/friends' , auth ,async (req , res) => {
  if (Object.keys(req.body.email).length === 0) {
    res.status(400).send(" You Should provide email to add")
  }

  let user_to_add = await User.findOne({email: req.body.email} ,['email','fullname','username' ,'phonenumber'])
  let current_user = await User.findOne({_id : req.user._id} ,['email','fullname','username' ,'phonenumber'] )


  var task = Fawn.Task();
  task.update("users",{email : current_user.email},{ $push: { request_sent_list: user_to_add } })
      .update("users",{email: user_to_add.email},{ $push: { requestlist: current_user } })
      .run()
      .then( function (results)  {
        res.status(200).send('request sent to ' + req.body.email)
      })
      .catch( function (err)  {
        res.status(500).send(err)
      });
});

// accept the request or decline (oop = 0 decline  , opp = 1 accept )  and pass the email in the  body
router.put('/friends/:opp' , auth , async  (req , res) => {
  if (Object.keys(req.body.email).length === 0) {
   return res.status(400).send(" You Should provide email to do this operation ")
  }

  let user_requesting = await User.findOne({email: req.body.email} ,['email','fullname','username' ,'phonenumber'])
  let current_user = await User.findOne({_id : req.user._id} ,['email','fullname','username' ,'phonenumber','requestlist'] )

  // decline path
   if (req.params.opp == 0)  {
     // delete the user from my request_list and from request_sent_list of the other user
     let exist = await current_user.requestlist.find( user => user.email === user_requesting.email)
     if (!exist) { return res.status(400).send('you can not accept request that does not exist ')}

     var task = Fawn.Task();
     task.update("users",{email : current_user.email},{ $pull: { requestlist: {email : user_requesting.email}  } })
         .update("users",{email: user_requesting.email},{ $pull: { request_sent_list: {email : current_user.email }  } })
         .run()
         .then( function (results)  {
           res.status(200).send('request of ' +user_requesting.fullname +' declined sucessfuly')
         })
         .catch( function (err)  {
           res.status(500).send(err)
         });
   }

   // accept path
   if (req.params.opp == 1) {
     // delete the user from my request_list and from request_sent_list of the other user  , and then add it in both friend list
     let exist = await current_user.requestlist.find( user => user.email === user_requesting.email)
     if (!exist) { return res.status(400).send('you can not accept request that does not exist ')}

     var task = Fawn.Task();
     task.update("users",{email : current_user.email},{ $pull: { requestlist: {email : user_requesting.email}  } })
         .update("users",{email: user_requesting.email},{ $pull: { request_sent_list: {email : current_user.email }  } })

         .update('users' , {email : current_user.email},{ $push: { friendlist: user_requesting } })
         .update('users',{email : user_requesting.email} , {$push : {friendlist : current_user}})
         .run()
         .then( function (results)  {
           res.status(200).send('request of ' +user_requesting.fullname +' accepted sucessfuly')
         })
         .catch( function (err)  {
           res.status(500).send(err)
         });
   }

} );
// get  my friends
router.get('/friends' , auth ,async (req , res) => { res.status(200)});

// get a specefic  friend by given key
router.get('/friends/:key' , auth , async (req , res) => {

  let my_friendslist =  await User.findOne({_id : req.user._id} , 'friendlist')
 /*
  if (Object.keys(req.params).length === 0) {
    res.status(400).send(" You Should provide Search key")
  }
  // search by email
  exist = await User._id(req.user._id).findOne({ email: req.params.key });
  if (exist) {
    res.status(200).send("email : "+exist.email+" username : "+exist.username+" phone number "+exist.phonenumber );
  }
  // search by fullname
  exist = await User.findOne({ fullname: req.params.key });
  if (exist) {
    res.status(200).send("email : "+exist.email+" username : "+exist.username+" phone number "+exist.phonenumber );
  }
  // search by username
  exist = await User.findOne({ username: req.params.key });
  if (exist) {
    res.status(200).send("email : "+exist.email+" username : "+exist.username+" phone number "+exist.phonenumber );
  }
  // search by phonenumber
  exist = await User.findOne({ phonenumber: req.params.key });
  if (exist) {
    res.status(200).send("email : "+exist.email+" username : "+exist.username+" phone number "+exist.phonenumber );
  }
*/

} );

module.exports = router


