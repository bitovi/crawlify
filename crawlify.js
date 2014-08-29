
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root.crawlify = factory();
    }
}(this, function() {
	var isCrawling = typeof window.callPhantom === "function";

	var crawlify = {
		counter: 0,
		complete: true,
		isCrawling: isCrawling,

		/**
		 * @method stop
		 * Prevents server-side crawlify from counting this page as complete.
		 *
		 * @param {Number} count The number to add to the counter
		 */
		stop: function(count) {
			this.counter += count || 1;
			this.complete = false;
		},

		/**
		 * @method start
		 *
		 * Decrement the counter and mark as complete if the counter is at 0
		 */
		start: function() {
			if(this.counter > 0) {
				this.counter--;
			}

			if(this.counter === 0) {
				this.fin();
			}
		},

		/**
		 * @method when
		 * Takes a deferred object and stops until the deferred is resolved.
		 *
		 * @param {Deferred} deferred
		 */
		when: function(deferred) {
			// Stop and when for the deferred to complete being starting again.
			this.stop();

			var self = this;
			deferred.done(function() {
				self.start();
			});
		},

		/**
		 * @method load
		 * Load a given url
		 * @param {String} url The url to load
		 */
		load: function(url) {
			this.counter = 0;
			history.pushState(null, null, url);
		},

		/**
		 * @method fin
		 * Finish the crawl and do cleanup stuff
		 */
		fin: (isCrawling
			? function() {
				this.complete = true;
				window.callPhantom(this.counter);

				// Generate the reset page
				if(this.reset) {
					this.load(this.reset);
				}
			} : function(){})
	};

	// If there is a global crawlify object, use it as the initial options.
	if(window.crawlify) {
		for(var p in window.crawlify) {
			crawlify[p] = window.crawlify[p];
		}
	}
	window.crawlify = crawlify;

	// Overload xhr
	var oldXhr = window.XMLHttpRequest;
	window.XMLHttpRequest = function() {
		var xhr = new oldXhr();
		xhr.addEventListener("load", function onload() {
			xhr.removeEventListener("load", onload);
			crawlify.start();
		});

		var oldSend = xhr.send;
		xhr.send = function() {
			crawlify.stop();
			return oldSend.apply(this, arguments);
		};

		return xhr;
	};

	// Overload setTimeout
	var oldSetTimeout = window.setTimeout;
	window.setTimeout = function(fn, ms) {
		crawlify.stop();
		return oldSetTimeout(function() {
			fn.apply(this, arguments);
			crawlify.start();
		}, ms);
	};

	return crawlify;
}));

