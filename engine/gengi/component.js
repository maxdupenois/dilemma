exports.component = function(u){
  var user = u;
  var x = 0;
  var y = 0;
  var scale = 1;
  var path = null;
  var scene;
  return {
    init : function(){
      //override
    },
    update : function(ups){
      //override
    },
    defaultStateObj : function(){
      return {'x' : x, 'y' : y, 'scale' : scale, 'path' : path};
    },
    getX : function(){return x},
    getY : function(){return y},
    getScale : function(){return scale},
    getPath : function(){return path},
    setStateValue : function(name, value) {
      scene.setStateValue(name, value);
    },
    getStateValue : function(name) {
      return scene.getStateValue(name);
    },
    getScene : function(){return scene;},
    setScene : function(s){scene = s;}
    
  };
};