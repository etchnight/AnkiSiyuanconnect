var PORT = 3300;//根据自身情况更改

var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
app.use(express.static('webapp'));//托管网站

app.get('/', function (req, res) {//映射到主页
    res.sendFile(__dirname + '/webapp/index.html');
})

app.post('/getfile', function (req, res) {//获取文件
    //console.log(req);
    var post = '';
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    req.on('data', function (chunk) {
        post += chunk;
        console.log(post);
    });
    req.on('end', function () {
        data = JSON.parse(post);
        fs.readFile(__dirname + "/"+data.path, "binary", function (err, file) {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end(err);
            } else {
                res.writeHead(200, {
                    'Content-Type': "text/plain"
                });
                res.write(file, "binary");
                res.end();
            }
        });
    });
})

app.post('/writefile', urlencodedParser, function (req, res) {//写入文件
    var post = '';
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    req.on('data', function (chunk) {
        post += chunk;
        console.log(post);
    });
    req.on('end', function () {
        data = JSON.parse(post);
        //console.log(post);
        var file = require('./file');
        file.writelastSyncTime(data.filename, data.mode, data.content);
        //console.log("结束写入"+app_api[2]);
        res.write("写入" + data.filename + "成功!");
        res.end();
    });
})
app.listen(PORT);
console.log("输入地址以访问:\n http://localhost:" + PORT + "/index.html ");


