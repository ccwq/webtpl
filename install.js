var process = require('child_process');
var fs = require("fs");
var path = require("path");

var ex = exports;
var config = {
    "images":"noop",                                //noop只创建目录，不执行任何操作，不计入任务
    "pages":"noop",
    //"":"bower install ccwq/wwwTpl",
    "js":"bower install ccwq/cseajs",               //可以执行其他任务
    "css":"bower install ccwq/lessTool"
};

var execTpl = "cd {key}&&{el}";
var path_win = fs.realpathSync('.') + "\\";
var path_node = path_win.replace(/\\/g,"/");

initTools();




//mkdir('a/b/c/d', function(err) {console.log(err);});
//mkdirSync('a/b/c/d');


//命令列表
var cmdstrList = [];

for(var key in config){
    var cmdstr="";
    var el = config[key];
    var ke = path_node
    //先创建文件夹
    if(key) ex.mkdirSync(key);

    //noop只创建目录，不执行任何操作，不计入任务
    if(el==="noop") continue;
    cmdstr +=
        execTpl
            .replace("{key}",path_win + key)
            .replace("{el}",el)
    ;

    //表示命令间隔
    cmdstrList.push(cmdstr);
}


var errorCount= 0, successCount=0;
//顺序执行
function runNext(i){
    if(cmdstrList.length<=i){
        return;
    }

    //执行shell 调用bower来下载文件
    process.exec(
        cmdstrList[i],
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
                errorCount ++;
            }else{
                console.log("success:" + stdout);
                successCount++;
            }


            if(i>=cmdstrList.length-1){
                console.log("任务报告::总共执行"+cmdstrList.length+"个任务;错误" +errorCount+"个;正确"+ successCount+"个");
            }else{
                runNext(i+1);
            }
        }
    );
}

//写入bower配置
ex.wrfile(".bowerrc",'{ "directory" : "/" }',function(err){
    if(!err){
        console.log(".bowerrc添加成功");
    }
});

//从第0个开始执行
runNext(0);


//工具函数
function initTools(){
    //异步的实现
    var mkdir = function(dirpath, mode, callback) {
        if(arguments.length === 2) {
            callback = mode;
            mode = 0777;
        }

        fs.exists(dirpath, function(exists) {
            if(exists) {
                callback(null);
            } else {
                mkdir(path.dirname(dirpath), mode, function(err) {
                    // console.log('>>', dirpath)
                    if(err) return callback(err);
                    fs.mkdir(dirpath, mode, callback);
                });
            }
        });
    };

    ex.mkdir = mkdir;


    //同步的实现，当然啦，写Node.js代码推荐都使用异步实现
    var mkdirSync = function(dirpath, mode) {
        dirpath.split('\/').reduce(function(pre, cur) {
            var p = path.resolve(pre, cur);
            if(!fs.existsSync(p)) fs.mkdirSync(p, mode || 0755);
            return p;
        }, __dirname);
    };

    ex.mkdirSync = mkdirSync;


    // 写文件
    function wrfile(filepath,content,callback){
        fs.writeFile(filepath, content, function (error) {
            if (error) {
                console.log("写文件出错:" + error);
            }
            callback(error);
            // 继续操作
        });
    }

    ex.wrfile = wrfile;

}