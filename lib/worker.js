var Browser = require("zombie");
var cluster = require("cluster");

// Listen for messages from the parent WorkerPool and then process messages
// that are instructions to load a url.
process.on("message", function(msg) {
	if(msg.cmd === "url") {
		visit(msg.url, function(ms) {
			// Alert the parent of the results
			reportResults(ms);

			// If we don't need to reset the page
			if(!msg.reset) {
				return;
			}

			// Visit the reset page
			visit(msg.reset, function() {
				process.send({
					reset: true
				});
			});
		}, !!msg.benchmark);
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
function visit(url, callback, benchmark) {
	if(!inited) {
		browser.visit(url, function(err) {
			var window = browser.window;
			window.console.log = console.log;
			window.console.warn = console.warn;

			if(benchmark) {
				var start = new Date();
			}

			// Return when crawlify's `complete` is set to true.
			browser.wait(crawlComplete, function() {
				inited = true;
				if(benchmark) {
					return callback(new Date() - start);
				}
				callback();
			});
		});

		// Set initial options that will be used by the client-side crawlify
		browser.window.crawlify = {
			isCrawling: true
		};
	} else {
		// Use push state to change the url
		var history = browser.window.history;
		history.pushState(null, null, url);

		if(benchmark) {
			var start = new Date();
		}
		browser.wait(crawlComplete, function() {
			if(benchmark) {
				return callback(new Date() - start);
			}
			callback();
		});
	}
}

// This is used to tell zombie when a page is completely loaded, when crawlify's 
// `complete` flag is set to true.
function crawlComplete() {
	return browser.window.crawlify.complete;
}

/**
 * @param {Number} ms The number of milliseconds it took to complete
 */
function reportResults(ms) {
	// Let the worker pool know we're done and send the result
	var html = browser.window.document.innerHTML;
	process.send({
		complete: true,
		ms: ms,
		result: html
	});
}
