steal.config({
	map: {
		"*": {
			"jquery/jquery.js" : "jquery",
			"can/util/util.js": "can/util/jquery/jquery.js"
		}
	},
	paths: {
		"jquery": "../bower_components/jquery/jquery.js",
    "can": "../bower_components/canjs/steal/canjs/can.js",
    "can/": "../bower_components/canjs/steal/canjs/"
	},
	shim : {
		jquery: {
			exports: "jQuery"
		}
	},
	ext: {
		js: "js",
		css: "css",
		less: "steal/less/less.js",
		coffee: "steal/coffee/coffee.js",
		ejs: "can/view/ejs/ejs.js",
		mustache: "can/view/mustache/mustache.js"
	}
})
