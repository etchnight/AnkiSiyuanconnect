"use strict";
//此文件存放与后台通信相关的代码
const port="3300";
function Server_invoke(address, data) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:'+port + address);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify(data));//params可以为空
        //console.log(params);
        //监听响应结果（因为请求是异步的）
        //xhr.onreadystatechange = (e) => {
        //    console.log(xhr.responseText)
        //}
        xhr.addEventListener('load', () => {
            try {
                const response = xhr.responseText;
                resolve(response);
            } catch (e) {
                reject(e);
            }
        });
    });

}

//获取文件(文本值)
async function Server_getfile(filename) {
    filename = "/getfile/" + filename;
    const data = await Server_invoke(filename, '');
    //callback(data);
    return data;
}
