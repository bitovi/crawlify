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

		page.get("content", function(content) {
			if(options.reset) {
				setHistory(page, options.reset);
			}

			callback(null, content);
		});
	};

	if(!page.isOpen) {
		page.set("onCallback", complete);
		page.open(options.url, function(status){
			page.isOpen = true;
		});

		return;
	}

	// The page has already been opened once so use pushState
	page.set("onCallback", complete);
  setHistory(page, config.url);
};

function setHistory(page, url, callback) {
  callback = callback || noop;

	// Use pushState
	page.evaluate(function(url) {
		history.pushState(null, null, url);
	}, callback, options.url);
}

function noop(){}
