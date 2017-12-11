var http=require('http');
var querystring=require('querystring');
var TRANSFER_FLAG = true;//配置是否开启转发
var contentTypes = ['application/x-www-form-urlencoded; charset=UTF-8',
					'multipart/form-data'];
var options = {
	hostname: "127.0.0.1",
	port: 8088,
	path: '/',
	method: 'POST'
}


// @param contentType 0,1
function ajax(path,contentType,data){
	if(TRANSFER_FLAG){
		data = querystring.stringify(data);
		options.path = path;
		options.headers = {
			'Content-Type':contentTypes[contentType],
			'Content-Length':Buffer.byteLength(data)
		}
		var req=http.request(options, function(res) {
		    res.setEncoding('utf-8');
		    res.on('data',function(chun){
		        console.log("transfer");  
		    });  
		    res.on('end',function(){  
		    	console.log("transfer end");
		    });  
		});

		req.on('error',function(err){  
		    console.error(err);
		});  

		req.write(data);  
		req.end();
	}
}

exports.ajax = ajax;