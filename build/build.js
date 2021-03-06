var fs = require('fs');
var uglifyjs = require('uglify-js');
var http = require('http');
var buffer = require('buffer');

var files = require('./files').files;

var ReadFile = function(args,callback){
  fs.readFile(args.file, args.encoding || 'UTF8', function (err, data) {
    if (err) throw err;
    console.log(args.file + " has been read.");
    args.data = data;
    callback();
  });
};

var readAllFiles = function(args,completeCallBack){
    var counter= args.length;
    var callBack = function(){
      counter--;
      if (counter ===0){
        completeCallBack();
      }
    };
    args.forEach(function(args){
      ReadFile(args,callBack);
    });
};

var concatFiles = function(files,callback){
  var container = [];
  files.forEach(function(file){
    var obj = {"file":file};
    container.push(obj);
  });
  
  readAllFiles(container,function(){
    var data = "";
    container.forEach(function(args){
      data = data +"; \n\n" + args.data;
    });
    callback(data);  
  });
};


var WriteFile = function(args,callback){
  fs.writeFile(args.file,args.data,args.encoding || 'UTF8',function(err, data){
    if (err) throw err;
    console.log(args.file + " has been written.");
    if (callback){
      callback();
    }
  });
};

concatFiles(files,function(data){
  var compressed = uglifyjs(data);
  console.log(
    "Data compressed by " + 
    parseInt((1 -(compressed.length/data.length))*100,10) +
    "%.");
  WriteFile({"file":"lib/EWGL.js","data":data});
  WriteFile({"file":"lib/EWGL-min.js","data":compressed});
});