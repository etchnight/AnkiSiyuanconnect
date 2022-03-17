
function writelastSyncTime(filename, mode, content) {
   //如果是lastSyncTime.txt,mode应为'w',SyncHistory.txt应为a+(追加)或w(删除后复写)
   var fs = require("fs");
   /*
   if (filename == 'lastSyncTime.txt') {//这里不太具有通用性
      mode = 'w';
   } else if (filename == 'SyncHistory.txt') {
      mode = 'a+';
   }
   */
   fs.open("./webapp/" + filename, mode, function (err, fd) {
      if (err) { console.error(err); }
      fs.writeFile(fd, content, function (err) {
         if (err) { console.log(err); }else{console.log("写入文件成功!"+content);}
         // 关闭文件
         fs.close(fd, function (err) { if (err) { console.log(err); } });
      });
   });
}

module.exports = { writelastSyncTime }
