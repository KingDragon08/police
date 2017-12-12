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

//uncaughtException event
server.on('uncaughtException', function(req, res, route, err) {
    // this event will be fired, with the error object from above:
    // ReferenceError: x is not defined
    res.json({
        code:500,
        err:err.message,
        url:route,
    });
    console.log(route,err.message);
});

global.server = server;

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
require('./router/department');
require('./router/log');
require('./router/carSelect');
require('./router/speed');
require('./router/addressTest');
require('./router/layer');

server.listen(8081, function() {
  console.log('%s listening at %s', server.name, server.url);
});
