;var gengic = (function(){
 var desiredFramerate = 0;
 var scenes = {};
 var currentScene;
 var msPerRender = -1;
 var previous_frame_end = -1;
 var renderer = null;
 var socket = null;
 var uuid = null;
 var state = null;
 var run = function(){
   var start = new Date().getTime();
   msPerRender = (previous_frame_end < 0 ? desiredFramerate : start - previous_frame_end)
   if(currentScene != null && typeof(currentScene) != "undefined"){
     currentScene.render(state, msPerRender);
   }
   var ms_per_frame = 1.0 / desiredFramerate
   var end = new Date().getTime();
   previous_frame_end = end;
   var update_time = end - start
   var timeout = ms_per_frame - update_time;
   if(timeout < 0 ) timeout = 0;

   setTimeout(run, timeout);
 };
 



 var socketMessage = function(d){
   var data = JSON.parse(d);
   data['md5']
   if(data['uuid']){
     uuid = data['uuid'];
   }else if(data['state']){
     state = data['state'];
   }else if(data['scene']){
     currentScene = scenes[data['scene']];
   }
 };
 scenes["__DEFAULT__"] = defaultScene;
 currentScene = scenes["__DEFAULT__"];
 

 
 var game = null;
 var gamewindow = null;
 
 var gengicObj = {
   interaction : function(e){
     // e.preventDefault();
     var evt = {};
     var wantedkeys = ['altKey', 'charCode', 'keyCode', 
     'clientX', 'clientY', 'ctrlKey', 
     'metaKey', 'offsetX', 'offsetY', 
     'pageX', 'pageY', 'screenX', 
     'screenY', 'shiftKey',  'type', 'gengi_callback'];
     var k;
     for(var i = 0; i < wantedkeys.length; i++){
       k = wantedkeys[i];
       evt[k] = e[k];
     }
     if(e.data){
       var origin = e.data.origin;
       e['offsetX'] = e['offsetX'] - origin.x;
       e['offsetY'] = origin.y - e['offsetY'];
     }
     evt['x'] = e['offsetX'];
     evt['y'] = e['offsetY'];
     var fields = {};
     $('input,select,textarea', gamewindow).each(function(i, e){
       var el = $(e);
       fields[el.attr('name')] = el.val();
     });
     socket.send(JSON.stringify({"evt" : evt, 'fields' : fields}));
   },
   interactable : function(element, eventtype, functionname){
     $(element).on(eventtype, function(evt){
       evt['gengi_callback'] = functionname;
       gengicObj.interaction(evt);
     });
     return $(element);
   },
   setFramerate : function(f){
     desiredFramerate = f / 1000.0;
   },
   getFramerate : function(){
     return (1/msPerRender) * 1000.0;
   },
   addScene : function(name, scene){
     scenes[name] = scene;
   },
   changeScene : function(name){
     currentScene = scenes[name];
   },
   start : function(framerate){
     this.setFramerate(framerate);
     run();
   },
   init : function(server, g, callback){
    game = g;
    socket = new eio.Socket(server);
    socket.onopen = function(){
      socket.onmessage = socketMessage;
      socket.onclose = function(){console.log("CLOSED")};
      game.init(gengicObj)
      callback();
    };
  },
  setWindow : function(element, orgn){
    var namespace = 'gengic';
    var origin = (orgn != null ? orgn : {'x' : 0, 'y': 0});
    var events = ['click', 'mousemove', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress'];
    if($(gamewindow).length > 0){
      for(var i = 0; i < events.length; i++){
        $(gamewindow).off(events[i]+"."+namespace);
      }
    }
    gamewindow = $(element);
    for(var i = 0; i < events.length; i++){
      $(gamewindow).on(events[i]+"."+namespace, {'origin': origin}, gengicObj.interaction);
    }
    
  }
 };
 gengicObj.setWindow(document);

 
 
 return gengicObj;
})();





gengic.scene = {};
gengic.scene.canvasScene = function(d, au){
  var alwaysupdate = au==true;
  var statemd5 = '';
  var canvas = null;
  var bufferCanvas = null;
  var dimensions = d;
  if(dimensions == null){
    dimensions = {'w' : $(window).width()-20, 'h' : $(window).height()-20, 'x': 0, 'y' : 0}
  }
  var buildCanvas = function(){
    if(canvas != null) return ;
    $('body').html("");
    var c = $('<canvas/>')
        .attr({"id"   : "dilemma-canvas",
            "width"   : dimensions.w,
            "height"  : dimensions.h,
            "tabindex": 1,
            "style"   : "background-color: #000;"});
    var cBuffer = c.clone().attr('style' , 'display:none;');
    bufferCanvas = cBuffer;
    $('body').append(c);
    canvas = c;
    gengic.setWindow(canvas, {'x' : dimensions.x, 'y' : dimensions.y});
  };
  return {
    getCanvas : function(){
      buildCanvas();
      return canvas;
    },
    getBufferCanvas : function(){
      buildCanvas();
      return bufferCanvas;
    },
    graphics : function(){
      return this.getCanvas()[0].getContext("2d");
    },
    bufferGraphics : function(){
      return this.getBufferCanvas()[0].getContext("2d");
    },
    render : function(state, msPerRender){
      if(!alwaysupdate && statemd5 == state['md5']) return;
      statemd5 = state['md5'];
      var w = this.getCanvas().width();
      var h = this.getCanvas().height();
      var g = this.bufferGraphics();
      g.clearRect(0, 0, w, h);
      this.paint(g, state, msPerRender);
      var imageData = g.getImageData(0, 0, w, h);
      this.graphics().putImageData(imageData, 0, 0);
    },
    painterMethod : function(g, func, data){
      g.save();
      g.beginPath();
      func(g, data);
      g.closePath();
      g.restore();
    },
    showFramerate : function(g, c){
      var colour = c;     
      var framerate = gengic.getFramerate();
      var framerate = Math.round(framerate)
      this.painterMethod(g, function(g){
        g.font = "bold 12px monospace";
        g.fillStyle = colour;
        g.textBaseline = "top";
        g.fillText(framerate+" fps", 10, 10);
      });
    },
    drawPoint : function(g, p, c){
      g.save();
      g.beginPath();
      g.fillStyle = c;
      g.arc(p[0], p[1], 3, 0, Math.PI*2);
      g.fill();
      g.closePath();
      g.restore();
    },
    drawPanel : function(g, data){
      var defaultdata = {x : 10, y : 10, w: 50, h : 100, fill : "#990000", outline : "#FF0000"};
      var data = gengic.utils.merge(data,defaultdata);
      var x = data.x, 
          y = data.y, 
          w = data.w, 
          h = data.h, 
          fill = data.fill, 
          outline = data.outline;
      g.save();
      g.beginPath();
      g.rect(x, y, w, h);
      g.fillStyle = fill;
      g.globalAlpha = 0.4;
      g.fill();
      g.globalAlpha = 1;
      g.strokeStyle = outline;
      g.lineWidth = 1
      g.stroke();
      g.closePath();
      g.restore();
    },
    paint : function(g, state, msPerRender){
      console.log("SHOULD BE OVERRIDDEN");
      //OVERRIDE
    },
    rebuildCanvas : function(d){
      dimensions = d;
      if(dimensions == null){
        dimensions = {'w' : $(window).width()-20, 'h' : $(window).height()-20, 'x': 0, 'y' : 0}
      }
      buildCanvas();
    }
  }
};


var defaultScene = function(){
  var scene = gengic.scene.canvasScene({'w' : 500, 'h' : 400});
  scene.paint = function(g, state, msPerRender){
    scene.showFramerate(g, "#FFFFFF");
    scene.painterMethod(g, function(g){
      g.font = "bold 12px monospace";
      g.fillStyle = "#FFFFFF";
      g.textBaseline = "top";
      g.fillText(msPerRender+" ms per render", 10, 30);
    });
  };
  return scene;
}();


gengic.utils = {};

gengic.utils.select = function(iterable, func){
  var newIterable;
  if (iterable instanceof Array){
    newIterable = [];
    for(var i in iterable){
      if(func(iterable[i])){
        newIterable.push(iterable[i]);
      }
    }
  }else{
    newIterable = {};
    for(var k in iterable){
      if(func(k, iterable[k])){
        newIterable[k] = iterable[k];
      }
    }
  }
  return newIterable;
};



gengic.utils.trim = function(str){
  return str.replace(/(^\s*)|(\s*$)/, "");
};
gengic.utils.like = function(str, regex){
  var mtch = str.match(regex, str);
  return gengic.utils.exists(mtch) && mtch.length >= 0;
};
gengic.utils.exists = function(obj){
  return ((typeof(obj)).toLowerCase() != "undefined" && obj != null);
};

gengic.utils.isblank = function(str){
  return (!gengic.utils.exists(str)) || gengic.utils.trim(str).length == 0;
};

gengic.utils.mapKeys = function(obj){
  var actkeys = [];
  for(var k in obj){
    if(! (obj[k] instanceof Function)) actkeys.push(k);
  }
  return actkeys;
};

gengic.utils.map = function(iterable, func){
  var newarr = [];
  for(var i in iterable){
    if(iterable[i] instanceof Function) continue;
    newarr.push(func(iterable[i]));
  }
  return newarr;
};
gengic.utils.reduce = function(iterable, init, func){
  var val = init;
  for(var i in iterable){
    if(iterable[i] instanceof Function) continue;
    val = func(val, iterable[i]);
  }
  return val;
};
gengic.utils.each = function(iterable, func){
  if (iterable instanceof Array){
    for(var i=0; i < iterable.length; i++){
      func(i, iterable[i]);
    }
  }else{
    var keys = gengic.utils.mapKeys(iterable);
    for(var k=0; k < keys.length; k++){
      func(keys[k], iterable[keys[k]]);
    }
  }

};
gengic.utils.merge = function(data,defaultdata){
  var merged = {};
  gengic.utils.each(defaultdata, function(key, val){
    merged[key] = gengic.utils.or(data[key], val);
  });
  return merged;
};

gengic.utils.or = function(firstchoice, secondchoice){
  if(gengic.utils.exists(firstchoice)) return firstchoice;
  return secondchoice;
};


gengic.utils.clone = function(){
  // http://oranlooney.com/functional-javascript
  function Clone() { };
  return function (obj) {
      Clone.prototype = obj;
      return new Clone();
  };
}();

gengic.utils.copy = function(object){
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
  return copier(object);
};
