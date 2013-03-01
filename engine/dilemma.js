var gengi = require('./gengi/gengi')
    ,utils = require('./gengi/utils')
    ,galaxy = require('./galaxy')
    ,players = require('./players')
    ,constants = require('./constants')
  ;

var dilemma = {};





dilemma.addPlayer = players.addPlayer;
dilemma.playerRejoined = players.playerRejoined;
dilemma.removePlayer = players.removePlayer;

dilemma.play = function(user, evt, fields){
  user.changeScene('game');
  if(!utils.isblank(fields['name'])){
    user.name = fields['name'];
  } 
};


exports.init = function(io, sessionStore){
  gengi.init(io, sessionStore, dilemma);
  galaxy.seed();
  gengi.engine.start(25);
};