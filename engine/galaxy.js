var constants = require('./constants')
    ,planet = require('./planet').planet
    ;
    
var galaxy = {};

exports.planets = [];

galaxy.seed = function(){
  //Seed neutral planets
  galaxy.planets = [];
  for(var p = 0; p < constants.seedplanets; p++){
    galaxy.newPlanet();
  }
};

galaxy.newPlanet = function(){
  var p = planet();
  galaxy.addPlanet(p);
  return p;
};



galaxy.addPlanet = function(p){
  exports.planets.push(p);
};

exports.addPlanet = galaxy.addPlanet;
exports.newPlanet = galaxy.newPlanet;
exports.seed = galaxy.seed;

