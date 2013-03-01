var gengi = require('../gengi/gengi');

exports.hudcomponent = function(user){
  var component = gengi.component(user);
  component.update = function(updatesperms){
    var hud = component.getStateValue('hud');
    if(hud ==  null) hud = {
      activeplayers : [],
      name : user.name
    };
    var activeplayers = [];
    for(var p in dilemma.players){
      activeplayers.push(dilemma.players[p].name);
    }
    hud.activeplayers = activeplayers;
    component.setStateValue('hud', hud);
  };
  
  
  return component;
};