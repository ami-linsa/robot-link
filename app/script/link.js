var io = require('socket.io-client');
var cwd = process.cwd();
var clients = require(cwd + "/app/script/clients.js");

var size = 10000;
var interval = 100;
var host = "1.1.1.1";
var port = 11;


var sockets = {};
	
var ActFlagType = {
	AUTH: 0,
	LOGOUT: 1,
	SYNC: 2,
	P2P: 3,
};

process.setMaxListeners(0);

/*initialize connection to server side*/
init = function(host, port,uid){
	
	var url = 'https://' + host + ':' + port;
	
	var socket = io.connect(url,{secure:true, transports: ['websocket'],'force new connection':true, reconnect:true, 'try multiple transports':false});

	socket.on('connect', function(){
		console.log('socket connect!' + uid);
		socket.uid = uid;
		auth(socket,uid);
	});
		
	socket.on('reconnect', function(){
		console.log('reconnect');
	});

	//receive socket message
	socket.on('message', function(data){
		//console.log(data);
		var json = JSON.parse(data);
		var sid = json.sid;
		var cid = json.cid;
		var code = json.code;
		if(sid == 90 && cid == 34 && code == 200){
			console.log('login success ' + socket.uid);
			}else if(sid == 90 && cid ==4 && code == 200){
			console.log('kickout' + socket.uid);
			kickout();
		}else if( code != 200){
			recvError();
			console.log(data);
		}

	});
		
		//encounter connection error
	socket.on('error', function(err){
		console.log('connect error: ' + err);
	});

	socket.on('disconnect', function(reason){
		console.log('disconnect ' + reason);
	});
};
	

/*
 record request type, name
 */
var monitor = function(type, name, reqId) {
	if (typeof actor !== 'undefined'){
		actor.emit(type, name, reqId);
	} else {
		console.error(Array.prototype.slice.call(arguments, 0));
	}
	}
	

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var offset = (typeof actor !== 'undefined') ? actor.id : 1;
console.log("offset:               "+offset);
var index = 0;

setInterval(function(){
	if (index<size) {
		var jindex = (size*offset)+index;
		uid = clients.getUid(jindex);
		init(host, port,uid);
		index++;
	}
},interval);

function auth(socket,uid){
	var msg = '{"SID":90,"CID":34,"Q":[ {"t":"string","v":"{\\"uid\\":' 
		+ uid 
		+ ',\\"url\\":\\"vvvvvvvvvvvvvv\\"}"},{"t":"property","v":{"9":"80"}} ]}';
	socket.send(msg);
	sockets[uid] = socket
}

function recvError()
{
	monitor('incr', 'Error');
}

function kickout(){
	monitor('incr', 'kickout');
}

process.on('uncaughtException', function(err){
	console.error('Caught exception: ' + err.stack);	
});
