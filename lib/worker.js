var Browser = require("zombie");
var cluster = require("cluster");

// Listen for messages from the parent WorkerPool and then process messages
// that are instructions to load a url.
process.on("message", function(msg) {
	if(msg.cmd === "url") {
		visit(msg.url);
	}
});

// Instance of a zombie Browser
var browser = new Browser({
	loadCSS: false												 
});

// Tells us whether the browser has done an initial load or not
var inited = false;

// Visits urls. The first time this is called it will open the page as though
// it were new. All subsequent visits will operate on `pushState` to change
// the url.
function visit(url) {
	if(!inited) {
		browser.visit(url, function(err) {
			var window = browser.window;
			window.console.log = console.log;
			window.console.warn = console.warn;

			// Return when crawlify's `complete` is set to true.
			browser.wait(crawlComplete, function() {
				inited = true;
				reportResults();
			});
		});
	} else {
		// Use push state to change the url
		var history = browser.window.history;
		history.pushState(null, null, url);
		browser.wait(crawlComplete, reportResults);
	}
}

// This is used to tell zombie when a page is completely loaded, when crawlify's 
// `complete` flag is set to true.
function crawlComplete() {
	return browser.window.crawlify.complete;
}

// Complete this visit by reporting back to the parent WorkerPool
function reportResults() {
	// Let the worker pool know we're done and send the result
	var html = browser.window.document.innerHTML;
	process.send({
		complete: true,
		result: html						
	});
}
