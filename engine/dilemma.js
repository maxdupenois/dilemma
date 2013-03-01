var gengi = require('./gengi/gengi')
    ,utils = require('./gengi/utils')
    ,galaxy = require('./galaxy')
    ,constants = require('./constants')
    ,menuscene = require('./scenes/menuscene').menuscene
    ,gamescene = require('./scenes/gamescene').gamescene
  ;

var dilemma = {};

dilemma.players = {};



dilemma.addPlayer = function(user){
  user.addScene('menu', menuscene);
  user.addScene('game', gamescene);
  dilemma.players[user.id()] = user;
  dilemma.players[user.id()].name = "Unknown";
  var myplanet = galaxy.newPlanet();
  myplanet.setPlayer(user);
  
  user.getScene('game').centreOn(myplanet.x(), myplanet.y());
  utils.eachOfMap(dilemma.players, function(k, player){
    var pscenes = player.getScenes();
    pscenes['game'].addPlanetComponent("home_"+player.id(), myplanet);
  });
  user.changeScene('menu');
};
dilemma.playerRejoined = function(user){
  dilemma.players[user.id()] = user;
};

dilemma.play = function(user, evt, fields){
  user.changeScene('game');
  if(!utils.isblank(fields['name'])){
    user.name = fields['name'];
  } 
};

dilemma.removePlayer = function(user){
  delete dilemma.players[user.id()];
};

exports.init = function(io, sessionStore){
  gengi.init(io, sessionStore, dilemma);
  galaxy.seed();
  gengi.engine.start(25);
};