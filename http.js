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
app.post('/getdirname', jsonParser, function (_req, res) {
    res.send(__dirname);
})

//判断文件有无,如果没有创建文件夹及文件(逐层)
app.post('/checkfile', jsonParser, function (req, res) {
    data = req.body;
    var targetpath = __dirname + "/";
    fs.stat(__dirname + "/" + data.path, function (err, _stats) {
        if (err) {
            //首先尝试创建文件
            fs.appendFile(__dirname + "/" + data.path, "", async function (_err) {
                //创建不成功则逐层创建目录
                var pathArray = data.path.split("/");
                for (let i = 0; i < pathArray.length - 1; i++) {
                    targetpath = targetpath + "/" + pathArray[i];
                    fs.stat(targetpath, function (err, stats) {
                        console.log(1);
                        if (err) {
                            fs.mkdir(targetpath, (err) => { console.log(err); });
                        } else {
                            console.log(stats);
                        }
                        //最后再创建文件,如果写在外面不会成功
                        fs.appendFile(__dirname + "/" + data.path, "", (err) => { });
                    });
                }
            });

            res.writeHead(201, {
                'Content-Type': "text/plain"
            });
            res.write("未找到文件,但已创建");
            res.end();
        } else {
            res.writeHead(200, {
                'Content-Type': "text/plain"
            });
            res.end();
        }
    })
})

//获取文件
app.post('/getfile', jsonParser, function (req, res) {
    data = req.body;
    fs.readFile(__dirname + "/" + data.path, "binary", function (err, file) {
        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.end();
        } else {
            res.writeHead(200, {
                'Content-Type': "text/plain"
            });
            res.write(file, "binary");
            res.end();
        }
    });
})
//写入文件,这里未经验证是否会创建文件
app.post('/writefile', jsonParser, function (req, res) {
    data = req.body;
    const mode = data.mode;
    const filename = data.filename;
    const content = data.content;
    fs.open("./webapp/" + filename, mode, function (err, fd) {
        if (err) { console.error(err); }
        fs.writeFile(fd, content, function (err) {
            if (err) { console.log(err); } else { console.log("写入文件成功!" + content); }
            // 关闭文件
            fs.close(fd, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
    //res.write("写入" + data.filename + "成功!");
    res.end();
})

app.listen(PORT);
console.log("输入地址以访问:\n http://localhost:" + PORT + "/index.html ");


