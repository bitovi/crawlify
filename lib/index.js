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
Crawlify.prototype.visit = function(url, callback) {
	var pool = this.pool;

	// Put this job into the queue
	pool.enqueue({
		benchmark: this.options.benchmark,
    url: url,
    reset: this.options.reset,
		wait: this.options.wait
  }, callback);
};

/**
 * @method evaluate
 *
 * @param {Function} fn Function to evaluate in the context of the page.
 * @param {Function} callback Called when the page has finished evaluating
 *
 */
Crawlify.prototype.evaluate = function(fn, callback) {
	// Put this in the queue
	this.pool.enqueue({
		fn: fn
	}, callback);
}
