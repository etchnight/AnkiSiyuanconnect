"use strict";
//此文件存放与Siyuan通信相关的代码
//借助后台进行转发
/*
发送值:
{
	"address":SiyuanRootAddress+子端点, 
	"params":{}参数,是一个json
}
*/
/*返回值:
{
  "code": 0,
  "msg": "",
  "data": {}
}
*/
const SiyuanRootAddress = "http://127.0.0.1:6806";


//列出笔记本

async function Siyuan_lsNotebooks() {
	const response = await Server_invoke('/invoke', {
		"address": SiyuanRootAddress + "/api/notebook/lsNotebooks",
		"params": ''
	});
	//callback(data.notebooks);
	let data = JSON.parse(response);
	data=data.data;
	return data.notebooks;
}
//sql查询
async function Siyuan_sql(stmt) {
	const response = await Server_invoke('/invoke', {
		"address": SiyuanRootAddress + '/api/query/sql',
		"params": {
			"stmt": stmt
		}
	});
	//callback(data);
	let data = JSON.parse(response);
	data=data.data;
	return data;
}

//以下是原始前端代码
/*
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
*/