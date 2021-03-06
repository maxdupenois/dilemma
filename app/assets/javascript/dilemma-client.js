;
//Helper interactable jquery ext.
$.fn.interactable = function(etype, gengicallback){
  gengic.interactable($(this), etype, gengicallback);
  return $(this);
};

var dilemmac = (function(){
  var gengic = null;
  
  //
  
  var menuscene = {
    statemd5 : '',
    render : function(state, msPerRender){
      if(this.statemd5 == state['md5']) return;
      
      this.statemd5 = state['md5'];
      var state_btns = state['buttons'];
      var btns = [];
      var b;
      for(var i =0; i<state_btns.length; i++){
        b = $('<button/>').text(state_btns[i]['text']).interactable('click', state_btns[i]['click']);
        btns.push(b);
      }
      
      var input = $('<input/>').attr({'name' : "name", "type":"text", "placeholder":"What's yo name?"});
      
      $('body').html("");
      $('body').append(input);
      for(var i =0; i<btns.length; i++){
        $('body').append(btns[i]);
      }
    }
  };
  
  
  
  var gamescenePainter = function(){
    var buildStarField = function(w, h){
      var stars = [];
      var star;
      var colours = ["#FFCCCC", "#DACE90", "#E8EDF7", "#A3CCE0"]
      for(var i = 0; i < w/2; i++){
        star = {'x' : Math.random()*w, 'y': Math.random()*h, 
              's' : Math.random()*3 + 1, 'c' : colours[Math.round(Math.random()*(colours.length-1))]}
        stars.push(star);
      }
      return stars;
    };
    var stars = null;
    var drawStarField = function(g, galaxy){
      g.save();
      
      
      var w = g.canvas.width+200;
      var h = g.canvas.height+200;
      if(stars==null) stars = buildStarField(w, h); 
      var xtransform = galaxy.x / (galaxy.w*4);
      var ytransform = galaxy.y / (galaxy.h*4);
      var proportionalx =  w * xtransform;
      var proportionaly =  h * ytransform;
      
      var starcoordinatetransform = function(x, y){
        var newx = x - proportionalx -50;

        var newy = y - proportionaly -50;
        return {'x' : newx, 'y' :newy}; 
      };
            
      g.lineWidth = 2;
      var size = 3;
      var coords;
      for(var i = 0; i < stars.length; i++){
        g.strokeStyle = stars[i].c;
        g.fillStyle = stars[i].c;
        g.beginPath();
        coords = starcoordinatetransform(stars[i].x, stars[i].y);
        var x = coords.x;
        var y = coords.y
        g.moveTo(x,y-(size/2)*stars[i].s);
        g.lineTo(x+(size/8)*stars[i].s,y-(size/8)*stars[i].s);
        g.lineTo(x+(size/2)*stars[i].s,y);
        g.lineTo(x+(size/8)*stars[i].s,y+(size/8)*stars[i].s);
        g.lineTo(x,y+(size/2)*stars[i].s);
        g.lineTo(x-(size/8)*stars[i].s,y+(size/8)*stars[i].s);
        g.lineTo(x-(size/2)*stars[i].s,y);
        g.lineTo(x-(size/8)*stars[i].s,y-(size/8)*stars[i].s);
        g.lineTo(x,y-(size/2)*stars[i].s);        
        g.fill();
        g.closePath();
        
      }
      g.restore();
    };


    var drawBadge = function(g, x, y, scale){
      g.save();
      v1 = 5 * scale;
      v2 = 10 * scale;
      v3 = 20 * scale;
      v4 = 40 * scale;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x, y+v1, x-v2, y+v1);
      g.quadraticCurveTo(x-v3, y+v3, x, y+v4);
      g.quadraticCurveTo(x+v3, y+v3, x+v2, y+v1);
      g.quadraticCurveTo(x, y+v1, x, y);
      g.strokeStyle = "#FFFFFF";
      g.lineWidth = 2;
      g.stroke();
      g.shadowColor = "#FFFFFF";
      g.shadowBlur = 20;
      g.fillStyle = "#000000"
      g.fill();
      g.closePath();
      g.restore();
    };
    
    var drawPlanet = function(g, data){
      var planet = data.planet;
      var galaxy = data.galaxy;
      g.fillStyle = planet['c'];
      var coords = coordinateToCanvas(planet.x, planet.y, g, galaxy);

      g.beginPath();
      g.arc(coords.x, coords.y, planet['r'], 0 , 2*Math.PI);
      g.shadowColor = planet['c'];
      g.shadowBlur = 20;
      g.fill();
      
      if (planet['selected']){
        g.strokeStyle = "#FF0000" ;
        g.lineWidth = 3;
        g.stroke();
      }
      g.closePath();
      g.restore();
      
      if (planet['owned']){
        var x = coords.x + (3*planet.r/4)  
        var y = coords.y - planet.r
        drawBadge(g, x, y, planet.r/40);
      }
    }; 

    var drawAxis = function(g, state){
      var cw = g.canvas.width;
      var ch = g.canvas.height;
      var galaxy = state.galaxy;
      var x = galaxy.x;
      var y = galaxy.y;
      g.strokeStyle = "#ccc";
      g.lineWidth = 2;
      g.moveTo(cw/2, 0);
      g.lineTo(cw/2, ch);
      g.moveTo(0, ch/2);
      g.lineTo(cw, ch/2);
      g.stroke();
      g.closePath();
      g.beginPath();
      g.font = "bold 12px sans-serif";
      g.fillStyle = "#ccc";
      g.fillText("("+Math.round(x)+", "+Math.round(y)+")", cw/2 + 10, ch/2 - 10);
    };

    var drawHud = function(g, data){
      var state = data.state;
      var scene = data.scene;
      var spacer = 5;
      var height = 12;
      var maxwidth = 0;
      var tm;
      var activeplayers = state['hud']['activeplayers'];
      var me = state['hud']['name'];
      activeplayers.push('dummy1');
      activeplayers.push('dummy2');
      g.save();
      g.font = "bold 12px sans-serif";
      for(var u=0; u < activeplayers.length; u++){
        tm = g.measureText(activeplayers[u]);
        if(tm.width > maxwidth) maxwidth = tm.width;
      }
      g.restore();
      scene.drawPanel(g, {
        x : 20, y: 20, w : maxwidth + 40, h : activeplayers.length * (height + spacer) + spacer,
        fill : "#000099", outline : "#0000FF"
      });

      g.font = "bold 12px sans-serif";
      g.fillStyle = "#ccc";
      g.textBaseline = "top";
      var y = 25;
      for(var u=0; u < activeplayers.length; u++){
        g.fillText(activeplayers[u], 45, y);
        if(activeplayers[u] == me){
          drawBadge(g, 35, y, .35);
        }
        y += height + spacer
      }
      
    };

    var coordinateToCanvas = function(x, y, g, galaxy){
      return {'x' : x - galaxy.x + g.canvas.width/2, 'y' : ( galaxy.y -y) + g.canvas.height/2} 
    };
    return function(g, state){
      console.log(state);
      if(state["galaxy"]){
        this.painterMethod(g, drawStarField, state.galaxy);
        if(state["planets"]){
          for(p in state.planets) {
            if(typeof(state.planets[p]['x'])=="undefined") continue;
            state.planets[p]['name'] = p;
            this.painterMethod(g, drawPlanet, {'planet':state.planets[p], 'galaxy' : state.galaxy});
          }
        }
        this.painterMethod(g, drawAxis, state);
        this.painterMethod(g, drawHud, {'state' : state, 'scene' : this});
      }
    }; 
  }();
  


  
  var gameObj = {
    init : function(g){
      gengic = g;
      g.addScene('menu', menuscene);
      var gamescene = gengic.scene.canvasScene({'w': 1000, 'h': 800, 'x' : 500, 'y' : 400});
      gamescene.paint = gamescenePainter;
      
      g.addScene('game', gamescene);
    }
  };
  return gameObj;
})();