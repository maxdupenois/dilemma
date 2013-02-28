var default_port = 1337;
var express = require('express')
  , url = require('url')
  , fs = require("fs")
  , app = express()
  , server = require('http').createServer(app).listen(default_port)
  , io = require('engine.io').attach(server)
  , dilemma = require('./engine/dilemma').init(io);



app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});


app.use(function(req, res, next){
  var extension = ext(url.parse(req.url).pathname)
  var mnt = "public"
  switch(extension){
    case 'js':
      mnt = "app/assets/javascript";
      break;
    case 'css':
      mnt = "app/assets/css";
      break;  
    case 'jpeg':
    case 'jpg':
    case 'png':
    case 'gif':
      mnt = "app/assets/images";
      break;
    case 'html':
    case 'htm':
    case '/':
      mnt = "app/views";
      break;
  }
  req['mount'] = mnt;
  next();
});
app.get('/', function(req, res, next){
  res.sendfile(req['mount']+'/home.html');
});

app.use(function(req, res, next){
  var f = req['mount']+req.url;
  fs.exists(f, function(exists){
    if(exists){
      res.sendfile(f);
    }else{
      res.send("Bollocks All");
    }
  });
});



server.listen(process.env.PORT || default_port, function(){
  console.log('\033[90mlistening on localhost:'+default_port+' \033[39m');
});

var ext = function(pathname){
  return pathname.replace(/.*\.([^\.]*)$/, "$1").trim().toLowerCase();
};



