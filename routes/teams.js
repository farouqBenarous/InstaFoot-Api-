const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validatelogin , validatesignup , covert_to_array , exist_or_not ,validateChangeUser ,delete_obj } = require('../models/user');
const { Conversation, Validateconversation } = require('../models/conversation');
const {Message, Validatemessage ,exist_or_not_message } = require('../models/message');
const {Team , exist_or_not_team , Validateteam } = require ('../models/team')
const express = require('express');
const router = express.Router();
const Fawn = require('fawn')
var mongoose = require('mongoose');
mongoose.connect(config.get('DbString'))
var tmp_collect_chat = 'tmp_collect_for_teams'
Fawn.init(mongoose , tmp_collect_chat);



//  create a team  {name , admin , players , number_players , match_played , image_team , score}
// the user should send at least the admin the list players
router.post ('/' , auth , async (req , res ) => {
      if (  req.body.players == undefined  || req.body.players.length <1     ) {
          return res.status(400).send('the list of players should not be null ')
      }
    let current_user = await  User.findOne ({_id : req.user._id})
    let exist  = req.body.players.find( obj => obj.email == current_user.email)
      if (!exist) {
         return res.status(400).send('the admin should be in the list players ')}
    let { error } = Validateteam (req.body)
       if ( error) {return res.status(400).send(' bad request '+ error.message) }


    let team = new Team ({name : req.body.name , admin : current_user.email , players : req.body.players , number_players : req.body.number_players
    , match_played : [] , image_team : req.body.image_team , score : '0'})
// now i have to add this team to all the users
    await  team.save()
    for (let i=0 ; i <team.players.length ; i++ ) {
        let user  =  await User.updateOne({email : team.players[i].email}  , { $push : {teams : team}})
    }

});


// working on the messages in a group
router.post('/messages ', auth , async (req,res) =>  {

    if ( !("email_user" in req.body) || Object.keys(req.body.email_user).length == 0) {
        return res.status(400).send(" You Should provide email to do this operation ")
    }
    const { error } = Validatemessage(req.body);
    if (error) {return res.status(400).send(error.details[0].message)}


    const current_user = await  User.findOne({_id : req.user._id }) ;

    let exist1 = exist_or_not_message(current_user.chat , user_to_send_to.email  )

    let message = req.body;


}) ;

//get messages of a team
router.get('/messages ', auth , async (req,res) =>  {


}) ;


module.exports = router
