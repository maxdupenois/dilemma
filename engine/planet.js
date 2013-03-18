var constants = require('./constants');

var colours = ["#226739","#5E3091", "#DACE90", "#8CD9D4", "#B83D8D"]


exports.planet = function(coords){
  var x_val;
  var y_val
  if(coords != null){
    x_val = coords.x;
    y_val = coords.y;
  }else{
    x_val = Math.random()*(constants.dimensions.w-100)+100 - (constants.dimensions.w/2);
    y_val = Math.random()*(constants.dimensions.h-100)+100 - (constants.dimensions.h/2);
  }
  var r_val = Math.random()*30+10;
  var c_val = colours[Math.round(Math.random()*(colours.length-1))];
  var player = null;
  return {
    x : function(){
      return x_val;
    },
    y : function(){
      return y_val;
    },
    setPlayer : function(p){
      player = p;
    },
    getPlayer : function(){
      return player;
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