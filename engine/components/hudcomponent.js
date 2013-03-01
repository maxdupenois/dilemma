var gengi = require('../gengi/gengi')
    ,utils = require('../gengi/utils')
    ,players = require('../players')
    ;

exports.hudcomponent = function(user){
  var component = gengi.component(user);
  component.update = function(updatesperms){
    var hud = component.getStateValue('hud');
    if(hud ==  null) hud = {
      activeplayers : [],
      name : user.name
    };
    var activeplayers = utils.map(players.all(), function(player){
      return player.name;
    });
    hud.activeplayers = activeplayers;
    component.setStateValue('hud', hud);
  };
  
  
  return component;
};