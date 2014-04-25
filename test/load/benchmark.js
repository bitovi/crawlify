var Crawlify = require("../../lib");
var numberOfWorkers = 4;
var crawl = new Crawlify({
	reset: "/load",
	workers: numberOfWorkers,
	maxWorkers: numberOfWorkers
});

var numberOfRuns = 100;

var baseUrl = "http://0.0.0.0:8777/";
var url = function(path) {
	return baseUrl + path;
}

function kickoff() {
	var remaining = numberOfWorkers;
	for(var i = 0; i < numberOfWorkers; i++) {
		crawl.visit(url("load"), function() {
			remaining--;
			if(!remaining) {
				benchmark();
			}
		});
	}
}

kickoff();

var wait = 0;
function benchmark() {
	var go = function(id) {
		setTimeout(function() {
			product(id);
		}, wait);
		wait += 200;
	};

	for(var i = 0; i < numberOfRuns; i++) {
		go(i);
	}
}

function product(id) {
	var st = new Date();
	crawl.visit(url("load/" + id), function(error, html) {
		//console.log(html);
		var stop = new Date();
		report(stop - st);
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

function fin() {
	var sum = times.reduce(function(a, b) { return a + b });
	var avg = sum / times.length;

	console.log("Average:", avg);
	/*crawl.pool.disconnect();
	process.exit();*/
}
