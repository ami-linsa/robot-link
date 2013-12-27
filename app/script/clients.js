var fs = require("fs");
var cwd = process.cwd();
var uidfile = cwd + "/app/script/uids";


var _uids = fs.readFileSync(uidfile).toString().split("\n");

module.exports = function(offset){
	return _uids[offset];
}

var exp = module.exports;
exp.getUid = function(offset){
	return _uids[offset];
}

exp.getFriends = function(offset){
	var tmpList = [];
	var begin = Math.floor(parseInt(offset)/10) * 10;
	var end = begin + 10;
	for(var i = begin; i < end; ++i) {
		if(i != offset && !!_uids[i]) {
			tmpList.push(_uids[i]);
		}
	}
	return tmpList;
}
/*
   module.exports = (function(){
   var _uids = fs.readFileSync(uidfile).toString().split("\n");

   return function(){
   return _uids;
   };
   })();
 */
