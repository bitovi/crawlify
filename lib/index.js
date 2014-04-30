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

	this.pool = new WorkerPool({
		workers: this.options.workers || 1,
		reset: this.options.reset
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
    reset: this.options.reset
  }, callback);
};
