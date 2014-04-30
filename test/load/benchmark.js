// Options

var numberOfWorkers = 8;
var numberOfRuns = 1000;
var requestsPerSecond = 78.6;

var baseUrl = "http://0.0.0.0:8777/";
function url(path) {
	return baseUrl + path;
}

var Crawlify = require("../../lib");
var crawl = new Crawlify({
	reset: url("/load"),
	workers: numberOfWorkers,
	benchmark: true
});


function kickoff() {
	var remaining = numberOfWorkers;
	for(var i = 0; i < numberOfWorkers; i++) {
		crawl.visit(url("load"), function(e, html) {
			remaining--;
			if(!remaining) {
				benchmark(numberOfRuns);
			}
		});
	}
}

kickoff();

var id = 0;
var wait = 1000 / requestsPerSecond;
function benchmark(remaining) {
	setTimeout(function() {
		product(id++);
		benchmark(remaining--);
	}, wait);
}

//var fs = require("fs");
function product(id) {
	crawl.visit(url("load/" + id), function(error, html, ms) {
		report(ms);
	});
}

var times = [];
function report(ms) {
	times.push(ms);
	console.log("Time: " + ms + " Working: " + crawl.pool.working.length +
							" Available: " + crawl.pool.available.length +
							" Queued: " + crawl.pool.queue.length);

	if(times.length === numberOfRuns) {
		fin();
	}
}

var startAll = new Date();
function fin() {
	var sum = times.reduce(function(a, b) { return a + b });
	var avg = sum / times.length;

  var stopAll = new Date();
	console.log("Average:", avg, "Total:", stopAll - startAll);
	crawl.pool.disconnect();
	process.exit();
}
