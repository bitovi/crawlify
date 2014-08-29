var phantom = require("phantom");
var process = require("./worker");
var Promise = require("es6-promise").Promise;

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
WorkerPool.prototype.enqueue = function(options) {
	var maxWorkers = this.options.workers;

	// If there are available workers.
	if(this.workersAvailable()) {
		return this.doWork(options);
	}

	// Otherwise, add this to the queue and for the next free worker
	var pool = this;
	return new Promise(function(resolve, reject) {
		pool.queue.push({
			options: options,
			resolve: resolve,
			reject: reject
		});
	});
};

WorkerPool.prototype.workersAvailable = function() {
	// The maximum number of workers we can have
	var maxWorkers = this.options.workers;

	// If there are no max workers, or we haven't reached the max yet.
	return !maxWorkers || maxWorkers > this.working.length;
};

/**
 * @method get
 * Get a worker from the pool
 *
 * @return {Promise}
 */
WorkerPool.prototype.get = function() {
	var self = this;

	// If there are available workers.
	if(this.available.length) {
		var worker = this.available.shift();
		this.working.push(worker);
		return Promise.resolve(worker);
	} else {
		return this.newWorker().then(function(worker) {
			self.working.push(worker);
			return worker;
		});
	}
};

/**
 * @method newWorker
 * Create a new worker that listens for when it's work has been complete
 *
 * @return {Promise{Worker}} a Node Cluster worker
 */
WorkerPool.prototype.newWorker = function() {
	// Create a phantom worker
	this.totalWorkers++;

	var self = this;
	return new Promise(function(resolve) {
		phantom.create(function(ph) {
			ph.createPage(function(page) {
				page.phantomHost = ph;

				page.evaluate(function(options) {
					window.crawlify = options;
					return window.crawlify;
				}, function(w) {
					self.planForRetirement(page);
					resolve(page);
				}, {
					reset: self.options.reset,
					isCrawling: true
				});
			});
		});
	});
};

/**
 * @method doWork
 * Do the work of a single worker
 *
 * @param {Object} options
 * @return {Promise}
 */
WorkerPool.prototype.doWork = function(options) {
	var self = this;

	if(options.benchmark) {
		var start = new Date();
	}

	return this.get().then(function(page) {
		var promise = new Promise(function(resolve, reject) {
			if(options.fn) {
				// Evaluate in the context of the page
				page.evaluate(options.fn, function(result) {
					self.rotate(page);
					resolve(result);
				});
				return;
			}

			// Otherwise, we are processing as normal
			process(page, options, function(error, html) {
				self.rotate(page);

				// If benchmarking, get the time it took to complete
				if(options.benchmark) {
					return {
						content: html,
						time: new Date() - start
					}
				}
				if(error) {
					return reject(error);
				}
				resolve(html);
			});
		});

		page.currentWork = promise;

		return promise;
	});
};

/**
 * @method rotate
 *
 * Clock out a worker of its work and put it back into the available pool
 * @param {Worker} worker
 */
WorkerPool.prototype.rotate = function(worker) {
	// Clock the worker out
	var working = this.working;
	working.splice(working.indexOf(worker), 1);

	// Place into the queue
	this.available.push(worker);

	// Take the next worker from the queue and allow it to do its thing
	if(this.queue.length && this.options.workers > this.working.length
		&& this.available.length) {
		var job = this.queue.shift();
		this.doWork(job.options).then(job.resolve, job.reject);
	}
};

/**
 * @method retire
 * Retire a worker of its work and put a new worker up for duty
 *
 * @param {Worker} worker
 */
WorkerPool.prototype.retire = function(worker) {
	var pool = this;
	var retire = function(val) {
		// Exit the phantom process
		var phantom = worker.phantomHost;
		phantom.exit();
		
		var available = pool.available;
		available.splice(available.indexOf(worker), 1);
		return val;
	};

	// If the worker is current working, wait until the promise has been fulfilled.
	if(worker.currentWork) {
		worker.currentWork = worker.currentWork.then(retire);
		return worker.currentWork;
	}

	return new Promise(retire);
};

/**
 * @method cycle
 * Retire a worker from the pool and then bring in a new worker to fill its spot.
 */
WorkerPool.prototype.cycle = function(worker) {
	var pool = this;
	return this.retire(worker).then(function() {
		return pool.newWorker();
	}).then(function(newWorker) {
		pool.available.push(newWorker);
		return page;
	});
};

/**
 * @method disconnect
 * Disconnect all workers in the cluster and reset to 0
 */
WorkerPool.prototype.disconnect = function() {
	this.available = [];
	this.working = [];
};

WorkerPool.prototype.planForRetirement = function(worker) {
	var expiration = this.options.expiration;
	if(expiration) {
		var pool = this;
		setTimeout(function() {
			pool.cycle(worker);
		}, expiration);
	}
};
