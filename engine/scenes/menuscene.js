var gengi = require('../gengi/gengi');

exports.menuscene = function(name, user){
  var scene = gengi.scene(name, user);
  
  scene.setStateValue('buttons', [
    {'text' :'play', 'click': 'play'}
  ]);

  return scene;
};
