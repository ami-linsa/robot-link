var cwd = process.cwd();
var io = require('socket.io-client');
var clients = require(cwd + "/app/script/clients.js");

var size = 1;
var interval = 100;
var host = '1.1.1.1';
var port = 9092;
var sendInterval = 5000;

var sockets = {};

var ActFlagType = {
	AUTH: 0,
	LOGOUT: 1,
	SYNC: 2,
	P2P: 3,
};

process.setMaxListeners(0);

/*initialize connection to server side*/
init = function(host, port, uid){
	var url = 'https://' + host + ':' + port;
	socket = io.connect(url,{secure:true, transports: ['websocket'],'force new connection':true, reconnect:true, 'try multiple transports':false});
	
	socket.on('connect', function(){
			console.log('socket connect!');
			auth(socket, uid);
			});

	socket.on('reconnect', function(){
			console.log('reconnect');
			});

	socket.on('message', function(data){
			//console.log(data);
			var json = JSON.parse(data);
			/*
			   if (typeof data === 'string'){
			   json = JSON.parse(data);
			   }*/
			var sid = json.sid;
			var cid = json.cid;
			var code = json.code;
			if(sid == 90 && cid == 34 && code == 200){
				console.log('login success');
				recvAuth();
				timeLogout(uid);
			}
			else if(code == 200 && sid == 90 && cid == 6){
				recvLogout();
				timeAuth(uid);
			}else if(code == 200){
				recvUnknown();
			}else{
				recvError();
				console.log(data);
			}

	});

	//encounter connection error
	socket.on('error', function(err){
			console.log(socket);
			console.log('error: ' + err);
			});

	socket.on('disconnect', function(reason){
			console.log('disconnect: ' + reason);
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
var index = 0;

setInterval(function(){
		if(index < size){
			var jindex =(size*offset) + index;
			uid = clients.getUid(jindex);
			init(host, port, uid);
			index++;
		}
		});

function auth(socket, uid){
	monitor('incr', 'auth');
	monitor('start', 'auth', ActFlagType.AUTH);
	var msg = '{"SID":90,"CID":34,"Q":[ {"t":"string","v":"{\\"uid\\":' 
		+ uid 
		+ ',\\"url\\":\\"vvvvvvvvvvvvvv\\"}"},{"t":"property","v":{"9":"80"}} ]}';
	console.log(msg);
	socket.send(msg);
	sockets[uid] = socket;
}

function timeAuth(uid){
	setInterval(function(){
				auth2(uid);
			}, sendInterval);
}

function timeLogout(uid){
	setInterval(function (){
				logout(uid);
			}, sendInterval);
}

function recvAuth(){
	    monitor('incr', 'authRecv');
		monitor('end', 'logout', ActFlagType.AUTH);
}

function auth2(uid){
	monitor('incr', 'auth');
	monitor('start', 'auth', ActFlagType.AUTH);
	var msg = '{"SID":90,"CID":34,"Q":[ {"t":"string","v":"{\\"uid\\":'
		+ uid
		+ ',\\"url\\":\\"vvvvvvvvvvvvvv\\"}"},{"t":"property","v":{"9":"80"}} ]}';
	console.log(msg);
	sockets[uid].send(msg);
}

function logout(uid){
	monitor('incr', 'logout');
	monitor('start', 'logout', ActFlagType.LOGOUT);
	sockets[uid].send('{"SID":90,"CID":6}:"Q":[]}');
}

function recvLogout(){
	monitor('incr', 'logoutRec');
	monitor('end', 'logout', ActFlagType.SYNC);
}
function recvError(){
	    monitor('incr', 'error');
}

process.on('uncaughtException', function(err){
		console.error('Caught exception: ' + err.stack);	
		});
