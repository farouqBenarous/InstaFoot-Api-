const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validatelogin , validatesignup , covert_to_array , exist_or_not ,validateChangeUser ,delete_obj } = require('../models/user');
const Team = require('../models/team')
const {Game , validateGame} = require('../models/game')
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
    if (_.isEmpty(req.query.game) || _.isEmpty(req.query.time) || _.isEmpty(req.query.location) || _.isEmpty(req.query.number_players) ||
        _.isEmpty(req.query.description)) {
        let  games =  await Game.find({})
        res.status(200).send(games)
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

    if (_.isEmpty(response) ) {return res.status(404).send('no game found with this Filters')}
    response = _.uniqBy (response ,'_id')
    res.status(200).send(response)
});

router.post('/' , auth , async (req, res) => {
    let game  = new Game({game  : req.body.game ,time : req.body.time , location : req.body.location , duration : req.body.duration ,number_players : req.body.number_players,
        description : req.body.description , teams :  ['sd','noobs'] })
    await game.save()
    res.status(200).send('game created')
});


router.delete('/' , auth , (req, res) => {
});

router.put('/' , auth , (req, res) => {
});
























module.exports = router
