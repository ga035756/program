var express = require("express");
var cors = require("cors");
var app = express();

app.use( express.static("public")  );
app.use( express.json() );
app.use( express.urlencoded( {extended: true}) );
app.use(cors());

var fs = require("fs");
var dataFileName = "./userData.json";

app.listen(3000);
console.log("Web伺服器就緒，開始接受用戶端連線.");
console.log("「Ctrl + C」可結束伺服器程式.");

app.get("/test/check", function (req, res) {
	var data = fs.readFileSync(dataFileName);
	var loginConfig = JSON.parse(data);
    res.set('Content-type', 'application/json');
	res.send( JSON.stringify(loginConfig) );
})


app.get("/todo/list", function (req, res) {
	var data = fs.readFileSync(dataFileName);
	var todoList = JSON.parse(data);
    res.set('Content-type', 'application/json');
	res.send( JSON.stringify(todoList) );
})

app.get("/todo/item/:id", function (req, res) {
	var data = fs.readFileSync(dataFileName);
	var todoList = JSON.parse(data);

	var targetIndex = -1;
	for (let i = 0; i < todoList.length; i++) {
		if (todoList[i].todoTableId.toString() == req.params.id.toString()) {
			targetIndex = i;
			break;
		}
	}
    if ( targetIndex < 0 ) {
        res.send("not found");
        return;
    }

	res.set('Content-Type', 'application/json');
    res.send( JSON.stringify(todoList[targetIndex]) );
})

app.post("/todo/create", function (req, res) {
	var data = fs.readFileSync(dataFileName);
	var todoList = JSON.parse(data);
	var item = {
		"todoTableId": new Date().getTime(),
		"title": req.body.title,
		"isComplete": req.body.isComplete
	};
	todoList.push(item);
	fs.writeFileSync("./data.json", JSON.stringify(todoList, null, "\t"));
	res.send("row inserted.");
})

app.put("/todo/item", function (req, res) {
	var data = fs.readFileSync(dataFileName);
	var todoList = JSON.parse(data);
	for (let i = 0; i < todoList.length; i++) {
		if (todoList[i].todoTableId == req.body.todoTableId) {
			todoList[i].title = req.body.title;
			todoList[i].isComplete = req.body.isComplete;
			break;
		}
	}
	fs.writeFileSync("./data.json", JSON.stringify(todoList, null, "\t"));	
	res.send("row updated."); 
})

app.delete("/todo/delete/:id", function (req, res) {
	var data = fs.readFileSync(dataFileName);
	var todoList = JSON.parse(data);

	var deleteIndex = -1;
	for (let i = 0; i < todoList.length; i++) {
		if (todoList[i].todoTableId.toString() == req.params.id.toString()) {
			deleteIndex = i;
			break;
		}
	}
    if ( deleteIndex < 0 ) {
        res.send("not found");
        return;
    }

    todoList.splice(deleteIndex, 1);
    fs.writeFileSync("./data.json", JSON.stringify(todoList, null, "\t"));	
    res.send("row deleted.");
})
