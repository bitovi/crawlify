/**
 * Crawls a page
 */
module.exports = function(page, options, callback) {
	if(!page.isOpen) {
		page.set("onCallback", onCallback(page, options, callback));
		page.open(options.url, function(status){
			page.isOpen = true;
		});

		return;
	}

	page.set("onCallback", onCallback(page, options, callback));

  setHistory(page, config.url);
};

// A callback that gets the content and then resets the page.
function onCallback(page, options, callback) {
	return function() {
		page.get("content", function(content) {
			// Go back to the reset page if provided.
			if(options.reset) {
				setHistory(page, options.reset);
			}

			callback(content);
		});
	};
}

function setHistory(page, url, callback) {
  callback = callback || function(){};

	// Use pushState
	page.evaluate(function(url) {
		history.pushState(null, null, url);
	}, callback, options.url);
}
