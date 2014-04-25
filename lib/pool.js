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

	for(var i = 0, len = this.options.workers; i < len; i++) {
		this.available.push(this.newWorker());
	}
}

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
	worker.on("message", function(msg) {
		if(msg.complete) {
			this.retire(worker);
		}
	}.bind(this));

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
};
