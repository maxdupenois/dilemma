var gengi = require('./gengi');

(function(gengi){ 
var dilemma = this;


dilemma.players = {};


var colours = ["#226739","#5E3091", "#DACE90", "#8CD9D4", "#B83D8D"]

var planet = function(){
  var x_val = Math.random()*700+100;
  var y_val = Math.random()*700+100;
  var r_val = Math.random()*30+10;
  var c_val = colours[Math.round(Math.random()*(colours.length-1))];
  return {
    x : function(){
      return x_val;
    },
    y : function(){
      return y_val;
    },
    radius : function(){
      return r_val;
    },
    colour : function(){
      return c_val;
    },
    state : function(){
      return {'x' : this.x(), 'y' : this.y(), 'r': this.radius(), 'c' : this.colour()};
    },
    inPlanet : function(x2, y2){
      var distPlanetCenterSq = Math.pow(x2 - this.x(), 2) + Math.pow(y2 - this.y(), 2);
      var radiusSq = Math.pow(this.radius(), 2);
      return (distPlanetCenterSq < radiusSq);
    }
  }
};
dilemma.planets = [];

for(var p = 0; p< 10; p++){
  dilemma.planets.push(planet());
}


var planetcomponent = function(planetid, planet, user){
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
    component.setStateValue('planets', planets);
  };
  
  return component;
};



var menuscene = function(name, user){
  var scene = gengi.scene(name, user);
  
  scene.setStateValue('buttons', [
    {'text' :'play', 'click': 'play'}
  ]);

  return scene;
};


var gamescene = function(name, user){
  var scene = gengi.scene(name, user);
  var planets = [];
  var planet;
  for(var p = 0; p< dilemma.planets.length; p++){
    planet = planetcomponent(
      'planet'+p,
      dilemma.planets[p],
      user
      );
    planets.push(planet);
    scene.addComponent(planet);
  }
  
  scene.mousedown = function(evt){
    for(var p = 0; p< planets.length; p++){
      planets[p].highlight(evt.x, evt.y);
    }
    
  };
  return scene;
};


dilemma.addPlayer = function(user){
  user.addScene('menu', menuscene);
  user.addScene('game', gamescene);
  dilemma.players[user.id()] = user;
  for(p in dilemma.players){
    var player = dilemma.players[p];
    if(!(player['getScenes'] instanceof Function)) continue;
    var pscenes = player.getScenes();
    for(s in pscenes){
      var scene = pscenes[s];
      if(!(scene['getUser'] instanceof Function)) continue;
    }
  }
  
  user.changeScene('menu');
};
dilemma.play = function(user){
  user.changeScene('game');
 
};

dilemma.removePlayer = function(user){
  delete dilemma.players[user.id()];
};

exports.init = function(io){
  gengi.init(io, dilemma);
  gengi.engine.start(25);
};

})(gengi);