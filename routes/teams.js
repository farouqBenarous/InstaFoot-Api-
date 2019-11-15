const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validatelogin , validatesignup , covert_to_array , exist_or_not ,validateChangeUser ,delete_obj } = require('../models/user');
const { Conversation, Validateconversation } = require('../models/conversation');
const {Message, Validatemessage ,exist_or_not_message } = require('../models/message');
const {Team , exist_or_not_team , Validateteam  , Validatemessage_Team} = require ('../models/team')
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
    if (req.body.admin != current_user.email ) {
        return res.status(400).send('The admin should be the current user  ')
    }

      let team_exist = await Team.findOne({name : req.body.name} )
    if (! _.isEmpty(team_exist)) {
        return res.status(400).send('The name of the team already exist   ')
    }

      let users  = await User.find({})
    for ( let i = 0 ; i< req.body.players.length ; i++  ) {
        let exist  =  users.find(obj => obj.email == req.body.players[i].email)
        if (!exist) {
            return res.status(400).send('the user '+req.body.players[i].email +' does not exist ')
        }
    }


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
      res.send('the team '+team.name + ' is added ')

});

// delete a team
router.delete('/' , auth , async (req , res) => {
    if (  req.body.name == undefined  || req.body.name.length <1     ) {
        return res.status(400).send('You have to set the name of the team ')
    }

    let team_exist = await Team.findOne({name : req.body.name} )
    let current_user = await  User.findOne ({_id : req.user._id})

    if (_.isEmpty(team_exist)) {
        return res.status(404).send('The team does not exist')
    }

    if (current_user.email !== team_exist.admin) {
        return res.status(400).send('Only admin can delete a team')
    }

    for (let i = 0 ; i< team_exist.players.length ; i++) {
    let usr = await User.updateOne({email : team_exist.players[i].email} , {$pull : {teams : {name :team_exist.name }}} )

    }
    let deleted = await Team.deleteOne({name : team_exist.name})
    res.status(200).send('team deleted')




});


//get a team by its name
router.get('/', auth , async (req,res) =>  {
    let team = await Team.findOne({name : req.body.name})

    if(_.isEmpty(team)) {return res.status(404).send('Team does not exist')}
    else{res.status(200).send(team)}

}) ;

// working on the messages in a group
router.post('/messages', auth , async (req,res) =>  {

    const { error } = Validatemessage_Team(req.body);
    if (error) {return res.status(400).send(error.details[0].message)}


    const current_user = await  User.findOne({_id : req.user._id }) ;

    if (current_user.email !== req.body.email_user ) {
        return res.status(400).send('The user who send the message should be Loged in')
    }

    let team = await  Team.findOne({name : req.body.name})
    if(_.isEmpty(team)) {return res.status(404).send('Team does not exist')}

    let exist = exist_or_not_team(team.players , current_user.email  )
    if (!exist) {return res.status(400).send('you can not send a message in a team you are not in')}

    let message = req.body

    team.chat.push(message)
    await team.save ()
    res.status(200).send("message sent")

}) ;


// add someone to a team   {email and name of the team }
router.post('/users' , auth , async  (req , res ) =>  {
    if ( _.isEmpty(req.body.name ) ) {return res.status(400).send(' you should send name  of the team ')}
    if ( _.isEmpty(req.body.email ) ) {return res.status(400).send(' you should send email of the user ')}

    let team_exist = await Team.findOne({name : req.body.name} )
    let current_user = await  User.findOne ({_id : req.user._id})
    let user_to_add = await  User.findOne({email : req.body.email })

    if (_.isEmpty(user_to_add)) {
        return res.status(404).send('The user does not exist')
    }

    if (_.isEmpty(team_exist)) {
        return res.status(404).send('The team does not exist')
    }

    if (current_user.email !== team_exist.admin) {
        return res.status(400).send('Only admin can add users to a team')
    }
    console.log('user to add ' + user_to_add.email)
    console.log('user to add ' + user_to_add.email)

    let exist = exist_or_not_team (team_exist.players , user_to_add.email)
    if (exist) {
        return res.status(400).send('The user is already in the team')
    }

    await Team.updateOne({name : team_exist.name} , {$push :{ players : { email : user_to_add.email}} })
    await User.updateOne ({email : user_to_add.email} , {$push : {teams : team_exist}})
    res.status(200).send('the user is added to the team')
})

// Delete someone form a team   {email and name of the team }
router.delete('/users' , auth , async  (req , res ) =>  {
    if ( _.isEmpty(req.body.name ) ) {return res.status(400).send(' you should send name  of the team ')}
    if ( _.isEmpty(req.body.email ) ) {return res.status(400).send(' you should send email of the user ')}

    let team_exist = await Team.findOne({name : req.body.name} )
    let current_user = await  User.findOne ({_id : req.user._id})
    let user_to_add = await  User.findOne({email : req.body.email })

    if (_.isEmpty(user_to_add)) {
        return res.status(404).send('The user does not exist')
    }

    if (_.isEmpty(team_exist)) {
        return res.status(404).send('The team does not exist')
    }

    if (current_user.email !== team_exist.admin) {
        return res.status(400).send('Only admin can Delte  users to a team')
    }
    console.log('user to add ' + user_to_add.email)
    console.log('user to add ' + user_to_add.email)

    let exist = exist_or_not_team (team_exist.players , user_to_add.email)
    if (!exist) {
        return res.status(400).send('The user Does not exist in the team ')
    }

    await Team.updateOne({name : team_exist.name} , {$pull :{ players : { email : user_to_add.email}} })
    await User.updateOne ({email : user_to_add.email} , {$pull : {teams : team_exist}})
    res.status(200).send('The user is deleted')
})


module.exports = router
