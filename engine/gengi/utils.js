var crypto = require('crypto');

exports.uuid = function(){
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

exports.md5 = function(val){
  if(!(val instanceof String)){
    val = JSON.stringify(val);
  }
  var md5 = crypto.createHash('md5');
  md5.update(val, 'ascii');
  return md5.digest('hex');
};

exports.select = function(iterable, func){
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


exports.trim = function(str){
  return str.replace(/(^\s*)|(\s*$)/, "");
};

exports.exists = function(obj){
  return ((typeof(obj)).toLowerCase() != "undefined" && obj != null);
};

exports.isblank = function(str){
  return (!exports.exists(str)) || exports.trim(str).length == 0;
};

exports.mapKeys = function(obj){
  var actkeys = [];
  for(var k in obj){
    if(! (obj[k] instanceof Function)) actkeys.push(k);
  }
  return actkeys;
};

exports.map = function(iterable, func){
  var newarr = [];
  for(var i in iterable){
    if(iterable[i] instanceof Function) continue;
    newarr.push(func(iterable[i]));
  }
  return newarr;
};
exports.reduce = function(iterable, init, func){
  var val = init;
  for(var i in iterable){
    if(iterable[i] instanceof Function) continue;
    val = func(val, iterable[i]);
  }
  return val;
};
exports.each = function(iterable, func){
  if (iterable instanceof Array){
    for(var i=0; i < iterable.length; i++){
      func(i, iterable[i]);
    }
  }else{
    var keys = exports.mapKeys(iterable);
    for(var k=0; k < keys.length; k++){
      func(keys[k], iterable[keys[k]]);
    }
  }

};



exports.clone = function(){
  // http://oranlooney.com/functional-javascript
  function Clone() { };
  return function (obj) {
      Clone.prototype = obj;
      return new Clone();
  };
}();

exports.copy = function(object){
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





exports.keycodes = {
  "backspace" : 8,
  "tab" : 9,
  "enter" : 13,
  "shift" : 16,
  "ctrl" : 17,
  "alt" : 18,
  "break" : 19,
  "caps lock" : 20,
  "escape" : 27,
  "page up" : 33,
  "page down" : 34,
  "end" : 35,
  "home" : 36,
  "left arrow" : 37,
  "up arrow" : 38,
  "right arrow" : 39,
  "down arrow" : 40,
  "insert" : 45,
  "delete" : 46,
  "0" : 48,
  "1" : 49,
  "2" : 50,
  "3" : 51,
  "4" : 52,
  "5" : 53,
  "6" : 54,
  "7" : 55,
  "8" : 56,
  "9" : 57,
  "a" : 65,
  "b" : 66,
  "c" : 67,
  "d" : 68,
  "e" : 69,
  "f" : 70,
  "g" : 71,
  "h" : 72,
  "i" : 73,
  "j" : 74,
  "k" : 75,
  "l" : 76,
  "m" : 77,
  "n" : 78,
  "o" : 79,
  "p" : 80,
  "q" : 81,
  "r" : 82,
  "s" : 83,
  "t" : 84,
  "u" : 85,
  "v" : 86,
  "w" : 87,
  "x" : 88,
  "y" : 89,
  "z" : 90,
  "leftwindow" : 91,
  "rightwindow" : 92,
  "select" : 93,
  "num_0" : 96,
  "num_1" : 97,
  "num_2" : 98,
  "num_3" : 99,
  "num_4" : 100,
  "num_5" : 101,
  "num_6" : 102,
  "num_7" : 103,
  "num_8" : 104,
  "num_9" : 105,
  "num_*" : 106,
  "num_+" : 107,
  "num_-" : 109,
  "num_." : 110,
  "num_/" : 111,
  "f1" : 112,
  "f2" : 113,
  "f3" : 114,
  "f4" : 115,
  "f5" : 116,
  "f6" : 117,
  "f7" : 118,
  "f8" : 119,
  "f9" : 120,
  "f10" : 121,
  "f11" : 122,
  "f12" : 123,
  "numlock" : 144,
  "scrolllock" : 145,
  ";" : 186,
  "=" : 187,
  "," : 188,
  "-" : 189,
  "." : 190,
  "/" : 191,
  "grave" : 192,
  "{" : 219,
  "\\" : 220,
  "}" : 221,
  "'" : 222
};

exports.charcodes = {
  " " : 32,
  "!" : 33,
  "\"": 34,
  "#" : 35,
  "$" : 36,
  "%" : 37,
  "&" : 38,
  "'" : 39,
  "(" : 40,
  ")" : 41,
  "*" : 42,
  "+" : 43,
  "," : 44,
  "-" : 45,
  "." : 46,
  "/" : 47,
  "0" : 48,
  "1" : 49,
  "2" : 50,
  "3" : 51,
  "4" : 52,
  "5" : 53,
  "6" : 54,
  "7" : 55,
  "8" : 56,
  "9" : 57,
  ":" : 58,
  ";" : 59,
  "<" : 60,
  "=" : 61,
  ">" : 62,
  "?" : 63,
  "@" : 64,
  "A" : 65,
  "B" : 66,
  "C" : 67,
  "D" : 68,
  "E" : 69,
  "F" : 70,
  "G" : 71,
  "H" : 72,
  "I" : 73,
  "J" : 74,
  "K" : 75,
  "L" : 76,
  "M" : 77,
  "N" : 78,
  "O" : 79,
  "P" : 80,
  "Q" : 81,
  "R" : 82,
  "S" : 83,
  "T" : 84,
  "U" : 85,
  "V" : 86,
  "W" : 87,
  "X" : 88,
  "Y" : 89,
  "Z" : 90,
  "[" : 91,
  "\\": 92,
  "]" : 93,
  "^" : 94,
  "_" : 95,
  "`" : 96,
  "a" : 97,
  "b" : 98,
  "c" : 99,
  "d" : 100,
  "e" : 101,
  "f" : 102,
  "g" : 103,
  "h" : 104,
  "i" : 105,
  "j" : 106,
  "k" : 107,
  "l" : 108,
  "m" : 109,
  "n" : 110,
  "o" : 111,
  "p" : 112,
  "q" : 113,
  "r" : 114,
  "s" : 115,
  "t" : 116,
  "u" : 117,
  "v" : 118,
  "w" : 119,
  "x" : 120,
  "y" : 121,
  "z" : 122,
  "{" : 123,
  "|" : 124,
  "}" : 125,
  "~" : 126
  }	