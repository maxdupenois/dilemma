var gengi = require('../gengi/gengi');

exports.planetcomponent = function(planetid, planet, user){
  var component = gengi.component(user);
  component.planet = planet;
  component.highlighted = false;
  component.highlight = function(x, y){
    component.highlighted = component.planet.inPlanet(x, y);
  };

  component.init = function(){
    var planets = component.getStateValue('planets');
    if(!planets) planets = {};
    planets[planetid] = component.planet.state();
    planets[planetid]['selected'] = false;
    component.setStateValue('planets', planets);
  };
  
  component.update = function(updatesperms){
    var planets = component.getStateValue('planets');
    planets[planetid] = component.planet.state();
    planets[planetid]['selected'] = component.highlighted;
    planets[planetid]['owned'] = component.planet.getPlayer() !=  null && component.planet.getPlayer().id() == user.id();
    component.setStateValue('planets', planets);
  };
  
  return component;
};