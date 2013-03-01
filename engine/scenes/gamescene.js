var gengi = require('../gengi/gengi')
  ,galaxy = require('../galaxy')
  ,planetcomponent = require('../components/planetcomponent').planetcomponent
  ,galaxycomponent = require('../components/galaxycomponent').galaxycomponent
  ,hudcomponent = require('../components/hudcomponent').hudcomponent
  ;

exports.gamescene = function(name, user){
  var scene = gengi.scene(name, user);
  
  var galaxyc = galaxycomponent(user);
  scene.addComponent(galaxy);
  
  var hud = hudcomponent(user);
  scene.addComponent(hud);
  
  var planets = [];
  scene.addPlanetComponent = function(id, plnt){
    var planetc = planetcomponent(
      id,
      plnt,
      user
      );
    galaxy.addPlanet(plnt);
    scene.addComponent(planetc);
  };
  for(var p = 0; p< dilemma.planets.length; p++){
    scene.addPlanetComponent('planet'+p, galaxy.planets[p]);
  }
  var mousedown = false;
  var startmouseposition = {'x' : 0, 'y' : 0};
  scene.mousedown = function(evt){  
    startmouseposition = {'x' : evt.x, 'y' : evt.y};
    mousedown = true;
    
    var coords = galaxyc.translateViewCoordinatesToGalaxy(evt.x, evt.y);
    for(var p = 0; p< planets.length; p++){  
      planets[p].highlight(coords.x, coords.y);
    }
  };
  scene.mouseup = function(evt){
    mousedown = false;
  };
  scene.mousemove = function(evt){
    if(mousedown){
      galaxyc.moveBy((startmouseposition.x - evt.x), (startmouseposition.y - evt.y));
      startmouseposition = {'x' : evt.x, 'y' : evt.y};
    }
  };
  scene.centreOn = function(x, y){
    galaxyc.moveTo(x, y);
  }
  return scene;
};