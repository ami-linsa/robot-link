var fs = require('fs');
var cwd = process.cwd();
var io = require('socket.io').listen(9995);

var uidsList = fs.readFileSync(cwd + '/app/script/uids').toString().split('\n');
//console.log('uidsList = %j', uidsList);

io.sockets.on('connection', function(socket) {
  socket.on('message', function(idx) {
    var tmpList = [];
    console.log('idx = ', idx);
    if(!!uidsList[idx]) {
      tmpList.push(uidsList[idx]);
    }

    var begin = Math.floor(parseInt(idx)/10) * 10;
    var end = begin + 10;
    for(var i = begin; i < end; ++i) {
      if(i != idx && !!uidsList[i]) {
        tmpList.push(uidsList[i]);
      }
    }

    socket.emit('message', tmpList);
  });
});

console.log('[pid = %d] ~ Socket.io server is running ...', process.pid);

