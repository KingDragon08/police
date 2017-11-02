var restify = require('restify');


var server = restify.createServer({
	name:'police',
	versions:['1.0.0']
});
server.use(restify.plugins.queryParser());  
server.use(restify.plugins.bodyParser());

server.get(/\/upload\//, restify.plugins.serveStatic({
  directory: __dirname,
  default: '1505817979604.JPG'
}));

global.server = server;

require('./router/demo');
require('./router/user');
require('./router/role');
require('./router/camera');
require('./router/map');
require('./router/mobile');
require('./router/car');
require('./router/file');
require('./router/address');
require('./router/task');
require('./router/cameraSelect');

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
