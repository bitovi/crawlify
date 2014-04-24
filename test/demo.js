var Crawlify = require("../lib");

var crawl = new Crawlify();

var page = "file://" + __dirname + "/page1.html";
crawl.visit(page, function(err, html) {
	// Now go to the second page
	page = "page2.html";
	crawl.visit(page, function(err, html) {
		console.log("We visited page2", html);
		process.exit();
	});

});
