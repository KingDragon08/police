var http = require('http');
var querystring = require('querystring');

function get(host, port=80, url, jsondata, callback){

    var data = querystring.stringify(jsondata);

    var requestUrl = url + '?' + data;

    var options = {
        hostname: host,
            port: port,
            path: requestUrl,
          method: 'GET'
    };

    //发送请求
    var req = http.request(options,function(res){
        res.setEncoding('utf8');
        res.on('data',function(chunk){
            callback(null, chunk);
        });
    });

    //如果有错误会输出错误
    req.on('error', function(e){
        callback(e.message, null);
    });

    req.end();
}

function post(host, port=80, url, jsondata, callback){

    var data =  querystring.stringify(jsondata);

    var options = {
        hostname: host,
            port: port,
            path: url,
          method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };

    var req = http.request(options,function(res){
        res.setEncoding('utf8');
        res.on('data',function(chunk){
            callback(null, chunk);
            // var returnData = JSON.parse(chunk);//如果服务器传来的是json字符串，可以将字符串转换成json
            // console.log(returnDataata);
        });
    });

    //如果有错误会输出错误
    req.on('error', function(e){
        callback(e.message, null);
        //  console.log('错误：' + e.message);
    });

    // 写入请求数据
    req.write(data);

    req.end();
}

exports.get = get;
exports.post = post;
