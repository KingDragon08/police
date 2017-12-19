var xmlreader = require("xmlreader");

var db = require("../lib/db");
var mapConfig = require("../config/mapConfig");
var check = require("../lib/check");
var User = require("./userController");
var request = require("../lib/request");
var Log = require('./logController')

/**
 * 添加摄像头
 * @param {[type]} req [description]
 * @param {[type]} res [description]
 */
function getFuzzyAddr(req,res){
	var query = req.body;
	try{
        var info = query.info || "";
        if (check.isNull(info)) {
            res.json({"code": 401, "data":{"status":"fail","error":"信息为空"}});
            return ;
        }

		var size = query.size || 20;

        var host = mapConfig.host;
        var port = mapConfig.port;
        var url = "/dfc/services/geocoding/matching/fuzzy";
        var jsondata = {"address": info, "top": size};

        request.get(host, port, url, jsondata, function(err, res){
            if (err) {
                res.json({"code": 502, "data":{"status":"fail","error":err.message}});
                return ;
            }

            xmlreader.read(res, function(errors, response){
                if(null !== errors ){
                    res.json({"code": 503, "data":{"status":"fail","error":errors}});
                    return;
                }
                console.log( response);
                //Log.insertLog(req.body.mobile,req.url,sql);
				res.json({"code": 200, "data":{"status":"success","error":"success", "rows":""}});
            });
        });
	} catch(e) {
		res.json({"code": 500, "data":{"status":"fail","error":e.message}});
	}
}

exports.getFuzzyAddr = getFuzzyAddr;
