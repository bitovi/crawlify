var WorkerPool = require('./pool');

module.exports = Crawlify;

/**
 * @constructor Crawlify
 *
 * The main entry point for users of crawlify
 */
function Crawlify(options) {
	this.options = options || {};
  var workers = this.options.workers || 1;

	this.options.wait = this.options.wait || 10000 // A maximum amount of time to wait for the page to complete it's operation

	this.pool = new WorkerPool({
		workers: this.options.workers || 1,
	});
}

/**
 * @method visit
 * 
 * @param {String} url The url to visit
 * @param {Function} callback A function to callback when complete
 */
Crawlify.prototype.visit = function(url) {
	var pool = this.pool;

	// Put this job into the queue
	return pool.enqueue({
		benchmark: this.options.benchmark,
    url: url,
    reset: this.options.reset,
		wait: this.options.wait
  });
};

/**
 * @method evaluate
 *
 * @param {Function} fn Function to evaluate in the context of the page.
 * @return {Promise}
 */
Crawlify.prototype.evaluate = function(fn) {
	// Put this in the queue
	return this.pool.enqueue({
		fn: fn
	});
}
