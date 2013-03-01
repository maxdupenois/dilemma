exports.scene = function(n, u){
  var components = [];
  var name = n;
  var user = u;
  var state = {};
  return {
    init : function(){
      //override
    },
    preEnter : function(){
      //override
    },
    onEnter : function(){
      //override
    },
    onExit : function(){
      //override
    },
    addComponent : function(component){
      component.setScene(this);
      components.push(component);
      component.init();
    },
    setStateValue : function(n, value) {
      state[n] = value;
    },
    getStateValue : function(name) {
      return state[name];
    },
    update : function(msperupdate){
      for(var i =0 ; i < components.length; i++){
        components[i].update(msperupdate);
      }
      user.changeState(state);
    },
    getUser : function(){
      return user;
    },
    getName : function(){
      return name;
    },
    mousemove : function(evt){},
    mouseup : function(evt){},
    mousedown : function(evt){},
    click : function(evt){},
    keypress : function(evt){},
    keydown : function(evt){},
    keyup : function(evt){}
  }
};