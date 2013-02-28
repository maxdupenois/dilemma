(function(){ 
var gengi = this;
var crypto = require('crypto');
gengi.game  = null;

gengi.uuid = function(){
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
  var y = '89ab'
  //xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // 30 chars required
  var rand;
  var string = "";
  for(var i=0; i < 32; i++){
    if(i == 12){
      string += '4';
    }else if(i == 16){
      rand = Math.floor(Math.random()*y.length);
      string += y[rand];
    }else{
      rand = Math.floor(Math.random()*chars.length);
      string +=  chars[rand];
    }  
    if([7, 11, 15, 19].indexOf(i) > -1) string += '-'
  }
  return string;
};

gengi.users = {};

gengi.users.keys = function(){
  var keys = [];
  var actualKeys = Object.keys(gengi.users);
  for(var i=0; i < actualKeys.length; i++){
    if(actualKeys[i].search(/^[a-z0-9\_]{8}\-(?:[a-z0-9\_]{4}\-){3}[a-z0-9\_]{12}$/i) == 0){
      keys.push(actualKeys[i]);
    }
  }
  
  return keys;
}
gengi.users.size = function(){
  return gengi.users.keys().length;
};
  
gengi.addUser = function(socket){
  var u = user(socket);
  gengi.users[u.id()] = u;
  return u;
};


gengi.clone = function(){
  // http://oranlooney.com/functional-javascript
  function Clone() { };
  return function (obj) {
      Clone.prototype = obj;
      return new Clone();
  };
}();
gengi.copy = function(){
  var objcopy = function(copied, obj){
    for(k in obj){
      if(obj[k] instanceof Function) continue;
      copied[k] = copier(obj[k]);
    }
    return copied;
  };
  var arrcopy = function(copied, arr){
    for(var i=0; i < arr.length; i++){
      if(arr[i] instanceof Function) continue;
      copied.push(copier(arr[i]));
    }
    return copied;
  };
  var copier = function(part){
    var result;
    if(part instanceof Array){
      result = arrcopy([], part);
    }else if(part instanceof Object){  
      result = objcopy({}, part);
    }else{
      result = part;
    }
    return result;
  }

  return function(obj){
    return copier(obj);
  };
}();



var user = function(s){
  var socket = s;
  socket.sendObj = function(data){
    socket.send(JSON.stringify(data));
  };
  
  var uuid = gengi.uuid();
  socket.sendObj({'uuid' : uuid});
  
  var scenes = {};
  var currentScene = null;
  var changeScene = null;
  var user_obj  = {
    addScene : function(name, scenefunction){
      scenes[name] = scenefunction(name, this);
      scenes[name].init();
    },
    id : function(){
      return uuid;
    },
    changeState : function(state){ 
      var stateSend = copy(state);
      var md5 = crypto.createHash('md5');
      md5.update(JSON.stringify(state), 'ascii');
      stateSend['md5'] = md5.digest('hex');
      socket.sendObj({'state' : stateSend});
    },
    changeScene : function(scene){
      var name = (typeof(scene.name)!="undefined" && scene.name != null ? scene.name : scene);
      changeScene = name;
    },
    getCurrentScene : function(){
      return currentScene;
    },
    getScenes : function(){
      return scenes;
    },
    update : function(actualMsPerUpdate){
      if (changeScene != null){
        if(currentScene) currentScene.onExit();
        scenes[changeScene].preEnter();
        currentScene = scenes[changeScene];
        currentScene.onEnter();
        socket.sendObj({'scene' : changeScene});
        changeScene = null;
      }
      currentScene.update(actualMsPerUpdate);
    },
    mousemove : function(evt){
      if(currentScene) currentScene.mousemove(evt);
    },
    mouseup : function(evt){
      if(currentScene) currentScene.mouseup(evt);
    },
    mousedown : function(evt){
      if(currentScene) currentScene.mousedown(evt);
    },
    click : function(evt){
      if(currentScene) currentScene.click(evt);
    },
    keypress : function(evt){
      if(currentScene) currentScene.keypress(evt);
    },
    keydown : function(evt){
      if(currentScene) currentScene.keydown(evt);
    },
    keyup : function(evt){
      if(currentScene) currentScene.keyup(evt);
    }
  };
  user_action = function(d){
    var data = JSON.parse(d);
    if(data['evt']){
      var evt = data['evt'];
      if(evt['gengi_callback']){
        gengi.game[evt['gengi_callback']](user_obj, evt);
      }
      if(user_obj[evt['type']] instanceof Function) user_obj[evt['type']](evt);
      if(gengi.game[evt['type']] instanceof Function) gengi.game[evt['type']](user_obj, evt);
      
    }
  };
  user_close = function(){
    gengi.game.removePlayer(user_obj);
    delete gengi.users[uuid];
  };
  socket.on('message', user_action);
  socket.on('close', user_close);
  return user_obj;
};

var engine = function(){
  var me = this;
  var currentTimeout = null;
  var running = false;
  var desiredMSPerUpdate = ((1/25.0)*1000);
  var previousUpdateEnd = null;
  
  var run = function(){
    var start = new Date().getTime();
    var actualMsPerUpdate = (previousUpdateEnd != null ? start - previousUpdateEnd : desiredMSPerUpdate);
    var userkeys = gengi.users.keys();
    for(var u = 0; u < userkeys.length; u++){
      gengi.users[userkeys[u]].update(actualMsPerUpdate);
    }
    previousUpdateEnd = new Date().getTime();
    var wait = desiredMSPerUpdate - actualMsPerUpdate;
    if(wait < 0) wait = 0;
    currentTimeout = setTimeout(function(){run();}, wait);
  };
  
  return {
    start : function(desiredUPS){
      if(desiredUPS) desiredMSPerUpdate = (1.0/desiredUPS)*1000; 
      running = true;
      run();
    },
    stop : function(){
      running = false;
      if(currentTimeout != null) clearTimeout(currentTimeout); 
    },
    isRunning : function(){
      return running;
    }
  };
}();

var scene = function(n, u){
  var components = [];
  var name = n;
  var user = u;
  var state = {};
  return gengi.clone({
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
  });
};
;

var component = function(u){
  var user = u;
  var x = 0;
  var y = 0;
  var scale = 1;
  var path = null;
  var scene;
  return gengi.clone({  
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
    
  });
};

exports.scene = scene;
exports.component = component;
exports.engine = engine;
exports.copy = gengi.clone;
exports.clone = gengi.copy;

exports.init = function(io, game){
  gengi.game = game;
  io.on('connection', function(socket){
    var u = gengi.addUser(socket);
    gengi.game.addPlayer(u);
  });
  return exports;
};



})();