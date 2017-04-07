[![Build Status](https://travis-ci.org/bitovi/crawlify.svg?branch=master)](https://travis-ci.org/bitovi/crawlify)

# crawlify

Crawlify uses a pool of [PhantomJS](http://phantomjs.org/) browsers to create a static copy of your single-page application. Rather than waiting an arbitrary amount of time, crawlify includes a client-side component that you use within your own code. This makes crawling blazing fast.

# Installation

```shell
npm install crawlify
```

```shell
bower install crawlify
```

# Example

First include `crawlify.js` or `crawlify.min.js` in your webpage. This will place a `crawlify` object on `window` that you can call start and stop on.

```html
<script src="crawlify.min.js"></script>
```

## Client

```javascript
$.get("/api/todos", function(data) {
  // Render some content with data

  // Let crawlify know you're done
  crawlify.start();
});

// Let crawlify know there's something to wait for
crawlify.stop();
```

## Server

Here we're going to cache the page so that the server can reply instantly

```javascript
var Crawlify = require("crawlify");
var crawl = new Crawlify({
	workers: 4 // Defaults to 1,
	reset: '/'
});

var cache = {};

crawl.visit("/", function(error, html) {
    cache["/"] = html;
});

// At a later time, crawlify uses the same browser instance to apply pushState
// at the new target page.
crawl.visit("/todos", function(error, html) {
  cache["/todos"] = html;
});

```

# Development

1) Clone the repo
2) `npm install`
3) `bower install`
4) Make sure you have [mocha](https://mochajs.org/) installed
5) `npm test`
