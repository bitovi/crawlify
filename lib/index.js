var WorkerPool = require('./pool');

module.exports = Crawlify;

/**
 * @constructor Crawlify
 *
 * The main entry point for users of crawlify
 */
function Crawlify(options) {
	this.options = options || {};
	this.pool = new WorkerPool({
		workers: this.options.workers || 1,
		maxWorkers: this.options.workers,
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
	var self = this;
	
	// Queue up a function to run when the next available worker
  // is released.
	pool.enqueue(function(worker) {
		// Tell the worker what to do
		worker.send({
			cmd: "url",
			url: url,
			reset: self.options.reset
		});

		worker.once("message", function(msg) {
			// If we have a result (the html)
			if(msg.result) {
				callback(null, msg.result);
			} else if(msg.error) {
				callback(msg.error);
			}
		});
	});
};
