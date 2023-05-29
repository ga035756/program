var express = require("express");
var moment = require("moment")
var cors = require("cors");
var app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

var fs = require("fs");
var userDataFileName = "./userData.json";
var attendanceDataFileName = "./attendanceData.json"

app.listen(3000);
console.log("Web伺服器就緒，開始接受用戶端連線.");
console.log("「Ctrl + C」可結束伺服器程式.");

app.get("/check", function (req, res) {
	var data = fs.readFileSync(userDataFileName);
	var loginConfig = JSON.parse(data);
	res.set('Content-type', 'application/json');
	res.send(JSON.stringify(loginConfig));
	//登入方法
})
app.post("/checkIn", function (req, res) {
	let checkInTime = moment().startOf('day').set('hours', 9)//設置簽到時間
	let checkInTimeForUser = moment().format('YYYY-MM-DD HH:mm:ss')
	let checkInStatus = ""
	let checkInMessage = ""
	let lateTime = moment().diff(checkInTime, 'minutes')
	checkInTime.isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))
		? (checkInStatus = "遲到", checkInMessage = "你已遲到 " + lateTime + " 分鐘")
		: (checkInStatus = "正常")
	var data = fs.readFileSync(attendanceDataFileName);
	var checkInHistory = JSON.parse(data);
	var item = {
		"checkInTime": checkInTimeForUser,
		"checkOutTime": "",
		"userName": req.body.userName,
		"checkInStatus": `${checkInStatus}`
	};

	let doubleCheck = []
	checkInHistory.map((data) => {
		if (data.userName === req.body.userName)
			doubleCheck.push(moment(data.checkInTime).isBetween(moment().startOf('day'), moment().endOf('day')))
	})//檢查是否重複簽到
	let checkResult = doubleCheck.some(e => e === true)
	checkResult ? (checkInMessage = "今天簽到過了喔") : (checkInHistory.push(item))
	fs.writeFileSync("./attendanceData.json", JSON.stringify(checkInHistory, null, "\t"));
	res.send(checkInMessage);
})

app.put("/checkOut/:userName", function (req, res) {
	var data = fs.readFileSync(attendanceDataFileName);
	var checkOutHistoryData = JSON.parse(data);
	let checkOutMessage = ""
	let checkOutTime = moment().startOf('day').set('hours', 17)//設置簽退時間
	try {
		checkOutHistoryData.forEach(data => {
			if (data.userName === req.params.userName && moment(data.checkInTime).isBetween(moment().startOf('day'), moment().endOf('day'))) {
				if (data.checkOutTime === "") {
					data.checkOutTime = moment().format('YYYY-MM-DD HH:mm:ss')

					moment(data.checkOutHistoryData).isBefore(checkOutTime)
						? (data.checkOutStatus = "早退", checkOutMessage = "你今日早退囉")
						: (data.checkOutStatus = "正常", checkOutMessage = "已正常完成簽退")		
						throw "breakException"
				} else {
					checkOutMessage = "今日已簽退過了喔"
					throw "breakException"
				}
			} else {
				checkOutMessage = "今日尚未簽到"
			}
		})
	} catch (e) {
		if (e !== "breakException") throw e;
	}
	// console.log(checkOutMessage);
	res.send(checkOutMessage);
	fs.writeFileSync("./attendanceData.json", JSON.stringify(checkOutHistoryData, null, "\t"));
	// console.log(req.params.userName);
	// console.log(checkOutMessage);
})

//取得出勤紀錄by user
app.get("/getCheckInHistory/:userName", function (req, res) {
	let userName = req.params.userName
	var data = fs.readFileSync(attendanceDataFileName);
	var checkInHistoryData = JSON.parse(data);
	let checkInHistoryDataByUser = [];
	checkInHistoryData.map((data) => {
		data.userName === userName && checkInHistoryDataByUser.push(data)
	})
	res.set('Content-type', 'application/json');
	userName != "root"
		? (res.send(JSON.stringify(checkInHistoryDataByUser)))
		: (res.send(JSON.stringify(checkInHistoryData)))
})