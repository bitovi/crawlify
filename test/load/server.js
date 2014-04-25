var express = require("express");
var app = express();
var fs = require("fs");

app.use(express.static(__dirname + "/.."));

var mainhtml = fs.readFileSync(__dirname + "/main.html", "utf8");
app.get("/load", function(req, res) {
	res.set("Content-Type", "text/html");
	res.send(mainhtml);
});

app.get("/load/:id", function(req, res) {
	res.set("Content-Type", "text/html");
	res.send(mainhtml);
});

app.get("/api/products", function(req, res) {
	var prods = [];
	for(var i = 0; i < 50; i++) {
		prods.push({
			name: "Product " + i,
			price: Math.random() * 100
		});
	}
	res.send(prods);
});

app.listen(8777, function() {
	require("./benchmark");				
});
