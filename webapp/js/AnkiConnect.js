//此文件存放与Anki通信相关的代码
"use strict";
function Anki_invoke(action, version, params = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'response has an unexpected number of fields';
                }
                if (!response.hasOwnProperty('error')) {
                    throw 'response is missing required error field';
                }
                if (!response.hasOwnProperty('result')) {
                    throw 'response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', 'http://127.0.0.1:8765');
        xhr.send(JSON.stringify({ action, version, params }));
    });
}

//列出卡牌组
async function Anki_deckNames() {
    const result = await Anki_invoke('deckNames', 6);
    //callback(result);
    return result;
}

//列出笔记
async function Anki_findNotes(deckname) {
    const result = await Anki_invoke('findNotes', 6, {
        "query": "deck:" + deckname
    });
    //callback(result);
    return result;
}

//列出卡牌
async function Anki_findCards(deckname) {
    const result = await Anki_invoke('findCards', 6, {
        "query": "deck:" + deckname
    });
    //callback(result);
    return result;
}

//笔记信息
async function Anki_notesInfo(notesID = []) {
    const result = await Anki_invoke('notesInfo', 6, {
        "notes": notesID
    });
    return result;
}
//导入牌组包
async function Anki_importPackage(path) {
    const result = await Anki_invoke('importPackage', 6, {
        "path": path
    });
    return result;
}

//添加笔记
async function Anki_addNote(deckName, modelName, field1markdown, fiekd2markdown, tags = []) {
    let field1 = "";
    let field2 = "";
    if (modelName == "Siyuan_Basic") {
        field1 = "Question";
        field2 = "Answer";
    } else if (modelName == "Siyuan_Cloze") {
        field1 = "Text";
        field2 = "Extra";
    } else {
        throw new Error('本程序只支持Siyuan_Basic与Siyuan_Cloze两种模板类型');
    }
    try {
        let result = await Anki_invoke('addNote', 6, {
            "note": {
                "deckName": deckName,
                "modelName": modelName,
                "fields": {
                    [field1]: field1markdown,
                    [field2]: fiekd2markdown
                },
                "options": {
                    "allowDuplicate": false,
                    "duplicateScope": "*",
                    "duplicateScopeOptions": {
                        "deckName": "*",
                        "checkChildren": false,
                        "checkAllModels": false
                    }
                },
                "tags": tags,
                /*
                "audio": [{
                    "url": "https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji=猫&kana=ねこ",
                    "filename": "yomichan_ねこ_猫.mp3",
                    "skipHash": "7e2c2f954ef6051373ba916f000168dc",
                    "fields": [
                        "Front"
                    ]
                }],
                "video": [{
                    "url": "https://cdn.videvo.net/videvo_files/video/free/2015-06/small_watermarked/Contador_Glam_preview.mp4",
                    "filename": "countdown.mp4",
                    "skipHash": "4117e8aab0d37534d9c8eac362388bbe",
                    "fields": [
                        "Back"
                    ]
                }],
                "picture": [{
                    "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/A_black_cat_named_Tilly.jpg/220px-A_black_cat_named_Tilly.jpg",
                    "filename": "black_cat.jpg",
                    "skipHash": "8d6e4646dfae812bf39651b59d7429ce",
                    "fields": [
                        "Back"
                    ]
                }]*/
            }

        });
        //callback(result);
        return {
            "code": 0,
            "msg": "",
            "data": { "AnkiID": result }
        };
    } catch (err) {
        //callback(err+"\n笔记内容为:\n"+field1markdown+"\n"+fiekd2markdown);
        return {
            "code": -1,
            "msg": err + '\n笔记内容为:\n' + field1markdown + '\n' + fiekd2markdown,
            "data": null
        }
    }
}

//更新笔记
async function Anki_updateNoteFields(modelName, id, field1markdown, fiekd2markdown) {
    let field1 = "";
    let field2 = "";
    if (modelName == "Siyuan_Basic") {
        field1 = "Question";
        field2 = "Answer";
    } else if (modelName == "Siyuan_Cloze") {
        field1 = "Text";
        field2 = "Extra";
    } else {
        throw new Error('本程序只支持Siyuan_Basic与Siyuan_Cloze两种模板类型');
    }
    try {
        const result = await Anki_invoke('updateNoteFields', 6, {
            "note": {
                "id": id,
                "fields": {
                    [field1]: field1markdown,
                    [field2]: fiekd2markdown//json中key使用变量必须加[]
                }/*,
            "audio": [{
                "url": "https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji=猫&kana=ねこ",
                "filename": "yomichan_ねこ_猫.mp3",
                "skipHash": "7e2c2f954ef6051373ba916f000168dc",
                "fields": [
                    "Front"
                ]  
            }]*/
            }
        });
        return result;
    } catch (err) {
        console.log("更新Anki失败");
        console.log(err);
    }
}


//创建模板(仅仅Siyuan_Cloze和Siyuan_Basic),以下代码会出现问题,已弃用,改用导入方法创建模板
async function Anki_createModel(modelName) {
    const script = "<script>" + "\n" +
        "    function addStylesheet(src, callback) {" + "\n" +
        "        var s = document.createElement('link');" + "\n" +
        "        s.rel = 'stylesheet';" + "\n" +
        "        s.href = src;" + "\n" +
        "        s.onload = callback;" + "\n" +
        "        document.head.appendChild(s);" + "\n" +
        "    }" + "\n" +
        "    function addScript(src, callback) {" + "\n" +
        "        var s = document.createElement('script');" + "\n" +
        "        s.src = src;" + "\n" +
        "        s.type = 'text/javascript';" + "\n" +
        "        s.onload = callback;" + "\n" +
        "        document.body.appendChild(s);" + "\n" +
        "    }" + "\n" +
        "    function replaceAllWhitespaceWithSpace(str) {" + "\n" +
        "        return str.replace(/[\\t\\v\\f \\u00a0\\u2000-\\u200b\\u2028-\\u2029\\u3000]/g, ' ');" + "\n" +
        "    }" + "\n" +
        "    var highlightcssUrl = '_highlight.default.min.css';" + "\n" +
        "    var showdownUrl = '_showdown.min.js';" + "\n" +
        "    addStylesheet(highlightcssUrl, function () {" + "\n" +
        "    });" + "\n" +
        "    addScript(showdownUrl, function () {" + "\n" +
        "        var highlightjsUrl = '_highlight.min.js';" + "\n" +
        "        addScript(highlightjsUrl, function () {" + "\n" +
        "            function processShowdownDivs() {" + "\n" +
        "                var showdownConverter = new showdown.Converter();" + "\n" +
        "                showdownConverter.setFlavor('github');" + "\n" +
        "                document.querySelectorAll('div.md-content').forEach((div) => {" + "\n" +
        "                    var rawText = div.innerText.replace(/<\/div>/g, ''); " + "\n" +
        "                    var classes = div.className.replace(/md-content/g, '');" + "\n" +
        "                    var text = replaceAllWhitespaceWithSpace(rawText); " + "\n" +
        "                    //text=rawText;" + "\n" +
        "                    var html = showdownConverter.makeHtml(text);" + "\n" +
        "                    var newDiv = document.createElement('div');" + "\n" +
        "                    newDiv.innerHTML = html;" + "\n" +
        "                    newDiv.className = classes;" + "\n" +
        "                    newDiv.querySelectorAll('pre code').forEach((block) => {" + "\n" +
        "                        hljs.highlightBlock(block);" + "\n" +
        "                    });" + "\n" +
        "                    div.parentNode.insertBefore(newDiv, div.nextSibling);" + "\n" +
        "                    div.style.display = 'none';" + "\n" +
        "                });" + "\n" +
        "            };" + "\n" +
        "" + "\n" +
        "            processShowdownDivs();" + "\n" +
        "        });" + "\n" +
        "    });" + "\n" +
        "</script>";

    if (modelName == "Siyuan_Cloze") {
        const result = await Anki_invoke('createModel', 6, {
            "modelName": "Siyuan_Cloze",
            "inOrderFields": ["Text", "Extra", "SiyuanLink"],
            "css": ".card {" + "\n" +
                "    font-family: arial;" + "\n" +
                "    font-size: 20px;" + "\n" +
                "    text-align: left;" + "\n" +
                "    color: black;" + "\n" +
                "    background-color: white;" + "\n" +
                "   }" + "\n" +
                "   " + "\n" +
                "   .cloze {" + "\n" +
                "    font-weight: bold;" + "\n" +
                "    color: blue;" + "\n" +
                "   }" + "\n" +
                "   .nightMode .cloze {" + "\n" +
                "    color: lightblue;" + "\n" +
                "   }",
            "isCloze": true,
            "cardTemplates": [
                {
                    "Front": '<div class="section">' + "\n" +
                        '<div class="Words md-content">' + "\n" +
                        '{{cloze:Text}}' + "\n" +
                        '</div>' + "\n" +
                        '</div>' + "\n" +
                        script,
                    "Back": '<div class="Words md-content">' + "\n" +
                        '{{cloze:Text}}' + "\n" +
                        '</div>' + "\n" +
                        '<hr>' + "\n" +
                        '{{Extra}}' + "\n" + script
                }
            ]
        });
        return result;
    } else if (modelName == "Siyuan_Basic") {
        const result = await Anki_invoke('createModel', 6, {
            "modelName": "Siyuan_Basic",
            "inOrderFields": ["Text", "Answer", "SiyuanLink"],
            "css": '.card {' + "\n" +
                'font-family: arial;' + "\n" +
                'font-size: 20px;' + "\n" +
                'text-align: center;' + "\n" +
                'color: black;' + "\n" +
                'background-color: white;' + "\n" +
                '}',
            "isCloze": false,
            "cardTemplates": [
                {
                    "Front": '<div class="section">' + "\n" +
                        '<div class="Words md-content">' + "\n" +
                        '{{Question}}' + "\n" +
                        '</div>' + "\n" +
                        '</div>' + "\n" +
                        script,
                    "Back": '{{Question}}' + "\n" +
                        '<hr id=answer>' + "\n" + script
                }
            ]
        });
        return result;
    }
    //callback(result);
}