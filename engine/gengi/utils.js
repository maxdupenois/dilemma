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
  return (!exports.exists(str)) || exports.trim(str).length() == 0;
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
exports.eachOfMap = function(map, func){
  var keys = exports.mapKeys(map);
  for(var k=0; k < keys.length; k++){
    func(keys[k], map[keys[k]]);
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

exports.copy = function(){
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
  return copier(obj);
};