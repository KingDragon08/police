var restify = require('restify');


var server = restify.createServer({
	name:'police',
	versions:['1.0.0']
});
server.use(restify.plugins.queryParser());  
server.use(restify.plugins.bodyParser({ mapParams: true }));

global.server = server;

require('./router/demo');
require('./router/user');

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});