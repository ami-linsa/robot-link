var cwd = process.cwd();
var clients = require(cwd + "/app/script/clients.js");
var client = new clients(10);
console.log(client.getuid());
