var cluster = require("cluster");

cluster.setupMaster({
	exec: __dirname + '/worker.js'
});

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

	for(var i = 0, len = this.options.workers; i < len; i++) {
		this.available.push(this.newWorker());
	}
}

/**
 * @method enqueue
 * Queue a function to receive a worker when they become available
 *
 * @param {Function} fn
 */
WorkerPool.prototype.enqueue = function(fn) {
	var maxWorkers = this.options.maxWorkers;

	// If there are no max workers, or we haven't reached the max yet.
	if(!maxWorkers || maxWorkers > this.working.length) {
		return fn(this.get());
	}

	// Otherwise, add this to the queue and for the next free worker
	this.queue.push(fn);
};

/**
 * @method get
 * Get a worker from the pool
 *
 * @return {Worker}
 */
WorkerPool.prototype.get = function() {
	var worker;

	// If there are available workers.
	if(this.available.length) {
		worker = this.available.shift();
	} else {
		worker = this.newWorker();
	}

	this.working.push(worker);
	return worker;
};

/**
 * @method newWorker
 * Create a new worker that listens for when it's work has been complete
 *
 * @return {Worker} a Node Cluster worker
 */
WorkerPool.prototype.newWorker = function() {
	// Spawn a new worker
	var worker = cluster.fork();

	// Listener for when the worker is complete and put it back into the 
	// poor of available
	var self = this;
	var reset = this.options.reset;
	worker.on("message", function(msg) {
		if(msg.complete && !reset) {
			self.retire(worker);
		} else if(msg.reset) {
			self.retire(worker);
		}
	});

	return worker;
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
	if(this.queue.length && this.options.maxWorkers > this.working.length) {
		var fn = this.queue.shift();
		fn(this.get());
	}
};

/**
 * @method disconnect
 * Disconnect all workers in the cluster and reset to 0
 */
WorkerPool.prototype.disconnect = function() {
	this.available = [];
	this.working = [];
	cluster.disconnect();
};
