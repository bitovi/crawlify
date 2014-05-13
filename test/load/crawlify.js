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
			this.fin();
		}
	};

	/**
	 * @method when
	 * Takes a deferred object and stops until the deferred is resolved.
	 *
	 * @param {Deferred} deferred
	 */
	Crawlify.prototype.when = function(deferred) {
		// Stop and when for the deferred to complete being starting again.
		this.stop();

		var self = this;
		deferred.done(function() {
			self.start();
		});
	};

	/**
	 * @method load
	 * Load a given url
	 * @param {String} url The url to load
	 */
	Crawlify.prototype.load = function(url) {
		this.counter = 0;
		history.pushState(null, null, url);
	};

	/**
	 * @method fin
	 * Finish the crawl and do cleanup stuff
	 */
	Crawlify.prototype.fin = typeof window.callPhantom === "function"
		? function() {
			this.complete = true;
			window.callPhantom(this.counter);

			// Generate the reset page
			if(this.reset) {
				this.load(this.reset);
			}
		} : function(){};

	// Register Crawlify as a global
	var crawlify = new Crawlify();

	// If there is a global crawlify object, use it as the initial options.
	if(global.crawlify) {
		for(var p in global.crawlify) {
			crawlify[p] = global.crawlify[p];
		}
	}
	global.crawlify = crawlify;

})(this);
