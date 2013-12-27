var cwd = process.cwd();
var io = require('socket.io-client');
var clients = require(cwd + "/app/script/clients.js");

var size = 5000;
var interval = 100;
var host = '1.1.1.1'
var port = 11;
var syncInterval = 60000;
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
	var socket = io.connect(url,{secure:true, transports: ['websocket'],'force new connection':true, reconnect:true, 'try multiple transports':false});
	socket.on('connect', function(){
			console.log('socket connect!');
			socket.uid = uid;
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
			if(code == 200){
				if(sid == 90 && cid == 34){
					console.log('login success ' + uid);
					syncMsg(uid);
				}else if(sid == 93 && cid == 1){
					recvSync();
				}else if(sid == 91 && cid == 101){
					recvSyncUinfo();
				}else if(sid == 91 && cid == 106){
					recvSyncFriendList();
				}else if(sid == 94 && cid == 104){
					recvSyncTlist();
				}else if(sid == 91 && cid == 102){
					recvSyncUinfoList();
				}else if(sid == 94 && cid == 111){
					recvTuserList();
				}else if(sid == 94 && cid == 9){
					recvTOfflineMsg();
				}else if(sid == 92 && cid ==5){
					recvP2POffline();
				}else{
					recvUnknown();
				}
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
			var jindex = (size*offset) + index;
			uid = clients.getUid(jindex);
			init(host, port, uid);
			index++;
		}
		}, interval);

function auth(socket, uid){
	var msg = '{"SID":90,"CID":34,"Q":[ {"t":"string","v":"{\\"uid\\":' 
		+ uid
		+ ',\\"url\\":\\"vvvvvvvvvvvvvv\\"}"},{"t":"property","v":{"9":"80"}} ]}';
	socket.send(msg);
	sockets[uid] = socket;
}

//send sync message
function syncMsg(uid){
	setInterval(function(){
			doSync(uid);
			}, syncInterval);
}

function doSync(uid){
	monitor('incr', 'syncMsg');
	monitor('start', 'syncMsg', ActFlagType.SYNC);
	sockets[uid].send('{"SID":93,"CID":1,"Q":[ {"t":"ByteIntMap","v":{"1":"0","2":"0","3":"0","5":"0","10":"-1"} }, {"t":"LongIntMap","v":{}} ]}');
}

function recvSync(){
	monitor('incr', 'syncMsgRec');
	monitor('end', 'syncMsg', ActFlagType.SYNC);
}

function recvSyncUinfo(){
	monitor('incr', 'syncUinfo');
}

function recvSyncFriendList(){
	monitor('incr', 'syncFdList');
}

function recvSyncTlist(){
	monitor('incr', 'syncTlist');
}
function recvSyncUinfoList(){
	monitor('incr', 'syncUinfoList');
}

function recvUnknown(){
	monitor('incr', 'unknown');
}

function recvTuserList(){
	monitor('incr', 'tuserList');
}

function recvP2POffline(){
	monitor('incr', 'syncP2POffline');
}

function recvTOfflineMsg(){
	monitor('incr', 'syncTOfflineMsg');
}

function recvError(){
	monitor('incr', 'error');
}

process.on('uncaughtException', function(err){
		console.error('Caught exception: ' + err.stack);	
		});
