"use strict";
//此文件存放从Siyuan获取数据的处理

//获取带有ankilink自定义属性的blocks,并处理成Anki需要的形式
async function Sync(type) {
    console.clear();
    //这些与创建网页有关
    document.getElementById('HtmlResult').innerHTML = "";
    var result_header = document.getElementById("HtmlResult");
    //初始化,判断是否有相关笔记模板,没有则添加
    let modelNames = await Anki_modelNames();
    if (modelNames.indexOf("Siyuan_Cloze") < 0 || modelNames.indexOf("Siyuan_Basic") < 0) {
        insertAfter("首次运行正在初始化", result_header);
        //await Anki_createModel("Siyuan_Cloze");
        let dirname = await Server_invoke('/getdirname', {});
        dirname = dirname.replace(/\\/g, "/");
        await Anki_importPackage(dirname + "/webapp/AnkiSiyuanconnect.apkg");
        insertAfter("已创建模板", result_header);
    }
    //初始化,判断文件是否存在,不存在则创建
    await Server_invoke('/checkfile', {
        "path": "webapp/user/SyncHistory.txt"
    });
    await Server_invoke('/checkfile', {
        "path": "webapp/user/lastSyncTime.txt"
    });

    //获取同步历史
    let SyncHistory = await Server_invoke('/getfile', {
        "path": "webapp/user/SyncHistory.txt"
    });
    var Syncdata = SyncHistory.split(/[(\r\n)\r\n]+/);
    var SiyuanHistory = [];
    var AnkiHistory = [];
    var temparray = [];
    //var data = {};//需要post的内容
    for (var j = 0; j < Syncdata.length - 1; j++) {
        if (Syncdata[j] != "") {
            temparray = Syncdata[j].split(",");
            SiyuanHistory[j] = temparray[0];
            AnkiHistory[j] = temparray[1];
        }
    }
    //获取上次同步时间
    let lastSyncTime = await Server_invoke('/getfile', {
        "path": 'webapp/user/lastSyncTime.txt'
    });
    //初始化lastSyncTime
    if (lastSyncTime == "") { lastSyncTime = 0; }
    lastSyncTime = parseInt(lastSyncTime);//转换为数字类型

    //强制同步,把lastSyncTime设置为0
    if (type == "force") {
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
                    //console.log(AnkiNote[j]);
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
                let AnkiResponse = await Anki_addNote(deckName, modelName, field1markdown, field2markdown, tags);
                //错误处理
                if (AnkiResponse.code != null) {
                    var AnkiId = AnkiResponse.result.AnkiID;
                    //写入同步历史
                    await Server_invoke('/writefile', {
                        "filename": "user/SyncHistory.txt",
                        "content": SiyuanId + "," + AnkiId + "\n",
                        "mode": "a+"
                    });
                    insertAfter("添加笔记" + SiyuanId + "," + AnkiId + ",并写入同步历史", result_header);
                } else {
                    insertAfter("添加笔记" + SiyuanId + "失败," + AnkiResponse.error, result_header);
                    //重复数据建立关联
                    var field1 = "";
                    var field2 = "";
                    if (AnkiResponse.error == "cannot create note because it is a duplicate") {
                        if (modelName == "Siyuan_Basic") {
                            field1 = "Question";
                            field2 = "Answer";
                        } else if (modelName == "Siyuan_Cloze") {
                            field1 = "Text";
                            field2 = "Extra";
                            field2markdown = "*";//目前填空题没有额外字段,所以这里查找要选择所有
                        }
                        let duplicateAnkiId = await Anki_findNotes(field1, field1markdown, field2, field2markdown);
                        console.log(duplicateAnkiId);
                        if (duplicateAnkiId.length == 1) {
                            await Server_invoke('/writefile', {
                                "filename": "user/SyncHistory.txt",
                                "content": SiyuanId + "," + duplicateAnkiId[0] + "\n",
                                "mode": "a+"
                            });
                            insertAfter("但已将" + SiyuanId + "与" + duplicateAnkiId + "建立关联", result_header);
                        } else {
                            insertAfter(SiyuanId +"未找到重复笔记或有多个,请手动处理", result_header);
                            insertAfter("笔记内容为:" + field1markdown + "\n" + field2markdown, result_header);

                        }
                    } else {
                        insertAfter("笔记内容为:" + field1markdown + "\n" + field2markdown, result_header);
                    }
                }

            }
        }
    }
    //写入同步时间
    var time = formatDate(new Date().getTime(), 'YYMMDDhhmmss');
    //console.log("写入同步时间" + time);
    //写入时间
    await Server_invoke('/writefile', {
        "filename": "user/lastSyncTime.txt",
        "content": time,
        "mode": "w"
    });
    insertAfter("写入同步时间" + time, result_header);
}