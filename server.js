const http = require( 'http');
const url = require( "url");
const fs =require( "fs");
const querystring = require("querystring");

const hostname  = "127.0.0.1";

const port = 9000;




var server = http.createServer( function(request, response){
	console.log("create server");
});

server.on("request" , function(request , response){
	console.log("server on request");
	let parsedUrl = url.parse(request.url , true);
	
	console.log("url in request",request.url);
	console.log("pathname in url parse" , parsedUrl.pathname);
	console.log("search in url parse" , parsedUrl.query);
	console.log("request method" , request.method);

	let query;
	if(request.method=='GET'){
		query = parsedUrl.query;
	}else if(request.method=="POST"){
		query = getPostQuery(request);
	}

	if(parsedUrl.pathname=='/' ){//index page
		// fs.readFile('./style.html' ,function(err,data){
		fs.readFile('./vuel.html' ,function(err,data){
			if(err){
				response.writeHead(500,{"Content-Type":"text/plain"});
				response.end("error");
			}else{
				response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
				response.write(data);
				response.end();
			}
		});
	}
	else /*if( parsedUrl.pathname.startsWith("/js") )*/ {
		console.log(parsedUrl.pathname);
		fs.readFile('.'+parsedUrl.pathname ,function(err,data){
			if(err){
				response.writeHead(500,{"Content-Type":"text/plain"});
				response.end("error");
			}else{
				//response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
				response.write(data);
				response.end();
			}
		});
	}
	// else{
		

	// 	//route
	// 	if(parsedUrl.pathname == "/login"){
	// 		sendFile("./web_font/index.html" , response);
	// 	}else if(parsedUrl.pathname=='/questions'){
	// 		sendFile("./web_font/questions.html" , response);
	// 	}else if(parsedUrl.pathname == '/exams'){
	// 		sendFile("./web_font/tests.html" , response) ;
	// 	}else if(parsedUrl.pathname == '/addQuest'){
	// 		sendFile("./web_font/addQuestion.html" , response);
	// 	}else if(parsedUrl.pathname == '/addExam'){
	// 		sendFile("./web_font/addTest.html" , response);
	// 	}else if(parsedUrl.pathname == '/scores'){
	// 		sendFile("./web_font/scores.html"  ,response);
	// 	}else if(parsedUrl.pathname == "/updateExam"){
	// 		sendFile("./web_font/updateTest.html"  ,response);
	// 	}
	// 	//api
	// 	else if(parsedUrl.pathname == '/api/search/questList'){
	// 		/*
	// 		*check token...
	// 		*/

	// 		let num = parseInt(query.ps) ;
	// 		let start = num*( parseInt(query.pn) -1);
	// 		let resData = {
	// 			state : "success",
	// 			descript : "",
	// 			count : questList.length,
	// 			questions : questList.slice(start , start + num)
	// 		};
			
	// 		response.writeHead(200,{"Content-Type":"text/plain"});

	// 		response.end(JSON.stringify(resData));
	// 	}
	// 	else if(parsedUrl.pathname == '/api/search/examList'){
	// 		/*
	// 		*check token
	// 		*/
	// 		let num = parseInt(query.ps) ;
	// 		let start = num*( parseInt(query.pn) -1);
	// 		let resData = {
	// 			state : "success",
	// 			descript : "",
	// 			count : examList.length,
	// 			exams : examList.slice(start , start + num)
	// 		};
			
	// 		response.writeHead(200,{"Content-Type":"text/plain"});

	// 		response.end(JSON.stringify(resData));

	// 	}
	// 	else if(parsedUrl.pathname == '/api/insert/quest'){
	// 		console.log("query",query);
	// 		response.writeHead(200 , {"Content-Type":"text/plain"});
	// 		response.end("");
	// 	}
	// 	else if(parsedUrl.pathname == "/api/search/quest"){
	// 		response.writeHead(200 , {"Content-Type":"text/plain"});
	// 		response.end(JSON.stringify(q1));
	// 	}
	// 	else if(parsedUrl.pathname == "/api/insert/exam"){
	// 		console.log("query",query);
	// 		response.writeHead(200 , {"Content-Type":"text/plain"});
	// 		response.end("");
	// 	}
	// 	else if(parsedUrl.pathname == "/api/search/score"){
	// 		console.log("query",query);
	// 		response.writeHead(200 , {"Content-Type":"text/plain"});
	// 		response.end(JSON.stringify({
	// 			count:33,
	// 			id:13123,
	// 			examTitle:"摸仙煲方言专业八级考试",
	// 			upper:"游乐",
	// 			startTime : "2019-12-11T12:22",
	// 			duration : "23",
	// 			score :100,
	// 			students :[s1,s1,s1,s1,s1,s1]
	// 		}));
	// 	}
	// 	else if(parsedUrl.pathname == "/api/delete/quest"){
	// 		response.writeHead(200 , {"Content-Type":"text/plain"});
	// 		response.end("");
	// 	}
	// 	else if(parsedUrl.pathname == "/api/delete/exam"){
	// 		response.writeHead(200 , {"Content-Type":"text/plain"});
	// 		response.end("");
	// 	}
	// 	else if(parsedUrl.pathname =="/api/search/exam"){
	// 		response.writeHead(200 , {"Content-Type":"text/plain"});
	// 		response.end(JSON.stringify(t1));
	// 	}
	// 	else if(parsedUrl.pathname == "/api/update/exam"){
	// 		response.writeHead(200 , {"Content-Type":"text/plain"});
	// 		response.end("");
	// 	}

	// }
});

function sendFile(filepath , response){
	fs.readFile(filepath ,function(err,data){
			if(err){
				response.writeHead(500,{"Content-Type":"text/plain"});
				response.end("error");
			}else{
				response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
				response.write(data);
				response.end();
			}
		});
}
function getPostQuery(req){
	let post = '';
	// console.log("in getPostQuery");
	req.on('data' , chunk => {
		post += chunk;
	   // console.log("ondata",post);

	});
	//do not do something for state 'close'
	req.on('end' , ()=>{
		post = JSON.parse(post);
	console.log("onend",post);

		return post
	});
}
server.listen(port);

console.log("listening port ",port);