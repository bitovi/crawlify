/**
 * Crawls a page
 */
module.exports = function(page, options, callback) {
	// Test to see if we are attempting to visit the page we are currently on
	if(page.url === options.url) {
		page.get("content", function(content){
			callback(null, content);
		});
		return;
	}

	// Set a timeout to quit if the page takes too long to load.
	var timeout = setTimeout(function() {
		page.set("onCallback", noop);
		callback(new Error("Timeout of " + options.wait + " exceeded."));
	}, options.wait);

	// Called when everything should be complete
	var complete = function() {
		clearTimeout(timeout);

		// Ensure that the callback is only called once
		var cb = callback;
		callback = noop;

		page.get("content", function(content) {
			cb(null, content);
		});
		page.set("onCallback", noop);
	};

	if(!page.isOpen) {
		page.set("onCallback", complete);
		page.open(options.url, function(status){
			page.evaluate(function(options) {
				if(!window.crawlify) {
					window.crawlify = options;
					return;
				}

				for(var p in options) {
					window.crawlify[p] = options[p];
				}
			}, noop, {
				reset: options.reset
			});

			page.url = options.url;
			page.isOpen = true;
		});
		return;
	}

	page.set("onCallback", complete);
	setHistory(page, options.url);
};

function setHistory(page, url, callback) {
  callback = callback || noop;

	// Use pushState to load the url
	page.evaluate(function(url) {
		crawlify.load(url);
	}, function(){
		page.url = url;
		callback();	
	}, url);
}

function noop(){}
