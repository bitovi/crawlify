var phantom = require("phantom");
var process = require("./worker");

module.exports = WorkerPool;

/**
 * @constructor WorkerPool
 *
 * This represents a pool or workers in a cluster. Handles keeping the workers
 * around so that they can be reused on subsequent requests.
 */
function WorkerPool(options) {
	this.options = options || {};
	this.available = [];
	this.working = [];
	this.queue = [];
	this.totalWorkers = 0;
}

/**
 * @method enqueue
 * Queue a function to receive a worker when they become available
 *
 * @param {Options} options
 */
WorkerPool.prototype.enqueue = function(options, callback) {
	var maxWorkers = this.options.workers;

	// If there are no max workers, or we haven't reached the max yet.
	if(!maxWorkers || maxWorkers > this.working.length) {
		this.doWork(options, callback);
		return;
	}

	// Otherwise, add this to the queue and for the next free worker
	this.queue.push({
		options: options,
		callback: callback
	});
};

/**
 * @method get
 * Get a worker from the pool
 */
WorkerPool.prototype.get = function(callback) {
	var self = this;

	// If there are available workers.
	if(this.available.length) {
		var page = this.available.shift();
		this.working.push(page);
		return callback(page);
	} else {
		this.newWorker(function(page) {
			self.working.push(page);
			callback(page);
		});
	}
};

/**
 * @method newWorker
 * Create a new worker that listens for when it's work has been complete
 *
 * @return {Worker} a Node Cluster worker
 */
WorkerPool.prototype.newWorker = function(callback) {
	// Create a phantom worker
	this.totalWorkers++;

	var self = this;
	phantom.create(function(ph) {
		ph.createPage(function(page) {
			page.evaluate(function(options) {
				window.crawlify = options;
				return window.crawlify;
			}, function(w) {
				callback(page);
			}, {
				reset: self.options.reset,
				isCrawling: true
			});
		});
	});
};

/**
 * @method doWork
 * Do the work of a single worker
 *
 * @param {Object} options
 * @param {Function} callback
 */
WorkerPool.prototype.doWork = function(options, callback) {
	var self = this;

	if(options.benchmark) {
		var start = new Date();
	}

	this.get(function(page) {
		// Evaluate in the context of the page
		if(options.fn) {
			page.evaluate(options.fn, function() {
				self.retire(page);
				callback.apply(this, arguments);
			});
			return;
		}

		// Otherwise, we are processing as normal
		process(page, options, function(results) {
			self.retire(page);

			// If benchmarking, get the time it took to complete
			if(options.benchmark) {
				return callback(null, results, new Date() - start);
			}

			callback(null, results);
		});
	});
};

/**
 * @method retire
 * Retire a worker of its work and put it back into the available pool
 *
 * @param {Worker} worker
 */
WorkerPool.prototype.retire = function(worker) {
	var working = this.working;
	working.splice(working.indexOf(worker), 1);

	this.available.push(worker);

	// Take the next worker from the queue and allow it to do its thing
	if(this.queue.length && this.options.workers > this.working.length
		&& this.available.length) {
		var job = this.queue.shift();
		this.doWork(job.options, job.callback);
	}
};

/**
 * @method disconnect
 * Disconnect all workers in the cluster and reset to 0
 */
WorkerPool.prototype.disconnect = function() {
	this.available = [];
	this.working = [];

	// TODO clean up existing phantom processes
};
