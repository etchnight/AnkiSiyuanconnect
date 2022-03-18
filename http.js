var PORT = 3300;//根据自身情况更改

var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
//创建application/json解析
var jsonParser = bodyParser.json();
//托管网站
app.use(express.static('webapp'));
//映射到主页
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/webapp/index.html');
})
//获取服务器路径
app.post('/getdirname', jsonParser,function (req, res) {
    res.send(__dirname);
})
//获取文件
app.post('/getfile', jsonParser, function (req, res) {
    data = req.body;
    fs.readFile(__dirname + "/" + data.path, "binary", function (err, file) {
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
})
//写入文件
app.post('/writefile', jsonParser, function (req, res) {
    data = req.body;
    var file = require('./file');
    file.writelastSyncTime(data.filename, data.mode, data.content);
    res.write("写入" + data.filename + "成功!");
    res.end();
})

app.listen(PORT);
console.log("输入地址以访问:\n http://localhost:" + PORT + "/index.html ");


