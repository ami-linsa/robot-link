var cwd = process.cwd();
var io = require('socket.io-client');
var clients = require(cwd + "/app/script/clients.js");

var size = 3000;
var interval = 100;
var host = '1.1.1.1'
var port = 11;
var syncInterval = 400000;
var p2pInterval = 50000;
var outInterval = 400000;
var sockets = {};

var ActFlagType = {
	  AUTH: 0,
	  LOGOUT: 1,
	  SYNC: 2,
	  P2P: 3,
};

process.setMaxListeners(0);

/*initialize connection to server side*/
init = function(host, port, uid, friends){
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
			var sid = json.sid;
			var cid = json.cid;
			var code = json.code;
			if(code == 200){
				if(sid == 90 && cid == 34){
					console.log('login success ' + uid);
					recvAuth();
					doSync(uid);
					socket.p2p = sendP2PMsg(uid, friends);
					socket.logout = timeLogout(uid);
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
				}else if(sid == 96 && cid == 50){
					receiveP2PMsg();
				}else if(sid == 92 && cid == 1){
					recvMyMsg();
				}else if(sid == 90 && cid == 6){
					recvLogout();
					//socket.disconnect();
				}else {
					recvUnknown();
				}
			}else{
				recvError();
				console.log(data);
			}
	});

	//encounter connection error
	socket.on('error', function(err){
			console.log('error: ' + err);
			});

	socket.on('disconnect', function(reason){
			console.log('disconnect: ' + reason);
			//socket.disconnect();
			clearInterval(socket.p2p);
			clearInterval(socket.logout);
			//delete sockets[uid];
			init(host, port, uid, friends);
			//loopInit(host, port, uid, friends);
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
			var uid = clients.getUid(jindex);
			var friends = clients.getFriends(jindex);
			init(host, port, uid, friends);
			index++;
		}
	}, interval);

function auth(socket, uid){
	var msg = '{"SID":90,"CID":34,"Q":[ {"t":"string","v":"{\\"uid\\":' 
		+ uid
		+ ',\\"url\\":\\"vvvvvvvvvvvvvv\\"}"},{"t":"property","v":{"9":"80"}} ]}';
	monitor('incr', 'auth');
	monitor('start', 'auth', ActFlagType.AUTH);
	socket.send(msg);
	delete sockets[uid];
	sockets[uid] = socket;
}

function loopInit(host, port, uid, friends){
	setInterval(function(){
			init(host, port, uid, friends);
			}, 2000);
}

function recvAuth(){
	monitor('incr', 'auth');
	monitor('end', 'auth', ActFlagType.AUTH);
}

function timeLogout(uid){
	return setInterval(function (){
			logout(uid);
			}, outInterval);
}

function logout(uid){
	monitor('incr', 'logout');
	monitor('start', 'logout', ActFlagType.LOGOUT);
	sockets[uid].send('{"SID":90,"CID":6}:"Q":[]}');
	}

function recvLogout(){
	monitor('incr', 'logoutRec');
	monitor('end', 'logout', ActFlagType.LOGOUT);
}

/*
   send peer to peer message
 */
function sendP2PMsg(uid, friends) {
	return setInterval(function(){
			doSendP2PMsg(uid, friends)
			}, p2pInterval);
} 

function doSendP2PMsg(uid, friends) {
	var fid = Math.floor(Math.random()*friends.length); 
	monitor('incr', 'p2pMsg');
	monitor('start', 'p2pMsg', ActFlagType.P2P);

	var sendMsg = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL';

	var msg = '{"SID":96,"CID":1,"Q":[ {"t":"property","v":{"1":"'
		+ friends[fid]+ '","5":"0","6":"1","3":"' + sendMsg + '"}} ]}';
	sockets[uid].send(msg);
}

function receiveP2PMsg()
{
	monitor('incr', 'p2pMsgRec');
	monitor('end', 'p2pMsg', ActFlagType.P2P);
}

function recvUnknow()
{
	monitor('incr', 'Unkonwn');
}

function recvMyMsg()
{
	monitor('incr', 'MyMessage');
}

function recvError()
{
	monitor('incr', 'Error');
}

function recvKickOut(){
	monitor('incr', 'KickOut');
}

//send sync message
function syncMsg(uid){
	return setInterval(function(){
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

function recvTuserList(){
	monitor('incr', 'tuserList');
}

function recvP2POffline(){
	monitor('incr', 'syncP2POffline');
}

function recvTOfflineMsg(){
	monitor('incr', 'syncTOfflineMsg');
}
function recvUnknown(){
	    monitor('incr', 'unknown');
}

process.on('uncaughtException', function(err){
		console.error('Caught exception: ' + err.stack);	
		});
