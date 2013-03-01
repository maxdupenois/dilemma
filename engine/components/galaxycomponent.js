var gengi = require('../gengi/gengi')
    ,constants = require('../constants');

exports.galaxycomponent = function(user){
  var component = gengi.component(user);
  component.location = {'x' : 0, 'y' : 0};
  component.dimensions = {'w' : constants.dimensions.w, 'h' : constants.dimensions.h};
  component.update = function(updatesperms){
    var g = component.getStateValue('galaxy');
    if(g ==  null) g = {};
    g['x'] = component.location.x;
    g['y'] = component.location.y;
    g['w'] = component.dimensions.w;
    g['h'] = component.dimensions.h;
    component.setStateValue('galaxy', g);
  };
  component.moveBy = function(x, y){
    var newx = component.location.x + x;
    var newy = component.location.y + y;
    if(newx < -component.dimensions.w/2) newx = -component.dimensions.w/2;
    if(newx > component.dimensions.w/2) newx = component.dimensions.w/2;
    if(newy < -component.dimensions.h/2) newy = -component.dimensions.h/2;
    if(newy > component.dimensions.h/2) newy = component.dimensions.h/2;
    component.location.x = newx;
    component.location.y = newy;
  };
  component.translateViewCoordinatesToGalaxy = function(x, y){
    return {'x' : x + component.location.x, 'y' : y + component.location.y };
  };
  component.moveTo = function(x, y){
    component.location.x = x;
    component.location.y = y;
  };
  return component;
};
