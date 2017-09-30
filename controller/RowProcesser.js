var db = require("../lib/db");

require('promise');
function RowProcesser(row){
    var p = new Promise(
        function(resolve,reject){
            let fb_id = row['fb_id'];
            sql = "select * from camera_feedback_pics where fb_id = ?";
                dataArr = [fb_id]
            db.query(sql, dataArr, function(err,pics){
                if(err){
                  res.json({"code": 501, "data":{"status":"fail","error":err.message}});
                }else {
                    // console.log(pics);
                    row['pics'] = pics;
                }
              });

        }
    );
    return p;
}

exports.RowProcesser=RowProcesser;
