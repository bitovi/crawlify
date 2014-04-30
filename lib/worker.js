/**
 * Crawls a page
 */
module.exports = function(page, options, callback) {
	if(!page.isOpen) {
		page.set("onCallback", onCallback(page, callback));
		page.open(options.url, function(status){
			page.isOpen = true;
		});

		return;
	}

	page.set("onCallback", onCallback(page, callback));

	// Use pushState
	page.evaluate(function(url) {
		history.pushState(null, null, url);
	}, function() {}, options.url);
};

function onCallback(page, callback) {
	return function() {
		page.get("content", function(content) {
			callback(content);
		});
	};
}
