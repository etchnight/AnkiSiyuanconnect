async function statis_Siyuan() {
	var notes = await Siyuan_sql('SELECT * FROM spans WHERE type="tag" AND content="笔记"', () => { });
	//console.log(notes.length);
	//去除所有标签后没有内容的块,说明其父块的子块全部是笔记
	//如超级快第一行为:#笔记##Anki#,说明该超级快所有子块均是笔记
	//统计的是其父块的长度,单行笔记是其本身的长度
	var notesLength = 0;
	for (i = 0; i < notes.length; i++) {
		var id = notes[i].block_id;
		var note = await Siyuan_sql('SELECT * FROM blocks WHERE id="' + id + '"', () => { });
		var notecontent = note[0].markdown.replace(/#.*?#/g, "");//去除所有标签
		notecontent=notecontent.replace(" ","");
		if (notecontent == "") {
			var parent_id = note[0].parent_id;
			var parentNote = await Siyuan_sql('SELECT * FROM blocks WHERE id="' + parent_id + '"', () => { });
			if (parentNote[0].type == "d") { //文档块的长度为0
				//parent_id = note[0].root_id;
				var childNotes = await Siyuan_sql('SELECT * FROM blocks WHERE root_id="' + parent_id + '"', () => { });
				for (j = 0; j < childNotes.length; j++) {
					notesLength = notesLength + childNotes[j].length;
				}
			} else if(parentNote[0].type == "i"){//列表项块还要继续查找其父项
				parent_id = parentNote[0].parent_id;
				parentNote = await Siyuan_sql('SELECT * FROM blocks WHERE id="' + parent_id + '"', () => { });
				notesLength = notesLength + parentNote[0].length;
			}
			else {
				notesLength = notesLength + parentNote[0].length;
			}

		} else {
			notesLength = notesLength + note[0].length;
		}
	}
	//这些与创建网页有关
    var result_header = document.getElementById("result");
	insertAfter("所有笔记数量为"+notesLength,result_header);
}
