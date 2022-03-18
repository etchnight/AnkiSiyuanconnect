"use strict";
//此文件存放从Siyuan获取数据的处理

//获取带有ankilink自定义属性的blocks,并处理成Anki需要的形式
async function getSiyuanBlocks(type) {
    console.clear();
    //这些与创建网页有关
    document.getElementById('result').innerHTML = "";
    var result_header = document.getElementById("result");
    //获取同步历史
    let SyncHistory = await Server_invoke('/getfile', JSON.stringify({
        "path":'webapp/user/SyncHistory.txt'
    }));
    var Syncdata = SyncHistory.split(/[(\r\n)\r\n]+/);
    var SiyuanHistory = [];
    var AnkiHistory = [];
    var temparray = [];
    var data={};//需要post的内容
    for (var j = 0; j < Syncdata.length - 1; j++) {
        if (Syncdata[j] != "") {
            temparray = Syncdata[j].split(",");
            SiyuanHistory[j] = temparray[0];
            AnkiHistory[j] = temparray[1];
        }
    }
    //console.log(AnkiHistory);
    let lastSyncTime = await Server_invoke('/getfile', JSON.stringify({
        "path":'webapp/user/lastSyncTime.txt'
    }));
    lastSyncTime = parseInt(lastSyncTime);//转换为数字类型
    if (type == "force") {//强制同步,把lastSyncTime设置为0
        lastSyncTime = 0;
    }
    //在文本中写入
    insertAfter("上次同步时间:" + lastSyncTime, result_header);
    //console.log("上次同步时间:"+lastSyncTime);
    let SiyuanBlocks = await Siyuan_sql("SELECT * FROM blocks WHERE ial LIKE '%custom-ankilink%'", () => { });
    insertAfter("共查询到思源笔记中" + SiyuanBlocks.length + "条Anki笔记", result_header);
    //console.log("查询思源笔记成功,内容为:");
    //console.log(SiyuanBlocks);
    for (let i = 0; i < SiyuanBlocks.length; i++) {
        //console.log("第" + i + "次循环")
        //ID
        var SiyuanId = SiyuanBlocks[i].id;
        //父级
        //let parent_id = SiyuanBlocks[i].parent_id;
        //await Siyuan_sql(getParent, "SELECT markdown FROM blocks WHERE id=" + parent_id);
        //获取笔记更新时间
        let updated = SiyuanBlocks[i].updated;
        var updateTime = parseInt(updated);
        if (updateTime > lastSyncTime) {
            //自定义属性
            let ial = SiyuanBlocks[i].ial;

            //卡组

            let deckName = ial.match(/(?<=deck_name=&quot;)(.*?)(?=&quot;)/);
            if (deckName == null) {
                deckName = ial.match(/(?<=deck_name=&amp;quot;)(.*?)(?=&amp;quot;)/);
            }
            if (typeof deckName != 'string') {
                deckName = deckName[0];
            }
            //标签
            let tags = ial.match(/(?<=tags=\[)(.*?)(?=\])/);
            if (tags != null) {
                tags = tags[0].replace(/&quot;/g, "");
                tags = tags.split(",");
            } else {
                tags = "";
            }

            //模板
            let modelName = ial.match(/(?<=modelName=&quot;)(.*?)(?=&quot;)/);
            if (modelName == null) {//有时候包裹模板的字符不同
                modelName = ial.match(/(?<=modelName=&amp;quot;)(.*?)(?=&amp;quot;)/);
            }
            if (typeof modelName != 'string') {
                modelName = modelName[0];
            }
            //笔记类型
            //var SiyuanType = SiyuanBlocks[i].type;
            //转换笔记
            let markdown = SiyuanBlocks[i].markdown;
            if (modelName == "Siyuan_Basic") {
                let AnkiNote = markdown.split("\n");
                let Question = "";//每次循环都要先清空问题和答案
                let Answer = "";
                //寻找问题
                for (let j = 0; j < AnkiNote.length; j++) {
                    console.log(AnkiNote[j]);
                    if (AnkiNote[j].indexOf("#问题#") != -1 || AnkiNote[j].indexOf("#Anki#") != -1) {
                        Question = AnkiNote[j].replace(/#.*?#/g, "");//删除标签
                        Answer = "";//问题后面才是答案开始
                    } else {
                        Answer = Answer + "\n" + AnkiNote[j];
                    }
                }
                var field1markdown = Question;
                //var field2markdown = Answer.replace(/\n/g,"<br>");
                var field2markdown = Answer;
                //没有找到根据块类型寻找问题
                /*
                if (Question == (undefined || null)) {
                    Question = AnkiNote[1].replace(/#.*?#/g, "");
                    Answer = AnkiNote.slice(2, AnkiNote.length - 1);
                    Answer = Answer.join("\n");
                }
                //console.log(AnkiNote);
                */
            } else {
                let AnkiNote = markdown.replace(/(\*{2})(.*?)(\*\*)/g, "***{{c1::$2}}***");
                AnkiNote = AnkiNote.replace(/\n/g, "<br>");//换行替代
                AnkiNote = AnkiNote.replace(/#.*?#/g, "");//删除标签
                AnkiNote = AnkiNote.replace(/\s/g, "&nbsp;");//为了把空格传入Anki
                //AnkiNote=AnkiNote.replace(/<br>>/g,"<br>");//\u003e,删除引述符号>
                var field1markdown = AnkiNote;
                var field2markdown = "";
            }
            //判断是否为原有
            var index = SiyuanHistory.indexOf(SiyuanId);
            if (index != -1) {
                //更新笔记
                var AnkiID = parseInt(AnkiHistory[index]);
                Anki_updateNoteFields(modelName, AnkiID, field1markdown, field2markdown);
                insertAfter("更新笔记" + SiyuanHistory[index] + "=>" + AnkiHistory[index], result_header);
                //这里缺少错误处理
            } else {
                //添加笔记
                let AnkiResponse = await Anki_addNote(deckName, modelName, field1markdown, field2markdown, tags, () => { });
                //错误处理
                if (AnkiResponse.code == 0) {
                    var AnkiId=AnkiResponse.data.AnkiID;
                    //写入同步历史
                    data=JSON.stringify({
                        "filename":"SyncHistory.txt",
                        "content":SiyuanId + "," + AnkiId + "\n",
                        "mode":"a+"
                    })
                    await Server_invoke('/writefile', data);
                    //网页输出
                    insertAfter("添加笔记" + SiyuanId + "," + AnkiId + ",并写入同步历史", result_header);
                }else{
                    insertAfter("添加笔记" + SiyuanId + "失败!", result_header);
                    insertAfter(AnkiResponse.msg, result_header);
                }

            }
        }
    }
    //写入同步时间
    var time = formatDate(new Date().getTime(), 'YYMMDDhhmmss');
    //console.log("写入同步时间" + time);
    //写入时间
    data=JSON.stringify({
        "filename":"lastSyncTime.txt",
        "content":time,
        "mode":"w"
    })
    await Server_invoke('/writefile', data);
    insertAfter("写入同步时间" + time, result_header);
}