/**
 * Crawls a page
 */
module.exports = function(page, options, callback) {
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
	}, callback, url);
}

function noop(){}
