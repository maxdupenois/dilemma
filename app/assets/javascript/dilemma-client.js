;var dilemmac = (function(){
  var gengic = null;
  
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
      $('body').html("");
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
        // NOT YET SUPPORTED
        // star.path = new Path();
        // star.path.moveTo(x,y-(size/2)*star.s);
        // star.path.lineTo(x,y+(size/2)*star.s);
        // star.path.moveTo(x-(size/2)*star.s,y);
        // star.path.lineTo(x+(size/2)*star.s,y);
        // star.path.closePath();
        stars.push(star);
      }
      return stars;
    };
    var stars = null;
    var drawStarField = function(g){
      g.save();
      var w = g.canvas.width;
      var h = g.canvas.height;
      if(stars==null) stars = buildStarField(w, h); 
      
      g.lineWidth = 2;
      var size = 3;
      for(var i = 0; i < stars.length; i++){
        g.strokeStyle = stars[i].c;
        g.fillStyle = stars[i].c;
        g.beginPath();
        g.moveTo(stars[i].x,stars[i].y-(size/2)*stars[i].s);
        g.lineTo(stars[i].x+(size/8)*stars[i].s,stars[i].y-(size/8)*stars[i].s);
        g.lineTo(stars[i].x+(size/2)*stars[i].s,stars[i].y);
        g.lineTo(stars[i].x+(size/8)*stars[i].s,stars[i].y+(size/8)*stars[i].s);
        g.lineTo(stars[i].x,stars[i].y+(size/2)*stars[i].s);
        g.lineTo(stars[i].x-(size/8)*stars[i].s,stars[i].y+(size/8)*stars[i].s);
        g.lineTo(stars[i].x-(size/2)*stars[i].s,stars[i].y);
        g.lineTo(stars[i].x-(size/8)*stars[i].s,stars[i].y-(size/8)*stars[i].s);
        g.lineTo(stars[i].x,stars[i].y-(size/2)*stars[i].s);        
        g.fill();
        g.closePath();
        
      }
      g.restore();
    };
    var drawPlanet = function(g, planet){
      g.save();
      g.fillStyle = planet['c'];

      g.beginPath();
      g.arc(planet['x'], planet['y'], planet['r'], 0 , 2*Math.PI);
      g.shadowColor = planet['c'];
      g.shadowBlur = 20;
      g.fill();
      if (planet['selected']){
        g.strokeStyle = "#FF0000" ;
        g.lineWidth = 3;
        g.stroke();
      }else{
        // g.strokeStyle =  "#777799";
        // g.lineWidth = 1;
      }
      g.closePath();
      g.restore();
    }; 
    return function(g, state){
      drawStarField(g);
      if(state["planets"]){
        for(p in state["planets"]) {
          if(state["planets"][p]['x']) drawPlanet(g, state["planets"][p]);
        }
      }
    }; 
  }();
  


  
  var gameObj = {
    init : function(g){
      gengic = g;
      g.addScene('menu', menuscene);
      var gamescene = gengic.newCanvasScene();
      gamescene.paint = gamescenePainter;
      g.addScene('game', gamescene);
    }
  };
  return gameObj;
})();