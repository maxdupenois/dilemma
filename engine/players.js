var galaxy = require('./galaxy')
  ,utils = require('./gengi/utils')
  ,menuscene = require('./scenes/menuscene').menuscene
  ,gamescene = require('./scenes/gamescene').gamescene
  ;

var players = {};

exports.addPlayer = function(user){
  user.addScene('menu', menuscene);
  user.addScene('game', gamescene);
  players[user.id()] = user;
  players[user.id()].name = "Unknown";
  var myplanet = galaxy.newPlanet();
  myplanet.setPlayer(user);
  
  user.getScene('game').centreOn(myplanet.x(), myplanet.y());
  utils.each(players, function(k, player){
    var pscenes = player.getScenes();
    pscenes['game'].addPlanetComponent("home_"+player.id(), myplanet);
  });
  user.changeScene('menu');
};

exports.playerRejoined = function(user){
  players[user.id()] = user;
};

exports.all = function(){
  return players;
};

exports.removePlayer = function(user){
  delete players[user.id()];
};