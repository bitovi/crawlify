var assert = require("assert");
var Crawlify = require("../lib");

var cheerio = require("cheerio");

describe("Calling the constructor", function() {
	var crawl = new Crawlify({
		workers: 3												
	});

	it("Takes a number of workers that are immediately available", function() {
		assert.equal(crawl.pool.available.length, 3, "There should be 3 workers ready to be used");
	});

});

describe("Visiting a page", function(done) {
	var crawl, error, html;

	before(function(done) {
		crawl = new Crawlify();
		var page = "file://" + __dirname + "/page.html";

		crawl.visit(page, function(err, h) {
			error = err;
			html = h;
			done();
		});

	});

	it("Loads the correct content", function() {
		assert.equal(error, null);

		var $ = cheerio.load(html);
		var added = $("#app").html();

		assert.equal(added, "<strong>It worked!</strong>", "The element that was appended async is missing.");
	});

	it("Puts the worker back in the available queue after completing", function() {
		assert.equal(crawl.pool.available.length, 1, "There is not the correct amount of available workers");
	});
});

describe("Visiting multiple pages without reloading", function() {
	var crawl = new Crawlify;
	var errors = [];
	var htmls = [];

	before(function(done) {
		// Go to the initial page
		var page = "file://" + __dirname + "/page1.html";
		crawl.visit(page, function(err, html) {
			errors.push(err);
			htmls.push(html);

			// Now go to the second page
			crawl.visit("page2.html", function(err, html) {
				errors.push(err);
				htmls.push(html);
				done();
			});
		});
	});

	it("Changes content within the page", function() {
		// There should be no errors.
		assert.equal(errors[0], null, "The initial page load resulted in an error");
		assert.equal(errors[1], null, "The second page load resulted in an error");

		var $ = cheerio.load(htmls[0]);
		var added = $("#app").html();

		assert.equal(added, "<span>This is page 1</span>", "The initial page didn't render its content");

		$ = cheerio.load(htmls[1]);
		added = $("#app").html();

		assert.equal(added, "<span>This is page 2</span>", "The second page load didn't render its content");
	});
});
