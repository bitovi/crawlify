(function(global) {

	/**
	 * @constructor Crawlify
	 */
	function Crawlify() {
		this.counter = 0;
		this.complete = true;
	}

	/**
	 * @method stop
	 * Prevents server-side crawlify from counting this page as complete.
	 *
	 * @param {Number} count The number to add to the counter
	 */
	Crawlify.prototype.stop = function(count) {
		this.counter += count || 1;
		this.complete = false;
	};

	/**
	 * @method start
	 *
	 * Decrement the counter and mark as complete if the counter is at 0
	 */
	Crawlify.prototype.start = function() {
		if(this.counter > 0) {
			this.counter--;
		}

		if(this.counter === 0) {
			this.complete = true;
		}
	};

	// Register Crawlify as a global
	var crawlify = global.crawlify = new Crawlify();
	crawlify.Crawlify = Crawlify;

})(this);
