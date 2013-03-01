
var connect = require('connect')
    ,cookie = require('cookie')
    ,utils = require('./utils')
    ,user = require('./user').user
    ,scene = require('./scene').scene
    ,component = require('./component').component
    ;

exports.scene = scene;
exports.utils = utils;
exports.component = component;

exports.game  = null;
var users = {};
users.keys = function(){
  return utils.select(Object.keys(gengi.users), function(k){
    return k.search(/^[a-z0-9\_]{8}\-(?:[a-z0-9\_]{4}\-){3}[a-z0-9\_]{12}$/i) == 0
  });
};
users.size = function(){
  return gengi.users.keys().length;
};

exports.users = users;

exports.addUser = function(socket){
  var u = user(socket, exports.game);
  exports.users[u.id()] = u;
  return u;
};

exports.getUser = function(uid){
  return exports.users[uid];
  
};

exports.reloadUser = function(uid, socket){
  var u = exports.getUser(uid);
  u.resetSocket(socket);
  return u;
};



exports.engine = function(){
  var currentTimeout = null;
  var running = false;
  var desiredMSPerUpdate = ((1/25.0)*1000);
  var previousUpdateEnd = null;
  
  var run = function(){
    var start = new Date().getTime();
    var actualMsPerUpdate = (previousUpdateEnd != null ? start - previousUpdateEnd : desiredMSPerUpdate);
    utils.eachOfMap(exports.users, function(k, user){
      v.update(actualMsPerUpdate);
    });
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





exports.init = function(io, sessionStore, game){
  exports.game = game;

  io.on('connection', function(socket){
    var signedcookies = cookie.parse(socket.request.headers.cookie);
    var cookies = connect.utils.parseSignedCookies(signedcookies, "nevereverhaveieverfeltsobad");
    var sid = cookies['gengi.sid'];
    
    sessionStore.get(sid, function (err, session) {
      var u;
      if(utils.exists(session['user_token']) && exports.getUser(session['user_token']) != null){
        u = exports.reloadUser(session['user_token'], socket);
        exports.game.playerRejoined(u);
      }else{
        u = exports.addUser(socket);
        exports.game.addPlayer(u);
        session['user_token'] = u.id();
        sessionStore.set(sid, session);
      }
    });
    

  });
  return exports;
};