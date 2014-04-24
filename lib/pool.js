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
function WorkerPool() {
	this.available = [];
	this.working = [];
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
		// Spawn a new worker
		worker = cluster.fork();

		// Listener for when the worker is complete and put it back into the 
		// poor of available
		worker.on("message", function(msg) {
			if(msg.complete) {
				this.retire(worker);
			}
		}.bind(this));
	}

	this.working.push(worker);
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
