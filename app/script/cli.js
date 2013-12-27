var util = require('util');
var sioCli = require('socket.io-client');
var socket = null;
var offsetList = [0, 5, 9, 10, 15, 19, 20, 25];

var start = function(host, port) {
  socket = sioCli.connect(host + ':' + port,
    {'force new connection': true, 'reconnect': false});
  socket.on('connect', function() {
    doSend();
  });
  socket.on('message', function(uidsList) {
    // ths first is mine, the last are my friends'.
    console.log('uidsList = %j', uidsList);
    console.log('uidsList.length = ', uidsList.length);
    console.log('==============================');
  });
};

var doSend = function() {
  for(var i in offsetList) {
    socket.emit('message', offsetList[i]);
    console.log('offset = ', offsetList[i]);
  }
};

start('127.0.0.1', 9995);

