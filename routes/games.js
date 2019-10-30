const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validatelogin , validatesignup , covert_to_array ,validateChangeUser  } = require('../models/user');
const Team = require('../models/team')
const {Game , validateGame , validateGame_Update, exist_or_not , delete_obj } = require('../models/game')
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Fawn = require('fawn')
mongoose.connect(config.get('DbString'))
var tmp_collect = 'tmp_collect_for_games_app'
Fawn.init(mongoose ,tmp_collect );

// game (game = ['casual','exhibition','competitive'] , time , location , duration , number_players , description , teams )


// get all games
router.get('/' , auth , async (req, res) => {

    // if the filters are empty so return all the games
    if (_.isEmpty(req.query.game) && _.isEmpty(req.query.time) && _.isEmpty(req.query.location) && _.isEmpty(req.query.number_players) &&
        _.isEmpty(req.query.description)   ) {
        let  games =  await Game.find({})
       return res.status(200).send(games)
    }

    let  response = [];
    if (!_.isEmpty(req.query.game) ) {
        let games = await Game.find({game : req.query.game})
         response.push(games)}

    if (!_.isEmpty(req.query.time) ) {
        let games = await Game.find({time : req.query.time})
        response.push(games)}

    if (!_.isEmpty(req.query.location) ) {
        let games = await Game.find({location : req.query.location})
        response.push(games)}

    if (!_.isEmpty(req.query.number_players) ) {
        let games = await Game.find({game : req.query.number_players})
        response.push(games)}

    if (_.isEmpty(response) || _.isEmpty(response[0]) ) {
        console.log('no response with the given filteres')
        return res.status(404).send('no game found with this Filters')}
    response = _.uniqBy (response ,'_id')
   return  res.status(200).send(response)

});


// Create a new game
router.post('/' , auth , async (req, res) => {
   const  {error} = validateGame(req.body)
    const user = await User.findOne({_id : req.user._id} , ['email','fullname'])
   if (error) {res.status(400).send('something faild ' + error.details[0].message)}
    let game  = new Game({posted_by: user.email  ,game  : req.body.game ,time : req.body.time , location : req.body.location , duration : req.body.duration ,number_players : req.body.number_players,
        description : req.body.description ,players : req.body.players ,teams : [] , status : 'upcoming'})

    await game.save().then((result ) => {res.status(200).send('game created')})
        .catch((err) => { res.status(500).send('something faild try later : '+err)})
});

// cancel a game
router.delete('/' , auth , async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.body._id) ){return res.status(400).send('Id is not provided or not valid')}

    let game = await Game.findOne( {_id : req.body._id} )
    game.status = 'cancelled'
    // have to notify al the users here
    // by webpush and also a text

    await game.save().then((result) => { return res.status(200).sent('game cancelled')})
        .catch((err) => {res.status(500).send('something faild try later : '+err)} )
});

// change info about a game
router.put('/' , auth , async (req, res) => {
     // user to provide use _id of the old game and  can change the time , location , duration , number_players , description , players

    const  {error} = validateGame_Update(req.body)
    if (error) {res.status(400).send('something faild ' + error.details[0].message)}
    if(!mongoose.Types.ObjectId.isValid(req.body._id) ){return res.status(400).send('Id is not provided or not valid')}

    const user = await User.findOne({_id : req.user._id} , ['email','fullname'])
    const oldgame = await Game.findOne({_id : req.body._id})

    if(_.isEmpty(oldgame)) { return res.status(400).send('The game does not exist ')}
    if (user.email !== oldgame.posted_by) {return res.status(400).send(' only who posted the game can change it')}

    let newgame  = new Game({posted_by: user.email  ,game  : oldgame.game ,time : req.body.time , location : req.body.location , duration : req.body.duration ,number_players : req.body.number_players,
        description : req.body.description , players : req.body.players, teams :  ['sd','noobs'] , status : 'upcoming'})

   await Game.updateOne({_id : req.body._id} , {posted_by: user.email  ,game  : oldgame.game ,time : req.body.time , location : req.body.location , duration : req.body.duration ,number_players : req.body.number_players,
        description : req.body.description , players : req.body.players, teams :  ['sd','noobs'] , status : 'upcoming'})
       .then((result) => { return res.status(200).send('Game updated !')})
       .catch((err) => {return res .status(500).send('something faild try later : '+err)})

});

// Route to join a published  game
router.post('/users' , auth , async (req , res) => {
    if(!mongoose.Types.ObjectId.isValid(req.body._id) ){return res.status(400).send('Id is not provided or not valid')}
    let game  = await Game.findOne({_id : req.body._id})
    let user  = await User.findOne({_id : req.user._id} , ['email','fullname'])
    if(_.isEmpty(game)) {return res.status(404).send('no game founded with this id ')}

     if (game.players.length >= game.number_players ) {return res.status(401).send('The game is full you cant join it' )}
     if (exist_or_not(game.players , user.email)) {return res.status(401).send('you are already  Joined the game ')}

     game.players.push(user)
    await game.save().then((result ) => { res.status(200).send('You have joined the game ')})
        .catch((err) => { res.status(500).send('something faild try later  cause :  '+err)})

});

// Route to Cancel join  a published  game
router.delete('/users' , auth , async (req , res ) => {
    if(!mongoose.Types.ObjectId.isValid(req.body._id) ){return res.status(400).send('Id is not provided or not valid')}
    let game  = await Game.findOne({_id : req.body._id})
    let user  = await User.findOne({_id : req.user._id} , ['email','fullname'])
    if(_.isEmpty(game)) {return res.status(404).send('no game founded with this id ')}

    if (!exist_or_not(game.players , user.email )) {return res.status(404).send('You are not in the game ')}

    game.players =  delete_obj (game.players , user.email)

    await game.save().then((result ) => { res.status(200).send('You have Cancelled the join  game ')})
        .catch((err) => { res.status(500).send('something faild try later  cause :  '+err)})

     // notify
})



module.exports = router
