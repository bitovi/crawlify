var WorkerPool = require('./pool');

module.exports = Crawlify;

/**
 * @constructor Crawlify
 *
 * The main entry point for users of crawlify
 */
function Crawlify(options) {
	this.options = options || {};
	this.pool = new WorkerPool();
}

/**
 * @method visit
 * 
 * @param {String} url The url to visit
 * @param {Function} callback A function to callback when complete
 */
Crawlify.prototype.visit = function(url, callback) {
	// Get a worker from the pool
	var worker = this.pool.get();

	// Tell the worker what to do
	worker.send({
		cmd: "url",
		url: url
	});
	
	worker.once("message", function (msg) {
		// If we have a result (the html)
		if(msg.result) {
			callback(null, msg.result);
		} else if(msg.error) {
			callback(msg.error);
		}
	});

};
