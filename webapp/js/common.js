//日期格式化
function formatDate(time,format='YY-MM-DD hh:mm:ss'){
	var date = new Date(time);

	var year = date.getFullYear(),
		month = date.getMonth()+1,//月份是从0开始的
		day = date.getDate(),
		hour = date.getHours(),
		min = date.getMinutes(),
		sec = date.getSeconds();
	var preArr = Array.apply(null,Array(10)).map(function(elem, index) {
		return '0'+index;
	});//开个长度为10的数组 格式为 00 01 02 03

	var newTime = format.replace(/YY/g,year)
						.replace(/MM/g,preArr[month]||month)
						.replace(/DD/g,preArr[day]||day)
						.replace(/hh/g,preArr[hour]||hour)
						.replace(/mm/g,preArr[min]||min)
						.replace(/ss/g,preArr[sec]||sec);
	return newTime;			
}
// 追加到指定元素后面,newElement是要追加的元素 targetElement 是指定元素的位置 
function insertAfter( newElement, targetElement ){ 
	var text = document.createTextNode(newElement);
	var ele = document.createElement("li");//创建一个html标签
	ele.appendChild(text);//在标签内添加文字
	targetElement.appendChild(ele);//将标签添加到页面中
}; 