var utils = require('./utils')
    ;




exports.user = function(socket, game){
  var u = new User(socket, game);
  u.initSocket();
  return u;
};


var socketsend = function(data){
  this.send(JSON.stringify(data))
};

var User = function User(sock, gm){
  this.socket = sock;
  this.game = gm;
  this.uuid = utils.uuid();
  this.scenes = {};
  this.currentScene = null;
  this.sceneToChangeTo = null;
};
User.prototype.initSocket = function(rejoin){
  this.socket.sendObj = socketsend;
  this.socket.sendObj({'uuid' : this.id(), 'rejoin' : rejoin==true});
  var me = this;
  this.socket.on('message', function(d){
    var data = JSON.parse(d);
    if(utils.exists(data['evt'])){
      var fields = {};
      if (utils.exists(data['fields'])){
        fields = data['fields'];
      }
      var evt = data['evt'];
      if(utils.exists(evt['gengi_callback'])){
        var gamecallback = me.game[evt['gengi_callback']];
        if(gamecallback instanceof Function) gamecallback(me, evt, fields);
      }
      var userfunc = me[evt['type']];
      var gamefunc = me[evt['type']];
      if(userfunc instanceof Function) userfunc.call(me, evt, fields);
      if(gamefunc instanceof Function) gamefunc(me, evt, fields);
    }
  });
  this.socket.on('close', function(){
    me.game.removePlayer(me);
  });
};
User.prototype.resetSocket = function(s){
  this.socket = s;
  var scene = this.currentScene.getName();
  this.initSocket(true);
  this.changeScene(scene);
},
User.prototype.addScene = function(name, scenefunction){
  this.scenes[name] = scenefunction(name, this);
  this.scenes[name].init();
};
User.prototype.id = function(){
  return this.uuid;
};
User.prototype.changeState = function(state){ 
  var stateSend = utils.copy(state);
  stateSend['md5'] = utils.md5(state);
  this.socket.sendObj({'state' : stateSend});
};

User.prototype.changeScene = function(scene){
  var name = (typeof(scene['getName'])=="function" ? scene.getName() : scene);
  this.sceneToChangeTo = name;
};

User.prototype.getCurrentScene = function(){
  return this.currentScene;
};

User.prototype.getScenes = function(){
  return this.scenes;
};

User.prototype.getScene = function(name){
  return this.scenes[name];
};

User.prototype.update = function(actualMsPerUpdate){
  if (this.sceneToChangeTo != null){
    if(this.currentScene) this.currentScene.onExit();
    this.scenes[this.sceneToChangeTo].preEnter();
    this.currentScene = this.scenes[this.sceneToChangeTo];
    this.currentScene.onEnter();
    this.socket.sendObj({'scene' : this.sceneToChangeTo});
    this.sceneToChangeTo = null;
  }
  this.currentScene.update(actualMsPerUpdate);
};
User.prototype.mousemove = function(evt){
  if(this.currentScene) this.currentScene.mousemove(evt);
};
User.prototype.mouseup = function(evt){
  if(this.currentScene) this.currentScene.mouseup(evt);
};
User.prototype.mousedown = function(evt){
  if(this.currentScene) this.currentScene.mousedown(evt);
};
User.prototype.click = function(evt){
  if(this.currentScene) this.currentScene.click(evt);
};
User.prototype.keypress = function(evt){
  if(this.currentScene) this.currentScene.keypress(evt);
};
User.prototype.keydown = function(evt){
  if(this.currentScene) this.currentScene.keydown(evt);
};
User.prototype.keyup = function(evt){
  if(this.currentScene) this.currentScene.keyup(evt);
}



// var user = function(s){
//   var socket = s;
//   var uuid = gengi.uuid();
//   
//   var initSocket = function(rejoin){
//     socket.sendObj = function(data){
//       socket.send(JSON.stringify(data));
//     };
//     socket.sendObj({'uuid' : uuid, 'rejoin' : rejoin==true});
//     socket.on('message', user_action);
//     socket.on('close', user_close);
//   };
//   
//   var scenes = {};
//   var currentScene = null;
//   var changeScene = null;
//   var user_obj  = {
//     resetSocket : function(s){
//       socket = s;
//       var scene = currentScene.getName();
//       initSocket(true);
//       this.changeScene(scene);
//     },
//     addScene : function(name, scenefunction){
//       scenes[name] = scenefunction(name, this);
//       scenes[name].init();
//     },
//     id : function(){
//       return uuid;
//     },
//     changeState : function(state){ 
//       var stateSend = copy(state);
//       var md5 = crypto.createHash('md5');
//       md5.update(JSON.stringify(state), 'ascii');
//       stateSend['md5'] = md5.digest('hex');
//       socket.sendObj({'state' : stateSend});
//     },
//     changeScene : function(scene){
//       var name = (typeof(scene['getName'])=="function" ? scene.getName() : scene);
//       changeScene = name;
//     },
//     getCurrentScene : function(){
//       return currentScene;
//     },
//     getScenes : function(){
//       return scenes;
//     },
//     getScene : function(name){
//       return scenes[name];
//     },
//     
//     update : function(actualMsPerUpdate){
//       if (changeScene != null){
//         if(currentScene) currentScene.onExit();
//         scenes[changeScene].preEnter();
//         currentScene = scenes[changeScene];
//         currentScene.onEnter();
//         socket.sendObj({'scene' : changeScene});
//         changeScene = null;
//       }
//       currentScene.update(actualMsPerUpdate);
//     },
//     mousemove : function(evt){
//       if(currentScene) currentScene.mousemove(evt);
//     },
//     mouseup : function(evt){
//       if(currentScene) currentScene.mouseup(evt);
//     },
//     mousedown : function(evt){
//       if(currentScene) currentScene.mousedown(evt);
//     },
//     click : function(evt){
//       if(currentScene) currentScene.click(evt);
//     },
//     keypress : function(evt){
//       if(currentScene) currentScene.keypress(evt);
//     },
//     keydown : function(evt){
//       if(currentScene) currentScene.keydown(evt);
//     },
//     keyup : function(evt){
//       if(currentScene) currentScene.keyup(evt);
//     }
//   };
//   user_action = function(d){
//     var data = JSON.parse(d);
//     if(data['evt']){
//       var fields = {};
//       if (data['fields']){
//         fields = data['fields'];
//       }
//       var evt = data['evt'];
//       if(evt['gengi_callback']){
//         gengi.game[evt['gengi_callback']](user_obj, evt, fields);
//       }
//       if(user_obj[evt['type']] instanceof Function) user_obj[evt['type']](evt, fields);
//       if(gengi.game[evt['type']] instanceof Function) gengi.game[evt['type']](user_obj, evt, fields);
//       
//     }
//   };
//   user_close = function(){
//     gengi.game.removePlayer(user_obj);
//     // delete gengi.users[uuid];
//   };
//   
//   initSocket();
//   
//   return user_obj;
// };