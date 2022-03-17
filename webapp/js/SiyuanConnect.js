"use strict";
//此文件存放与Siyuan通信相关的代码

function Siyuan_invoke(address, params) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', 'http://127.0.0.1:6806' + address);
		if (params != "" && params != undefined) {
			//发送json
			//console.log(JSON.stringify(params));
			xhr.send(JSON.stringify(params));
		} else {
			xhr.send();
		}
		//监听响应结果（因为请求是异步的）
		//xhr.onreadystatechange = (e) => {
		//    console.log(xhr.responseText)
		//}

		xhr.addEventListener('load', () => {
			try {
				const response = JSON.parse(xhr.responseText);
				resolve(response.data);
			} catch (e) {
				reject(e);
			}
		});
	});

}

//列出笔记本
async function Siyuan_lsNotebooks() {
	const data = await Siyuan_invoke('/api/notebook/lsNotebooks', '');
	//callback(data.notebooks);
	return data.notebooks;
}
//sql查询
async function Siyuan_sql(stmt) {
	const data = await Siyuan_invoke('/api/query/sql', {
		"stmt": stmt
	});
	//callback(data);
	return data;
}
