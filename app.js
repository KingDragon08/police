var restify = require('restify');


var server = restify.createServer({
	name:'police',
	versions:['1.0.0']
});
server.use(restify.plugins.queryParser());  
server.use(restify.plugins.bodyParser());

global.server = server;

require('./router/demo');
require('./router/user');
require('./router/camera');
require('./router/map');
require('./router/mobile');

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
