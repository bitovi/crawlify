# crawlify

Crawlify uses a pool of ([zombie](http://zombie.labnotes.org/)) browsers to create a static copy of your single-page application. Rather than waiting an arbitrary amount of time, crawlify includes a client-side component that you use within your own code.

# Installation

```shell
npm install crawlify
```

```shell
bower install crawlify
```

# Example

First include `crawlify.js` in your webpage. This will place a `crawlify` object on `indow` that you can call start and stop on.

```html
<script src="crawlify.js"></script>
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
var crawl = new Crawlify();

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
