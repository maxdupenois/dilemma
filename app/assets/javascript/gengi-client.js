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
 
 //A state is a description of the view in json format,
  var defaultScene = {
    statestr : "",
    render : function(state, msPerRender){
      var win = $('#game-window');
      framerate = gengic.getFramerate();
      framerate = Math.round(framerate)
      if(win.length == 0){
        $('body').append(
        $('<div/>').attr({id : "game-window"}).css({
          "border" : "1px solid #ccc",
          "color" : "#fff",
          "background-color" : "#000",
          "font-family" : "monospace",
          "overflow" : 'scroll'
          }).append(
          $('<p/>').text('Ms per update: '+msPerRender+' framerate: '+framerate)
          ).height(500)
        );
        win = $('#game-window');
      }
      $('#game-window p').first().text('Ms per update: '+msPerRender+' framerate: '+framerate);
      var st = JSON.stringify(state);
      if(this.statestr != st && st != null){
        $('#game-window').append($('<p/>').text("STATE: "+st)); 
        this.statestr = st;
      }
    }
  };
  
  var canvasScene = function(){
    var statemd5 = '';
    var canvas = null;
    var bufferCanvas = null;
    var buildCanvas = function(){
      if(canvas != null) return ;
      $('body').html("");
      
      var c = $('<canvas/>')
          .attr("id", "dilemma-canvas")
          .attr("width", $(window).width()-20)
          .attr("height", $(window).height()-20)
          .attr("style", "background-color: #000;");
      var cBuffer = c.clone().attr('style' , 'display:none;');
      bufferCanvas = cBuffer;
      $('body').append(c);
      canvas = c;
      gengic.setWindow(canvas);
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
        if(statemd5 == state['md5']) return;
        statemd5 = state['md5'];
        var w = this.getCanvas().width();
        var h = this.getCanvas().height();
        var g = this.bufferGraphics();
        g.clearRect(0, 0, w, h);
        this.paint(g, state);
        var imageData = g.getImageData(0, 0, w, h);
        this.graphics().putImageData(imageData, 0, 0);
      },
      paint : function(g, state){
        console.log("SHOULD BE OVERRIDDEN");
        //OVERRIDE
      }
    }
  }();
 
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
     evt['x'] = e['offsetX'];
     evt['y'] = e['offsetY'];
     socket.send(JSON.stringify({"evt" : evt}));
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
  setWindow : function(element){
    var namespace = 'gengic';
    var events = ['click', 'mousemove', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress'];
    if($(gamewindow).length > 0){
      for(var i = 0; i < events.length; i++){
        $(gamewindow).off(events[i]+"."+namespace);
      }
    }
    gamewindow = $(element);
    for(var i = 0; i < events.length; i++){
      $(gamewindow).on(events[i]+"."+namespace, gengicObj.interaction);
    }
  },
  newCanvasScene : function(){
    var newScene = canvasScene;
    return newScene;
  }
 };
 gengicObj.setWindow(document);
 //JQUERY HELPER
 $.fn.interactable = function(eventtype, functionname){
   return gengicObj.interactable($(this), eventtype, functionname);
 };
 
 
 return gengicObj;
})();
