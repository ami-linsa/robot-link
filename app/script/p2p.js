var cwd = process.cwd();
var io = require('socket.io-client');
var clients = require(cwd + "/app/script/clients.js");

var size = 3000;
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
init = function(host, port, uid, friends){
	var url = 'https://' + host + ':' + port;
	socket = io.connect(url,{secure:true, transports: ['websocket'],'force new connection':true, reconnect:true, 'try multiple transports':false});

	socket.on('connect', function(){
		console.log('socket connect!');
		socket.uid = uid;
		auth(socket, uid);
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
			console.log('login success ' + uid);
			sendP2PMsg(uid, friends);
		}else if(sid == 90 && cid == 4 && code == 200){
		    console.log('kick out' + uid);
			recvKickOut();
		}else if(sid == 96 && cid == 50 && code == 200){
			receiveP2PMsg();
		}else if(code == 200 && sid == 92 && cid == 1){
			recvMyMsg();
		}else if(code == 200){
			recvUnknow();
			console.log(data);
		}else {
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
	socket.send(msg);
	sockets[uid] = socket;
}

/*
 send peer to peer message
 */
function sendP2PMsg(uid, friends) {
	setInterval(function(){
				doSendP2PMsg(uid, friends)
			}, sendInterval);
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

function getIndex() {
		var index = parseInt(offset) - parseInt(offset%10) + Math.floor(Math.random()*10) ;

		if (index == offset) {
			if(offset % 10 == 0)
				index = index + 1;
			else if(offset % 10 == 9)
				index = index - 1;
		}
		return index;
}

process.on('uncaughtException', function(err){
	console.error('Caught exception: ' + err.stack);	
});
