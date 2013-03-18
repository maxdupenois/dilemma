var gengi = require('../gengi/gengi')
  ,utils = require('../gengi/utils')
  ,galaxy = require('../galaxy')
  ,planetcomponent = require('../components/planetcomponent').planetcomponent
  ,galaxycomponent = require('../components/galaxycomponent').galaxycomponent
  ,hudcomponent = require('../components/hudcomponent').hudcomponent
  ;

exports.gamescene = function(name, user){
  var scene = gengi.scene(name, user);
  
  var galaxyc = galaxycomponent(user);
  scene.addComponent(galaxyc);
  
  var hud = hudcomponent(user);
  scene.addComponent(hud);
  
  var planets = [];
  scene.addPlanetComponent = function(id, plnt){
    var planetc = planetcomponent(
      id, plnt, user
      );
    scene.addComponent(planetc);
    planets.push(planetc);
  };
  utils.each(galaxy.planets, function(index, plnt){
    scene.addPlanetComponent('planet'+index, plnt);
  });
  var mousedown = false;
  var startmouseposition = {'x' : 0, 'y' : 0};
  scene.mousedown = function(evt){  
    startmouseposition = {'x' : evt.x, 'y' : evt.y};
    mousedown = true;
    
    var coords = galaxyc.translateViewCoordinatesToGalaxy(evt.x, evt.y);
    utils.each(planets, function(index, plnt){
      plnt.highlight(coords.x, coords.y);
    });
  };
  scene.keydown = function(evt){
    
  };
  scene.keyup = function(evt){
  };
  scene.keypress = function(evt){
    if(evt.charCode == utils.charcodes['h'] || evt.charCode == utils.charcodes['H']){
      var homeplanet = scene.getUser().home;
      galaxyc.moveTo(homeplanet.x(), homeplanet.y());
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